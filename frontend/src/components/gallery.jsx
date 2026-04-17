import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './gallery.css';
import { itemReveal, pageTransition, sectionStagger } from '../utils/pageMotion';
import { fetchWithFallback } from '../utils/fetchWithFallback';
import { resolveImageUrl, normalizeImages } from '../utils/imageUtils';

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const tilePattern = ['tile-xl', 'tile-tall', 'tile-wide', 'tile-small', 'tile-wide', 'tile-small', 'tile-tall', 'tile-xl'];

  useEffect(() => {
    let isMounted = true;

    const loadGallery = async () => {
      try {
        const response = await fetchWithFallback('/api/gallery');
        const data = await response.json();
        if (isMounted) {
          const items = Array.isArray(data) ? data : (data?.gallery || []);
          setGalleryImages(items.filter(item => item?.is_active !== false));
        }
      } catch (error) {
        console.error('Failed to load gallery:', error.message);
      }
    };

    loadGallery();

    // View Tracker
    fetchWithFallback('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'gallery' })
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <motion.div
      className="gallery-page"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <section className="gallery-hero">
        <h1>PANTHERS GALLERY</h1>
        <p>Match moments, celebrations, and behind-the-scenes highlights.</p>
      </section>

      <section className="gallery-grid-section">
        <motion.div
          className="gallery-grid"
          variants={sectionStagger}
          initial="hidden"
          animate="visible"
        >
          {galleryImages.map((item, index) => (
            <motion.figure className={`gallery-item ${tilePattern[index % tilePattern.length]}`} key={item.id} variants={itemReveal}>
              <img src={resolveImageUrl(item)} alt={`Pruthvi Panthers gallery ${item.id || index + 1}`} loading="lazy" />
            </motion.figure>
          ))}
        </motion.div>
      </section>
    </motion.div>
  );
};

export default Gallery;
