import { query } from './_utils/db.js';
import { authenticateAdmin } from './_utils/auth.js';
import { allowCors } from './_utils/cors.js';
import { del } from '@vercel/blob';

const parseBoolean = (value) => value === true || value === 'true' || value === '1';

const deleteBlobIfVercel = async (url) => {
  if (url && url.includes('public.blob.vercel-storage.com')) {
    try {
      await del(url);
    } catch (err) {
      console.error('Failed to delete old blob:', url, err);
    }
  }
};

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  const method = req.method;

  if (method === 'GET') {
    try {
      const includeInactive = parseBoolean(req.query?.includeInactive);
      let sql = 'SELECT id, name, role, cover_image_url, photo_image_url, player_image_url, is_active, created_at FROM players';
      const params = [];

      if (!includeInactive) {
        sql += ' WHERE is_active = TRUE';
      }

      sql += ' ORDER BY id ASC';

      const data = await query(sql, params);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const admin = authenticateAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  if (method === 'POST') {
    try {
      const { name, role, cover_image_url, photo_image_url, player_image_url, is_active = true } = req.body;
      const sql = 'INSERT INTO players (name, role, cover_image_url, photo_image_url, player_image_url, is_active) VALUES (?, ?, ?, ?, ?, ?)';
      const result = await query(sql, [name, role, cover_image_url, photo_image_url, player_image_url, is_active]);
      return res.status(201).json({ message: 'Player created', id: result.insertId });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'PUT') {
    try {
      const { id, name, role, cover_image_url, photo_image_url, player_image_url, is_active } = req.body;
      if (!id) return res.status(400).json({ message: 'Player ID required' });

      // If updating images, delete old ones from blob storage
      if (cover_image_url || photo_image_url || player_image_url) {
        const existing = await query('SELECT cover_image_url, photo_image_url, player_image_url FROM players WHERE id = ?', [id]);
        if (existing.length > 0) {
          if (cover_image_url && existing[0].cover_image_url !== cover_image_url) {
            await deleteBlobIfVercel(existing[0].cover_image_url);
          }
          if (photo_image_url && existing[0].photo_image_url !== photo_image_url) {
            await deleteBlobIfVercel(existing[0].photo_image_url);
          }
          if (player_image_url && existing[0].player_image_url !== player_image_url) {
            await deleteBlobIfVercel(existing[0].player_image_url);
          }
        }
      }

      const updates = [];
      const params = [];

      if (typeof name !== 'undefined') { updates.push('name = ?'); params.push(name); }
      if (typeof role !== 'undefined') { updates.push('role = ?'); params.push(role); }
      if (typeof cover_image_url !== 'undefined') { updates.push('cover_image_url = ?'); params.push(cover_image_url); }
      if (typeof photo_image_url !== 'undefined') { updates.push('photo_image_url = ?'); params.push(photo_image_url); }
      if (typeof player_image_url !== 'undefined') { updates.push('player_image_url = ?'); params.push(player_image_url); }
      if (typeof is_active !== 'undefined') { updates.push('is_active = ?'); params.push(is_active); }

      if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });

      params.push(id);
      const sql = `UPDATE players SET ${updates.join(', ')} WHERE id = ?`;
      await query(sql, params);

      return res.status(200).json({ message: 'Player updated' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: 'Player ID required' });

      // Delete images from blob storage first
      const existing = await query('SELECT cover_image_url, photo_image_url, player_image_url FROM players WHERE id = ?', [id]);
      if (existing.length > 0) {
        await deleteBlobIfVercel(existing[0].cover_image_url);
        await deleteBlobIfVercel(existing[0].photo_image_url);
        await deleteBlobIfVercel(existing[0].player_image_url);
      }

      await query('DELETE FROM players WHERE id = ?', [id]);
      return res.status(200).json({ message: 'Player deleted' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
