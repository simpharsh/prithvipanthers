import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css'; 
import logo from '../assets/common/logo.png'; 

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" aria-label="Pruthvi Panthers Home">
          <img src={logo} alt="Pruthvi Panthers Logo" className="logo" />
        </Link>
        <span className="brand-name">PRUVTHVI PANTHERS MEHSANA</span>
      </div>
      
      <div className="navbar-right">
        <ul className="nav-links">
          <li><NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>HOME</NavLink></li>
          <li><NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>ABOUT</NavLink></li>
          <li><NavLink to="/player" className={({ isActive }) => (isActive ? 'active' : '')}>PLAYER</NavLink></li>
          <li><NavLink to="/gallery" className={({ isActive }) => (isActive ? 'active' : '')}>GALLERY</NavLink></li>
        </ul>
        <Link to="/contact" className="contact-btn">CONTACT US</Link>
      </div>
    </nav>
  );
};

export default Navbar;