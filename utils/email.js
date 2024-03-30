const nodemailer = require('nodemailer')
const pug = require('pug')
const htmlToText = require('html-to-text')

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email
    this.firstName = user.name.split(' ')[0]
    this.url = url
    this.from = `Gui Vecchi <${process.env.EMAIL_FROM}>`
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        auth: {
          user: process.env.BREVO_USER,
          pass: process.env.BREVO_SMTP_KEY
        }
      })
    }
  }

  //Send the actual email
  async send(template, subject) {
    // Render HTML based on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject
      }
    )

    // Define email options
    const mailOption = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html)
    }

    await this.newTransport().sendMail(mailOption, (error, info) => {
      if (error) {
        console.log('error in email creation', error)
      } else {
        console.log('email sent: ', info.response)
      }
    })
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family')
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    )
  }
}
