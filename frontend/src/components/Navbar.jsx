import React from 'react';
import './Navbar.css'; // Make sure to import the CSS file
import logo from '../assets/common/logo.png'; // Relative path to your logo

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Pruthvi Panthers Logo" className="logo" />
        <span className="brand-name">PRUTHVI PANTHERS MEHSANA</span>
      </div>
      
      <div className="navbar-right">
        <ul className="nav-links">
          {/* The 'active' class gives 'HOME' that red text and underline */}
          <li><a href="/" className="active">HOME</a></li>
          <li><a href="/about">ABOUT</a></li>
          <li><a href="/player">PLAYER</a></li>
          <li><a href="/gallery">GALLERY</a></li>
        </ul>
        <button className="contact-btn">CONTACT US</button>
      </div>
    </nav>
  );
};

export default Navbar;