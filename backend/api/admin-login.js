import jwt from 'jsonwebtoken';
import { query } from '../_utils/db.js';
import { allowCors } from '../_utils/cors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-admin-key-2026';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const normalizedUsername = String(username).trim();
    const normalizedPassword = String(password);

    const rows = await query('SELECT username, password FROM admin_users WHERE username = ? AND is_active = TRUE LIMIT 1', [normalizedUsername]);

    if (rows.length > 0 && normalizedPassword === rows[0].password) {
      const token = jwt.sign({ role: 'admin', username: normalizedUsername }, JWT_SECRET, { expiresIn: '12h' });
      return res.status(200).json({ token });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    return res.status(500).json({ message: 'Login service unavailable', error: error.message });
  }
}
