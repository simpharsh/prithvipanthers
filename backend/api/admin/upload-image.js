import { put } from '@vercel/blob';
import { authenticateAdmin } from '../_utils/auth.js';
import { allowCors } from '../_utils/cors.js';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
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
    // Note: Vercel Blob 'put' can handle the request stream directly if needed,
    // but usually, we want to extract the filename and content.
    // For Vercel Serverless, 'req' is a stream.
    
    const filename = req.headers['x-filename'] || `upload-${Date.now()}.png`;
    const contentType = req.headers['content-type'] || 'image/png';

    // To avoid "Response body object should not be disturbed or locked", 
    // we consume the request stream into a buffer first.
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: contentType,
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error('Blob upload error:', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}
