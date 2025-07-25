const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

class Email {
  constructor(user, url, { ...others }) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0].toUpperCase();
    this.url = url;
    this.from = `${process.env.EMAIL_FROM_ME}`;
    this.user = user;
    this.loginDetails = others.loggedUserInfo;
    this.otpSecret = others.otpSecret;
  }

  newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: process.env.MAIL_JET_HOST,
        port: process.env.MAIL_JET_PORT,
        auth: {
          user: process.env.MAIL_JET_PUBLIC_KEY,
          pass: process.env.MAIL_JET_PRIVATE_KEY,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USER_NAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });
  }

  async sendEmail(subject, templateName, variables) {
    console.log(this.user)
    try {
      const templatePath = path.join(
        __dirname,
        'emailTemplates',
        `${templateName}.html`
      );
      let template = fs.readFileSync(templatePath, 'utf8');

      for (const [key, value] of Object.entries(variables)) {
        template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html: template,
      };

      const info = await this.newTransporter().sendMail(mailOptions);
      return info;
    } catch (error) {
      throw new Error(error.message || 'Failed to send email.');
    }
  }

  // Send welcome email.
  async sendWelcome() {
    await this.sendEmail('Welcome to WorkHive.', 'welcomeEmail', {
      name: this.firstName,
      profile: `${process.env.FRONTEND_URL}/profile`,
      coverImage: this.user.coverImage,
    });
  }

  // Send Login Email.
  async sendLoginEmail() {
    await this.sendEmail('Welcome Back to WorkHive', 'loginEmail', {
      userName: this.firstName,
      time: new Date().toDateString(),
      location: this.loginDetails.location,
      device: `${this.loginDetails.device.browser}, ${this.loginDetails.device.type}`,
      coverImage: this.user.coverImage,
    });
  }

  async sendOtpEmail() {
    await this.sendEmail('Verification code for signup', 'otpEmailTemplate', {
      otpCode: this.otpSecret,
      userName: this.firstName,
    });
  }

  async sendLoginOtpEmail() {
    await this.sendEmail('Verification code for login', 'otpLoginEmail', {
      userName: this.firstName,
      otpCode: this.otpSecret,
      coverImageUrl: this.user.coverImage,
    });
  }

  async sendMagicLink() {
    await this.sendEmail('Click to login', 'magicLink', {
      userName: this.firstName,
      coverImage: this.user.coverImage,
      magicLink: this.url,
    });
  }
}

module.exports = Email;
