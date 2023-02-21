import * as nodemailer from 'nodemailer'

export async function sentVerifyEmail(receive_email: string, userId: string) {
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.PASSWORD_EMAIL_SENDER,
    },
  })
  var mainOptions = {
    from: `Admin Center ${process.env.EMAIL_SENDER}`,
    to: receive_email,
    subject: 'Verify Account',
    text: `You can verify account by active this link: ${process.env.BACKEND_BASE_URL}/auth/verify?userId=${userId}`,
  }
  transporter.sendMail(mainOptions, function (err, info) {
    if (err) {
      throw err
    }
    return
  })
}
