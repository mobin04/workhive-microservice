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
    this.applicationStatus = others.application;
    this.jobDetails = others.jobDetails;
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
      profile: `${process.env.FRONTEND_URL}/profile`, // set the URL properly after
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

  async sendApplicationStatusUpdate() {
    const statusConfig = {
      pending: {
        icon: '⏳',
        text: 'Under Review',
        message:
          "Your application is currently being reviewed by our team. We'll notify you as soon as there's an update. Thank you for your patience!",
      },
      accepted: {
        icon: '🎉',
        text: 'Congratulations!',
        message:
          'Great news! Your application has been accepted. The employer will contact you soon with next steps. Congratulations on this achievement!',
      },
      rejected: {
        icon: '📋',
        text: 'Application Update',
        message:
          "Thank you for your interest in this position. While your application wasn't selected this time, we encourage you to apply for other opportunities that match your skills.",
      },
      withdrawn: {
        icon: '↩️',
        text: 'Application Withdrawn',
        message:
          'Your application has been withdrawn as requested. You can always apply for other positions that interest you on our platform.',
      },
    };

    const status = statusConfig[this.applicationStatus.status]; // get the fields from string key
    await this.sendEmail(
      'Application status updated',
      'applicationStatusEmail',
      {
        statusIcon: status.icon,
        statusText: status.text,
        userName: this.firstName,
        jobTitle: this.applicationStatus.job.title || this.jobDetails.title,
        companyName:
          this.applicationStatus.job.company || this.jobDetails.company,
        applicationDate: new Date(
          this.applicationStatus.createdAt
        ).toLocaleDateString(),
        applicationUpdateDate: new Date(
          this.applicationStatus.updatedAt
        ).toLocaleDateString(),
        statusMessage: status.message,
      }
    );
  }
}

module.exports = Email;
