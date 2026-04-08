import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './contact.css';
import { pageTransition } from '../utils/pageMotion';
import { FiMail, FiPhone } from 'react-icons/fi';
import { IoLocationOutline } from 'react-icons/io5';

const initialState = {
  name: '',
  email: '',
  message: ''
};

const Contact = () => {
  const [formData, setFormData] = useState(initialState);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetch('http://localhost:5000/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'contact' })
    }).catch(() => {});
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });


    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to send your message right now.');
      }

      setStatus({ type: 'success', message: 'Message sent successfully. We will contact you soon.' });
      setFormData(initialState);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Something went wrong. Please try again.' });
    }
  };

  return (
    <motion.div
      className="contact-page"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <section className="contact-shell">
        <div className="contact-shell-inner">
          <motion.header
            className="contact-header"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.35 }}
          >
            <h1>GET IN TOUCH</h1>
            <p>Join us on our journey to excellence</p>
          </motion.header>

          <motion.section
            className="contact-content"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <form className="contact-form" onSubmit={handleSubmit}>
              <h2>SEND US A MESSAGE</h2>

              <label htmlFor="name">Your Name *</label>
              <input id="name" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />

              <label htmlFor="email">Your Email *</label>
              <input id="email" name="email" type="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />

              <label htmlFor="message">Your Message *</label>
              <textarea id="message" name="message" placeholder="Your Message" value={formData.message} onChange={handleChange} rows="4" required />

              <button type="submit">SEND MESSAGE</button>

              {status.message && (
                <p className={`contact-status ${status.type}`}>{status.message}</p>
              )}
            </form>

            <aside className="contact-info">
              <h2>CONTACT INFORMATION</h2>

              <div className="info-row">
                <FiMail className="info-icon" />
                <div>
                  <h3>Email</h3>
                  <p>team@pruthvipanthers.com</p>
                </div>
              </div>

              <div className="info-row">
                <FiPhone className="info-icon" />
                <div>
                  <h3>Phone</h3>
                  <p>+91 98765 43210</p>
                </div>
              </div>

              <div className="info-row">
                <IoLocationOutline className="info-icon" />
                <div>
                  <h3>Location</h3>
                  <p>Mehsana, Gujarat, India</p>
                </div>
              </div>
            </aside>
          </motion.section>
        </div>
      </section>
    </motion.div>
  );
};

export default Contact;
