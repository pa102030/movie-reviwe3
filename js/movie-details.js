/* MOVIES WORLD - Movie details page (movie.html?id=) */
"use strict";
document.addEventListener("mw:ready", async () => {
  const id = new URLSearchParams(location.search).get("id");
  const root = document.getElementById("detail-root");
  if (!id) { root.innerHTML = errorBox("No movie selected."); return; }

  let m;
  try { m = await MW_API.getMovie(id); }
  catch (e) { root.innerHTML = errorBox("Movie not found or unavailable."); return; }
console.log("Movie Data:", m);
console.log("Cast List:", m.cast);
  document.title = `${m.title} (${m.year}) | MOVIES WORLD Review & Where to Watch`;
  const desc = (m.overview || "").slice(0, 155);
  setMeta("description", `${m.title} (${m.year}) — rating, review, trailer and where to watch legally. ${desc}`);
  injectMovieSchema(m);

  const inW = MWStore.inWatchlist(m.id), inF = MWStore.inFavorites(m.id);
  const cast = m.cast || [];
  const facts = [
    ["Director", m.director], ["Release Date", m.releaseDate],
    ["Runtime", m.runtime ? m.runtime + " min" : null], ["Language", m.language],
    ["Country", (m.country || []).join(", ")], ["Age Rating", m.ageRating],
    ["Votes", m.votes ? m.votes.toLocaleString() : null]
  ].filter(([, v]) => v);

  /* ---------- hero ---------- */
  const heroBg = document.getElementById("detail-bg");
  if (m.backdrop) heroBg.innerHTML = `<img src="${m.backdrop}" alt="">`;
  else heroBg.innerHTML = `<div class="hero-ph" style="position:absolute;inset:0;background:linear-gradient(120deg,#141e30,#243b55 45%,#0f0c29);"></div>`;

  document.getElementById("detail-grid").innerHTML = `
    <div class="detail-poster">${posterHTML(m)}</div>
    <div class="detail-main">
      <h1>${esc(m.title)}</h1>
      <p class="tagline">${esc(m.tagline || "")}</p>
      <div class="detail-meta">
        <span class="rate"><i class="fa-solid fa-star"></i> ${m.rating ? m.rating.toFixed(1) : "—"}<span style="color:var(--text-3);font-weight:500">/10</span></span>
        ${m.year ? `<span class="pill">${m.year}</span>` : ""}
        ${m.runtime ? `<span class="pill">${m.runtime} min</span>` : ""}
        ${m.ageRating ? `<span class="pill">${esc(m.ageRating)}</span>` : ""}
        ${m.rating >= 7.5 ? '<span class="pill" style="color:var(--gold);border-color:rgba(245,197,24,.4)">4K</span>' : '<span class="pill">HD</span>'}
      </div>
      <div class="genre-tags">${(m.genres || []).map(g => `<a href="genres.html?genre=${encodeURIComponent(g)}">${esc(g)}</a>`).join("")}</div>
      <div class="detail-actions">
        <button class="btn btn-red" data-trailer="${m.id}"><i class="fa-solid fa-play"></i> Watch Trailer</button>
        <button class="btn btn-glass ${inW ? "active" : ""}" data-watchlist="${m.id}"><i class="fa-solid fa-plus"></i> Add to Watchlist</button>
        <button class="btn btn-glass ${inF ? "active" : ""}" data-fav="${m.id}"><i class="fa-solid fa-heart"></i> Favorite</button>
        <a class="btn btn-gold" href="#watch"><i class="fa-solid fa-ticket"></i> Watch / Rent / Buy</a>
      </div>
    </div>`;
  bindCardButtons(document.getElementById("detail-grid"));

  /* ---------- review score ---------- */
  const scorePanel = document.getElementById("review-panel");
  const rv = m.review;
  const overall = rv ? ((rv.story + rv.acting + rv.direction + rv.cinematography + rv.music + rv.vfx + rv.entertainment) / 7) : (m.rating || 0);
  const stars = n => "★".repeat(Math.round(n / 2)) + "☆".repeat(5 - Math.round(n / 2));
  scorePanel.innerHTML = `
    <h2><i class="fa-solid fa-star-half-stroke"></i> MOVIES WORLD Review</h2>
    <div class="score-ring">
      <div class="ring" style="--p:${(overall * 10).toFixed(0)}"><span>${overall.toFixed(1)}</span></div>
      <div>
        <div class="stars-lg" aria-hidden="true">${stars(overall)}</div>
        <div class="score-note"><b style="color:var(--text)">MOVIE SCORE ${overall.toFixed(1)}/10</b> · based on ${m.votes ? m.votes.toLocaleString() + " votes" : "editorial rating"}</div>
      </div>
    </div>
    ${rv ? `<div class="score-bars">
      ${[["Story", rv.story], ["Acting", rv.acting], ["Direction", rv.direction], ["Cinematography", rv.cinematography], ["Music", rv.music], ["Visual Effects", rv.vfx], ["Entertainment", rv.entertainment]].map(([k, v]) =>
        `<div class="sbar"><span>${k}</span><div class="track"><div class="fill" data-w="${v * 10}"></div></div><b>${v.toFixed(1)}</b></div>`).join("")}
    </div>` : `<p class="story">Full editorial breakdown coming soon. Community rating: <b style="color:var(--gold)">${m.rating}/10</b>.</p>`}
    <p class="story" style="margin-top:16px">${rv ? esc(rv.body) : esc(m.overview || "")}</p>
    ${rv ? `<div class="verdict"><h4><i class="fa-solid fa-gavel"></i> MOVIES WORLD Verdict</h4><p>${esc(rv.verdict)}</p></div>` : ""}`;
  requestAnimationFrame(() => setTimeout(() =>
    scorePanel.querySelectorAll(".fill").forEach(f => f.style.width = f.dataset.w + "%"), 120));

  /* ---------- facts + cast ---------- */
  document.getElementById("facts-panel").innerHTML = `
    <h2><i class="fa-solid fa-circle-info"></i> Movie Details</h2>
    <dl class="facts">${facts.map(([k, v]) => `<div class="fact"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`;

  // Render cast list with photos and character names
  const topCast = cast.slice(0, 20);
  let castHTML = `<h2><i class="fa-solid fa-users"></i> Cast & Crew</h2>`;
  if (topCast.length > 0) {
    castHTML += `<div class="cast-grid">`;
    topCast.forEach(c => {
      const name = typeof c === "object" ? (c.name || c.original_name || "") : c;
      const character = typeof c === "object" ? (c.character || "") : "";
      const profilePath = typeof c === "object" ? (c.profile_path || c.image || c.poster) : null;
      
      const profileImg = profilePath 
        ? (profilePath.startsWith("http") ? profilePath : `https://image.tmdb.org/t/p/w185${profilePath}`) 
        : `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="150" viewBox="0 0 100 150"><rect width="100" height="150" fill="%23222"/><text x="50" y="75" fill="%23aaa" font-size="14" text-anchor="middle">${encodeURIComponent(name ? name[0] : "C")}</text></svg>`;

      castHTML += `
        <div class="cast-card">
          <div class="cast-img-wrap">
            <img src="${profileImg}" alt="${esc(name)}" loading="lazy" onerror="this.onerror=null;this.src='assets/person-placeholder.svg'">
          </div>
          <div class="cast-info">
            <span class="cast-name">${esc(name)}</span>
            ${character ? `<span class="cast-character">${esc(character)}</span>` : ""}
          </div>
        </div>`;
    });
    castHTML += `</div>`;
  } else {
    castHTML += `<p class="story">Cast information unavailable.</p>`;
  }
  document.getElementById("cast-panel").innerHTML = castHTML;

  /* ---------- story ---------- */
  document.getElementById("story-panel").innerHTML = `
    <h2><i class="fa-solid fa-book-open"></i> Story</h2><p class="story">${esc(m.overview || "Story unavailable.")}</p>`;

  /* ---------- where to watch ---------- */
  const watchPanel = document.getElementById("watch-panel");
  const LOGO_COLORS = { "netflix": "#e50914", "prime": "#00a8e1", "disney": "#113ccf", "max": "#8a2be2", "apple": "#333", "google": "#4285f4", "peacock": "#000", "paramount": "#0064ff", "hulu": "#1ce783" };
  const logoColor = name => { const k = Object.keys(LOGO_COLORS).find(k => name.toLowerCase().includes(k)); return LOGO_COLORS[k] || "#5b6472"; };
  let watchHTML = `<h2 id="watch"><i class="fa-solid fa-ticket"></i> Where to Watch</h2>`;
  const watchList = (m.watch || []).map(w => typeof w === "string" ? { name: w, type: "rent" } : w);
  if (watchList.length) {
    watchHTML += `<div class="watch-list">${watchList.map(w => `
      <div class="watch-item">
        <span class="wname"><span class="wlogo" style="background:${logoColor(w.name)}">${esc(w.name[0])}</span>${esc(w.name)}</span>
        <button class="wbtn ${w.type === "stream" ? "stream" : "rentbuy"}" data-provider="${esc(w.name)}" data-movie="${esc(m.title)}">${w.type === "stream" ? "WATCH" : "RENT / BUY"}</button>
      </div>`).join("")}</div>`;
  } else {
    watchHTML += `<p class="story">Availability varies by country. Connect a TMDB API key (see README) for live, region-accurate streaming data.</p>`;
  }
  watchHTML += `<p class="legal-note"><i class="fa-solid fa-shield-halved" style="color:var(--green)"></i> MOVIES WORLD never hosts pirated content. Buttons open official, licensed platforms only.</p>`;
  watchPanel.innerHTML = watchHTML;
  watchPanel.querySelectorAll("[data-provider]").forEach(b => b.addEventListener("click", () => {
    const q = encodeURIComponent(b.dataset.movie);
    const urls = {
      "netflix": `https://www.netflix.com/search?q=${q}`,
      "prime video": `https://www.primevideo.com/search?phrase=${q}`,
      "apple": `https://tv.apple.com/search?term=${q}`,
      "google": `https://play.google.com/store/search?q=${q}&c=movies`,
      "disney": `https://www.disneyplus.com/search?q=${q}`,
      "max": `https://www.max.com/search?q=${q}`,
      "hulu": `https://www.hulu.com/search?q=${q}`,
      "peacock": `https://www.peacocktv.com/search?q=${q}`,
      "paramount": `https://www.paramountplus.com/search/?query=${q}`
    };
    const k = Object.keys(urls).find(k => b.dataset.provider.toLowerCase().includes(k));
    window.open(urls[k] || `https://www.google.com/search?q=${encodeURIComponent(b.dataset.movie + " " + b.dataset.provider + " official")}`, "_blank", "noopener");
    toast("Opening official platform…", "fa-arrow-up-right-from-square");
  }));

  /* ---------- authorized downloads ----------
     Add only links you own, have permission to distribute, or that are public domain.
     See data/download-links.json for the format. */
  const downloadsPanel = document.getElementById("downloads-panel");
  if (downloadsPanel) {
    try {
      const response = await fetch("data/download-links.json", { cache: "no-store" });
      const downloadData = response.ok ? await response.json() : {};
      const links = Array.isArray(downloadData[String(m.id)]) ? downloadData[String(m.id)] : [];
      const validLinks = links.filter(item => {
        try { const u = new URL(item.url); return ["https:", "http:"].includes(u.protocol) && item.label; }
        catch (_) { return false; }
      });
      downloadsPanel.innerHTML = `<h2><i class="fa-solid fa-download"></i> Legal Downloads</h2>` +
        (validLinks.length
          ? `<div class="download-list">${validLinks.map(item => `<a class="download-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer"><span><b>${esc(item.label)}</b><small>${esc(item.quality || "Authorized download")}</small></span><i class="fa-solid fa-arrow-down"></i></a>`).join("")}</div>`
          : `<p class="story">No authorized download links are listed for this movie yet.</p><p class="legal-note">Only HTTPS links for public-domain films or files you own / are licensed to distribute should be added in data/download-links.json.</p>`);
    } catch (e) {
      downloadsPanel.innerHTML = `<h2><i class="fa-solid fa-download"></i> Legal Downloads</h2><p class="story">Download information is currently unavailable.</p>`;
    }
  }

  /* ---------- similar ---------- */
  try {
    const sim = await MW_API.similar(m.id, 12);
    if (sim.length) {
      const sec = document.getElementById("similar-section");
      sec.innerHTML = `<div class="section-head"><h2 class="section-title">More Like This</h2></div><div class="movie-grid"></div>`;
      renderGrid(sec.querySelector(".movie-grid"), sim);
    }
  } catch (e) {}

  function errorBox(msg) {
    return `<div class="page-hero"><div class="empty-state"><i class="fa-solid fa-film"></i><h3>${esc(msg)}</h3><p><a href="movies.html" style="color:var(--accent-2);font-weight:600">Browse all movies →</a></p></div></div>`;
  }
  function setMeta(name, content) {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) { el = document.createElement("meta"); el.name = name; document.head.appendChild(el); }
    el.content = content;
  }
  function injectMovieSchema(m) {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "Movie",
      name: m.title, datePublished: String(m.year),
      description: m.overview, image: m.poster || undefined,
      director: m.director ? { "@type": "Person", name: m.director } : undefined,
      aggregateRating: m.rating ? { "@type": "AggregateRating", ratingValue: m.rating, bestRating: 10, ratingCount: m.votes || 1 } : undefined
    });
    document.head.appendChild(s);
  }
});
