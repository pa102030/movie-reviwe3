/* MOVIES WORLD - shared UI: cards, header, search overlay, modals, toasts, watchlist */
"use strict";

/* ---------- storage: watchlist & favorites ---------- */
const MWStore = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  inWatchlist(id) { return MWStore.get("mw_watchlist").includes(+id); },
  inFavorites(id) { return MWStore.get("mw_favorites").includes(+id); },
  toggle(key, id) {
    let list = MWStore.get(key);
    id = +id;
    const had = list.includes(id);
    list = had ? list.filter(x => x !== id) : [...list, id];
    MWStore.set(key, list);
    return !had;
  }
};

/* ---------- toast ---------- */
function toast(msg, icon = "fa-circle-check") {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.innerHTML = `<i class="fa-solid ${icon}"></i><span></span>`;
  el.querySelector("span").textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 320); }, 2600);
}

/* ---------- poster (real image or premium placeholder) ---------- */
const PH_GRADIENTS = [
  ["#1a2a6c", "#b21f1f", "#fdbb2d"], ["#0f0c29", "#302b63", "#24243e"],
  ["#642b73", "#c6426e"], ["#141e30", "#243b55"], ["#000428", "#004e92"],
  ["#232526", "#414345"], ["#41295a", "#2f0743"], ["#1f1c2c", "#928dab"]
];
function posterHTML(m, cls = "") {
  if (m.poster) return `<img src="${m.poster}" alt="${esc(m.title)} movie poster" loading="lazy" onerror="this.parentNode.innerHTML=window.__ph(${JSON.stringify(m).replace(/"/g,'&quot;')})">`;
  return window.__ph(m);
}
window.__ph = function (m) {
  const g = PH_GRADIENTS[(m.id || 0) % PH_GRADIENTS.length];
  const genres = (m.genres || []).join(" · ");
  return `<div class="poster-ph" style="background:linear-gradient(160deg,${g[0]},${g[1]}${g[2] ? "," + g[2] : ""})" role="img" aria-label="${esc(m.title)} poster">
    <span class="ph-letter">${esc((m.title || "?")[0])}</span>
    <span class="ph-title">${esc(m.title)}</span>
    <span class="ph-year">${m.year || ""}${genres ? " · " + esc(genres) : ""}</span></div>`;
};
function esc(s) { const d = document.createElement("div"); d.textContent = s == null ? "" : s; return d.innerHTML; }

/* ---------- movie card ---------- */
function movieCard(m) {
  const inW = MWStore.inWatchlist(m.id), inF = MWStore.inFavorites(m.id);
  const el = document.createElement("article");
  el.className = "movie-card";
  el.innerHTML = `
    <a href="movie.html?id=${m.id}" class="poster-wrap" aria-label="View details for ${esc(m.title)}">
      ${m.rating >= 7.5 ? '<span class="badge-hd">4K</span>' : '<span class="badge-hd">HD</span>'}
      <span class="badge-rate"><i class="fa-solid fa-star"></i>${m.rating ? m.rating.toFixed(1) : "—"}</span>
      ${posterHTML(m)}
    </a>
    <div class="card-actions">
      <button class="mini-btn ${inW ? "active" : ""}" data-watchlist="${m.id}" title="Add to watchlist" aria-label="Toggle watchlist"><i class="fa-solid fa-plus"></i></button>
      <button class="mini-btn ${inF ? "active" : ""}" data-fav="${m.id}" title="Favorite" aria-label="Toggle favorite"><i class="fa-solid fa-heart"></i></button>
    </div>
    <div class="card-hover">
      <h4>${esc(m.title)}</h4>
      <p>${esc((m.genres || []).slice(0, 2).join(" · "))} · ${m.year || ""} · <i class="fa-solid fa-star" style="color:var(--gold)"></i> ${m.rating ? m.rating.toFixed(1) : "—"}</p>
      <div class="ch-btns">
        <a href="movie.html?id=${m.id}"><i class="fa-solid fa-eye"></i> Details</a>
        <button data-trailer="${m.id}"><i class="fa-solid fa-play"></i> Trailer</button>
        <a href="movie.html?id=${m.id}#watch"><i class="fa-solid fa-ticket"></i> Watch</a>
      </div>
    </div>
    <div class="card-info">
      <h3>${esc(m.title)}</h3>
      <div class="ci-meta"><span class="g">${esc((m.genres || []).slice(0, 2).join(" · "))}</span><span class="r"><i class="fa-solid fa-star"></i> ${m.rating ? m.rating.toFixed(1) : "—"}</span></div>
    </div>`;
  return el;
}

function bindCardButtons(scope = document) {
  scope.querySelectorAll("[data-watchlist]").forEach(btn => btn.addEventListener("click", e => {
    e.preventDefault(); e.stopPropagation();
    const added = MWStore.toggle("mw_watchlist", btn.dataset.watchlist);
    btn.classList.toggle("active", added);
    toast(added ? "Added to your watchlist" : "Removed from watchlist", added ? "fa-circle-check" : "fa-circle-minus");
    document.dispatchEvent(new CustomEvent("mw:watchlist-changed"));
  }));
  scope.querySelectorAll("[data-fav]").forEach(btn => btn.addEventListener("click", e => {
    e.preventDefault(); e.stopPropagation();
    const added = MWStore.toggle("mw_favorites", btn.dataset.fav);
    btn.classList.toggle("active", added);
    toast(added ? "Added to favorites" : "Removed from favorites", "fa-heart");
  }));
  scope.querySelectorAll("[data-trailer]").forEach(btn => btn.addEventListener("click", async e => {
    e.preventDefault(); e.stopPropagation();
    openTrailer(btn.dataset.trailer);
  }));
}

function renderGrid(container, list) {
  container.innerHTML = "";
  if (!list.length) return;
  list.forEach(m => container.appendChild(movieCard(m)));
  bindCardButtons(container);
}

function skeletons(container, n = 12) {
  container.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const d = document.createElement("div");
    d.className = "skeleton-card";
    d.innerHTML = `<div class="sk sk-poster"></div><div class="sk sk-line"></div><div class="sk sk-line w60"></div>`;
    container.appendChild(d);
  }
}

/* ---------- section row (horizontal scroll) ---------- */
async function renderRow({ title, link, container, fetcher }) {
  const sec = document.createElement("section");
  sec.className = "section";
  sec.innerHTML = `
    <div class="section-head">
      <h2 class="section-title">${esc(title)}</h2>
      ${link ? `<a class="section-link" href="${link}">View all <i class="fa-solid fa-arrow-right"></i></a>` : ""}
    </div>
    <div class="mrow" role="list"></div>`;
  container.appendChild(sec);
  const row = sec.querySelector(".mrow");
  for (let i = 0; i < 8; i++) {
    const sk = document.createElement("div");
    sk.className = "skeleton-card"; sk.style.flex = "0 0 200px";
    sk.innerHTML = `<div class="sk sk-poster"></div><div class="sk sk-line"></div>`;
    row.appendChild(sk);
  }
  try {
    const movies = await fetcher();
    row.innerHTML = "";
    movies.filter(Boolean).forEach(m => row.appendChild(movieCard(m)));
    bindCardButtons(row);
  } catch (e) {
    row.innerHTML = `<p style="padding:20px;color:var(--text-2)"><i class="fa-solid fa-triangle-exclamation"></i> Unable to load movies right now. Please try again.</p>`;
  }
}

/* ---------- trailer modal ---------- */
async function openTrailer(id, title) {
  let url = null;
  try {
    const m = await MW_API.getMovie(id);
    url = m.trailer || (MW_API.isDemo() ? null : await MW_API.getTrailer(id));
    title = title || m.title;
  } catch (e) { /* fallthrough */ }
  if (!url) { toast("Trailer is currently unavailable", "fa-circle-info"); return; }
  const bd = document.createElement("div");
  bd.className = "modal-backdrop";
  bd.setAttribute("role", "dialog"); bd.setAttribute("aria-modal", "true"); bd.setAttribute("aria-label", "Trailer");
  bd.innerHTML = `<div class="modal">
      <div class="modal-head"><h3><i class="fa-solid fa-clapperboard" style="color:var(--accent-2)"></i> ${esc(title)} — Official Trailer</h3>
      <button class="modal-close" aria-label="Close trailer"><i class="fa-solid fa-xmark"></i></button></div>
      <iframe class="trailer-frame" src="${url}" title="${esc(title)} trailer" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
    </div>`;
  document.body.appendChild(bd);
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => bd.classList.add("open"));
  const close = () => { bd.classList.remove("open"); document.body.style.overflow = ""; setTimeout(() => bd.remove(), 320); };
  bd.querySelector(".modal-close").addEventListener("click", close);
  bd.addEventListener("click", e => { if (e.target === bd) close(); });
  document.addEventListener("keydown", function esc_(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc_); } });
}

/* ---------- search overlay ---------- */
function initSearch() {
  const overlay = document.createElement("div");
  overlay.className = "search-overlay";
  overlay.setAttribute("role", "dialog"); overlay.setAttribute("aria-label", "Search movies");
  overlay.innerHTML = `
    <div class="search-box">
      <input type="search" placeholder="Search movies, actors, directors, genres, years..." aria-label="Search movies" autocomplete="off">
      <i class="fa-solid fa-magnifying-glass"></i>
    </div>
    <p class="search-hint">Try “Avengers”, “Nolan”, “horror” or “2019” — press ESC to close</p>
    <div class="search-results" aria-live="polite"></div>`;
  document.body.appendChild(overlay);
  const input = overlay.querySelector("input");
  const results = overlay.querySelector(".search-results");
  let t;

  const open = () => { overlay.classList.add("open"); document.body.style.overflow = "hidden"; setTimeout(() => input.focus(), 120); };
  const close = () => { overlay.classList.remove("open"); document.body.style.overflow = ""; input.value = ""; results.innerHTML = ""; };

  document.querySelectorAll("[data-open-search]").forEach(b => b.addEventListener("click", open));
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && overlay.classList.contains("open")) close(); });

  input.addEventListener("input", () => {
    clearTimeout(t);
    const q = input.value.trim();
    if (q.length < 2) { results.innerHTML = ""; return; }
    t = setTimeout(async () => {
      try {
        const list = await MW_API.search(q, 10);
        results.innerHTML = "";
        if (!list.length) { results.innerHTML = `<div class="sr-none">No results for “${esc(q)}”.</div>`; return; }
        list.forEach(m => {
          const a = document.createElement("a");
          a.className = "sr-item"; a.href = `movie.html?id=${m.id}`;
          a.innerHTML = `<div class="sr-thumb">${m.poster ? `<img src="${m.poster}" alt="" loading="lazy">` : ""}</div>
            <div class="sr-info"><h4>${esc(m.title)}</h4><p>${m.year || ""} · ${esc((m.genres || []).slice(0, 2).join(" · "))} · ${esc(m.director || "")}</p></div>
            <span class="sr-rate"><i class="fa-solid fa-star"></i> ${m.rating ? m.rating.toFixed(1) : "—"}</span>`;
          results.appendChild(a);
        });
      } catch (e) { results.innerHTML = `<div class="sr-none">Unable to load movies right now. Please try again.</div>`; }
    }, 220);
  });
}

/* ---------- global chrome: header, theme, back-to-top, auth sync ---------- */
function initChrome() {
  // theme
  const saved = localStorage.getItem("mw_theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
  document.querySelectorAll("[data-theme-toggle]").forEach(btn => btn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("mw_theme", next);
    toast(next === "dark" ? "Dark mode on" : "Light mode on", "fa-circle-half-stroke");
  }));

  // --- MOBILE MENU TOGGLE ---
  const hamburger = document.querySelector(".hamburger");
  const mainNav = document.querySelector(".main-nav");
  if (hamburger && mainNav) {
    hamburger.addEventListener("click", () => {
      mainNav.classList.toggle("open");
      const icon = hamburger.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-xmark");
      }
    });
    
    // Close menu when clicking a nav link
    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        const icon = hamburger.querySelector("i");
        if (icon) {
          icon.classList.add("fa-bars");
          icon.classList.remove("fa-xmark");
        }
      });
    });
  }

  // Profile button / Session name sync across all pages if logged in
  const loggedUserStr = localStorage.getItem('mw_logged_user');
  if (loggedUserStr) {
    try {
      const user = JSON.parse(loggedUserStr);
      document.querySelectorAll('.btn-profile span').forEach(span => {
        span.innerText = user.name;
      });
    } catch(e) {}
  }

  // header scroll
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    header && header.classList.toggle("scrolled", window.scrollY > 24);
    bt && bt.classList.show("show", window.scrollY > 600); // fixed syntax safety below
  };
  window.addEventListener("scroll", () => {
    header && header.classList.toggle("scrolled", window.scrollY > 24);
    if (bt) bt.classList.toggle("show", window.scrollY > 600);
  }, { passive: true });

  // back to top
  const bt = document.createElement("button");
  bt.className = "back-top"; bt.setAttribute("aria-label", "Back to top");
  bt.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  bt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.body.appendChild(bt);
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  const loader = document.querySelector(".loader");
  initChrome();
  initSearch();
  await MW_API.init();
  if (loader) { loader.classList.add("done"); setTimeout(() => loader.remove(), 600); }
  document.dispatchEvent(new CustomEvent("mw:ready"));
});
