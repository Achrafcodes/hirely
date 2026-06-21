const User = require('../models/User');
const Job = require('../models/Job');

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
