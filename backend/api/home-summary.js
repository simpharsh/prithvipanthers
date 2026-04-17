import { query } from './_utils/db.js';
import { allowCors } from './_utils/cors.js';

/**
 * Consolidated endpoint for home page data.
 * Reduces the number of round-trips from 3 to 1.
 */
export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Execute all queries in parallel for better performance
    const [heroSlides, achievements, mediaImages] = await Promise.all([
      // 1. Fetch Hero Slides
      query(
        'SELECT slot_name as name, image_url FROM hero_slides WHERE is_active = TRUE ORDER BY slot_name ASC'
      ),
      // 2. Fetch Achievements
      query(
        'SELECT slot_name as name, image_url FROM achievements WHERE is_active = TRUE ORDER BY slot_name ASC'
      ),
      // 3. Fetch Media Linked Gallery Images
      query(
        'SELECT id, image_url FROM gallery WHERE is_active = TRUE AND is_media_linked = TRUE ORDER BY created_at DESC LIMIT 10'
      )
    ]);

    return res.status(200).json({
      heroSlides,
      achievements,
      mediaImages
    });
  } catch (error) {
    console.error('Home summary fetch error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch home page data', 
      details: error.message 
    });
  }
}
