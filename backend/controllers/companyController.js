const User = require('../models/User');
const Job = require('../models/Job');

// Directory: all employers that have at least one active job, with open-role counts
exports.getCompanies = async (req, res) => {
  const counts = await Job.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$employer', jobCount: { $sum: 1 } } },
  ]);

  const countMap = new Map(counts.map((c) => [String(c._id), c.jobCount]));
  const employers = await User.find({ _id: { $in: counts.map((c) => c._id) } })
    .select('name companyName companyDesc location');

  const companies = employers
    .map((e) => ({
      _id: e._id,
      name: e.name,
      companyName: e.companyName,
      companyDesc: e.companyDesc,
      location: e.location,
      jobCount: countMap.get(String(e._id)) || 0,
    }))
    .sort((a, b) => b.jobCount - a.jobCount);

  res.json({ companies });
};

// Public company profile: employer info + their active jobs
exports.getCompany = async (req, res) => {
  const employer = await User.findOne({ _id: req.params.id, role: 'employer' })
    .select('name companyName companyDesc website location createdAt');
  if (!employer) return res.status(404).json({ message: 'Company not found' });

  const jobs = await Job.find({ employer: employer._id, status: 'active' })
    .sort({ createdAt: -1 })
    .populate('employer', 'name companyName location');

  res.json({ company: employer, jobs });
};
