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
- **Guest/User** — преглед, търсене, поръчки.
- **Admin/Owner** — пълен достъп до dashboard, audit log и users панел.

## Препоръки за бъдещо развитие
- Ако логиката расте, обмисли разделяне на `index.html` на отделни JS модули
  (напр. `zoom.js`, `search.js`, `admin.js`) за по-лесна поддръжка.
- Обмисли извеждане на данните за частите в отделен JSON файл/API вместо
  вградени в скрипта, ако наборът от части продължи да расте.
