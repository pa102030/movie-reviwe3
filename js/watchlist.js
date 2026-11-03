/* MOVIES WORLD - Watchlist */
"use strict";
document.addEventListener("mw:ready", async () => {
  const grid = document.getElementById("watchlist-grid");
  if (!grid) return;
  const movies = await MW_API.getPopular();
  renderGrid(grid, movies.slice(0, 4));
});
