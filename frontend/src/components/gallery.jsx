import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import './gallery.css';
import { itemReveal, pageTransition, sectionStagger } from '../utils/pageMotion';
import { fetchWithFallback } from '../utils/fetchWithFallback';
import { resolveImageUrl } from '../utils/imageUtils';
import LoadingState from './LoadingUI/LoadingState';
import ProgressiveImage from './LoadingUI/ProgressiveImage';

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [requestState, setRequestState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const tilePattern = ['tile-xl', 'tile-tall', 'tile-wide', 'tile-small', 'tile-wide', 'tile-small', 'tile-tall', 'tile-xl'];

  const loadGallery = useCallback(async () => {
    setRequestState('loading');
    setErrorMessage('');

    try {
      const response = await fetchWithFallback('/api/gallery');
      const data = await response.json();
      const items = Array.isArray(data) ? data : (data?.gallery || []);
      setGalleryImages(items.filter(item => item?.is_active !== false));
      setRequestState('success');
    } catch (error) {
      console.error('Failed to load gallery:', error.message);
      setGalleryImages([]);
      setRequestState('error');
      setErrorMessage('Please check your internet connection and try again.');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      loadGallery();
    }

    // View Tracker
    fetchWithFallback('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'gallery' })
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [loadGallery]);

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
        <LoadingState
          status={requestState}
          skeleton="gallery"
          onRetry={loadGallery}
          errorTitle="Unable to load gallery right now"
          errorMessage={errorMessage}
          spinnerLabel="Loading gallery"
        >
          <motion.div
            className="gallery-grid"
            variants={sectionStagger}
            initial="hidden"
            animate="visible"
          >
            {galleryImages.length > 0 ? galleryImages.map((item, index) => (
              <motion.figure className={`gallery-item ${tilePattern[index % tilePattern.length]}`} key={item.id} variants={itemReveal}>
                <ProgressiveImage
                  src={resolveImageUrl(item)}
                  alt={`Pruthvi Panthers gallery ${item.id || index + 1}`}
                  className="gallery-photo"
                  containerClassName="gallery-photo-shell"
                />
              </motion.figure>
            )) : (
              <div className="gallery-empty-state">Fresh photos will appear here soon.</div>
            )}
          </motion.div>
        </LoadingState>
      </section>
    </motion.div>
  );
};

export default Gallery;
