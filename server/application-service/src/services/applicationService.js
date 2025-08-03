const { ApplicationRepository } = require('../database/repository');
const { AppError, formatData, Email, ApiFeatures } = require('../utils');
const handleFileUpload = require('../utils/fileUploads');
const ProvideMessage = require('../rabbitMQ/rabbitMqProvider');
const mongoose = require('mongoose');
const { notifyApplicant, notifyEmployer } = require('../config/socket');

class ApplicationService {
  constructor() {
    this.applicationRepo = new ApplicationRepository();
  }

  async GetApplicationByApplicantId(userInput) {
    const { id } = userInput;
    try {
      const application =
        await this.applicationRepo.GetApplicationsByApplicantId({ id });
      const countApplication = await this.applicationRepo.CountApplication({
        id,
      });
      if (!application) {
        throw new AppError('No application found with that ID!');
      }
      return formatData({ application, countApplication });
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async CreateApplication(userInput) {
    const { jobId, userId, file, currentUser } = userInput;
    const routing_key_job = 'job_request';
    const routing_key_user = 'user.request';

    try {
      if (!['job_seeker'].includes(currentUser.role)) {
        throw new AppError('Only job seekers can apply job', 400);
      }

      const isApplicationExist =
        await this.applicationRepo.ApplicByApplicantIdAndJobId({
          jobId,
          id: userId,
        });

      if (isApplicationExist)
        throw new AppError('Application already exists!', 400);

      if (!file)
        throw new AppError(
          'Resume is required! Please upload your resume',
          400
        );

      const job = await ProvideMessage(
        { type: 'jobId', id: jobId },
        routing_key_job,
        10000
      );

      if (!job || !job._id) throw new AppError('Job does not exist!', 400);

      // 🔹 Start MongoDB Transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      let hasCommitted = false;

      try {
        const application = await this.applicationRepo.CreateApplication(
          { jobId, id: userId },
          { session }
        );

        const resumeUrl = await handleFileUpload.uploadImage(
          file,
          'resume',
          application._id
        );

        if (!resumeUrl)
          throw new AppError('Error uploading resume! Please try again', 500);

        const newApplication = await this.applicationRepo.UploadResumeUrl(
          { application, resumeUrl },
          { session }
        );

        // End transation
        await session.commitTransaction();
        hasCommitted = true;
        session.endSession();

        const pushApplicationToJob = await ProvideMessage(
          { applicationId: newApplication._id, jobId, type: 'pushApplication' },
          routing_key_job,
          10000
        );
        if (!pushApplicationToJob)
          throw new AppError('Error pushing application to job service', 500);

        const applicantDetails = await ProvideMessage(
          { type: 'userId', id: newApplication.applicant },
          routing_key_user,
          10000
        );
        if (!applicantDetails)
          throw new AppError('Applicant details not found!', 404);

        const applicationInfo = {
          job: {
            id: job?._id || null,
            title: job?.title || null,
            company: job?.company || null,
            companyLogo: job?.companyLogo || null,
            employer: job?.employer || null,
          },
          applicant: {
            id: applicantDetails?._id || null,
            name: applicantDetails?.name || null,
            email: applicantDetails?.email || null,
          },
          application: newApplication || null,
        };

        await new Email(applicationInfo.applicant, '', {
          application: applicationInfo,
        }).sendApplicationStatusUpdate();

        notifyEmployer(
          applicationInfo.job.employer,
          applicationInfo.job.title,
          { title: job?.title, company: job?.company }
        );
        // console.log(applicationInfo.job.title)

        return formatData(applicationInfo);
      } catch (err) {
        if (!hasCommitted) {
          await session.abortTransaction();
        }
        session.endSession();
        throw new AppError(err.message, err.statusCode);
      }
    } catch (err) {
      console.error('❌ Error in CreateApplication:', err);
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetApplicationByJobId(userInput) {
    const { jobId, currentUser, reqQuery } = userInput;
    const routing_key_job = 'job_request';
    const routing_key_user = 'user.request';

    try {
      const job = await ProvideMessage(
        { type: 'jobId', id: jobId },
        routing_key_job,
        10000
      );

      if (!job) throw new AppError('No job found with that ID', 404);

      if (
        job.employer.toString() !== currentUser._id.toString() &&
        !['admin'].includes(currentUser.role)
      ) {
        throw new AppError(
          'You are not allowed to view the applications belong to that job',
          403
        );
      }

      const application = await this.applicationRepo.GetApplicationByJobId({
        jobId,
        reqQuery,
      });

      if (!application) throw new AppError('No application found', 404);

      const employer = await ProvideMessage(
        { type: 'userId', id: job.employer },
        routing_key_user,
        10000
      );

      if (!employer) throw new AppError('Employer details not found!', 500);

      let applicationInfo = [];
      applicationInfo = await Promise.all(
        application.map(async (application) => {
          const applicationDetail = { ...application, applicant: null };
          applicationDetail.applicant = await ProvideMessage(
            { id: application.applicant, type: 'userId' },
            routing_key_user,
            10000
          );
          return applicationDetail;
        })
      );

      // 🔹Format data
      const jobWithApplication = {
        job: {
          id: jobId,
          companyLogo: job.companyLogo,
          title: job.title,
          company: job.company,
          location: job.location,
          geoLocation: job.geoLocation,
          employer: {
            id: employer._id,
            name: employer.name,
            email: employer.email,
            coverImage: employer.coverImage,
          },
          totalApplication: application.length,
          application: applicationInfo,
        },
      };

      return formatData(jobWithApplication);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  // 🔹Update application status.
  async UpdateApplicationStatus(userInput) {
    const { id, status, currentUser } = userInput;
    const routing_key_user = 'user.request';
    const routing_key_job = 'job_request';

    try {
      if (!['accepted', 'rejected'].includes(status)) {
        throw new AppError('Status must be accepted or rejected', 400);
      }
      const application = await this.applicationRepo.GetApplicationById({ id });

      if (!application)
        throw new AppError('No application found with that ID!', 404);

      const job = await ProvideMessage(
        { type: 'jobId', id: application.job },
        routing_key_job,
        10000
      );

      if (
        job.employer !== currentUser._id &&
        !['admin'].includes(currentUser.role)
      )
        throw new AppError(
          'You are not allowed to update this application!',
          403
        );

      const updatedApplication =
        await this.applicationRepo.UpdateApplicationStatus({ id, status });

      if (!updatedApplication || updatedApplication.length === 0)
        throw new AppError('No application found with that ID');

      const applicant = await ProvideMessage(
        { type: 'userId', id: updatedApplication.applicant },
        routing_key_user,
        10000
      );

      if (!applicant)
        throw new AppError(
          'No applicant found belong to that application!',
          404
        );

      // Send email
      await new Email(applicant, '', {
        application: { application: updatedApplication },
        jobDetails: job,
      }).sendApplicationStatusUpdate();

      // Notify applicant
      notifyApplicant(applicant._id, updatedApplication.status, {
        title: job?.title,
        company: job?.company,
      });

      return formatData({ updatedApplication: updatedApplication, applicant });
    } catch (err) {
      // console.log('ERROR' + err);
      throw new AppError(err.message, err.statusCode);
    }
  }

  //🔹Withdraw application.
  async WithdrawApplication(userInput) {
    const { id, currentUserId } = userInput;
    const routing_key_job = 'job_request';
    try {
      const application =
        await this.applicationRepo.GetApplicationByIdAndApplicantId({
          id,
          applicantId: currentUserId,
        });

      if (!application || application.length === 0)
        throw new AppError('No application found with that ID!', 404);

      if (application.activeStatus === 'withdrawn')
        throw new AppError('Already withdrawned this application!', 400);

      if (application.status !== 'pending')
        throw new AppError(
          'You can only withdraw the pending applications',
          400
        );

      const pullApplicationFromJob = await ProvideMessage(
        { type: 'removeApplication', id: application.job, applicationId: id },
        routing_key_job,
        10000
      );

      if (!pullApplicationFromJob)
        throw new AppError(
          'Error occour while removing application from job',
          500
        );

      const withdrawnApplication =
        await this.applicationRepo.WithdrawApplication({ application });

      if (!withdrawnApplication)
        throw new AppError('Error withdrawn application!', 500);

      return formatData(withdrawnApplication);
    } catch (err) {
      // console.log(err);
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetWithdrawnedApplication(userInput) {
    const { reqQuery, applicantId } = userInput;
    // const routing_key_user = 'user.request';
    const routing_key_job = 'job_request';
    try {
      // const apiFeatures = new ApiFeatures(reqQuery).paginate().sort();

      const { application } = await this.applicationRepo.WithdrawedApplication({
        // apiFeatures,
        applicantId,
      });

      // if (!application || applicationCount === 0) return false;
      if (!application) return false;

      let applicationInfo = [];
      applicationInfo = await Promise.all(
        application.map(async (application) => {
          const applicationDetails = { application, job: null };
          // Fetch applicant
          // const applicant = await ProvideMessage(
          //   { type: 'userId', id: application.applicant },
          //   routing_key_user,
          //   10000
          // );
          // Fetch job
          applicationDetails.job = await ProvideMessage(
            { type: 'jobId', id: application.job },
            routing_key_job,
            10000
          );
          // Fetch employer
          // const employer = await ProvideMessage(
          //   { type: 'userId', id: job.employer },
          //   routing_key_user,
          //   10000
          // );
          // Formated data
          // const details = {
          //   ...application,
          // applicant: {
          //   id: applicant._id || null,
          //   name: applicant.name || null,
          //   email: applicant.email || null,
          //   coverImage: applicant.coverImage || null,
          // },
          // job,
          // id: job._id || null,
          // company: job.company || null,
          // title: job.title || null,
          // location: job.location || null,
          // employer: {
          //   id: employer._id || null,
          //   name: employer.name || null,
          //   email: employer.email || null,
          //   coverImage: employer.coverImage || null,
          // },
          // };

          return applicationDetails;
        })
      );

      return formatData({ applicationInfo });
    } catch (err) {
      // console.log(`❌ ERROR OCCOUR ${err}`);
      throw new AppError(err.message, err.statusCode);
    }
  }
}

module.exports = ApplicationService;
