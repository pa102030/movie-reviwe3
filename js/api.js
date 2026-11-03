/* MOVIES WORLD - API Wrapper */
"use strict";

const MW_API = {
  async init() {
    return true;
  },
  isDemo() {
    return false;
  },
  async fetchJSON(url) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data.results || data;
    } catch (e) {
      return [];
    }
  },
  async getTrending() {
    const data = await this.fetchJSON(`${MW_CONFIG.apiBase}/trending/movie/week?api_key=${MW_CONFIG.apiKey}`);
    return this.formatMovies(data);
  },
  async getPopular() {
    const data = await this.fetchJSON(`${MW_CONFIG.apiBase}/movie/popular?api_key=${MW_CONFIG.apiKey}`);
    return this.formatMovies(data);
  },
  async getTopRated() {
    const data = await this.fetchJSON(`${MW_CONFIG.apiBase}/movie/top_rated?api_key=${MW_CONFIG.apiKey}`);
    return this.formatMovies(data);
  },
  async search(query) {
    const data = await this.fetchJSON(`${MW_CONFIG.apiBase}/search/movie?api_key=${MW_CONFIG.apiKey}&query=${encodeURIComponent(query)}`);
    return this.formatMovies(data);
  },
  formatMovies(list) {
    if (!Array.isArray(list)) return [];
    return list.map(m => ({
      id: m.id,
      title: m.title || m.name,
      year: m.release_date ? m.release_date.split('-')[0] : '2026',
      rating: m.vote_average || 7.0,
      poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
      backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
      overview: m.overview,
      trailer_key: ""
    }));
  }
};
