const mongoose = require('mongoose');
const addIdVirtual = require('../../utils/idVirtualPlugin');
const { AppError } = require('../../utils');

const jobSchema = new mongoose.Schema(
  {
    companyLogo: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      required: [true, 'A Job must have a title!'],
    },
    description: {
      type: String,
      required: [true, 'A Job must have a description!'],
    },
    company: {
      type: String,
      required: [true, 'A Job must belong to a company!'],
    },
    location: {
      type: String,
      required: [true, 'A Job must have a location!'],
    },
    geoLocation: {
      type: {
        type: String,
        enum: {
          values: ['Point'],
          message: ['geoLocation type must be <Point>!'],
        },
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function (val) {
            return val.length === 0 || val.length === 2;
          },
          message: 'Coordinates must be [longitude, latitude]',
        },
      },
    },
    salaryMinPerMonth: {
      type: Number,
      min: [0, 'Salary must be a positive number!'],
      required: [true, 'A Job must have minimum salary!'],
    },
    salaryMaxPerMonth: {
      type: Number,
      min: [0, 'Salary must be a positive number!'],
      required: [true, 'A Job must have maximium salary!'],
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'A Job must have an employer'],
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    ],
    category: {
      type: String,
      required: [true, 'A Job must have a catogory!'],
    },
    jobType: {
      type: String,
      enum: {
        values: ['full_time', 'part_time', 'remote', 'internship', 'contract'],
        message:
          'A jobType must be <full_time, part_time, remote, internship or contract>',
      },
      required: [true, 'A Job must have a jobType'],
    },
    jobLevel: {
      type: String,
      enum: {
        values: [
          'entry_level',
          'mid_level',
          'senior_level',
          'director',
          'vp_or_above',
        ],
        message:
          'Job level must be <entry_level, mid_level, senior_level, director, vp_or_above>',
      },
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId }],
    status: {
      type: String,
      enum: {
        values: ['open', 'closed'],
        message: 'status must be open or close',
      },
      default: 'open',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: { type: Date, index: { expires: 2592000 } }, // TTL index for 30 days
    isRenewed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexing for improve performance.
jobSchema.index({ title: 'text', location: 'text', company: 'text' });
jobSchema.index({ salaryMin: 1, salaryMax: -1 });

jobSchema.index({ geoLocation: '2dsphere' }); 

jobSchema.pre('save', function (next) {
  if (this.salaryMaxPerMonth < this.salaryMinPerMonth) {
    return next(
      new AppError(
        'Maximum salary must be greater than or equal to minimum salary!'
      )
    );
  }
  next();
});

jobSchema.pre('save', function (next) {
  if (this.isNew) {
    this.expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  }
  next();
});

jobSchema.methods.renewExpiration = function () {
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  this.isRenewed = true;
  return this.save();
};

// Add a virtual id field same as _id
jobSchema.plugin(addIdVirtual);

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
