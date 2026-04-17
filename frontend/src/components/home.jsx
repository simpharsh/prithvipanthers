import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './home.css';
import HeroSlider from './homeSections/HeroSlider';
import AboutSection from './homeSections/AboutSection';
import { fetchWithFallback } from '../utils/fetchWithFallback';
import MediaSection from './homeSections/MediaSection';
import AchievementsSection from './homeSections/AchievementsSection';
import OwnersSection from './homeSections/OwnersSection';
import SponsorsBenefitsSection from './homeSections/SponsorsBenefitsSection';

import aboutImage1 from '../assets/about/image-1.jpeg';
import aboutImage2 from '../assets/about/image-2.jpeg';
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
import { itemReveal, pageTransition, sectionStagger } from '../utils/pageMotion';

const DEFAULT_ACHIEVEMENT_IMAGES = [achPriyanshu, achMohit, achPureanshu, achJay];
const HERO_PLACEHOLDER_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="%230f172a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23f8fafc" font-family="Arial" font-size="56">Hero Image</text></svg>';
const DEFAULT_HERO_SLIDES = [
  {
    name: 'hero-1',
    img: HERO_PLACEHOLDER_IMAGE,
    title: 'JOIN THE LEGACY',
    subtitle: 'Be part of something extraordinary, join the Panther family',
  },
  {
    name: 'hero-2',
    img: HERO_PLACEHOLDER_IMAGE,
    title: 'TOP 3 FINISH IN BPL 2025',
    subtitle: 'Coming back stronger for BPL 2026',
  },
  {
    name: 'hero-3',
    img: HERO_PLACEHOLDER_IMAGE,
    title: 'CHAMPION MINDSET',
    subtitle: 'Unleashing the power of determination and teamwork',
  },
];

const Home = () => {
  const stats = useMemo(() => [
    { value: 5, label: 'TEAMS' },
    { value: 25, label: 'MATCHES' },
    { value: 100, label: 'BCA REGISTERED\nPLAYERS' },
    { value: 5040, label: 'MINUTES OF LIVE\nFOOTAGE ON GLOBAL\nOTT' },
  ], []);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlidesData, setHeroSlidesData] = useState(DEFAULT_HERO_SLIDES);
  const [animatedStats, setAnimatedStats] = useState(stats.map(() => 0));
  const [visibleSections, setVisibleSections] = useState({ hero: true });
  const sectionRefs = useRef({});

  useEffect(() => {
    fetchWithFallback('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'home' })
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadHeroSlides = async () => {
      try {
        const response = await fetchWithFallback('/api/gallery?category=hero&includeInactive=1');
        const data = await response.json();
        const rows = Array.isArray(data) ? data : [];
        const nextSlides = DEFAULT_HERO_SLIDES.map((fallbackSlide) => {
          const match = rows.find((row) => String(row?.name || '').toLowerCase() === fallbackSlide.name);
          return {
            ...fallbackSlide,
            img: match?.image_url || fallbackSlide.img,
          };
        });

        if (isMounted) setHeroSlidesData(nextSlides);
      } catch {
        if (isMounted) setHeroSlidesData(DEFAULT_HERO_SLIDES);
      }
    };

    loadHeroSlides();

    return () => {
      isMounted = false;
    };
  }, []);

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
    { id: 1, name: 'AJAY BAROT', role: 'Discipline & Trust', img: ownerAjay ,details:'Ensures discipline and trust from his civic and arms trade experience.' },
    { id: 2, name: 'JUGAL SINGH THAKOR', role: 'Public Leadership', img: ownerJugal ,details:'A former MP, blends political leadership with hospitality expertise' },
    { id: 3, name: 'SHAILESH CHAUDHARI', role: 'Business Strategy', img: ownerShailesh ,details:'Adds sharp business acumen and startup insight.' },
    { id: 4, name: 'GIRISH PATEL', role: 'Construction Leadership', img: ownerGirish ,details:'Brings bold leadership from the construction world.' },
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
  const mediaImages = useMemo(() => [], []);
  const [achievementImages, setAchievementImages] = useState([]);

  // Slider animation logic
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % heroSlidesData.length);
    }, 4500);
    return () => clearInterval(slideInterval);
  }, [heroSlidesData.length]);

  useEffect(() => {
    let isMounted = true;

    const loadAchievementImages = async () => {
      try {
        const response = await fetchWithFallback('/api/gallery?category=achievements&includeInactive=0');
        const data = await response.json();
        const rows = Array.isArray(data) ? data : [];
        
        // Only include images that are actually returned from the API (uploaded)
        const normalizedImages = rows
          .filter(row => row.image_url)
          .map(row => row.image_url);

        if (isMounted) setAchievementImages(normalizedImages);
      } catch {
        if (isMounted) setAchievementImages([]);
      }
    };

    loadAchievementImages();

    return () => {
      isMounted = false;
    };
  }, []);

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
    <motion.div
      className="home-page"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <HeroSlider
        slides={heroSlidesData}
        currentSlide={currentSlide}
        onDotClick={setCurrentSlide}
      />

      <motion.section
        className={`stats-section reveal-section ${visibleSections.stats ? 'is-visible' : ''}`}
        ref={registerSection('stats')}
        data-section="stats"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div className="stats-grid" variants={sectionStagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          {stats.map((stat, index) => (
            <motion.div className="stat-card" key={stat.label} variants={itemReveal}>
              <span className="stat-value">{animatedStats[index]}</span>
              <span className="stat-label">
                {stat.label.split('\n').map((line, idx, lines) => (
                  <React.Fragment key={`${stat.label}-${idx}`}>
                    {line}
                    {idx < lines.length - 1 ? <br /> : null}
                  </React.Fragment>
                ))}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <AboutSection
        isVisible={visibleSections.about}
        registerSection={registerSection}
        aboutImage1={aboutImage1}
        aboutImage2={aboutImage2}
        aboutPoints={aboutPoints}
      />

      <motion.section
        className={`sponsor-strip reveal-section ${visibleSections.brand ? 'is-visible' : ''}`}
        ref={registerSection('brand')}
        data-section="brand"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div className="content-shell sponsor-strip-inner" variants={sectionStagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
          <motion.div className="sponsor-copy" variants={itemReveal}>
            <span className="ghost-word">SPONSORS</span>
            <h2>POWER PARTNERS: PANTHERS'S VALUED SPONSORS</h2>
            <p>Pruthvi Panthers proudly supports youth cricket through training camps and development programs - making every sponsor part of our winning journey.</p>
          </motion.div>
          <motion.div className="sponsor-marquee" variants={itemReveal}>
            <div className="sponsor-marquee-track">
              {sponsorLoop.map((logo, index) => (
              <div className="sponsor-logo" key={`sponsor-${logo.id}-${index}`}>
                <img src={logo.img} alt={logo.alt} />
              </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

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
    </motion.div>
  );
};

export default Home;
