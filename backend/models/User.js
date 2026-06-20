const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['employer', 'candidate'], required: true },

    // candidate fields
    skills: [String],
    location: String,
    bio: String,
    resumeUrl: String,

    // employer fields
    companyName: String,
    companyDesc: String,
    website: String,

    // email verification
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpiry: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
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
