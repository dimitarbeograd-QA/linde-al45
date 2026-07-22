const Database = require('better-sqlite3');
const path = require('node:path');
const bcrypt = require('bcryptjs');

// NODE_ENV=test → in-memory база, свежа при всяко стартиране на сървъра
// (playwright.config.js я използва за webServer-а, за да не изтича реален
// потребителски state между тестови run-ове).
const db = new Database(
  process.env.NODE_ENV === 'test' ? ':memory:' : path.join(__dirname, 'data.db')
);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','editor','tech','viewer'))
  );
`);

// Демо акаунти — огледални на старите client-side default/quick-login
// потребители от index.html (ensureDefaultUsers()/quickLogin()) и
// tests/helpers.js (SEED_USERS), за да не се чупи нищо съществуващо.
// Паролите тук са само демо стойности — смени ги преди реален deploy.
const SEED_USERS = [
  { username: 'admin',   password: 'admin123',  name: 'Администратор',      role: 'admin' },
  { username: 'editor1', password: 'editor123', name: 'Редактор',           role: 'editor' },
  { username: 'tech',    password: 'tech123',    name: 'Сервизен техник',    role: 'tech' },
  { username: 'viewer1', password: 'viewer123',  name: 'Наблюдател',        role: 'viewer' },
];

function seedDefaults() {
  db.prepare('DELETE FROM users').run();
  const insert = db.prepare(
    'INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)'
  );
  for (const u of SEED_USERS) {
    insert.run(u.username, bcrypt.hashSync(u.password, 10), u.name, u.role);
  }
}

// Seed default акаунти при първо стартиране (production db.data all е празна).
const existing = db.prepare('SELECT id FROM users LIMIT 1').get();
if (!existing) seedDefaults();

module.exports = db;
module.exports.seedDefaults = seedDefaults;
