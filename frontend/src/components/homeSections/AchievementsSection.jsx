import React from 'react';
import './AchievementsSection.css';

const AchievementsSection = ({ isVisible, registerSection, achievementImages }) => {
  return (
    <section
      className={`content-shell achievements-section reveal-section ${isVisible ? 'is-visible' : ''}`}
      ref={registerSection('achievements')}
      data-section="achievements"
    >
      <h2 className="section-heading">PANTHERS ACHIEVEMENTS</h2>
      <div className="achievement-stack">
        {achievementImages.map((image, index) => (
          <img src={image} alt={`Achievement ${index + 1}`} className="ach-card" key={image} />
        ))}
      </div>
    </section>
  );
};

export default AchievementsSection;
