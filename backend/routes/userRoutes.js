// src/routes/userRoutes.js
const express = require('express');
const supabase = require('../supabaseClient');

const router = express.Router();

// GET user profile by id (with stats, tab content, echoes count)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, bio, genre_persona, expression, email, created_at')
      .eq('id', id)
      .single();

    if (profileError) return res.status(400).json({ error: profileError.message });
    if (!profile) return res.status(404).json({ error: 'User not found' });

    // Fetch counts for stats & tab content
    const [
      { count: scenesCount, data: scenesData },
      { count: charactersCount, data: charactersData },
      { count: monologuesCount, data: monologuesData },
      { count: framesCount, data: framesData },
      { count: echoesCount }
    ] = await Promise.all([
      supabase.from('scenes').select('*', { count: 'exact' }).eq('user_id', id),
      supabase.from('characters').select('*', { count: 'exact' }).eq('user_id', id),
      supabase.from('monologues').select('*', { count: 'exact' }).eq('user_id', id),
      supabase.from('frames').select('*', { count: 'exact' }).eq('user_id', id),
      supabase.from('user_echoes').select('*', { count: 'exact' }).eq('to_user_id', id)
    ]);

    res.json({
      ...profile,
      stats: {
        scenes: scenesCount || 0,
        characters: charactersCount || 0,
        monologues: monologuesCount || 0,
        frames: framesCount || 0,
        echoes: echoesCount || 0,
        remakes: 0,
      },
      tabsContent: {
        scenes: scenesData || [],
        characters: charactersData || [],
        monologues: monologuesData || [],
        frames: framesData || [],
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update user profile
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, bio, avatar_url, genre_persona, expression } = req.body;

  if (!full_name && !bio && !avatar_url && !genre_persona && !expression)
    return res.status(400).json({ error: 'No fields provided for update' });

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name, bio, avatar_url, genre_persona, expression })
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /users/:id/echo → add Echo
router.post('/:id/echo', async (req, res) => {
  const { id } = req.params; // target user
  const { from_user_id } = req.body;

  if (!from_user_id) return res.status(400).json({ error: 'from_user_id is required' });
  if (from_user_id === id) return res.status(400).json({ error: 'Cannot echo yourself' });

  try {
    const { data: existing } = await supabase
      .from('user_echoes')
      .select('*')
      .eq('from_user_id', from_user_id)
      .eq('to_user_id', id)
      .single();

    if (existing) return res.status(400).json({ error: 'Already echoed' });

    await supabase.from('user_echoes').insert([{ from_user_id, to_user_id: id }]);

    const { count: echoesCount } = await supabase
      .from('user_echoes')
      .select('*', { count: 'exact' })
      .eq('to_user_id', id);

    res.json({ success: true, echoes: echoesCount || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET echoes for a user (to check if current user has echoed)
router.get('/echoes/:to_user_id', async (req, res) => {
  const { to_user_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('user_echoes')
      .select('*')
      .eq('to_user_id', to_user_id);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST whisper (optional)
router.post('/:id/whisper', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  res.json({ success: true, message: `Your whisper to ${id} was sent: "${message}"` });
});

module.exports = router;
