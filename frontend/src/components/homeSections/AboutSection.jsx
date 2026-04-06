import React from 'react';
import { Link } from 'react-router-dom';
import './AboutSection.css';

const AboutSection = ({ isVisible, registerSection, aboutImage1, aboutImage2, aboutPoints }) => {
  return (
    <section
      className={`content-shell about-section reveal-section ${isVisible ? 'is-visible' : ''}`}
      ref={registerSection('about')}
      data-section="about"
    >
      <div className="about-images">
        <img src={aboutImage1} alt="Team practice" className="about-image primary" />
        <img src={aboutImage2} alt="Team gathering" className="about-image secondary" />
      </div>
      <div className="about-copy">
        <h2>ABOUT PRUTHVI PANTHERS MEHSANA</h2>
        {aboutPoints.map((point) => (
          <p key={point}>{point}</p>
        ))}
        <Link to="/about" className="accent-button">
          Know More
        </Link>
      </div>
    </section>
  );
};

export default AboutSection;
