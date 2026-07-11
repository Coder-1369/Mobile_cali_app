// Copies the root web files into www/ so Capacitor picks up your latest
// index.html. Plain Node.js, so this works identically on Windows, Mac, and
// Linux — unlike a raw shell "cp" command, which Windows Command Prompt
// doesn't have.
const fs = require('fs');
const path = require('path');

const files = ['index.html', 'manifest.json', 'sw.js', 'favicon.png', 'icon-192.png', 'icon-512.png'];
const destDir = path.join(__dirname, 'www');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

for (const file of files) {
  const src = path.join(__dirname, file);
  const dest = path.join(destDir, file);
  fs.copyFileSync(src, dest);
  console.log(`Copied ${file} -> www/`);
}
