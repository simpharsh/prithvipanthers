// src/components/About.jsx (Revised for precise visual match)
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import './about.css'; // Standard case-sensitive import
import { itemReveal, pageTransition, sectionStagger } from '../utils/pageMotion';

// --- TOP SECTION IMAGES ---
import aboutImg1 from '../assets/about/image-1.jpeg';
import aboutImg2 from '../assets/about/image-2.jpeg';

// --- OWNER IMAGES ---
import ajayImg from '../assets/about/ajay.jpeg';
import jugalImg from '../assets/about/jugal.jpeg';
import shaileshImg from '../assets/about/shailesh.jpeg';
import girishImg from '../assets/about/girish.jpeg';

const About = () => {
  // Structured data for owners, matching image 9/10 descriptions exactly
  const owners = [
    {
      id: 1,
      name: "Ajay Barot",
      subtitle: "The Backbone of Pruthvi Panthers",
      description: "A respected arms dealer and dedicated community leader from Mehsana, Ajay Barot stands as the true backbone of the Pruthvi Panthers. His disciplined approach, strong leadership, and local pride inspire the team both on and off the field. Known for his commitment to excellence, Ajay ensures that every player embodies the same spirit of focus and determination that defines him. His presence brings balance, resilience, and pride to the Panthers' journey.",
      img: ajayImg
    },
    {
      id: 2,
      name: "Jugal Singh Thakor",
      subtitle: "The Power Behind Pruthvi Panthers",
      description: "A visionary leader with deep roots in politics and business, Jugal Singh Thakor is a former Rajya Sabha MP (BJP) and owner of Rajvanshi Hotel & Resort in Mehsana. His strategic mindset and passion for community growth make him a driving force behind the Panthers. Jugal's ability to lead with both heart and vision fuels the team's ambition and pride. With him steering the way, the Pruthvi Panthers embody determination, unity, and excellence.",
      img: jugalImg
    },
    {
      id: 3,
      name: "Shailesh Chaudhari",
      subtitle: "Precision Meets Passion",
      description: "Founder of Vishv Enterprise and a seasoned investor, Shailesh Chaudhari brings over 15 years of business expertise and foresight to Pruthvi Panthers. His sharp eye for growth and innovation makes him an invaluable part of the leadership team. Grounded yet ambitious, Shailesh leads with purpose and precision — pushing the Panthers to aim higher and achieve greater. His calm confidence and passion for progress set the tone for success.",
      img: shaileshImg
    },
    {
      id: 4,
      name: "Girish Patel",
      subtitle: "Vision. Strength. Strategy.",
      description: "A powerhouse in the construction and business world, Girish Patel combines over 15 years of entrepreneurial excellence with a deep love for the game. Known for his strategic mindset and bold leadership, he's built to win — both in business and on the field. From shaping skylines in Ahmedabad to shaping victories for the Pruthvi Panthers, Girish's vision and drive help the team rise stronger with every challenge.",
      img: girishImg
    }
  ];

  useEffect(() => {
    fetch('http://localhost:5000/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'about' })
    }).catch(() => {});
  }, []);

  return (
    <motion.div
      className="about-page"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      
      {/* ================= TOP INTRO SECTION ================= */}
      <section className="about-intro-section">
        <div className="about-intro-images">
          {/* Two images stacked vertically, matching image_9.png */}
          <img src={aboutImg1} alt="Team huddle" className="intro-img-top" />
          <img src={aboutImg2} alt="Team gathering" className="intro-img-bottom" />
        </div>
        
        <div className="about-intro-content">
          <h1 className="about-title">ABOUT PRUTHVI PANTHERS MEHSANA</h1>
          <p>
            Proudly representing Mehsana, Pruthvi Panthers is one of the most passionate and determined teams in the Baroda Premier League (BPL), a tournament that brings together cricket, community, and competition at its finest.
          </p>
          <p>
            Built on strength, strategy, and ambition, Pruthvi Panthers is more than just a team; it's a symbol of Mehsana's fighting spirit. Every season, we step onto the field with one goal: to play fearless cricket and make our city proud.
          </p>
          <p>
            In the last BPL season, we finished third on the table, showing that consistency, teamwork, and belief can take us far. But this is just the beginning. The Panthers are ready to roar again in BPL 2026, stronger, sharper, and hungrier than ever before.
          </p>
          <p>
            The team is powered by four proud owners from Mehsana, each bringing their own vision and leadership.
          </p>
          <p className="highlight-text">
            The roar is back. The spirit is stronger. Get ready for BPL 2026.
          </p>
          {/* Matches Navbar 'Contact Us' button style */}
          <button className="know-more-btn">Know More</button>
        </div>
      </section>

      {/* ================= OWNERS SECTION ================= */}
      <section className="about-owners-section">
        <div className="owners-header">
          <h2>Pruthvi Panthers Owners</h2>
          <p>Meet the visionaries leading the Pruthvi Panthers.</p>
        </div>

        <motion.div
          className="owners-list"
          variants={sectionStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {owners.map((owner, index) => (
            // Alternate logic: If the index is odd (1, 3, etc.), apply the 'reverse' class
            <motion.div
              key={owner.id}
              className={`owner-detail-card ${index % 2 !== 0 ? 'reverse' : ''}`}
              variants={itemReveal}
            >
              <div className="owner-detail-image">
                <img src={owner.img} alt={owner.name} />
              </div>
              <div className="owner-detail-info">
                <h3>{owner.name}</h3>
                <h4>{owner.subtitle}</h4>
                <p>{owner.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

    </motion.div>
  );
};

export default About;