require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists before DB and session store initialise
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const SQLiteStore = require('connect-sqlite3')(session);
const db = require('./src/db/database');          // initialises schema on first run

const app = express();
app.set('trust proxy', 1);  // Railway / Heroku run behind HTTPS reverse proxy

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: dataDir }),
  secret: process.env.SESSION_SECRET || 'dijkstra-quest-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',   require('./src/routes/auth'));
app.use('/api/game',   require('./src/routes/game'));
app.use('/api/scores', require('./src/routes/scores'));

// Health-check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  Dijkstra Quest running → http://localhost:${PORT}\n`);
});
