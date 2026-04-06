import React, { useState, useEffect } from 'react';
import './gallery.css';

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/gallery')
      .then(res => res.json())
      .then(data => setGalleryImages(data))
      .catch(console.error);

    // View Tracker
    fetch('http://localhost:5000/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'gallery' })
    }).catch(() => {});
  }, []);

  return (
    <div className="gallery-page">
      <section className="gallery-hero">
        <h1>PANTHERS GALLERY</h1>
        <p>Match moments, celebrations, and behind-the-scenes highlights.</p>
      </section>

      <section className="gallery-grid-section">
        <div className="gallery-grid">
          {galleryImages.map((item) => (
            <figure className="gallery-item" key={item.id}>
              <img src={`http://localhost:5000${item.image_url}`} alt={`Pruthvi Panthers gallery ${item.id}`} loading="lazy" />
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Gallery;
