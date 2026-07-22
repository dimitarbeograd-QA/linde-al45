# Архитектура — Linde AL45

## Общ преглед
Приложението е реализирано като единичен `index.html` файл, съдържащ inline
`<style>` и `<script>` — типично за бърза, self-contained схема без build
pipeline. От версията с `server/` насам има и минимален реален backend
(Express + SQLite) — виж [`## Backend`](#backend) по-долу. Данните за
частите/поръчките/схемите продължават да се управляват изцяло client-side
(localStorage, виж inline скриптовете в `index.html`) — това е умишлено
извън обхвата на backend-а засега (виж бележката в края на секцията).

## Backend
`server/` съдържа Express + SQLite (`better-sqlite3`) сървър, чиято ЕДИНСТВЕНА
отговорност е реалната автентикация:

| Endpoint | Отговорност |
|---|---|
| `POST /api/login` | `{username, password}` → bcrypt сравнение спрямо `users` таблицата → при успех `req.session.user = {id, username, name, role}` (httpOnly cookie), при неуспех 401 |
| `POST /api/logout` | Унищожава сървърната сесия |
| `GET /api/session` | `{user: null}` или `{user: {...}}` — единственият източник на истина за "кой е логнат и с каква роля" |
| `GET /api/users` | Списък потребители (id/username/name/role) — само за `role==='admin'`, гейтнато server-side (`requireAdmin`) |
| `POST /api/test/reset` | Само когато `NODE_ENV=test` — връща SQLite-то (in-memory в test режим) към default seed, използвано от Playwright тестовете |
| `GET /` | Сервира `index.html` статично (`res.sendFile`, без SSR инжекция) |

Ролята на логнатия потребител вече **не** може да бъде зададена от клиента по
никакъв начин — тя се чете единствено от `req.session.user.role`, записана
server-side веднага след успешна bcrypt проверка. Сесията е httpOnly cookie
(`linde.sid`), недостъпна за клиентски JS.

`index.html` вече не пази сесията сам — `AuthDB.getSession()/setSession()`
(старите client-writable `sessionStorage`/`localStorage` четци/писачи) са
премахнати изцяло. `initAuth()` вика `GET /api/session`, `doLogin()`/
`quickLogin()` викат `POST /api/login`, `doLogout()` вика `POST /api/logout`.

**Извън обхвата на тази backend миграция (умишлено, Phase 1):** частите,
поръчките, схемите и audit log-а продължават да живеят изцяло client-side
(localStorage: `lindePartsDB`, `lp_audit`, и т.н.) — това включва и Users
панела (`AuthDB.getUsers()/saveUsers()` — все още localStorage, само
cosmetic списък за UI, несвързан с реалните server-side акаунти). С други
думи: ако добавиш нов потребител през Users панела, той **няма** да може
реално да се логне (сървърът не знае за него) — само четиримата seed-нати
акаунта (виж по-долу) имат реални пароли.

## Основни UI компоненти
| Компонент | Отговорност |
|---|---|
| Header (`userBadge`, `btnNotif`, `btnChat`, `btnOrders`, `btnHamburger`) | Потребителски статус, известия, чат, поръчки, главно меню |
| `zoomStage` | Контейнер за диаграмата с zoom/pan логика |
| `zoom-controls` (`btnZoomIn/Out/Fit/Debug/DragMode/Magnifier/Print`) | Контроли за навигация в диаграмата |
| `parts-bar` + `searchInput` | Търсене/филтриране на части |
| `full-card` popup | Детайлна информация за избрана част |
| `magnifier-overlay` | Независим zoom preview |
| `schemes-overlay` | Панел за превключване между различни схеми |
| Admin панели (Dashboard, Audit, Users) | Роля-базирани административни функции |

## Роли
Реалната ролева система (виж `applyUserUI()` в `index.html`) има 4 роли,
не 2 — всяка се управлява поотделно чрез `show(id, role === ...)` проверки:

| Роля | Икона | Notif/Audit/New order | Users панел | Orders/Scan | Schemes | Edit/Drag/Debug | При логин отваря |
|---|---|---|---|---|---|---|---|
| **admin** | 👑 | ✅ | ✅ | ✅ | ✅ | ✅ | Dashboard |
| **editor** | ✏️ | ✅ | ❌ | ✅ | ✅ | ✅ | Dashboard |
| **tech** | 🔧 | ❌ | ❌ | ✅ | ❌ | ❌ | Orders панел |
| **viewer** | 👁 | ❌ | ❌ | ❌ | ✅ | ❌ | — |

Бележки:
- Само `admin` вижда/ползва Users панела (`btnUsers`).
- `tech` и `viewer` имат отделен бърз изход бутон (`btnQuickLogout`,
  `ordPanelLogoutBtn`), защото нямат лесен достъп до профилното меню.
- На login екрана има бърз тестов вход (`quickLogin`) само за `admin` и
  `tech` — вече минава през СЪЩИЯ реален `POST /api/login` като ръчния
  вход, просто предварително попълва демо credentials-ите (виж `## Backend`).
- Реалните акаунти (bcrypt хеширани пароли, seed-нати server-side в
  `server/db.js`, виж `## Backend`):

  | Username | Парола | Роля |
  |---|---|---|
  | `admin` | `admin123` | admin |
  | `editor1` | `editor123` | editor |
  | `tech` | `tech123` | tech |
  | `viewer1` | `viewer123` | viewer |

  Смени тези демо пароли преди реален deploy извън локална/демо среда.

## Препоръки за бъдещо развитие
- Ако логиката расте, обмисли разделяне на `index.html` на отделни JS модули
  (напр. `zoom.js`, `search.js`, `admin.js`) за по-лесна поддръжка.
- Обмисли извеждане на данните за частите в отделен JSON файл/API вместо
  вградени в скрипта, ако наборът от части продължи да расте.
