# Mobile_cali_app
Calisthenics app for frontlever and planche

## Maintenance map

The app is intentionally kept as a single-shell PWA for now so the shared state and navigation stay simple.

- Main entry and all UI logic live in [index.html](index.html)
- Offline caching rules live in [sw.js](sw.js)
- App metadata and install behavior live in [manifest.json](manifest.json)

If the app grows again, split by feature boundary first, not by page count. The usual order should be:

1. Keep one HTML shell.
2. Extract shared styles only if the CSS keeps growing.
3. Extract the largest independent feature block next.
4. Avoid creating many page files unless the views are truly separate.
