import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './AdminDashboard.css';
import logo from '../../assets/common/logo.png';
import { fetchWithFallback } from '../../utils/fetchWithFallback';
import achPriyanshu from '../../assets/home/achivment-priyanshu.jpeg';
import achMohit from '../../assets/home/achivment-mohit.jpeg';
import achPureanshu from '../../assets/home/achivment-pureanshu.jpeg';
import achJay from '../../assets/home/achivment-jay.jpeg';
import { pageTransition } from '../../utils/pageMotion';
import { FaEye, FaEyeSlash, FaEdit, FaTrash, FaLink, FaUnlink, FaCheck, FaTimes } from 'react-icons/fa';

/**
 * Image upload currently requires a cloud storage provider (like Cloudinary, AWS S3, or Supabase Storage).
 * Since Vercel is serverless, local disk storage is not supported for uploads.
 * This helper should be updated with your chosen storage provider's logic.
 */
const uploadImage = async (file) => {
  if (!file) throw new Error('No file selected for upload.');
  
  const token = localStorage.getItem('adminToken');

  // Vercel Blob via our API
  // We use fetchWithFallback but must be careful with headers for File bodies
  const response = await fetchWithFallback('/api/admin/upload-image', {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'x-filename': encodeURIComponent(file.name),
      // We omit Content-Type here to let the browser set it with the correct boundary if needed,
      // or we set it explicitly if our backend expects the raw stream.
      'Content-Type': file.type || 'application/octet-stream'
    },
    body: file,
  });

  const payload = await response.json();
  if (response.ok && payload?.url) {
    return payload.url;
  }

  throw new Error(payload?.error || payload?.message || 'Failed to upload image.');
};

const readImageDimensions = (source) => new Promise((resolve, reject) => {
  const image = new Image();
  const objectUrl = source instanceof File ? URL.createObjectURL(source) : source;

  image.onload = () => {
    resolve({ width: image.naturalWidth, height: image.naturalHeight });
    if (source instanceof File) URL.revokeObjectURL(objectUrl);
  };

  image.onerror = (error) => {
    if (source instanceof File) URL.revokeObjectURL(objectUrl);
    reject(error);
  };

  image.src = objectUrl;
});

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

const normalizeBoolean = (value) => value === true || value === 'true' || value === 1 || value === '1';
const normalizeLeadStatus = (lead) => (lead?.status || 'new').toLowerCase();
const formatLeadDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
};

const ACHIEVEMENT_SLOTS = [
  { name: 'achievement-1', label: 'Achievement 1', fallbackImage: achPriyanshu },
  { name: 'achievement-2', label: 'Achievement 2', fallbackImage: achMohit },
  { name: 'achievement-3', label: 'Achievement 3', fallbackImage: achPureanshu },
  { name: 'achievement-4', label: 'Achievement 4', fallbackImage: achJay },
];

const HERO_PLACEHOLDER_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="%230f172a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23f8fafc" font-family="Arial" font-size="56">Hero Image</text></svg>';

const HERO_SLOTS = [
  { name: 'hero-1', label: 'Hero Slide 1', fallbackImage: HERO_PLACEHOLDER_IMAGE, lockWidth: 1600, lockHeight: 900 },
  { name: 'hero-2', label: 'Hero Slide 2', fallbackImage: HERO_PLACEHOLDER_IMAGE, lockWidth: 1600, lockHeight: 900 },
  { name: 'hero-3', label: 'Hero Slide 3', fallbackImage: HERO_PLACEHOLDER_IMAGE, lockWidth: 1600, lockHeight: 900 },
];

const panelMotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

const gridStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const gridItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('leads');
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
          <button className={activeTab === 'leads' ? 'active' : ''} onClick={() => setActiveTab('leads')}>Leads</button>
          <button className={activeTab === 'players' ? 'active' : ''} onClick={() => setActiveTab('players')}>Players</button>
          <button className={activeTab === 'hero' ? 'active' : ''} onClick={() => setActiveTab('hero')}>Hero Slider</button>
          <button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')}>Gallery</button>
          <button className={activeTab === 'achievements' ? 'active' : ''} onClick={() => setActiveTab('achievements')}>Achievements</button>
          <button className={activeTab === 'views' ? 'active' : ''} onClick={() => setActiveTab('views')}>Page Views</button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="admin-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="fade-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'leads' && <ManageLeads />}
            {activeTab === 'players' && <ManagePlayers />}
            {activeTab === 'hero' && <ManageHeroSlider />}
            {activeTab === 'gallery' && <ManageGallery />}
            {activeTab === 'achievements' && <ManageAchievements />}
            {activeTab === 'views' && <ManageViews />}
          </motion.div>
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

/* --- SUB COMPONENTS --- */

const ManageHeroSlider = () => {
  const [slots, setSlots] = useState(
    HERO_SLOTS.map((slot) => ({
      ...slot,
      id: null,
      image_url: slot.fallbackImage,
      is_active: true,
      width: slot.lockWidth,
      height: slot.lockHeight,
    }))
  );
  const [status, setStatus] = useState({ type: '', message: '' });
  const [heroDraftFiles, setHeroDraftFiles] = useState({});
  const [updatingSlot, setUpdatingSlot] = useState('');

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => setStatus({ type: '', message: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const fetchHeroSlides = async () => {
    try {
      const response = await fetchWithFallback('/api/gallery?category=hero&includeInactive=1');
      const data = await response.json();
      const rows = Array.isArray(data) ? data : [];

      const nextSlots = await Promise.all(HERO_SLOTS.map(async (slot) => {
        const match = rows.find((row) => String(row?.name || '').toLowerCase() === slot.name);
        const imageUrl = match?.image_url || slot.fallbackImage;

        return {
          ...slot,
          id: match?.id || null,
          image_url: imageUrl,
          is_active: match ? normalizeBoolean(match.is_active) : true,
          width: slot.lockWidth,
          height: slot.lockHeight,
        };
      }));

      setSlots(nextSlots);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchHeroSlides();
  }, []);

  const saveHeroSlide = async (slot, file) => {
    if (!file) return;

    const slotDimensions = {
      width: slot.lockWidth,
      height: slot.lockHeight,
    };

    try {
      setUpdatingSlot(slot.name);
      setStatus({ type: 'info', message: `Checking ${slot.label.toLowerCase()} dimensions...` });
      const fileDimensions = await readImageDimensions(file);

      if (fileDimensions.width !== slotDimensions.width || fileDimensions.height !== slotDimensions.height) {
        setStatus({
          type: 'error',
          message: `Use an image sized ${slotDimensions.width} x ${slotDimensions.height} for ${slot.label}.`,
        });
        return;
      }

      const token = localStorage.getItem('adminToken');
      setStatus({ type: 'info', message: `Uploading ${slot.label.toLowerCase()}...` });
      const image_url = await uploadImage(file);

      const payload = {
        image_url,
        name: slot.name,
        category: 'hero',
        is_active: slot.is_active !== false,
        is_media_linked: false,
      };

      const response = await fetchWithFallback('/api/gallery', {
        method: slot.id ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slot.id ? { id: slot.id, ...payload } : payload),
      });

      if (!response.ok) {
        const payloadData = await response.json().catch(() => ({}));
        throw new Error(payloadData.error || payloadData.message || 'Failed to save hero image.');
      }

      setStatus({ type: 'success', message: `${slot.label} updated successfully.` });
      setHeroDraftFiles((prev) => {
        const next = { ...prev };
        delete next[slot.name];
        return next;
      });
      fetchHeroSlides();
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to update hero image.' });
    } finally {
      setUpdatingSlot('');
    }
  };

  return (
    <motion.div className="admin-panel-section" {...panelMotionProps}>
      {status.message && (
        <div className={`admin-status ${status.type}`}>
          <span>{status.message}</span>
        </div>
      )}
      <div className="admin-header-row">
        <h2>Hero Slider</h2>
      </div>

      <motion.div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px',
        }}
        variants={gridStagger}
        initial="hidden"
        animate="visible"
      >
        {slots.map((slot) => (
          <motion.div key={slot.name} className="admin-card" style={{ marginBottom: 0 }} variants={gridItem} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <div className="admin-gallery-state-row" style={{ marginBottom: '12px' }}>
              <span className={`admin-badge ${slot.is_active ? 'active' : 'inactive'}`}>
                {slot.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h3 style={{ marginBottom: '16px' }}>{slot.label}</h3>
            <img
              src={slot.image_url}
              alt={slot.label}
              style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '12px', marginBottom: '14px', background: '#f8fafc' }}
            />
            <div className="admin-upload-block">
              <label className="admin-upload-title" htmlFor={`hero-upload-${slot.name}`}>
                Replace Photo
              </label>
              <input
                id={`hero-upload-${slot.name}`}
                className="admin-upload-input"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setHeroDraftFiles((prev) => ({
                    ...prev,
                    [slot.name]: file,
                  }));
                }}
              />
              <label htmlFor={`hero-upload-${slot.name}`} className="admin-upload-trigger">
                Choose File
              </label>
              <div className="admin-upload-actions">
                <button
                  type="button"
                  className="save-btn admin-upload-update-btn"
                  disabled={!heroDraftFiles[slot.name] || updatingSlot === slot.name}
                  onClick={() => saveHeroSlide(slot, heroDraftFiles[slot.name])}
                >
                  {updatingSlot === slot.name ? 'Updating...' : 'Update'}
                </button>
                <span className="admin-upload-file-name">
                  {heroDraftFiles[slot.name]?.name || 'No file selected'}
                </span>
              </div>
              <p className="admin-upload-hint">Image size must stay {slot.width} x {slot.height}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

const ManagePlayers = () => {
  const [players, setPlayers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [form, setForm] = useState({ name: '', role: '', cover: null, photo: null, isActive: true });
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => setStatus({ type: '', message: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const fetchPlayers = () => {
    fetchWithFallback('/api/players?includeInactive=1')
      .then(res => res.json())
      .then(data => setPlayers(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchPlayers(); }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({ name: '', role: 'Batters', cover: null, photo: null, isActive: true });
    setStatus({ type: '', message: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (player) => {
    setIsEditing(true);
    setEditId(player.id);
    setForm({
      name: player.name || '',
      role: player.role || 'Batters',
      cover: null,
      photo: null,
      isActive: normalizeBoolean(player.is_active),
    });
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

      if (form.cover) cover_image_url = await uploadImage(form.cover);
      if (form.photo) photo_image_url = await uploadImage(form.photo);

      const endpoint = '/api/players';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetchWithFallback(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...(isEditing && { id: editId }),
          name: form.name,
          role: form.role,
          is_active: form.isActive,
          ...(cover_image_url && { cover_image_url }),
          ...(photo_image_url && { photo_image_url }),
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to save player');
      }

      setIsModalOpen(false);
      fetchPlayers();
    } catch (e) {
      setStatus({ type: 'error', message: e.message || 'Failed to save player.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this player?')) return;
    const token = localStorage.getItem('adminToken');
    await fetchWithFallback(`/api/players?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchPlayers();
  };

  const toggleActive = async (player) => {
    const token = localStorage.getItem('adminToken');
    await fetchWithFallback('/api/players', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: player.id, is_active: !normalizeBoolean(player.is_active) })
    });
    fetchPlayers();
  };

  // Setup list logic: Reverse to show latest first, then search, then paginate.
  const filteredPlayers = useMemo(() => {
    let list = [...players].reverse();
    if (searchQuery) list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (roleFilter !== 'all') list = list.filter((player) => player.role === roleFilter);
    if (statusFilter !== 'all') list = list.filter((player) => normalizeBoolean(player.is_active) === (statusFilter === 'active'));
    return list;
  }, [players, searchQuery, roleFilter, statusFilter]);

  const paginatedPlayers = filteredPlayers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <motion.div className="admin-panel-section" {...panelMotionProps}>
      {status.message && <div className={`admin-status ${status.type}`}><span>{status.message}</span></div>}
      <div className="admin-header-row">
        <h2>Manage Players</h2>
        <div className="admin-filter-row">
          <input
            type="text"
            className="admin-search"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
          <select className="admin-filter-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">All roles</option>
            <option value="Batters">Batters</option>
            <option value="All-Rounders">All-Rounders</option>
            <option value="Bowlers">Bowlers</option>
            <option value="Wicket Keepers">Wicket Keepers</option>
          </select>
          <select className="admin-filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <motion.div className="admin-card" whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Image</th><th>Name</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {paginatedPlayers.length === 0 && <tr><td colSpan="6">No players found.</td></tr>}
            {paginatedPlayers.map((p, idx) => (
              <tr key={p.id || idx}>
                <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                <td>
                  {(p.player_image_url || p.photo_image_url || p.cover_image_url) ? (
                    <img src={p.player_image_url || p.photo_image_url || p.cover_image_url} alt="player" className="admin-table-thumb" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                  ) : (
                    <span className="admin-empty-thumb">No image</span>
                  )}
                </td>
                <td>{p.name}</td>
                <td>{p.role}</td>
                <td>
                  <span className={`admin-badge ${normalizeBoolean(p.is_active) ? 'active' : 'inactive'}`}>
                    {normalizeBoolean(p.is_active) ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button className={`toggle-btn view-btn ${normalizeBoolean(p.is_active) ? '' : 'reject'}`} onClick={() => toggleActive(p)} title={normalizeBoolean(p.is_active) ? 'Deactivate' : 'Activate'}>{normalizeBoolean(p.is_active) ? <FaEye /> : <FaEyeSlash />}</button>
                    <button className="edit-btn" onClick={() => openEditModal(p)} title="Edit"><FaEdit /></button>
                    <button className="del-btn" onClick={() => handleDelete(p.id)} title="Delete"><FaTrash /></button>
                  </div>
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
      </motion.div>

      <button className="floating-add-btn" onClick={openAddModal}>+</button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Edit Player' : 'Add New Player'}>
        {status.message && <div className={`admin-status ${status.type}`}><span>{status.message}</span></div>}
        <form onSubmit={handleSubmit} className="admin-form">
          <input placeholder="Player Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="Batters">Batters</option>
            <option value="All-Rounders">All-Rounders</option>
            <option value="Bowlers">Bowlers</option>
            <option value="Wicket Keepers">Wicket Keepers</option>
          </select>
          <div className="admin-form-files">
            <label>Cover Image: {isEditing && "(Leave blank to keep existing)"}</label>
            <input type="file" accept="image/*" onChange={e => setForm({ ...form, cover: e.target.files[0] })} />
            <label>Profile Cutout Image: {isEditing && "(Leave blank to keep existing)"}</label>
            <input type="file" accept="image/*" onChange={e => setForm({ ...form, photo: e.target.files[0] })} />
          </div>
          <label className="admin-checkbox">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
            Active Player
          </label>
          <button type="submit" className="save-btn">{isEditing ? 'Save Changes' : 'Add Player'}</button>
        </form>
      </Modal>
    </motion.div>
  );
};

const ManageGallery = () => {
  const [images, setImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => setStatus({ type: '', message: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const fetchGallery = () => {
    fetchWithFallback('/api/gallery?includeInactive=1')
      .then(res => res.json())
      .then(data => setImages(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchGallery(); }, []);
  const totalImages = images.length;
  const mediaLinkedCount = images.filter(img => normalizeBoolean(img.is_media_linked)).length;

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setStatus({ type: 'info', message: 'Uploading image to storage...' });
    const token = localStorage.getItem('adminToken');

    try {
      const image_url = await uploadImage(file);
      setStatus({ type: 'info', message: 'Saving gallery record...' });

      const res = await fetchWithFallback('/api/gallery', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image_url, name: file.name, is_active: true, is_media_linked: false })
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

  const handleMediaToggle = (img) => {
    const isCurrentlyLinked = normalizeBoolean(img.is_media_linked);
    if (!isCurrentlyLinked && mediaLinkedCount >= 5) {
      alert('You have reached the maximum of 5 images for the Media section display. Please unlink another image first.');
      return;
    }
    updateGalleryImage(img.id, { is_media_linked: !isCurrentlyLinked });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    const token = localStorage.getItem('adminToken');
    await fetchWithFallback(`/api/gallery?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchGallery();
  };

  const updateGalleryImage = async (id, updates) => {
    const token = localStorage.getItem('adminToken');
    await fetchWithFallback('/api/gallery', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, ...updates })
    });
    fetchGallery();
  };

  const sortedImages = useMemo(() => [...images].reverse(), [images]);
  const paginatedImages = sortedImages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <motion.div className="admin-panel-section" {...panelMotionProps}>
      {status.message && (
        <div className={`admin-status ${status.type}`}>
          <span>{status.message}</span>
        </div>
      )}
      <div className="admin-header-row">
        <h2>Manage Gallery</h2>
        <div className="admin-gallery-meta">{totalImages} uploads | {mediaLinkedCount}/5 media</div>
      </div>

      <motion.div className="admin-gallery-grid" variants={gridStagger} initial="hidden" animate="visible">
        {paginatedImages.map(img => (
          <motion.div key={img.id} className="admin-gallery-item" variants={gridItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <div className="admin-gallery-state-row">
              <span className={`admin-badge ${(img.is_media_linked ? 'media' : (normalizeBoolean(img.is_active) ? 'active' : 'inactive'))}`}>
                {img.is_media_linked ? 'Media-linked' : (normalizeBoolean(img.is_active) ? 'Active' : 'Inactive')}
              </span>
            </div>
            <img src={img.image_url} alt="gallery" className="admin-gallery-image" />
            <div className="admin-gallery-actions">
              <motion.button whileTap={{ scale: 0.94 }} title="Toggle Visibility" className={`toggle-btn view-btn ${normalizeBoolean(img.is_active) ? 'active' : ''}`} onClick={() => updateGalleryImage(img.id, { is_active: !normalizeBoolean(img.is_active) })}>
                {normalizeBoolean(img.is_active) ? <FaEye /> : <FaEyeSlash />}
              </motion.button>
              <motion.button whileTap={{ scale: 0.94 }} title="Toggle Media Link" className={`edit-btn media-toggle-btn ${normalizeBoolean(img.is_media_linked) ? 'active' : ''}`} onClick={() => handleMediaToggle(img)}>
                {normalizeBoolean(img.is_media_linked) ? <FaLink /> : <FaUnlink />}
              </motion.button>
              <motion.button whileTap={{ scale: 0.94 }} title="Delete Image" className="del-btn" onClick={() => handleDelete(img.id)}>
                <FaTrash />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div style={{ marginTop: '2rem' }}>
        <Pagination
          currentPage={currentPage}
          totalItems={images.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="floating-add-btn" onClick={() => { setStatus({ type: '', message: '' }); setFile(null); setIsModalOpen(true); }}>+</motion.button>

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
    </motion.div>
  );
};

const ManageAchievements = () => {
  const [slots, setSlots] = useState(
    ACHIEVEMENT_SLOTS.map((slot) => ({
      ...slot,
      id: null,
      image_url: slot.fallbackImage,
      is_active: true,
    }))
  );
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => setStatus({ type: '', message: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const fetchAchievements = () => {
    fetchWithFallback('/api/gallery?category=achievements&includeInactive=1')
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data) ? data : [];
        const nextSlots = ACHIEVEMENT_SLOTS.map((slot) => {
          const match = rows.find((row) => String(row?.name || '').toLowerCase() === slot.name);
          return {
            ...slot,
            id: match?.id || null,
            image_url: match?.image_url || slot.fallbackImage,
            is_active: normalizeBoolean(match?.is_active),
          };
        });
        setSlots(nextSlots);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => { fetchAchievements(); }, []);

  const saveAchievementImage = async (slot, file) => {
    if (!file) return;

    const token = localStorage.getItem('adminToken');
    try {
      setStatus({ type: 'info', message: `Uploading ${slot.label.toLowerCase()}...` });
      const image_url = await uploadImage(file);
      const existingSlot = slots.find((item) => item.name === slot.name);

      const payload = {
        image_url,
        name: slot.name,
        category: 'achievements',
        is_active: true,
        is_media_linked: false,
      };

      const response = await fetchWithFallback('/api/gallery', {
        method: existingSlot?.id ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(existingSlot?.id ? { id: existingSlot.id, ...payload } : payload),
      });

      if (!response.ok) {
        const payloadData = await response.json().catch(() => ({}));
        throw new Error(payloadData.error || payloadData.message || 'Failed to save achievement image.');
      }

      setStatus({ type: 'success', message: `${slot.label} updated successfully.` });
      fetchAchievements();
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to update achievement image.' });
    }
  };

  return (
    <motion.div className="admin-panel-section" {...panelMotionProps}>
      {status.message && (
        <div className={`admin-status ${status.type}`}>
          <span>{status.message}</span>
        </div>
      )}
      <div className="admin-header-row">
        <h2>Manage Achievements</h2>
      </div>

      <motion.div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px',
        }}
        variants={gridStagger}
        initial="hidden"
        animate="visible"
      >
        {slots.map((slot) => (
          <motion.div key={slot.name} className="admin-card" style={{ marginBottom: 0 }} variants={gridItem} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <h3 style={{ marginBottom: '16px' }}>{slot.label}</h3>
            <img
              src={slot.image_url}
              alt={slot.label}
              style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '12px', marginBottom: '14px', background: '#f8fafc' }}
            />
            <div className="admin-upload-block">
              <label className="admin-upload-title" htmlFor={`achievement-upload-${slot.name}`}>
                Replace Photo
              </label>
              <input
                id={`achievement-upload-${slot.name}`}
                className="admin-upload-input"
                type="file"
                accept="image/*"
                onChange={(event) => saveAchievementImage(slot, event.target.files?.[0])}
              />
              <label htmlFor={`achievement-upload-${slot.name}`} className="admin-upload-trigger">
                Choose File
              </label>
              <p className="admin-upload-hint">Upload a clean image for this slot</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

const ManageLeads = () => {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    refreshLeads();
  }, []);

  const sortedLeads = useMemo(() => [...leads].reverse(), [leads]);
  const newLeads = useMemo(() => sortedLeads.filter((lead) => normalizeLeadStatus(lead) === 'new'), [sortedLeads]);
  const processedLeads = useMemo(
    () => sortedLeads.filter((lead) => {
      const leadStatus = normalizeLeadStatus(lead);
      return leadStatus === 'accepted' || leadStatus === 'rejected';
    }),
    [sortedLeads]
  );

  const refreshLeads = () => {
    const token = localStorage.getItem('adminToken');
    fetchWithFallback('/api/admin/leads', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setLeads(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  const updateLead = async (id, updates) => {
    const token = localStorage.getItem('adminToken');
    await fetchWithFallback('/api/admin/leads', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, ...updates })
    });
    refreshLeads();
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    const token = localStorage.getItem('adminToken');
    await fetchWithFallback(`/api/admin/leads?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    refreshLeads();
  };

  const setLeadStatus = async (lead, nextStatus) => {
    await updateLead(lead.id, { status: nextStatus });
  };

  const renderLeadRows = (rows, mode = 'new') => (
    rows.length === 0 ? <tr><td colSpan="7">No leads found.</td></tr> : rows.map((lead, index) => (
      <tr key={lead.id}>
        <td>{index + 1}</td>
        <td>{formatLeadDate(lead.created_at)}</td>
        <td>
          <div className="admin-name-cell">
            <span>{lead.name}</span>
            <small className="admin-name-email">{lead.email}</small>
          </div>
        </td>
        <td>{lead.source || 'website'}</td>
        <td><span className={`admin-badge ${normalizeLeadStatus(lead)}`}>{normalizeLeadStatus(lead)}</span></td>
        <td className="admin-table-message">{lead.message}</td>
        <td>
          <div className="admin-row-actions">
            {mode === 'new' ? (
              <>
                <button className="toggle-btn view-btn" onClick={() => setLeadStatus(lead, 'accepted')} title="Accept" aria-label="Accept lead">
                  <FaCheck />
                </button>
                <button className="toggle-btn view-btn reject" onClick={() => setLeadStatus(lead, 'rejected')} title="Reject" aria-label="Reject lead">
                  <FaTimes />
                </button>
              </>
            ) : null}
            <button className="del-btn" onClick={() => deleteLead(lead.id)} title="Delete" aria-label="Delete lead">
              <FaTrash />
            </button>
          </div>
        </td>
      </tr>
    ))
  );

  return (
    <motion.div className="admin-panel-section" {...panelMotionProps}>
      <h2>Contact Form Leads</h2>
      <motion.div className="lead-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <h3>New Leads</h3>
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>No.</th><th>Date</th><th>Name</th><th>Source</th><th>Status</th><th>Message</th><th>Actions</th></tr></thead>
            <tbody>
              {renderLeadRows(newLeads, 'new')}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div className="lead-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
        <h3>Processed Leads</h3>

        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>No.</th><th>Date</th><th>Name</th><th>Source</th><th>Status</th><th>Message</th><th>Actions</th></tr></thead>
            <tbody>
              {renderLeadRows(processedLeads, 'final')}
            </tbody>
          </table>
        </div>
      </motion.div>

    </motion.div>
  );
};

const ManageViews = () => {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    setError('');

    fetchWithFallback('/api/admin/views', {headers: {'Authorization': `Bearer ${token}` }})
      .then(async (res) => {
        const payload = await res.json().catch(() => ({ }));
        if (!res.ok) {
          throw new Error(payload.error || payload.message || 'Failed to load page views.');
        }
        setViews(Array.isArray(payload) ? payload : []);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to load page views.');
        setViews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div className="admin-panel-section" {...panelMotionProps}>
      <h2>Page Views Analytics</h2>
      <motion.div className="admin-card" whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
        {loading && <div className="admin-status">Loading page views...</div>}
        {error && !loading && <div className="admin-status error">{error}</div>}
        <table className="admin-table">
          <thead><tr><th>Page Route</th><th>Total Views</th></tr></thead>
          <tbody>
            {!loading && !error && views.length === 0 ? <tr><td colSpan="2">No analytics found.</td></tr> : views.map(v => (
              <tr key={v.id}>
                <td>{v.page_name}</td>
                <td>{v.view_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
