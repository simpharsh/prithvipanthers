import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all your components
import Navbar from './components/Navbar';
import Home from './components/home';
import About from './components/about';
import Footer from './components/footer';
import ScrollToTop from './components/scrolltotop';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* These components sit OUTSIDE the Routes so they show on every page */}
        <Navbar />
        
        {/* This is the dynamic area that changes based on the URL */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            {/* We will add Player and Gallery here later! */}
          </Routes>
        </div>
        
        {/* Footer and Scroll sit at the bottom of every page */}
        <Footer />
        <ScrollToTop />
      </div>
    </Router>
  );
}

export default App;