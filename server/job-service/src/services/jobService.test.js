const JobService = require('./jobService');

jest.mock('../database/repository', () => ({
  JobRepository: jest.fn().mockImplementation(() => ({
    GetAllJobs: jest.fn(),
    GetJobsByEmployerId: jest.fn(),
    CreateJob: jest.fn(),
    GetJobById: jest.fn(),
    UpdateJobById: jest.fn(),
    DeleteJob: jest.fn(),
    JobRenewExpire: jest.fn(),
    CloseJob: jest.fn(),
    GetJobsStatistics: jest.fn(),
    GetEmployerStatistics: jest.fn(),
    GetCategoryStatistics: jest.fn(),
    GetJobByApplicationId: jest.fn(),
    GetJobByJobId: jest.fn(),
    PushApplication: jest.fn(),
    PullApplication: jest.fn(),
    AddLike: jest.fn(),
    RemoveLike: jest.fn(),
    StatisticForEmployer: jest.fn(),
  })),
}));

jest.mock('../config/firebaseConfig', () => ({}));
jest.mock('../utils/fileUploads');

const handleFileUpload = require('../utils/fileUploads');
const { Email } = require('../utils');

describe('JobService - GetAllFilteredJob', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JobService();
    mockRepo = service.jobRepository;
  });

  it('Should throw error if no job found', async () => {
    mockRepo.GetAllJobs.mockResolvedValue({ jobs: null });
    await expect(
      service.GetAllFilteredJob({
        query: '',
      })
    ).rejects.toThrow('No job found');
  });

  it('Should get formated data successfully', async () => {
    mockRepo.GetAllJobs.mockResolvedValueOnce({
      jobs: [{ _id: 'job1', title: 'developer', location: 'banglore' }],
      totalJobs: 1,
      totalPages: 1,
    });

    const result = await service.GetAllFilteredJob({ query: {} });
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('jobs');
    expect(result.data).toHaveProperty('totalJobs');
    expect(result.data).toHaveProperty('totalPages');
    expect(mockRepo.GetAllJobs).toHaveBeenCalled();
    expect(mockRepo.GetAllJobs).toHaveBeenCalledWith({});
  });
});

describe('JobService - CreateNewJob', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JobService();
    mockRepo = service.jobRepository;
    // mock coordinate handler
    service.jobConfig.handleCoordinateFormat = jest.fn((coords) => coords);
  });

  it('Should throw error is user is not an employer', async () => {
    await expect(
      service.CreateNewJob({
        reqObj: {},
        file: {},
        userId: 'user123',
        user: { role: 'notemployer' },
      })
    ).rejects.toThrow('Only employer can create job');
  });

  it('Should create job successfully for employer', async () => {
    const reqObj = {
      title: 'Developer',
      description: 'Job desc',
      company: 'Company',
      location: 'City',
      salaryMinPerMonth: 1000,
      salaryMaxPerMonth: 2000,
      jobType: 'Full-time',
      geoLocation: { coordinates: [77.1, 12.9] },
      jobLevel: 'Junior',
      category: 'IT',
    };
    const file = { originalname: 'logo.png' };
    const userId = 'emp123';
    const user = { role: 'employer' };

    const fakeJob = { _id: 'job1', ...reqObj, employer: userId };
    mockRepo.CreateJob.mockResolvedValueOnce(fakeJob);

    const result = await service.CreateNewJob({
      reqObj,
      file,
      userId,
      user,
    });

    expect(service.jobConfig.handleCoordinateFormat).toHaveBeenCalledWith([
      77.1, 12.9,
    ]);
    expect(mockRepo.CreateJob).toHaveBeenCalledWith({
      filteredProperty: expect.objectContaining({
        ...reqObj,
        employer: userId,
      }),
      file,
    });
    expect(result).toHaveProperty('data');
    expect(result.data).toMatchObject(fakeJob);
  });

  it('Should throw error if CreateJob fails', async () => {
    mockRepo.CreateJob.mockResolvedValueOnce(null);

    await expect(
      service.CreateNewJob({
        reqObj: { title: 'Dev' },
        file: {},
        userId: 'emp123',
        user: { role: 'employer' },
      })
    ).rejects.toThrow();
  });
});

describe('JobService - GetSigleJob', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JobService();
    mockRepo = service.jobRepository;
  });

  it('Should throw error if no job found', async () => {
    mockRepo.GetJobById.mockResolvedValue(null);
    await expect(service.GetSigleJob({ id: 'job123' })).rejects.toThrow(
      'No job found with that ID!'
    );
  });

  it('Should return job successfully', async () => {
    mockRepo.GetJobByJobId.mockResolvedValueOnce({
      _id: 'job123',
      title: 'developer',
      location: 'kerala',
    });

    const result = await service.GetSigleJob({ id: 'job123' });

    expect(result).toHaveProperty('data');
    expect(result.data).toMatchObject({
      _id: 'job123',
      title: 'developer',
      location: 'kerala',
    });
  });
});

describe('JobService - UpdateJob', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JobService();
    mockRepo = service.jobRepository;
    // mock coordinate helper
    service.jobConfig.handleCoordinateFormat = jest.fn((coords) => coords);
    service.jobConfig.uploadCompanyLogo = jest
      .fn()
      .mockResolvedValue('logo-url');
  });

  it('Should throw error if job not found', async () => {
    mockRepo.GetJobById.mockResolvedValue(null);
    await expect(
      service.UpdateJob({
        id: 'job123',
        file: {},
        reqObj: {},
        currentUser: {},
      })
    ).rejects.toThrow('No job found with that id');
  });

  it('Should throw error if user not allowed to update job', async () => {
    mockRepo.GetJobById.mockResolvedValue({
      _id: 'job123',
      employer: 'user123',
      title: 'developer',
    });

    await expect(
      service.UpdateJob({
        _id: 'job123',
        file: {},
        reqObj: {},
        currentUser: {
          name: 'user',
          _id: 'user321',
          role: 'job_seeker',
        },
      })
    ).rejects.toThrow('You are not allowed to update this job :)');
  });

  it('Should throw error if no valid field provided for update', async () => {
    mockRepo.GetJobById.mockResolvedValue({
      _id: 'job123',
      employer: 'user123',
      title: 'developer',
    });

    await expect(
      service.UpdateJob({
        id: 'job123',
        file: null,
        reqObj: {},
        currentUser: {
          _id: 'user123',
          role: 'employer',
        },
      })
    ).rejects.toThrow('No valid field provided for update');
  });

  it('Should update job successfully without file', async () => {
    mockRepo.GetJobById.mockResolvedValue({
      _id: 'job123',
      employer: 'user123',
      title: 'developer',
    });
    mockRepo.UpdateJobById.mockResolvedValue({
      _id: 'job123',
      title: 'updated title',
      employer: 'user123',
    });

    const result = await service.UpdateJob({
      id: 'job123',
      file: null,
      reqObj: { title: 'updated title' },
      currentUser: {
        _id: 'user123',
        role: 'employer',
      },
    });

    expect(mockRepo.UpdateJobById).toHaveBeenCalledWith({
      filteredProperty: { title: 'updated title' },
      id: 'job123',
    });
    expect(result).toHaveProperty('data');
    expect(result.data).toMatchObject({
      _id: 'job123',
      title: 'updated title',
      employer: 'user123',
    });
  });

  it('Should update job successfully with file', async () => {
    mockRepo.GetJobById.mockResolvedValue({
      _id: 'job123',
      employer: 'user123',
      title: 'developer',
    });

    mockRepo.UpdateJobById.mockResolvedValue({
      _id: 'job123',
      title: 'updated title',
      employer: 'user123',
      companyLogo: 'logo-url',
    });

    const result = await service.UpdateJob({
      id: 'job123',
      file: { originalname: 'logo.png' },
      reqObj: { title: 'updated title' },
      currentUser: {
        _id: 'user123',
        role: 'employer',
      },
    });

    expect(service.jobConfig.uploadCompanyLogo).toHaveBeenCalledWith(
      { originalname: 'logo.png' },
      'job123'
    );
    expect(mockRepo.UpdateJobById).toHaveBeenCalledWith({
      filteredProperty: { title: 'updated title', companyLogo: 'logo-url' },
      id: 'job123',
    });
    expect(result.data.companyLogo).toBe('logo-url');
  });

  it('Should throw error if UpdateJobById fails', async () => {
    mockRepo.GetJobById.mockResolvedValue({
      _id: 'job123',
      employer: 'user123',
      title: 'developer',
    });
    mockRepo.UpdateJobById.mockResolvedValue(null);

    await expect(
      service.UpdateJob({
        id: 'job123',
        file: null,
        reqObj: { title: 'updated title' },
        currentUser: {
          _id: 'user123',
          role: 'employer',
        },
      })
    ).rejects.toThrow('Failed to update job! Please try again');
  });
});

describe('JobService - DeleteJobById', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    service = new JobService();
    mockRepo = service.jobRepository;
  });

  it('Should throw error if no job found', async () => {
    mockRepo.GetJobByJobId.mockResolvedValue(null);
    await expect(
      service.DeleteJobById({
        id: '',
        user: {},
      })
    ).rejects.toThrow('No job found');
  });

  it('Should throw error if user not allowed to delete the job', async () => {
    mockRepo.GetJobByJobId.mockResolvedValue({
      _id: 'job123',
      title: 'developer',
      employer: 'user123',
    });

    await expect(
      service.DeleteJobById({
        id: 'job123',
        user: {
          _id: 'user321',
          role: 'job_seeker',
        },
      })
    ).rejects.toThrow('You are not allowed to delete this job!');
  });

  it('Should return message after job deleted successfully', async () => {
    mockRepo.GetJobByJobId.mockResolvedValueOnce({
      _id: 'job123',
      title: 'developer',
      employer: 'user123',
    });

    handleFileUpload.deleteImage.mockResolvedValue(true);

    mockRepo.DeleteJob.mockResolvedValue(true);

    const result = await service.DeleteJobById({
      id: 'job123',
      user: {
        _id: 'user123',
        role: 'employer',
      },
    });

    expect(result).toHaveProperty('data');
    expect(result.data).toBe('Job successfully deleted!');
    expect(mockRepo.GetJobByJobId).toHaveBeenCalledWith({ id: 'job123' });
    expect(handleFileUpload.deleteImage).toHaveBeenCalledWith(
      'companyLogo',
      'job123'
    );
    expect(mockRepo.DeleteJob).toHaveBeenCalledWith({ id: 'job123' });
  });
});

describe('JobService - renewJobExpiration', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    service = new JobService();
    mockRepo = service.jobRepository;
  });

  it('Should throw error if job is already renewed', async () => {
    mockRepo.GetJobById.mockResolvedValueOnce({
      _id: 'job123',
      isRenewed: true,
      title: 'foo',
    });

    await expect(service.renewJobExpiration({ id: 'job123' })).rejects.toThrow(
      'Already renew this job!'
    );
  });

  it('Should return renewed job successfully', async () => {
    mockRepo.GetJobById.mockResolvedValueOnce({
      _id: 'job123',
      isRenewed: false,
      title: 'foo',
    });

    mockRepo.JobRenewExpire.mockResolvedValueOnce({
      _id: 'job123',
      isRenewed: true,
      expire: '10:56:13:0000',
      title: 'foo',
    });

    const result = await service.renewJobExpiration({ id: 'job123' });

    expect(result).toHaveProperty('data');
    expect(result.data).toMatchObject({
      _id: 'job123',
      isRenewed: true,
      expire: '10:56:13:0000',
      title: 'foo',
    });
    expect(mockRepo.GetJobById).toHaveBeenCalledWith({ id: 'job123' });
    expect(mockRepo.JobRenewExpire).toHaveBeenCalledWith({
      job: {
        _id: 'job123',
        isRenewed: false,
        title: 'foo',
      },
    });
  });
});

describe('JobService - CloseJob', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    service = new JobService();
    mockRepo = service.jobRepository;
  });

  it('Should throw error if job not found', async () => {
    mockRepo.GetJobById.mockResolvedValue(null);
    await expect(service.CloseJob({ id: '', user: {} })).rejects.toThrow(
      'Job not found!'
    );
  });

  it('Should throw error if user not allowed to close the job', async () => {
    mockRepo.GetJobById.mockResolvedValueOnce({
      _id: 'job123',
      employer: 'emp1',
    });
    await expect(
      service.CloseJob({
        id: 'job123',
        user: {
          _id: 'user123',
          name: 'foo',
          email: 'foo@x.com',
          role: 'job_seeker',
        },
      })
    ).rejects.toThrow('You are not allowed to close this job');
  });

  it('Should throw error if job status is already closed', async () => {
    mockRepo.GetJobById.mockResolvedValueOnce({
      _id: 'job123',
      employer: 'emp1',
      status: 'closed',
    });
    await expect(
      service.CloseJob({
        id: 'job123',
        user: {
          _id: 'emp1',
          name: 'foo',
          email: 'foo@x.com',
          role: 'employer',
        },
      })
    ).rejects.toThrow('Job already closed!');
  });

  it('Should return closed job successfully', async () => {
    mockRepo.GetJobById.mockResolvedValueOnce({
      _id: 'job123',
      employer: 'emp1',
      status: 'active',
    });

    mockRepo.CloseJob.mockResolvedValueOnce({
      _id: 'job123',
      employer: 'emp1',
      status: 'closed',
    });

    const result = await service.CloseJob({
      id: 'job123',
      user: {
        _id: 'emp1',
        name: 'foo',
        email: 'foo@x.com',
        role: 'employer',
      },
    });

    expect(result).toHaveProperty('data');
    expect(mockRepo.GetJobById).toHaveBeenCalledWith({ id: 'job123' });
    expect(mockRepo.CloseJob).toHaveBeenCalledWith({
      job: {
        _id: 'job123',
        employer: 'emp1',
        status: 'active',
      },
    });
    expect(result.data).toMatchObject({
      _id: 'job123',
      employer: 'emp1',
      status: 'closed',
    });
  });
});

describe('JobService - GetJobByEmployerId', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    service = new JobService();
    mockRepo = service.jobRepository;
  });

  it('Should throw error if user not allowed to view the job', async () => {
    await expect(
      service.GetJobByEmployerId({
        id: 'emp1',
        user: {
          _id: 'user1',
          role: 'job_seeker',
          name: 'foo',
        },
      })
    ).rejects.toThrow('You are not allowed to view jobs for this employer ID');
  });

  it('Should get job successfully', async () => {
    mockRepo.GetJobsByEmployerId.mockResolvedValueOnce({
      _id: 'job123',
      title: 'developer',
      status: 'active',
      location: 'banglore',
      employer: 'emp1',
    });

    const result = await service.GetJobByEmployerId({
      id: 'emp1',
      user: {
        _id: 'emp1',
        role: 'employer',
        name: 'test',
        email: 'test@ex.com',
      },
    });

    expect(result).toHaveProperty('data');
    expect(result.data).toMatchObject({
      _id: 'job123',
      title: 'developer',
      status: 'active',
      location: 'banglore',
      employer: 'emp1',
    });
    expect(mockRepo.GetJobsByEmployerId).toHaveBeenCalled();
    expect(mockRepo.GetJobsByEmployerId).toHaveBeenCalledWith({ id: 'emp1' });
  });
});

describe('JobService - GetJobStatistics', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    service = new JobService();
    mockRepo = service.jobRepository;
  });

  it('Should throw error if no statistics found', async () => {
    mockRepo.GetJobsStatistics.mockResolvedValue([]);
    await expect(service.GetJobStatistics()).rejects.toThrow(
      'No job statistics avaliable!'
    );
  });

  it('Should get job statistics successfully', async () => {
    mockRepo.GetJobsStatistics.mockResolvedValue({
      _id: 0,
      month: '4',
      year: '2025',
      totalPosted: 90,
      totalApplication: 600,
    });

    const result = await service.GetJobStatistics();

    expect(result).toHaveProperty('data');
    expect(mockRepo.GetJobsStatistics).toHaveBeenCalled();
    expect(result.data).toMatchObject({
      _id: 0,
      month: '4',
      year: '2025',
      totalPosted: 90,
      totalApplication: 600,
    });
  });
});

describe('JobService - GetEmployerStatistics', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    service = new JobService();
    mockRepo = service.jobRepository;
  });

  it('Should throw error if no employer statistics found', async () => {
    mockRepo.GetEmployerStatistics.mockResolvedValue([]);
    await expect(service.GetEmployerStatistics()).rejects.toThrow(
      'No employer statistics found!'
    );
  });

  it('Shoud return employer statistics successfullu', async () => {
    mockRepo.GetEmployerStatistics.mockResolvedValueOnce({
      _id: 1,
      employerId: 'emp1',
      totalJobs: 5,
      employerName: 'Johnny',
    });

    const result = await service.GetEmployerStatistics();
    expect(result).toHaveProperty('data');
    expect(mockRepo.GetEmployerStatistics).toHaveBeenCalled();
    expect(result.data).toMatchObject({
      _id: 1,
      employerId: 'emp1',
      totalJobs: 5,
      employerName: 'Johnny',
    });
  });
});

describe('JobService - GetCategoryStatistics', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    service = new JobService();
    mockRepo = service.jobRepository;
  });

  it('Should throw error if no category statistics found', async () => {
    mockRepo.GetCategoryStatistics.mockResolvedValue([]);
    await expect(service.GetCategoryStatistics()).rejects.toThrow(
      'No category statistics found!'
    );
  });

  it('Should return category statistics succssfully', async () => {
    mockRepo.GetCategoryStatistics.mockResolvedValue([
      {
        _id: 0,
        category: 'Engineering',
        totalJobs: 550,
        totalApplications: 15000,
      },
    ]);

    const result = await service.GetCategoryStatistics();

    expect(result).toHaveProperty('data');
    expect(mockRepo.GetCategoryStatistics).toHaveBeenCalled();
    expect(result.data).toMatchObject([
      {
        _id: 0,
        category: 'Engineering',
        totalJobs: 550,
        totalApplications: 15000,
      },
    ]);
  });
});

describe('JobService - RPCObserver', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JobService();
    mockRepo = service.jobRepository;
  });

  const mockChannel = {
    assertQueue: jest.fn().mockResolvedValue(true),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    sendToQueue: jest.fn(),
    ack: jest.fn(),
  };

  it('Should respond with job data when type is jobId', async () => {
    const fakeJob = { _id: 'job123', title: 'developer' };
    mockRepo.GetJobByJobId.mockResolvedValue(fakeJob);

    // mock the consume callback
    let consumeCallback;
    mockChannel.consume.mockImplementation((queue, cb) => {
      consumeCallback = cb;
    });

    await service.RPCObserver(mockChannel);

    // Simulate a message
    const msg = {
      content: Buffer.from(JSON.stringify({ type: 'jobId', id: 'job123' })),
      properties: {
        replyTo: 'reply-queue',
        correlationId: 'corr-id-1',
      },
    };

    // Call the consume callback as if a message arrived
    await consumeCallback(msg);

    expect(mockRepo.GetJobByJobId).toHaveBeenCalledWith({ id: 'job123' });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      'reply-queue',
      Buffer.from(JSON.stringify(fakeJob)),
      { correlationId: 'corr-id-1' }
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it('Should respond with job data when type is applicationId', async () => {
    const fakeJob = { _id: 'job1', title: 'developer', application: 'applic1' };
    mockRepo.GetJobByApplicationId.mockResolvedValue(fakeJob);

    let consumeCallback;
    mockChannel.consume.mockImplementation((queue, cb) => {
      consumeCallback = cb;
    });

    await service.RPCObserver(mockChannel);

    // Simulate a message
    const msg = {
      content: Buffer.from(
        JSON.stringify({ type: 'applicationId', id: 'job1' })
      ),
      properties: {
        replyTo: 'reply-queue',
        correlationId: 'corr-id-2',
      },
    };

    await consumeCallback(msg);

    expect(mockRepo.GetJobByApplicationId).toHaveBeenCalledWith({ id: 'job1' });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      'reply-queue',
      Buffer.from(JSON.stringify(fakeJob)),
      { correlationId: 'corr-id-2' }
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it('Should respond with job data when type is pushApplication', async () => {
    mockRepo.PushApplication.mockResolvedValue(true);

    let consumeCallback;
    mockChannel.consume.mockImplementation((queue, cb) => {
      consumeCallback = cb;
    });

    await service.RPCObserver(mockChannel);

    const msg = {
      content: Buffer.from(
        JSON.stringify({
          type: 'pushApplication',
          applicationId: 'applic1',
          jobId: 'job1',
        })
      ),
      properties: {
        replyTo: 'reply-queue',
        correlationId: 'corr-id-3',
      },
    };

    await consumeCallback(msg);

    expect(mockRepo.PushApplication).toHaveBeenCalledWith({
      applicationId: 'applic1',
      jobId: 'job1',
    });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      'reply-queue',
      Buffer.from(JSON.stringify(true)),
      { correlationId: 'corr-id-3' }
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it('should respond with job data when type is removeApplication', async () => {
    mockRepo.PullApplication.mockResolvedValue(true);

    let consumeCallback;
    mockChannel.consume.mockImplementation((queue, cb) => {
      consumeCallback = cb;
    });

    await service.RPCObserver(mockChannel);

    const msg = {
      content: Buffer.from(
        JSON.stringify({
          type: 'removeApplication',
          id: 'job1',
          applicationId: 'applic1',
        })
      ),
      properties: {
        replyTo: 'reply-queue',
        correlationId: 'corr-id-4',
      },
    };

    await consumeCallback(msg);

    expect(mockRepo.PullApplication).toHaveBeenCalledWith({
      id: 'job1',
      applicationId: 'applic1',
    });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      'reply-queue',
      Buffer.from(JSON.stringify(true)),
      { correlationId: 'corr-id-4' }
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });
});

describe('JobService - RPCAuthObserver', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JobService();
    mockRepo = service.jobRepository;
  });

  const mockChannel = {
    assertExchange: jest.fn().mockResolvedValue(true),
    assertQueue: jest.fn().mockResolvedValue(true),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    sendToQueue: jest.fn(),
    ack: jest.fn(),
  };

  it('Should respond with job data when type is jobId', async () => {
    const fakeJob = { _id: 'job123', title: 'developer' };
    mockRepo.GetJobByJobId.mockResolvedValue(fakeJob);

    // mock the consume callback
    let consumeCallback;
    mockChannel.consume.mockImplementation((queue, cb) => {
      consumeCallback = cb;
    });

    await service.RPCAuthObserver(mockChannel);

    // Simulate a message
    const msg = {
      content: Buffer.from(JSON.stringify({ type: 'job', id: 'job123' })),
      properties: {
        replyTo: 'reply-queue',
        correlationId: 'corr-id-1',
      },
    };

    await consumeCallback(msg);

    expect(mockRepo.GetJobByJobId).toHaveBeenCalledWith({ id: 'job123' });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      'reply-queue',
      Buffer.from(JSON.stringify(fakeJob)),
      { correlationId: 'corr-id-1' }
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it('should throw AppError if exchange setup fails', async () => {
    mockChannel.assertExchange.mockRejectedValueOnce(
      new Error('Exchange failure')
    );

    await expect(service.RPCAuthObserver(mockChannel)).rejects.toThrow(
      'Exchange failure'
    );
  });
});

describe('JobService - AddLike', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JobService();
    mockRepo = service.jobRepository;
  });

  it('Should throw error if no job found with the specific id', async () => {
    mockRepo.GetJobByJobId.mockResolvedValue(false);
    await expect(
      service.AddLike({ userId: 'u123', jobId: 'job123' })
    ).rejects.toThrow('No job found with that id!');
  });

  it('Should throw error if user already like that job', async () => {
    mockRepo.GetJobByJobId.mockResolvedValueOnce({
      title: 'job123',
      likes: ['user123'],
    });

    await expect(
      service.AddLike({ userId: 'user123', jobId: 'job123' })
    ).rejects.toThrow('User already liked this job!');
  });

  it('Should throw internal server error if add like is failed', async () => {
    mockRepo.GetJobByJobId.mockResolvedValueOnce({
      title: 'job123',
      likes: ['user123'],
    });

    mockRepo.AddLike.mockResolvedValue(false);

    await expect(
      service.AddLike({ userId: 'user456', jobId: 'job123' })
    ).rejects.toThrow('Failed to like job!');
  });

  it('Should return add like message successfully', async () => {
    mockRepo.GetJobByJobId.mockResolvedValueOnce({
      title: 'job123',
      likes: ['user123'],
    });

    mockRepo.AddLike.mockResolvedValue(true);

    const result = await service.AddLike({
      userId: 'user456',
      jobId: 'job123',
    });

    expect(result).toHaveProperty('data');
    expect(result.data).toBe('Job liked successfully!');
    expect(mockRepo.AddLike).toHaveBeenCalled();
    expect(mockRepo.GetJobByJobId).toHaveBeenCalled();
  });
});

describe('JobService - RemoveLike', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JobService();
    mockRepo = service.jobRepository;
  });

  it('Should throw error if no job was found', async () => {
    mockRepo.GetJobByJobId.mockResolvedValue(null);
    await expect(
      service.RemoveLike({ userId: 'u123', jobId: 'j123' })
    ).rejects.toThrow('No job found with that id!');
  });

  it('Should throw error if user not liked the job', async () => {
    mockRepo.GetJobByJobId.mockResolvedValueOnce({
      title: 'job',
      likes: ['not-included-123'],
      _id: 'j123',
    });

    await expect(
      service.RemoveLike({ userId: 'u123', jobId: 'j123' })
    ).rejects.toThrow(
      `You can't remove like! Since you are not liked this job`
    );
  });

  it('Should throw internal server error if remove like is failed ', async () => {
    mockRepo.GetJobByJobId.mockResolvedValueOnce({
      title: 'job',
      likes: ['u123'],
      _id: 'j123',
    });

    mockRepo.RemoveLike.mockResolvedValue(null);

    await expect(
      service.RemoveLike({ userId: 'u123', jobId: 'j123' })
    ).rejects.toThrow(`Failed to remove like`);
  });

  it('Should return remove like message successfully', async () => {
    mockRepo.GetJobByJobId.mockResolvedValueOnce({
      title: 'job123',
      likes: ['user123'],
    });

    mockRepo.RemoveLike.mockResolvedValue(true);

    const result = await service.RemoveLike({
      userId: 'user123',
      jobId: 'job123',
    });

    expect(result).toHaveProperty('data');
    expect(result.data).toBe('Like removed successfully!');
    expect(mockRepo.RemoveLike).toHaveBeenCalled();
    expect(mockRepo.GetJobByJobId).toHaveBeenCalled();
  });
});

describe('JobService - StatisticsForEmployer', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JobService();
    mockRepo = service.jobRepository;
  });

  it('Should throw error if employer ID is not found', async () => {
    await expect(
      service.StatisticsForEmployer({ employerId: null })
    ).rejects.toThrow('Employer ID is required');
  });

  it('Should throw error if No statistics found', async () => {
    mockRepo.StatisticForEmployer.mockResolvedValue(null);
    await expect(
      service.StatisticsForEmployer({ employerId: 'emp123' })
    ).rejects.toThrow('No statistics found!');
  });

  it('Should return statistic data successfully', async () => {
    mockRepo.StatisticForEmployer.mockResolvedValueOnce({
      employerId: 'emp123',
      totalJobs: [{ count: 5 }],
      totalCategory: [{ count: 8 }],
    });

    const result = await service.StatisticsForEmployer({
      employerId: 'emp123',
    });

    expect(result).toHaveProperty('data');
    expect(mockRepo.StatisticForEmployer).toHaveBeenCalled();
    expect(result.data).toMatchObject({
      employerId: 'emp123',
      totalJobs: [{ count: 5 }],
      totalCategory: [{ count: 8 }],
    });
  });
});