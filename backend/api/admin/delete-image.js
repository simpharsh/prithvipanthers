import { del } from '@vercel/blob';
import { authenticateAdmin } from '../_utils/auth.js';
import { allowCors } from '../_utils/cors.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const admin = authenticateAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const { url } = req.method === 'DELETE' ? req.query : req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'URL required' });
    }

    // Only delete if it's a Vercel Blob URL to avoid security risks
    if (url.includes('public.blob.vercel-storage.com')) {
      await del(url);
      return res.status(200).json({ message: 'Image deleted' });
    }

    return res.status(200).json({ message: 'Not a Vercel blob URL, skipping storage deletion' });
  } catch (error) {
    console.error('Blob delete error:', error);
    return res.status(500).json({ error: 'Delete failed', details: error.message });
  }
}
