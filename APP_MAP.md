# App Map

This repo is best treated as a single-shell PWA with feature sections inside one main HTML file.

## Current layout

- [index.html](index.html) contains the full UI, styles, and behavior.
- [sw.js](sw.js) handles offline caching and navigation fallback.
- [manifest.json](manifest.json) handles install metadata.

## Where to look in `index.html`

- App shell, header, navigation, and global layout
- Settings area, including profile and export controls
- Workout flow, including start, progress, finish, floating timer, and summary popup
- Timer tools and exercise/session helpers
- Theme, storage, and state persistence helpers

## Recommended split strategy

If future refactors become necessary, split in this order:

1. Extract shared CSS only if the style block becomes hard to maintain.
2. Extract the most self-contained feature block next.
3. Keep the navigation/state shell together as long as possible.
4. Do not turn this into many separate HTML pages unless the app becomes route-heavy.

## Why this structure

This keeps the app easy to search, avoids a large multi-file rewrite, and reduces the chance of breaking shared workout state.