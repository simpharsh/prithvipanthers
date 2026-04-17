import nodemailer from 'nodemailer';
import { query } from './_utils/db.js';
import { allowCors } from './_utils/cors.js';
import path from 'path';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, message, subject } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required.' });
  }

  try {
    // Save to DB
    const sql = 'INSERT INTO contact_form_submissions (name, email, subject, message, status) VALUES (?, ?, ?, ?, ?)';
    await query(sql, [name, email, subject || null, message, 'new']);

    // Send confirmation email
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: smtpPort,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : smtpPort === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const escapeHtml = (value) => {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: [process.env.EMAIL_USER, 'info@pruthvipanthers.com', email],
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Enquiry</title>
</head>
<body style="margin:0;padding:0;background-color:#e8e8e8;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e8e8e8;padding:32px 16px;">
<tr><td align="center">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;border-radius:18px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.18);">

  <tr>
    <td style="background-color:#0b1120;padding:9px 22px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size:10px;color:#7a8599;letter-spacing:1.2px;text-transform:uppercase;font-family:'Segoe UI',Roboto,sans-serif;">OFFICIAL WEBSITE ENQUIRY</td>
          <td align="right" style="font-size:10px;color:#4a5568;font-family:'Segoe UI',Roboto,sans-serif;">Panthers HQ Contact Desk</td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td align="center" style="background-color:#111827;background-image:linear-gradient(180deg,#0f172a 0%,#1a2332 100%);padding:40px 30px 32px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
        <tr><td align="center">
          <img src="cid:pantherslogo" 
               alt="Pruthvi Panthers" width="90" height="90" 
               style="display:block;width:90px;height:90px;object-fit:contain;border:0;" />
        </td></tr>
      </table>
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:4px;color:#f05244;font-weight:700;text-transform:uppercase;font-family:'Segoe UI',Roboto,sans-serif;">PRUTHVI PANTHERS</p>
      <h1 style="margin:6px 0 8px;font-size:30px;color:#ffffff;font-weight:800;line-height:1.15;font-family:Georgia,'Times New Roman',serif;">New Message<br/>Received</h1>
      <p style="margin:0 0 22px;font-size:13px;color:#8896ab;line-height:1.55;font-family:'Segoe UI',Roboto,sans-serif;">A supporter has just submitted a new enquiry<br/>through the official website contact form.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
        <tr>
          <td style="background-color:#1a2332;border:1px solid #2d3a4e;border-radius:20px;padding:7px 18px;font-size:10px;color:#8896ab;letter-spacing:0.8px;text-transform:uppercase;font-weight:700;font-family:'Segoe UI',Roboto,sans-serif;">WEBSITE LEAD</td>
          <td width="10"></td>
          <td style="background-color:#f05244;border-radius:20px;padding:7px 18px;font-size:10px;color:#ffffff;letter-spacing:0.8px;text-transform:uppercase;font-weight:700;font-family:'Segoe UI',Roboto,sans-serif;">HIGH PRIORITY</td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="background-color:#f5f6f8;padding:26px 28px 16px;">
      <h2 style="margin:0;font-size:15px;color:#0f172a;font-weight:700;letter-spacing:0.3px;font-family:'Segoe UI',Roboto,sans-serif;">Sender Details</h2>
    </td>
  </tr>

  <tr>
    <td style="background-color:#f5f6f8;padding:0 28px 10px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e0e4ea;border-radius:10px;overflow:hidden;">
        <tr>
          <td width="120" style="background-color:#ffffff;padding:15px 16px;font-size:10px;color:#6b7a90;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;border-right:1px solid #e0e4ea;vertical-align:middle;font-family:'Segoe UI',Roboto,sans-serif;">FULL NAME</td>
          <td style="background-color:#ffffff;padding:15px 18px;font-size:14px;color:#0f172a;font-weight:600;vertical-align:middle;font-family:'Segoe UI',Roboto,sans-serif;">${safeName}</td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="background-color:#f5f6f8;padding:0 28px 10px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e0e4ea;border-radius:10px;overflow:hidden;">
        <tr>
          <td width="120" style="background-color:#ffffff;padding:15px 16px;font-size:10px;color:#6b7a90;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;border-right:1px solid #e0e4ea;vertical-align:middle;font-family:'Segoe UI',Roboto,sans-serif;">EMAIL ADDRESS</td>
          <td style="background-color:#ffffff;padding:15px 18px;font-size:14px;color:#3b82f6;font-weight:500;vertical-align:middle;font-family:'Segoe UI',Roboto,sans-serif;">${safeEmail}</td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="background-color:#f5f6f8;padding:6px 28px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e0e4ea;border-radius:10px;overflow:hidden;">
        <tr>
          <td style="background-color:#ffffff;padding:20px 20px 22px;">
            <p style="margin:0 0 10px;font-size:10px;color:#f05244;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;font-family:'Segoe UI',Roboto,sans-serif;">&#10022; MESSAGE CONTENT</p>
            <p style="margin:0;font-size:14px;color:#334155;line-height:1.65;font-family:'Segoe UI',Roboto,sans-serif;">${safeMessage}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td align="center" style="background-color:#f5f6f8;padding:0 28px 32px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="background-color:#f05244;border-radius:12px;">
            <a href="mailto:${safeEmail}" target="_blank" style="display:inline-block;padding:14px 40px;font-size:12px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:1.2px;text-transform:uppercase;font-family:'Segoe UI',Roboto,sans-serif;">REPLY TO ENQUIRY</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="background-color:#0b1120;padding:20px 24px;text-align:center;">
      <p style="margin:0;font-size:10px;color:#4a5568;letter-spacing:0.5px;font-family:'Segoe UI',Roboto,sans-serif;">&copy; ${new Date().getFullYear()} <span style="color:#f05244;font-weight:700;">PRUTHVI</span> <span style="color:#7a8599;">PANTHERS. STRICTLY CONFIDENTIAL.</span></p>
    </td>
  </tr>

</table>

</td></tr>
</table>

</body>
</html>
      `,
      attachments: [{
        filename: 'logo.png',
        path: path.join(process.cwd(), 'logo.png'),
        cid: 'pantherslogo'
      }]
    });

    return res.status(201).json({ message: 'Message sent successfully.' });

  } catch (err) {
    console.error('Failed to handle contact submission:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
