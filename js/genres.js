/* MOVIES WORLD - Genres */
"use strict";
document.addEventListener("mw:ready", async () => {
  const container = document.getElementById("genres-container");
  const moviesGrid = document.getElementById("genre-movies");
  if (!container || !moviesGrid) return;
  
  const genres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Animation", "Romance", "Thriller"];
  container.innerHTML = genres.map(g => `<button class="icon-btn" onclick="filterGenre('${g}')">${g}</button>`).join("");
  
  window.filterGenre = async (genre) => {
    const movies = await MW_API.getPopular();
    renderGrid(moviesGrid, movies);
  };
  
  const movies = await MW_API.getPopular();
  renderGrid(moviesGrid, movies);
});
