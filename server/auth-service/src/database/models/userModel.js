const mongoose = require('mongoose');
const bycrypt = require('bcryptjs');
const addIdVirtual = require('../../utils/idVirtualPlugin');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User must have a name!'],
    },
    email: {
      type: String,
      required: [true, 'User must have an email!'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'User must have a password!'],
      minlength: [6, 'Password must have atleast 6-digit characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['job_seeker', 'employer', 'admin'],
        message: 'Please use job_seeker or employer in user role',
      },
      required: [true, 'User must have a role!'],
    },
    coverImage: {
      type: String,
      default:
        'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg',
    },
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    phone: {
      type: String,
      default: 'Not specified',
    },
    location: {
      type: String,
      default: 'Not specified',
    },
    website: {
      type: String,
      default: 'Not specified',
    },
    bio: {
      type: String,
      default: 'Not specified',
    },
    skills: [String],
    experience: {
      type: String,
      default: 'Not specified',
    },
    education: {
      type: String,
      default: 'Not specified',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isSuspended: { type: Boolean, default: false },
    suspendedUntil: { type: Date, default: null },
    suspendReason: { type: String, default: null },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Add a virtual id field same as _id
userSchema.plugin(addIdVirtual);

// Checking provider password is match to user password
userSchema.methods.isPasswordCorrect = async function (
  candidatePassword,
  userPassword
) {
  return await bycrypt.compare(candidatePassword, userPassword);
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// Hashing the password if it's changed.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bycrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
