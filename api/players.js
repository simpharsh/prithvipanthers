import { adminSupabase, getDb, isAdminDbConnected, isPublicDbConnected } from './_utils/supabase.js';
import { authenticateAdmin } from './_utils/auth.js';

export default async function handler(req, res) {
  const method = req.method;

  if (method === 'GET') {
    if (!isAdminDbConnected && !isPublicDbConnected) return res.status(200).json([]);
    const db = getDb();
    const { data, error } = await db.from('players').select('*').order('id', { ascending: true });
    
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  } 

  // Require Admin Token for POST and DELETE
  const admin = authenticateAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  if (method === 'POST') {
    // In Serverless, files are NOT uploaded to /public/uploads
    // Instead, the frontend should directly upload the image to Supabase Storage, 
    // and then only send the { name, role, cover_image_url, photo_image_url } to this endpoint.
    try {
      const { name, role, cover_image_url, photo_image_url } = req.body;
      
      if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });
      
      const { data, error } = await adminSupabase
        .from('players')
        .insert([{ name, role, cover_image_url, photo_image_url }]);
        
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ message: 'Player created', data });
      
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'PUT') {
    try {
      const { id, name, role, cover_image_url, photo_image_url } = req.body;
      
      if (!id) return res.status(400).json({ message: 'Player ID required' });
      if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });
      
      const payload = { name, role };
      if (cover_image_url) payload.cover_image_url = cover_image_url;
      if (photo_image_url) payload.photo_image_url = photo_image_url;

      const { data, error } = await adminSupabase
        .from('players')
        .update(payload)
        .eq('id', id);
        
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ message: 'Player updated', data });
      
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'Player ID required' });
    if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });

    const { error } = await adminSupabase.from('players').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(200).json({ message: 'Player deleted' });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
