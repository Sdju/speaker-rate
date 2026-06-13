# speaker-rate

Панель оценки заявок на доклад (Vue 3 + Vite).

- **Standalone:** [sdju.github.io/speaker-rate](https://sdju.github.io/speaker-rate/)
- **Виджет на JugRu:** userscript для [beta.jugru.org](https://beta.jugru.org)

## Установка виджета (Tampermonkey)

Виджет встраивается на страницу голосования JugRu: панель появляется над формой «Оценка», оценки и комментарий синхронизируются с сайтом автоматически.

1. Установите расширение [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Edge).
2. Откройте Tampermonkey → **Создать новый скрипт**.
3. Удалите содержимое редактора и вставьте код из файла [`userscripts/speaker-rate-loader.user.js`](userscripts/speaker-rate-loader.user.js) в этом репозитории.
4. Сохраните скрипт (Ctrl+S).
5. Откройте страницу голосования на `beta.jugru.org` и обновите её (лучше Ctrl+Shift+R).

Скрипт сам подгружает `widget.js` и `widget.css` с GitHub Pages — отдельно ничего ставить не нужно.

**Обновление:** после изменений в репозитории скопируйте свежий `speaker-rate-loader.user.js` в Tampermonkey и сохраните снова.

## Как это устроено

```
userscript → dock над [aria-label="Оценка"] → widget.js → RatingPanel → jugru/sync.ts
```

- Стили виджета наследуют палитру JugRu (`--foreground`, `--input`, …).
- Тёмная тема — по `class="dark"` на `<html>`, переключатель темы в виджете скрыт.

## Разработка

```sh
npm install
npm run dev          # standalone-приложение
npm run build        # dist/ + widget.js для Pages
npm run lint
```

### Сборки

| Артефакт | Назначение |
|---|---|
| `dist/index.html` | Standalone на GitHub Pages |
| `dist/widget.js`, `dist/widget.css` | Виджет для userscript |

## Deploy to GitHub Pages

1. Запушьте код в ветку `main`.
2. В GitHub: `Settings` → `Pages` → `Source: GitHub Actions`.
3. Workflow **Deploy to GitHub Pages** публикует `dist/`.

Адрес: `https://sdju.github.io/speaker-rate/`

## IDE

[VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar).
