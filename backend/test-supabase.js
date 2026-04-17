const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Key configured:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    // Test players table
    console.log('\n=== Testing players table ===');
    const { data: players, error: playersError } = await supabase.from('players').select('*').limit(1);
    if (playersError) {
      console.error('ERROR:', playersError);
    } else {
      console.log('SUCCESS - Players table exists. Records:', players?.length || 0);
    }

    // Test gallery table
    console.log('\n=== Testing gallery table ===');
    const { data: gallery, error: galleryError } = await supabase.from('gallery').select('*').limit(1);
    if (galleryError) {
      console.error('ERROR:', galleryError);
    } else {
      console.log('SUCCESS - Gallery table exists. Records:', gallery?.length || 0);
    }

    // Try to insert test data
    console.log('\n=== Testing insert into players ===');
    const { data: insertData, error: insertError } = await supabase.from('players').insert([
      { name: 'Test Player', role: 'Batters', cover_image_url: '/uploads/test.jpg', photo_image_url: '/uploads/test.jpg' }
    ]).select();
    
    if (insertError) {
      console.error('INSERT ERROR:', insertError);
    } else {
      console.log('INSERT SUCCESS:', insertData);
    }

  } catch (err) {
    console.error('Exception:', err);
  }

  process.exit(0);
}

test();
