import { query } from './_utils/db.js';
import { allowCors } from './_utils/cors.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { page } = req.body;
  if (!page) return res.status(200).send('OK');

  try {
    const sql = `
      INSERT INTO page_views (page_name, view_count)
      VALUES (?, 1)
      ON DUPLICATE KEY UPDATE view_count = view_count + 1
    `;
    await query(sql, [page]);
  } catch (error) {
    console.error('Failed to track view:', error);
  }

  return res.status(200).send('OK');
}
