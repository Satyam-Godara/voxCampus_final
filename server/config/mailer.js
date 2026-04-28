const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendOTP = async (to, otp, name) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'VoxCampus <noreply@voxcampus.edu>',
    to,
    subject: 'VoxCampus — Your OTP for registration',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f1117;color:#e8eaf0;border-radius:12px">
        <h2 style="color:#6c8fff;margin:0 0 8px">VoxCampus</h2>
        <p style="color:#8b92a8;margin:0 0 24px">Chitkara University · Campus Platform</p>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your one-time password for registration is:</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:10px;background:#1e2535;padding:20px;border-radius:10px;text-align:center;color:#6c8fff;margin:20px 0">${otp}</div>
        <p style="color:#8b92a8;font-size:13px">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    `,
  });
};

const sendAcceptanceMail = async (to, rollNo, name) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'VoxCampus <noreply@voxcampus.edu>',
    to,
    subject: 'VoxCampus — Account Approved',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f1117;color:#e8eaf0;border-radius:12px">
        <h2 style="color:#6c8fff;margin:0 0 8px">VoxCampus</h2>
        <p style="color:#8b92a8;margin:0 0 24px">Chitkara University · Campus Platform</p>
        <p>Hi <strong>${name}</strong>,</p>
        <div style={{fontSize:30,marginBottom:12}}>Welcome to VoxCampus ! 🎉</div>
        <p>Your account has been approved by ADMIN and your rollNo/id is :</p>
        <div style="font-size:34px;font-weight:600;letter-spacing:10px;background:#1e2535;padding:20px;border-radius:10px;text-align:center;color:#6c8fff;margin:20px 0">${rollNo}</div>
        <p style="color:#8b92a8;font-size:13px">Login to VoxCampus to explore more!!</p>
      </div>
    `,
  });
};

module.exports = { sendOTP, sendAcceptanceMail };