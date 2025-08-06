const mongoose = require('mongoose');
const addIdVirtual = require('../../utils/idVirtualPlugin');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Application must belong to a job!'],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Application must belong to a user'],
    },
    resumeUrl: {
      type: String,
      required: [true, 'Application must have a resume url!'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'withdrawn', 'shortlisted'],
      },
      default: 'pending',
    },
    activeStatus: {
      type: String,
      enum: {
        values: ['active', 'withdrawn']
      },
      default: 'active'
    },
    expiresAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ applicant: 1 });
applicationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

applicationSchema.plugin(addIdVirtual);

// Add a virtual 'id' field copy of _id
applicationSchema.plugin(addIdVirtual);

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;