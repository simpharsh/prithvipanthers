import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import './AdminDashboard.css';
import logo from '../../assets/common/logo.png';
import { pageTransition } from '../../utils/pageMotion';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

const uploadImageToSupabase = async (file, bucketName = 'gallery') => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return data.publicUrl;
};

// Generic Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="close-modal-btn">×</button>
        </div>
        <div className="admin-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Generic Pagination Component
const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;
  return (
    <div className="admin-pagination">
      <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Prev</button>
      <span>Page {currentPage} of {totalPages}</span>
      <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  );
};

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [form, setForm] = useState({ name: '', role: 'Batters', cover: null, photo: null });
  const [status, setStatus] = useState({ type: '', message: '' });

  const fetchPlayers = () => {
    fetch('/api/players')
      .then(res => res.json())
      .then(data => setPlayers(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchPlayers(); }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({ name: '', role: 'Batters', cover: null, photo: null });
    setStatus({ type: '', message: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (player) => {
    setIsEditing(true);
    setEditId(player.id);
    setForm({ name: player.name, role: player.role, cover: null, photo: null });
    setStatus({ type: '', message: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    const token = localStorage.getItem('adminToken');

    if (!isEditing && (!form.cover || !form.photo)) {
        setStatus({ type: 'error', message: 'Images are required for a new player.' });
        return;
    }

    try {
      setStatus({ type: 'info', message: 'Uploading images...' });
      
      let cover_image_url = null;
      let photo_image_url = null;
      
      if (form.cover) cover_image_url = await uploadImageToSupabase(form.cover, 'uploads');
      if (form.photo) photo_image_url = await uploadImageToSupabase(form.photo, 'uploads');

      setStatus({ type: 'info', message: 'Saving player record...' });

      const url = '/api/players';
      const method = isEditing ? 'PUT' : 'POST';
      
      const payload = { name: form.name, role: form.role };
      if (isEditing) payload.id = editId;
      if (cover_image_url) payload.cover_image_url = cover_image_url;
      if (photo_image_url) payload.photo_image_url = photo_image_url;

      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchPlayers();
      } else {
        const errPayload = await res.json().catch(() => ({}));
        setStatus({ type: 'error', message: errPayload.error || errPayload.message || 'Failed to save.' });
      }
    } catch (e) {
      setStatus({ type: 'error', message: e.message || 'Failed to save player.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this player?')) return;
    const token = localStorage.getItem('adminToken');
    await fetch(`/api/players?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchPlayers();
  };

  // Setup list logic: Reverse to show latest first, then search, then paginate.
  const filteredPlayers = useMemo(() => {
    let list = [...players].reverse();
    if (searchQuery) list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  }, [players, searchQuery]);

  const paginatedPlayers = filteredPlayers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="admin-panel-section">
      <div className="admin-header-row">
        <h2>Manage Players</h2>
        <input 
          type="text" 
          className="admin-search" 
          placeholder="Search players..." 
          value={searchQuery} 
          onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
        />
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            {paginatedPlayers.length === 0 && <tr><td colSpan="4">No players found.</td></tr>}
            {paginatedPlayers.map((p, idx) => (
              <tr key={p.id}>
                <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                <td>{p.name}</td>
                <td>{p.role}</td>
                <td>
                  <button className="edit-btn" onClick={() => openEditModal(p)}>Edit</button>
                  <button className="del-btn" onClick={() => handleDelete(p.id)} style={{marginLeft: '0.5rem'}}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination 
          currentPage={currentPage} 
          totalItems={filteredPlayers.length} 
          itemsPerPage={itemsPerPage} 
          onPageChange={setCurrentPage} 
        />
      </div>

      <button className="floating-add-btn" onClick={openAddModal}>+</button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Edit Player' : 'Add New Player'}>
        {status.message && (
          <div className={`admin-status ${status.type}`}>
            <span>{status.message}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="admin-form">
          <input placeholder="Player Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option>Batters</option>
            <option>All-Rounders</option>
            <option>Bowlers</option>
            <option>Wicket Keepers</option>
          </select>
          <div>
            <label>Cover Action Image: {isEditing && "(Leave blank to keep existing)"}</label>
            <input type="file" accept="image/*" onChange={e => setForm({...form, cover: e.target.files[0]})} />
          </div>
          <div>
            <label>Profile Cutout Image: {isEditing && "(Leave blank to keep existing)"}</label>
            <input type="file" accept="image/*" onChange={e => setForm({...form, photo: e.target.files[0]})} />
          </div>
          <button type="submit" className="save-btn">{isEditing ? 'Save Changes' : 'Add Player'}</button>
        </form>
      </Modal>
    </div>
  );
};

const ManageGallery = () => {
  const [images, setImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchGallery = () => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => setImages(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };
  
  useEffect(() => { fetchGallery(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setStatus({ type: 'info', message: 'Uploading image to storage...' });
    const token = localStorage.getItem('adminToken');
    
    try {
      const image_url = await uploadImageToSupabase(file, 'uploads');
      setStatus({ type: 'info', message: 'Saving gallery record...' });

      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ image_url, name: file.name })
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setFile(null);
        fetchGallery();
      } else {
        const payload = await res.json().catch(() => ({}));
        setStatus({ type: 'error', message: payload.error || payload.message || 'Failed to upload.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to upload gallery image.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    const token = localStorage.getItem('adminToken');
    await fetch(`/api/gallery?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchGallery();
  };

  const sortedImages = useMemo(() => [...images].reverse(), [images]); // Local newest first setup, API also does desc
  const paginatedImages = sortedImages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="admin-panel-section">
      <h2>Manage Gallery</h2>
      
      <div className="admin-gallery-grid">
        {paginatedImages.map(img => (
          <div key={img.id} className="admin-gallery-item">
            <img src={img.image_url} alt="gallery" />
            <button className="del-btn block-btn" onClick={() => handleDelete(img.id)}>Delete</button>
          </div>
        ))}
      </div>
      
      <div style={{marginTop: '2rem'}}>
        <Pagination 
          currentPage={currentPage} 
          totalItems={images.length} 
          itemsPerPage={itemsPerPage} 
          onPageChange={setCurrentPage} 
        />
      </div>

      <button className="floating-add-btn" onClick={() => { setStatus({type:'', message:''}); setFile(null); setIsModalOpen(true); }}>+</button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload New Image">
        {status.message && (
          <div className={`admin-status ${status.type}`}>
            <span>{status.message}</span>
          </div>
        )}
        <form onSubmit={handleUpload} className="admin-form">
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} required />
          <button type="submit" className="save-btn">Upload Image</button>
        </form>
      </Modal>
    </div>
  );
};

const ManageLeads = () => {
  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    fetch('/api/admin/leads', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => setLeads(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const sortedLeads = useMemo(() => [...leads].reverse(), [leads]);
  const paginatedLeads = sortedLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="admin-panel-section">
      <h2>Contact Form Leads</h2>
      <div className="admin-card" style={{overflowX: 'auto'}}>
        <table className="admin-table">
          <thead><tr><th>No.</th><th>Date</th><th>Name</th><th>Email</th><th>Message</th></tr></thead>
          <tbody>
            {paginatedLeads.length === 0 ? <tr><td colSpan="5">No leads found.</td></tr> : paginatedLeads.map((l, idx) => (
              <tr key={l.id}>
                <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                <td>{new Date(l.created_at).toLocaleDateString()}</td>
                <td>{l.full_name}</td>
                <td>{l.email}</td>
                <td>{l.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination 
          currentPage={currentPage} 
          totalItems={leads.length} 
          itemsPerPage={itemsPerPage} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
};

const ManageViews = () => {
  const [views, setViews] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    fetch('/api/admin/views', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => setViews(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  return (
    <div className="admin-panel-section">
      <h2>Page Views Analytics</h2>
      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>Page Route</th><th>Total Views</th></tr></thead>
          <tbody>
            {views.length === 0 ? <tr><td colSpan="2">No analytics found.</td></tr> : views.map(v => (
              <tr key={v.id}>
                <td>{v.page_name}</td>
                <td>{v.view_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
