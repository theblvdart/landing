/**
 * THE BLVD — shared site behaviour
 * Content lives in /content/*.json, edited either by hand or via the
 * Decap CMS admin panel at /admin. No build step, no framework.
 */
(function(){

  async function loadContent(){
    const [radar, journal, site, pages] = await Promise.all([
      fetch("content/radar.json").then(r => r.json()),
      fetch("content/journal.json").then(r => r.json()),
      fetch("content/site.json").then(r => r.json()),
      fetch("content/pages.json").then(r => r.json())
    ]);
    return { radar: radar.items, journal: journal.items, site, pages };
  }

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function formatDate(iso){
    const d = new Date(iso + "T00:00:00");
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  function statusClass(status){
    return {
      "Watching": "status-watching",
      "Available": "status-available",
      "Sourced": "status-sourced",
      "Enquire": "status-enquire"
    }[status] || "status-watching";
  }

  function ph(item, opts){
    opts = opts || {};
    const letter = (item.artist || item.title || item.name || "?").trim()[0].toUpperCase();
    const tag = item.category || "";
    const extra = opts.cls ? " " + opts.cls : "";
    if(item.image){
      return `<img src="${item.image}" alt="${item.name || item.title || ''}" class="ph${extra}" style="object-fit:cover;" />`;
    }
    return `<div class="ph${extra}" data-letter="${letter}" data-tag="${tag}"></div>`;
  }

  function radarCardHTML(item){
    return `
      <a class="card" href="radar.html#${item.slug}">
        ${ph(item)}
        <div class="card-meta">
          <span class="tag">${item.category}</span>
          <span class="status ${statusClass(item.status)}">${item.status}</span>
        </div>
        <h3>${item.name}</h3>
        <p>${item.excerpt}</p>
        <div class="card-link"><span>View entry \u2192</span></div>
      </a>`;
  }

  function journalCardHTML(article){
    return `
      <a class="card" href="article.html?slug=${article.slug}">
        ${ph(article, {cls:"wide"})}
        <div class="card-meta">
          <span class="tag">${article.category}</span>
          <span class="date mono-num">${formatDate(article.date)}</span>
        </div>
        <h3>${article.title}</h3>
        <p>${article.excerpt}</p>
        <div class="card-link"><span>Read \u2192</span></div>
      </a>`;
  }

  function articleRowHTML(article){
    return `
      <a class="article-row" href="article.html?slug=${article.slug}">
        <span class="date mono-num">${formatDate(article.date)}</span>
        <div>
          <span class="tag">${article.category}</span>
          <h3>${article.title}</h3>
        </div>
        <div class="card-link hide-mobile"><span>Read \u2192</span></div>
      </a>`;
  }

  function articleBodyHTML(text){
    if(!text) return "";
    return text.split(/\n\s*\n/).map(para => `<p>${para.trim()}</p>`).join("");
  }

  function lotHTML(item, index){
    const id = String(index + 1).padStart(3,"0");
    return `
      <article class="lot" id="${item.slug}">
        <div>${ph(item, {cls:"square"})}</div>
        <div>
          <div class="lot-head">
            <div>
              <div class="lot-id">LOT ${id}</div>
              <h2 class="h-2 lot-title">${item.name}</h2>
              <div class="lot-artist">${item.artist}</div>
            </div>
            <span class="status ${statusClass(item.status)}">${item.status}</span>
          </div>
          <p class="lot-excerpt">${item.excerpt}</p>
          <dl class="lot-table">
            <div class="lot-row"><dt>Cultural significance</dt><dd>${item.significance}</dd></div>
            <div class="lot-row"><dt>Why collectors care</dt><dd>${item.whyCollectorsCare}</dd></div>
            <div class="lot-row"><dt>Current relevance</dt><dd>${item.currentRelevance}</dd></div>
            <div class="lot-row"><dt>Category</dt><dd>${item.category}</dd></div>
          </dl>
        </div>
      </article>`;
  }

  function triadItemHTML(item){
    return `
      <div class="triad-item">
        <div class="mono-num">${item.number}</div>
        <h3 class="h-3">${item.title}</h3>
        <p>${item.description}</p>
      </div>`;
  }

  function serviceRowHTML(item){
    return `
      <div class="service-row">
        <div class="tag">${item.tag}</div>
        <div>
          <h2 class="h-2">${item.heading}</h2>
          <p>${item.description}</p>
        </div>
      </div>`;
  }

  function optionsHTML(list){
    return list.map(v => `<option>${v}</option>`).join("");
  }

  function setText(id, value){
    const el = document.getElementById(id);
    if(el && value != null) el.textContent = value;
  }

  function hydrateChrome(site){
    document.querySelectorAll("[data-nav]").forEach(el => {
      const key = el.getAttribute("data-nav");
      if(site.nav && site.nav[key]) el.textContent = site.nav[key];
    });
    document.querySelectorAll("[data-footer]").forEach(el => {
      const key = el.getAttribute("data-footer");
      if(site.footer && site.footer[key]) el.textContent = site.footer[key];
      if(key === "instagram") el.href = site.instagram;
      if(key === "email") el.href = "mailto:" + site.email;
    });
    document.querySelectorAll('[data-bind="site-name"]').forEach(el => el.textContent = site.name);
    document.querySelectorAll('[data-bind="site-tagline"]').forEach(el => el.textContent = site.tagline);
  }

  function initMobileMenu(){
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".mobile-menu");
    if(!toggle || !menu) return;
    const close = menu.querySelector(".mobile-menu-close");
    toggle.addEventListener("click", () => menu.classList.add("open"));
    close && close.addEventListener("click", () => menu.classList.remove("open"));
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => menu.classList.remove("open")));
  }

  function markActiveNav(){
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(a => {
      const href = a.getAttribute("href");
      if(href === path) a.classList.add("active");
    });
  }

  function initHeadlineRotator(el, words, interval){
    if(!el || !words || words.length < 2) return;
    let i = 0;
    el.textContent = words[0];
    setInterval(() => {
      i = (i + 1) % words.length;
      el.style.opacity = 0;
      setTimeout(() => {
        el.textContent = words[i];
        el.style.opacity = 1;
      }, 350);
    }, interval || 3200);
  }

  function initSourceForm(){
    const form = document.getElementById("source-form");
    if(!form) return;
    const success = document.getElementById("form-success");
    const submitBtn = form.querySelector("button[type=submit]");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const originalHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = "Sending\u2026";
      submitBtn.disabled = true;

      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: (() => {
            const fd = new FormData(form);
            fd.append("access_key", "ea8c324b-53c8-4459-a0ef-6f1e815e44d8");
            fd.append("subject", "New sourcing request via THE BLVD");
            return fd;
          })()
        });
        if(res.ok){
          form.reset();
          if(success) success.classList.add("show");
        } else {
          submitBtn.innerHTML = "Something went wrong. Please try again.";
          submitBtn.disabled = false;
        }
      } catch(err){
        submitBtn.innerHTML = "Something went wrong. Please try again.";
        submitBtn.disabled = false;
        setTimeout(() => {
          submitBtn.innerHTML = originalHTML;
        }, 4000);
      }
    });
  }

  function getQueryParam(name){
    return new URLSearchParams(location.search).get(name);
  }

  function scrollToHash(offset){
    if(!location.hash) return;
    const el = document.querySelector(location.hash);
    if(el){
      const y = el.getBoundingClientRect().top + window.scrollY - (offset || 90);
      window.scrollTo({ top: y, behavior: "smooth" });
      el.classList.add("lot-highlight");
      setTimeout(() => el.classList.remove("lot-highlight"), 1600);
    }
  }

  window.BLVD = {
    loadContent,
    formatDate, statusClass, ph,
    radarCardHTML, journalCardHTML, articleRowHTML, lotHTML, articleBodyHTML,
    triadItemHTML, serviceRowHTML, optionsHTML, setText, hydrateChrome, getQueryParam, scrollToHash,
    initMobileMenu, markActiveNav, initHeadlineRotator, initSourceForm
  };

  document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    markActiveNav();
    initSourceForm();
  });

})();
