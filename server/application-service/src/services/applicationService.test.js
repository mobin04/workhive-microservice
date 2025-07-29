const ApplicationService = require('./applicationService');

// mock dependencies
jest.mock('../database/repository', () => ({
  ApplicationRepository: jest.fn().mockImplementation(() => ({
    CreateApplication: jest.fn(),
    GetApplicationById: jest.fn(),
    UploadResumeUrl: jest.fn(),
    ApplicByApplicantIdAndJobId: jest.fn(),
    GetApplicationsByApplicantId: jest.fn(),
    GetApplicationByIdAndApplicantId: jest.fn(),
    WithdrawApplication: jest.fn(),
    CountApplication: jest.fn(),
    GetApplicationByJobId: jest.fn(),
    UpdateApplicationStatus: jest.fn(),
    WithdrawedApplication: jest.fn(),
  })),
}));

jest.mock('../config/firebaseConfig', () => ({}));
jest.mock('../rabbitMQ/rabbitMqProvider');
jest.mock('../utils/fileUploads');
jest.mock('../utils/email');
jest.mock('../config/socket', () => ({
  notifyEmployer: jest.fn(),
  notifyApplicant: jest.fn(),
}));

const ProvideMessage = require('../rabbitMQ/rabbitMqProvider');
const handleFileUpload = require('../utils/fileUploads');
const { notifyEmployer, notifyApplicant } = require('../config/socket');
const { Email } = require('../utils');

describe('ApplicationService - CreateApplication', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ApplicationService();
    mockRepo = service.applicationRepo;
  });

  it('Should throw error if user is not a job seeker', async () => {
    await expect(
      service.CreateApplication({
        jobId: 'job1',
        userId: 'user1',
        file: {},
        currentUser: { role: 'employer' },
      })
    ).rejects.toThrow('Only job seekers can apply job');
  });

  it('Should throw error if application already exists', async () => {
    mockRepo.ApplicByApplicantIdAndJobId.mockResolvedValue(true);
    await expect(
      service.CreateApplication({
        jobId: 'job1',
        userId: 'user1',
        file: {},
        currentUser: { role: 'job_seeker' },
      })
    ).rejects.toThrow('Application already exists!');
  });

  it('Should throw error if resume is missing', async () => {
    mockRepo.ApplicByApplicantIdAndJobId.mockResolvedValue(false);
    await expect(
      service.CreateApplication({
        jobId: 'job1',
        userId: 'user1',
        file: null,
        currentUser: { role: 'job_seeker' },
      })
    ).rejects.toThrow('Resume is required! Please upload your resume');
  });

  it('Should throw error if job does not exist', async () => {
    mockRepo.ApplicByApplicantIdAndJobId.mockResolvedValue(false);
    ProvideMessage.mockResolvedValueOnce(null);
    await expect(
      service.CreateApplication({
        jobId: 'job1',
        userId: 'user1',
        file: {},
        currentUser: { role: 'job_seeker' },
      })
    ).rejects.toThrow('Job does not exist!');
  });

  it('should create application successfully', async () => {
    mockRepo.ApplicByApplicantIdAndJobId.mockResolvedValue(false);

    ProvideMessage.mockResolvedValueOnce({
      _id: 'job1',
      employer: 'emp1',
      title: 'Job Title',
      company: 'Company',
      companyLogo: 'logo.png',
    });

    const fakeSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      endSession: jest.fn(),
      abortTransaction: jest.fn(),
    };
    jest
      .spyOn(require('mongoose'), 'startSession')
      .mockResolvedValue(fakeSession);
    mockRepo.CreateApplication.mockResolvedValue({
      _id: 'app1',
      applicant: 'user1',
      job: 'job1',
    });
    handleFileUpload.uploadImage.mockResolvedValue('resumeUrl.pdf');
    mockRepo.UploadResumeUrl.mockResolvedValue({
      _id: 'app1',
      applicant: 'user1',
      job: 'job1',
      resumeUrl: 'resumeUrl.pdf',
    });
    ProvideMessage.mockResolvedValueOnce(true); // pushApplicationToJob
    ProvideMessage.mockResolvedValueOnce({
      _id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
    }); // applicantDetails
    Email.mockImplementation(() => ({
      sendApplicationStatusUpdate: jest.fn().mockResolvedValue(true),
    }));

    // Act
    const result = await service.CreateApplication({
      jobId: 'job1',
      userId: 'user1',
      file: { originalname: 'resume.pdf' },
      currentUser: { role: 'job_seeker' },
    });

    // Assert
    expect(result).toHaveProperty('data');
    expect(mockRepo.CreateApplication).toHaveBeenCalled();
    expect(handleFileUpload.uploadImage).toHaveBeenCalled();
    expect(ProvideMessage).toHaveBeenCalled();
    expect(Email).toHaveBeenCalled();
    expect(notifyEmployer).toHaveBeenCalled();
  });
});

describe('ApplicationService - GetApplicationByApplicantId', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ApplicationService();
    mockRepo = service.applicationRepo;
  });

  it('Should throw error if no application is found', async () => {
    mockRepo.GetApplicationsByApplicantId.mockResolvedValue(false);
    await expect(
      service.GetApplicationByApplicantId({ id: 'applicantID' })
    ).rejects.toThrow('No application found with that ID!');
  });

  it('Should get application and count successfully', async () => {
    mockRepo.GetApplicationsByApplicantId.mockResolvedValueOnce({
      _id: 'applic123',
      applicant: 'User1',
      resumeUrl: 'resume.url',
    });

    mockRepo.CountApplication.mockResolvedValueOnce(1);

    const result = await service.GetApplicationByApplicantId({
      id: 'applic123',
    });

    expect(result).toHaveProperty('data.application');
    expect(result.data.countApplication).toBe(1);
    expect(result.data.application._id).toBe('applic123');
  });
});

describe('ApplicationService - GetApplicationsByJobId', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ApplicationService();
    mockRepo = service.applicationRepo;
  });

  it('Should throw error if job not found', async () => {
    ProvideMessage.mockResolvedValueOnce(null); // job not found
    await expect(
      service.GetApplicationByJobId({
        jobId: 'job1',
        currentUser: { _id: 'emp1', role: 'employer' },
        reqQuery: {},
      })
    ).rejects.toThrow('No job found with that ID');
  });

  it('Should throw error if user is not allowed', async () => {
    ProvideMessage.mockResolvedValueOnce({ _id: '123', employer: 'emp1' });
    await expect(
      service.GetApplicationByJobId({
        jobId: '123',
        currentUser: { _id: 'notemp', role: 'job_seeker' },
        reqQuery: {},
      })
    ).rejects.toThrow(
      'You are not allowed to view the applications belong to that job'
    );
  });

  it('Should throw error if no application found', async () => {
    ProvideMessage.mockResolvedValueOnce({ _id: '123', employer: 'emp1' });
    mockRepo.GetApplicationByJobId.mockResolvedValue(null);
    await expect(
      service.GetApplicationByJobId({
        jobId: '123',
        currentUser: { _id: 'emp1', role: 'employer' },
        reqQuery: {},
      })
    ).rejects.toThrow('No application found');
  });

  it('Should throw error if employer details is not found', async () => {
    ProvideMessage.mockResolvedValueOnce({ _id: '123', employer: 'emp1' });
    mockRepo.GetApplicationByJobId.mockResolvedValue([{}]);
    ProvideMessage.mockResolvedValue(null);
    await expect(
      service.GetApplicationByJobId({
        jobId: '123',
        currentUser: { _id: 'emp1', role: 'employer' },
        reqQuery: {},
      })
    ).rejects.toThrow('Employer details not found!');
  });

  it('Should get formatted data successfully', async () => {
    // Mock job
    ProvideMessage.mockResolvedValueOnce({
      _id: 'job1',
      employer: 'emp1',
      companyLogo: 'logo',
      title: 'title',
      company: 'company',
      location: 'loc',
      geoLocation: 'geo',
    });
    // Mock application
    mockRepo.GetApplicationByJobId.mockResolvedValueOnce([
      { _id: 'applic123', applicant: 'User1', foo: 'bar' },
      { _id: 'applic456', applicant: 'User2', foo: 'baz' },
    ]);

    // Mock employer
    ProvideMessage.mockResolvedValueOnce({ _id: 'emp1', name: 'employer' });

    // Mock applicants
    ProvideMessage.mockResolvedValueOnce({ _id: 'user1', name: 'User1' });
    ProvideMessage.mockResolvedValueOnce({ _id: 'user2', name: 'User2' });

    const result = await service.GetApplicationByJobId({
      jobId: 'job1',
      currentUser: { _id: 'emp1', role: 'employer' },
      reqQuery: {},
    });

    expect(result).toHaveProperty('data.job');
    expect(result.data.job.totalApplication).toBe(2);
    expect(result.data.job.application[0].applicant.name).toBe('User1');
    expect(result.data.job.application[1].applicant.name).toBe('User2');
  });
});

describe('ApplicationService - UpdateApplicationStatus', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ApplicationService();
    mockRepo = service.applicationRepo;
  });

  it('Should throw error if status not be accepted or rejected', async () => {
    await expect(
      service.UpdateApplicationStatus({
        id: 'applic1',
        status: 'pending',
        currentUser: {},
      })
    ).rejects.toThrow('Status must be accepted or rejected');
  });

  it('Should throw error if no application found', async () => {
    mockRepo.GetApplicationById.mockResolvedValue(null);
    await expect(
      service.UpdateApplicationStatus({
        id: 'applic1',
        status: 'accepted',
        currentUser: {},
      })
    ).rejects.toThrow('No application found with that ID!');
  });

  it('Should throw error if user is not allowed', async () => {
    mockRepo.GetApplicationById.mockResolvedValueOnce({
      _id: 'applic1',
      job: 'job1',
      foo: 'bar',
    });
    ProvideMessage.mockResolvedValueOnce({
      _id: 'job1',
      employer: 'emp1',
      foo: 'bar',
    });
    await expect(
      service.UpdateApplicationStatus({
        id: 'applic1',
        status: 'accepted',
        currentUser: { _id: 'emp2' },
      })
    ).rejects.toThrow('You are not allowed to update this application!');
  });

  it('Should throw error if No applicant found belong to the application', async () => {
    mockRepo.GetApplicationById.mockResolvedValueOnce({
      _id: 'applic1',
      job: 'job1',
    });
    ProvideMessage.mockResolvedValueOnce({
      _id: 'job1',
      employer: 'emp1',
    });
    mockRepo.UpdateApplicationStatus.mockResolvedValueOnce({
      _id: 'applic123',
      foo: 'bar',
    });
    ProvideMessage.mockResolvedValue(null);
    await expect(
      service.UpdateApplicationStatus({
        id: 'applic1',
        status: 'accepted',
        currentUser: { _id: 'emp1' },
      })
    ).rejects.toThrow('No applicant found belong to that application!');
  });

  it('Should get updated application data successfully', async () => {
    mockRepo.GetApplicationById.mockResolvedValueOnce({
      _id: 'applic1',
      job: 'job1',
    });
    ProvideMessage.mockResolvedValueOnce({
      _id: 'job1',
      employer: 'emp1',
    });
    mockRepo.UpdateApplicationStatus.mockResolvedValueOnce({
      _id: 'applic123',
      foo: 'bar',
    });
    ProvideMessage.mockResolvedValue({
      _id: 'applicant1',
      name: 'User',
      email: 'user@ex',
    });
    Email.mockImplementation(() => ({
      sendApplicationStatusUpdate: jest.fn().mockResolvedValue(true),
    }));

    const result = await service.UpdateApplicationStatus({
      id: 'applic1',
      status: 'accepted',
      currentUser: { _id: 'emp1' },
    });

    expect(result.data).toHaveProperty('updatedApplication');
    expect(result.data.updatedApplication._id).toBe('applic123');
    expect(result.data).toHaveProperty('applicant');
    expect(result.data.applicant._id).toBe('applicant1');
    expect(Email).toHaveBeenCalled();
    expect(notifyApplicant).toHaveBeenCalled();
  });
});

describe('ApplicationService - WithdrawApplication', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ApplicationService();
    mockRepo = service.applicationRepo;
  });

  it('Should throw error if no application found', async () => {
    mockRepo.GetApplicationByIdAndApplicantId.mockResolvedValue(null);
    await expect(
      service.WithdrawApplication({
        id: 'applic123',
        currentUserId: 'user123',
      })
    ).rejects.toThrow('No application found with that ID!');
  });

  it('Should throw error is application is already withdrawn', async () => {
    mockRepo.GetApplicationByIdAndApplicantId.mockResolvedValue({
      _id: 'applic123',
      activeStatus: 'withdrawn',
    });
    await expect(
      service.WithdrawApplication({
        id: 'applic123',
        currentUserId: 'user123',
      })
    ).rejects.toThrow('Already withdrawned this application!');
  });

  it('Should throw error if application status is not pending', async () => {
    mockRepo.GetApplicationByIdAndApplicantId.mockResolvedValue({
      _id: 'applic123',
      activeStatus: 'active',
      status: 'withdrawn',
    });
    await expect(
      service.WithdrawApplication({
        id: 'applic123',
        currentUserId: 'user123',
      })
    ).rejects.toThrow('You can only withdraw the pending applications');
  });

  it('Should throw error if error occour when removing application from job', async () => {
    mockRepo.GetApplicationByIdAndApplicantId.mockResolvedValue({
      _id: 'applic123',
      activeStatus: 'active',
      status: 'pending',
    });
    ProvideMessage.mockResolvedValue(null);
    await expect(
      service.WithdrawApplication({
        id: 'applic123',
        currentUserId: 'user123',
      })
    ).rejects.toThrow('Error occour while removing application from job');
  });

  it('Should throw error if error occour while withdraw application', async () => {
    mockRepo.GetApplicationByIdAndApplicantId.mockResolvedValueOnce({
      _id: 'applic123',
      activeStatus: 'active',
      status: 'pending',
    });
    ProvideMessage.mockResolvedValue(true);
    mockRepo.WithdrawApplication.mockResolvedValue(null);

    await expect(
      service.WithdrawApplication({
        id: 'applic123',
        currentUserId: 'user123',
        status: 'accepted',
      })
    ).rejects.toThrow('Error withdrawn application!');
  });

  it('Should get withdrawned application successfully', async () => {
    mockRepo.GetApplicationByIdAndApplicantId.mockResolvedValueOnce({
      _id: 'applic123',
      activeStatus: 'active',
      status: 'pending',
    });
    ProvideMessage.mockResolvedValue(true);
    mockRepo.WithdrawApplication.mockResolvedValueOnce({
      _id: 'applic123',
      activeStatus: 'withdrawn',
      status: 'withdrawn',
    });

    const result = await service.WithdrawApplication({
      id: 'applic123',
      currentUserId: 'user123',
      status: 'accepted',
    });
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('_id');
    expect(result.data).toHaveProperty('status');
    expect(result.data).toHaveProperty('activeStatus');
  });
});

describe('ApplicationService - GetWithdrawnedApplication', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ApplicationService();
    mockRepo = service.applicationRepo;
  });

  it('should return false if no applications are found', async () => {
    mockRepo.WithdrawedApplication.mockResolvedValue({
      application: null,
    });

    const result = await service.GetWithdrawnedApplication({
      reqQuery: {},
      applicantId: 'user1',
    });

    expect(result).toBe(false);
  });

  it('should return formatted application info with job details', async () => {
    const mockApplication = [{ _id: 'app1', applicant: 'user1', job: 'job1' }];

    mockRepo.WithdrawedApplication.mockResolvedValue({
      application: mockApplication,
    });

    const mockJob = {
      _id: 'job1',
      company: 'Company',
      title: 'Title',
      location: 'Location',
      employer: 'employer1',
    };

    ProvideMessage.mockResolvedValueOnce(mockJob);

    const result = await service.GetWithdrawnedApplication({
      reqQuery: {},
      applicantId: 'user1',
    });

    expect(result).toHaveProperty('data.applicationInfo');
    expect(result.data.applicationInfo[0]).toMatchObject({
      _id: 'app1',
      jobDetails: {
        job: mockJob,
      },
    });
  });

  it('should throw AppError if ProvideMessage fails', async () => {
    const mockApplication = [{ _id: 'app1', applicant: 'user1', job: 'job1' }];

    mockRepo.WithdrawedApplication.mockResolvedValue({
      application: mockApplication,
    });

    ProvideMessage.mockRejectedValueOnce(new Error('RPC failure'));

    await expect(
      service.GetWithdrawnedApplication({
        reqQuery: {},
        applicantId: 'user1',
      })
    ).rejects.toThrow('RPC failure');
  });
});

// describe('ApplicationService - GetWithdrawnedApplication', () => {
//   let service;
//   let mockRepo;

//   beforeEach(() => {
//     jest.clearAllMocks();
//     service = new ApplicationService();
//     mockRepo = service.applicationRepo;
//   });

//   it('Should return false if no applications found', async () => {
//     mockRepo.WithdrawedApplication.mockResolvedValue({
//       application: null,
//       applicationCount: 0,
//     });
//     const result = await service.GetWithdrawnedApplication({ reqQuery: {} });
//     expect(result).toBe(false);
//   });

//   it('should return formatted data if applications found', async () => {
//     // Mock application data
//     mockRepo.WithdrawedApplication.mockResolvedValue({
//       application: [{ _id: 'app1', applicant: 'user1', job: 'job1' }],
//       applicationCount: 1,
//     });

//     ProvideMessage.mockResolvedValueOnce({
//       _id: 'user1',
//       name: 'User1',
//       email: 'user1@ex.com',
//       coverImage: 'img1',
//     }) // applicant
//       .mockResolvedValueOnce({
//         _id: 'job1',
//         company: 'Company',
//         title: 'Title',
//         location: 'Loc',
//         employer: 'emp1',
//       }) // job
//       .mockResolvedValueOnce({
//         _id: 'emp1',
//         name: 'Employer',
//         email: 'emp@ex.com',
//         coverImage: 'img2',
//       }); // employer

//     const result = await service.GetWithdrawnedApplication({ reqQuery: {} });

//     expect(result).toHaveProperty('data.applicationInfo');
//     expect(result.data.applicationInfo[0]).toMatchObject({
//       _id: 'app1',
//       applicant: {
//         id: 'user1',
//         name: 'User1',
//         email: 'user1@ex.com',
//         coverImage: 'img1',
//       },
//       jobDetails: {
//         id: 'job1',
//         company: 'Company',
//         title: 'Title',
//         location: 'Loc',
//         employer: {
//           id: 'emp1',
//           name: 'Employer',
//           email: 'emp@ex.com',
//           coverImage: 'img2',
//         },
//       },
//     });
//     expect(result.data.applicationCount).toBe(1);
//   });

//   it('should throw AppError if ProvideMessage throws', async () => {
//     mockRepo.WithdrawedApplication.mockResolvedValue({
//       application: [{ _id: 'app1', applicant: 'user1', job: 'job1' }],
//       applicationCount: 1,
//     });

//     ProvideMessage.mockRejectedValueOnce(new Error('RPC error'));

//     await expect(
//       service.GetWithdrawnedApplication({ reqQuery: {} })
//     ).rejects.toThrow('RPC error');
//   });
// });
