import { query } from './_utils/db.js';
import { authenticateAdmin } from './_utils/auth.js';
import { allowCors } from './_utils/cors.js';
import { del } from '@vercel/blob';

const ACHIEVEMENTS_TABLE = 'achievements';
const HERO_SLIDES_TABLE = 'hero_slides';
const GALLERY_TABLE = 'gallery';
const ACHIEVEMENT_NAME_PREFIX = 'achievement-';
const HERO_NAME_PREFIX = 'hero-';
const ACHIEVEMENT_LIMIT = 4;
const GALLERY_LIMIT = 10; // Increased limit
const HERO_LIMIT = 3;

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

const isAchievementsCategory = ({ category, name }) => {
  const normalizedCategory = String(category || '').toLowerCase();
  const normalizedName = String(name || '').toLowerCase();
  return normalizedCategory === 'achievements' || normalizedName.startsWith(ACHIEVEMENT_NAME_PREFIX);
};

const isHeroCategory = ({ category, name }) => {
  const normalizedCategory = String(category || '').toLowerCase();
  const normalizedName = String(name || '').toLowerCase();
  return normalizedCategory === 'hero' || normalizedName.startsWith(HERO_NAME_PREFIX);
};

const normalizeAchievementSlotName = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized.startsWith(ACHIEVEMENT_NAME_PREFIX)) return null;
  return normalized;
};

const normalizeHeroSlotName = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized.startsWith(HERO_NAME_PREFIX)) return null;
  return normalized;
};

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  const method = req.method;

  if (method === 'GET') {
    try {
      const includeInactive = parseBoolean(req.query?.includeInactive);
      const mediaLinkedOnly = parseBoolean(req.query?.mediaLinked);
      const category = String(req.query?.category || '').toLowerCase();

      if (category === 'hero') {
        let sql = `SELECT id, slot_name as name, image_url, is_active, created_at, updated_at FROM ${HERO_SLIDES_TABLE}`;
        const params = [];
        if (!includeInactive) {
          sql += ' WHERE is_active = TRUE';
        }
        sql += ' ORDER BY slot_name ASC';
        const rows = await query(sql, params);
        return res.status(200).json(rows);
      }

      if (category === 'achievements') {
        let sql = `SELECT id, slot_name as name, image_url, is_active, created_at, updated_at FROM ${ACHIEVEMENTS_TABLE}`;
        const params = [];
        if (!includeInactive) {
          sql += ' WHERE is_active = TRUE';
        }
        sql += ' ORDER BY slot_name ASC';
        const rows = await query(sql, params);
        return res.status(200).json(rows);
      }

      // Default gallery
      let sql = `SELECT id, name, image_url, is_active, is_media_linked, created_at FROM ${GALLERY_TABLE}`;
      const params = [];
      const conditions = [];

      if (!includeInactive) conditions.push('is_active = TRUE');
      if (mediaLinkedOnly) conditions.push('is_media_linked = TRUE');

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY created_at DESC';
      const rows = await query(sql, params);
      return res.status(200).json(rows);

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const admin = authenticateAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  if (method === 'POST') {
    const { image_url, name, is_active = true, is_media_linked = false, category } = req.body;
    if (!image_url) return res.status(400).json({ message: 'No image URL provided' });

    try {
      const achievementsMode = isAchievementsCategory({ category, name });
      const heroMode = isHeroCategory({ category, name });

      if (achievementsMode) {
        const slotName = normalizeAchievementSlotName(name);
        if (!slotName) return res.status(400).json({ message: 'Achievement slot name is required (example: achievement-1).' });

        const existing = await query(`SELECT id, image_url FROM ${ACHIEVEMENTS_TABLE} WHERE slot_name = ?`, [slotName]);
        if (existing.length > 0) {
          if (existing[0].image_url !== image_url) {
            await deleteBlobIfVercel(existing[0].image_url);
          }
          await query(`UPDATE ${ACHIEVEMENTS_TABLE} SET image_url = ?, is_active = ? WHERE id = ?`, [image_url, is_active, existing[0].id]);
          return res.status(200).json({ message: 'Achievement updated', url: image_url });
        }

        const countResult = await query(`SELECT COUNT(*) as count FROM ${ACHIEVEMENTS_TABLE}`);
        if (countResult[0].count >= ACHIEVEMENT_LIMIT) {
          return res.status(400).json({ message: `Achievement limit reached. Max ${ACHIEVEMENT_LIMIT} images allowed.` });
        }

        await query(`INSERT INTO ${ACHIEVEMENTS_TABLE} (slot_name, image_url, is_active) VALUES (?, ?, ?)`, [slotName, image_url, is_active]);
        return res.status(201).json({ message: 'Achievement saved', url: image_url });
      }

      if (heroMode) {
        const slotName = normalizeHeroSlotName(name);
        if (!slotName) return res.status(400).json({ message: 'Hero slot name is required (example: hero-1).' });

        const existing = await query(`SELECT id, image_url FROM ${HERO_SLIDES_TABLE} WHERE slot_name = ?`, [slotName]);
        if (existing.length > 0) {
          if (existing[0].image_url !== image_url) {
            await deleteBlobIfVercel(existing[0].image_url);
          }
          await query(`UPDATE ${HERO_SLIDES_TABLE} SET image_url = ?, is_active = ? WHERE id = ?`, [image_url, is_active, existing[0].id]);
          return res.status(200).json({ message: 'Hero slide updated', url: image_url });
        }

        const countResult = await query(`SELECT COUNT(*) as count FROM ${HERO_SLIDES_TABLE}`);
        if (countResult[0].count >= HERO_LIMIT) {
          return res.status(400).json({ message: `Hero slider limit reached. Max ${HERO_LIMIT} images allowed.` });
        }

        await query(`INSERT INTO ${HERO_SLIDES_TABLE} (slot_name, image_url, is_active) VALUES (?, ?, ?)`, [slotName, image_url, is_active]);
        return res.status(201).json({ message: 'Hero slide saved', url: image_url });
      }

      const countResult = await query(`SELECT COUNT(*) as count FROM ${GALLERY_TABLE}`);
      if (countResult[0].count >= GALLERY_LIMIT) {
        return res.status(400).json({ message: `Gallery limit reached. Max ${GALLERY_LIMIT} images allowed.` });
      }

      await query(`INSERT INTO ${GALLERY_TABLE} (name, image_url, is_active, is_media_linked) VALUES (?, ?, ?, ?)`, [name || null, image_url, is_active, is_media_linked]);
      return res.status(201).json({ message: 'Gallery image saved', url: image_url });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'PUT') {
    const { id, image_url, name, is_active, is_media_linked, category } = req.body;
    try {
      const achievementsMode = isAchievementsCategory({ category, name });
      const heroMode = isHeroCategory({ category, name });

      if (achievementsMode) {
        const slotName = normalizeAchievementSlotName(name);
        const existing = id 
          ? await query(`SELECT image_url FROM ${ACHIEVEMENTS_TABLE} WHERE id = ?`, [id])
          : await query(`SELECT image_url FROM ${ACHIEVEMENTS_TABLE} WHERE slot_name = ?`, [slotName]);

        if (image_url && existing.length > 0 && existing[0].image_url !== image_url) {
          await deleteBlobIfVercel(existing[0].image_url);
        }

        const updates = [];
        const params = [];
        if (typeof image_url !== 'undefined') { updates.push('image_url = ?'); params.push(image_url); }
        if (typeof is_active !== 'undefined') { updates.push('is_active = ?'); params.push(is_active); }
        
        if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });

        if (id) {
          params.push(id);
          await query(`UPDATE ${ACHIEVEMENTS_TABLE} SET ${updates.join(', ')} WHERE id = ?`, params);
        } else {
          params.push(slotName);
          await query(`UPDATE ${ACHIEVEMENTS_TABLE} SET ${updates.join(', ')} WHERE slot_name = ?`, params);
        }
        return res.status(200).json({ message: 'Achievement updated' });
      }

      if (heroMode) {
        const slotName = normalizeHeroSlotName(name);
        const existing = id 
          ? await query(`SELECT image_url FROM ${HERO_SLIDES_TABLE} WHERE id = ?`, [id])
          : await query(`SELECT image_url FROM ${HERO_SLIDES_TABLE} WHERE slot_name = ?`, [slotName]);

        if (image_url && existing.length > 0 && existing[0].image_url !== image_url) {
          await deleteBlobIfVercel(existing[0].image_url);
        }

        const updates = [];
        const params = [];
        if (typeof image_url !== 'undefined') { updates.push('image_url = ?'); params.push(image_url); }
        if (typeof is_active !== 'undefined') { updates.push('is_active = ?'); params.push(is_active); }

        if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });

        if (id) {
          params.push(id);
          await query(`UPDATE ${HERO_SLIDES_TABLE} SET ${updates.join(', ')} WHERE id = ?`, params);
        } else {
          params.push(slotName);
          await query(`UPDATE ${HERO_SLIDES_TABLE} SET ${updates.join(', ')} WHERE slot_name = ?`, params);
        }
        return res.status(200).json({ message: 'Hero slide updated' });
      }

      if (!id) return res.status(400).json({ message: 'Image ID required' });

      const existing = await query(`SELECT image_url FROM ${GALLERY_TABLE} WHERE id = ?`, [id]);
      if (image_url && existing.length > 0 && existing[0].image_url !== image_url) {
        await deleteBlobIfVercel(existing[0].image_url);
      }

      const updates = [];
      const params = [];
      if (typeof image_url !== 'undefined') { updates.push('image_url = ?'); params.push(image_url); }
      if (typeof name !== 'undefined') { updates.push('name = ?'); params.push(name); }
      if (typeof is_active !== 'undefined') { updates.push('is_active = ?'); params.push(is_active); }
      if (typeof is_media_linked !== 'undefined') { updates.push('is_media_linked = ?'); params.push(is_media_linked); }

      if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });

      params.push(id);
      await query(`UPDATE ${GALLERY_TABLE} SET ${updates.join(', ')} WHERE id = ?`, params);
      return res.status(200).json({ message: 'Gallery image updated' });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'DELETE') {
    const { id, category, name } = req.query;
    try {
      const achievementsMode = isAchievementsCategory({ category, name });
      const heroMode = isHeroCategory({ category, name });

      if (achievementsMode) {
        const slotName = normalizeAchievementSlotName(name);
        const existing = id 
          ? await query(`SELECT image_url FROM ${ACHIEVEMENTS_TABLE} WHERE id = ?`, [id])
          : await query(`SELECT image_url FROM ${ACHIEVEMENTS_TABLE} WHERE slot_name = ?`, [slotName]);

        if (existing.length > 0) {
          await deleteBlobIfVercel(existing[0].image_url);
        }

        if (id) {
          await query(`DELETE FROM ${ACHIEVEMENTS_TABLE} WHERE id = ?`, [id]);
        } else if (slotName) {
          await query(`DELETE FROM ${ACHIEVEMENTS_TABLE} WHERE slot_name = ?`, [slotName]);
        } else {
          return res.status(400).json({ message: 'Achievement ID or slot name is required' });
        }
        return res.status(200).json({ message: 'Achievement deleted' });
      }

      if (heroMode) {
        const slotName = normalizeHeroSlotName(name);
        const existing = id 
          ? await query(`SELECT image_url FROM ${HERO_SLIDES_TABLE} WHERE id = ?`, [id])
          : await query(`SELECT image_url FROM ${HERO_SLIDES_TABLE} WHERE slot_name = ?`, [slotName]);

        if (existing.length > 0) {
          await deleteBlobIfVercel(existing[0].image_url);
        }

        if (id) {
          await query(`DELETE FROM ${HERO_SLIDES_TABLE} WHERE id = ?`, [id]);
        } else if (slotName) {
          await query(`DELETE FROM ${HERO_SLIDES_TABLE} WHERE slot_name = ?`, [slotName]);
        } else {
          return res.status(400).json({ message: 'Hero ID or slot name is required' });
        }
        return res.status(200).json({ message: 'Hero slide deleted' });
      }

      if (!id) return res.status(400).json({ message: 'Image ID required' });

      const existing = await query(`SELECT image_url FROM ${GALLERY_TABLE} WHERE id = ?`, [id]);
      if (existing.length > 0) {
        await deleteBlobIfVercel(existing[0].image_url);
      }

      await query(`DELETE FROM ${GALLERY_TABLE} WHERE id = ?`, [id]);
      return res.status(200).json({ message: 'Gallery image deleted' });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
