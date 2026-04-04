import React from 'react';
import './footer.css';
import logo from '../assets/common/logo.png'; // Reusing your existing logo path

// Importing icons from react-icons
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { FiMail, FiPhone } from 'react-icons/fi';
import { IoLocationOutline } from 'react-icons/io5';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Column 1: Brand & About */}
        <div className="footer-col brand-col">
          <div className="footer-logo-wrapper">
            <img src={logo} alt="Pruthvi Panthers Logo" className="footer-logo" />
            <span className="footer-brand-name">PRUTHVI PANTHERS</span>
          </div>
          <p className="footer-description">
            Pruthvi Panthers representing Mehsana with pride and power in the Baroda Premier League. Built on passion, discipline, and unity.
          </p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon">
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col links-col">
          <h3 className="footer-heading">
            <span className="red-dot"></span> QUICK LINKS
          </h3>
          <ul className="footer-links">
            <li><a href="/">HOME</a></li>
            <li><a href="/about">ABOUT</a></li>
            <li><a href="/player">PLAYER</a></li>
            <li><a href="/contact">CONTACT</a></li>
            <li><a href="/gallery">GALLERY</a></li>
          </ul>
        </div>

        {/* Column 3: Get In Touch */}
        <div className="footer-col contact-col">
          <h3 className="footer-heading">
            <span className="red-dot"></span> GET IN TOUCH
          </h3>
          <ul className="footer-contact-info">
            <li>
              <FiMail className="contact-icon" />
              <a href="mailto:team@pruthvipanthers.com">team@pruthvipanthers.com</a>
            </li>
            <li>
              <FiPhone className="contact-icon" />
              <a href="tel:+919876543210">+91 98765 43210</a>
            </li>
            <li className="location-item">
              <IoLocationOutline className="contact-icon location-icon" />
              <span>
                Mehsana, Gujarat<br />
                India 384001
              </span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className="footer-bottom">
        <p>© 2025 Pruthvi Panthers Mehsana. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;