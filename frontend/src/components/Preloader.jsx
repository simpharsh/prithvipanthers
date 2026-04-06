import React, { useState, useEffect } from 'react';
import './Preloader.css';
import logo from '../logo.svg';

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide preloader after window load or a max delay of 2 seconds
    const handleLoad = () => {
      setLoading(false);
    };

    if (document.readyState === 'complete') {
      setTimeout(handleLoad, 500); // small delay for smoothness
    } else {
      window.addEventListener('load', handleLoad);
      // Fallback timeout in case load event never fires
      const timeout = setTimeout(handleLoad, 2500);
      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(timeout);
      };
    }
  }, []);

  if (!loading) return null;

  return (
    <div className={`preloader ${loading ? '' : 'hidden'}`}>
      <div className="preloader-content">
        <img src={logo} alt="Pruthvi Panthers" className="preloader-logo" />
        <div className="progress-bar-container">
          <div className="progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
