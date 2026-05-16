const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const db      = require('../db/database');

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields are required.' });

    if (username.length < 3 || username.length > 30)
      return res.status(400).json({ error: 'Username must be 3–30 characters.' });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Invalid email address.' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existing = db
      .prepare('SELECT id FROM users WHERE username = ? OR email = ?')
      .get(username.trim(), email.trim().toLowerCase());

    if (existing)
      return res.status(409).json({ error: 'Username or email already in use.' });

    const hash = await bcrypt.hash(password, 12);
    const info = db
      .prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
      .run(username.trim(), email.trim().toLowerCase(), hash);

    req.session.userId   = info.lastInsertRowid;
    req.session.username = username.trim();

    return res.status(201).json({ success: true, username: username.trim() });
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required.' });

    const user = db
      .prepare('SELECT * FROM users WHERE username = ? OR email = ?')
      .get(username.trim(), username.trim().toLowerCase());

    if (!user)
      return res.status(401).json({ error: 'Invalid username/email or password.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ error: 'Invalid username/email or password.' });

    req.session.userId   = user.id;
    req.session.username = user.username;

    return res.json({ success: true, username: user.username });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed.' });
    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', (req, res) => {
  if (req.session.userId) {
    return res.json({
      loggedIn:  true,
      username:  req.session.username,
      userId:    req.session.userId
    });
  }
  return res.json({ loggedIn: false });
});

module.exports = router;
