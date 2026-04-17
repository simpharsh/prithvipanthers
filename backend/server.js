const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Pool Configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

if (process.env.DB_SSL === 'true') {
  dbConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = mysql.createPool(dbConfig);

const query = async (sql, params) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

// Set up public static folder for uploads
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer Config for local storage
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

// Email transporter
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

const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/* -------------------------------------------------------------------------- */
/*                                PUBLIC ROUTES                               */
/* -------------------------------------------------------------------------- */

app.get('/api/players', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true' || req.query.includeInactive === '1';
    let sql = 'SELECT * FROM players';
    if (!includeInactive) {
      sql += ' WHERE is_active = TRUE';
    }
    sql += ' ORDER BY id ASC';
    const data = await query(sql);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gallery', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true' || req.query.includeInactive === '1';
    const category = String(req.query.category || '').toLowerCase();

    let data;
    if (category === 'hero') {
      let sql = 'SELECT id, slot_name as name, image_url, is_active FROM hero_slides';
      if (!includeInactive) sql += ' WHERE is_active = TRUE';
      sql += ' ORDER BY slot_name ASC';
      data = await query(sql);
    } else if (category === 'achievements') {
      let sql = 'SELECT id, slot_name as name, image_url, is_active FROM achievements';
      if (!includeInactive) sql += ' WHERE is_active = TRUE';
      sql += ' ORDER BY slot_name ASC';
      data = await query(sql);
    } else {
      let sql = 'SELECT * FROM gallery';
      if (!includeInactive) sql += ' WHERE is_active = TRUE';
      sql += ' ORDER BY id DESC';
      data = await query(sql);
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/track-view', async (req, res) => {
  const { page } = req.body;
  if (!page) return res.status(200).send('OK');
  try {
    const sql = 'INSERT INTO page_views (page_name, view_count) VALUES (?, 1) ON DUPLICATE KEY UPDATE view_count = view_count + 1';
    await query(sql, [page]);
    res.status(200).send('OK');
  } catch (err) {
    res.status(200).send('OK'); // Fail silently for tracking
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message, subject } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required.' });
  }

  try {
    // Save to DB
    const sql = 'INSERT INTO contact_form_submissions (name, email, subject, message, status) VALUES (?, ?, ?, ?, ?)';
    await query(sql, [name, email, subject || null, message, 'new']);

    // Send confirmation email
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: [process.env.EMAIL_USER, 'info@pruthvipanthers.com', email],
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h1>New Contact Enquiry</h1>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Message:</strong><br/>${safeMessage}</p>
      `,
    });

    return res.status(201).json({ message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Contact error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                                ADMIN ROUTES                                */
/* -------------------------------------------------------------------------- */

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Required fields missing' });

    const rows = await query('SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE', [username]);
    const user = rows[0];

    if (user && password === user.password) { // In production, use bcrypt
      const token = jwt.sign({ role: 'admin', username: user.username }, JWT_SECRET, { expiresIn: '12h' });
      return res.json({ token });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/views', authenticateAdmin, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM page_views ORDER BY page_name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/leads', authenticateAdmin, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM contact_form_submissions ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Players Create
app.post('/api/admin/players', authenticateAdmin, upload.fields([{ name: 'cover' }, { name: 'photo' }]), async (req, res) => {
  try {
    const { name, role, is_active = true, player_image_url } = req.body;
    const coverUrl = req.files?.['cover']?.[0] ? `/uploads/${req.files['cover'][0].filename}` : null;
    const photoUrl = req.files?.['photo']?.[0] ? `/uploads/${req.files['photo'][0].filename}` : null;

    const sql = 'INSERT INTO players (name, role, cover_image_url, photo_image_url, player_image_url, is_active) VALUES (?, ?, ?, ?, ?, ?)';
    await query(sql, [name, role, coverUrl, photoUrl, player_image_url, is_active === 'true' || is_active === true]);
    res.json({ message: 'Player created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/players/:id', authenticateAdmin, async (req, res) => {
  try {
    await query('DELETE FROM players WHERE id = ?', [req.params.id]);
    res.json({ message: 'Player deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Gallery Create
app.post('/api/admin/gallery', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    const imageUrl = `/uploads/${req.file.filename}`;
    const sql = 'INSERT INTO gallery (name, image_url, is_active) VALUES (?, ?, ?)';
    await query(sql, [req.file.originalname, imageUrl, true]);
    res.json({ message: 'Gallery image uploaded', url: imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/gallery/:id', authenticateAdmin, async (req, res) => {
  try {
    await query('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    res.json({ message: 'Gallery image deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
