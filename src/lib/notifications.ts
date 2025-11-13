import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Email Configuration
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Twilio Configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SMSNotification {
  to: string;
  message: string;
}

/**
 * Send Email Notification
 */
export async function sendEmailNotification(data: EmailNotification): Promise<boolean> {
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@aidfusion.com',
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });
    return true;
  } catch (error) {
    console.error('Email notification error:', error);
    return false;
  }
}

/**
 * Send SMS Notification
 */
export async function sendSMSNotification(data: SMSNotification): Promise<boolean> {
  try {
    await twilioClient.messages.create({
      body: data.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: data.to,
    });
    return true;
  } catch (error) {
    console.error('SMS notification error:', error);
    return false;
  }
}

/**
 * Send 2FA OTP via Email
 */
export async function sendTwoFactorEmail(email: string, otp: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Two-Factor Authentication Code</h2>
      <p>Your AidFusion 2FA verification code is:</p>
      <div style="background: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
        <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${otp}</h1>
      </div>
      <p style="color: #666;">This code expires in 10 minutes.</p>
      <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
    </div>
  `;

  return sendEmailNotification({
    to: email,
    subject: 'Your AidFusion 2FA Code',
    html,
    text: `Your AidFusion 2FA code is: ${otp}. It expires in 10 minutes.`,
  });
}

/**
 * Send 2FA OTP via SMS
 */
export async function sendTwoFactorSMS(phone: string, otp: string): Promise<boolean> {
  return sendSMSNotification({
    to: phone,
    message: `Your AidFusion 2FA code is: ${otp}. It expires in 10 minutes.`,
  });
}

/**
 * Send Medication Reminder Email
 */
export async function sendMedicationReminderEmail(
  email: string,
  medicationName: string,
  dosage: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Medication Reminder</h2>
      <p>Time to take your medication:</p>
      <div style="background: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0;">
        <p style="margin: 0;"><strong>${medicationName}</strong></p>
        <p style="margin: 5px 0; color: #666;">Dosage: ${dosage}</p>
      </div>
      <p>Please remember to take your medication as prescribed.</p>
      <p style="color: #999; font-size: 12px;">This is an automated reminder from AidFusion</p>
    </div>
  `;

  return sendEmailNotification({
    to: email,
    subject: `Medication Reminder: ${medicationName}`,
    html,
  });
}

/**
 * Send Appointment Reminder Email
 */
export async function sendAppointmentReminderEmail(
  email: string,
  doctorName: string,
  appointmentTime: Date
): Promise<boolean> {
  const timeString = appointmentTime.toLocaleString();
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Appointment Reminder</h2>
      <p>You have an upcoming telemedicine consultation:</p>
      <div style="background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0;">
        <p style="margin: 0;"><strong>Doctor:</strong> ${doctorName}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${timeString}</p>
      </div>
      <p><a href="https://aidfusion.com/consultations" style="background: #2196f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Join Consultation</a></p>
      <p style="color: #999; font-size: 12px;">This is an automated reminder from AidFusion</p>
    </div>
  `;

  return sendEmailNotification({
    to: email,
    subject: `Appointment Reminder: Consultation with ${doctorName}`,
    html,
  });
}

/**
 * Send Welcome Email to New User
 */
export async function sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to AidFusion!</h2>
      <p>Hi ${firstName},</p>
      <p>Thank you for joining AidFusion. Your secure health companion is ready to help you manage your medical journey.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Get Started:</h3>
        <ul style="color: #666;">
          <li>Complete your health profile</li>
          <li>Upload your medical records</li>
          <li>Set up two-factor authentication</li>
          <li>Configure notification preferences</li>
        </ul>
      </div>
      <p><a href="https://aidfusion.com/dashboard" style="background: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a></p>
      <p style="color: #999; font-size: 12px;">If you have questions, contact our support team.</p>
    </div>
  `;

  return sendEmailNotification({
    to: email,
    subject: 'Welcome to AidFusion!',
    html,
  });
}

/**
 * Send Health Digest Email
 */
export async function sendHealthDigestEmail(
  email: string,
  firstName: string,
  digest: {
    totalCheckIns: number;
    activeMedications: number;
    upcomingAppointments: number;
    healthTips: string[];
  }
): Promise<boolean> {
  const tipsHtml = digest.healthTips
    .map((tip) => `<li style="margin: 10px 0;">${tip}</li>`)
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Your Weekly Health Digest</h2>
      <p>Hi ${firstName},</p>
      <p>Here's your weekly health summary:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Health Check-ins:</strong> ${digest.totalCheckIns}</p>
        <p><strong>Active Medications:</strong> ${digest.activeMedications}</p>
        <p><strong>Upcoming Appointments:</strong> ${digest.upcomingAppointments}</p>
      </div>
      <div style="background: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0;">
        <h3 style="margin-top: 0;">Health Tips This Week:</h3>
        <ul style="color: #666;">${tipsHtml}</ul>
      </div>
      <p><a href="https://aidfusion.com/dashboard" style="background: #2196f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Full Dashboard</a></p>
    </div>
  `;

  return sendEmailNotification({
    to: email,
    subject: 'Your Weekly Health Digest',
    html,
  });
}
