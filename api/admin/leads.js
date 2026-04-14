import { getDb, isAdminDbConnected } from '../_utils/supabase.js';
import { authenticateAdmin } from '../_utils/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const admin = authenticateAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  if (!isAdminDbConnected) return res.status(200).json([]);

  const db = getDb();
  try {
    const { data, error } = await db
      .from('contact_form_submissions')
      .select('id, full_name, email, message, created_at')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
