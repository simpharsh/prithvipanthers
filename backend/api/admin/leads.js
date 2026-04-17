import { query } from '../_utils/db.js';
import { authenticateAdmin } from '../_utils/auth.js';
import { allowCors } from '../_utils/cors.js';
import nodemailer from 'nodemailer';

const smtpPort = Number(process.env.SMTP_PORT || 465);
const leadStatusMailer = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD
  ? nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: smtpPort,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : smtpPort === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
  : null;

const normalizeStatus = (value) => String(value || '').trim().toLowerCase();
const escapeHtml = (value) => {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const buildLeadStatusEmailHtml = ({ name, email, status }) => {
  const safeName = escapeHtml(name || 'there');
  const safeEmail = escapeHtml(email || 'N/A');
  const isAccepted = status === 'accepted';
  const statusLabel = isAccepted ? 'ACCEPTED' : 'REJECTED';
  const statusColor = isAccepted ? '#16a34a' : '#b91c1c';
  const title = isAccepted ? 'Enquiry Accepted' : 'Enquiry Rejected';
  const subtitle = isAccepted
    ? 'Your enquiry has been accepted. Our team will connect with you shortly.'
    : 'Your enquiry has been rejected at this time. Thank you for your interest.';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lead Status Update</title>
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
          <img src="https://pruthvipanthers.com/assets/common/logo.png"
               alt="Pruthvi Panthers" width="90" height="90"
               style="display:block;width:90px;height:90px;object-fit:contain;border:0;" />
        </td></tr>
      </table>

      <p style="margin:0 0 6px;font-size:12px;letter-spacing:4px;color:#f05244;font-weight:700;text-transform:uppercase;font-family:'Segoe UI',Roboto,sans-serif;">PRUTHVI PANTHERS</p>
      <h1 style="margin:6px 0 8px;font-size:30px;color:#ffffff;font-weight:800;line-height:1.15;font-family:Georgia,'Times New Roman',serif;">${title}</h1>
      <p style="margin:0 0 22px;font-size:13px;color:#8896ab;line-height:1.55;font-family:'Segoe UI',Roboto,sans-serif;">${subtitle}</p>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
        <tr>
          <td style="background-color:#1a2332;border:1px solid #2d3a4e;border-radius:20px;padding:7px 18px;font-size:10px;color:#8896ab;letter-spacing:0.8px;text-transform:uppercase;font-weight:700;font-family:'Segoe UI',Roboto,sans-serif;">WEBSITE LEAD</td>
          <td width="10"></td>
          <td style="background-color:${statusColor};border-radius:20px;padding:7px 18px;font-size:10px;color:#ffffff;letter-spacing:0.8px;text-transform:uppercase;font-weight:700;font-family:'Segoe UI',Roboto,sans-serif;">${statusLabel}</td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="background-color:#f5f6f8;padding:26px 28px 16px;">
      <h2 style="margin:0;font-size:15px;color:#0f172a;font-weight:700;letter-spacing:0.3px;font-family:'Segoe UI',Roboto,sans-serif;">Recipient Details</h2>
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
            <p style="margin:0 0 10px;font-size:10px;color:${statusColor};font-weight:700;text-transform:uppercase;letter-spacing:0.8px;font-family:'Segoe UI',Roboto,sans-serif;">&#10022; STATUS UPDATE</p>
            <p style="margin:0;font-size:14px;color:#334155;line-height:1.65;font-family:'Segoe UI',Roboto,sans-serif;">${subtitle}</p>
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
</html>`;
};

const sendLeadStatusEmail = async ({ to, name, status }) => {
  if (!leadStatusMailer || !to) return false;
  if (status !== 'accepted' && status !== 'rejected') return false;

  const subject = status === 'accepted'
    ? 'Your Pruthvi Panthers Enquiry Has Been Accepted'
    : 'Update on Your Pruthvi Panthers Enquiry';

  const greetingName = name || 'there';
  const html = buildLeadStatusEmailHtml({ name: greetingName, email: to, status });

  const text = status === 'accepted'
    ? `Hi ${greetingName},\n\nThank you for contacting Pruthvi Panthers.\nYour enquiry has been accepted. Our team will connect with you shortly.\n\nRegards,\nPruthvi Panthers Team`
    : `Hi ${greetingName},\n\nThank you for contacting Pruthvi Panthers.\nYour enquiry has been marked as rejected at this time.\n\nRegards,\nPruthvi Panthers Team`;

  await leadStatusMailer.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  });

  return true;
};

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  const admin = authenticateAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const rows = await query('SELECT * FROM contact_form_submissions ORDER BY created_at DESC');
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, name, email, subject, message, status } = req.body;
      if (!id) return res.status(400).json({ message: 'Lead ID required' });

      const existing = await query('SELECT * FROM contact_form_submissions WHERE id = ? LIMIT 1', [id]);
      if (existing.length === 0) return res.status(404).json({ message: 'Lead not found' });
      const existingLead = existing[0];

      const updates = [];
      const params = [];
      if (typeof name !== 'undefined') { updates.push('name = ?'); params.push(name); }
      if (typeof email !== 'undefined') { updates.push('email = ?'); params.push(email); }
      if (typeof subject !== 'undefined') { updates.push('subject = ?'); params.push(subject); }
      if (typeof message !== 'undefined') { updates.push('message = ?'); params.push(message); }
      if (typeof status !== 'undefined') { updates.push('status = ?'); params.push(status); }

      if (updates.length > 0) {
        params.push(id);
        await query(`UPDATE contact_form_submissions SET ${updates.join(', ')} WHERE id = ?`, params);
      }

      const previousStatus = normalizeStatus(existingLead.status);
      const nextStatus = normalizeStatus(typeof status !== 'undefined' ? status : existingLead.status);
      const shouldNotify = (nextStatus === 'accepted' || nextStatus === 'rejected') && previousStatus !== nextStatus;

      let mailSent = false;
      let mailError = null;
      if (shouldNotify) {
        try {
          const to = email || existingLead.email;
          const receiverName = name || existingLead.name || 'there';
          mailSent = await sendLeadStatusEmail({ to, name: receiverName, status: nextStatus });
        } catch (err) {
          mailError = err.message;
        }
      }

      return res.status(200).json({
        message: 'Lead updated',
        mailSent,
        ...(mailError ? { mailError } : {}),
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    const id = req.query?.id || req.body?.id;
    if (!id) return res.status(400).json({ message: 'Lead ID required' });

    try {
      await query('DELETE FROM contact_form_submissions WHERE id = ?', [id]);
      return res.status(200).json({ message: 'Lead deleted' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
