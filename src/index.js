const fs = require('fs');
const core = require('@actions/core');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function decodeHtmlEntities(value) {
  return String(value)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripTags(value) {
  return decodeHtmlEntities(String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function normalizeCountry(value) {
  return String(value || 'us').trim().toLowerCase();
}

function parseDeveloperId(value) {
  const id = String(value || '').trim();
  if (!/^\d+$/.test(id)) {
    throw new Error(`developer-id must be a numeric App Store developer id, got: ${value}`);
  }
  return id;
}

function parseMaxItems(value) {
  const maxItems = Number.parseInt(String(value || '100'), 10);
  if (!Number.isFinite(maxItems) || maxItems < 1) {
    throw new Error(`max-items must be a positive integer, got: ${value}`);
  }
  return maxItems;
}

function parseBoolean(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

function extractDeveloperName(html) {
  const metaMatch = html.match(/<meta\s+name="description"\s+content="Download apps by\s+([^,]+),/i);
  if (metaMatch) {
    return decodeHtmlEntities(metaMatch[1].trim());
  }

  const jsonMatch = html.match(/<script id="developer" type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/i);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[1]);
      if (data && data.name) {
        return String(data.name).trim();
      }
    } catch (error) {
      // 这里失败时回退到默认标题，不影响主流程。
    }
  }

  return 'App Store Developer';
}

function extractAppIcon(innerHtml) {
  const sourceMatch = innerHtml.match(/<source[^>]+srcset="([^"]+)"[^>]*type="image\/(?:webp|jpeg)"/i)
    || innerHtml.match(/<source[^>]+type="image\/(?:webp|jpeg)"[^>]+srcset="([^"]+)"/i);
  if (sourceMatch) {
    const firstEntry = sourceMatch[1].split(',')[0].trim().split(/\s+/)[0];
    if (firstEntry) {
      return firstEntry;
    }
  }

  const imgMatch = innerHtml.match(/<img[^>]+src="([^"]+)"/i);
  if (imgMatch) {
    const src = imgMatch[1];
    return new URL(src, 'https://apps.apple.com').href;
  }

  return '';
}

function extractApps(html, maxItems) {
  const apps = [];
  const seen = new Set();
  const linkRe = /<a[^>]+href="(https:\/\/apps\.apple\.com\/[^"]+\/id\d+)"[^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(linkRe)) {
    const href = match[1];
    if (seen.has(href)) {
      continue;
    }
    seen.add(href);

    const innerHtml = match[2];
    const titleMatch = innerHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    const ariaMatch = match[0].match(/aria-label="([^"]+)"/i);
    const descriptionMatch = innerHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i);

    const title = stripTags(titleMatch ? titleMatch[1] : (ariaMatch ? ariaMatch[1] : ''));
    const description = stripTags(descriptionMatch ? descriptionMatch[1] : '');
    const icon = extractAppIcon(innerHtml);

    if (!title) {
      continue;
    }

    apps.push({
      href,
      title,
      description,
      icon
    });

    if (apps.length >= maxItems) {
      break;
    }
  }

  return apps;
}

function buildHtml({ apps, introHtml, homepageUrl, sponsorUrl }) {
  const lines = [];
  lines.push('<div markdown="1">');
  if (introHtml && introHtml.trim()) {
    lines.push(`  ${introHtml.trim()}`);
    lines.push('  <br>');
  } else if (homepageUrl && sponsorUrl) {
    // 只有同时配置个人主页和赞助地址时才展示说明文案。
    lines.push(
      `  <sup>Using <a href="${escapeHtml(homepageUrl)}" target="_blank">my apps</a> is also a way to <a href="${escapeHtml(sponsorUrl)}" target="_blank">support</a> me:</sup>`
    );
    lines.push('  <br>');
  }

  for (const app of apps) {
    const title = escapeHtml(app.title);
    const href = escapeHtml(app.href);
    const icon = escapeHtml(app.icon);
    const fullTitle = app.description ? `${app.title} - ${app.description}` : app.title;

    // 这里输出和参考示例一致的图标卡片结构，便于直接嵌入 Markdown/HTML。
    lines.push(
      `  <a target="_blank" href="${href}" title="${escapeHtml(fullTitle)}"><img alt="${title}" height="52" width="52" src="${icon}"></a>`
    );
  }

  lines.push('</div>');
  return lines.join('\n');
}

function updateReadmeFile(readmePath, html) {
  const startMarker = '<!-- APPSTORE_HTML_START -->';
  const endMarker = '<!-- APPSTORE_HTML_END -->';
  const readme = fs.readFileSync(readmePath, 'utf8');
  const startIndex = readme.indexOf(startMarker);
  const endIndex = readme.indexOf(endMarker);

  if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
    throw new Error(`README does not contain ${startMarker} and ${endMarker}`);
  }

  // 这里只替换标记之间的 HTML，保留 README 其余内容不变。
  const next = `${readme.slice(0, startIndex)}${startMarker}\n${html.trim()}\n${endMarker}${readme.slice(endIndex + endMarker.length)}`;
  const changed = next !== readme;

  if (changed) {
    fs.writeFileSync(readmePath, next);
  }

  return changed;
}

async function main() {
  try {
    const developerId = parseDeveloperId(core.getInput('developer-id', { required: true }));
    const country = normalizeCountry(core.getInput('country') || 'us');
    const maxItems = parseMaxItems(core.getInput('max-items') || '100');
    const introHtml = core.getInput('intro-html') || '';
    const updateReadme = parseBoolean(core.getInput('update-readme'));
    const readmePath = core.getInput('readme-path') || 'README.md';

    const developerUrl = `https://apps.apple.com/${country}/developer/id${developerId}`;

    core.info(`Fetching developer page: ${developerUrl}`);
    const response = await fetch(developerUrl, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; GitHub Action)',
        'accept-language': `${country},en;q=0.8`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch developer page: ${response.status} ${response.statusText}`);
    }

    const resolvedDeveloperUrl = response.url || developerUrl;
    const html = await response.text();
    const developerName = extractDeveloperName(html);
    const apps = extractApps(html, maxItems);

    if (!apps.length) {
      throw new Error(`No App Store apps found for developer ${developerId} in country ${country}`);
    }

    const outputHtml = buildHtml({
      developerName,
      developerUrl: resolvedDeveloperUrl,
      country,
      apps,
      introHtml,
      homepageUrl: core.getInput('homepage-url') || '',
      sponsorUrl: core.getInput('sponsor-url') || ''
    });

    core.setOutput('html', outputHtml);
    core.setOutput('count', String(apps.length));
    core.setOutput('readme-updated', 'false');

    if (updateReadme) {
      const changed = updateReadmeFile(readmePath, outputHtml);
      core.setOutput('readme-updated', String(changed));
      core.info(changed ? `Updated ${readmePath}.` : `${readmePath} is already up to date.`);
    }

    core.info(`Generated HTML for ${apps.length} apps.`);
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildHtml,
  decodeHtmlEntities,
  escapeHtml,
  extractAppIcon,
  extractApps,
  extractDeveloperName,
  normalizeCountry,
  parseBoolean,
  parseDeveloperId,
  parseMaxItems,
  updateReadmeFile,
  stripTags
};
