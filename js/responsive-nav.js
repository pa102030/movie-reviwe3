
/*
  MOVIES WORLD - Responsive navigation fix
  This script works with the existing header markup.

  It:
  - turns the existing hamburger into a real mobile menu
  - adds a Years link if the current nav doesn't have one
  - puts Home/Movies/Reviews/Genres/Top Rated/Latest/Years/
    Watchlist/Profile into the mobile menu
  - closes the menu after a link is selected
  - prevents the old hamburger's data-open-search behavior
*/

(function () {
  "use strict";

  function initResponsiveNav() {
    const header = document.querySelector(".site-header");
    const nav = document.querySelector(".main-nav");
    const actions = document.querySelector(".header-actions");
    if (!header || !nav || !actions) return;

    let hamburger = actions.querySelector(".hamburger");

    // Create a hamburger if the current page doesn't have one.
    if (!hamburger) {
      hamburger = document.createElement("button");
      hamburger.className = "icon-btn hamburger";
      hamburger.type = "button";
      hamburger.setAttribute("aria-label", "Open menu");
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
      actions.appendChild(hamburger);
    }

    // Stop the old [data-open-search] handler from treating hamburger as Search.
    hamburger.removeAttribute("data-open-search");
    hamburger.type = "button";

    // Add Years to desktop navigation if it is missing.
    const hasYears = Array.from(nav.querySelectorAll("a")).some(a =>
      a.textContent.trim().toLowerCase() === "years"
    );

    if (!hasYears) {
      const years = document.createElement("a");
      years.href = "movies.html?year=2026";
      years.textContent = "Years";
      nav.appendChild(years);
    }

    // Build mobile menu once.
    let menu = document.querySelector(".mw-mobile-menu");
    if (!menu) {
      menu = document.createElement("div");
      menu.className = "mw-mobile-menu";
      menu.setAttribute("aria-hidden", "true");

      menu.innerHTML = `
        <div class="mw-mobile-menu__inner">
          <div class="mw-mobile-menu__top">
            <div class="mw-mobile-menu__title">MOVIES WORLD</div>
            <button class="mw-mobile-menu__close" type="button"
                    aria-label="Close menu">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="mw-mobile-menu__section">Navigation</div>
          <div class="mw-mobile-links"></div>

          <div class="mw-mobile-menu__section">Account</div>
          <a href="watchlist.html">
            <span><i class="fa-solid fa-bookmark"></i> Watchlist</span>
            <i class="fa-solid fa-chevron-right"></i>
          </a>
          <a href="watchlist.html">
            <span><i class="fa-solid fa-user"></i> Profile</span>
            <i class="fa-solid fa-chevron-right"></i>
          </a>
        </div>
      `;

      document.body.appendChild(menu);
    }

    const linksBox = menu.querySelector(".mw-mobile-links");

    // Copy desktop navigation into mobile navigation.
    linksBox.innerHTML = "";
    Array.from(nav.querySelectorAll("a")).forEach((sourceLink) => {
      const link = sourceLink.cloneNode(true);
      link.innerHTML = sourceLink.innerHTML;

      const wrap = document.createElement("a");
      wrap.href = sourceLink.href;
      wrap.innerHTML =
        "<span>" + sourceLink.textContent.trim() + "</span>" +
        '<i class="fa-solid fa-chevron-right"></i>';

      linksBox.appendChild(wrap);
    });

    function openMenu() {
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      document.body.classList.add("mw-menu-open");
      hamburger.setAttribute("aria-expanded", "true");
      const icon = hamburger.querySelector("i");
      if (icon) icon.className = "fa-solid fa-xmark";
    }

    function closeMenu() {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      document.body.classList.remove("mw-menu-open");
      hamburger.setAttribute("aria-expanded", "false");
      const icon = hamburger.querySelector("i");
      if (icon) icon.className = "fa-solid fa-bars";
    }

    hamburger.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      menu.classList.contains("is-open") ? closeMenu() : openMenu();
    });

    menu.querySelector(".mw-mobile-menu__close")
      .addEventListener("click", closeMenu);

    menu.addEventListener("click", function (event) {
      const link = event.target.closest("a");
      if (link) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    // If user rotates/resizes back to desktop, close the drawer.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1180) closeMenu();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initResponsiveNav);
  } else {
    initResponsiveNav();
  }
})();
