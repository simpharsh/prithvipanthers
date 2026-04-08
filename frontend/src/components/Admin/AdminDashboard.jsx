import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './AdminDashboard.css';
import logo from '../../assets/common/logo.png';
import { pageTransition } from '../../utils/pageMotion';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('players');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin');
    }
  }, [navigate]);

  return (
    <motion.div
      className="admin-layout"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src={logo} alt="Panthers logo" className="admin-brand-logo" />
          <span>PANTHERS ADMIN</span>
        </div>
        <nav className="admin-nav">
          <button className={activeTab === 'players' ? 'active' : ''} onClick={() => setActiveTab('players')}>Players</button>
          <button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')}>Gallery</button>
          <button className={activeTab === 'leads' ? 'active' : ''} onClick={() => setActiveTab('leads')}>Leads</button>
          <button className={activeTab === 'views' ? 'active' : ''} onClick={() => setActiveTab('views')}>Page Views</button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="admin-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="fade-in"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'players' && <ManagePlayers />}
            {activeTab === 'gallery' && <ManageGallery />}
            {activeTab === 'leads' && <ManageLeads />}
            {activeTab === 'views' && <ManageViews />}
          </motion.div>
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

/* --- SUB COMPONENTS --- */

const ManagePlayers = () => {
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({ name: '', role: 'Batters', cover: null, photo: null });
  const [status, setStatus] = useState('');

  const fetchPlayers = () => {
    fetch('http://localhost:5000/api/players')
      .then(res => res.json())
      .then(data => setPlayers(data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchPlayers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('role', form.role);
    if (form.cover) formData.append('cover', form.cover);
    if (form.photo) formData.append('photo', form.photo);

    try {
      const res = await fetch('http://localhost:5000/api/admin/players', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setForm({ name: '', role: 'Batters', cover: null, photo: null });
        fetchPlayers();
        setStatus('Player added successfully.');
      } else {
        const payload = await res.json().catch(() => ({}));
        setStatus(payload.error || payload.message || 'Failed to add player.');
      }
    } catch (e) {
      setStatus(e.message || 'Failed to add player.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this player?')) return;
    const token = localStorage.getItem('adminToken');
    await fetch(`http://localhost:5000/api/admin/players/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchPlayers();
  };

  return (
    <div className="admin-panel-section">
      <h2>Manage Players</h2>
      
      <div className="admin-card">
        <h3>Add New Player</h3>
        {status && <p className="admin-status">{status}</p>}
        <form onSubmit={handleSubmit} className="admin-form">
          <input placeholder="Player Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option>Batters</option>
            <option>All-Rounders</option>
            <option>Bowlers</option>
            <option>Wicket Keepers</option>
          </select>
          <div>
            <label>Cover Action Image:</label>
            <input type="file" accept="image/*" onChange={e => setForm({...form, cover: e.target.files[0]})} required />
          </div>
          <div>
            <label>Profile Cutout Image:</label>
            <input type="file" accept="image/*" onChange={e => setForm({...form, photo: e.target.files[0]})} required />
          </div>
          <button type="submit" className="save-btn">Add Player</button>
        </form>
      </div>

      <div className="admin-card">
        <h3>Players Roster</h3>
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            {players.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.role}</td>
                <td><button className="del-btn" onClick={() => handleDelete(p.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ManageGallery = () => {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const fetchGallery = () => {
    fetch('http://localhost:5000/api/gallery')
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(err => console.error(err));
  };
  useEffect(() => { fetchGallery(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setStatus('');
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/api/admin/gallery', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setFile(null);
        fetchGallery();
        setStatus('Gallery image uploaded successfully.');
      } else {
        const payload = await res.json().catch(() => ({}));
        setStatus(payload.error || payload.message || 'Failed to upload gallery image.');
      }
    } catch (err) {
      setStatus(err.message || 'Failed to upload gallery image.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    const token = localStorage.getItem('adminToken');
    await fetch(`http://localhost:5000/api/admin/gallery/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchGallery();
  };

  return (
    <div className="admin-panel-section">
      <h2>Manage Gallery</h2>
      
      <div className="admin-card">
        <h3>Upload New Image</h3>
        {status && <p className="admin-status">{status}</p>}
        <form onSubmit={handleUpload} className="admin-form" style={{flexDirection: 'row', alignItems: 'center'}}>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} required />
          <button type="submit" className="save-btn" style={{width: 'auto'}}>Upload Image</button>
        </form>
      </div>

      <div className="admin-gallery-grid">
        {images.map(img => (
          <div key={img.id} className="admin-gallery-item">
            <img src={`http://localhost:5000${img.image_url}`} alt="gallery" />
            <button className="del-btn block-btn" onClick={() => handleDelete(img.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ManageLeads = () => {
  const [leads, setLeads] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    fetch('http://localhost:5000/api/admin/leads', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => setLeads(data))
      .catch(console.error);
  }, []);

  return (
    <div className="admin-panel-section">
      <h2>Contact Form Leads</h2>
      <div className="admin-card" style={{overflowX: 'auto'}}>
        <table className="admin-table">
          <thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Message</th></tr></thead>
          <tbody>
            {leads.length === 0 ? <tr><td colSpan="4">No leads found or DB not connected.</td></tr> : leads.map(l => (
              <tr key={l.id}>
                <td>{new Date(l.created_at).toLocaleDateString()}</td>
                <td>{l.full_name}</td>
                <td>{l.email}</td>
                <td>{l.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ManageViews = () => {
  const [views, setViews] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    fetch('http://localhost:5000/api/admin/views', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => setViews(data))
      .catch(console.error);
  }, []);

  return (
    <div className="admin-panel-section">
      <h2>Page Views Analytics</h2>
      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>Page Route</th><th>Total Views</th></tr></thead>
          <tbody>
            {views.length === 0 ? <tr><td colSpan="2">No views recorded or DB not connected.</td></tr> : views.map(v => (
              <tr key={v.id}>
                <td style={{textTransform: 'capitalize'}}>{v.page_name}</td>
                <td><strong>{v.view_count}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
