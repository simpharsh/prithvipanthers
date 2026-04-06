import React, { useEffect, useMemo, useRef, useState } from 'react';
import './home.css';
import HeroSlider from './homeSections/HeroSlider';
import AboutSection from './homeSections/AboutSection';
import MediaSection from './homeSections/MediaSection';
import AchievementsSection from './homeSections/AchievementsSection';
import OwnersSection from './homeSections/OwnersSection';
import SponsorsBenefitsSection from './homeSections/SponsorsBenefitsSection';

// Exact image paths requested
import slider1 from '../assets/home/slider-1.jpeg';
import slider2 from '../assets/home/slider-2.jpeg';
import slider3 from '../assets/home/slider-3.jpeg';

import aboutImage1 from '../assets/about/image-1.jpeg';
import aboutImage2 from '../assets/about/image-2.jpeg';
import media1 from '../assets/home/media-1.jpeg';
import media2 from '../assets/home/media-2.jpeg';
import media3 from '../assets/home/media-3.jpeg';
import media4 from '../assets/home/media-4.jpeg';
import media5 from '../assets/home/media-5.jpeg';
import achPriyanshu from '../assets/home/achivment-priyanshu.jpeg';
import achMohit from '../assets/home/achivment-mohit.jpeg';
import achPureanshu from '../assets/home/achivment-pureanshu.jpeg';
import achJay from '../assets/home/achivment-jay.jpeg';
import ownerAjay from '../assets/about/ajay.jpeg';
import ownerGirish from '../assets/about/girish.jpeg';
import ownerJugal from '../assets/about/jugal.jpeg';
import ownerShailesh from '../assets/about/shailesh.jpeg';
import vishh from '../assets/home/vishh.png';
import tremont from '../assets/home/tremont.png';
import spa from '../assets/home/spa.png';
import rajwanshi from '../assets/home/rajwanshi.png';
import opufnt from '../assets/home/opufnt.png';
import nptsi from '../assets/home/nptsi.png';
import bharat from '../assets/home/bharat.png';
import mahakali from '../assets/home/mahakali.png';

const Home = () => {
  const stats = useMemo(() => [
    { value: 5, label: 'TEAMS' },
    { value: 25, label: 'MATCHES' },
    { value: 100, label: 'BCA REGISTERED\nPLAYERS' },
    { value: 5040, label: 'MINUTES OF LIVE\nFOOTAGE ON GLOBAL\nOTT' },
  ], []);

  // Updated slider data to match text to specific images
  const heroSlidesData = [
    {
      img: slider1,
      title: "JOIN THE LEGACY",
      subtitle: "Be part of something extraordinary, join the Panther family"
    },
    {
      img: slider2,
      title: "TOP 3 FINISH IN BPL 2025",
      subtitle: "Coming back stronger for BPL 2026"
    },
    {
      img: slider3,
      title: "CHAMPION MINDSET",
      subtitle: "Unleashing the power of determination and teamwork"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [animatedStats, setAnimatedStats] = useState(stats.map(() => 0));
  const [visibleSections, setVisibleSections] = useState({ hero: true });
  const sectionRefs = useRef({});

  const registerSection = (sectionKey) => (element) => {
    if (element) {
      sectionRefs.current[sectionKey] = element;
    }
  };

  const aboutPoints = [
    'Proudly representing Mehsana, Pruthvi Panthers is one of the most passionate and dynamic teams in the Baroda Premier League (BPL), a tournament that brings together cricket, community, and competition at its finest.',
    'Built on strength, strategy, and ambition, Pruthvi Panthers is more than just a team. It is a symbol of Mehsana\'s fighting spirit. Every season, we step onto the field with one goal: to play fearless cricket and make our city proud.',
    'In the last BPL season, we finished third on the table, showing that consistency, teamwork, and belief can take us far. But this is just the beginning. The Panthers are ready to roar again in BPL 2026, stronger, sharper, and hungrier than ever before.',
    'The team is powered by four proud owners from Mehsana, each bringing their own vision and leadership.',
    'The roar is back. The spirit is stronger. Get ready for BPL 2026.',
  ];

  const owners = [
    { id: 1, name: 'AJAY BAROT', role: 'Discipline & Trust', img: ownerAjay },
    { id: 2, name: 'JUGAL SINGH THAKUR', role: 'Public Leadership', img: ownerJugal },
    { id: 3, name: 'SHAILESH CHAUHAN', role: 'Business Strategy', img: ownerShailesh },
    { id: 4, name: 'GIRISH PATEL', role: 'Construction Leadership', img: ownerGirish },
  ];

  const benefitCards = [
    { id: 1, text: 'In-stadium branding and activation opportunities.' },
    { id: 2, text: 'TV/Print/Radio/Hoardings Promotion.' },
    { id: 3, text: 'Social Media marketing.' },
    { id: 4, text: 'Brand visibility on broadcast and OTT channel.' },
    { id: 5, text: 'PR and Print Media with advertising and editorial coverages in top newspapers.' },
    { id: 6, text: 'Branding on the players uniform.' },
  ];

  const sponsorLogos = useMemo(() => [
    { id: 1, img: vishh, alt: 'Vishh Sponsor' },
    { id: 2, img: tremont, alt: 'Tremont Sponsor' },
    { id: 3, img: spa, alt: 'SPA Sponsor' },
    { id: 4, img: rajwanshi, alt: 'Rajwanshi Sponsor' },
    { id: 5, img: opufnt, alt: 'Opufnt Sponsor' },
    { id: 6, img: nptsi, alt: 'NPTSI Sponsor' },
    { id: 7, img: bharat, alt: 'Bharat Sponsor' },
    { id: 8, img: mahakali, alt: 'Mahakali Sponsor' },
  ], []);

  const sponsorLoop = useMemo(() => [...sponsorLogos, ...sponsorLogos], [sponsorLogos]);
  const mediaImages = useMemo(() => [media1, media2, media3, media4, media5], []);
  const achievementImages = useMemo(() => [achPriyanshu, achMohit, achPureanshu, achJay], []);

  // Slider animation logic
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % heroSlidesData.length);
    }, 4500);
    return () => clearInterval(slideInterval);
  }, [heroSlidesData.length]);

  // Scroll visibility observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const key = entry.target.getAttribute('data-section');
            if (key) {
              setVisibleSections((prev) => ({ ...prev, [key]: true }));
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.22 }
    );

    Object.entries(sectionRefs.current).forEach(([key, node]) => {
      if (!visibleSections[key] && node) {
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, [visibleSections]);

  // Stats counter animation
  useEffect(() => {
    if (!visibleSections.stats) return;

    let frameId;
    const duration = 1500;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats(stats.map((stat) => Math.round(stat.value * eased)));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [stats, visibleSections.stats]);

  return (
    <div className="home-page">
      <HeroSlider
        slides={heroSlidesData}
        currentSlide={currentSlide}
        onDotClick={setCurrentSlide}
      />

      <section
        className={`stats-section reveal-section ${visibleSections.stats ? 'is-visible' : ''}`}
        ref={registerSection('stats')}
        data-section="stats"
      >
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div className="stat-card" key={stat.label}>
              <span className="stat-value">{animatedStats[index]}</span>
              <span className="stat-label">
                {stat.label.split('\n').map((line, idx, lines) => (
                  <React.Fragment key={`${stat.label}-${idx}`}>
                    {line}
                    {idx < lines.length - 1 ? <br /> : null}
                  </React.Fragment>
                ))}
              </span>
            </div>
          ))}
        </div>
      </section>

      <AboutSection
        isVisible={visibleSections.about}
        registerSection={registerSection}
        aboutImage1={aboutImage1}
        aboutImage2={aboutImage2}
        aboutPoints={aboutPoints}
      />

      <MediaSection
        isVisible={visibleSections.media}
        registerSection={registerSection}
        mediaImages={mediaImages}
      />

      <AchievementsSection
        isVisible={visibleSections.achievements}
        registerSection={registerSection}
        achievementImages={achievementImages}
      />

      <OwnersSection
        isVisible={visibleSections.owners}
        registerSection={registerSection}
        owners={owners}
      />

      <SponsorsBenefitsSection
        isVisible={visibleSections.benefits}
        registerSection={registerSection}
        benefitCards={benefitCards}
      />

      <section
        className={`sponsor-strip reveal-section ${visibleSections.brand ? 'is-visible' : ''}`}
        ref={registerSection('brand')}
        data-section="brand"
      >
        <div className="content-shell sponsor-strip-inner">
          <div className="sponsor-copy">
            <span className="ghost-word">SPONSORS</span>
            <h2>POWER PARTNERS: PANTHERS'S VALUED SPONSORS</h2>
            <p>Pruthvi Panthers proudly supports youth cricket through training camps and development programs - making every sponsor part of our winning journey.</p>
          </div>
          <div className="sponsor-marquee">
            <div className="sponsor-marquee-track">
              {sponsorLoop.map((logo, index) => (
              <div className="sponsor-logo" key={`sponsor-${logo.id}-${index}`}>
                <img src={logo.img} alt={logo.alt} />
              </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;