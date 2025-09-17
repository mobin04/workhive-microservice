const nodemailer = require('nodemailer');
const mailjet = require('node-mailjet')
const path = require('path');
const fs = require('fs');

class Email {
  constructor(user, url, { ...others }) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0].toUpperCase();
    this.url = url;
    this.from = `${process.env.EMAIL_FROM_ME}`;
    this.user = user;
    this.applicationStatus = others.application;
    this.jobDetails = others.jobDetails;
    this.mailjet = mailjet.apiConnect(
      process.env.MAIL_JET_PUBLIC_KEY,
      process.env.MAIL_JET_PRIVATE_KEY
    );
  }

  // newTransporter() {
  //   if (process.env.NODE_ENV === 'production') {
  //     return nodemailer.createTransport({
  //       host: process.env.MAIL_JET_HOST,
  //       port: process.env.MAIL_JET_PORT,
  //       auth: {
  //         user: process.env.MAIL_JET_PUBLIC_KEY,
  //         pass: process.env.MAIL_JET_PRIVATE_KEY,
  //       },
  //     });
  //   }

  //   return nodemailer.createTransport({
  //     host: process.env.MAILTRAP_HOST,
  //     port: process.env.MAILTRAP_PORT,
  //     auth: {
  //       user: process.env.MAILTRAP_USER_NAME,
  //       pass: process.env.MAILTRAP_PASSWORD,
  //     },
  //   });
  // }

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

      // const mailOptions = {
      //   from: this.from,
      //   to: this.to,
      //   subject,
      //   html: template,
      // };

      // const info = await this.newTransporter().sendMail(mailOptions);
      // return info;

      const request = this.mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: this.from,
              Name: 'WorkHive',
            },
            To: [{ Email: this.to }],
            Subject: subject,
            HTMLPart: template,
          },
        ],
      });

      const info = await request;
      return info.body;
    } catch (error) {
      throw new Error(error.message || 'Failed to send email.');
    }
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
      shortlisted: {
        icon: '✅',
        text: 'Shortlisted',
        message:
          "Good news! You've been shortlisted for the next stage of the hiring process. The employer may reach out to schedule an interview or request more information soon.",
      },
    };

    const status = statusConfig[this.applicationStatus.application.status]; // get the fields from string key

    await this.sendEmail(
      'Application status updated',
      'applicationStatusEmail',
      {
        statusIcon: status.icon,
        statusText: status.text,
        userName: this.firstName,
        jobTitle: this.applicationStatus?.job?.title || this.jobDetails.title,
        companyName:
          this.applicationStatus?.job?.company || this.jobDetails.company,
        applicationDate: new Date(
          this.applicationStatus.application.createdAt
        ).toLocaleDateString(),
        applicationUpdateDate: `${
          this.applicationStatus?.application?.status?.toUpperCase() || ''
        } ${new Date(
          this.applicationStatus.application.updatedAt
        ).toLocaleDateString()}`,
        statusMessage: status.message,
      }
    );
  }
}

module.exports = Email;
