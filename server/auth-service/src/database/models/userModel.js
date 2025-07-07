const mongoose = require('mongoose');
const bycrypt = require('bcryptjs');
const addIdVirtual = require('../../utils/idVirtualPlugin');

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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Add a virtual id field same as _id
userSchema.plugin(addIdVirtual);

// Checking provider password is match to user password
userSchema.methods.isPasswordCorrect = async function (candidatePassword, userPassword) {
  return await bycrypt.compare(candidatePassword, userPassword);
};

// Hashing the password if it's changed.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bycrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
