const Application = require('../models/Application');
const Job = require('../models/Job');

function cleanupFile(file) {
  // Cloudinary uploads are cleaned up automatically on error; no local file to delete
}

exports.applyToJob = async (req, res) => {
  const { coverLetter } = req.body;
  if (coverLetter && coverLetter.length > 5000) {
    cleanupFile(req.file);
    return res.status(400).json({ message: 'Cover letter must be 5000 characters or fewer' });
  }

  const job = await Job.findById(req.params.id);
  if (!job) {
    cleanupFile(req.file);
    return res.status(404).json({ message: 'Job not found' });
  }
  if (job.status === 'closed') {
    cleanupFile(req.file);
    return res.status(400).json({ message: 'Job is closed' });
  }

  // Use uploaded file if provided, fall back to resume on profile
  const resumeUrl = req.file ? req.file.path : req.user.resumeUrl;
  if (!resumeUrl) {
    return res.status(400).json({ message: 'No resume provided' });
  }

  const existing = await Application.findOne({ job: job._id, candidate: req.user._id });
  if (existing) {
    cleanupFile(req.file);
    return res.status(409).json({ message: 'Already applied to this job' });
  }

  const application = await Application.create({
    job: job._id,
    candidate: req.user._id,
    resumeUrl,
    coverLetter: req.body.coverLetter,
  });

  res.status(201).json({ application });
};

exports.getMyApplications = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = { candidate: req.user._id };
  if (status) filter.status = status;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * pageSize;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate('job', 'title location type status employer')
      .populate({ path: 'job', populate: { path: 'employer', select: 'companyName' } }),
    Application.countDocuments(filter),
  ]);

  res.json({ applications, total, page: pageNum, pages: Math.ceil(total / pageSize) });
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['applied', 'reviewed', 'interview', 'rejected', 'hired'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const application = await Application.findById(req.params.id).populate('job');
  if (!application) return res.status(404).json({ message: 'Application not found' });
  if (!application.job) return res.status(404).json({ message: 'Job no longer exists' });
  if (application.job.employer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not your job' });
  }

  application.status = status;
  await application.save();
  res.json({ application });
};

exports.withdrawApplication = async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).json({ message: 'Application not found' });
  if (application.candidate.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not your application' });
  }

  await application.deleteOne();
  res.json({ message: 'Application withdrawn' });
};
