import React, { useState, useEffect } from 'react';
import { FiChevronUp } from 'react-icons/fi'; // Using the arrow icon from react-icons
import './scrolltotop.css';

const ScrollToTop = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  // Function to calculate how far down the page the user has scrolled
  const handleScroll = () => {
    const totalScroll = document.documentElement.scrollTop;
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Calculate percentage (0 to 100)
    const scroll = (totalScroll / windowHeight) * 100;
    setScrollProgress(scroll);
  };

  useEffect(() => {
    // Listen for scroll events when the component mounts
    window.addEventListener('scroll', handleScroll);
    
    // Clean up the event listener when the component unmounts
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to scroll back to the very top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // SVG Circle Math for the progress ring
  const radius = 24; // Radius of the circle
  const circumference = 2 * Math.PI * radius; // Total length of the circle path
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div 
      className={`scroll-to-top ${scrollProgress > 2 ? 'visible' : ''}`} 
      onClick={scrollToTop}
    >
      <svg className="progress-ring" width="60" height="60">
        {/* Background Track Circle */}
        <circle
          className="progress-ring-track"
          strokeWidth="4"
          fill="transparent"
          r={radius}
          cx="30"
          cy="30"
        />
        {/* Active Progress Circle */}
        <circle
          className="progress-ring-circle"
          strokeWidth="4"
          fill="transparent"
          r={radius}
          cx="30"
          cy="30"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset
          }}
        />
      </svg>
      <div className="scroll-icon">
        <FiChevronUp />
      </div>
    </div>
  );
};

export default ScrollToTop;