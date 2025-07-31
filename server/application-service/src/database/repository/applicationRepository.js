const { AppError, ApiFeatures } = require('../../utils');
const Application = require('../models/applicationModel');

class ApplicationRepository {
  async CreateApplication(input) {
    const { id, jobId } = input; // applicant ID
    try {
      const newApplication = await Application.create({
        job: jobId,
        applicant: id,
        resumeUrl: 'uploading...',
      });
      return newApplication;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetApplicationById(input) {
    const { id } = input;
    try {
      const application = await Application.findById(id);
      if (!application) return false;
      return application;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async UploadResumeUrl(input) {
    const { application, resumeUrl } = input;
    try {
      const newApplication = await Application.findByIdAndUpdate(
        application._id,
        { resumeUrl }
      );
      return newApplication;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async ApplicByApplicantIdAndJobId(input) {
    const { id, jobId } = input;
    try {
      const application = Application.findOne({ applicant: id, job: jobId });
      return application;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetApplicationsByApplicantId(input) {
    const { id } = input;
    try {
      const application = await Application.find({ applicant: id });
      return application;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetApplicationByIdAndApplicantId(input) {
    const { id, applicantId } = input;
    try {
      const application = await Application.findOne({
        _id: id,
        applicant: applicantId,
      });
      return application;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async WithdrawApplication(input) {
    const { application } = input;
    const expireDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    try {
      application.activeStatus = 'withdrawn';
      application.status = 'withdrawn';
      application.expiresAt = expireDate;
      await application.save();
      return application;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async CountApplication(input) {
    const { id } = input;
    try {
      const applicationCount = await Application.countDocuments({
        applicant: id,
      }).lean();
      return applicationCount;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetApplicationByJobId(input) {
    const { jobId, reqQuery = {} } = input;
    try {
      const apiFeatures = new ApiFeatures(reqQuery).paginate().sort();
      const application = await Application.find({ job: jobId })
        .sort(apiFeatures.sorting)
        .skip(apiFeatures.pagination.skip)
        .limit(apiFeatures.pagination.limit)
        .lean();
      return application;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async UpdateApplicationStatus(input) {
    const { id, status } = input;
    const expireDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    try {
      const application = await Application.findOneAndUpdate(
        { _id: id },
        { status, expiresAt: expireDate },
        { new: true }
      ).lean();
      return application;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async WithdrawedApplication(input) {
    const { applicantId } = input;
    try {
      const application = await Application.find({
        activeStatus: 'withdrawn',
        applicant: applicantId,
        expiresAt: { $exists: true },
      }).lean();

      if (!application) return false;

      // const applicationCount = await Application.countDocuments({
      //   activeStatus: 'withdrawn',
      // });

      // return { application, applicationCount };
      return { application };
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }
}

module.exports = ApplicationRepository;
