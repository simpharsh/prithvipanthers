const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

let isDbConnected = false;

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.REACT_APP_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

if (!supabase) {
  console.warn('Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY (or service role key).');
} else {
  isDbConnected = true;
  console.log('Supabase client configured successfully.');
}

// A simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.get('/api/home', (req, res) => {
  res.json({
    page: 'home',
    message: 'Home page content endpoint ready.',
    dbConnected: isDbConnected
  });
});

app.get('/api/about', (req, res) => {
  res.json({
    page: 'about',
    message: 'About page content endpoint ready.',
    dbConnected: isDbConnected
  });
});

app.get('/api/player', (req, res) => {
  res.json({
    page: 'player',
    message: 'Player page content endpoint ready.',
    dbConnected: isDbConnected
  });
});

app.get('/api/gallery', (req, res) => {
  res.json({
    page: 'gallery',
    message: 'Gallery page content endpoint ready.',
    dbConnected: isDbConnected
  });
});

app.get('/api/contact', (req, res) => {
  res.json({
    page: 'contact',
    message: 'Contact page content endpoint ready.',
    dbConnected: isDbConnected
  });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required.' });
  }

  if (!isDbConnected) {
    return res.status(503).json({
      message: 'Database is not configured. Please check Supabase environment variables.'
    });
  }

  const { error } = await supabase
    .from('contact_form_submissions')
    .insert([
      {
        full_name: name,
        email,
        phone,
        message,
      },
    ]);

  if (error) {
    return res.status(500).json({ message: 'Failed to save contact message.', error: error.message });
  }

  return res.status(201).json({ message: 'Message sent successfully.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});