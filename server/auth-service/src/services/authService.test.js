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
    suspendUser: jest.fn(),
    UnsuspendUser: jest.fn(),
    FindUserByEmail: jest.fn(),
    FindUserByResetToken: jest.fn(),
    SaveResetPassword: jest.fn(),
    GenerateResetToken: jest.fn(),
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

describe('AuthService - SuspendAccount', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;

    Email.mockImplementation(() => ({
      sendSuspensionEmail: jest.fn().mockResolvedValue(true),
    }));
  });

  it('Should throw error if days is invalid', async () => {
    await expect(
      service.SuspendAccount({ userId: 'u123', days: 0, reason: 'spam' })
    ).rejects.toThrow('Suspension days must be a positive number');

    await expect(
      service.SuspendAccount({ userId: 'u123', days: -5, reason: 'spam' })
    ).rejects.toThrow('Suspension days must be a positive number');
  });

  it('Should throw error if suspendUser returns null', async () => {
    mockRepo.suspendUser.mockResolvedValue(null);

    await expect(
      service.SuspendAccount({ userId: 'u123', days: 5, reason: 'spam' })
    ).rejects.toThrow('Failed to suspend user!');
  });

  it('Should suspend user and send email successfully', async () => {
    mockRepo.suspendUser.mockResolvedValue({
      userId: 'u123',
      name: 'user',
      days: 7,
      reason: 'bla bla bla',
    });

    const result = await service.SuspendAccount({
      userId: 'u123',
      days: 7,
      reason: 'bla bla bla',
    });

    expect(mockRepo.suspendUser).toHaveBeenCalledWith({
      userId: 'u123',
      days: 7,
      reason: 'bla bla bla',
    });

    expect(Email).toHaveBeenCalled();
    expect(result).toMatchObject({
      data: {
        userId: 'u123',
        name: 'user',
        days: 7,
        reason: 'bla bla bla',
      },
    });
  });
});

describe('AuthService - UnsuspendUser', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;

    Email.mockImplementation(() => ({
      sendUnsuspendEmail: jest.fn().mockResolvedValue(true),
    }));
  });

  it('Should throw error if UnsuspendUser returns null', async () => {
    mockRepo.UnsuspendUser.mockResolvedValue(null);

    await expect(service.UnsuspendUser({ userId: 'u123' })).rejects.toThrow(
      'Failed to unsuspend user!'
    );
  });

  it('Should throw error if sending unsuspend email fails', async () => {
    const fakeUser = { _id: 'u123', name: 'john' };
    mockRepo.UnsuspendUser.mockResolvedValue(fakeUser);

    Email.mockImplementation(() => ({
      sendUnsuspendEmail: jest
        .fn()
        .mockRejectedValue(new Error('Email failed')),
    }));

    await expect(service.UnsuspendUser({ userId: 'u123' })).rejects.toThrow(
      'Email failed'
    );
  });

  it('Should unsuspend user and send email successfully', async () => {
    const fakeUser = { _id: 'u123', name: 'john' };
    mockRepo.UnsuspendUser.mockResolvedValue(fakeUser);

    const result = await service.UnsuspendUser({ userId: 'u123' });

    expect(mockRepo.UnsuspendUser).toHaveBeenCalledWith({ userId: 'u123' });
    expect(Email).toHaveBeenCalledWith(fakeUser, '', {});
    expect(result).toHaveProperty('data');
    expect(result.data).toMatchObject({ _id: 'u123', name: 'john' });
  });
});

describe('AuthService - GetAllUsers', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;
  });

  it('Should throw error if repository returns null users', async () => {
    mockRepo.GetAllUsers = jest.fn().mockResolvedValue({ users: null });

    await expect(
      service.GetAllUsers({ query: { role: 'admin' } })
    ).rejects.toThrow('Unable to find users!');
  });

  it('Should return users, totalPages, and totalUsers when successful', async () => {
    const fakeUsers = [
      { _id: 'u1', name: 'Alice' },
      { _id: 'u2', name: 'Bob' },
    ];

    mockRepo.GetAllUsers = jest.fn().mockResolvedValue({
      users: fakeUsers,
      totalPages: 2,
      totalUsers: 10,
    });

    const result = await service.GetAllUsers({ query: { role: 'user' } });

    expect(mockRepo.GetAllUsers).toHaveBeenCalledWith({
      query: { role: 'user' },
    });

    expect(result).toEqual({
      data: {
        users: fakeUsers,
        totalPages: 2,
        totalUsers: 10,
      },
    });
  });

  it('Should throw error if repository throws error', async () => {
    mockRepo.GetAllUsers = jest
      .fn()
      .mockRejectedValue(new Error('Database error'));

    await expect(
      service.GetAllUsers({ query: { role: 'user' } })
    ).rejects.toThrow('Database error');
  });
});

describe('AuthService - ForgotPassword', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;

    Email.mockImplementation(() => ({
      sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    }));
  });

  it('Should throw error if no user found with email', async () => {
    mockRepo.FindUserByEmail = jest.fn().mockResolvedValue(null);

    await expect(
      service.ForgotPassword({ email: 'notfound@example.com' })
    ).rejects.toThrow('No user found with that email!');
  });

  it('Should generate token and send reset email when user exists', async () => {
    const fakeUser = { _id: 'u1', email: 'test@example.com', name: 'Alice' };

    mockRepo.FindUserByEmail = jest.fn().mockResolvedValue(fakeUser);
    mockRepo.GenerateResetToken = jest.fn().mockResolvedValue('resettoken123');

    const result = await service.ForgotPassword({ email: 'test@example.com' });

    expect(mockRepo.FindUserByEmail).toHaveBeenCalledWith({
      email: 'test@example.com',
    });

    expect(mockRepo.GenerateResetToken).toHaveBeenCalledWith({
      user: fakeUser,
    });

    expect(Email).toHaveBeenCalledWith(
      fakeUser,
      expect.stringContaining('/reset-password?token=resettoken123'),
      {}
    );

    const emailInstance = Email.mock.results[0].value;
    expect(emailInstance.sendPasswordResetEmail).toHaveBeenCalled();

    expect(result).toEqual({ data: fakeUser }); // formatData(user) returns { data: user }
  });

  it('Should throw error if repository throws error', async () => {
    mockRepo.FindUserByEmail = jest
      .fn()
      .mockRejectedValue(new Error('Database error'));

    await expect(
      service.ForgotPassword({ email: 'test@example.com' })
    ).rejects.toThrow('Database error');
  });
});

describe('AuthService - ResetPassword', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepo = service.repository;

    Email.mockImplementation(() => ({
      sendPswrdResetSuccessEmail: jest.fn().mockResolvedValue(true),
    }));
  });

  it('Should throw error if token is invalid or expired', async () => {
    mockRepo.FindUserByResetToken = jest.fn().mockResolvedValue(null);

    await expect(
      service.ResetPassword({
        token: 'invalidtoken',
        password: 'newPass123',
        confirmPassword: 'newPass123',
      })
    ).rejects.toThrow('Token invalid or expired');
  });

  it('Should throw error if passwords do not match', async () => {
    mockRepo.FindUserByResetToken = jest.fn().mockResolvedValue({ _id: 'u1' });

    await expect(
      service.ResetPassword({
        token: 'validtoken',
        password: 'newPass123',
        confirmPassword: 'wrongPass',
      })
    ).rejects.toThrow('Password do not match, Please try again');
  });

  it('Should throw error if SaveResetPassword fails', async () => {
    mockRepo.FindUserByResetToken = jest.fn().mockResolvedValue({ _id: 'u1' });
    mockRepo.SaveResetPassword = jest.fn().mockResolvedValue(null);

    await expect(
      service.ResetPassword({
        token: 'validtoken',
        password: 'newPass123',
        confirmPassword: 'newPass123',
      })
    ).rejects.toThrow('Something went wrong');
  });

  it('Should send success email and return formatted user on success', async () => {
    const fakeUser = { _id: 'u1', email: 'test@example.com' };

    mockRepo.FindUserByResetToken = jest.fn().mockResolvedValue(fakeUser);
    mockRepo.SaveResetPassword = jest.fn().mockResolvedValue(fakeUser);

    const result = await service.ResetPassword({
      token: 'validtoken',
      password: 'newPass123',
      confirmPassword: 'newPass123',
    });

    expect(mockRepo.FindUserByResetToken).toHaveBeenCalled();
    expect(mockRepo.SaveResetPassword).toHaveBeenCalledWith({
      user: fakeUser,
      password: 'newPass123',
    });

    expect(Email).toHaveBeenCalledWith(fakeUser, '', {});
    expect(result).toEqual({ data: fakeUser });
  });

  it('Should throw error if repository throws error', async () => {
    mockRepo.FindUserByResetToken = jest
      .fn()
      .mockRejectedValue(new Error('Database error'));

    await expect(
      service.ResetPassword({
        token: 'validtoken',
        password: 'newPass123',
        confirmPassword: 'newPass123',
      })
    ).rejects.toThrow('Database error');
  });
});
