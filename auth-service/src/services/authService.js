const jwt = require('jsonwebtoken');
const { AuthRepository } = require('../database');
const handleFileUploads = require('../utils/fileUploads');
const { EXCHANGE_NAME, QUEUE, BINDING_KEY } = require('../rabbitMqConfig');
const {
  AppError,
  AuthConfig,
  Email,
  formatData,
  filteredObject,
} = require('../utils');

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
        throw new AppError('User already exist please login!', 400);
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
        return formatData(user);
      }

      if (mode === 'login') {
        if (decoded.authType !== 'login') {
          throw new AppError(
            `You are trying to signup! Please select mode to 'signup'`,
            400
          );
        }

        const logginUserId = decoded.userId;
        const loggingUser = await this.repository.FindById({
          id: logginUserId,
        });

        return formatData({ loggingUser });
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
      const filteredProperty = filteredObject(reqObj, 'name', 'email');

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
