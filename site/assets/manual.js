/* The House Manual's only running machinery: copy buttons, the rooms drawer,
   after-hours lighting, and the search card. Everything else is ink. */
(() => {
  "use strict";

  /* Copy buttons on every framed code block. */
  for (const button of document.querySelectorAll(".codeframe .copy")) {
    button.addEventListener("click", async () => {
      const code = button.parentElement.querySelector("code");
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.dataset.done = "1";
        button.textContent = "Copied";
        setTimeout(() => { delete button.dataset.done; button.textContent = "Copy"; }, 1600);
      } catch {
        button.textContent = "Select and copy";
      }
    });
  }

  /* The rooms drawer on a phone. */
  const drawerToggle = document.querySelector(".drawer-toggle");
  const rooms = document.getElementById("rooms");
  if (drawerToggle && rooms) {
    drawerToggle.addEventListener("click", () => {
      const open = rooms.classList.toggle("open");
      drawerToggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* After hours. The preference survives the visit; sound never enters it. */
  const hours = document.querySelector(".hours-toggle");
  if (hours) {
    const apply = (after) => {
      document.documentElement.dataset.hours = after ? "after" : "";
      hours.setAttribute("aria-pressed", String(after));
      try { localStorage.setItem("house-hours", after ? "after" : "day"); } catch { /* private room */ }
    };
    hours.setAttribute("aria-pressed", String(document.documentElement.dataset.hours === "after"));
    hours.addEventListener("click", () => apply(document.documentElement.dataset.hours !== "after"));
  }

  /* Search: a prebuilt index, filtered in the reader's own browser. */
  const veil = document.querySelector(".search-veil");
  const input = document.querySelector(".search-input");
  const results = document.querySelector(".search-results");
  const opener = document.querySelector(".search-open");
  if (!veil || !input || !results) return;
  let index = null;
  let selected = -1;
  let lastFocus = null;

  const baseHref = document.querySelector('link[rel="stylesheet"]').getAttribute("href").replace(/assets\/manual\.css$/, "");

  async function ensureIndex() {
    if (index) return index;
    const response = await fetch(`${baseHref}assets/search-index.json`);
    index = await response.json();
    return index;
  }

  function openSearch() {
    lastFocus = document.activeElement;
    veil.hidden = false;
    input.value = "";
    results.innerHTML = "";
    selected = -1;
    input.focus();
    ensureIndex();
  }
  function closeSearch() {
    veil.hidden = true;
    if (lastFocus) lastFocus.focus();
  }

  function snippet(text, term) {
    const at = text.toLowerCase().indexOf(term);
    if (at < 0) return text.slice(0, 110);
    const start = Math.max(0, at - 40);
    return (start > 0 ? "..." : "") + text.slice(start, at + term.length + 70);
  }

  function render(hits, term) {
    results.innerHTML = "";
    selected = -1;
    for (const hit of hits.slice(0, 12)) {
      const item = document.createElement("li");
      item.setAttribute("role", "option");
      const link = document.createElement("a");
      link.href = hit.href;
      const section = document.createElement("span");
      section.className = "hit-section";
      section.textContent = hit.section;
      const title = document.createElement("strong");
      title.textContent = hit.title;
      const snip = document.createElement("span");
      snip.className = "hit-snippet";
      snip.textContent = snippet(hit.text, term);
      link.append(section, title, snip);
      item.append(link);
      results.append(item);
    }
    if (!hits.length && term) {
      const item = document.createElement("li");
      item.className = "hit-snippet";
      item.style.padding = ".5rem .6rem";
      item.textContent = "Nothing on the menu by that name.";
      results.append(item);
    }
  }

  input.addEventListener("input", async () => {
    const term = input.value.trim().toLowerCase();
    if (!term) { results.innerHTML = ""; return; }
    const pages = await ensureIndex();
    const scored = pages
      .map((page) => {
        const inTitle = page.title.toLowerCase().includes(term) ? 2 : 0;
        const inText = page.text.toLowerCase().includes(term) ? 1 : 0;
        return { page, score: inTitle + inText };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.page);
    render(scored, term);
  });

  function move(delta) {
    const items = results.querySelectorAll("li");
    if (!items.length) return;
    selected = (selected + delta + items.length) % items.length;
    items.forEach((item, i) => item.setAttribute("aria-selected", String(i === selected)));
    items[selected].scrollIntoView({ block: "nearest" });
  }

  document.addEventListener("keydown", (event) => {
    if (!veil.hidden) {
      if (event.key === "Escape") { event.preventDefault(); closeSearch(); }
      if (event.key === "ArrowDown") { event.preventDefault(); move(1); }
      if (event.key === "ArrowUp") { event.preventDefault(); move(-1); }
      if (event.key === "Enter" && selected >= 0) {
        const link = results.querySelectorAll("li a")[selected];
        if (link) { event.preventDefault(); link.click(); }
      }
      /* Keep focus inside the card. */
      if (event.key === "Tab") { event.preventDefault(); input.focus(); }
      return;
    }
    const typing = /^(input|textarea|select)$/i.test(document.activeElement?.tagName ?? "");
    if (!typing && (event.key === "/" || (event.key === "k" && (event.ctrlKey || event.metaKey)))) {
      event.preventDefault();
      openSearch();
    }
  });

  opener?.addEventListener("click", openSearch);
  veil.addEventListener("click", (event) => { if (event.target === veil) closeSearch(); });
})();
