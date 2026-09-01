/**
 * The House Manual builder.
 *
 * Reads the Markdown under docs/ (the single source of truth), renders the
 * static documentation site into _site/, and never changes a word of content.
 *
 * Two things are generated rather than written by hand, because both are
 * derived facts that would drift the moment a person retyped them:
 *
 *  1. The gallery components. A Markdown page marks its place with an HTML
 *     comment, and the builder fills it from facts/collection-observed.json,
 *     which is itself read from the public collection endpoint. Nothing about
 *     a plate, a trait or an odds figure is typed into prose.
 *  2. The provenance block under every page, from facts/facts.json and git.
 *
 * Everything a reader needs is in the HTML the server sends. JavaScript adds
 * search, the theme switch, the mobile drawer, copy buttons, and the filters
 * on the two explorers. With JavaScript off, every page still reads and every
 * table is still complete.
 */
import { execSync } from "node:child_process";
import { copyFileSync, cpSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "_site");
const repoUrl = "https://github.com/bitcoinuniverseio/forked-felines-docs";
const platformUrl = "https://docs.bitcoinuniverse.io";
const productUrl = "https://forkedfelines.art";
const facts = JSON.parse(readFileSync(join(root, "facts", "facts.json"), "utf8"));
const observed = JSON.parse(readFileSync(join(root, "facts", "collection-observed.json"), "utf8"));
const manifest = JSON.parse(readFileSync(join(root, "docs.manifest.json"), "utf8"));
const siteOrigin = (process.env.DOCS_SITE_ORIGIN ?? "https://docs.forkedfelines.art").replace(/\/$/, "");
const basePath = new URL(siteOrigin.startsWith("http") ? siteOrigin : `https://${siteOrigin}`).pathname.replace(/\/$/, "");
let sourceSha = "unpublished";
try { sourceSha = execSync("git rev-parse HEAD", { cwd: root }).toString().trim(); } catch { /* outside git */ }

/** Navigation is the reading order. Each room states what kind of page it holds. */
const NAV = [
  { title: "Start here", kind: "Tutorial", pages: [
    ["docs/index.md", "Manual contents", "Reference"],
    ["docs/start-here/what-is-forked-felines.md", "What is Forked Felines?"],
    ["docs/start-here/explain-it-in-30-seconds.md", "Explain it in 30 seconds"],
    ["docs/start-here/mint-in-3-steps.md", "Mint in 3 steps"],
    ["docs/start-here/knot-heads-holder-start.md", "Knot Heads holder start"],
    ["docs/start-here/public-minter-start.md", "Public minter start"],
  ]},
  { title: "Collectors", kind: "Task guide", pages: [
    ["docs/collectors/supported-wallets.md", "Supported wallets"],
    ["docs/collectors/receiving-vs-payment-address.md", "Receiving vs payment address"],
    ["docs/collectors/prices-and-fees.md", "Prices and fees"],
    ["docs/collectors/wallet-signing.md", "Wallet signing"],
    ["docs/collectors/order-status.md", "Order status"],
    ["docs/collectors/my-booth.md", "My Booth"],
    ["docs/collectors/community-credits.md", "Community credits"],
    ["docs/collectors/remediation-and-refunds.md", "Remediation and refunds"],
  ]},
  { title: "The collection", kind: "Concept", pages: [
    ["docs/collection/the-plates.md", "The plates", "Gallery"],
    ["docs/collection/how-the-art-is-made.md", "How the art is made"],
    ["docs/collection/whole-on-bitcoin.md", "Whole on Bitcoin"],
    ["docs/collection/trait-catalogue.md", "Trait catalogue", "Reference"],
    ["docs/collection/traits-and-odds.md", "Traits and odds"],
    ["docs/collection/verified-artwork.md", "Verified artwork"],
    ["docs/collection/provenance.md", "Provenance"],
    ["docs/collection/verify-a-feline.md", "Verify a Feline", "Task guide"],
    ["docs/collection/collection-wall.md", "The collection wall"],
    ["docs/collection/knot-heads-relationship.md", "The Knot Heads relationship"],
  ]},
  { title: "Safety", kind: "Safety", pages: [
    ["docs/safety/stay-safe.md", "Stay safe"],
    ["docs/safety/what-we-will-never-ask.md", "What we will never ask"],
    ["docs/safety/privacy.md", "Privacy"],
    ["docs/safety/reporting-a-security-problem.md", "Reporting a security problem"],
  ]},
  { title: "Help", kind: "Troubleshooting", pages: [
    ["docs/help/troubleshooting.md", "Troubleshooting"],
    ["docs/help/payment-and-confirmation.md", "Payment and confirmation"],
    ["docs/help/getting-support.md", "Getting support"],
  ]},
  { title: "Reference", kind: "Reference", pages: [
    ["docs/reference/official-product-facts.md", "Official product facts"],
    ["docs/reference/public-api.md", "Public API"],
    ["docs/reference/order-states.md", "Order states"],
    ["docs/reference/status-contract.md", "Status contract"],
    ["docs/reference/terminology.md", "Terminology"],
  ]},
  { title: "Changes", kind: "Changelog", pages: [
    ["CHANGELOG.md", "Changelog"],
  ]},
];

const flat = NAV.flatMap((section) =>
  section.pages.map(([src, title, kind]) => ({ src, title, section: section.title, kind: kind ?? section.kind })));

function htmlPath(src) {
  if (src === "docs/index.md") return "contents.html";
  if (src === "CHANGELOG.md") return "changes/changelog.html";
  return src.replace(/^docs\//, "").replace(/\.md$/, ".html");
}
function hrefFor(src) { return `${basePath}/${htmlPath(src)}`; }
function urlFor(src) { return `${siteOrigin}/${htmlPath(src)}`; }

function slug(text) {
  return text.toLowerCase().replace(/&[a-z]+;|<[^>]+>/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}
function esc(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function group(number) { return Number(number).toLocaleString("en-US"); }

/* Rewrite repository-relative Markdown links into site links. */
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

/* ---------------------------------------------------------------- gallery */

/** Alt text is composed from the piece's real traits, so it can never drift
    away from the picture it describes. The scene grammar is the same for
    every plate because the artwork's composition is the same for every
    Feline: one cat, sitting in a plate, at one table setting. */
function plateAlt(plate) {
  const t = plate.traits;
  const parts = [`Forked Feline edition ${plate.edition}.`];
  const hat = t.Hat && t.Hat !== "None" ? ` wearing a ${t.Hat.toLowerCase()},` : "";
  parts.push(
    `A ${t.Fur.toLowerCase()} cat with a ${t.Expression.toLowerCase()} face,${hat}` +
    ` sits in a ${t.Plate.toLowerCase()} plate of ${t.Sides.toLowerCase()},` +
    ` tail ${t.Tail.toLowerCase()}, on a ${t.Table.toLowerCase()} table laid with cutlery` +
    ` and a ${t.Glass.toLowerCase()}.`,
  );
  if (t.Accessory && t.Accessory !== "None") parts.push(`A ${t.Accessory.toLowerCase()} sits on the table beside it.`);
  return parts.join(" ");
}

function plateFigure(plate, index) {
  const rows = [
    ["Plate", `${index + 1} of ${observed.plates.length}`],
    ["Edition", `${plate.edition} of ${group(observed.supply)} maximum`],
    ["Medium", "Deterministic SVG, inscribed whole on Bitcoin"],
    ["Dimensions", "1000 by 1000 drawing units, resolution independent"],
    ["Bytes", `${group(plate.bytes)} bytes of SVG`],
    ["Digest", `<code class="digest">${esc(plate.sha256)}</code>`],
    ["Setting odds", `${esc(plate.rarity)}, 1 in ${group(plate.rarityOneIn)}`],
    ["Inscription", `<code class="digest">${esc(plate.inscriptionId)}</code>`],
    ["Served", `<time datetime="${esc(plate.servedAt)}">${esc(plate.servedAt.slice(0, 10))}</time>`],
  ];
  const traitRows = Object.entries(plate.traits)
    .map(([name, value]) => `<div class="trait"><dt>${esc(name)}</dt><dd>${esc(value)}</dd></div>`).join("");
  return `<figure class="plate" id="plate-${plate.edition}">
  <div class="matte"><img src="${basePath}/assets/plates/${esc(plate.file)}" width="1000" height="1000" loading="${index < 2 ? "eager" : "lazy"}" decoding="async" alt="${esc(plateAlt(plate))}"></div>
  <figcaption class="wall-label">
    <p class="wall-plate">Plate ${index + 1}</p>
    <h3 class="wall-title">Forked Feline <span>${plate.edition}</span></h3>
    <dl class="traitset">${traitRows}</dl>
    <table class="catalogue"><caption class="visually-hidden">Catalogue entry for edition ${plate.edition}</caption><tbody>
      ${rows.map(([label, value]) => `<tr><th scope="row">${esc(label)}</th><td>${value}</td></tr>`).join("")}
    </tbody></table>
    <p class="wall-note"><a href="${productUrl}/collection/${plate.edition}" rel="noopener">This Feline on the wall</a></p>
  </figcaption>
</figure>`;
}

function plateGallery() {
  return `<section class="gallery" aria-label="Plates">
${observed.plates.map(plateFigure).join("\n")}
<p class="reading-note">Read on ${esc(observed.observedAt.slice(0, 10))} from the public collection endpoint. Digests are of the files served on this page.</p>
</section>`;
}

function traitExplorer() {
  const cats = observed.traits.map((cat) => `
    <section class="trait-card" data-trait-card data-category="${esc(cat.category)}">
      <h3>${esc(cat.category)} <span class="count">${cat.valuesObserved} seen</span></h3>
      <ul>${cat.values.map((v) => `<li data-trait-value><span class="value">${esc(v.value)}</span> <span class="tally" title="Confirmed Felines carrying this value">${v.observed}</span></li>`).join("")}</ul>
    </section>`).join("");
  return `<div class="explorer" data-explorer="traits">
  <form class="explorer-controls" role="search" aria-label="Filter the trait catalogue">
    <label class="field"><span>Find a trait or value</span>
      <input type="search" data-trait-filter placeholder="pope hat, calico, gingham" autocomplete="off"></label>
    <p class="explorer-status" data-trait-status role="status">${observed.traits.length} traits, ${observed.traits.reduce((n, c) => n + c.valuesObserved, 0)} values seen across ${observed.revealedCount} confirmed Felines.</p>
  </form>
  <div class="trait-grid">${cats}</div>
  <p class="reading-note">Census read on ${esc(observed.observedAt.slice(0, 10))}. The tally is how many confirmed Felines carry the value, not the odds of drawing it.</p>
</div>`;
}

function rarityExplorer() {
  const tiers = observed.rarityTiers.map((tier) => `<tr>
    <th scope="row">${esc(tier.tier)}</th>
    <td>${tier.observed}</td>
    <td>1 in ${group(tier.lowestOneIn)}</td>
    <td>1 in ${group(tier.highestOneIn)}</td>
  </tr>`).join("");
  return `<div class="explorer" data-explorer="rarity">
  <table class="tiers"><caption>Tier words on the ${observed.revealedCount} confirmed Felines, read ${esc(observed.observedAt.slice(0, 10))}</caption>
  <thead><tr><th scope="col">Tier</th><th scope="col">Felines</th><th scope="col">Lowest odds seen</th><th scope="col">Highest odds seen</th></tr></thead>
  <tbody>${tiers}</tbody></table>
  <p class="reading-note">The ranges overlap. That is the point of the paragraph above this table, and it is why the figure is the precise reading and the word is the shorthand.</p>
</div>`;
}

function digestChecker() {
  const options = observed.plates
    .map((p) => `<option value="${basePath}/assets/plates/${esc(p.file)}" data-sha="${esc(p.sha256)}" data-bytes="${p.bytes}">Edition ${p.edition}</option>`).join("");
  return `<div class="checker" data-checker>
  <noscript><p class="checker-fallback">This checker computes SHA-256 in your browser, so it needs JavaScript. The command line steps above do the same job and are the ones to trust anyway.</p></noscript>
  <div class="checker-body" hidden data-checker-body>
    <fieldset>
      <legend>1. Choose bytes to hash</legend>
      <p class="field"><label for="checker-file">A file from your computer</label>
        <input type="file" id="checker-file" data-checker-file accept=".svg,image/svg+xml,*/*"></p>
      <p class="field"><label for="checker-plate">Or a plate this page already serves</label>
        <span class="row"><select id="checker-plate" data-checker-plate>${options}</select>
        <button type="button" data-checker-fetch>Hash it</button></span></p>
    </fieldset>
    <fieldset>
      <legend>2. Paste the digest you are checking against</legend>
      <p class="field"><label for="checker-expected">Artwork digest from the Feline's card, or the <code>x-content-sha256</code> header</label>
        <input type="text" id="checker-expected" data-checker-expected spellcheck="false" autocomplete="off" placeholder="64 hexadecimal characters"></p>
    </fieldset>
    <output class="checker-out" data-checker-out role="status" aria-live="polite">Nothing hashed yet.</output>
    <p class="checker-privacy">Everything happens in this browser tab. No file is uploaded, and this site has no server to upload it to.</p>
  </div>
</div>`;
}

const COMPONENTS = {
  "plate-gallery": plateGallery,
  "trait-explorer": traitExplorer,
  "rarity-explorer": rarityExplorer,
  "digest-checker": digestChecker,
};

/* ------------------------------------------------------------------ pages */

const searchIndex = [];
const CHAIN = manifest.chains[0];

function shell({ title, description, canonical, bodyClass, head = "", content }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="${basePath}/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${basePath}/assets/manual.css">
<meta name="color-scheme" content="light dark">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Forked Felines House Manual">
<meta property="og:image" content="${siteOrigin}/assets/social-card.png">
<meta property="og:image:alt" content="A brass plaque reading THE FORK FAILED. THEY BOOKED A TABLE.">
<meta name="twitter:card" content="summary_large_image">
${head}<script>try{var t=localStorage.getItem("house-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}</script>
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ""}>
<a class="skip-link" href="#manual-content">Skip to the page</a>
${content}
<div class="search-veil" hidden>
  <div class="search-card" role="dialog" aria-modal="true" aria-label="Search the manual">
    <input type="search" class="search-input" placeholder="Search the manual" aria-label="Search the manual"
           autocomplete="off" role="combobox" aria-expanded="false" aria-autocomplete="list"
           aria-controls="search-results">
    <ul id="search-results" class="search-results" role="listbox" aria-label="Results"></ul>
    <p class="search-count visually-hidden" role="status"></p>
    <p class="search-hint">Type to search. Arrow keys move, Enter opens, Escape and Tab close.</p>
  </div>
</div>
<script src="${basePath}/assets/manual.js" defer></script>
</body>
</html>`;
}

function header(current) {
  return `<header class="door">
  <button type="button" class="drawer-toggle" aria-expanded="false" aria-controls="rooms">Rooms</button>
  <a class="housemark" href="${basePath}/"><span class="housemark-sign">Forked Felines</span><span class="housemark-sub">House Manual</span></a>
  <div class="door-actions">
    <button type="button" class="search-open" aria-keyshortcuts="/">Search<kbd>/</kbd></button>
    <button type="button" class="theme-toggle" aria-pressed="false"><span class="theme-label">After hours</span></button>
    <a class="door-link" href="${productUrl}" rel="noopener">Live product</a>
  </div>
  ${current ? "" : ""}
</header>`;
}

/* The room titles label their own lists rather than being headings. A
   sidebar rendered before the article would otherwise put six h2 elements
   above the page's h1, which is a heading order no reader benefits from. */
function sidebar(currentSrc) {
  return NAV.map((section) => {
    const id = `room-${slug(section.title)}`;
    return `
    <div class="nav-room">
      <p class="nav-room-title" id="${id}">${esc(section.title)}</p>
      <ul aria-labelledby="${id}">${section.pages.map(([src, title]) =>
        `<li><a href="${hrefFor(src)}"${src === currentSrc ? ' aria-current="page"' : ""}>${esc(title)}</a></li>`).join("")}</ul>
    </div>`;
  }).join("");
}

function provenanceBlock(page) {
  const rows = [
    ["Owning repository", `<a href="${repoUrl}" rel="noopener">bitcoinuniverseio/forked-felines-docs</a>`],
    ["Source path", `<a href="${repoUrl}/blob/main/${page.src}" rel="noopener"><code>${esc(page.src)}</code></a>`],
    ["Page kind", esc(page.kind)],
    ["Chain and network", `${esc(CHAIN.chain)} ${CHAIN.networks.map(esc).join(", ")}`],
    ["Lifecycle", esc(manifest.lifecycle)],
    ["Product contract", `<code>${esc(facts.schemaVersion)}</code>, pricing <code>${esc(facts.pricingVersion)}</code>`],
    ["Facts last verified", `<time datetime="${esc(facts.verifiedAt)}">${esc(facts.verifiedAt)}</time> against <a href="${facts.productFactsEndpoint}" rel="noopener">the live product contract</a>`],
    ["Built from", `<code>${esc(sourceSha.slice(0, 12))}</code>`],
  ];
  return `<section class="provenance" aria-labelledby="page-provenance">
  <h2 id="page-provenance">Where this page comes from</h2>
  <dl>${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join("")}</dl>
  <p class="provenance-links">
    <a href="${repoUrl}/edit/main/${page.src}" rel="noopener">Edit this page on GitHub</a>
    <a href="${platformUrl}" rel="noopener">Bitcoin Universe documentation</a>
    <a href="${productUrl}/status" rel="noopener">House status</a>
  </p>
</section>`;
}

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
    return `<h${depth} id="${id}"><a class="anchor" href="#${id}">${rendered}</a></h${depth}>`;
  };
  renderer.link = function ({ href, title, tokens }) {
    const text = inline(tokens);
    const rewritten = rewriteHref(href, srcDir);
    const external = /^https?:/.test(rewritten) && !rewritten.startsWith(siteOrigin);
    return `<a href="${rewritten}"${title ? ` title="${esc(title)}"` : ""}${external ? ' rel="noopener"' : ""}>${text}</a>`;
  };
  renderer.image = function ({ href, text }) {
    const target = href.replace(/^\.\.\//, `${basePath}/`).replace(/^\.\//, `${basePath}/`);
    return `<figure class="diagram"><img src="${target}" alt="${esc(text)}" loading="lazy" decoding="async"></figure>`;
  };
  renderer.code = ({ text, lang }) =>
    `<div class="codeframe"><button type="button" class="copy">Copy<span class="visually-hidden"> this code</span></button><pre><code${lang ? ` class="language-${esc(lang)}"` : ""}>${esc(text)}</code></pre></div>`;
  renderer.table = function ({ header: head, rows }) {
    const th = head.map((cell) => `<th scope="col">${inline(cell.tokens)}</th>`).join("");
    const body = rows.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell.tokens)}</td>`).join("")}</tr>`).join("");
    return `<div class="tableframe" tabindex="0" role="region" aria-label="Table"><table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table></div>`;
  };

  let body = marked.parse(markdown, { renderer, gfm: true });
  body = body.replace(/<!--\s*component:\s*([a-z-]+)\s*-->/g, (whole, name) => {
    const build = COMPONENTS[name];
    if (!build) throw new Error(`${page.src}: unknown component "${name}"`);
    return build();
  });

  const plain = markdown.replace(/```[\s\S]*?```/g, " ").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<!--[\s\S]*?-->/g, " ").replace(/[#*_`>|]/g, "").replace(/\s+/g, " ").trim();
  searchIndex.push({ title: page.title, section: page.section, href: hrefFor(page.src), text: plain.slice(0, 2200) });

  const prev = flat[index - 1] ?? null;
  const next = flat[index + 1] ?? null;
  const crumbs = `<a href="${basePath}/">House Manual</a><span class="crumb-sep" aria-hidden="true">/</span><span>${esc(page.section)}</span><span class="crumb-sep" aria-hidden="true">/</span><span aria-current="page">${esc(page.title)}</span>`;

  const toc = headings.length > 1
    ? `<nav class="toc" aria-label="On this page"><h2>On this page</h2><ul>${headings.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ul></nav>`
    : "";

  const pager = `
    <nav class="pager" aria-label="Read on">
      ${prev ? `<a class="pager-prev" href="${hrefFor(prev.src)}"><span>Previous</span><strong>${esc(prev.title)}</strong></a>` : "<span></span>"}
      ${next ? `<a class="pager-next" href="${hrefFor(next.src)}"><span>Next</span><strong>${esc(next.title)}</strong></a>` : "<span></span>"}
    </nav>`;

  const description = plain.slice(0, 155).replace(/"/g, "'");
  const structured = JSON.stringify({
    "@context": "https://schema.org", "@type": "TechArticle",
    headline: page.title, description, url: urlFor(page.src),
    inLanguage: "en", dateModified: facts.verifiedAt,
    isPartOf: { "@type": "WebSite", name: "Forked Felines House Manual", url: siteOrigin },
    publisher: { "@type": "Organization", name: "Bitcoin Universe", url: platformUrl },
  });

  const html = shell({
    title: `${page.title} · Forked Felines House Manual`,
    description, canonical: urlFor(page.src),
    head: `<script type="application/ld+json">${structured}</script>\n`,
    content: `${header(page.src)}
<div class="manual">
  <nav id="rooms" class="rooms" aria-label="Documentation sections">
    ${sidebar(page.src)}
    <p class="rooms-note">Staff will never DM first.</p>
  </nav>
  <main id="manual-content" class="page">
    <nav class="crumbs" aria-label="Breadcrumb">${crumbs}</nav>
    <p class="page-kind">${esc(page.kind)}</p>
    <article class="reading">${body}</article>
    ${pager}
    ${provenanceBlock(page)}
    <p class="colophon-line">Financial facts are never jokes here. Everything else is fair game. <span class="marginalia">A collectible, not an investment.</span></p>
  </main>
  ${toc}
</div>`,
  });

  const dest = join(out, htmlPath(page.src));
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
}

/* -------------------------------------------------------------- homepage */

function homepage() {
  const lead = observed.plates[0];
  const entry = [
    ["New here", "What is Forked Felines?", "start-here/what-is-forked-felines.html", "Three thousand three hundred and thirty three cats, a frozen recipe, and a receipt for every one."],
    ["Ready to mint", "Mint in 3 steps", "start-here/mint-in-3-steps.html", "Read the offer, name the recipient, approve one exact total. Nothing else is ever requested."],
    ["Holding Knot Heads", "Knot Heads holder start", "start-here/knot-heads-holder-start.html", "One free-mint credit per head recorded at block 963,238. The snapshot is fixed forever."],
    ["Looking at the art", "The plates", "collection/the-plates.html", "Eight real Felines at full size, each with its catalogue entry and its digest."],
    ["Checking a Feline", "Verify a Feline", "collection/verify-a-feline.html", "Hash the bytes yourself and compare. No wallet, no signature, no trust in this site."],
    ["Worried about a scam", "What we will never ask", "safety/what-we-will-never-ask.html", "The complete list of what the house asks for. It is three lines long and it will stay short."],
  ];
  const quick = [
    ["Maximum supply", `${group(facts.maximumSupply)} felines`],
    ["Public collection price", `${group(facts.publicMintPriceSats)} sats`],
    ["Holder collection price", `${facts.communityMintPriceSats} sats, one credit per eligible Knot Head`],
    ["Service fee", `${group(facts.baseServiceFeeSats)} sats, plus ${group(facts.rbfServiceFeeIncrementSats)} sats per accepted fee bump`],
    ["Network and delivery", "Live, itemized separately, payable on every mint"],
    ["Holder snapshot", `Bitcoin block ${group(facts.holderSnapshotBlockHeight)}, fixed forever`],
    ["Artwork", "Deterministic SVG, hash verified, inscribed whole on Bitcoin"],
    ["Chain and network", `${CHAIN.chain} ${CHAIN.networks.join(", ")}`],
    ["Documentation lifecycle", `${manifest.lifecycle}, release ${manifest.releaseVersion}`],
    ["Pricing contract", `<code>${esc(facts.pricingVersion)}</code>`],
  ];
  const content = `${header(null)}
<main id="manual-content" class="home">
  <section class="hero">
    <div class="hero-text">
      <p class="hero-eyebrow">The official KNOT HEADS companion collection</p>
      <h1>Every cat can show its working.</h1>
      <p class="hero-lead">A maximum of ${group(facts.maximumSupply)} hand-drawn felines, each one drawn from a recipe frozen before the first was reserved, and each one inscribed whole on Bitcoin. Not a link to a picture. The picture.</p>
      <p class="hero-actions">
        <a class="button-primary" href="${basePath}/start-here/what-is-forked-felines.html">Start reading</a>
        <a class="button-quiet" href="${basePath}/collection/the-plates.html">See the plates</a>
      </p>
      <p class="hero-meta">Facts on this site were last checked against <a href="${facts.productFactsEndpoint}" rel="noopener">the live product contract</a> on <time datetime="${esc(facts.verifiedAt)}">${esc(facts.verifiedAt)}</time>.</p>
    </div>
    <figure class="hero-plate">
      <div class="matte"><img src="${basePath}/assets/plates/${esc(lead.file)}" width="1000" height="1000" fetchpriority="high" decoding="async" alt="${esc(plateAlt(lead))}"></div>
      <figcaption>Edition ${lead.edition}, the first Feline served. ${group(lead.bytes)} bytes of SVG, inscribed whole.</figcaption>
    </figure>
  </section>

  <section class="home-band" aria-labelledby="home-facts">
    <h2 id="home-facts">The facts, before anything else</h2>
    <div class="tableframe" tabindex="0" role="region" aria-label="Product facts"><table class="factsheet"><tbody>
      ${quick.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${v}</td></tr>`).join("")}
    </tbody></table></div>
    <p class="reading-note">Every figure here is validated in this repository against <code>${esc(facts.schemaVersion)}</code>. If any page disagrees with <a href="${basePath}/reference/official-product-facts.html">Official product facts</a>, that page is wrong.</p>
  </section>

  <section class="home-band" aria-labelledby="home-doors">
    <h2 id="home-doors">Which door is yours</h2>
    <ul class="doors">
      ${entry.map(([who, title, href, blurb]) => `<li><a href="${basePath}/${href}"><span class="door-who">${esc(who)}</span><strong>${esc(title)}</strong><span class="door-blurb">${esc(blurb)}</span></a></li>`).join("")}
    </ul>
  </section>

  <section class="home-band" aria-labelledby="home-what">
    <h2 id="home-what">What this documentation is</h2>
    <div class="prose-columns">
      <div>
        <h3>For collectors, not for a pitch</h3>
        <p>This site explains how to mint, what every cost pays for, what each order state means, how to check artwork without trusting anyone, and how to tell a real request from a theft in progress. It makes no claim about value, because the product makes none.</p>
        <h3>The jokes have a fence around them</h3>
        <p>Forked Felines is written in the voice of a supper club that does not exist. The voice never touches an amount, an address, a block height, an order state, or an instruction about signing. Those are printed straight. See <a href="${basePath}/safety/stay-safe.html">Stay safe</a>.</p>
      </div>
      <div>
        <h3>Where the facts come from</h3>
        <p>Product numbers are pinned in this repository and checked in CI against the live <code>/api/v1/product</code> contract. The plates, the trait catalogue and the odds tables are read from the public collection endpoint and carry the date they were read.</p>
        <h3>What is deliberately absent</h3>
        <p>No rarity rank, no floor price, no marketplace, no analytics, no cookies, and no wallet connection anywhere on this documentation site. The <a href="${basePath}/reference/public-api.html">Public API</a> page lists only endpoints that answered when they were checked.</p>
      </div>
    </div>
  </section>

  <section class="home-band" aria-labelledby="home-rooms">
    <h2 id="home-rooms">Every room in the house</h2>
    <div class="room-grid">
      ${NAV.map((section) => `<section class="room"><h3>${esc(section.title)}</h3><ul>${section.pages.map(([src, title]) => `<li><a href="${hrefFor(src)}">${esc(title)}</a></li>`).join("")}</ul></section>`).join("")}
    </div>
  </section>

  <footer class="home-foot">
    <div>
      <h2>Official links</h2>
      <ul>
        <li><a href="${productUrl}" rel="noopener">Live product</a></li>
        <li><a href="${productUrl}/status" rel="noopener">House status</a></li>
        <li><a href="${productUrl}/support" rel="noopener">Support, inside the app</a></li>
        <li><a href="${basePath}/changes/changelog.html">Changelog</a></li>
      </ul>
    </div>
    <div>
      <h2>This repository</h2>
      <ul>
        <li><a href="${repoUrl}" rel="noopener">Source on GitHub</a></li>
        <li><a href="${repoUrl}/blob/main/CONTRIBUTING.md" rel="noopener">Contributing</a></li>
        <li><a href="${repoUrl}/security/advisories/new" rel="noopener">Report a vulnerability privately</a></li>
        <li><a href="${basePath}/docs.manifest.json">Documentation manifest</a></li>
      </ul>
    </div>
    <div>
      <h2>Elsewhere</h2>
      <ul>
        <li><a href="${platformUrl}" rel="noopener">Bitcoin Universe documentation</a></li>
        <li><a href="${basePath}/llms.txt">llms.txt</a></li>
        <li><a href="${basePath}/sitemap.xml">Sitemap</a></li>
      </ul>
      <p class="marginalia">Anything not listed above is not official. Staff will never DM first.</p>
    </div>
  </footer>
</main>`;

  return shell({
    title: "Forked Felines House Manual",
    description: `Official documentation for Forked Felines: up to ${group(facts.maximumSupply)} hand-drawn felines inscribed whole on Bitcoin. Minting, costs, order states, provenance, and safety.`,
    canonical: `${siteOrigin}/`,
    bodyClass: "is-home",
    head: `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org", "@type": "WebSite",
      name: "Forked Felines House Manual", url: siteOrigin,
      description: "Official documentation for the Forked Felines collection.",
      publisher: { "@type": "Organization", name: "Bitcoin Universe", url: platformUrl },
    })}</script>\n`,
    content,
  });
}

/* ------------------------------------------------------------------ build */

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
flat.forEach((page, index) => renderPage(page, index));
writeFileSync(join(out, "index.html"), homepage());
searchIndex.unshift({
  title: "Forked Felines House Manual", section: "Start here", href: `${basePath}/`,
  text: "Official documentation for Forked Felines. Supply, prices, fees, minting, order states, wallets, provenance, artwork verification, safety and support.",
});

cpSync(join(root, "site", "assets"), join(out, "assets"), { recursive: true });
/* Diagrams and plates live beside the Markdown so GitHub renders them too;
   the site serves them from the assets path the pages already resolve to. */
cpSync(join(root, "docs", "assets"), join(out, "assets"), { recursive: true });
copyFileSync(join(root, "docs.manifest.json"), join(out, "docs.manifest.json"));
copyFileSync(join(root, "facts", "facts.json"), join(out, "facts.json"));
copyFileSync(join(root, "facts", "collection-observed.json"), join(out, "collection-observed.json"));
writeFileSync(join(out, "assets", "search-index.json"), JSON.stringify(searchIndex));

writeFileSync(join(out, "404.html"), shell({
  title: "Page not found · Forked Felines House Manual",
  description: "That page does not exist. The feline shows no remorse.",
  canonical: `${siteOrigin}/404.html`,
  bodyClass: "lost",
  head: '<meta name="robots" content="noindex">\n',
  content: `${header(null)}
<main id="manual-content" class="page notfound">
  <p class="plaque">Error 404</p>
  <h1>The cat knocked this page off the table.</h1>
  <p>That page does not exist. The feline shows no remorse.</p>
  <p class="hero-actions"><a class="button-primary" href="${basePath}/">Back to the manual</a>
  <a class="button-quiet" href="${basePath}/contents.html">Full contents</a></p>
  <p class="reading-note">Looking for something specific? Press <kbd>/</kbd> to search, or start at <a href="${basePath}/start-here/what-is-forked-felines.html">What is Forked Felines?</a></p>
</main>`,
}));

/* sitemap, robots, llms.txt */
const lastmod = facts.verifiedAt;
const urls = [`<url><loc>${siteOrigin}/</loc><lastmod>${lastmod}</lastmod><priority>1.0</priority></url>`]
  .concat(flat.map((page) => `<url><loc>${urlFor(page.src)}</loc><lastmod>${lastmod}</lastmod></url>`)).join("");
writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`);
writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`);

const llms = [
  "# Forked Felines House Manual",
  "",
  `> Official documentation for Forked Felines, the KNOT HEADS companion collection: up to ${group(facts.maximumSupply)} hand-drawn felines, each a deterministic SVG inscribed whole on Bitcoin mainnet. Public collection price ${group(facts.publicMintPriceSats)} sats; ${facts.communityMintPriceSats} sats with a Knot Heads free-mint credit from the fixed block ${group(facts.holderSnapshotBlockHeight)} snapshot; flat ${group(facts.baseServiceFeeSats)}-sat service fee; Bitcoin network and delivery costs itemized separately and payable on every mint.`,
  "",
  `Facts here are pinned in ${repoUrl} and checked against ${facts.productFactsEndpoint} (schema ${facts.schemaVersion}). Last verified ${facts.verifiedAt}. Forked Felines is a collectible, not an investment, and this documentation makes no claim about value. There is no marketplace, no rarity rank, and no floor price.`,
  "",
  ...NAV.map((section) => [
    `## ${section.title}`,
    "",
    ...section.pages.map(([src, title]) => `- [${title}](${urlFor(src)})`),
    "",
  ].join("\n")),
  "## Machine-readable",
  "",
  `- [Documentation manifest](${siteOrigin}/docs.manifest.json): the Bitcoin Universe docs manifest for this repository`,
  `- [Pinned product facts](${siteOrigin}/facts.json): the numbers this documentation is validated against`,
  `- [Observed collection census](${siteOrigin}/collection-observed.json): trait vocabulary, rarity tiers and plate digests read from the public collection endpoint on ${observed.observedAt.slice(0, 10)}`,
  `- [Sitemap](${siteOrigin}/sitemap.xml)`,
  "",
  "## Live product endpoints that answer",
  "",
  `- ${productUrl}/api/v1/product: product facts contract`,
  `- ${productUrl}/api/v1/mint/capacity: whether the house is safe to accept orders, and why not when it is not`,
  `- ${productUrl}/api/v1/collection: every confirmed Feline with traits and frozen odds`,
  `- ${productUrl}/api/v1/inscriptions/{inscriptionId}/content: verified artwork bytes, with an x-content-sha256 header`,
  `- ${productUrl}/api/v1/block: the house block clock`,
  `- ${productUrl}/api/v1/fees: live fee-rate recommendations`,
  "",
].join("\n");
writeFileSync(join(out, "llms.txt"), llms);
writeFileSync(join(out, ".nojekyll"), "");

/* Self-check: no .md link may survive into the site except a GitHub one, and
   every asset a page references must actually be in the output. */
const { readdirSync } = await import("node:fs");
const problems = [];
const pages = [];
const scan = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) scan(full);
    else if (name.endsWith(".html")) pages.push(full);
  }
};
scan(out);
for (const file of pages) {
  const html = readFileSync(file, "utf8");
  for (const [, href] of html.matchAll(/href="([^"]+\.md(?:#[^"]*)?)"/g)) {
    if (!href.startsWith("https://github.com/")) problems.push(`${file}: unrewritten .md link ${href}`);
  }
  for (const [, ref] of html.matchAll(/(?:src|href)="(\/[^"#?]*\.(?:svg|png|css|js|json|txt|xml))"/g)) {
    const asset = join(out, ref.slice(basePath.length || 0).replace(/^\//, ""));
    try { statSync(asset); } catch { problems.push(`${file}: missing asset ${ref}`); }
  }
  if (!/<h1[ >]/.test(html)) problems.push(`${file}: no h1`);
}
if (problems.length) {
  console.error(`build self-check: ${problems.length} problem(s)`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`House Manual built: ${flat.length + 1} pages, ${observed.plates.length} plates -> _site/ (source ${sourceSha.slice(0, 12)})`);
