const mongoose = require('mongoose');
const { JobRepository } = require('../database/repository');
const { AppError, formatData, filteredObject } = require('../utils');
const { JobConfig } = require('../utils');
const handleUpload = require('../utils/fileUploads');
const {
  EXCHANGE_NAME,
  QUEUE,
  BINDING_KEY,
  AUTH_QUEUE,
  AUTH_EXCHANGE,
  AUTH_BINDING_KEY,
} = require('../rabbitMqConfig');

class JobService {
  constructor(channel) {
    this.jobRepository = new JobRepository();
    this.jobConfig = new JobConfig();
    this.channel = channel;
  }

  async GetAllFilteredJob(userInput) {
    const { query } = userInput;
    try {
      const { jobs, totalJobs, totalPages } =
        await this.jobRepository.GetAllJobs(query);

      if (!jobs) {
        throw new AppError('No job found', 404);
      }

      return formatData({ jobs, totalJobs, totalPages });
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async CreateNewJob(userInput) {
    const { reqObj, file, userId, user } = userInput;

    try {
      if (!['employer'].includes(user.role))
        throw new AppError('Only employer can create job', 400);

      const filteredProperty = filteredObject(
        reqObj,
        'title',
        'description',
        'company',
        'location',
        'salaryMinPerMonth',
        'salaryMaxPerMonth',
        'jobType',
        'geoLocation',
        'jobLevel',
        'category'
      );

      filteredProperty.employer = userId;

      if (filteredProperty.geoLocation?.coordinates) {
        filteredProperty.geoLocation.coordinates =
          this.jobConfig.handleCoordinateFormat(
            filteredProperty.geoLocation.coordinates
          );
      }

      const newJob = await this.jobRepository.CreateJob({
        filteredProperty,
        file,
      });

      return formatData(newJob);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetSigleJob(userInput) {
    const { id } = userInput;

    try {
      const job = await this.jobRepository.GetJobByJobId({ id });
      if (!job) {
        throw new AppError('No job found with that ID!', 404);
      }
      return formatData(job);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async UpdateJob(userInput) {
    const { id, file, reqObj, currentUser } = userInput;
    try {
      const isJobExist = await this.jobRepository.GetJobById({ id });

      if (!isJobExist) throw new AppError('No job found with that id', 404);

      if (
        isJobExist.employer.toString() !== currentUser._id.toString() &&
        currentUser.role !== 'admin'
      )
        throw new AppError('You are not allowed to update this job :)', 403);

      const filteredProperty = filteredObject(
        reqObj,
        'title',
        'description',
        'company',
        'location',
        'jobType',
        'jobLevel',
        'geoLocation',
        'salaryMinPerMonth',
        'salaryMaxPerMonth',
        'category',
        'companyLogo'
      );

      if (filteredProperty.geoLocation?.coordinates) {
        filteredProperty.geoLocation.coordinates =
          this.jobConfig.handleCoordinateFormat(
            filteredProperty.geoLocation.coordinates
          );
      }

      if (Object.keys(filteredProperty).length === 0)
        throw new AppError('No valid field provided for update', 400);

      if (file) {
        const companyLogoUrl = await this.jobConfig.uploadCompanyLogo(
          file,
          isJobExist._id
        );
        filteredProperty.companyLogo = companyLogoUrl;
      }

      const updatedJob = await this.jobRepository.UpdateJobById({
        filteredProperty,
        id,
      });

      if (!updatedJob)
        throw new AppError('Failed to update job! Please try again', 400);

      return formatData(updatedJob);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async DeleteJobById(userInput) {
    const { id, user } = userInput;
    try {
      const job = await this.jobRepository.GetJobByJobId({ id });
      if (!job) throw new AppError('No job found', 404);
      if (
        job.employer.toString() !== user._id.toString() &&
        user.role !== 'admin'
      ) {
        throw new AppError('You are not allowed to delete this job!', 403);
      }

      await handleUpload.deleteImage('companyLogo', id);

      await this.jobRepository.DeleteJob({ id: job._id });
      return formatData('Job successfully deleted!');
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async renewJobExpiration(userInput) {
    const { id } = userInput;
    try {
      const job = await this.jobRepository.GetJobById({ id });

      if (job.isRenewed) {
        throw new AppError('Already renew this job!');
      }

      const renewedJob = await this.jobRepository.JobRenewExpire({ job });
      return formatData(renewedJob);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async CloseJob(userInput) {
    const { id, user } = userInput;
    try {
      const job = await this.jobRepository.GetJobById({ id });

      if (!job) throw new AppError('Job not found!', 404);

      if (
        job.employer.toString() !== user._id.toString() &&
        user.role !== 'admin'
      ) {
        throw new AppError('You are not allowed to close this job', 403);
      }

      if (job.status === 'closed')
        throw new AppError('Job already closed!', 400);

      const closedJob = await this.jobRepository.CloseJob({ job });

      return formatData(closedJob);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetJobByEmployerId(userInput) {
    const { id, user } = userInput; // id => employer ID
    try {
      if (user._id.toString() !== id && !['admin'].includes(user.role)) {
        throw new AppError(
          'You are not allowed to view jobs for this employer ID',
          403
        );
      }

      const job = await this.jobRepository.GetJobsByEmployerId({ id });

      return formatData(job);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetJobStatistics() {
    try {
      const jobStatistics = await this.jobRepository.GetJobsStatistics();
      if (jobStatistics.length === 0)
        throw new AppError('No job statistics avaliable!', 404);
      return formatData(jobStatistics);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetEmployerStatistics() {
    try {
      const employerStatistics =
        await this.jobRepository.GetEmployerStatistics();
      if (employerStatistics.length === 0)
        throw new AppError('No employer statistics found!', 404);
      return formatData(employerStatistics);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetCategoryStatistics() {
    try {
      const categoryStatistics =
        await this.jobRepository.GetCategoryStatistics();
      if (categoryStatistics.length === 0)
        throw new AppError('No category statistics found!', 404);
      return formatData(categoryStatistics);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  // RabbitMQ
  async RPCObserver(channel) {
    try {
      await channel.assertQueue(QUEUE, { durable: true });

      channel.bindQueue(QUEUE, EXCHANGE_NAME, BINDING_KEY);

      channel.consume(QUEUE, async (msg) => {
        let job = null;
        if (msg !== null) {
          const message = JSON.parse(msg.content.toString());
          const { type } = message;

          if (type === 'applicationId') {
            const { id } = message;
            job = await this.jobRepository.GetJobByApplicationId({ id });
          } else if (type === 'jobId') {
            const { id } = message;
            job = await this.jobRepository.GetJobByJobId({ id });
          } else if (type === 'pushApplication') {
            const { applicationId, jobId } = message;
            job = await this.jobRepository.PushApplication({
              applicationId,
              jobId,
            });
          } else if (type === 'removeApplication') {
            const { id, applicationId } = message;
            job = await this.jobRepository.PullApplication({
              id,
              applicationId,
            });
          }

          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(job)),
            {
              correlationId: msg.properties.correlationId,
            }
          );

          channel.ack(msg);
        }
      });
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async RPCAuthObserver(channel) {
    try {
      await channel.assertExchange(AUTH_EXCHANGE, 'direct', { durable: true });
      await channel.assertQueue(AUTH_QUEUE, { durable: true });
      await channel.bindQueue(AUTH_QUEUE, AUTH_EXCHANGE, AUTH_BINDING_KEY);

      channel.consume(AUTH_QUEUE, async (msg) => {
        let job = null;
        if (msg !== null) {
          const message = JSON.parse(msg.content.toString());
          const { type } = message;
          if (type === 'job') {
            const { id } = message;
            job = await this.jobRepository.GetJobByJobId({ id });
          }

          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(job)),
            {
              correlationId: msg.properties.correlationId,
            }
          );

          channel.ack(msg);
        }
      });
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }
}

module.exports = JobService;
