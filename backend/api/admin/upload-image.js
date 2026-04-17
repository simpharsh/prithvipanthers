import { put } from '@vercel/blob';
import { authenticateAdmin } from '../_utils/auth.js';
import { allowCors } from '../_utils/cors.js';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for streaming
  },
};

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const admin = authenticateAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const filename = req.headers['x-filename'] || `upload-${Date.now()}.png`;
    const contentType = req.headers['content-type'] || 'image/png';

    // Stream the request directly to Vercel Blob for better performance and lower memory usage
    const blob = await put(filename, req, {
      access: 'public',
      contentType: contentType,
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error('Blob upload error:', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}
