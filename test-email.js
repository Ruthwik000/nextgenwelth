require('dotenv').config();
const { sendEmail } = require('./actions/send-email.js');

async function testEmail() {
  if (!process.env.RESEND_API_KEY) {
    console.error('Error: RESEND_API_KEY is missing from environment variables');
    return;
  }

  try {
    const result = await sendEmail({
      to: 'delivered@resend.dev',
      subject: 'Test Email',
      react: 'Test content'
    });
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

testEmail();