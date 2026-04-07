import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css'; 
import logo from '../assets/common/logo.png'; 

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" aria-label="Pruthvi Panthers Home" onClick={closeMobileMenu}>
          <img src={logo} alt="Pruthvi Panthers Logo" className="logo" />
        </Link>
        <span className="brand-name">PRUTHVI PANTHERS MEHSANA</span>
      </div>
      
      <div className="navbar-right">
        <ul className={isMobileMenuOpen ? "nav-links active" : "nav-links"}>
          <li><NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMobileMenu}>HOME</NavLink></li>
          <li><NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMobileMenu}>ABOUT</NavLink></li>
          <li><NavLink to="/player" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMobileMenu}>PLAYER</NavLink></li>
          <li><NavLink to="/gallery" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMobileMenu}>GALLERY</NavLink></li>
          {/* Mobile Contact Button - Displayed only in mobile menu */}
          <li className="mobile-only-btn" style={{ display: isMobileMenuOpen ? 'block' : 'none' }}>
             <Link to="/contact" className="contact-btn" style={{ display: 'inline-block' }} onClick={closeMobileMenu}>CONTACT US</Link>
          </li>
        </ul>
        <Link to="/contact" className="contact-btn desktop-contact-btn">CONTACT US</Link>

        {/* Hamburger Icon */}
        <button className="menu-icon" onClick={toggleMobileMenu} aria-label="Toggle navigation">
          {isMobileMenuOpen ? (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;