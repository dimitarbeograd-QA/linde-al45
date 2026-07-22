# Архитектура — Linde AL45

## Общ преглед
Приложението е реализирано като единичен `index.html` файл, съдържащ inline
`<style>` и `<script>` — типично за бърза, self-contained схема без build
pipeline. Няма backend компонент, видим в repo-то — данните за частите
изглежда се управляват client-side (виж inline скриптовете в `index.html`).

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
  `tech` — `editor` и `viewer` акаунти се създават през Users панела.
- По подразбиране (при празна база) съществува само един seed акаунт:
  `admin` / `admin123` (виж `ensureDefaultUsers()`).

## Препоръки за бъдещо развитие
- Ако логиката расте, обмисли разделяне на `index.html` на отделни JS модули
  (напр. `zoom.js`, `search.js`, `admin.js`) за по-лесна поддръжка.
- Обмисли извеждане на данните за частите в отделен JSON файл/API вместо
  вградени в скрипта, ако наборът от части продължи да расте.
