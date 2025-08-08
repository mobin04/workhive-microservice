const { Job } = require('../models/index');
const { AppError, ApiFeatures, JobConfig } = require('../../utils');
const mongoose = require('mongoose');

class JobRepository {
  async GetAllJobs(query) {
    try {
      const jobService = new ApiFeatures(query).paginate().sort().filter();
      const jobs = await jobService.fetchJobs();
      const totalJobs = await Job.countDocuments(jobService.filters);
      const totalPages = Math.ceil(totalJobs / jobService.pagination.limit);
      return { jobs, totalJobs, totalPages };
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetJobsByEmployerId(input) {
    const { id } = input;
    try {
      const job = await Job.find({ employer: id })
        .lean()
        .sort({ createdAt: -1 });
      return job;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async CreateJob(input) {
    const { filteredProperty, file } = input;

    const jobConfig = new JobConfig();
    try {
      const newJob = await Job.create(filteredProperty);

      if (file) {
        const companyLogoUrl = await jobConfig.uploadCompanyLogo(
          file,
          newJob._id
        );
        newJob.companyLogo = companyLogoUrl;
        await newJob.save();
      }

      return newJob;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetJobById(input) {
    const { id } = input;
    try {
      const job = await Job.findOne({ applications: id });
      return job;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async UpdateJobById(input) {
    const { filteredProperty, id } = input;
    try {
      const job = await Job.findOneAndUpdate({ _id: id }, filteredProperty, {
        new: true,
        runValidators: true,
      });
      return job;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async DeleteJob(input) {
    const { id } = input;

    try {
      await Job.deleteOne({ _id: id });
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async JobRenewExpire(input) {
    const { job } = input;
    try {
      await job.renewExpiration();
      job.status = 'open';
      await job.save();
      return job;
    } catch (err) {
      throw new AppError('');
    }
  }

  async CloseJob(input) {
    const { job } = input;
    try {
      job.status = 'closed';
      await job.save();
      return job;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetJobsStatistics() {
    try {
      const jobStatistics = await Job.aggregate([
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' },
            },
            totalPosted: { $sum: 1 },
            totalApplications: { $sum: { $size: '$applications' } }, // Count total applications per job
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        {
          $project: {
            _id: 0,
            month: '$_id.month',
            year: '$_id.year',
            totalPosted: 1,
            totalApplications: 1, // Track total applications
          },
        },
      ]);
      return jobStatistics;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetEmployerStatistics() {
    try {
      const employerStatistics = await Job.aggregate([
        {
          $group: {
            _id: '$employer',
            totalJobs: { $sum: 1 },
          },
        },
        { $sort: { totalJobs: -1 } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'employerDetails',
          },
        },
        {
          $project: {
            _id: 0,
            employerId: '$_id',
            totalJobs: 1,
            employerName: { $arrayElemAt: ['$employerDetails.name', 0] },
          },
        },
      ]);

      return employerStatistics;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetCategoryStatistics() {
    try {
      const categoryStatistics = await Job.aggregate([
        {
          $group: {
            _id: '$category',
            totalJobs: { $sum: 1 },
            totalApplications: { $sum: { $size: '$applications' } }, // Count applications in each category
          },
        },
        { $sort: { totalJobs: -1 } }, // Sort by most active industries
        {
          $project: {
            _id: 0,
            category: '$_id',
            totalJobs: 1,
            totalApplications: 1, // Include application count
          },
        },
      ]);

      return categoryStatistics;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetJobByApplicationId(input) {
    const { id } = input; // applicant ID
    try {
      const job = await Job.findOne({ applications: id })
        .select('-applications')
        .lean();
      if (!job) {
        return false;
      }
      return job;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetJobByJobId(input) {
    const { id } = input; // job ID
    try {
      const job = await Job.findById(id);
      if (!job) {
        return false;
      }
      return job;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async StatisticForEmployer(input) {
    const { employerId } = input;
    try {
      const now = new Date();

      const stats = await Job.aggregate([
        {
          $match: {
            employer: new mongoose.Types.ObjectId(employerId),
          },
        },

        {
          $facet: {
            // Summary
            summary: [
              {
                $group: {
                  _id: null,
                  totalJobsPosted: { $sum: 1 },
                  activeJobs: {
                    $sum: {
                      $cond: [{ $gt: ['$expiresAt', now] }, 1, 0],
                    },
                  },
                  expiredJobs: {
                    $sum: {
                      $cond: [{ $lte: ['$expiresAt', now] }, 1, 0],
                    },
                  },
                  totalApplications: { $sum: { $size: '$applications' } },
                },
              },
              {
                $addFields: {
                  averageApplicationsPerJob: {
                    $cond: [
                      { $eq: ['$totalJobsPosted', 0] },
                      0,
                      { $divide: ['$totalApplications', '$totalJobsPosted'] },
                    ],
                  },
                },
              },
              {
                $project: { _id: 0 },
              },
            ],

            // Time based stats
            timeRangeStats: [
              {
                $group: {
                  _id: null,
                  last7Days: {
                    $sum: {
                      $cond: [
                        {
                          $gte: [
                            '$createdAt',
                            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  last30Days: {
                    $sum: {
                      $cond: [
                        {
                          $gte: [
                            '$createdAt',
                            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  last90Days: {
                    $sum: {
                      $cond: [
                        {
                          $gte: [
                            '$createdAt',
                            new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  last7Days: 1,
                  last30Days: 1,
                  last90Days: 1,
                },
              },
            ],

            // jobType stats
            jobTypeStats: [
              {
                $group: {
                  _id: '$jobType',
                  count: { $sum: 1 },
                  applications: { $sum: { $size: '$applications' } },
                },
              },
              {
                $project: {
                  _id: 0,
                  type: '$_id',
                  count: 1,
                  applications: 1,
                },
              },
            ],

            // jobLevel stats
            jobLevelStats: [
              {
                $group: {
                  _id: '$jobLevel',
                  count: { $sum: 1 },
                  applications: { $sum: { $size: '$applications' } },
                },
              },
              {
                $project: {
                  _id: 0,
                  level: '$_id',
                  count: 1,
                  applications: 1,
                },
              },
            ],

            // category stats
            categoryStats: [
              {
                $group: {
                  _id: '$category',
                  count: { $sum: 1 },
                  applications: { $sum: { $size: '$applications' } },
                },
              },
              {
                $project: {
                  _id: 0,
                  category: '$_id',
                  count: 1,
                  applications: 1,
                },
              },
            ],

            // Location stats
            locationStats: [
              {
                $group: {
                  _id: '$location',
                  count: { $sum: 1 },
                  applications: { $sum: { $size: '$applications' } },
                },
              },
              {
                $project: {
                  _id: 0,
                  location: '$_id',
                  count: 1,
                  applications: 1,
                },
              },
            ],
          },
        },

        // Formated output
        {
          $project: {
            employerId: employerId,
            summary: { $arrayElemAt: ['$summary', 0] },
            jobTypeStats: 1,
            jobLevelStats: 1,
            categoryStats: 1,
            locationStats: 1,
            timeRangeStats: 1,
          },
        },
      ]);
      return stats[0];
    } catch (err) {
      console.log(err);
      throw new AppError(err.message, err.statusCode);
    }
  }

  async PushApplication(input) {
    const { applicationId, jobId } = input;
    try {
      const job = await Job.findByIdAndUpdate(jobId, {
        $addToSet: { applications: applicationId },
      });

      if (!job) return false;

      return true;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async AddLike(input) {
    const { userId, jobId } = input;
    try {
      const job = await Job.findByIdAndUpdate(jobId, {
        $addToSet: { likes: userId },
      });

      if (!job) return false;

      return true;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async RemoveLike(input) {
    const { userId, jobId } = input;
    try {
      const job = await Job.findByIdAndUpdate(jobId, {
        $pull: { likes: userId },
      });

      if (!job) return false;

      return true;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async PullApplication(input) {
    const { id, applicationId } = input;
    try {
      const job = await Job.findByIdAndUpdate(id, {
        $pull: { applications: applicationId },
      });

      if (!job) return false;

      return true;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }
}

module.exports = JobRepository;
