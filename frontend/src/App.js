import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Import all your components
import Navbar from './components/Navbar';
import Home from './components/home';
import About from './components/about';
import Player from './components/player';
import Gallery from './components/gallery';
import Contact from './components/contact';
import Footer from './components/footer';
import ScrollToTop from './components/scrolltotop';

import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import Preloader from './components/Preloader';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="app-container">
      <Preloader />
      {/* These components sit OUTSIDE the Routes so they show on every page, except admin */}
      {!isAdmin && <Navbar />}
      
      {/* This is the dynamic area that changes based on the URL */}
      <div className={isAdmin ? "" : "main-content"}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/player" element={<Player />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </AnimatePresence>
      </div>
      
      {/* Footer and Scroll sit at the bottom of every page, except admin */}
      {!isAdmin && (
        <>
          <Footer />
          <ScrollToTop />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;