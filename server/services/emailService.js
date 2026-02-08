import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transport = getTransporter();
  if (!transport) {
    console.log('[Email] SMTP not configured. Would send:', { to, subject });
    return { success: true, skipped: true };
  }

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: text || html?.replace(/<[^>]*>/g, ''),
      html,
    });
    return { success: true };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: err.message };
  }
};

export const sendEmergencyNotification = async (patientName, patientEmail, contacts, emergencyDetails) => {
  const subject = `SafeFall AI – Emergency: ${patientName} may need help`;
  const html = `
    <h2>Emergency Alert</h2>
    <p><strong>${patientName}</strong> has triggered an emergency on SafeFall AI.</p>
    <p>Time: ${new Date().toISOString()}</p>
    <p>Location: ${emergencyDetails?.location ? `${emergencyDetails.location.lat}, ${emergencyDetails.location.lng}` : 'Unknown'}</p>
    <p>Please respond immediately.</p>
  `;

  const results = [];
  if (patientEmail) {
    results.push(await sendEmail({ to: patientEmail, subject, html }));
  }
  return results;
};
