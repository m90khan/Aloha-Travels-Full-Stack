const nodemailer = require('nodemailer');

const pug = require('pug');
const htmlToText = require('html-to-text');
// nodemailer send emails
module.exports = class Email {
  constructor(user, url) {
    this.sendTo = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.sendFrom = `Khan M <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // send real emails when in production using sendGrid and use mailTrap when developemnt
    if (process.env.NODE_ENV === 'production') {
      // send grid

      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME, // generated ethereal user
          pass: process.env.SENDGRID_PASSWORD // generated ethereal password
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME, // generated ethereal user
        pass: process.env.EMAIL_PASSWORD // generated ethereal password
      }
      // * activate the less secure app option in gmail account
    });
  }
  // send actual email

  async send(template, subject) {
    //1- render html based on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject: subject
      }
    );
    //2- Define email options
    const mailOptions = {
      from: this.sendFrom, // sender address
      to: this.sendTo, // list of receivers
      subject: subject, // Subject line
      html: html, //
      text: htmlToText.fromString(html) // plain text body
      //html
    };
    //3- create transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Aloha Travels!');
  }

  async sendPasswordResetNotice() {
    await this.send('welcome', 'Your Password has been reset!');
  }


  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your Password reset token (valid for 15 minutes)'
    );
  }
};

// const sendEmail = async options => {
//   // 1- create reusable transporter object using the default SMTP transport
//   const transporter = nodemailer.createTransport({
//     // service: 'Gmail'  => for gmail
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME, // generated ethereal user
//       pass: process.env.EMAIL_PASSWORD // generated ethereal password
//     }
//     // activate the less secure app option in gmail account
//   });

//   // 2- Define email otpions
//   const mailOptions = {
//     from: 'Khan BABA👻 <killer@gmail.com>', // sender address
//     to: options.email, // list of receivers
//     subject: options.subject, // Subject line
//     text: options.message // plain text body
//   };

//   // 3- send email
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
