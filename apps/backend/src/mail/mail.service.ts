import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.setupTransporter();
  }

  private async setupTransporter() {
    const host = process.env.MAIL_HOST;
    const port = parseInt(process.env.MAIL_PORT || '587');
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    if (host && user && pass) {
      // Use real SMTP from .env
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: { user, pass },
      });
      console.log('✅ MailService: Using real SMTP configuration.');
    } else {
      // Fallback to Ethereal (Test Account)
      console.log('⚠️ MailService: SMTP credentials missing in .env. Using Ethereal fallback.');
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
  }

  async sendRecoveryCode(email: string, code: string) {
    if (!this.transporter) await this.setupTransporter();

    try {
      const info = await this.transporter.sendMail({
        from: `"iBranch Support" <${process.env.MAIL_USER || 'support@ibranch.com'}>`,
        to: email,
        subject: 'Password Recovery Code',
        text: `Your recovery code is: ${code}. It expires in 15 minutes.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Password Recovery</h2>
            <p>You requested a password reset. Use the code below to proceed:</p>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; padding: 10px; background: #f4f4f4; display: inline-block;">
              ${code}
            </div>
            <p>This code expires in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });

      console.log('✅ Recovery email sent to %s', email);
      if (this.transporter.options.host.includes('ethereal')) {
        console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      return info;
    } catch (error) {
      console.error('❌ Failed to send recovery email to %s:', email, error);
      throw error;
    }
  }
}
