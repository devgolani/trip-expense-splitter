
const nodemailer = require('nodemailer');

// Test email configuration
const testEmail = async () => {
  // Replace these with your actual values
  const config = {
    host: 'smtp.hostinger.com', // or smtp.gmail.com for Gmail
    port: 587,
    secure: false,
    auth: {
      user: 'noreply@tripsplit.online', // or your-gmail@gmail.com
      pass: 'your-password-here' // your actual password
    },
    tls: {
      rejectUnauthorized: false
    }
  };

  try {
    console.log('Creating transporter...');
    const transporter = nodemailer.createTransporter(config);
    
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    console.log('Sending test email...');
    const result = await transporter.sendMail({
      from: config.auth.user,
      to: 'test@example.com', // Replace with your email
      subject: 'TripSplit Email Test',
      html: '<h1>Email working!</h1><p>Your SMTP configuration is correct.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  }
};

testEmail();
