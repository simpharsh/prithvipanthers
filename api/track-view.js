import { adminSupabase, isAdminDbConnected } from './_utils/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { page } = req.body;
  if (!page || !isAdminDbConnected) return res.status(200).send('OK');

  try {
    const { data } = await adminSupabase
      .from('page_views')
      .select('view_count')
      .eq('page_name', page)
      .single();

    if (data) {
      await adminSupabase
        .from('page_views')
        .update({ view_count: data.view_count + 1 })
        .eq('page_name', page);
    } else {
      await adminSupabase
        .from('page_views')
        .insert([{ page_name: page, view_count: 1 }]);
    }
  } catch (error) {
    console.error('Failed to track view:', error);
  }

  return res.status(200).send('OK');
}
