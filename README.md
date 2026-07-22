# Linde AL45 — Интерактивна схема с части

Едностраничено уеб приложение (`index.html`), показващо интерактивна
zoom/pan схема с части за мотокар Linde AL45. Позволява търсене на части по
номер/описание, преглед на детайли през popup карта, лупа за прецизен преглед,
управление на поръчки и admin функционалности (dashboard, audit log, users).

## Функционалности
- Zoom / pan / drag на диаграмата, вкл. pinch-to-zoom на touch устройства
- Търсене и филтриране на части
- Лупа (magnifier) с независим zoom контрол
- Попъп карта с детайли за всяка част (инфо/редакция)
- Схеми панел, нова поръчка, скенер, печат на пакети/поръчки
- Admin панели: Dashboard, Audit log, Users (само за оторизирани потребители)

## Стартиране
От версията с `server/` насам приложението има реален backend (Express +
SQLite) — виж [`ARCHITECTURE.md`](ARCHITECTURE.md#backend) за защо (login
вече не е client-side).

**Пълно приложение (реален login работи):**
```
cd server
npm install
cp .env.example .env   # по желание — SESSION_SECRET/PORT
npm start
```
Отвори `http://localhost:3002`. Демо акаунти (виж `ARCHITECTURE.md#роли`):
`admin`/`admin123`, `editor1`/`editor123`, `tech`/`tech123`, `viewer1`/`viewer123`.

**Само статичен preview (`npx serve .`):** зарежда login екрана, но реален
вход не работи без backend-а — `/api/login`/`/api/session` няма да
отговорят. Ползвай само за бърз преглед на статичния markup/CSS, не за
реално разглеждане на диаграмата.

## Структура
Виж [`ARCHITECTURE.md`](ARCHITECTURE.md) за преглед на структурата на кода.

## QA / Тестване
Виж [`qa-docs/`](qa-docs/) за test plan и ръчни тест кейсове.

Автоматизирани E2E тестове (Playwright) в [`tests/`](tests/) покриват login/роли,
zoom/pan, търсене, popup картата и схеми панела:
```
npm install
npx playwright install chromium
npm test
```

## Принос
Виж [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Сигурност
Виж [`SECURITY.md`](SECURITY.md).
