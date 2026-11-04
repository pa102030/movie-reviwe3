/* ============================================================
   MOVIES WORLD - Configuration
   Get a free TMDB API key at https://www.themoviedb.org/settings/api
   and paste it below to unlock the FULL 2000-2026 catalog
   (600,000+ movies, posters, backdrops, trailers, watch providers).
   Without a key the site runs in DEMO mode using data/movies.json.
   NOTE: never expose a private key in production - use the
   optional backend proxy (see README.md).
   ============================================================ */
const MW_CONFIG = {
  API_KEY: "",            // Add a newly rotated key locally; never commit it to a public repository
  API_BASE: "https://api.themoviedb.org/3",
  IMG_BASE: "https://image.tmdb.org/t/p/",
  LANGUAGE: "en-US",
  REGION: "US",
  USE_DEMO: true,          // auto-disabled when an API key is present
  PAGE_SIZE: 24
};
if (MW_CONFIG.API_KEY && MW_CONFIG.API_KEY.length > 10) MW_CONFIG.USE_DEMO = false;
