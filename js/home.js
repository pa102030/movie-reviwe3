/* MOVIES WORLD - Home Page */
"use strict";

document.addEventListener("mw:ready", async () => {
  const heroBg = document.getElementById("hero-bg");
  const heroContent = document.getElementById("hero-content");
  const homeSections = document.getElementById("home-sections");

  if (!homeSections) return;

  try {
    const popularMovies = await MW_API.getPopular();
    if (popularMovies && popularMovies.length > 0) {
      const heroMovie = popularMovies[0];
      if (heroBg && heroMovie.backdrop) {
        heroBg.style.backgroundImage = `url(${heroMovie.backdrop})`;
      }
      if (heroContent) {
        heroContent.innerHTML = `
          <span class="badge-hd" style="margin-bottom: 10px; display: inline-block;">FEATURED MOVIE</span>
          <h1 style="font-size: clamp(28px, 5vw, 44px); font-weight: 800; margin-bottom: 12px; font-family: 'Be Vietnam Pro', sans-serif;">${heroMovie.title}</h1>
          <p style="color: var(--text-2); font-size: 15px; margin-bottom: 20px; max-width: 600px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${heroMovie.overview || ''}</p>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button onclick="openDownloadModal('${heroMovie.title.replace(/'/g, "\'")}', '${heroMovie.year}')" class="icon-btn" style="background: var(--accent); border-color: var(--accent); color: #fff; padding: 12px 24px; font-weight: 600;">
              <i class="fa-solid fa-download"></i> Sinhala Subz / Download
            </button>
          </div>
        `;
      }
    }
  } catch (e) {
    console.error("Hero error:", e);
  }

  renderRow({
    title: "🔥 Trending Movies with Sinhala Subtitles",
    container: homeSections,
    fetcher: () => MW_API.getTrending()
  });

  renderRow({
    title: "🌟 Popular Masterpieces",
    container: homeSections,
    fetcher: () => MW_API.getPopular()
  });

  renderRow({
    title: "👑 Top Rated Movies",
    container: homeSections,
    fetcher: () => MW_API.getTopRated()
  });
});
