/* MOVIES WORLD - Reviews page: movies with editorial reviews */
"use strict";
document.addEventListener("mw:ready", async () => {
  const grid = document.getElementById("reviews-grid");
  skeletons(grid, 8);
  try {
    let reviewed;
    if (MW_API.isDemo()) {
      reviewed = MW_API.all().filter(m => m.review).sort((a, b) => b.rating - a.rating);
    } else {
      const r = await MW_API.discover({ sort: "rating", minRating: 7.5, size: 24 });
      reviewed = r.results;
    }
    renderGrid(grid, reviewed);
    document.getElementById("reviews-count").textContent = reviewed.length;
  } catch (e) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-triangle-exclamation"></i><h3>Unable to load reviews right now</h3><p>Please try again.</p></div>`;
  }
});
