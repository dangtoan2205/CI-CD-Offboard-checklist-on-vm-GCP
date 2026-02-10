const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db/config');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

router.use(requireAdmin);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, name, role, active, created_at, updated_at
       FROM admin_users
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { email, name, password, role = 'admin', active = true } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO admin_users (email, name, role, active, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, active, created_at, updated_at`,
      [email, name || null, role, active, passwordHash]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    const allowed = ['email', 'name', 'role', 'active'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (req.body.password) {
      updates.password_hash = await bcrypt.hash(req.body.password, 10);
    }

    if (Number(id) === req.session.user.id) {
      if (updates.role && updates.role !== 'admin') {
        return res.status(400).json({ error: 'Cannot change your own role' });
      }
      if (updates.active === false) {
        return res.status(400).json({ error: 'Cannot deactivate your own account' });
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.updated_at = new Date();
    const setClause = Object.keys(updates)
      .map((key, idx) => `${key} = $${idx + 1}`)
      .join(', ');
    const values = Object.values(updates);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE admin_users SET ${setClause} WHERE id = $${values.length}
       RETURNING id, email, name, role, active, created_at, updated_at`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (Number(id) === req.session.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    const { rowCount } = await pool.query('DELETE FROM admin_users WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
