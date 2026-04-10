import { getDb, isAdminDbConnected, isPublicDbConnected, adminSupabase } from './_utils/supabase.js';
import { authenticateAdmin } from './_utils/auth.js';

const GALLERY_TABLES = ['gallary', 'gallery'];

export default async function handler(req, res) {
  const method = req.method;

  if (method === 'GET') {
    if (!isAdminDbConnected && !isPublicDbConnected) return res.status(200).json([]);
    const db = getDb();
    
    try {
      let data = [];
      let lastError = null;

      for (const tableName of GALLERY_TABLES) {
        const result = await db.from(tableName).select('*').order('id', { ascending: false });
        if (!result.error) {
          data = Array.isArray(result.data) ? result.data : [];
          break;
        }
        lastError = result.error;
      }
      
      if (lastError && data.length === 0) throw lastError;

      // Handle the formatting directly in the response
      const response = data.map((row) => ({
        ...row,
        // Since we are no longer using /uploads/, it will use the direct supabase URL
        image_url: row?.image_url || row?.imageUrl || row?.url,
      }));

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Require admin auth
  const admin = authenticateAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  if (method === 'POST') {
    // Replaced multer: The image should be directly uploaded to Supabase Storage by the client.
    // The client will then pass the URL of the uploaded image here.
    const { image_url, name } = req.body;
    if (!image_url) return res.status(400).json({ message: 'No image URL provided' });
    if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });

    try {
      let lastError = null;
      let insertedTableName = null;

      for (const tableName of GALLERY_TABLES) {
        const payload = tableName === 'gallary' 
          ? { name: name || 'gallery_img', image_id: image_url } 
          : { image_url };

        const { error } = await adminSupabase.from(tableName).insert([payload]);
        if (!error) {
          insertedTableName = tableName;
          break;
        }
        lastError = error;
      }

      if (lastError && !insertedTableName) throw lastError;
      return res.status(201).json({ message: 'Gallery image saved', url: image_url });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'DELETE') {
    const { id } = req.query;
    if (!isAdminDbConnected) return res.status(503).json({ message: 'No admin DB connection' });

    // Try deleting from 'gallery' standard table
    const { error } = await adminSupabase.from('gallery').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(200).json({ message: 'Gallery image deleted' });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
