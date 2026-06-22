const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    role: { type: String, enum: ['employer', 'candidate'], required: true },
    googleId: { type: String, sparse: true },
    avatar: String,
    onboardingComplete: { type: Boolean, default: false },

    // candidate fields
    skills: [String],
    location: String,
    bio: String,
    resumeUrl: String,
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

    // employer fields
    companyName: String,
    companyDesc: String,
    website: String,

    // email verification
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpiry: Date,

    // password reset
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(plain, this.password);
};

userSchema.set('toJSON', {
  transform: (_, obj) => {
    delete obj.password;
    delete obj.__v;
    return obj;
  },
});

module.exports = mongoose.model('User', userSchema);
