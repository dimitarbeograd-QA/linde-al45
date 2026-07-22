# Changelog

Всички забележими промени в проекта се документират в този файл.
Форматът следва приблизително [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]
### Fixed
- `initAuth()` не викаше `hideLoginOverlay()`, когато вече съществува валидна
  сесия — при презареждане на страницата докато си логнат, login overlay-ят
  оставаше видим и блокираше цялото UI (badge-ът/данните се обновяваха
  отдолу, но нищо не беше кликаемо). Открито от Playwright тестовете
  (`tests/`), които seed-ват сесия преди navigation, точно както при реално
  презареждане с активна сесия.
- `ARCHITECTURE.md`, `SECURITY.md` и `qa-docs/` описваха погрешен модел с 2
  роли (Guest/Admin). Реалният код (`applyUserUI()` в `index.html`) има 4
  роли — `admin`, `editor`, `tech`, `viewer` — с различни права; документите
  вече отразяват коректно кой елемент/панел е видим за коя роля.
- `SECURITY.md` споменаваше несъществуваща `ownerLogin` функция; заменено с
  реалните known issues: hardcoded seed акаунт `admin`/`admin123` и
  `hashPw()`, който не е истинско хеширане (`btoa` с фиксирана сол).
- `qa-docs/TEST_CASES.md`: добавени тест кейсове за editor/tech/viewer
  разграничения в header менюто (TC-22a/b, TC-23a, TC-24a/b), за
  magnifier fit бутона (TC-20a) и нова секция за Схеми панела (TC-31–33),
  която преди нямаше покритие въпреки че е документирана в
  `ARCHITECTURE.md` като основен UI компонент.

### Added
- Пълна QA документация (`qa-docs/TEST_PLAN.md`, `TEST_CASES.md`) и bug report темплейт.
- Технически документи: `README.md`, `ARCHITECTURE.md`, `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md`.

## Преди този журнал
По-ранните промени не са документирани тук — виж `git log` за пълна история на commit-ите.
