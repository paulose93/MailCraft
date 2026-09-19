import nodemailer from 'nodemailer';
import { config } from './index';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `"NewsletterAI" <${config.email.user}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};
