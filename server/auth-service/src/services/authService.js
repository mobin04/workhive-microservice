const jwt = require('jsonwebtoken');
const { AuthRepository } = require('../database');
const handleFileUploads = require('../utils/fileUploads');
const {
  EXCHANGE_NAME,
  QUEUE,
  BINDING_KEY,
  AUTH_ROUTING_KEY,
} = require('../rabbitMqConfig');
const {
  AppError,
  AuthConfig,
  Email,
  formatData,
  filteredObject,
} = require('../utils');
const provider = require('../rabbitMqConnection/rabbitMqProvider');

class AuthService {
  constructor() {
    this.repository = new AuthRepository();
    this.authConfig = new AuthConfig();
  }

  async RequestSignupOTP(userInput) {
    const { name, email, password, role } = userInput;

    try {
      const existingUser = await this.repository.FindByEmail({ email });

      if (existingUser) {
        throw new AppError('Email already exist!', 400);
      }

      const { otpSecret, otpToken } = this.authConfig.generateOTP();

      const user = {
        name,
        email,
        password,
        role,
        otpSecret,
        authType: 'signup',
      };

      await new Email(user, '', { otpSecret: otpToken }).sendOtpEmail();

      return formatData({ user });
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async RequestLoginOTP(userInput) {
    const { email, password } = userInput;

    try {
      const existingUser = await this.repository.FindByEmailAndGetPassword({
        email,
      });

      if (!existingUser) {
        throw new AppError('User does not exist', 404);
      }

      if (
        !(await existingUser.isPasswordCorrect(password, existingUser.password))
      ) {
        throw new AppError('Incorrect email or password!', 401);
      }

      const { otpSecret, otpToken } = this.authConfig.generateOTP();

      const user = { ...existingUser.toObject(), otpSecret };

      user.password = undefined;

      await new Email(user, '', {
        otpSecret: otpToken,
      }).sendLoginOtpEmail();
      // console.log(otpToken)

      return formatData({ user });
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async RequestLoginLink(userInput) {
    const { email } = userInput;
    try {
      if (!email) throw new AppError('Please provide your email', 400);

      const user = await this.repository.FindByEmail({ email });

      if (!user) throw new AppError('User does not exist', 404);

      const token = jwt.sign(
        { userId: user._id, authType: 'magic-link' },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );

      const loginLink = `${process.env.FRONTEND_URL}/magic-login?token=${token}`;

      await new Email(user, loginLink, {}).sendMagicLink();

      return formatData({ message: 'login link sent to your email.' });
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async VerifyLoginLink(userInput) {
    const { token } = userInput;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.authType !== 'magic-link') {
        throw new AppError('Invalid login link', 400);
      }

      const user = await this.repository.FindById({ id: decoded.userId });

      if (!user) throw new AppError('User not found!', 404);

      return formatData({ user });
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async VerifyOTP(userInput) {
    const { otp, mode, token } = userInput;

    try {
      if (!['login', 'signup'].includes(mode)) {
        throw new AppError(`Please use either 'login' or 'signup' mode`, 400);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const { otpSecret } = decoded;
      const verify = this.authConfig.otpVerification(otp, otpSecret);

      if (!verify) {
        throw new AppError('Invalid or Expired OTP', 403);
      }

      if (mode === 'signup') {
        if (decoded.authType !== 'signup') {
          throw new AppError(
            `You are trying to login! Please use the mode to 'login'`,
            400
          );
        }

        const { name, email, password, role } = decoded;
        const user = await this.repository.CreateUser({
          name,
          email,
          password,
          role,
        });

        await new Email(user, '', '').sendWelcome();
        return formatData({ loggingUser: user });
      }

      if (mode === 'login') {
        if (decoded.authType !== 'login') {
          throw new AppError(
            `You are trying to signup! Please select mode to 'signup'`,
            400
          );
        }

        const logginUserId = decoded.userId;

        let loggingUser = await this.repository.FindById({
          id: logginUserId,
        });

        if (loggingUser?.isSuspended) {
          if (
            loggingUser.suspendedUntil &&
            loggingUser.suspendedUntil <= new Date()
          ) {
            const user = await this.repository.UnsuspendUser({
              id: loggingUser?._id,
            });
            if (user) {
              loggingUser = user;
            }
          } else {
            throw new AppError(
              `Your account is suspended until ${loggingUser?.suspendedUntil?.toDateString()}`,
              401
            );
          }
        }

        return formatData({ loggingUser });
      }

      return formatData(null);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async ResentOtp(userInput) {
    const { mode, token } = userInput;
    try {
      if (!['signup', 'login'].includes(mode)) {
        throw new AppError('Please select the mode either signup or login');
      }

      if (!token) {
        throw new AppError('Invalid or expired token!', 401);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const { otpSecret, otpToken } = this.authConfig.generateOTP();

      if (mode === 'signup') {
        const requiredFields = [
          'name',
          'email',
          'password',
          'role',
          'authType',
        ];

        if (!requiredFields.every((key) => key in decoded)) {
          throw new AppError('Invalid or expired token!', 403);
        }

        const { name, email, password, role, authType } = decoded;

        const user = { name, email, password, role, authType, otpSecret };

        await new Email(user, '', { otpSecret: otpToken }).sendOtpEmail();
        return formatData({ user, mode });
      }

      if (mode === 'login') {
        if (!['authType', 'userId'].every((key) => key in decoded)) {
          throw new AppError('Invalid or expired token', 403);
        }

        const { authType, userId } = decoded;

        const existingUser = await this.repository.FindById({ id: userId });

        if (!existingUser) throw new AppError('User not found!', 404);

        const user = { ...existingUser, otpSecret };

        await new Email(user, '', {
          otpSecret: otpToken,
        }).sendLoginOtpEmail();

        return formatData({ user, mode });
      }

      return formatData(null);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetProfile(userInput) {
    const { id } = userInput;

    try {
      if (!id) {
        throw new AppError('Please provide your ID', 400);
      }
      const user = await this.repository.FindById({ id });

      if (!user) {
        throw new AppError('User not found belong to that ID', 404);
      }

      return formatData({ user });
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async UpdateProfile(userInput) {
    const { reqObj, file, id } = userInput;

    try {
      const filteredProperty = filteredObject(
        reqObj,
        'name',
        'email',
        'phone',
        'location',
        'website',
        'bio',
        'skills',
        'experience',
        'education'
      );

      if (
        filteredProperty.skills &&
        typeof filteredProperty.skills === 'string'
      ) {
        try {
          filteredProperty.skills = JSON.parse(filteredProperty.skills);
        } catch (err) {
          throw new AppError('Invalid skills format', 400);
        }
      }

      if (file) {
        await handleFileUploads.deleteImage('coverImage', id);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        filteredProperty.coverImage = await handleFileUploads.uploadImage(
          file,
          'coverImage',
          id
        );
      }

      const user = await this.repository.updateUser({
        userId: id,
        filteredProperty,
      });

      if (!user) {
        throw new AppError('Error occour while updating profile!', 500);
      }

      return formatData({ user });
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async getUserById(userInput) {
    const { id } = userInput;
    try {
      const user = await this.repository.FindById({ id });
      if (!user) {
        throw new AppError('User not found!', 404);
      }
      return formatData(user);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetUserStatistics() {
    try {
      const userStats = await this.repository.GetUserStatistics();
      if (userStats.length === 0) throw new AppError('No users found!', 404);
      return formatData(userStats);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async SaveJob(userInput) {
    const { userId, jobId } = userInput;
    try {
      const user = await this.repository.FindById({ id: userId });

      if (!user) throw new AppError('No user found with that id!', 403);

      if (!['job_seeker'].includes(user.role)) {
        throw new AppError('Only job seeker can save jobs', 403);
      }

      const job = await provider(
        { type: 'job', id: jobId },
        AUTH_ROUTING_KEY,
        10000
      );

      if (!job) {
        throw new AppError('No job found with that id', 404);
      }

      if (
        user.savedJobs.some(
          (savedId) => savedId.toString() === job._id.toString()
        )
      ) {
        throw new AppError('Already saved this job', 400);
      }

      const updatedUser = await this.repository.SaveJob({ userId, jobId });

      return formatData(updatedUser);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetSavedJobs(userInput) {
    const { userId } = userInput;
    let jobs = [];
    try {
      const user = await this.repository.FindById({ id: userId });

      if (!user) throw new AppError('No user found with that id!', 403);

      if (user.savedJobs.length > 0) {
        const jobPromises = user.savedJobs.map((id) =>
          provider({ type: 'job', id }, AUTH_ROUTING_KEY, 5000)
        );

        const results = await Promise.all(jobPromises);
        jobs = results.filter((job) => job);
      }
      return formatData(jobs);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async RemoveSavedJobs(userInput) {
    const { jobId, userId } = userInput;
    try {
      const user = await this.repository.FindById({ id: userId });
      if (!user) throw new AppError('User not found!', 400);

      const removeJob = await this.repository.PullSavedJob({ jobId, userId });

      if (!removeJob) throw new AppError('No job found with that job id!', 404);

      return formatData('Job removed successfully!');
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async SuspendAccount(adminInput) {
    const { userId, days, reason } = adminInput;
    try {
      if (!days || isNaN(days) || days <= 0) {
        throw new AppError('Suspension days must be a positive number', 400);
      }

      const suspendUser = await this.repository.suspendUser({
        userId,
        days,
        reason,
      });

      if (!suspendUser) throw new AppError('Failed to suspend user!', 500);

      await new Email(suspendUser, '', {
        suspensionDays: days,
      }).sendSuspensionEmail();

      return formatData(suspendUser);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async UnsuspendUser(adminInput) {
    const { userId } = adminInput;
    try {
      const unSuspendedUser = await this.repository.UnsuspendUser({ userId });
      if (!unSuspendedUser)
        throw new AppError('Failed to unsuspend user!', 500);

      await new Email(unSuspendedUser, '', {}).sendUnsuspendEmail();

      return formatData(unSuspendedUser);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async RPCObserver(channel) {
    try {
      await channel.assertQueue(QUEUE, { durable: true });
      channel.bindQueue(QUEUE, EXCHANGE_NAME, BINDING_KEY);
      channel.consume(QUEUE, async (msg) => {
        let user = null;
        if (msg !== null) {
          const { type, id } = JSON.parse(msg.content.toString());
          if (type === 'userId') {
            user = await this.repository.FindById({ id });
          }

          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(user)),
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

module.exports = AuthService;
