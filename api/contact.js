import nodemailer from 'nodemailer';
import { adminSupabase, isAdminDbConnected } from './_utils/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required.' });
  }

  try {
    // Save to DB (leads)
    if (isAdminDbConnected) {
      await adminSupabase.from('contact_form_submissions').insert([{ full_name: name, email, message }]);
    }

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
        <div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0f172a;">Thank You for Your Contact Request!</h2>
          <p>Dear ${safeName},</p>
          <p>We've received your contact request and appreciate your interest in Pruthvi Panthers.</p>
          <p>Our team will review your request and contact you soon to discuss the next steps.</p>
          
          <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
          
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong><br/>${safeMessage}</p>
          
          <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
          
          <p>Thank you for choosing Pruthvi Panthers!</p>
          <p>Best regards,<br/>The Pruthvi Panthers Team</p>
        </div>
      `,
    });

    return res.status(201).json({ message: 'Message sent successfully.' });

  } catch (err) {
    console.error('Failed to handle contact submission:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
