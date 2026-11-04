/* MOVIES WORLD - API layer (TMDB + Demo fallback) */
"use strict";

const MW_API = (() => {
  let DB = [];         // demo database
  let cache = new Map(); // simple in-memory cache

  async function init() {
    if (MW_CONFIG.USE_DEMO) {
      try {
        const res = await fetch("data/movies.json");
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        DB = json.movies || [];
      } catch (e) {
        console.error("Demo DB failed to load:", e);
        DB = [];
      }
    }
    return DB;
  }

  function img(path, size) {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return MW_CONFIG.IMG_BASE + (size || "w500") + path;
  }

  /* ---------- helpers: demo mode ---------- */
  const sortFns = {
    rating:    (a, b) => b.rating - a.rating,
    newest:    (a, b) => b.year - a.year || b.votes - a.votes,
    oldest:    (a, b) => a.year - b.year,
    title:     (a, b) => a.title.localeCompare(b.title),
    popularity:(a, b) => b.votes - a.votes
  };

  function demoQuery({ year, genre, language, minRating, sort, search, page, size }) {
    let list = [...DB];
    if (year)        list = list.filter(m => m.year === +year);
    if (genre)       list = list.filter(m => m.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
    if (language)    list = list.filter(m => m.language.toLowerCase() === language.toLowerCase());
    if (minRating)   list = list.filter(m => m.rating >= +minRating);
    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        (m.director || "").toLowerCase().includes(q) ||
        (m.cast || []).some(c => (typeof c === "object" ? c.name : c).toLowerCase().includes(q)) ||
        (m.genres || []).some(g => g.toLowerCase().includes(q)) ||
        String(m.year) === q
      );
    }
    list.sort(sortFns[sort || "popularity"]);
    const s = size || MW_CONFIG.PAGE_SIZE;
    const p = page || 1;
    return { results: list.slice((p - 1) * s, p * s), total: list.length, page: p };
  }

  /* ---------- helpers: TMDB mode ---------- */
  async function tmdb(path, params) {
    const key = MW_CONFIG.API_KEY;
    const url = new URL(MW_CONFIG.API_BASE + path);
    url.searchParams.set("api_key", key);
    url.searchParams.set("language", MW_CONFIG.LANGUAGE);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    if (cache.has(url.href)) return cache.get(url.href);
    const res = await fetch(url.href);
    if (!res.ok) throw new Error("TMDB request failed: " + res.status);
    const json = await res.json();
    cache.set(url.href, json);
    return json;
  }

  function tmdbToMovie(m) {
    return {
      id: m.id, title: m.title, originalTitle: m.original_title,
      year: m.release_date ? +m.release_date.slice(0, 4) : null,
      releaseDate: m.release_date, rating: Math.round(m.vote_average * 10) / 10,
      votes: m.vote_count, overview: m.overview, tagline: m.tagline || "",
      poster: img(m.poster_path, "w500"), backdrop: img(m.backdrop_path, "original"),
      genres: (m.genres || []).map(g => g.name),
      runtime: m.runtime || null, language: m.original_language,
      country: (m.production_countries || []).map(c => c.name),
      director: m.director || null, cast: m.cast || [], ageRating: m.certification || null,
      watch: [], review: null, budget: m.budget, boxOffice: m.revenue, trailer: m.trailer || null
    };
  }

  async function tmdbDiscover(opts) {
    const params = { page: opts.page || 1, "vote_count.gte": 200 };
    if (opts.year)        params["primary_release_year"] = opts.year;
    if (opts.minRating)   params["vote_average.gte"] = opts.minRating;
    if (opts.sort === "rating")      params.sort_by = "vote_average.desc";
    else if (opts.sort === "newest")  params.sort_by = "primary_release_date.desc";
    else if (opts.sort === "oldest")  params.sort_by = "primary_release_date.asc";
    else if (opts.sort === "title")   params.sort_by = "title.asc";
    else params.sort_by = "popularity.desc";
    if (opts.releaseLte) params["primary_release_date.lte"] = opts.releaseLte;

    let data;

    if (opts.search) {
      const sParams = { query: opts.search, page: opts.page || 1, include_adult: "false" };
      data = await tmdb("/search/movie", sParams);
    } else {
      if (opts.genre) {
        const allGenres = await genres();
        const found = allGenres.find(g => g.name.toLowerCase() === opts.genre.toLowerCase());
        if (found) {
          params.with_genres = found.id;
        }
      }
      data = await tmdb("/discover/movie", params);
    }

    const movies = (data.results || [])
      .filter(m => { const y = m.release_date ? +m.release_date.slice(0,4) : 0; return y >= 2000 && y <= 2026; })
      .map(m => tmdbToMovie(m));

    return { results: movies, total: data.total_results, page: data.page };
  }

  /* ---------- public API ---------- */
  async function discover(opts = {}) {
    if (!MW_CONFIG.USE_DEMO) return tmdbDiscover(opts);
    return demoQuery(opts);
  }

  async function getMovie(id) {
    if (!MW_CONFIG.USE_DEMO) {
      const m = await tmdb("/movie/" + id, { append_to_response: "credits,videos,release_dates" });
      const director = (m.credits.crew || []).find(c => c.job === "Director");
      const trailer = (m.videos.results || []).find(v => v.site === "YouTube" && v.type === "Trailer");
      const cert = (m.release_dates.results || []).find(r => r.iso_3166_1 === MW_CONFIG.REGION);
      const movie = tmdbToMovie(m);
      movie.director = director ? director.name : null;
      
      // Updated to map full cast object including profile_path, name, and character
      movie.cast = (m.credits.cast || []).slice(0, 20).map(c => ({
        name: c.name,
        character: c.character,
        profile_path: c.profile_path
      }));

      movie.trailer = trailer ? "https://www.youtube.com/embed/" + trailer.key : null;
      movie.ageRating = cert && cert.release_dates[0] ? cert.release_dates[0].certification : null;
      movie.watch = await getWatchProviders(id);
      return movie;
    }
    const m = DB.find(x => String(x.id) === String(id));
    if (!m) throw new Error("Movie not found");
    return m;
  }

  async function getWatchProviders(id) {
    if (MW_CONFIG.USE_DEMO) return [];
    try {
      const data = await tmdb("/movie/" + id + "/watch/providers");
      const r = data.results[MW_CONFIG.REGION];
      if (!r) return [];
      const map = (arr, type) => (arr || []).slice(0, 4).map(p => ({ name: p.provider_name, type }));
      return [...map(r.flatrate, "stream"), ...map(r.rent, "rent"), ...map(r.buy, "buy")];
    } catch (e) { return []; }
  }

  async function getTrailer(id) {
    if (MW_CONFIG.USE_DEMO) return null;
    try {
      const data = await tmdb("/movie/" + id + "/videos");
      const t = (data.results || []).find(v => v.site === "YouTube" && v.type === "Trailer");
      return t ? "https://www.youtube.com/embed/" + t.key + "?autoplay=1&rel=0" : null;
    } catch (e) { return null; }
  }

  async function search(q, limit = 8) {
    if (!MW_CONFIG.USE_DEMO) {
      const data = await tmdb("/search/movie", { query: q, include_adult: "false", page: 1 });
      return data.results.filter(m => m.release_date && +m.release_date.slice(0,4) <= 2026)
        .slice(0, limit).map(tmdbToMovie);
    }
    return demoQuery({ search: q, sort: "popularity", size: limit }).results;
  }

  async function similar(id, limit = 10) {
    if (!MW_CONFIG.USE_DEMO) {
      const data = await tmdb("/movie/" + id + "/similar");
      return data.results.slice(0, limit).map(tmdbToMovie);
    }
    const m = DB.find(x => String(x.id) === String(id));
    if (!m) return [];
    const g = m.genres[0];
    return DB.filter(x => x.id !== m.id && x.genres.includes(g))
      .sort((a,b) => b.rating - a.rating).slice(0, limit);
  }

  async function genres() {
    if (!MW_CONFIG.USE_DEMO) return tmdb("/genre/movie/list").then(d => d.genres);
    return [...new Set(DB.flatMap(m => m.genres))].map(name => ({ id: name, name }));
  }

  const featured = () => discover({ sort: "rating", size: 1 }).then(r => r.results[0] || null);

  return { init, discover, getMovie, search, similar, genres, featured, getTrailer, img,
           isDemo: () => MW_CONFIG.USE_DEMO, all: () => DB };
})();
