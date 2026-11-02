/* =========================================================
   Na stránke 404, ako prvý skript v <head>.
   GitHub Pages nepozná adresu /portfolio/claim (nie je to súbor),
   takže ukáže 404. Tento skript ju hneď pošle na Portfolio
   s otvoreným spisom; zvyšok 404 sa ani nenačíta.
   ========================================================= */
(function () {
  'use strict';
  const m = location.pathname.match(/^\/portfolio\/([a-z]+)\/?$/);
  if (!m) return;
  window.stop(); // ďalšie skripty 404 (trofej You died!, analytika) sa nespustia
  location.replace('/portfolio' + location.search + '#' + m[1]);
})();
