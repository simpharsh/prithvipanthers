// src/components/Home.jsx (Fully Updated)
import React, { useState, useEffect } from 'react';
import './home.css';

// ================= IMAGE IMPORTS =================

// --- SLIDER IMAGES ---
import slider1 from '../assets/home/slider-1.jpeg';
import slider2 from '../assets/home/slider-2.jpeg';
import slider3 from '../assets/home/slider-3.jpeg';

// --- MEDIA IMAGES ---
import media1 from '../assets/home/media-1.jpeg';
import media2 from '../assets/home/media-2.jpeg';
import media3 from '../assets/home/media-3.jpeg';
import media4 from '../assets/home/media-4.jpeg';
import media5 from '../assets/home/media-5.jpeg';

// --- ACHIEVEMENT IMAGES ---
import achPriyanshu from '../assets/home/achivment-priyanshu.jpeg';
import achMohit from '../assets/home/achivment-mohit.jpeg';
import achPureanshu from '../assets/home/achivment-pureanshu.jpeg';
import achJay from '../assets/home/achivment-jay.jpeg';

// --- OWNER IMAGES ---
import ownerAjay from '../assets/about/ajay.jpeg';
import ownerGirish from '../assets/about/girish.jpeg';
import ownerJugal from '../assets/about/jugal.jpeg';
import ownerShailesh from '../assets/about/shailesh.jpeg';

// --- NEW SPONSOR LOGO IMAGES ---
import vishh from '../assets/home/vishh.png'; // Please double-check spelling (vishh vs vish)
import tremont from '../assets/home/tremont.png';
import spa from '../assets/home/spa.png';
import rajwanshi from '../assets/home/rajwanshi.png';
import opufnt from '../assets/home/opufnt.png';
import nptsi from '../assets/home/nptsi.png';
import bharat from '../assets/home/bharat.png';
import mahakali from '../assets/home/mahakali.png';

const TARGET_VALUES = { teams: 5, matches: 25, players: 100, minutes: 5040 };

const Home = () => {
  // ================= STATE & LOGIC =================

  // 1. Slider Logic
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { id: 0, image: slider1, title: "JOIN THE LEGACY", subtitle: "Be part of something extraordinary, join the Panther family" },
    { id: 1, image: slider2, title: "TOP 3 FINISH IN BPL 2025", subtitle: "Coming back stronger for BPL 2026" },
    { id: 2, image: slider3, title: "CHAMPION MINDSET", subtitle: "Unleashing the power of determination and teamwork" }
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide === slides.length - 1 ? 0 : prevSlide + 1));
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // 2. Statistics Counter Logic
  const [counterValues, setCounterValues] = useState({ teams: 0, matches: 0, players: 0, minutes: 0 });

  useEffect(() => {
    const DURATION_MS = 2000;
    const INTERVAL_MS = 20;
    const TOTAL_STEPS = DURATION_MS / INTERVAL_MS;

    const increments = {
      teams: TARGET_VALUES.teams / TOTAL_STEPS,
      matches: TARGET_VALUES.matches / TOTAL_STEPS,
      players: TARGET_VALUES.players / TOTAL_STEPS,
      minutes: TARGET_VALUES.minutes / TOTAL_STEPS
    };

    let stepCount = 0;
    const intervalId = setInterval(() => {
      stepCount++;
      setCounterValues(() => {
        return {
          teams: Math.ceil(Math.min(stepCount * increments.teams, TARGET_VALUES.teams)),
          matches: Math.ceil(Math.min(stepCount * increments.matches, TARGET_VALUES.matches)),
          players: Math.ceil(Math.min(stepCount * increments.players, TARGET_VALUES.players)),
          minutes: Math.ceil(Math.min(stepCount * increments.minutes, TARGET_VALUES.minutes))
        };
      });

      if (stepCount >= TOTAL_STEPS) {
        clearInterval(intervalId);
        setCounterValues(TARGET_VALUES);
      }
    }, INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  // 3. Owners Data
  const owners = [
    { id: 1, name: "AJAY", role: "Owner & Founder", img: ownerAjay },
    { id: 2, name: "GIRISH", role: "Director", img: ownerGirish },
    { id: 3, name: "JUGAL", role: "Operations Head", img: ownerJugal },
    { id: 4, name: "SHAILESH", role: "Public Relations", img: ownerShailesh }
  ];

  // 4. Sponsor Benefits Data (from image_6.png)
  const benefitCards = [
    { id: 1, text: "In-stadium branding and activation opportunities." },
    { id: 2, text: "TV/Print/Radio/Hoardings Promotion." },
    { id: 3, text: "Social Media marketing." },
    { id: 4, text: "Brand visibility on broadcast and OTT channel." },
    { id: 5, text: "PR and Print Media with advertising and editorial coverages in top newspapers." },
    { id: 6, text: "Branding on the players uniform." },
  ];

  // 5. Sliding Sponsors Data (from prompt)
  const sponsorLogos = [
    { id: 1, img: vishh, alt: "Vishh Sponsor" },
    { id: 2, img: tremont, alt: "Tremont Sponsor" },
    { id: 3, img: spa, alt: "SPA Sponsor" },
    { id: 4, img: rajwanshi, alt: "Rajwanshi Sponsor" },
    { id: 5, img: opufnt, alt: "Opufnt Sponsor" },
    { id: 6, img: nptsi, alt: "NPTSI Sponsor" },
    { id: 7, img: bharat, alt: "Bharat Sponsor" },
    { id: 8, img: mahakali, alt: "Mahakali Sponsor" },
  ];

  // ================= RENDER =================
  return (
    <div className="home-page">
      
      {/* ================= HERO SLIDER SECTION ================= */}
      <div className="hero-slider-container">
        {slides.map((slide, index) => (
          <div key={slide.id} className={`slide ${index === currentSlide ? 'active' : ''}`} style={{ backgroundImage: `url(${slide.image})` }}>
            <div className="slide-overlay">
              <div className="slide-content">
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <div className="slider-buttons">
                  <button className="btn discover-btn">DISCOVER MORE</button>
                  <button className="btn contact-btn">CONTACT US</button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="slider-dots">
          {slides.map((_, index) => (
            <span key={index} className={`dot ${index === currentSlide ? 'active-dot' : ''}`} onClick={() => setCurrentSlide(index)}></span>
          ))}
        </div>

        <div className="statistics-counter-section">
          <div className="statistic-item">
            <span className="stat-number">{counterValues.teams}</span>
            <span className="stat-description">TEAMS</span>
          </div>
          <div className="statistic-item">
            <span className="stat-number">{counterValues.matches}</span>
            <span className="stat-description">MATCHES</span>
          </div>
          <div className="statistic-item">
            <span className="stat-number">{counterValues.players}</span>
            <span className="stat-description">BCA REGISTERED<br />PLAYERS</span>
          </div>
          <div className="statistic-item">
            <span className="stat-number">{counterValues.minutes}</span>
            <span className="stat-description">MINUTES OF LIVE<br />FOOTAGE ON GLOBAL<br />OTT</span>
          </div>
        </div>
      </div>

      {/* ================= HOME CONTENT SECTION ================= */}
      <div className="home-content-container">
        
        {/* MEDIA SECTION */}
        <section className="media-section">
          <h2 className="section-title">MEDIA</h2>
          <div className="media-grid">
            <div className="media-large"><img src={media1} alt="Media highlight" /></div>
            <div className="media-small-grid">
              <img src={media2} alt="Media 2" />
              <img src={media3} alt="Media 3" />
              <img src={media4} alt="Media 4" />
              <img src={media5} alt="Media 5" />
            </div>
          </div>
          <div className="read-more-link">
            <a href="/gallery">Read More &rarr;</a>
          </div>
        </section>

        {/* ACHIEVEMENTS SECTION */}
        <section className="achievements-section">
          <h2 className="section-title">PANTHERS ACHIEVEMENTS</h2>
          <div className="achievements-stack">
            <div className="achievement-card"><img src={achPriyanshu} alt="Achievement Priyanshu" /></div>
            <div className="achievement-card"><img src={achMohit} alt="Achievement Mohit" /></div>
            <div className="achievement-card"><img src={achPureanshu} alt="Achievement Pureanshu" /></div>
            <div className="achievement-card"><img src={achJay} alt="Achievement Jay" /></div>
          </div>
        </section>

        {/* OWNERS SECTION */}
        <section className="owners-section">
          <h2 className="section-title">MEET THE OWNERS AND DIRECTORS</h2>
          <div className="owners-grid">
            {owners.map((owner) => (
              <div className="owner-card" key={owner.id}>
                <div className="owner-image"><img src={owner.img} alt={owner.name} /></div>
                <div className="owner-info">
                  <h3>{owner.name}</h3>
                  <span className="owner-role">{owner.role}</span>
                  <p className="owner-desc">Dedicated to leading the Panthers to victory with passion and excellence.</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= NEW SPONSORS BENEFITS SECTION (from image_6.png) ================= */}
        <section className="sponsors-benefits-section">
          <h2 className="section-title">SPONSORS BENEFITS</h2>
          <div className="benefits-grid">
            {benefitCards.map((card) => (
              <div key={card.id} className="benefit-card">
                <div className="card-top-border"></div>
                <div className="number-circle">{card.id}</div>
                <div className="benefit-content">
                  <p className="benefit-text">{card.text}</p>
                </div>
                <div className="plus-icon">+</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ================= NEW SLIDING SPONSORS SECTION ================= */}
      <section className="valued-sponsors-section">
        {/* Faint, large background text "SPONSORS" */}
        <h3 className="background-sponsors-title">SPONSORS</h3>
        
        <div className="power-partners-info">
          <h2 className="section-title text-center">POWER PARTNERS: PANTHERS’S VALUED SPONSORS</h2>
          <p className="sponsors-description text-center">
            Pruthvi Panthers proudly supports youth cricket through training camps and development programs — making every sponsor part of our winning journey.
          </p>
        </div>
        
        {/* Sliding Logo Marquee Container */}
        <div className="sliding-sponsors-container">
          <div className="sliding-sponsors-track">
            {/* Display the full logo list twice for continuous scrolling */}
            {[...sponsorLogos, ...sponsorLogos].map((logo, index) => (
              <div key={index} className="sponsor-logo-item">
                <img src={logo.img} alt={logo.alt} />
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;