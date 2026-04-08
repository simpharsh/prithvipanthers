const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

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

const normalizeUploadPath = (value) => {
  if (!value || typeof value !== 'string') return null;

  if (value.startsWith('http://') || value.startsWith('https://')) {
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

const readGalleryRows = async (db) => {
  let lastError = null;

  for (const tableName of GALLERY_TABLES) {
    const { data, error } = await db.from(tableName).select('*').order('id', { ascending: false });
    if (!error) {
      return { tableName, data: Array.isArray(data) ? data : [] };
    }
    lastError = error;
  }

  throw lastError;
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

const transporter = nodemailer.createTransport({
  service: 'gmail',
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
    const { data } = await readGalleryRows(db);
    const response = data.map(mapGalleryRowToResponse);
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
    const hasClubLogo = fs.existsSync(clubLogoPath);
    const hasClubAppIcon = fs.existsSync(clubAppIconPath);
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

    const emailAttachments = [];
    if (hasClubLogo) {
      emailAttachments.push({ filename: 'pruthvi-panthers-logo.png', path: clubLogoPath, cid: clubLogoCid });
    }
    if (hasClubAppIcon) {
      emailAttachments.push({ filename: 'pruthvi-panthers-app-icon.png', path: clubAppIconPath, cid: clubAppIconCid });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="display:none;font-size:1px;color:#0b1220;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
          New contact request from ${safeName}
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#eef2f7;padding:40px 20px;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:680px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 24px 48px rgba(15,23,42,0.1);">
                
                <!-- HEADER STRIP -->
                <tr>
                  <td style="padding:16px 32px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="left" style="color:#64748b;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Official Website Enquiry</td>
                        <td align="right" style="color:#94a3b8;font-size:12px;font-weight:500;letter-spacing:0.5px;">Panthers HQ Contact Desk</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- HERO SECTION -->
                <tr>
                  <td style="padding:48px 32px;background:linear-gradient(135deg, #111827 0%, #1e293b 100%);text-align:center;position:relative;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
                      <tr>
                        <td style="padding-right:12px;">${hasClubAppIcon ? `<img src="cid:${clubAppIconCid}" alt="Pruthvi Panthers App" width="48" height="48" style="display:block;border-radius:12px;box-shadow:0 8px 16px rgba(0,0,0,0.2);" />` : ''}</td>
                        <td>${hasClubLogo ? `<img src="cid:${clubLogoCid}" alt="Pruthvi Panthers Logo" width="88" height="88" style="display:block;object-fit:contain;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.3));" />` : ''}</td>
                        <td style="padding-left:12px;">${hasClubAppIcon ? `<img src="cid:${clubAppIconCid}" alt="Pruthvi Panthers App" width="48" height="48" style="display:block;border-radius:12px;box-shadow:0 8px 16px rgba(0,0,0,0.2);" />` : ''}</td>
                      </tr>
                    </table>
                    <div style="font-size:13px;color:#f87171;letter-spacing:4px;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Pruthvi Panthers</div>
                    <h2 style="margin:0 0 16px;color:#ffffff;font-size:36px;font-weight:800;line-height:1.2;letter-spacing:-0.5px;">New Message<br/>Received</h2>
                    <p style="margin:0 auto;color:#94a3b8;font-size:16px;line-height:1.6;max-width:400px;">A supporter has just submitted a new enquiry through the official website contact form.</p>
                    
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 0;">
                      <tr>
                        <td style="padding:8px 16px;background:rgba(255,255,255,0.1);color:#e2e8f0;border-radius:999px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;border:1px solid rgba(255,255,255,0.05);">Website Lead</td>
                        <td style="width:12px;"></td>
                        <td style="padding:8px 16px;background:rgba(244,90,70,0.2);color:#fca5a5;border-radius:999px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;border:1px solid rgba(244,90,70,0.3);">High Priority</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- DETAILS SECTION -->
                <tr>
                  <td style="padding:40px 32px;background:#ffffff;">
                    <h3 style="margin:0 0 24px;color:#0f172a;font-size:20px;font-weight:700;letter-spacing:-0.3px;border-bottom:2px solid #f1f5f9;padding-bottom:12px;">Sender Details</h3>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0 16px;">
                      <tr>
                        <td style="width:140px;padding:16px 20px;background:#f8fafc;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;border-radius:12px 0 0 12px;border:1px solid #e2e8f0;border-right:none;">Full Name</td>
                        <td style="padding:16px 20px;background:#ffffff;color:#0f172a;font-size:16px;font-weight:500;border-radius:0 12px 12px 0;border:1px solid #e2e8f0;border-left:none;">${safeName}</td>
                      </tr>
                      <tr>
                        <td style="width:140px;padding:16px 20px;background:#f8fafc;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;border-radius:12px 0 0 12px;border:1px solid #e2e8f0;border-right:none;">Email Address</td>
                        <td style="padding:16px 20px;background:#ffffff;color:#0f172a;font-size:16px;font-weight:500;border-radius:0 12px 12px 0;border:1px solid #e2e8f0;border-left:none;"><a href="mailto:${safeEmail}" style="color:#0ea5e9;text-decoration:none;">${safeEmail}</a></td>
                      </tr>
                    </table>
                    
                    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-top:24px;box-shadow:0 4px 6px rgba(0,0,0,0.02);">
                      <div style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;color:#64748b;margin-bottom:16px;display:flex;align-items:center;">
                        <span style="display:inline-block;width:8px;height:8px;background:#f45a46;border-radius:50%;margin-right:8px;"></span>
                        Message Content
                      </div>
                      <div style="font-size:16px;line-height:1.8;color:#334155;">${safeMessage}</div>
                    </div>
                  </td>
                </tr>

                <!-- ACTION SECTION -->
                <tr>
                  <td style="padding:16px 32px 48px;background:#ffffff;text-align:center;">
                    <a href="mailto:${safeEmail}" style="display:inline-block;background:linear-gradient(135deg, #f45a46 0%, #dc2626 100%);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:18px 40px;border-radius:999px;box-shadow:0 8px 20px rgba(244,90,70,0.3);">Reply to Enquiry</a>
                  </td>
                </tr>

                <!-- FOOTER STRIP -->
                <tr>
                  <td style="padding:24px 32px;background:#0f172a;border-top:1px solid #1e293b;text-align:center;">
                    <div style="font-size:12px;letter-spacing:0.8px;color:#64748b;text-transform:uppercase;font-weight:500;">
                      © ${new Date().getFullYear()} Pruthvi Panthers. strictly confidential.
                    </div>
                  </td>
                </tr>
              </table>
              <div style="padding-top:24px;text-align:center;color:#94a3b8;font-size:13px;">
                This email was sent automatically from the Pruthvi Panthers Website.
              </div>
            </td>
          </tr>
        </table>
      `,
      attachments: emailAttachments,
    });
  } catch (emailError) {
    console.warn('Failed to send email notification:', emailError.message);
  }

  return res.status(201).json({ message: 'Message sent successfully.' });
});

/* -------------------------------------------------------------------------- */
/*                                ADMIN ROUTES                                */
/* -------------------------------------------------------------------------- */

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'password123';

  if (username === adminUser && password === adminPass) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

app.get('/api/admin/views', authenticateAdmin, async (req, res) => {
  if (!isAdminDbConnected) return res.json([]);
  const { data, error } = await adminSupabase.from('page_views').select('*').order('page_name', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/admin/leads', authenticateAdmin, async (req, res) => {
  if (!isAdminDbConnected) return res.json([]);
  const { data, error } = await adminSupabase.from('contact_form_submissions').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Admin Players Create
app.post('/api/admin/players', authenticateAdmin, upload.fields([{ name: 'cover' }, { name: 'photo' }]), async (req, res) => {
  try {
    const { name, role } = req.body;
    const coverUrl = req.files?.['cover']?.[0] ? `/uploads/${req.files['cover'][0].filename}` : null;
    const photoUrl = req.files?.['photo']?.[0] ? `/uploads/${req.files['photo'][0].filename}` : null;

    console.log('[PLAYERS] Received upload:', { name, role, coverUrl, photoUrl });

    if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });
    const { data, error } = await adminSupabase.from('players').insert([{ name, role, cover_image_url: coverUrl, photo_image_url: photoUrl }]);
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
app.delete('/api/admin/players/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });
  const { error } = await adminSupabase.from('players').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Player deleted' });
});

// Admin Gallery Create
app.post('/api/admin/gallery', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    const imageUrl = `/uploads/${req.file.filename}`;

    console.log('[GALLERY] Received upload:', { imageUrl, filename: req.file.filename });

    if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });
    const { tableName } = await insertGalleryRow(adminSupabase, req.file);
    console.log('[GALLERY] Success in table:', tableName);
    res.json({ message: 'Gallery image uploaded', url: imageUrl });
  } catch (err) {
    console.error('[GALLERY] Caught error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Gallery Delete
app.delete('/api/admin/gallery/:id', authenticateAdmin, async (req, res) => {
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