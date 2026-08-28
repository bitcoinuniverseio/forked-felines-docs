/**
 * The House Manual builder.
 *
 * Reads the Markdown under docs/ (the single source of truth), renders the
 * static documentation site into _site/, and never changes a word of content.
 * No framework, no runtime JavaScript beyond search, copy buttons, theme and
 * the mobile drawer. Everything the reader sees is in the HTML.
 */
import { execSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "_site");
const repoUrl = "https://github.com/bitcoinuniverseio/forked-felines-docs";
const facts = JSON.parse(readFileSync(join(root, "facts", "facts.json"), "utf8"));
const siteOrigin = process.env.DOCS_SITE_ORIGIN ?? "https://bitcoinuniverseio.github.io/forked-felines-docs";
const basePath = new URL(siteOrigin.startsWith("http") ? siteOrigin : `https://${siteOrigin}`).pathname.replace(/\/$/, "");
let sourceSha = "unpublished";
try { sourceSha = execSync("git rev-parse HEAD", { cwd: root }).toString().trim(); } catch { /* outside git */ }

/** Navigation is the reading order. Section titles are the house's rooms. */
const NAV = [
  { title: "Start here", pages: [
    ["docs/index.md", "The House Manual"],
    ["docs/start-here/what-is-forked-felines.md", "What is Forked Felines?"],
    ["docs/start-here/explain-it-in-30-seconds.md", "Explain it in 30 seconds"],
    ["docs/start-here/mint-in-3-steps.md", "Mint in 3 steps"],
    ["docs/start-here/knot-heads-holder-start.md", "Knot Heads holder start"],
    ["docs/start-here/public-minter-start.md", "Public minter start"],
  ]},
  { title: "Collectors", pages: [
    ["docs/collectors/supported-wallets.md", "Supported wallets"],
    ["docs/collectors/receiving-vs-payment-address.md", "Receiving vs payment address"],
    ["docs/collectors/prices-and-fees.md", "Prices and fees"],
    ["docs/collectors/wallet-signing.md", "Wallet signing"],
    ["docs/collectors/order-status.md", "Order status"],
    ["docs/collectors/my-booth.md", "My Booth"],
    ["docs/collectors/community-credits.md", "Community credits"],
    ["docs/collectors/remediation-and-refunds.md", "Remediation and refunds"],
  ]},
  { title: "The collection", pages: [
    ["docs/collection/how-the-art-is-made.md", "How the art is made"],
    ["docs/collection/whole-on-bitcoin.md", "Whole on Bitcoin"],
    ["docs/collection/verified-artwork.md", "Verified artwork"],
    ["docs/collection/traits-and-odds.md", "Traits and odds"],
    ["docs/collection/provenance.md", "Provenance"],
    ["docs/collection/collection-wall.md", "The collection wall"],
    ["docs/collection/knot-heads-relationship.md", "The Knot Heads relationship"],
  ]},
  { title: "Safety", pages: [
    ["docs/safety/stay-safe.md", "Stay safe"],
    ["docs/safety/what-we-will-never-ask.md", "What we will never ask"],
    ["docs/safety/privacy.md", "Privacy"],
    ["docs/safety/reporting-a-security-problem.md", "Reporting a security problem"],
  ]},
  { title: "Help", pages: [
    ["docs/help/troubleshooting.md", "Troubleshooting"],
    ["docs/help/payment-and-confirmation.md", "Payment and confirmation"],
    ["docs/help/getting-support.md", "Getting support"],
  ]},
  { title: "Reference", pages: [
    ["docs/reference/official-product-facts.md", "Official product facts"],
    ["docs/reference/public-api.md", "Public API"],
    ["docs/reference/order-states.md", "Order states"],
    ["docs/reference/status-contract.md", "Status contract"],
    ["docs/reference/terminology.md", "Terminology"],
  ]},
  { title: "Changes", pages: [
    ["CHANGELOG.md", "Changelog"],
  ]},
];

const flat = NAV.flatMap((section) => section.pages.map(([src, title]) => ({ src, title, section: section.title })));

function htmlPath(src) {
  if (src === "docs/index.md") return "index.html";
  if (src === "CHANGELOG.md") return "changes/changelog.html";
  return src.replace(/^docs\//, "").replace(/\.md$/, ".html");
}
function hrefFor(src) { return `${basePath}/${htmlPath(src)}`; }

function slug(text) {
  return text.toLowerCase().replace(/&[a-z]+;|<[^>]+>/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}
function esc(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Rewrite repository-relative Markdown links into site links. */
function rewriteHref(href, srcDir) {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  const [pathPart, hash = ""] = href.split("#");
  if (!pathPart.endsWith(".md")) return href;
  const resolved = join(srcDir, pathPart).replaceAll("\\", "/").replace(/^\.\//, "");
  const normalized = resolved.split("/").reduce((parts, piece) => {
    if (piece === "..") parts.pop(); else if (piece !== "." && piece !== "") parts.push(piece);
    return parts;
  }, []).join("/");
  const known = flat.find((page) => page.src === normalized);
  if (!known) return href;
  return hrefFor(known.src) + (hash ? `#${hash}` : "");
}

const searchIndex = [];

function renderPage(page, index) {
  const srcAbs = join(root, page.src);
  const srcDir = dirname(page.src).replaceAll("\\", "/");
  const markdown = readFileSync(srcAbs, "utf8");
  const headings = [];

  const renderer = new marked.Renderer();
  /* Inline content inside headings and table cells must render through THIS
     renderer, or their links would fall back to the default one and keep
     their .md targets. */
  const inline = (tokens) => marked.Parser.parseInline(tokens, { renderer });
  renderer.heading = ({ tokens, depth }) => {
    const text = tokens.map((token) => token.raw ?? "").join("");
    const rendered = inline(tokens);
    const id = slug(text);
    if (depth === 2) headings.push({ id, text });
    if (depth === 1) return `<h1 id="${id}">${rendered}</h1>`;
    return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-label="Link to this section">${rendered}</a></h${depth}>`;
  };
  renderer.link = function ({ href, title, tokens }) {
    const text = inline(tokens);
    const rewritten = rewriteHref(href, srcDir);
    const external = /^https?:/.test(rewritten) && !rewritten.startsWith(siteOrigin);
    const extra = external ? ' rel="noopener"' : "";
    return `<a href="${rewritten}"${title ? ` title="${esc(title)}"` : ""}${extra}>${text}</a>`;
  };
  renderer.code = ({ text, lang }) => {
    return `<div class="codeframe"><button type="button" class="copy" aria-label="Copy code">Copy</button><pre><code${lang ? ` class="language-${esc(lang)}"` : ""}>${esc(text)}</code></pre></div>`;
  };
  renderer.table = function ({ header, rows }) {
    const head = header.map((cell) => `<th>${inline(cell.tokens)}</th>`).join("");
    const body = rows.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell.tokens)}</td>`).join("")}</tr>`).join("");
    return `<div class="tableframe"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  };

  const body = marked.parse(markdown, { renderer, gfm: true });
  const plain = markdown.replace(/```[\s\S]*?```/g, " ").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[#*_`>|]/g, "").replace(/\s+/g, " ").trim();
  searchIndex.push({ title: page.title, section: page.section, href: hrefFor(page.src), text: plain.slice(0, 2200) });

  const prev = flat[index - 1] ?? null;
  const next = flat[index + 1] ?? null;
  const crumbs = page.src === "docs/index.md"
    ? `<span aria-current="page">The House Manual</span>`
    : `<a href="${basePath}/">The House Manual</a><span class="crumb-sep" aria-hidden="true">·</span><span>${esc(page.section)}</span><span class="crumb-sep" aria-hidden="true">·</span><span aria-current="page">${esc(page.title)}</span>`;

  const sidebar = NAV.map((section) => `
    <section class="nav-room">
      <h2>${esc(section.title)}</h2>
      <ul>${section.pages.map(([src, title]) => `<li><a href="${hrefFor(src)}"${src === page.src ? ' aria-current="page"' : ""}>${esc(title)}</a></li>`).join("")}</ul>
    </section>`).join("");

  const toc = headings.length > 1
    ? `<nav class="toc" aria-label="On this page"><h2>On this page</h2><ul>${headings.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ul></nav>`
    : "";

  const pager = `
    <nav class="pager" aria-label="Read on">
      ${prev ? `<a class="pager-prev" href="${hrefFor(prev.src)}"><span>Previous</span><strong>${esc(prev.title)}</strong></a>` : "<span></span>"}
      ${next ? `<a class="pager-next" href="${hrefFor(next.src)}"><span>Next</span><strong>${esc(next.title)}</strong></a>` : "<span></span>"}
    </nav>`;

  const description = plain.slice(0, 155).replace(/"/g, "'");
  const canonical = `${siteOrigin}/${htmlPath(page.src)}`.replace(/\/index\.html$/, "/");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)} · Forked Felines House Manual</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="${basePath}/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${basePath}/assets/manual.css">
<meta property="og:title" content="${esc(page.title)} · Forked Felines House Manual">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="Forked Felines House Manual">
<meta property="og:image" content="${siteOrigin}/assets/social-card.png">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "TechArticle", headline: page.title, isPartOf: { "@type": "WebSite", name: "Forked Felines House Manual", url: siteOrigin } })}</script>
<script>try{if(localStorage.getItem("house-hours")==="after")document.documentElement.dataset.hours="after"}catch(e){}</script>
</head>
<body>
<a class="skip-link" href="#manual-content">Skip to the page</a>
<header class="door">
  <button type="button" class="drawer-toggle" aria-expanded="false" aria-controls="rooms">ROOMS</button>
  <a class="housemark" href="${basePath}/"><span class="housemark-sign">FORKED FELINES</span><span class="housemark-sub">HOUSE MANUAL</span></a>
  <div class="door-actions">
    <button type="button" class="search-open" aria-keyshortcuts="/">Search<kbd>/</kbd></button>
    <button type="button" class="hours-toggle" aria-pressed="false" title="After-hours reading">After hours</button>
    <a class="door-link" href="https://forkedfelines.art" rel="noopener">Live product</a>
  </div>
</header>
<div class="manual">
  <nav id="rooms" class="rooms" aria-label="Documentation">
    ${sidebar}
    <p class="rooms-note">Staff will never DM first.</p>
  </nav>
  <main id="manual-content" class="page">
    <nav class="crumbs" aria-label="Breadcrumb">${crumbs}</nav>
    <article class="reading">${body}</article>
    ${pager}
    <footer class="colophon">
      <p>Last verified <strong>${facts.verifiedAt}</strong> against <a href="${facts.productFactsEndpoint}" rel="noopener">the live product contract</a> (schema <code>${facts.schemaVersion}</code>).</p>
      <p>Source <a href="${repoUrl}/blob/main/${page.src}" rel="noopener">on GitHub</a> · <a href="${repoUrl}/edit/main/${page.src}" rel="noopener">Edit this page</a> · Built from <code>${sourceSha.slice(0, 12)}</code></p>
      <p class="colophon-line">Financial facts are never jokes here. Everything else is fair game. <span class="marginalia">A collectible, not an investment.</span></p>
    </footer>
  </main>
  ${toc}
</div>
<div class="search-veil" hidden>
  <div class="search-card" role="dialog" aria-modal="true" aria-label="Search the manual">
    <input type="search" class="search-input" placeholder="Search the manual..." aria-label="Search the manual">
    <ul class="search-results" role="listbox"></ul>
    <p class="search-hint">Type to search · Enter opens · Esc closes</p>
  </div>
</div>
<script src="${basePath}/assets/manual.js" defer></script>
</body>
</html>`;

  const dest = join(out, htmlPath(page.src));
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
flat.forEach((page, index) => renderPage(page, index));

/* Self-check: every .md link in the rendered pages must point at GitHub
   (view-source and edit links). A relative .md link surviving into the site
   means a renderer path skipped the rewrite. */
import("node:fs").then(async ({ readdirSync: rd, readFileSync: rf, statSync: st }) => {
  const leaks = [];
  const scan = (dir) => {
    for (const name of rd(dir)) {
      const full = join(dir, name);
      if (st(full).isDirectory()) scan(full);
      else if (name.endsWith(".html")) {
        for (const [, href] of rf(full, "utf8").matchAll(/href="([^"]+\.md(?:#[^"]*)?)"/g)) {
          if (!href.startsWith("https://github.com/")) leaks.push(`${full}: ${href}`);
        }
      }
    }
  };
  scan(out);
  if (leaks.length) {
    console.error(`build self-check: ${leaks.length} unrewritten .md link(s)`);
    for (const leak of leaks) console.error(`  ${leak}`);
    process.exit(1);
  }
});
cpSync(join(root, "site", "assets"), join(out, "assets"), { recursive: true });
writeFileSync(join(out, "assets", "search-index.json"), JSON.stringify(searchIndex));

/* 404: same shell, the house's own words. */
writeFileSync(join(out, "404.html"), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found · Forked Felines House Manual</title>
<link rel="icon" href="${basePath}/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${basePath}/assets/manual.css"><meta name="robots" content="noindex">
<script>try{if(localStorage.getItem("house-hours")==="after")document.documentElement.dataset.hours="after"}catch(e){}</script></head>
<body class="lost"><main class="page notfound"><p class="plaque">ERROR 404</p>
<h1>THE CAT KNOCKED THIS PAGE OFF THE TABLE.</h1>
<p>That page does not exist. The feline shows no remorse.</p>
<p><a class="button-oxblood" href="${basePath}/">Back to the manual</a> <a class="button-plain" href="https://forkedfelines.art" rel="noopener">To the live product</a></p>
</main></body></html>`);

/* sitemap and robots */
const urls = flat.map((page) => `<url><loc>${siteOrigin}/${htmlPath(page.src)}</loc></url>`).join("");
writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`);
writeFileSync(join(out, ".nojekyll"), "");

/* The build manifest: what was published, from what, verified when. */
writeFileSync(join(out, "manifest.json"), JSON.stringify({
  documentationSchema: "forked-felines.public-docs/v1",
  product: facts.productName,
  pricingVersion: facts.pricingVersion,
  lastVerified: facts.verifiedAt,
  sourceSha,
  builtAt: new Date().toISOString(),
  pages: flat.length,
}, null, 2));

console.log(`House Manual built: ${flat.length} pages -> _site/ (source ${sourceSha.slice(0, 12)})`);
