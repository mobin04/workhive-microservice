const AuthService = require('./authService');
const jwt = require('jsonwebtoken');

jest.mock('../database', () => ({
  AuthRepository: jest.fn().mockImplementation(() => ({
    FindByEmail: jest.fn(),
    FindByEmailAndGetPassword: jest.fn(),
    FindById: jest.fn(),
    CreateUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    GetUserStatistics: jest.fn(),
    SaveJob: jest.fn(),
    PullSavedJob: jest.fn(),
  })),
}));

jest.mock('jsonwebtoken');
jest.mock('../config/firebaseConfig', () => ({}));
jest.mock('../utils/fileUploads');
jest.mock('../utils/email');
jest.mock('../rabbitMqConnection/rabbitMqProvider');

const handleFileUpload = require('../utils/fileUploads');
const { Email } = require('../utils');
const provider = require('../rabbitMqConnection/rabbitMqProvider');

describe('AuthService - RequestSignupOTP', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;
  });

  it('should throw error if user already exists', async () => {
    mockRepo.FindByEmail.mockResolvedValueOnce({
      _id: 'user1',
      email: 'test@example.com',
    });

    await expect(
      service.RequestSignupOTP({
        name: 'Test',
        email: 'test@example.com',
        password: 'pass',
        role: 'user',
      })
    ).rejects.toThrow('Email already exist!');
  });

  it('should send OTP email and return formatted data for new user', async () => {
    mockRepo.FindByEmail.mockResolvedValueOnce(null);
    service.authConfig.generateOTP = jest.fn().mockReturnValue({
      otpSecret: 'secret123',
      otpToken: '123456',
    });
    Email.mockImplementation(() => ({
      sendOtpEmail: jest.fn().mockResolvedValue(true),
    }));

    const result = await service.RequestSignupOTP({
      name: 'Test',
      email: 'test@example.com',
      password: 'pass',
      role: 'user',
    });

    expect(Email).toHaveBeenCalled();
    expect(result).toHaveProperty('data.user');
    expect(result.data).toHaveProperty('user');
    expect(result.data.user).toMatchObject({
      name: 'Test',
      email: 'test@example.com',
      password: 'pass',
      role: 'user',
      otpSecret: 'secret123',
      authType: 'signup',
    });
  });
});

describe('AuthService - RequestLoginOTP', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;
  });

  it('Should throw error if user does not exist ', async () => {
    mockRepo.FindByEmailAndGetPassword.mockResolvedValue(null);
    await expect(
      service.RequestLoginOTP({ email: 'test@example.com', password: '1234' })
    ).rejects.toThrow('User does not exist');
  });

  it('Should throw error if password are incorrect', async () => {
    const fakeUser = {
      isPasswordCorrect: jest.fn().mockResolvedValueOnce(false),
    };
    mockRepo.FindByEmailAndGetPassword.mockResolvedValueOnce(fakeUser);
    await expect(
      service.RequestLoginOTP({
        email: 'test@example.com',
        password: 'wrongpass',
      })
    ).rejects.toThrow('Incorrect email or password!');
  });

  it('Should send OTP email and return formatted data for correct credentials', async () => {
    const fakeUser = {
      isPasswordCorrect: jest.fn().mockResolvedValueOnce(true),
      toObject: jest.fn().mockReturnValue({
        _id: 'user1',
        email: 'test@example.com',
        name: 'test',
        password: 'gods know',
        role: 'user',
      }),
      password: 'gods know',
    };
    mockRepo.FindByEmailAndGetPassword.mockResolvedValueOnce(fakeUser);

    service.authConfig.generateOTP = jest.fn().mockReturnValue({
      otpSecret: 'secret123',
      otpToken: 'token123',
    });

    Email.mockImplementation(() => ({
      sendLoginOtpEmail: jest.fn().mockResolvedValue(true),
    }));

    const result = await service.RequestLoginOTP({
      email: 'test@example.com',
      password: 'gods know',
    });

    expect(Email).toHaveBeenCalled();
    expect(result).toHaveProperty('data.user');
    expect(result.data).toHaveProperty('user');
    expect(result.data.user).toMatchObject({
      _id: 'user1',
      email: 'test@example.com',
      name: 'test',
      role: 'user',
      otpSecret: 'secret123',
    });
  });
});

describe('AuthService - VerifyOTP', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;
    service.authConfig.otpVerification = jest.fn();
  });

  it('Should thow error if mode is not login or signup', async () => {
    await expect(
      service.VerifyOTP({
        otp: '99999',
        mode: 'feel-sad',
        token: '87mojkxc',
      })
    ).rejects.toThrow(`Please use either 'login' or 'signup' mode`);
  });

  it('Should throw error if OTP is invaid or expired', async () => {
    jwt.verify.mockReturnValue({ otpSecret: 'secret' });
    service.authConfig.otpVerification.mockReturnValue(false);

    await expect(
      service.VerifyOTP({
        otp: '999999',
        mode: 'login',
        token: '87mojkxc',
      })
    ).rejects.toThrow('Invalid or Expired OTP');
  });

  it('Should throw error if signup mode but authType is not signup', async () => {
    jwt.verify.mockReturnValue({ otpSecret: 'secret', authType: 'login' });
    service.authConfig.otpVerification.mockReturnValue(true);
    await expect(
      service.VerifyOTP({
        otp: '999999',
        mode: 'signup',
        token: '87mojkxc',
      })
    ).rejects.toThrow(
      `You are trying to login! Please use the mode to 'login'`
    );
  });

  it('Should create user and send welcome email on successful signup', async () => {
    jwt.verify.mockReturnValue({
      otpSecret: 'secret',
      authType: 'signup',
      name: 'Test',
      email: 'test@example.com',
      password: 'pass',
      role: 'user',
    });

    service.authConfig.otpVerification.mockReturnValue(true);
    const fakeUser = { _id: 'user1', name: 'Test', email: 'test@example.com' };
    mockRepo.CreateUser.mockResolvedValueOnce(fakeUser);

    Email.mockImplementation(() => ({
      sendWelcome: jest.fn().mockResolvedValue(true),
    }));

    const result = await service.VerifyOTP({
      otp: '123456',
      mode: 'signup',
      token: 'token',
    });

    expect(mockRepo.CreateUser).toHaveBeenCalledWith({
      name: 'Test',
      email: 'test@example.com',
      password: 'pass',
      role: 'user',
    });
    expect(Email).toHaveBeenCalled();
    expect(result).toHaveProperty('data');
    expect(result.data.loggingUser).toMatchObject(fakeUser);
  });

  it('Should throw error if login mode but authType is not login', async () => {
    jwt.verify.mockReturnValue({
      otpSecret: 'secret',
      authType: 'signup',
      userId: 'user1',
    });
    service.authConfig.otpVerification.mockReturnValue(true);

    await expect(
      service.VerifyOTP({ otp: '123456', mode: 'login', token: 'token' })
    ).rejects.toThrow(
      "You are trying to signup! Please select mode to 'signup'"
    );
  });

  it('Should return user data on successful login', async () => {
    jwt.verify.mockReturnValue({
      otpSecret: 'secret',
      authType: 'login',
      userId: 'user1',
    });
    service.authConfig.otpVerification.mockReturnValue(true);

    const fakeUser = { _id: 'user1', name: 'Test', email: 'test@example.com' };
    mockRepo.FindById.mockResolvedValueOnce(fakeUser);

    const result = await service.VerifyOTP({
      otp: '123456',
      mode: 'login',
      token: 'token',
    });

    expect(mockRepo.FindById).toHaveBeenCalledWith({ id: 'user1' });
    expect(result).toHaveProperty('data.loggingUser');
    expect(result.data).toHaveProperty('loggingUser');
    expect(result.data.loggingUser).toMatchObject(fakeUser);
  });
});

describe('AuthService - GetProfile', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;
  });

  it('Should throw error if no ID provide', async () => {
    await expect(
      service.GetProfile({
        id: null,
      })
    ).rejects.toThrow('Please provide your ID');
  });

  it('Should throw error if user not found', async () => {
    mockRepo.FindById.mockResolvedValue(null);
    await expect(
      service.GetProfile({
        id: 'user123',
      })
    ).rejects.toThrow('User not found belong to that ID');
  });

  it('Should get formated data successfully', async () => {
    mockRepo.FindById.mockResolvedValueOnce({
      _id: 'user123',
      name: 'user',
      email: 'user@exaple.com',
      role: 'job_seeker',
    });

    const result = await service.GetProfile({ id: 'user123' });

    expect(result).toHaveProperty('data.user');
    expect(result.data).toHaveProperty('user');
    expect(result.data.user).toMatchObject({
      _id: 'user123',
      name: 'user',
      email: 'user@exaple.com',
      role: 'job_seeker',
    });
  });
});

describe('AuthService - UpdateProfile', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;
  });

  it('Should update profile without file', async () => {
    mockRepo.updateUser.mockResolvedValue({
      _id: 'user123',
      name: 'Test',
      email: 'test@ex.com',
    });

    const result = await service.UpdateProfile({
      reqObj: { name: 'Test', email: 'test@ex.com' },
      file: null,
      id: 'user123',
    });

    expect(mockRepo.updateUser).toHaveBeenCalledWith({
      userId: 'user123',
      filteredProperty: { name: 'Test', email: 'test@ex.com' },
    });
    expect(result).toHaveProperty('data.user');
    expect(result.data).toHaveProperty('user');
    expect(result.data.user).toMatchObject({
      _id: 'user123',
      name: 'Test',
      email: 'test@ex.com',
    });
  });

  it('Should update profile with file', async () => {
    handleFileUpload.deleteImage.mockResolvedValue(true);
    handleFileUpload.uploadImage.mockResolvedValue('cover.jpg');
    mockRepo.updateUser.mockResolvedValue({
      _id: 'user1',
      name: 'Test',
      email: 'test@ex.com',
      coverImage: 'cover.jpg',
    });

    const result = await service.UpdateProfile({
      reqObj: { name: 'Test', email: 'test@ex.com' },
      file: { originalname: 'file.jpg' },
      id: 'user1',
    });

    expect(handleFileUpload.deleteImage).toHaveBeenCalledWith(
      'coverImage',
      'user1'
    );
    expect(handleFileUpload.uploadImage).toHaveBeenCalledWith(
      { originalname: 'file.jpg' },
      'coverImage',
      'user1'
    );
    expect(mockRepo.updateUser).toHaveBeenCalledWith({
      userId: 'user1',
      filteredProperty: {
        name: 'Test',
        email: 'test@ex.com',
        coverImage: 'cover.jpg',
      },
    });
    expect(result).toHaveProperty('data.user');
    expect(result.data).toHaveProperty('user');
    expect(result.data.user.coverImage).toBe('cover.jpg');
  });

  it('Should throw error if updateUser returns null', async () => {
    mockRepo.updateUser = jest.fn().mockResolvedValue(null);

    await expect(
      service.UpdateProfile({
        reqObj: { name: 'Test', email: 'test@ex.com' },
        file: null,
        id: 'user1',
      })
    ).rejects.toThrow('Error occour while updating profile!');
  });
});

describe('AuthService - getUserById', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;
  });

  it('Should throw error if user not found', async () => {
    mockRepo.FindById.mockResolvedValue(null);
    await expect(
      service.getUserById({
        id: '',
      })
    ).rejects.toThrow('User not found!');
  });

  it('Should return user data successfully', async () => {
    mockRepo.FindById.mockResolvedValueOnce({
      _id: 'user123',
      name: 'test',
      email: 'test@ex.com',
      role: 'job_seeker',
    });
    const result = await service.getUserById({
      id: 'user123',
    });

    expect(result).toHaveProperty('data');
    expect(mockRepo.FindById).toHaveBeenCalledWith({ id: 'user123' });
    expect(result.data).toMatchObject({
      _id: 'user123',
      name: 'test',
      email: 'test@ex.com',
      role: 'job_seeker',
    });
  });
});

describe('AuthService - GetUserStatistics', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;
  });

  it('Should throw error if no user found', async () => {
    mockRepo.GetUserStatistics.mockResolvedValueOnce([]);
    await expect(service.GetUserStatistics()).rejects.toThrow(
      'No users found!'
    );
  });

  it('Should return user statistics successfully', async () => {
    mockRepo.GetUserStatistics.mockResolvedValueOnce([
      {
        role: 'job_seeker',
        totalUsers: 20,
      },
      {
        role: 'employer',
        totalUsers: 30,
      },
      {
        role: 'admin',
        totalUsers: 2,
      },
    ]);

    const result = await service.GetUserStatistics();

    expect(result).toHaveProperty('data');
    expect(mockRepo.GetUserStatistics).toHaveBeenCalled();
    expect(result.data).toMatchObject([
      {
        role: 'job_seeker',
        totalUsers: 20,
      },
      {
        role: 'employer',
        totalUsers: 30,
      },
      {
        role: 'admin',
        totalUsers: 2,
      },
    ]);
  });
});

describe('AuthService - RequestLoginLink', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;
  });

  it('should throw error if user does not exist', async () => {
    mockRepo.FindByEmail.mockResolvedValueOnce(null);

    await expect(
      service.RequestLoginLink({ email: 'notfound@example.com' })
    ).rejects.toThrow('User does not exist');
  });

  it('should send magic link if user exists', async () => {
    const fakeUser = { _id: 'user1', email: 'test@example.com' };
    mockRepo.FindByEmail.mockResolvedValueOnce(fakeUser);

    const fakeToken = 'faketoken';
    jest.spyOn(jwt, 'sign').mockReturnValue(fakeToken);
    Email.mockImplementation(() => ({
      sendMagicLink: jest.fn().mockResolvedValue(true),
    }));

    const result = await service.RequestLoginLink({
      email: 'test@example.com',
    });

    expect(Email).toHaveBeenCalledWith(
      fakeUser,
      `${process.env.FRONTEND_URL}/magic-login?token=${fakeToken}`,
      {}
    );
    expect(result).toHaveProperty(
      'data.message',
      'login link sent to your email.'
    );
  });
});

describe('AuthService - ResentOtp', () => {
  let service;
  let mockRepo;
  let AuthConfigMock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;

    // Mock generateOTP
    AuthConfigMock = service.authConfig;
    AuthConfigMock.generateOTP = jest.fn().mockReturnValue({
      otpSecret: 'mockOtpSecret',
      otpToken: '123456',
    });

    // Mock Email sending
    Email.mockImplementation(() => ({
      sendOtpEmail: jest.fn().mockResolvedValue(true),
      sendLoginOtpEmail: jest.fn().mockResolvedValue(true),
    }));
  });

  it('should resend OTP for signup flow with valid token', async () => {
    const mockDecoded = {
      name: 'Mobin',
      email: 'mobin@example.com',
      password: 'secret',
      role: 'user',
      authType: 'signup',
    };

    jwt.verify.mockReturnValue(mockDecoded);

    const response = await service.ResentOtp({
      token: 'validToken',
      mode: 'signup',
    });

    expect(AuthConfigMock.generateOTP).toHaveBeenCalled();
    expect(jwt.verify).toHaveBeenCalledWith(
      'validToken',
      process.env.JWT_SECRET
    );
    expect(response.data.user).toMatchObject({
      name: 'Mobin',
      email: 'mobin@example.com',
      role: 'user',
      authType: 'signup',
      otpSecret: 'mockOtpSecret',
    });
  });

  it('should resend OTP for login flow with valid token and userId', async () => {
    const mockDecoded = {
      userId: 'user123',
      authType: 'login',
    };

    const mockUser = {
      _id: 'user123',
      email: 'mobin@example.com',
      name: 'Mobin',
    };
    mockRepo.FindById = jest.fn().mockResolvedValue(mockUser);
    jwt.verify.mockReturnValue(mockDecoded);

    const response = await service.ResentOtp({
      token: 'validLoginToken',
      mode: 'login',
    });

    expect(mockRepo.FindById).toHaveBeenCalledWith({ id: 'user123' });
    expect(response.data.user).toMatchObject({
      _id: 'user123',
      email: 'mobin@example.com',
      otpSecret: 'mockOtpSecret',
    });
  });

  it('should throw AppError for invalid mode', async () => {
    await expect(
      service.ResentOtp({ token: 'x', mode: 'invalid' })
    ).rejects.toThrow('Please select the mode either signup or login');
  });

  it('should throw AppError for missing token', async () => {
    await expect(
      service.ResentOtp({ token: '', mode: 'signup' })
    ).rejects.toThrow('Invalid or expired token!');
  });

  it('should throw AppError if user not found during login flow', async () => {
    const mockDecoded = { userId: 'user123', authType: 'login' };
    jwt.verify.mockReturnValue(mockDecoded);
    mockRepo.FindById = jest.fn().mockResolvedValue(null);

    await expect(
      service.ResentOtp({ token: 'x', mode: 'login' })
    ).rejects.toThrow('User not found!');
  });
});

describe('AuthService - VerifyLoginLink', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;
  });

  it('should throw error if authType is not magic-link', async () => {
    jest
      .spyOn(jwt, 'verify')
      .mockReturnValue({ authType: 'other', userId: 'user1' });

    await expect(
      service.VerifyLoginLink({ token: 'badtoken' })
    ).rejects.toThrow('Invalid login link');
  });

  it('should return user if token is valid and user exists', async () => {
    jest
      .spyOn(jwt, 'verify')
      .mockReturnValue({ authType: 'magic-link', userId: 'user1' });
    const fakeUser = { _id: 'user1', email: 'test@example.com' };
    mockRepo.FindById.mockResolvedValueOnce(fakeUser);

    const result = await service.VerifyLoginLink({ token: 'goodtoken' });

    expect(mockRepo.FindById).toHaveBeenCalledWith({ id: 'user1' });
    expect(result).toHaveProperty('data.user', fakeUser);
  });
});

describe('AuthService - RPCObserver', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;
  });

  it('should respond with user data when type is userId', async () => {
    // Use the service and mockRepo from beforeEach
    const mockChannel = {
      assertQueue: jest.fn().mockResolvedValue(true),
      bindQueue: jest.fn(),
      consume: jest.fn(),
      sendToQueue: jest.fn(),
      ack: jest.fn(),
    };
    const fakeUser = { _id: 'user123', name: 'Test User' };
    mockRepo.FindById.mockResolvedValue(fakeUser);

    // Simulate the consume callback
    let consumeCallback;
    mockChannel.consume.mockImplementation((queue, cb) => {
      consumeCallback = cb;
    });

    await service.RPCObserver(mockChannel);

    // Simulate a message
    const msg = {
      content: Buffer.from(JSON.stringify({ type: 'userId', id: 'user123' })),
      properties: {
        replyTo: 'reply-queue',
        correlationId: 'corr-id-1',
      },
    };

    // Call the consume callback as if a message arrived
    await consumeCallback(msg);

    expect(mockRepo.FindById).toHaveBeenCalledWith({ id: 'user123' });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      'reply-queue',
      Buffer.from(JSON.stringify(fakeUser)),
      { correlationId: 'corr-id-1' }
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });
});

describe('AuthService - SaveJob', () => {
  let service;
  let mockRepo;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;
  });

  it('Should throw error if no user found with the id', async () => {
    mockRepo.FindById.mockResolvedValue(null);
    await expect(service.SaveJob({ userId: 'user123' })).rejects.toThrow(
      'No user found with that id!'
    );
  });

  it('Should throw error if user is not job_seeker', async () => {
    mockRepo.FindById.mockResolvedValueOnce({
      name: 'user',
      id: 'u123',
      role: 'employer',
    });
    await expect(service.SaveJob({ userId: 'u123' })).rejects.toThrow(
      'Only job seeker can save jobs'
    );
  });

  it('Should throw error if job not found', async () => {
    mockRepo.FindById.mockResolvedValueOnce({
      name: 'user',
      id: 'u123',
      role: 'job_seeker',
    });

    provider.mockResolvedValue(null);

    expect(service.SaveJob({ userId: 'u123' })).rejects.toThrow(
      'No job found with that id'
    );
  });

  it('Should throw error if user already saved the job', async () => {
    mockRepo.FindById.mockResolvedValueOnce({
      name: 'user',
      id: 'u123',
      role: 'job_seeker',
      savedJobs: ['job123'],
    });

    provider.mockResolvedValueOnce({ title: 'testJob', _id: 'job123' });

    await expect(
      service.SaveJob({ userId: 'u123', jobId: 'job123' })
    ).rejects.toThrow('Already saved this job');
  });

  it('Should return data successfully', async () => {
    mockRepo.FindById.mockResolvedValueOnce({
      name: 'user',
      id: 'u123',
      role: 'job_seeker',
      savedJobs: [],
    });

    provider.mockResolvedValueOnce({ title: 'testJob', _id: 'job123' });

    mockRepo.SaveJob.mockResolvedValueOnce({
      name: 'user',
      id: 'u123',
      role: 'job_seeker',
      savedJobs: ['job123'],
    });

    const result = await service.SaveJob({
      userId: 'u123',
      jobId: 'job123',
    });

    expect(result).toHaveProperty('data');
    expect(provider).toHaveBeenCalled();
    expect(mockRepo.FindById).toHaveBeenCalled();
    expect(mockRepo.SaveJob).toHaveBeenCalled();
    expect(result.data.savedJobs[0]).toBe('job123');
    expect(result.data).toMatchObject({
      name: 'user',
      id: 'u123',
      role: 'job_seeker',
      savedJobs: ['job123'],
    });
  });
});

describe('AuthService - GetSavedJobs', () => {
  let service;
  let mockRepo;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;
  });

  it('Should throw error if user not found with that id', async () => {
    mockRepo.FindById.mockResolvedValue(null);
    await expect(service.GetSavedJobs({ userId: 'u123' })).rejects.toThrow(
      'No user found with that id!'
    );
  });

  it('Should return saved jobs successfully', async () => {
    mockRepo.FindById.mockResolvedValueOnce({
      _id: 'u123',
      name: 'john',
      role: 'job_seeker',
      savedJobs: ['job123'],
    });

    provider.mockResolvedValueOnce({ title: 'testjob', _id: 'job123' });

    const result = await service.GetSavedJobs({
      userId: 'u123',
      jobId: 'job123',
    });

    expect(result).toHaveProperty('data');
    expect(mockRepo.FindById).toHaveBeenCalled();
    expect(provider).toHaveBeenCalled();
    expect(result.data).toMatchObject([{ title: 'testjob', _id: 'job123' }]);
  });
});

describe('AuthService - RemoveSavedJobs', () => {
  let service;
  let mockRepo;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;
  });

  it('Should throw error if user not found', async () => {
    mockRepo.FindById.mockResolvedValue(null);
    await expect(service.RemoveSavedJobs({ userId: 'u123' })).rejects.toThrow(
      'User not found!'
    );
  });

  it('Should throw error if no job found', async () => {
    mockRepo.FindById.mockResolvedValueOnce({
      name: 'john',
      _id: 'u123',
      role: 'job_seeker',
      savedJobs: [],
    });

    mockRepo.PullSavedJob.mockResolvedValue(null);
    await expect(
      service.RemoveSavedJobs({ userId: 'u123', job: 'job123' })
    ).rejects.toThrow('No job found with that job id!');
  });

  it('Should remove job successfully', async () => {
    mockRepo.FindById.mockResolvedValueOnce({
      name: 'john',
      _id: 'u123',
      role: 'job_seeker',
      savedJobs: [],
    });

    mockRepo.PullSavedJob.mockResolvedValueOnce(true);

    const result = await service.RemoveSavedJobs({
      userId: 'u123',
      jobId: 'job123',
    });

    expect(result).toHaveProperty('data');
    expect(result.data).toBe('Job removed successfully!');
    expect(mockRepo.FindById).toHaveBeenCalled();
    expect(mockRepo.PullSavedJob).toHaveBeenCalled();
  });
});
