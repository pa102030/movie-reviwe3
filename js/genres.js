/* MOVIES WORLD - Genres index + genre page */
"use strict";
document.addEventListener("mw:ready", async () => {
  const params = new URLSearchParams(location.search);
  const genre = params.get("genre");
  const indexWrap = document.getElementById("genres-index");
  const genreWrap = document.getElementById("genre-page");
  const ICONS = { Action: "fa-explosion", Adventure: "fa-mountain-sun", Animation: "fa-wand-magic-sparkles", Comedy: "fa-face-laugh", Crime: "fa-user-secret", Drama: "fa-masks-theater", Fantasy: "fa-dragon", Horror: "fa-skull", Mystery: "fa-magnifying-glass", Romance: "fa-heart", "Sci-Fi": "fa-rocket", Thriller: "fa-bolt", War: "fa-shield-halved", Western: "fa-hat-cowboy" };

  const gs = await MW_API.genres();
  const names = gs.map(g => g.name || g);

  if (!genre) {
    indexWrap.style.display = "";
    const grid = indexWrap.querySelector(".genre-grid");
    names.forEach(name => {
      const a = document.createElement("a");
      a.className = "genre-tile"; a.href = `genres.html?genre=${encodeURIComponent(name)}`;
      const hue = (name.length * 47) % 360;
      a.style.background = `linear-gradient(135deg,hsl(${hue} 55% 22%),hsl(${(hue + 60) % 360} 60% 12%))`;
      a.innerHTML = `<i class="fa-solid ${ICONS[name] || "fa-film"} gt-icon"></i><div><h3>${esc(name)}</h3><p>Explore ${esc(name)} movies 2000–2026</p></div>`;
      grid.appendChild(a);
    });
    return;
  }

  genreWrap.style.display = "";
  const gname = names.find(n => n.toLowerCase() === genre.toLowerCase()) || genre;
  document.getElementById("genre-title").textContent = gname + " Movies";
  document.getElementById("genre-desc").textContent =
    `The best ${gname.toLowerCase()} films from 2000 to 2026 — popular picks, top-rated classics and the latest releases.`;
  document.title = `${gname} Movies (2000–2026) | MOVIES WORLD`;
  document.getElementById("genre-icon").className = "fa-solid " + (ICONS[gname] || "fa-film");

  async function section(id, title, opts) {
    const box = document.getElementById(id);
    skeletons(box, 6);
    try {
      const r = await MW_API.discover({ genre: gname, size: 12, ...opts });
      renderGrid(box, r.results);
    } catch (e) { box.innerHTML = `<p style="color:var(--text-2)">Unable to load movies right now. Please try again.</p>`; }
  }
  section("g-popular", "Popular", { sort: "popularity" });
  section("g-top", "Highest Rated", { sort: "rating", minRating: 6 });
  section("g-latest", "Latest", { sort: "newest" });
});
