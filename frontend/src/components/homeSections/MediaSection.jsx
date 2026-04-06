import React from 'react';
import { Link } from 'react-router-dom';
import './MediaSection.css';

const MediaSection = ({ isVisible, registerSection, mediaImages }) => {
  const [featureImage, ...tileImages] = mediaImages;

  return (
    <section
      className={`content-shell media-section reveal-section ${isVisible ? 'is-visible' : ''}`}
      ref={registerSection('media')}
      data-section="media"
    >
      <h2 className="section-heading">MEDIA</h2>
      <div className="media-layout">
        <div className="media-feature">
          <img src={featureImage} alt="Media highlight" />
        </div>
        <div className="media-tile-grid">
          {tileImages.map((image, index) => (
            <img key={image} src={image} alt={`Media ${index + 2}`} />
          ))}
        </div>
      </div>
      <div className="media-footer-link">
        <Link to="/gallery">Read More</Link>
      </div>
    </section>
  );
};

export default MediaSection;
