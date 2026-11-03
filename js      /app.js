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
        <button onclick="openDownloadModal('${esc(m.title).replace(/'/g, "\\'")}', '${m.year || '2026'}', '${esc((m.genres || []).join(', '))}', '')"><i class="fa-solid fa-download"></i> Subz / DL</button>
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

/* ---------- CINESUBZ STYLE: DOWNLOAD & STREAM MODAL ---------- */
function initDownloadModal() {
  if (document.getElementById('download-modal')) return;

  const modalHtml = `
    <div id="download-modal" class="mw-modal" style="display:none;">
      <div class="mw-modal-content">
        <button class="mw-close-btn" onclick="closeDownloadModal()">&times;</button>
        <div class="mw-modal-header">
          <h3 id="mw-movie-title">Movie Title</h3>
          <p id="mw-movie-meta">2026 • Sinhala Subtitles Available</p>
        </div>
        
        <div class="mw-tabs">
          <button class="mw-tab-btn active" onclick="switchMwTab(event, 'download-section')"><i class="fa-solid fa-download"></i> ඩවුන්ලෝඩ් ලින්ක් (Download)</button>
          <button class="mw-tab-btn" onclick="switchMwTab(event, 'stream-section')"><i class="fa-solid fa-play"></i> නරඹන්න (Watch Online)</button>
        </div>

        <div id="download-section" class="mw-tab-content active">
          <p class="mw-instruction">ඔබට අවශ්‍ය කොලිටිය සහ සර්වර් එක තෝරන්න (සිංහල උපසිරැසි සමඟ):</p>
          <div class="mw-links-list" id="mw-download-links">
            <!-- ඩයිනමික් ලෙස ලින්ක්ස් පිරවේ -->
          </div>
        </div>

        <div id="stream-section" class="mw-tab-content">
          <div class="mw-video-container" id="mw-video-player-wrap">
            <iframe id="mw-iframe-player" src="" frameborder="0" allowfullscreen></iframe>
          </div>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = modalHtml;
  document.body.appendChild(div);

  const style = document.createElement('style');
  style.innerHTML = `
    .mw-modal {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 99999;
    }
    .mw-modal-content {
      background: #0f1419; border: 1px solid rgba(255,255,255,0.1);
      width: 90%; max-width: 600px; border-radius: 16px; padding: 24px;
      color: #fff; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      font-family: 'Inter', sans-serif;
    }
    .mw-close-btn {
      position: absolute; top: 16px; right: 20px; background: none; border: none;
      color: #aaa; font-size: 28px; cursor: pointer; transition: color 0.2s;
    }
    .mw-close-btn:hover { color: #fff; }
    .mw-modal-header h3 { margin: 0 0 6px 0; font-size: 22px; color: #fff; }
    .mw-modal-header p { margin: 0 0 20px 0; font-size: 13px; color: #888; }
    .mw-tabs { display: flex; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px; padding-bottom: 10px; }
    .mw-tab-btn {
      background: none; border: none; color: #888; padding: 8px 16px; font-weight: 600;
      cursor: pointer; border-radius: 8px; transition: all 0.2s; font-size: 14px;
    }
    .mw-tab-btn.active { background: #e50914; color: #fff; }
    .mw-tab-content { display: none; }
    .mw-tab-content.active { display: block; }
    .mw-instruction { font-size: 14px; color: #ccc; margin-bottom: 12px; }
    .mw-link-row {
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 8px;
      margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.05); transition: border-color 0.2s;
    }
    .mw-link-row:hover { border-color: rgba(229, 9, 20, 0.5); }
    .mw-quality-badge { background: #e50914; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    .mw-btn-dl {
      background: #222; color: #fff; text-decoration: none; padding: 6px 14px;
      border-radius: 6px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px;
      transition: background 0.2s;
    }
    .mw-btn-dl:hover { background: #e50914; }
    .mw-video-container { position: relative; width: 100%; padding-bottom: 56.25%; height: 0; }
    .mw-video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px; }
  `;
  document.head.appendChild(style);
}

function openDownloadModal(movieTitle, movieYear, genres, trailerKey) {
  initDownloadModal();
  
  document.getElementById('mw-movie-title').innerText = movieTitle;
  document.getElementById('mw-movie-meta').innerText = `${movieYear} • ${genres || 'Sinhala Subbed'} • සිංහල උපසිරැසි සමඟ`;
  
  const linksContainer = document.getElementById('mw-download-links');
  linksContainer.innerHTML = `
    <div class="mw-link-row">
      <div>
        <span class="mw-quality-badge">1080p FHD</span> 
        <span style="margin-left: 10px; font-size: 14px;">සර්වර් 01 (Direct Download / GDrive)</span>
        <div style="font-size: 11px; color: #777; margin-top: 2px;">ප්‍රමාණය: 2.1 GB • සිංහල සබ්</div>
      </div>
      <a href="#" onclick="toast('${movieTitle} (1080p) ඩවුන්ලෝඩ් වීම ආරම්භ වේ...'); return false;" class="mw-btn-dl"><i class="fa-solid fa-download"></i> Download</a>
    </div>
    <div class="mw-link-row">
      <div>
        <span class="mw-quality-badge" style="background:#2b6cb0;">720p HD</span> 
        <span style="margin-left: 10px; font-size: 14px;">සර්වර් 02 (Fast Mirror)</span>
        <div style="font-size: 11px; color: #777; margin-top: 2px;">ප්‍රමාණය: 950 MB • සිංහල සබ්</div>
      </div>
      <a href="#" onclick="toast('${movieTitle} (720p) ඩවුන්ලෝඩ් වීම ආරම්භ වේ...'); return false;" class="mw-btn-dl"><i class="fa-solid fa-download"></i> Download</a>
    </div>
    <div class="mw-link-row">
      <div>
        <span class="mw-quality-badge" style="background:#718096;">480p SD</span> 
        <span style="margin-left: 10px; font-size: 14px;">සර්වර් 03 (Mobile Friendly)</span>
        <div style="font-size: 11px; color: #777; margin-top: 2px;">ප්‍රමාණය: 450 MB • සිංහල සබ්</div>
      </div>
      <a href="#" onclick="toast('${movieTitle} (480p) ඩවුන්ලෝඩ් වීම ආරම්භ වේ...'); return false;" class="mw-btn-dl"><i class="fa-solid fa-download"></i> Download</a>
    </div>
  `;

  const iframe = document.getElementById('mw-iframe-player');
  iframe.src = trailerKey ? `https://www.youtube.com/embed/${trailerKey}` : `https://www.youtube.com/embed/dQw4w9WgXcQ`;

  document.getElementById('download-modal').style.display = 'flex';
}

function closeDownloadModal() {
  const modal = document.getElementById('download-modal');
  if (modal) {
    modal.style.display = 'none';
    document.getElementById('mw-iframe-player').src = ''; 
  }
}

function switchMwTab(evt, tabId) {
  const contents = document.querySelectorAll('.mw-tab-content');
  contents.forEach(c => c.classList.remove('active'));

  const btns = document.querySelectorAll('.mw-tab-btn');
  btns.forEach(b => b.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  evt.currentTarget.classList.add('active');
}

window.addEventListener('click', (e) => {
  const modal = document.getElementById('download-modal');
  if (e.target === modal) {
    closeDownloadModal();
  }
});

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

  // Profile button / Session name sync
  const loggedUserStr = localStorage.getItem('mw_logged_user');
  if (loggedUserStr) {
    try {
      const user = JSON.parse(loggedUserStr);
      document.querySelectorAll('.btn-profile span').forEach(span => {
        span.innerText = user.name;
      });
    } catch(e) {}
  }

  // header scroll & back-to-top button setup
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    header && header.classList.toggle("scrolled", window.scrollY > 24);
    if (bt) bt.classList.toggle("show", window.scrollY > 600);
  }, { passive: true });

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
