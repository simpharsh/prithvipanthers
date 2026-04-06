import React from 'react';
import './SponsorsBenefitsSection.css';

const SponsorsBenefitsSection = ({ isVisible, registerSection, benefitCards }) => {
  return (
    <section
      className={`content-shell sponsors-section reveal-section ${isVisible ? 'is-visible' : ''}`}
      ref={registerSection('benefits')}
      data-section="benefits"
    >
      <h2 className="section-heading">SPONSORS BENEFITS</h2>
      <div className="benefits-grid">
        {benefitCards.map((card) => (
          <article key={card.id} className="benefit-card">
            <div className="benefit-index">{card.id}</div>
            <p>{card.text}</p>
            <span className="benefit-plus">+</span>
          </article>
        ))}
      </div>
    </section>
  );
};

export default SponsorsBenefitsSection;
