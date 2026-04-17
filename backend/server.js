const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Set up public static folder for uploads
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
const clubLogoPath = path.join(__dirname, '..', 'frontend', 'src', 'assets', 'common', 'logo.png');
const clubLogoCid = 'pruthvi-panthers-logo';
const clubAppIconPath = path.join(__dirname, '..', 'frontend', 'src', 'assets', 'common', 'android-chrome-192x192.png');
const clubAppIconCid = 'pruthvi-panthers-app-icon';

const GALLERY_TABLES = ['gallary', 'gallery'];
const ACHIEVEMENTS_TABLE = 'achievements';
const HERO_SLIDES_TABLE = 'hero_slides';
const ACHIEVEMENT_NAME_PREFIX = 'achievement-';
const HERO_NAME_PREFIX = 'hero-';
const HERO_LIMIT = 3;

const isAchievementRow = (row) => String(row?.name || '').toLowerCase().startsWith(ACHIEVEMENT_NAME_PREFIX);
const isHeroRow = (row) => String(row?.name || '').toLowerCase().startsWith(HERO_NAME_PREFIX);
const isAchievementsCategory = ({ category, name }) => {
  const normalizedCategory = String(category || '').toLowerCase();
  const normalizedName = String(name || '').toLowerCase();
  return normalizedCategory === 'achievements' || normalizedName.startsWith(ACHIEVEMENT_NAME_PREFIX);
};

const isHeroCategory = ({ category, name }) => {
  const normalizedCategory = String(category || '').toLowerCase();
  const normalizedName = String(name || '').toLowerCase();
  return normalizedCategory === 'hero' || normalizedName.startsWith(HERO_NAME_PREFIX);
};

const normalizeAchievementSlotName = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized.startsWith(ACHIEVEMENT_NAME_PREFIX)) return null;
  return normalized;
};

const normalizeHeroSlotName = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized.startsWith(HERO_NAME_PREFIX)) return null;
  return normalized;
};

const normalizeUploadPath = (value) => {
  if (!value || typeof value !== 'string') return null;

  if (value.startsWith('http://') || value.startsWith('https://')) {
    if (value.includes('supabase.co')) return value;
    const uploadsIndex = value.indexOf('/uploads/');
    return uploadsIndex >= 0 ? value.slice(uploadsIndex) : value;
  }

  if (value.startsWith('/uploads/')) return value;
  if (value.startsWith('uploads/')) return `/${value}`;

  // If DB stores only filename/image id, serve from backend uploads.
  return `/uploads/${path.basename(value)}`;
};

const mapGalleryRowToResponse = (row) => {
  const candidatePath =
    row?.image_url ||
    row?.imageUrl ||
    row?.image_id ||
    row?.imageId ||
    row?.image_name ||
    row?.imageName ||
    row?.filename ||
    row?.file_name ||
    row?.name ||
    row?.url;

  return {
    ...row,
    image_url: normalizeUploadPath(candidatePath),
  };
};

const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const normalizeStatus = (value) => String(value || '').trim().toLowerCase();

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
          <img src="${process.env.REACT_APP_SUPABASE_URL || 'https://mpyxfritlulkxtnpbiqr.supabase.co'}/storage/v1/object/public/uploads/logo.png"
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
  if (!to) return false;
  if (status !== 'accepted' && status !== 'rejected') return false;

  const subject = status === 'accepted'
    ? 'Your Pruthvi Panthers Enquiry Has Been Accepted'
    : 'Update on Your Pruthvi Panthers Enquiry';

  const html = buildLeadStatusEmailHtml({ name, email: to, status });

  const text = status === 'accepted'
    ? `Hi ${name || 'there'},\n\nThank you for contacting Pruthvi Panthers.\nYour enquiry has been accepted. Our team will connect with you shortly.\n\nRegards,\nPruthvi Panthers Team`
    : `Hi ${name || 'there'},\n\nThank you for contacting Pruthvi Panthers.\nYour enquiry has been marked as rejected at this time.\n\nRegards,\nPruthvi Panthers Team`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  });

  return true;
};

const readGalleryRows = async (db) => {
  let lastError = null;
  let fallbackResult = null;

  for (const tableName of GALLERY_TABLES) {
    const { data, error } = await db.from(tableName).select('*').order('id', { ascending: false });
    if (!error) {
      const rows = Array.isArray(data) ? data : [];
      if (rows.length > 0) {
        return { tableName, data: rows };
      }
      if (!fallbackResult) fallbackResult = { tableName, data: rows };
    }
    lastError = error;
  }

  if (fallbackResult) return fallbackResult;
  throw lastError;
};

const readAchievementRows = async (db) => {
  const { data, error } = await db
    .from(ACHIEVEMENTS_TABLE)
    .select('id, slot_name, image_url, is_active, created_at, updated_at')
    .order('slot_name', { ascending: true });

  if (error) throw error;

  return Array.isArray(data) ? data : [];
};

const readHeroRows = async (db) => {
  const { data, error } = await db
    .from(HERO_SLIDES_TABLE)
    .select('id, slot_name, image_url, is_active, created_at, updated_at')
    .order('slot_name', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

const insertGalleryRow = async (db, file) => {
  const payloadByTable = {
    gallary: {
      name: file.originalname,
      image_id: file.filename,
    },
    gallery: {
      image_url: `/uploads/${file.filename}`,
    },
  };

  let lastError = null;

  for (const tableName of GALLERY_TABLES) {
    const payload = payloadByTable[tableName];
    if (!payload) continue;

    const { error } = await db.from(tableName).insert([payload]);
    if (!error) return { tableName };
    lastError = error;
  }

  throw lastError;
};

let isPublicDbConnected = false;
let isAdminDbConnected = false;

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.REACT_APP_SUPABASE_URL;
const publicSupabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const adminSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const publicSupabase = supabaseUrl && publicSupabaseKey ? createClient(supabaseUrl, publicSupabaseKey) : null;
const adminSupabase = supabaseUrl && adminSupabaseKey ? createClient(supabaseUrl, adminSupabaseKey) : null;

if (!publicSupabase) {
  console.warn('Public Supabase client is not configured. Set SUPABASE_URL and a public anon key.');
} else {
  isPublicDbConnected = true;
}

if (!adminSupabase) {
  console.warn('Admin Supabase client is not configured. Set SUPABASE_SERVICE_ROLE_KEY for write operations.');
} else {
  isAdminDbConnected = true;
}

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

// Admin Auth Middleware
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-admin-key-2026';
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.admin = decoded;
    next();
  });
};

/* -------------------------------------------------------------------------- */
/*                                PUBLIC ROUTES                               */
/* -------------------------------------------------------------------------- */

app.get('/api/players', async (req, res) => {
  if (!isAdminDbConnected && !isPublicDbConnected) return res.json([]);
  const db = adminSupabase || publicSupabase;
  const { data, error } = await db.from('players').select('*').order('id', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/gallery', async (req, res) => {
  if (!isAdminDbConnected && !isPublicDbConnected) return res.json([]);
  const db = adminSupabase || publicSupabase;
  try {
    const includeInactive = req.query.includeInactive === '1' || req.query.includeInactive === 'true';
    const mediaLinkedOnly = req.query.mediaLinked === '1' || req.query.mediaLinked === 'true';
    const category = String(req.query.category || '').toLowerCase();

    if (category === 'hero') {
      const heroRows = await readHeroRows(db);
      const response = heroRows
        .map((row) => ({
          id: row.id,
          name: row.slot_name,
          image_url: row.image_url,
          is_active: row.is_active,
          is_media_linked: false,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }))
        .filter((row) => (includeInactive ? true : row.is_active !== false))
        .filter((row) => (mediaLinkedOnly ? row.is_media_linked === true : true));

      return res.json(response);
    }

    if (category === 'achievements') {
      try {
        const achievementRows = await readAchievementRows(db);
        const normalizedAchievements = achievementRows.map((row) => ({
          id: row.id,
          name: row.slot_name,
          image_url: row.image_url,
          is_active: row.is_active,
          is_media_linked: false,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));

        const { data: legacyRows } = await readGalleryRows(db);
        const legacyAchievements = legacyRows
          .map(mapGalleryRowToResponse)
          .filter((row) => isAchievementRow(row));

        const mergedBySlot = new Map();
        normalizedAchievements.forEach((row) => mergedBySlot.set(String(row.name).toLowerCase(), row));
        legacyAchievements.forEach((row) => {
          const key = String(row?.name || '').toLowerCase();
          if (!mergedBySlot.has(key)) mergedBySlot.set(key, row);
        });

        const response = Array.from(mergedBySlot.values())
          .filter((row) => (includeInactive ? true : row.is_active !== false))
          .filter((row) => (mediaLinkedOnly ? false : true));

        return res.json(response);
      } catch (achievementsError) {
        console.warn('Achievements table read failed, falling back to gallery table:', achievementsError.message);
      }
    }

    const { data } = await readGalleryRows(db);
    const response = data
      .map(mapGalleryRowToResponse)
      .filter((row) => {
        if (category === 'achievements') return isAchievementRow(row);
        return !isAchievementRow(row) && !isHeroRow(row);
      })
      .filter((row) => (includeInactive ? true : row.is_active !== false))
      .filter((row) => (mediaLinkedOnly ? row.is_media_linked === true : true));
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/track-view', async (req, res) => {
  const { page } = req.body;
  if (!page || !isAdminDbConnected) return res.status(200).send('OK');

  // Increment view count via an RPC or query, here we fetch then update for simplicity
  const { data } = await adminSupabase.from('page_views').select('view_count').eq('page_name', page).single();
  if (data) {
    await adminSupabase.from('page_views').update({ view_count: data.view_count + 1 }).eq('page_name', page);
  } else {
    // try insert if not exists
    await adminSupabase.from('page_views').insert([{ page_name: page, view_count: 1 }]);
  }
  res.status(200).send('OK');
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required.' });
  }

  // Save to DB (leads)
  if (isAdminDbConnected) {
    await adminSupabase.from('contact_form_submissions').insert([{ full_name: name, email, message }]);
  }

  // Send confirmation email to admin
  try {
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

<!-- Outer wrapper -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e8e8e8;padding:32px 16px;">
<tr><td align="center">

<!-- Email card -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;border-radius:18px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.18);">

  <!-- ===== TOP BAR ===== -->
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

  <!-- ===== HERO / BRANDING ===== -->
  <tr>
    <td align="center" style="background-color:#111827;background-image:linear-gradient(180deg,#0f172a 0%,#1a2332 100%);padding:40px 30px 32px;text-align:center;">

      <!-- Logo -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
        <tr><td align="center">
          <img src="${process.env.REACT_APP_SUPABASE_URL || 'https://mpyxfritlulkxtnpbiqr.supabase.co'}/storage/v1/object/public/uploads/logo.png" 
               alt="Pruthvi Panthers" width="90" height="90" 
               style="display:block;width:90px;height:90px;object-fit:contain;border:0;" />
        </td></tr>
      </table>

      <!-- Brand name -->
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:4px;color:#f05244;font-weight:700;text-transform:uppercase;font-family:'Segoe UI',Roboto,sans-serif;">PRUTHVI PANTHERS</p>

      <!-- Heading -->
      <h1 style="margin:6px 0 8px;font-size:30px;color:#ffffff;font-weight:800;line-height:1.15;font-family:Georgia,'Times New Roman',serif;">New Message<br/>Received</h1>

      <!-- Subtitle -->
      <p style="margin:0 0 22px;font-size:13px;color:#8896ab;line-height:1.55;font-family:'Segoe UI',Roboto,sans-serif;">A supporter has just submitted a new enquiry<br/>through the official website contact form.</p>

      <!-- Badges -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
        <tr>
          <td style="background-color:#1a2332;border:1px solid #2d3a4e;border-radius:20px;padding:7px 18px;font-size:10px;color:#8896ab;letter-spacing:0.8px;text-transform:uppercase;font-weight:700;font-family:'Segoe UI',Roboto,sans-serif;">WEBSITE LEAD</td>
          <td width="10"></td>
          <td style="background-color:#f05244;border-radius:20px;padding:7px 18px;font-size:10px;color:#ffffff;letter-spacing:0.8px;text-transform:uppercase;font-weight:700;font-family:'Segoe UI',Roboto,sans-serif;">HIGH PRIORITY</td>
        </tr>
      </table>

    </td>
  </tr>

  <!-- ===== SENDER DETAILS HEADER ===== -->
  <tr>
    <td style="background-color:#f5f6f8;padding:26px 28px 16px;">
      <h2 style="margin:0;font-size:15px;color:#0f172a;font-weight:700;letter-spacing:0.3px;font-family:'Segoe UI',Roboto,sans-serif;">Sender Details</h2>
    </td>
  </tr>

  <!-- ===== FULL NAME ROW ===== -->
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

  <!-- ===== EMAIL ROW ===== -->
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

  <!-- ===== MESSAGE CONTENT ===== -->
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

  <!-- ===== CTA BUTTON ===== -->
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

  <!-- ===== FOOTER ===== -->
  <tr>
    <td style="background-color:#0b1120;padding:20px 24px;text-align:center;">
      <p style="margin:0;font-size:10px;color:#4a5568;letter-spacing:0.5px;font-family:'Segoe UI',Roboto,sans-serif;">&copy; ${new Date().getFullYear()} <span style="color:#f05244;font-weight:700;">PRUTHVI</span> <span style="color:#7a8599;">PANTHERS. STRICTLY CONFIDENTIAL.</span></p>
    </td>
  </tr>

</table>
<!-- /Email card -->

</td></tr>
</table>
<!-- /Outer wrapper -->

</body>
</html>
      `,
    });
  } catch (emailError) {
    console.warn('Failed to send email notification:', emailError.message);
  }

  return res.status(201).json({ message: 'Message sent successfully.' });
});

/* -------------------------------------------------------------------------- */
/*                                ADMIN ROUTES                                */
/* -------------------------------------------------------------------------- */

app.post('/api/players', async (req, res) => {
  const { name, role, cover_image_url, photo_image_url, player_image_url, is_active = true } = req.body;
  if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });
  const { data, error } = await adminSupabase.from('players').insert([{ name, role, cover_image_url, photo_image_url, player_image_url, is_active }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: 'Player created', data });
});

app.put('/api/players', async (req, res) => {
  const { id, name, role, cover_image_url, photo_image_url, player_image_url, is_active } = req.body;
  if (!id) return res.status(400).json({ message: 'Player ID required' });
  if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });
  const payload = {};
  if (typeof name !== 'undefined') payload.name = name;
  if (typeof role !== 'undefined') payload.role = role;
  if (typeof cover_image_url !== 'undefined') payload.cover_image_url = cover_image_url;
  if (typeof photo_image_url !== 'undefined') payload.photo_image_url = photo_image_url;
  if (typeof player_image_url !== 'undefined') payload.player_image_url = player_image_url;
  if (typeof is_active !== 'undefined') payload.is_active = is_active;
  const { data, error } = await adminSupabase.from('players').update(payload).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: 'Player updated', data });
});

app.delete('/api/players', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ message: 'Player ID required' });
  if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });
  const { error } = await adminSupabase.from('players').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: 'Player deleted' });
});

app.post('/api/gallery', async (req, res) => {
  const { image_url, name, is_active = true, is_media_linked = false, category } = req.body;
  if (!image_url) return res.status(400).json({ message: 'No image URL provided' });
  if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });

  try {
    const isAchievements = isAchievementsCategory({ category, name });
    const isHero = isHeroCategory({ category, name });

    if (isAchievements) {
      const slotName = normalizeAchievementSlotName(name);
      if (!slotName) {
        return res.status(400).json({ message: 'Achievement slot name is required (example: achievement-1).' });
      }

      const { data: existingSlot, error: existingSlotError } = await adminSupabase
        .from(ACHIEVEMENTS_TABLE)
        .select('id')
        .eq('slot_name', slotName)
        .maybeSingle();

      if (existingSlotError) return res.status(500).json({ error: existingSlotError.message });

      if (existingSlot) {
        const { error: updateError } = await adminSupabase
          .from(ACHIEVEMENTS_TABLE)
          .update({ image_url, is_active })
          .eq('id', existingSlot.id);

        if (updateError) return res.status(500).json({ error: updateError.message });
        return res.status(200).json({ message: 'Achievement updated', url: image_url });
      }

      const { count, error: countError } = await adminSupabase
        .from(ACHIEVEMENTS_TABLE)
        .select('id', { count: 'exact', head: true });

      if (countError) return res.status(500).json({ error: countError.message });
      if ((count || 0) >= 4) {
        return res.status(400).json({ message: 'Achievement limit reached. Max 4 images allowed.' });
      }

      const { error: insertError } = await adminSupabase
        .from(ACHIEVEMENTS_TABLE)
        .insert([{ slot_name: slotName, image_url, is_active }]);

      if (insertError) return res.status(500).json({ error: insertError.message });
      return res.status(201).json({ message: 'Achievement saved', url: image_url });
    }

    if (isHero) {
      const slotName = normalizeHeroSlotName(name);
      if (!slotName) {
        return res.status(400).json({ message: 'Hero slot name is required (example: hero-1).' });
      }

      const { data: existingSlot, error: existingSlotError } = await adminSupabase
        .from(HERO_SLIDES_TABLE)
        .select('id')
        .eq('slot_name', slotName)
        .maybeSingle();

      if (existingSlotError) return res.status(500).json({ error: existingSlotError.message });

      if (existingSlot) {
        const { error: updateError } = await adminSupabase
          .from(HERO_SLIDES_TABLE)
          .update({ image_url, is_active })
          .eq('id', existingSlot.id);

        if (updateError) return res.status(500).json({ error: updateError.message });
        return res.status(200).json({ message: 'Hero slide updated', url: image_url });
      }

      const { count: heroCount, error: heroCountError } = await adminSupabase
        .from(HERO_SLIDES_TABLE)
        .select('id', { count: 'exact', head: true });

      if (heroCountError) return res.status(500).json({ error: heroCountError.message });
      if ((heroCount || 0) >= HERO_LIMIT) {
        return res.status(400).json({ message: 'Hero slider limit reached. Max 3 images allowed.' });
      }

      const { error: insertError } = await adminSupabase
        .from(HERO_SLIDES_TABLE)
        .insert([{ slot_name: slotName, image_url, is_active }]);

      if (insertError) throw insertError;
      return res.status(201).json({ message: 'Hero slide saved', url: image_url });
    }

    let error = null;
    const existingRows = await readGalleryRows(adminSupabase);
    const scopedRows = existingRows.data.filter((row) => !isAchievementRow(row) && !isHeroRow(row));
    if (scopedRows.length >= 5) {
      return res.status(400).json({ message: 'Gallery limit reached. Max 5 images allowed.' });
    }

    const payload = { name: name || null, image_url, is_active, is_media_linked };
    const { error: err1 } = await adminSupabase.from('gallery').insert([payload]);
    error = err1;
    
    if (error) {
       const { error: err2 } = await adminSupabase.from('gallary').insert([{ name: name || 'gallery_img', image_id: image_url, is_active, is_media_linked }]);
       error = err2;
    }
    
    if (error) throw error;
    res.status(201).json({ message: 'Gallery image saved', url: image_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/gallery', async (req, res) => {
  const { id, image_url, name, is_active, is_media_linked, category } = req.body;
  if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });

  const isAchievements = isAchievementsCategory({ category, name });
  const isHero = isHeroCategory({ category, name });

  if (isAchievements) {
    const slotName = normalizeAchievementSlotName(name);
    if (!id && !slotName) return res.status(400).json({ message: 'Achievement ID or slot name is required' });

    const achievementPayload = {};
    if (typeof image_url !== 'undefined') achievementPayload.image_url = image_url;
    if (typeof is_active !== 'undefined') achievementPayload.is_active = is_active;
    if (slotName) achievementPayload.slot_name = slotName;

    let updateQuery = adminSupabase.from(ACHIEVEMENTS_TABLE).update(achievementPayload);
    if (id) {
      updateQuery = updateQuery.eq('id', id);
    } else {
      updateQuery = updateQuery.eq('slot_name', slotName);
    }

    const { data, error } = await updateQuery.select('id');
    if (error) return res.status(500).json({ error: error.message });

    if ((!Array.isArray(data) || data.length === 0) && slotName) {
      const fallback = await adminSupabase
        .from(ACHIEVEMENTS_TABLE)
        .update(achievementPayload)
        .eq('slot_name', slotName)
        .select('id');

      if (fallback.error) return res.status(500).json({ error: fallback.error.message });
      if (!Array.isArray(fallback.data) || fallback.data.length === 0) {
        return res.status(404).json({ message: 'Achievement not found' });
      }
    }

    return res.status(200).json({ message: 'Achievement updated' });
  }

  if (isHero) {
    const slotName = normalizeHeroSlotName(name);
    if (!id && !slotName) return res.status(400).json({ message: 'Hero ID or slot name is required' });

    const heroPayload = {};
    if (typeof image_url !== 'undefined') heroPayload.image_url = image_url;
    if (typeof is_active !== 'undefined') heroPayload.is_active = is_active;
    if (slotName) heroPayload.slot_name = slotName;

    let updateQuery = adminSupabase.from(HERO_SLIDES_TABLE).update(heroPayload);
    if (id) {
      updateQuery = updateQuery.eq('id', id);
    } else {
      updateQuery = updateQuery.eq('slot_name', slotName);
    }

    const { data, error } = await updateQuery.select('id');
    if (error) return res.status(500).json({ error: error.message });

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ message: 'Hero slide not found' });
    }

    return res.status(200).json({ message: 'Hero slide updated' });
  }

  if (!id) return res.status(400).json({ message: 'Image ID required' });

  const payload = {};
  if (typeof image_url !== 'undefined') payload.image_url = image_url;
  if (typeof name !== 'undefined') payload.name = name;
  if (typeof is_active !== 'undefined') payload.is_active = is_active;
  if (typeof is_media_linked !== 'undefined') payload.is_media_linked = is_media_linked;

  const galleryUpdate = await adminSupabase.from('gallery').update(payload).eq('id', id).select('id');
  if (!galleryUpdate.error && Array.isArray(galleryUpdate.data) && galleryUpdate.data.length > 0) {
    return res.status(200).json({ message: 'Gallery image updated' });
  }

  const p2 = { ...payload, ...(typeof image_url !== 'undefined' ? { image_id: image_url } : {}) };
  const gallaryUpdate = await adminSupabase.from('gallary').update(p2).eq('id', id).select('id');
  if (gallaryUpdate.error) return res.status(500).json({ error: gallaryUpdate.error.message });
  if (!Array.isArray(gallaryUpdate.data) || gallaryUpdate.data.length === 0) {
    return res.status(404).json({ message: 'Image not found' });
  }

  res.status(200).json({ message: 'Gallery image updated' });
});

app.delete('/api/gallery', async (req, res) => {
  const { id, category, name } = req.query;
  if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });

  const isAchievements = isAchievementsCategory({ category, name });
  const isHero = isHeroCategory({ category, name });

  if (isAchievements) {
    const slotName = normalizeAchievementSlotName(name);
    if (!id && !slotName) return res.status(400).json({ message: 'Achievement ID or slot name is required' });

    let deleteQuery = adminSupabase.from(ACHIEVEMENTS_TABLE).delete();
    if (id) {
      deleteQuery = deleteQuery.eq('id', id);
    } else {
      deleteQuery = deleteQuery.eq('slot_name', slotName);
    }

    const { data, error } = await deleteQuery.select('id');
    if (error) return res.status(500).json({ error: error.message });
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    return res.status(200).json({ message: 'Achievement deleted' });
  }

  if (isHero) {
    const slotName = normalizeHeroSlotName(name);
    if (!id && !slotName) return res.status(400).json({ message: 'Hero ID or slot name is required' });

    let deleteQuery = adminSupabase.from(HERO_SLIDES_TABLE).delete();
    if (id) {
      deleteQuery = deleteQuery.eq('id', id);
    } else {
      deleteQuery = deleteQuery.eq('slot_name', slotName);
    }

    const { data, error } = await deleteQuery.select('id');
    if (error) return res.status(500).json({ error: error.message });
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ message: 'Hero slide not found' });
    }

    return res.status(200).json({ message: 'Hero slide deleted' });
  }

  if (!id) return res.status(400).json({ message: 'Image ID required' });

  const galleryDelete = await adminSupabase.from('gallery').delete().eq('id', id).select('id');
  if (!galleryDelete.error && Array.isArray(galleryDelete.data) && galleryDelete.data.length > 0) {
    return res.status(200).json({ message: 'Gallery image deleted' });
  }

  const gallaryDelete = await adminSupabase.from('gallary').delete().eq('id', id).select('id');
  if (gallaryDelete.error) return res.status(500).json({ error: gallaryDelete.error.message });
  if (!Array.isArray(gallaryDelete.data) || gallaryDelete.data.length === 0) {
    return res.status(404).json({ message: 'Image not found' });
  }

  res.status(200).json({ message: 'Gallery image deleted' });
});

app.post('/api/admin/login', async (req, res) => {
  try {
    if (!isAdminDbConnected) {
      return res.status(500).json({ message: 'Admin database connection is not configured.' });
    }

    const body = req.body || {};
    const { username, password } = body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const normalizedUsername = String(username).trim();
    const normalizedPassword = String(password);

    const { data, error } = await adminSupabase
      .from('admin_users')
      .select('username, password, is_active')
      .eq('username', normalizedUsername)
      .eq('is_active', true)
      .maybeSingle();

    if (!error && data && normalizedPassword === data.password) {
      const token = jwt.sign({ role: 'admin', username: normalizedUsername }, JWT_SECRET, { expiresIn: '12h' });
      return res.json({ token });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    return res.status(500).json({ message: 'Login service unavailable', error: error.message });
  }
});

app.get('/api/admin/views', async (req, res) => {
  if (!isAdminDbConnected) return res.json([]);
  const { data, error } = await adminSupabase.from('page_views').select('*').order('page_name', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/admin/leads', async (req, res) => {
  if (!isAdminDbConnected) return res.json([]);
  const { data, error } = await adminSupabase.from('contact_form_submissions').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put('/api/admin/leads', async (req, res) => {
  const { id, full_name, email, message, source, status } = req.body;
  if (!id) return res.status(400).json({ message: 'Lead ID required' });
  if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });

  const { data: existingLead, error: existingLeadError } = await adminSupabase
    .from('contact_form_submissions')
    .select('id, full_name, email, status')
    .eq('id', id)
    .maybeSingle();

  if (existingLeadError) return res.status(500).json({ error: existingLeadError.message });
  if (!existingLead) return res.status(404).json({ message: 'Lead not found' });

  const payload = {};
  if (typeof full_name !== 'undefined') payload.full_name = full_name;
  if (typeof email !== 'undefined') payload.email = email;
  if (typeof message !== 'undefined') payload.message = message;
  if (typeof source !== 'undefined') payload.source = source;
  if (typeof status !== 'undefined') payload.status = status;

  const { data, error } = await adminSupabase.from('contact_form_submissions').update(payload).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });

  const previousStatus = normalizeStatus(existingLead.status);
  const nextStatus = normalizeStatus(typeof status !== 'undefined' ? status : existingLead.status);
  const shouldNotify = (nextStatus === 'accepted' || nextStatus === 'rejected') && previousStatus !== nextStatus;

  let mailSent = false;
  let mailError = null;
  if (shouldNotify) {
    try {
      mailSent = await sendLeadStatusEmail({
        to: email || existingLead.email,
        name: full_name || existingLead.full_name,
        status: nextStatus,
      });
    } catch (err) {
      mailError = err.message;
    }
  }

  res.json({ message: 'Lead updated', data, mailSent, ...(mailError ? { mailError } : {}) });
});

app.delete('/api/admin/leads', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ message: 'Lead ID required' });
  if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });

  const { error } = await adminSupabase.from('contact_form_submissions').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Lead deleted' });
});

// Admin Players Create
app.post('/api/admin/players', upload.fields([{ name: 'cover' }, { name: 'photo' }]), async (req, res) => {
  try {
    const { name, role, is_active = true, player_image_url } = req.body;
    const coverUrl = req.files?.['cover']?.[0] ? `/uploads/${req.files['cover'][0].filename}` : null;
    const photoUrl = req.files?.['photo']?.[0] ? `/uploads/${req.files['photo'][0].filename}` : null;

    console.log('[PLAYERS] Received upload:', { name, role, coverUrl, photoUrl, player_image_url, is_active });

    if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });
    const { data, error } = await adminSupabase.from('players').insert([{ name, role, cover_image_url: coverUrl, photo_image_url: photoUrl, player_image_url, is_active }]);
    if (error) {
      console.error('[PLAYERS] Database error:', error);
      return res.status(500).json({ error: error.message });
    }
    console.log('[PLAYERS] Success:', data);
    res.json({ message: 'Player created' });
  } catch (err) {
    console.error('[PLAYERS] Caught error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Players Delete
app.delete('/api/admin/players/:id', async (req, res) => {
  const { id } = req.params;
  if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });
  const { error } = await adminSupabase.from('players').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Player deleted' });
});

app.put('/api/admin/players/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role, cover_image_url, photo_image_url, player_image_url, is_active } = req.body;
  if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });

  const payload = {};
  if (typeof name !== 'undefined') payload.name = name;
  if (typeof role !== 'undefined') payload.role = role;
  if (typeof cover_image_url !== 'undefined') payload.cover_image_url = cover_image_url;
  if (typeof photo_image_url !== 'undefined') payload.photo_image_url = photo_image_url;
  if (typeof player_image_url !== 'undefined') payload.player_image_url = player_image_url;
  if (typeof is_active !== 'undefined') payload.is_active = is_active;

  const { error } = await adminSupabase.from('players').update(payload).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Player updated' });
});

// Generic admin image upload (no DB write)
app.post('/api/admin/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ message: 'Image uploaded', url: imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Gallery Create
app.post('/api/admin/gallery', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    const imageUrl = `/uploads/${req.file.filename}`;

    console.log('[GALLERY] Received upload:', { imageUrl, filename: req.file.filename });

    if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });
    const { data: existingImages } = await adminSupabase.from('gallery').select('id');
    if ((existingImages || []).length >= 5) return res.status(400).json({ message: 'Gallery limit reached. Max 5 images allowed.' });
    const { tableName } = await insertGalleryRow(adminSupabase, req.file);
    console.log('[GALLERY] Success in table:', tableName);
    res.json({ message: 'Gallery image uploaded', url: imageUrl });
  } catch (err) {
    console.error('[GALLERY] Caught error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/gallery/:id', async (req, res) => {
  const { id } = req.params;
  const { image_url, name, is_active, is_media_linked } = req.body;
  if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });

  const payload = {};
  if (typeof image_url !== 'undefined') payload.image_url = image_url;
  if (typeof name !== 'undefined') payload.name = name;
  if (typeof is_active !== 'undefined') payload.is_active = is_active;
  if (typeof is_media_linked !== 'undefined') payload.is_media_linked = is_media_linked;

  const { error } = await adminSupabase.from('gallery').update(payload).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Gallery image updated' });
});

// Admin Gallery Delete
app.delete('/api/admin/gallery/:id', async (req, res) => {
  const { id } = req.params;
  if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });
  const { error } = await adminSupabase.from('gallery').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Gallery image deleted' });
});

// Error handling middleware (must be at the end)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('[MULTER] Error:', err.message);
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err) {
    console.error('[MIDDLEWARE] Error:', err);
    return res.status(500).json({ error: `Server error: ${err.message || 'Unknown error'}` });
  }
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});