/* The House Manual, enhanced.
   Everything here is an addition to a page that already works without it:
   search, the theme switch, the rooms drawer, copy buttons, the two explorer
   filters, and the digest checker. No page depends on this file to be read,
   and nothing in it talks to any server but this one. */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var base = (doc.currentScript && doc.currentScript.src ? new URL(doc.currentScript.src).pathname : "")
    .replace(/\/assets\/manual\.js.*$/, "");

  function $(selector, scope) { return (scope || doc).querySelector(selector); }
  function $$(selector, scope) { return Array.prototype.slice.call((scope || doc).querySelectorAll(selector)); }

  /* ------------------------------------------------------------- theme */

  var themeButton = $(".theme-toggle");
  if (themeButton) {
    var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    var label = $(".theme-label", themeButton);
    var paint = function () {
      var dark = root.dataset.theme === "dark" || (!root.dataset.theme && media && media.matches);
      themeButton.setAttribute("aria-pressed", dark ? "true" : "false");
      if (label) label.textContent = dark ? "Daylight" : "After hours";
      themeButton.title = dark ? "Switch to the daylight reading room" : "Switch to the after-hours reading room";
    };
    themeButton.addEventListener("click", function () {
      var dark = root.dataset.theme === "dark" || (!root.dataset.theme && media && media.matches);
      root.dataset.theme = dark ? "light" : "dark";
      try { localStorage.setItem("house-theme", root.dataset.theme); } catch (e) { /* storage refused */ }
      paint();
    });
    if (media && media.addEventListener) media.addEventListener("change", paint);
    paint();
  }

  /* ------------------------------------------------------------ drawer */

  var drawer = $(".drawer-toggle");
  var rooms = $("#rooms");
  if (drawer && rooms) {
    drawer.addEventListener("click", function () {
      var open = rooms.classList.toggle("open");
      drawer.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* -------------------------------------------------------------- copy */

  $$(".codeframe .copy").forEach(function (button) {
    button.addEventListener("click", function () {
      var code = $("code", button.parentNode);
      if (!code || !navigator.clipboard) return;
      navigator.clipboard.writeText(code.textContent).then(function () {
        button.dataset.done = "1";
        button.firstChild.nodeValue = "Copied";
        setTimeout(function () { delete button.dataset.done; button.firstChild.nodeValue = "Copy"; }, 1600);
      }, function () { /* the reader can still select the text */ });
    });
  });

  /* ------------------------------------------------- on-page contents */

  var tocLinks = $$(".toc a");
  if (tocLinks.length && window.IntersectionObserver) {
    var byId = {};
    tocLinks.forEach(function (link) { byId[link.getAttribute("href").slice(1)] = link; });
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (link && entry.isIntersecting) {
          tocLinks.forEach(function (other) { other.removeAttribute("aria-current"); });
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-10% 0px -75% 0px" });
    Object.keys(byId).forEach(function (id) { var target = doc.getElementById(id); if (target) seen.observe(target); });
  }

  /* ------------------------------------------------------------ search */

  var veil = $(".search-veil");
  var opener = $(".search-open");
  if (veil && opener) {
    var input = $(".search-input", veil);
    var results = $(".search-results", veil);
    var index = null;
    var loading = false;
    var restoreTo = null;

    var load = function () {
      if (index || loading) return;
      loading = true;
      fetch(base + "/assets/search-index.json").then(function (r) { return r.json(); }).then(function (data) {
        index = data;
        loading = false;
        if (!veil.hidden) render(input.value);
      }, function () { loading = false; });
    };

    var snippet = function (text, terms) {
      var lower = text.toLowerCase();
      var at = -1;
      for (var i = 0; i < terms.length && at < 0; i++) at = lower.indexOf(terms[i]);
      if (at < 0) at = 0;
      var from = Math.max(0, at - 60);
      return (from > 0 ? "..." : "") + text.slice(from, from + 170).trim() + "...";
    };

    var count = $(".search-count", veil);
    var announce = function (text, expanded) {
      if (count) count.textContent = text;
      input.setAttribute("aria-expanded", expanded ? "true" : "false");
      if (!expanded) input.removeAttribute("aria-activedescendant");
    };

    var render = function (query) {
      var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      results.innerHTML = "";
      if (!terms.length) {
        results.innerHTML = '<li class="search-empty">Try a wallet name, a cost, an order state, or a trait.</li>';
        announce("", false);
        return;
      }
      if (!index) {
        results.innerHTML = '<li class="search-empty">Loading the index.</li>';
        announce("Loading the index.", false);
        return;
      }
      var hits = index.map(function (page) {
        var haystack = (page.title + " " + page.section + " " + page.text).toLowerCase();
        var score = 0;
        for (var i = 0; i < terms.length; i++) {
          if (haystack.indexOf(terms[i]) < 0) return null;
          if (page.title.toLowerCase().indexOf(terms[i]) >= 0) score += 12;
          if (page.section.toLowerCase().indexOf(terms[i]) >= 0) score += 4;
          score += 1;
        }
        return { page: page, score: score };
      }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 12);

      if (!hits.length) {
        results.innerHTML = '<li class="search-empty">Nothing in the manual matches that.' +
          '<ul><li>Search finds whole words, so try a shorter one.</li>' +
          '<li>Order states are written like <code>PAYMENT_CONFIRMED</code> and read like BILL SETTLED.</li>' +
          '<li>Still stuck? The <a href="' + base + '/help/getting-support.html">support desk</a> reads your order\'s real state.</li></ul></li>';
        announce("No pages match that.", false);
        return;
      }
      hits.forEach(function (hit, position) {
        var item = doc.createElement("li");
        item.setAttribute("role", "option");
        item.id = "search-hit-" + position;
        if (position === 0) {
          item.setAttribute("aria-selected", "true");
          input.setAttribute("aria-activedescendant", item.id);
        } else {
          item.setAttribute("aria-selected", "false");
        }
        var link = doc.createElement("a");
        link.href = hit.page.href;
        link.innerHTML = '<span class="hit-section"></span><span class="hit-title"></span><span class="hit-snippet"></span>';
        $(".hit-section", link).textContent = hit.page.section;
        $(".hit-title", link).textContent = hit.page.title;
        $(".hit-snippet", link).textContent = snippet(hit.page.text, terms);
        item.appendChild(link);
        results.appendChild(item);
      });
      announce(hits.length + " page" + (hits.length === 1 ? "" : "s") + " match.", true);
    };

    var open = function () {
      restoreTo = doc.activeElement;
      veil.hidden = false;
      load();
      render(input.value);
      input.focus();
      input.select();
    };
    var close = function () {
      veil.hidden = true;
      if (restoreTo && restoreTo.focus) restoreTo.focus();
    };

    opener.addEventListener("click", open);
    opener.addEventListener("mouseenter", load);
    input.addEventListener("input", function () { render(input.value); });
    veil.addEventListener("click", function (event) { if (event.target === veil) close(); });

    var move = function (step) {
      var items = $$("li[role='option']", results);
      if (!items.length) return;
      var at = items.findIndex(function (item) { return item.getAttribute("aria-selected") === "true"; });
      items.forEach(function (item) { item.setAttribute("aria-selected", "false"); });
      var next = (at + step + items.length) % items.length;
      items[next].setAttribute("aria-selected", "true");
      input.setAttribute("aria-activedescendant", items[next].id);
      items[next].scrollIntoView({ block: "nearest" });
    };

    doc.addEventListener("keydown", function (event) {
      if (event.key === "/" && veil.hidden && !/^(INPUT|TEXTAREA|SELECT)$/.test(doc.activeElement.tagName)) {
        event.preventDefault(); open(); return;
      }
      if (veil.hidden) return;
      if (event.key === "Escape") { event.preventDefault(); close(); }
      else if (event.key === "ArrowDown") { event.preventDefault(); move(1); }
      else if (event.key === "ArrowUp") { event.preventDefault(); move(-1); }
      /* Focus never leaves the input while the dialog is open, so Tab has
         nothing to move to. It closes instead of stranding a keyboard reader
         behind a modal veil. */
      else if (event.key === "Tab") { event.preventDefault(); close(); }
      else if (event.key === "Enter") {
        var chosen = $("li[aria-selected='true'] a", results);
        if (chosen) { event.preventDefault(); window.location.href = chosen.href; }
      }
    });
  }

  /* --------------------------------------------------- trait explorer */

  var traitFilter = $("[data-trait-filter]");
  if (traitFilter) {
    var status = $("[data-trait-status]");
    var baseline = status ? status.textContent : "";
    var cards = $$("[data-trait-card]");
    traitFilter.addEventListener("input", function () {
      var query = traitFilter.value.trim().toLowerCase();
      var shownValues = 0;
      var shownCards = 0;
      cards.forEach(function (card) {
        var category = card.dataset.category.toLowerCase();
        var categoryHit = query && category.indexOf(query) >= 0;
        var any = false;
        $$("[data-trait-value]", card).forEach(function (row) {
          var value = $(".value", row).textContent.toLowerCase();
          var hit = !query || categoryHit || value.indexOf(query) >= 0;
          row.hidden = !hit;
          if (hit) { any = true; shownValues += 1; }
        });
        card.hidden = !any;
        if (any) shownCards += 1;
      });
      if (!status) return;
      status.textContent = query
        ? shownValues + " value" + (shownValues === 1 ? "" : "s") + " in " + shownCards + " trait" + (shownCards === 1 ? "" : "s") + " match “" + traitFilter.value.trim() + "”."
        : baseline;
    });
  }

  /* --------------------------------------------------- digest checker */

  var checker = $("[data-checker]");
  if (checker && window.crypto && window.crypto.subtle) {
    var body = $("[data-checker-body]", checker);
    body.hidden = false;
    var out = $("[data-checker-out]", checker);
    var expected = $("[data-checker-expected]", checker);
    var fileInput = $("[data-checker-file]", checker);
    var plateSelect = $("[data-checker-plate]", checker);
    var fetchButton = $("[data-checker-fetch]", checker);
    var last = null;

    var hex = function (buffer) {
      return Array.prototype.map.call(new Uint8Array(buffer), function (byte) {
        return ("0" + byte.toString(16)).slice(-2);
      }).join("");
    };

    var report = function () {
      if (!last) { out.textContent = "Nothing hashed yet."; out.removeAttribute("data-state"); return; }
      var lines = [
        "Source:  " + last.name,
        "Bytes:   " + last.bytes.toLocaleString("en-US"),
        "SHA-256: " + last.digest,
      ];
      var want = expected.value.trim().toLowerCase().replace(/[^0-9a-f]/g, "");
      if (!want) {
        lines.push("", "Paste a digest above to compare.");
        out.removeAttribute("data-state");
      } else if (want.length !== 64) {
        lines.push("", "That is " + want.length + " hexadecimal characters. A SHA-256 digest is 64.");
        out.removeAttribute("data-state");
      } else if (want === last.digest) {
        lines.push("", "MATCH. These bytes are exactly the bytes that digest commits to.");
        out.setAttribute("data-state", "match");
      } else {
        lines.push("", "DIFFERENT. These bytes are not the bytes that digest commits to.",
          "Re-download without any transformation before concluding anything: an editor that adds a newline changes the digest.");
        out.setAttribute("data-state", "differ");
      }
      out.textContent = lines.join("\n");
    };

    var hash = function (buffer, name) {
      return window.crypto.subtle.digest("SHA-256", buffer).then(function (digest) {
        last = { name: name, bytes: buffer.byteLength, digest: hex(digest) };
        report();
      });
    };

    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      out.textContent = "Hashing " + file.name + "...";
      file.arrayBuffer().then(function (buffer) { return hash(buffer, file.name); }).catch(function () {
        out.textContent = "That file could not be read in this browser.";
      });
    });

    fetchButton.addEventListener("click", function () {
      var option = plateSelect.options[plateSelect.selectedIndex];
      out.textContent = "Fetching " + option.textContent + "...";
      fetch(option.value).then(function (response) {
        if (!response.ok) throw new Error("fetch failed");
        return response.arrayBuffer();
      }).then(function (buffer) {
        if (!expected.value.trim()) expected.value = option.dataset.sha;
        return hash(buffer, option.textContent + " as served by this page");
      }).catch(function () {
        out.textContent = "That plate could not be fetched. Reload the page and try again.";
      });
    });

    expected.addEventListener("input", report);
  }
})();
