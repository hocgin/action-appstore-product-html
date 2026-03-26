const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildHtml,
  extractApps,
  extractDeveloperName,
  normalizeCountry,
  parseDeveloperId,
  parseMaxItems,
  stripTags
} = require('../src/index');

test('parseDeveloperId accepts numeric ids', () => {
  assert.equal(parseDeveloperId('1137057742'), '1137057742');
});

test('parseDeveloperId rejects non numeric ids', () => {
  assert.throws(() => parseDeveloperId('abc123'), /numeric App Store developer id/);
});

test('normalizeCountry lowercases and trims input', () => {
  assert.equal(normalizeCountry('  IN '), 'in');
});

test('parseMaxItems validates positive integers', () => {
  assert.equal(parseMaxItems('12'), 12);
  assert.throws(() => parseMaxItems('0'), /positive integer/);
});

test('stripTags removes markup and decodes entities', () => {
  assert.equal(stripTags('<span>Hello &amp; <strong>World</strong></span>'), 'Hello & World');
});

test('extractDeveloperName prefers meta description content', () => {
  const html = '<meta name="description" content="Download apps by Jane Doe, including Foo.">';
  assert.equal(extractDeveloperName(html), 'Jane Doe');
});

test('extractApps parses app cards from App Store developer HTML', () => {
  const html = `
    <a aria-label="Sample App" href="https://apps.apple.com/us/app/sample-app/id1234567890" data-test-id="internal-link">
      <article>
        <div class="metadata-container">
          <div class="multiline-clamp" role="text">
            <span class="multiline-clamp__text"><h3>Sample App</h3></span>
          </div>
          <div class="multiline-clamp" role="text">
            <span class="multiline-clamp__text"><p>Useful description</p></span>
          </div>
        </div>
        <div class="app-icon">
          <picture>
            <source sizes="100px" srcset="https://example.com/icon.webp 100w,https://example.com/icon@2x.webp 200w" type="image/webp">
            <source sizes="100px" srcset="https://example.com/icon.jpg 100w,https://example.com/icon@2x.jpg 200w" type="image/jpeg">
          </picture>
        </div>
      </article>
    </a>
  `;

  const apps = extractApps(html, 10);
  assert.equal(apps.length, 1);
  assert.deepEqual(apps[0], {
    href: 'https://apps.apple.com/us/app/sample-app/id1234567890',
    title: 'Sample App',
    description: 'Useful description',
    icon: 'https://example.com/icon.webp'
  });
});

test('buildHtml renders a compact html snippet', () => {
  const html = buildHtml({
    developerName: 'Jane Doe',
    developerUrl: 'https://apps.apple.com/us/developer/id123',
    country: 'us',
    introHtml: '',
    apps: [
      {
        href: 'https://apps.apple.com/us/app/sample-app/id1234567890',
        title: 'Sample App',
        description: 'Useful description',
        icon: 'https://example.com/icon.webp'
      }
    ]
  });

  assert.match(html, /<div markdown="1">/);
  assert.match(html, /href="https:\/\/apps\.apple\.com\/us\/app\/sample-app\/id1234567890"/);
  assert.match(html, /alt="Sample App"/);
  assert.match(html, /title="Sample App - Useful description"/);
  assert.doesNotMatch(html, /Apps by/);
});

test('buildHtml can prepend custom intro html', () => {
  const html = buildHtml({
    developerName: 'Jane Doe',
    developerUrl: 'https://apps.apple.com/us/developer/id123',
    country: 'us',
    introHtml: '<sup>Example intro</sup>',
    apps: [
      {
        href: 'https://apps.apple.com/us/app/sample-app/id1234567890',
        title: 'Sample App',
        description: '',
        icon: 'https://example.com/icon.webp'
      }
    ]
  });

  assert.match(html, /<sup>Example intro<\/sup>/);
});
