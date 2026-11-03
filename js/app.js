/* MOVIES WORLD - Shared UI & CineSubz Download Modal */
"use strict";

function initDownloadModal() {
  if (document.getElementById('download-modal')) return;

  const modalHtml = `
    <div id="download-modal" class="mw-modal" style="display:none;">
      <div class="mw-modal-content">
        <button class="mw-close-btn" onclick="closeDownloadModal()">&times;</button>
        <div class="mw-modal-header">
          <h3 id="mw-movie-title">Movie Title</h3>
          <p id="mw-movie-meta">2026 • Sinhala Subtitles Available (සිංහල උපසිරැසි සමඟ)</p>
        </div>
        
        <div class="mw-tabs">
          <button class="mw-tab-btn active" onclick="switchMwTab(event, 'download-section')"><i class="fa-solid fa-download"></i> Download Links (ඩවුන්ලෝඩ්)</button>
          <button class="mw-tab-btn" onclick="switchMwTab(event, 'stream-section')"><i class="fa-solid fa-play"></i> Watch Online (නරඹන්න)</button>
        </div>

        <div id="download-section" class="mw-tab-content active">
          <p class="mw-instruction">Obe awashyathawaya anuwata quality eka saha server eka thoranna:</p>
          <div class="mw-links-list" id="mw-download-links"></div>
        </div>

        <div id="stream-section" class="mw-tab-content">
          <div class="mw-video-container">
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
    .mw-modal { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 99999; }
    .mw-modal-content { background: #0f1419; border: 1px solid rgba(255,255,255,0.1); width: 90%; max-width: 600px; border-radius: 16px; padding: 24px; color: #fff; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.5); font-family: 'Inter', sans-serif; }
    .mw-close-btn { position: absolute; top: 16px; right: 20px; background: none; border: none; color: #aaa; font-size: 28px; cursor: pointer; }
    .mw-close-btn:hover { color: #fff; }
    .mw-modal-header h3 { margin: 0 0 6px 0; font-size: 22px; color: #fff; }
    .mw-modal-header p { margin: 0 0 20px 0; font-size: 13px; color: #888; }
    .mw-tabs { display: flex; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px; padding-bottom: 10px; }
    .mw-tab-btn { background: none; border: none; color: #888; padding: 8px 16px; font-weight: 600; cursor: pointer; border-radius: 8px; font-size: 14px; }
    .mw-tab-btn.active { background: #e50914; color: #fff; }
    .mw-tab-content { display: none; }
    .mw-tab-content.active { display: block; }
    .mw-instruction { font-size: 14px; color: #ccc; margin-bottom: 12px; }
    .mw-link-row { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 8px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.05); }
    .mw-quality-badge { background: #e50914; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    .mw-btn-dl { background: #222; color: #fff; text-decoration: none; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
    .mw-btn-dl:hover { background: #e50914; }
    .mw-video-container { position: relative; width: 100%; padding-bottom: 56.25%; height: 0; }
    .mw-video-container iframe { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 8px; }
  `;
  document.head.appendChild(style);
}

function openDownloadModal(movieTitle, movieYear) {
  initDownloadModal();
  document.getElementById('mw-movie-title').innerText = movieTitle;
  document.getElementById('mw-movie-meta').innerText = `${movieYear} • Sinhala Subbed • Direct Download & Streaming`;
  
  const linksContainer = document.getElementById('mw-download-links');
  linksContainer.innerHTML = `
    <div class="mw-link-row">
      <div><span class="mw-quality-badge">1080p FHD</span> <span style="margin-left: 10px; font-size: 14px;">Server 01 (Google Drive / High Speed)</span></div>
      <a href="#" onclick="alert('${movieTitle} (1080p) download arambha wenawa...'); return false;" class="mw-btn-dl"><i class="fa-solid fa-download"></i> Download</a>
    </div>
    <div class="mw-link-row">
      <div><span class="mw-quality-badge" style="background:#2b6cb0;">720p HD</span> <span style="margin-left: 10px; font-size: 14px;">Server 02 (Fast Mirror)</span></div>
      <a href="#" onclick="alert('${movieTitle} (720p) download arambha wenawa...'); return false;" class="mw-btn-dl"><i class="fa-solid fa-download"></i> Download</a>
    </div>
    <div class="mw-link-row">
      <div><span class="mw-quality-badge" style="background:#718096;">480p SD</span> <span style="margin-left: 10px; font-size: 14px;">Server 03 (Mobile Saver)</span></div>
      <a href="#" onclick="alert('${movieTitle} (480p) download arambha wenawa...'); return false;" class="mw-btn-dl"><i class="fa-solid fa-download"></i> Download</a>
    </div>
  `;

  document.getElementById('mw-iframe-player').src = `https://www.youtube.com/embed/dQw4w9WgXcQ`;
  document.getElementById('download-modal').style.display = 'flex';
}

function closeDownloadModal() {
  const modal = document.getElementById('download-modal');
  if (modal) { modal.style.display = 'none'; document.getElementById('mw-iframe-player').src = ''; }
}

function switchMwTab(evt, tabId) {
  document.querySelectorAll('.mw-tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.mw-tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  evt.currentTarget.classList.add('active');
}

function movieCard(m) {
  const el = document.createElement("article");
  el.className = "movie-card";
  el.innerHTML = `
    <div class="poster-wrap">
      <span class="badge-hd">HD</span>
      <span class="badge-rate"><i class="fa-solid fa-star"></i>${m.rating ? m.rating.toFixed(1) : "—"}</span>
      <img src="${m.poster || ''}" alt="${m.title}" loading="lazy">
      <button class="card-overlay-btn" onclick="openDownloadModal('${m.title.replace(/'/g, "\'")}', '${m.year}')">
        <i class="fa-solid fa-download"></i> Sinhala Subz / DL
      </button>
    </div>
    <div class="card-info">
      <h3>${m.title}</h3>
      <div class="ci-meta"><span>${m.year}</span><span style="color:var(--accent);">Sinhala Sub</span></div>
    </div>`;
  return el;
}

function renderGrid(container, list) {
  container.innerHTML = "";
  if (!list.length) return;
  list.forEach(m => container.appendChild(movieCard(m)));
}

async function renderRow({ title, container, fetcher }) {
  const sec = document.createElement("section");
  sec.className = "section";
  sec.innerHTML = `<div class="section-head"><h2 class="section-title">${title}</h2></div><div class="mrow"></div>`;
  container.appendChild(sec);
  const row = sec.querySelector(".mrow");
  try {
    const movies = await fetcher();
    renderGrid(row, movies);
  } catch (e) {
    row.innerHTML = `<p style="color:var(--text-2)">Unable to load movies.</p>`;
  }
}

function initSearch() {
  const overlay = document.createElement("div");
  overlay.className = "search-overlay";
  overlay.innerHTML = `
    <div class="search-box">
      <input type="search" placeholder="Search movies, actors..." autocomplete="off">
      <i class="fa-solid fa-magnifying-glass"></i>
    </div>
    <div class="search-results"></div>`;
  document.body.appendChild(overlay);
  const input = overlay.querySelector("input");
  const results = overlay.querySelector(".search-results");
  let t;

  document.querySelectorAll("[data-open-search]").forEach(b => b.addEventListener("click", () => overlay.classList.add("open")));
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.classList.remove("open"); });

  input.addEventListener("input", () => {
    clearTimeout(t);
    const q = input.value.trim();
    if (q.length < 2) { results.innerHTML = ""; return; }
    t = setTimeout(async () => {
      const list = await MW_API.search(q);
      results.innerHTML = "";
      if (!list.length) { results.innerHTML = `<div class="sr-none">No movies found.</div>`; return; }
      list.forEach(m => {
        const a = document.createElement("a");
        a.className = "sr-item";
        a.href = "#";
        a.onclick = () => { overlay.classList.remove("open"); openDownloadModal(m.title, m.year); return false; };
        a.innerHTML = `<img src="${m.poster || ''}" alt=""><div><h4>${m.title}</h4><p>${m.year} • Sinhala Subbed</p></div>`;
        results.appendChild(a);
      });
    }, 200);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const loader = document.querySelector(".loader");
  initSearch();
  
  const hamburger = document.querySelector(".hamburger");
  const mainNav = document.querySelector(".main-nav");
  if (hamburger && mainNav) {
    hamburger.addEventListener("click", () => mainNav.classList.toggle("open"));
  }

  document.querySelectorAll("[data-theme-toggle]").forEach(btn => btn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("mw_theme", next);
  }));

  await MW_API.init();
  if (loader) { loader.classList.add("done"); setTimeout(() => loader.remove(), 500); }
  document.dispatchEvent(new CustomEvent("mw:ready"));
});
