/* MOVIES WORLD - Watchlist page */
"use strict";
document.addEventListener("mw:ready", async () => {
  const grid = document.getElementById("watchlist-grid");
  const empty = document.getElementById("watchlist-empty");
  const clearBtn = document.getElementById("clear-watchlist");
  const favOnly = document.getElementById("show-favorites");

  async function render() {
    const ids = favOnly.checked ? MWStore.get("mw_favorites") : MWStore.get("mw_watchlist");
    grid.innerHTML = "";
    if (!ids.length) {
      empty.style.display = "";
      empty.querySelector("h3").textContent = favOnly.checked ? "No favorites yet." : "Your watchlist is empty.";
      grid.style.display = "none"; clearBtn.style.display = "none";
      return;
    }
    empty.style.display = "none"; grid.style.display = ""; clearBtn.style.display = "";
    skeletons(grid, Math.min(ids.length, 8));
    const movies = [];
    for (const id of ids) {
      try { movies.push(await MW_API.getMovie(id)); } catch (e) { /* skip missing */ }
    }
    renderGrid(grid, movies);
    document.getElementById("wl-count").textContent = movies.length;
  }

  favOnly.addEventListener("change", render);
  clearBtn.addEventListener("click", () => {
    localStorage.removeItem(favOnly.checked ? "mw_favorites" : "mw_watchlist");
    toast("List cleared", "fa-trash-can"); render();
  });
  document.addEventListener("mw:watchlist-changed", () => { if (!favOnly.checked) render(); });
  render();
});
