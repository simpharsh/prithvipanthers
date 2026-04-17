import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AdminAuth.css';
import { pageTransition } from '../../utils/pageMotion';
import { fetchWithFallback } from '../../utils/fetchWithFallback';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithFallback('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const payload = await response.json();

      if (response.ok && payload?.token) {
        localStorage.setItem('adminToken', payload.token);
        navigate('/admin/dashboard');
        return;
      }

      setError(payload?.message || payload?.error || 'Login failed');
    } catch (err) {
      setError(err.message || 'Server error');
    }
  };

  return (
    <motion.div
      className="admin-login-container"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div className="admin-login-card" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
        <h2>Admin Security Gateway</h2>
        <form onSubmit={handleLogin}>
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="login-btn">Secure Login</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AdminLogin;
