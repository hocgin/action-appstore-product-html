const fs = require('fs');

const readmePath = process.env.README_PATH || 'README.md';
let html = process.env.HTML || '';

if (!html.trim() && process.env.HTML_FILE) {
  const output = fs.readFileSync(process.env.HTML_FILE, 'utf8');
  const lines = output.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => line.startsWith('html<<'));
  if (startIndex >= 0) {
    const delimiter = lines[startIndex].slice('html<<'.length).trim();
    const collected = [];
    for (let index = startIndex + 1; index < lines.length; index += 1) {
      if (lines[index].trim() === delimiter) {
        break;
      }
      collected.push(lines[index]);
    }
    html = collected.join('\n').trim();
  }
}

if (!html.trim()) {
  throw new Error('HTML env or HTML_FILE is empty');
}

const startMarker = '<!-- APPSTORE_HTML_START -->';
const endMarker = '<!-- APPSTORE_HTML_END -->';
const readme = fs.readFileSync(readmePath, 'utf8');
const pattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);

if (!pattern.test(readme)) {
  throw new Error(`README does not contain ${startMarker} and ${endMarker}`);
}

// 这里把 action 产出的 HTML 原样写回 README 顶部，方便每次运行后自动刷新。
const next = readme.replace(
  pattern,
  `${startMarker}\n${html.trim()}\n${endMarker}`
);

fs.writeFileSync(readmePath, next);
