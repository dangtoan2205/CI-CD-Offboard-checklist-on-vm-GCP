const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db/config');

const router = express.Router();

function buildUserPayload(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
  };
}

router.get('/me', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.json({ user: null });
  }
  return res.json({ user: req.session.user });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { rows } = await pool.query(
      'SELECT id, email, name, role, password_hash, active FROM admin_users WHERE email = $1',
      [email]
    );
    const user = rows[0];
    if (!user || !user.active || user.role !== 'admin') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = buildUserPayload(user);
    req.session.user = payload;
    return res.json({ user: payload });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/logout', (req, res) => {
  if (!req.session) return res.json({ ok: true });
  req.session.destroy(() => {
    res.clearCookie('offboard.sid');
    res.json({ ok: true });
  });
});

module.exports = router;
