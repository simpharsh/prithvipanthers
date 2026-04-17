import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './MediaSection.css';

import { fetchWithFallback } from '../../utils/fetchWithFallback';

const MediaSection = ({ isVisible, registerSection, mediaImages }) => {
  const [linkedImages, setLinkedImages] = useState([]);

  useEffect(() => {
    let isMounted = true;

    fetchWithFallback('/api/gallery?mediaLinked=1&includeInactive=0')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const images = Array.isArray(data) ? data : [];
        setLinkedImages(images.filter((item) => item?.image_url));
      })
      .catch(() => {
        if (isMounted) setLinkedImages([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const resolvedImages = useMemo(() => {
    const source = linkedImages.length > 0 ? linkedImages.map((item) => item.image_url) : mediaImages;
    return source.filter(Boolean);
  }, [linkedImages, mediaImages]);

  const [featureImage, ...tileImages] = resolvedImages;

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
