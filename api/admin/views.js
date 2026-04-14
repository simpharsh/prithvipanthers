import { getDb } from '../_utils/supabase.js';
import { authenticateAdmin } from '../_utils/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const admin = authenticateAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  const db = getDb();
  if (!db) return res.status(503).json({ error: 'No Supabase connection configured.' });

  try {
    const { data, error } = await db
      .from('page_views')
      .select('id, page_name, view_count, created_at')
      .order('page_name', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
