import nodemailer from 'nodemailer';
import { query } from './_utils/db.js';
import { allowCors } from './_utils/cors.js';

const LOGO_BASE64 = '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';

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
          <img src="https://mpyxfritlulkxtnpbiqr.supabase.co/storage/v1/object/public/uploads/logo.png" 
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
      `
    });

    return res.status(201).json({ message: 'Message sent successfully.' });

  } catch (err) {
    console.error('Failed to handle contact submission:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
