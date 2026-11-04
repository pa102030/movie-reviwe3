/* MOVIES WORLD - Browse + Filters page (movies.html) */
"use strict";
document.addEventListener("mw:ready", () => {
  const params = new URLSearchParams(location.search);
  const grid = document.getElementById("movies-grid");
  const meta = document.getElementById("results-meta");
  const moreBtn = document.getElementById("load-more");
  const titleEl = document.getElementById("page-title");
  const descEl = document.getElementById("page-desc");

  const state = {
    year: params.get("year") || "",
    genre: params.get("genre") || "",
    language: params.get("language") || "",
    minRating: params.get("minRating") || "",
    sort: params.get("sort") || "popularity",
    search: params.get("q") || "",
    page: 1, total: 0
  };

  // build year select 2000-2026
  const yearSel = document.getElementById("f-year");
  for (let y = 2026; y >= 2000; y--) {
    const o = document.createElement("option"); o.value = y; o.textContent = y; yearSel.appendChild(o);
  }
  yearSel.value = state.year;

  // populate genres + languages from data
  MW_API.genres().then(gs => {
    const gSel = document.getElementById("f-genre");
    gs.forEach(g => {
      const o = document.createElement("option");
      o.value = g.name || g; o.textContent = g.name || g;
      if ((g.name || g).toLowerCase() === state.genre.toLowerCase()) o.selected = true;
      gSel.appendChild(o);
    });
  });
  fetch("data/movies.json").then(r => r.json()).then(d => {
    const langs = [...new Set(d.movies.map(m => m.language))].sort();
    const lSel = document.getElementById("f-language");
    langs.forEach(l => { const o = document.createElement("option"); o.value = l; o.textContent = l; lSel.appendChild(o); });
    lSel.value = state.language;
  }).catch(() => {});

  document.getElementById("f-rating").value = state.minRating;
  document.getElementById("f-sort").value = state.sort;

  function setHeading() {
    let t = "All Movies", d = "Browse the complete MOVIES WORLD catalog from 2000 to 2026.";
    if (state.year) t = "Best Movies of " + state.year;
    else if (state.genre) t = state.genre.charAt(0).toUpperCase() + state.genre.slice(1) + " Movies";
    else if (state.search) { t = `Results for “${state.search}”`; d = "Live search across titles, actors, directors, genres and years."; }
    else if (state.sort === "rating") t = "Top Rated Movies";
    else if (state.sort === "newest") t = "Latest Releases";
    titleEl.textContent = t;
    descEl.textContent = d;
    document.title = `${t} | MOVIES WORLD`;
  }

  async function load(reset = true) {
    if (reset) { state.page = 1; skeletons(grid, 12); }
    else moreBtn.disabled = true, moreBtn.textContent = "Loading…";
    try {
      const r = await MW_API.discover({ ...state, size: MW_CONFIG.PAGE_SIZE });
      state.total = r.total;
      if (reset) grid.innerHTML = ""; else grid.querySelectorAll(".skeleton-card").forEach(s => s.remove());
      renderGridAppend(r.results);
      meta.innerHTML = `Showing <b>${grid.children.length}</b> of <b>${state.total}</b> movies${state.year ? " from " + state.year : " (2000–2026)"}`;
      moreBtn.style.display = grid.children.length < state.total ? "" : "none";
    } catch (e) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-triangle-exclamation"></i><h3>Unable to load movies right now</h3><p>Please check your connection and try again.</p></div>`;
      moreBtn.style.display = "none";
    }
    moreBtn.disabled = false; moreBtn.innerHTML = 'Load More <i class="fa-solid fa-chevron-down"></i>';
  }
  function renderGridAppend(list) {
    if (!list.length && state.page === 1) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-film"></i><h3>No movies found</h3><p>Try adjusting your filters or search.</p></div>`;
      return;
    }
    list.forEach(m => grid.appendChild(movieCard(m)));
    bindCardButtons(grid);
  }

  function syncFromInputs() {
    state.year = yearSel.value; state.genre = document.getElementById("f-genre").value;
    state.language = document.getElementById("f-language").value;
    state.minRating = document.getElementById("f-rating").value;
    state.sort = document.getElementById("f-sort").value;
    const q = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => { if (v && !["page", "total"].includes(k)) q.set(k, v); });
    history.replaceState(null, "", "movies.html" + (q.toString() ? "?" + q : ""));
    setHeading(); load(true);
  }
  ["f-year", "f-genre", "f-language", "f-rating", "f-sort"].forEach(id =>
    document.getElementById(id).addEventListener("change", syncFromInputs));
  document.getElementById("f-clear").addEventListener("click", () => {
    ["f-year", "f-genre", "f-language", "f-rating"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("f-sort").value = "popularity";
    syncFromInputs();
  });
  moreBtn.addEventListener("click", () => { state.page++; load(false); });

  setHeading(); load(true);
});
