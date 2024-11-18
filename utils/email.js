const nodemailer = require('nodemailer')
const pug = require('pug')
const htmlToText = require('html-to-text')

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0]
        this.url = url
        this.from = `Jonas Smith <${process.env.EMAIL_FROM}>`
    }

    createTransport() {
        if (process.env.NODE_ENV === 'production') {
            // Sending
            return 1
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
            // Activate in gmail "Less secure app" option
        })
    }

    // Send the actual email
    async send(template, subject) {
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}`, {
            firstName: this.firstName,
            url: this.url,
            subject
        })
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromStringd(html),
            // html: options.html
        }

        this.newTransport()
        await transporter.sendMail(mailOptions)
    }

    async sendWelcome(template, subject) {
        await this.send('welcome', 'Welcome to rhe Natours Family!');
    }

    async sendPasswordReset() {
        await this.send('passwordreset', 'Your password reset token (valid for only 10 minutes)')
    }
}

const sendEmail = async options => {
    // 1) Create a transporter
    console.log({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        // Activate in gmail "Less secure app" option
    })

    // 2) Define the email options
    const mailOptions = {
        from: 'Jonas Smith <hello@jonas.io>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html
    }

    // Actually send the email
    await transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending email: ', err)
        } else {
            console.log('Email sent: ', info.response)
        }
    })

}

module.exports = sendEmail
