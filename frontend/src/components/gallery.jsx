import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './gallery.css';
import { itemReveal, pageTransition, sectionStagger } from '../utils/pageMotion';

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const tilePattern = ['tile-xl', 'tile-tall', 'tile-wide', 'tile-small', 'tile-wide', 'tile-small', 'tile-tall', 'tile-xl'];

  const resolveImageUrl = (item) => {
    const rawPath = item?.image_url || item?.imageUrl || item?.url || '';
    if (!rawPath || typeof rawPath !== 'string') return '';
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) return rawPath;
    return rawPath.startsWith('/')
      ? rawPath
      : `/${rawPath}`;
  };

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then((data) => {
        const normalizedImages = Array.isArray(data)
          ? data
          : Array.isArray(data?.gallery)
            ? data.gallery
            : Array.isArray(data?.images)
              ? data.images
              : [];
        setGalleryImages(normalizedImages);
      })
      .catch(console.error);

    // View Tracker
    fetch('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'gallery' })
    }).catch(() => {});
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
