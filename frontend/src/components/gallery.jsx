import React from 'react';
import './gallery.css';

const imageContext = require.context('../assets/gallary', false, /\.(png|jpe?g)$/);
const galleryImages = imageContext
  .keys()
  .map((filePath) => ({
    id: Number(filePath.replace('./', '').split('.')[0]),
    src: imageContext(filePath)
  }))
  .sort((a, b) => a.id - b.id);

const Gallery = () => {
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
              <img src={item.src} alt={`Pruthvi Panthers gallery ${item.id}`} loading="lazy" />
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Gallery;
