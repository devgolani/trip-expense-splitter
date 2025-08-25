
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  try {
    // Check if we're in production mode with real email credentials
    const isProduction = process.env.NODE_ENV === 'production' && 
                        process.env.EMAIL_USER && 
                        process.env.EMAIL_PASSWORD &&
                        process.env.EMAIL_USER !== 'noreply@tripsplit.com';

    if (isProduction) {
      // Send real email in production
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
      });
      console.log(`Email sent successfully to: ${to}`);
    } else {
      // Simulate email sending in development
      console.log(`[EMAIL SIMULATION] Sending email to: ${to}`);
      console.log(`[EMAIL SIMULATION] Subject: ${subject}`);
      console.log(`[EMAIL SIMULATION] Content: ${html}`);
      
      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
}

export function generateOtpEmailTemplate(code: string, type: 'verification' | 'reset'): string {
  const title = type === 'verification' ? 'Email Verification' : 'Password Reset';
  const message = type === 'verification' 
    ? 'Please verify your email address to complete your registration.' 
    : 'You requested to reset your password. Use the code below to proceed.';

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f3f4f6;
                margin: 0;
                padding: 20px;
            }
            .container {
                background-color: white;
                max-width: 600px;
                margin: 0 auto;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 20px;
            }
            .logo-icon {
                background-color: #2563eb;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }
            .logo-text {
                font-size: 24px;
                font-weight: bold;
                color: #1f2937;
            }
            .title {
                color: #1f2937;
                font-size: 24px;
                margin: 0 0 10px 0;
            }
            .message {
                color: #6b7280;
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 30px;
            }
            .otp-container {
                background-color: #f3f4f6;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin: 30px 0;
            }
            .otp-code {
                font-size: 32px;
                font-weight: bold;
                color: #2563eb;
                letter-spacing: 8px;
                font-family: monospace;
            }
            .footer {
                color: #9ca3af;
                font-size: 14px;
                text-align: center;
                margin-top: 30px;
                line-height: 1.5;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">
                    <div class="logo-icon">✈</div>
                    <div class="logo-text">TripSplit</div>
                </div>
                <h1 class="title">${title}</h1>
                <p class="message">${message}</p>
            </div>
            
            <div class="otp-container">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your verification code is:</p>
                <div class="otp-code">${code}</div>
                <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">This code will expire in 10 minutes</p>
            </div>
            
            <div class="footer">
                <p>If you didn't request this ${type === 'verification' ? 'verification' : 'password reset'}, please ignore this email.</p>
                <p>© 2025 TripSplit. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}
