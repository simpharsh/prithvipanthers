import React from 'react';
import './OwnersSection.css';

const OwnersSection = ({ isVisible, registerSection, owners }) => {
  return (
    <section
      className={`content-shell owners-section reveal-section ${isVisible ? 'is-visible' : ''}`}
      ref={registerSection('owners')}
      data-section="owners"
    >
      <h2 className="section-heading">MEET THE OWNERS AND DIRECTORS</h2>
      <div className="owners-grid">
        {owners.map((owner) => (
          <article className="owner-card" key={owner.id}>
            <img src={owner.img} alt={owner.name} />
            <div className="owner-card-body">
              <h3>{owner.name}</h3>
              <span>{owner.role}</span>
              <p>{owner.details}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default OwnersSection;
