import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './HeroSlider.css';

const HeroSlider = ({ slides, currentSlide, onDotClick }) => {
  if (!Array.isArray(slides) || slides.length === 0) return null;

  const activeSlide = slides[currentSlide] || slides[0];

  return (
    <section className="hero-section reveal-section is-visible">
      <div className="hero-slide-viewport">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={`slide-${currentSlide}`}
            className="hero-slide hero-slide-animated"
            style={{ backgroundImage: `url(${activeSlide.img})` }}
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-overlay" />
            <div className="hero-content">
              <h1>{activeSlide.title}</h1>
              <p>{activeSlide.subtitle}</p>
              <div className="slider-buttons">
                <Link to="/player" className="btn btn-primary">DISCOVER MORE</Link>
                <Link to="/contact" className="btn btn-secondary">CONTACT US</Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
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
