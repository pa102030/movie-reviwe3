/* MOVIES WORLD - Movies Catalog */
"use strict";
document.addEventListener("mw:ready", async () => {
  const grid = document.getElementById("movies-grid");
  if (!grid) return;
  const movies = await MW_API.getPopular();
  renderGrid(grid, movies);
});
