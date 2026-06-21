const Job = require('../models/Job');
const User = require('../models/User');
const escapeStringRegexp = require('escape-string-regexp');

exports.getStats = async (req, res) => {
  const [jobCount, employerCount] = await Promise.all([
    Job.countDocuments({ status: 'active' }),
    User.countDocuments({ role: 'employer' }),
  ]);
  res.json({ jobCount, employerCount });
};

exports.createJob = async (req, res) => {
  const { title, description, location, type, skills, salaryMin, salaryMax } = req.body;

  if (!title || !description || !location || !type) {
    return res.status(400).json({ message: 'title, description, location, and type are required' });
  }

  if (salaryMin !== undefined && (isNaN(salaryMin) || salaryMin < 0)) {
    return res.status(400).json({ message: 'salaryMin must be a non-negative number' });
  }
  if (salaryMax !== undefined && (isNaN(salaryMax) || salaryMax < 0)) {
    return res.status(400).json({ message: 'salaryMax must be a non-negative number' });
  }

  const job = await Job.create({
    employer: req.user._id,
    title,
    description,
    location,
    type,
    skills,
    salaryMin,
    salaryMax,
  });

  res.status(201).json({ job });
};

exports.getJobs = async (req, res) => {
  const { q, location, type, skills, salaryMin, salaryMax, sort = 'newest', page = 1, limit = 20 } = req.query;
  const filter = { status: 'active' };

  if (q) filter.$text = { $search: q };
  if (location) filter.location = { $regex: escapeStringRegexp(location), $options: 'i' };
  if (type) filter.type = type;
  if (skills) {
    const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (skillList.length) filter.skills = { $all: skillList };
  }
  if (salaryMin) filter.salaryMax = { $gte: Number(salaryMin) };
  if (salaryMax) filter.salaryMin = { ...filter.salaryMin, $lte: Number(salaryMax) };

  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * pageSize;

  let sortOrder;
  if (q) sortOrder = { score: { $meta: 'textScore' } };
  else if (sort === 'oldest') sortOrder = { createdAt: 1 };
  else if (sort === 'salary') sortOrder = { salaryMax: -1 };
  else sortOrder = { createdAt: -1 };

  const projection = q ? { score: { $meta: 'textScore' } } : {};

  const [jobs, total] = await Promise.all([
    Job.find(filter, projection)
      .sort(sortOrder)
      .skip(skip)
      .limit(pageSize)
      .populate('employer', 'name companyName location'),
    Job.countDocuments(filter),
  ]);

  res.json({ jobs, total, page: pageNum, pages: Math.ceil(total / pageSize) });
};

exports.getJob = async (req, res) => {
  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('employer', 'name companyName website location');
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json({ job });
};

exports.getRelatedJobs = async (req, res) => {
  const job = await Job.findById(req.params.id).select('skills employer');
  if (!job) return res.status(404).json({ message: 'Job not found' });

  const orConditions = [];
  if (job.skills?.length) orConditions.push({ skills: { $in: job.skills } });
  orConditions.push({ employer: job.employer });

  const candidates = await Job.find({
    _id: { $ne: job._id },
    status: 'active',
    $or: orConditions,
  })
    .limit(20)
    .populate('employer', 'name companyName location');

  const jobSkills = new Set((job.skills || []).map((s) => s.toLowerCase()));
  const scored = candidates
    .map((j) => {
      const overlap = (j.skills || []).filter((s) => jobSkills.has(s.toLowerCase())).length;
      const sameEmployer = String(j.employer?._id) === String(job.employer) ? 1 : 0;
      return { job: j, score: overlap * 2 + sameEmployer };
    })
    .sort((a, b) => b.score - a.score || new Date(b.job.createdAt) - new Date(a.job.createdAt))
    .slice(0, 4)
    .map((x) => x.job);

  res.json({ jobs: scored });
};

exports.updateJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (job.employer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not your job' });
  }

  if (req.body.salaryMin !== undefined && (isNaN(req.body.salaryMin) || req.body.salaryMin < 0)) {
    return res.status(400).json({ message: 'salaryMin must be a non-negative number' });
  }
  if (req.body.salaryMax !== undefined && (isNaN(req.body.salaryMax) || req.body.salaryMax < 0)) {
    return res.status(400).json({ message: 'salaryMax must be a non-negative number' });
  }

  const allowed = ['title', 'description', 'location', 'type', 'skills', 'salaryMin', 'salaryMax', 'status'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) job[key] = req.body[key];
  }

  await job.save();
  res.json({ job });
};

exports.deleteJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (job.employer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not your job' });
  }

  await job.deleteOne();
  res.json({ message: 'Job deleted' });
};

exports.getMyJobs = async (req, res) => {
  const Application = require('../models/Application');
  const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 }).lean();

  const counts = await Application.aggregate([
    { $match: { job: { $in: jobs.map((j) => j._id) } } },
    { $group: { _id: '$job', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

  const withCounts = jobs.map((j) => ({ ...j, applicantCount: countMap[String(j._id)] || 0 }));
  res.json({ jobs: withCounts });
};

exports.getApplicants = async (req, res) => {
  const Application = require('../models/Application');
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (job.employer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not your job' });
  }

  const { status, page = 1, limit = 20 } = req.query;
  const filter = { job: job._id };
  if (status) filter.status = status;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * pageSize;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate('candidate', 'name email skills location resumeUrl'),
    Application.countDocuments(filter),
  ]);

  res.json({ applications, total, page: pageNum, pages: Math.ceil(total / pageSize) });
};

exports.getSavedJobs = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedJobs',
    populate: { path: 'employer', select: 'name companyName location' },
  });
  // Filter out any jobs that were deleted after being saved
  const jobs = (user.savedJobs || []).filter(Boolean);
  res.json({ jobs });
};

exports.saveJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedJobs: job._id } });
  res.json({ message: 'Job saved', jobId: job._id });
};

exports.unsaveJob = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { savedJobs: req.params.id } });
  res.json({ message: 'Job removed from saved', jobId: req.params.id });
};
