import jwt from 'jsonwebtoken';
import { adminSupabase, isAdminDbConnected } from '../_utils/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-admin-key-2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const normalizedUsername = String(username).trim();
  const normalizedPassword = String(password);
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'password123';
  let isValidCredential = false;

  if (isAdminDbConnected) {
    const { data, error } = await adminSupabase
      .from('admin_users')
      .select('username, password, is_active')
      .eq('username', normalizedUsername)
      .eq('is_active', true)
      .maybeSingle();

    if (!error && data) {
      isValidCredential = normalizedPassword === data.password;
    }
  }

  if (!isValidCredential) {
    isValidCredential = normalizedUsername === adminUser && normalizedPassword === adminPass;
  }

  if (isValidCredential) {
    const token = jwt.sign({ role: 'admin', username: normalizedUsername }, JWT_SECRET, { expiresIn: '12h' });
    return res.status(200).json({ token });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
}
