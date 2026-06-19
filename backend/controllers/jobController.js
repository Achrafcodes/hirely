const Job = require('../models/Job');

exports.createJob = async (req, res) => {
  const { title, description, location, type, skills, salaryMin, salaryMax } = req.body;

  if (!title || !description || !location || !type) {
    return res.status(400).json({ message: 'title, description, location, and type are required' });
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
  const { q, location, type, skills, page = 1, limit = 20 } = req.query;
  const filter = { status: 'active' };

  if (q) filter.$text = { $search: q };
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (type) filter.type = type;
  if (skills) {
    const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (skillList.length) filter.skills = { $all: skillList };
  }

  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * pageSize;

  const sortOrder = q ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
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
  const job = await Job.findById(req.params.id).populate('employer', 'name companyName website location');
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json({ job });
};

exports.updateJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (job.employer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not your job' });
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
  const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
  res.json({ jobs });
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

  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
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
