const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../services/emailService');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  const { name, email, password, role, skills, location, bio, companyName, companyDesc, website } =
    req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password, and role are required' });
  }

  if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
    return res.status(400).json({ message: 'Invalid input types' });
  }

  if (!['employer', 'candidate'].includes(role)) {
    return res.status(400).json({ message: 'role must be employer or candidate' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await User.create({
    name, email, password, role, skills, location, bio,
    companyName, companyDesc, website,
    verificationToken,
    verificationTokenExpiry,
  });

  try {
    await sendVerificationEmail(email, name, verificationToken);
  } catch {
    // Don't block registration if email fails
  }

  res.status(201).json({ token: signToken(user._id), user });
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired verification link' });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully' });
};

exports.resendVerification = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.isVerified) {
    return res.status(400).json({ message: 'Email already verified' });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  await sendVerificationEmail(user.email, user.name, verificationToken);
  res.json({ message: 'Verification email sent' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({ token: signToken(user._id), user });
};

exports.getMe = (req, res) => {
  res.json(req.user);
};

exports.updateMe = async (req, res) => {
  const allowed = ['name', 'location', 'bio', 'skills', 'resumeUrl', 'companyName', 'companyDesc', 'website'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  res.json(user);
};
