require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('node:path');
const db = require('./db');

const INDEX_PATH = path.join(__dirname, '..', 'index.html');

const app = express();
app.disable('x-powered-by');
app.use(express.json());

app.use(session({
  name: 'linde.sid',
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 3600 * 1000,
  },
}));

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Само за тестове (NODE_ENV=test) — връща DB-то към default seed state,
// за да са тестовете независими от изпълнението на предишни тестове.
if (process.env.NODE_ENV === 'test') {
  app.post('/api/test/reset', (req, res) => {
    db.seedDefaults();
    req.session.destroy(() => res.json({ ok: true }));
  });
}

// ── AUTH ──
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Въведете потребителско име и парола.' });
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: 'Грешно потребителско име или парола' });
  }
  const user = { id: row.id, username: row.username, name: row.name, role: row.role };
  req.session.user = user;
  res.json({ user });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/session', (req, res) => {
  res.json({ user: req.session.user || null });
});

// Списък на потребителите — само admin (role идва изцяло от server session,
// клиентът не може да си сложи role сам, виж requireAdmin по-горе).
app.get('/api/users', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT id, username, name, role FROM users').all();
  res.json({ users: rows });
});

// ── Статичен index.html (self-contained, без build стъпка) ──
app.get('/', (_req, res) => {
  res.sendFile(INDEX_PATH);
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`linde-al45 server listening on http://localhost:${PORT}`);
});
