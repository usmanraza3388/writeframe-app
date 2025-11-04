const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// ✅ 1. Simple test route
router.get('/test', (req, res) => {
  res.json({ ok: true, message: 'Backend server is running!' });
});

// ✅ 2. Database connection test route
router.get('/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('test_table')
      .select('*')
      .limit(1);

    if (error) return res.status(500).json({ ok: false, error: error.message });

    res.json({
      ok: true,
      message: 'Connected to Supabase and able to query test_table!',
      sample: data,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ✅ 3. Insert test
router.post('/test-insert', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('test_table')
      .insert([{ created_at: new Date().toISOString() }])
      .select();

    if (error) return res.status(500).json({ ok: false, error: error.message });

    res.json({
      ok: true,
      message: 'Inserted test row successfully!',
      inserted: data,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ✅ 4. Select test
router.get('/test-select', async (req, res) => {
  try {
    const { data, error } = await supabase.from('test_table').select('*');

    if (error) return res.status(500).json({ ok: false, error: error.message });

    res.json({
      ok: true,
      message: 'Fetched rows successfully!',
      rows: data,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ✅ 5. Delete test
router.delete('/test-delete/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const { data, error } = await supabase
      .from('test_table')
      .delete()
      .eq('id', id)
      .select(); // returns deleted row

    if (error) throw error;

    res.json({
      ok: true,
      message: `Row with id=${id} deleted successfully`,
      deleted: data,
    });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ✅ 6. Update test
router.put('/test-update/:id', async (req, res) => {
  try {
    const id = Number(req.params.id); // ensure numeric
    const { created_at } = req.body;

    const { data, error } = await supabase
      .from('test_table')
      .update({ created_at })
      .eq('id', id)
      .select(); // ✅ THIS is required to get the updated row

    if (error) throw error;

    res.json({
      ok: true,
      message: `Row with id=${id} updated successfully`,
      data,
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;