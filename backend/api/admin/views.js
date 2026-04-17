import { query } from '../_utils/db.js';
import { authenticateAdmin } from '../_utils/auth.js';
import { allowCors } from '../_utils/cors.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const admin = authenticateAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const rows = await query('SELECT id, page_name, view_count FROM page_views ORDER BY page_name ASC');
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
