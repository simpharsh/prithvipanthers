import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSlider.css';

const HeroSlider = ({ slides, currentSlide, onDotClick }) => {
  return (
    <section className="hero-section reveal-section is-visible">
      <div className="hero-slider-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {slides.map((slide, index) => (
          <div key={`slide-${index}`} className="hero-slide" style={{ backgroundImage: `url(${slide.img})` }}>
            <div className="hero-overlay" />
            <div className="hero-content">
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
              <div className="slider-buttons">
                <Link to="/player" className="btn btn-primary">DISCOVER MORE</Link>
                <Link to="/contact" className="btn btn-secondary">CONTACT US</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hero-dots">
        {slides.map((_, index) => (
          <button
            key={`dot-${index}`}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => onDotClick(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
