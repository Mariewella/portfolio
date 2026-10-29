/* =========================================================
   Spoločná hlavička a pätička pre všetky stránky.
   Upravuj ich IBA TU — zmena sa prejaví na každej stránke.

   Na stránke stačí:
     <script src="js/layout.js"></script>   hneď za <body>  → vloží hlavičku
     <div data-site-footer></div>            za </main>      → nahradí sa pätičkou
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Položky menu: [adresa, text] ---------- */
  const NAV = [
    ['index.html', 'Home'],
    ['portfolio.html', 'Portfolio'],
    ['about.html', 'About me']
  ];

  /* ---------- Hlavička ---------- */
  const BRAND = 'DOMINIKA ŠKULAVIK';
  const INITIALS = 'DŠ'; // na mobile namiesto mena, ako favicon

  /* ---------- Pätička ---------- */
  const CV = 'files/Dominika_Skulavikova_CV.pdf';

  // kontakty ako ikony; prázdna adresa = ikona sa nezobrazí
  const SOCIAL = [
    ['Instagram', 'https://www.instagram.com/_shychill_/', '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>'],
    ['LinkedIn', 'https://www.linkedin.com/in/dominika-%C5%A1kulavikov%C3%A1-287928238/', '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>'],
    ['Email', 'mailto:skulavikova.d@gmail.com', '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'],
    ['Facebook', 'https://www.facebook.com/Little.Domka', '<path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z"/>']
  ];
  const socialLinks = SOCIAL.filter(function (s) { return s[1]; }).map(function (s) {
    const external = s[1].indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '';
    return '<li><a class="social__link" href="' + s[1] + '"' + external + '>' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + s[2] + '</svg>' +
      '<span class="visually-hidden">' + s[0] + '</span></a></li>';
  }).join('');

  const FOOTER = `
  <footer class="site-footer" id="contact">
    <div class="site-footer__inner">
      <h2 class="site-footer__title">Let’s join forces.</h2>
      <div class="site-footer__actions">
        <a class="cta" href="${CV}" download>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M6 10l6 6 6-6M4 21h16"/></svg>
          Hire me <span class="cta__meta">(CV)</span><span class="visually-hidden">, download PDF</span>
        </a>
        <ul class="social" aria-label="Contact and social profiles">${socialLinks}</ul>
      </div>
    </div>
    <p class="site-footer__legal">
      <span>© 2026 Dominika Škulavik. All rights reserved.</span>
      <button type="button" class="motion-toggle" aria-pressed="false">Pause animations</button>
    </p>
  </footer>`;

  /* ---------- Odtiaľto nižšie netreba nič meniť ---------- */
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  const links = NAV.map(function (item) {
    const current = item[0].toLowerCase() === page;
    return current
      ? '<a href="' + item[0] + '" aria-current="page">' + item[1] + '<span class="nav-indicator" aria-hidden="true"></span></a>'
      : '<a href="' + item[0] + '">' + item[1] + '</a>';
  }).join('\n      ');

  const HEADER = `
  <a class="skip-link" href="#content">Skip to content</a>
  <header class="site-header">
    <a class="brand" href="index.html" aria-label="${BRAND} — Home">
      <span class="brand__mark" aria-hidden="true">${INITIALS}</span>
      <span class="brand__name" aria-hidden="true">${BRAND}</span>
    </a>
    <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="main-nav">
      <span class="menu-toggle__bars" aria-hidden="true"></span>
      <span class="visually-hidden">Menu</span>
    </button>
    <nav class="main-nav" id="main-nav" aria-label="Main">
      ${links}
    </nav>
  </header>`;

  // vypnuté animácie si stránka pamätá (WCAG 2.2.2), trieda ide na <html> ešte pred vykreslením
  const MOTION_KEY = 'motion-off';
  let motionOff = false;
  try { motionOff = localStorage.getItem(MOTION_KEY) === '1'; } catch (e) { /* súkromné okno */ }
  document.documentElement.classList.toggle('motion-off', motionOff);

  /* ---------- Načítavacia obrazovka (len pri pomalom pripojení) ----------
     Rady a citát môžeš kedykoľvek doplniť alebo prepísať tu. */
  const TIPS = [
    'Press Start on the home screen to browse the game library.',
    'Open a folder on the desk to read the whole case file.',
    'Use the arrow keys to flip through the inventory.',
    'Too much motion? Pause animations in the footer.',
    'Every case file ends with what the project actually shipped.'
  ];
  const QUOTE = 'AI is a good servant but a bad master.';

  const LOADER = `
  <div class="loader" aria-hidden="true">
    <div class="loader__inner">
      <p class="loader__label">LOADING <span class="loader__pct">0</span>%</p>
      <div class="loader__bar"><span></span></div>
      <p class="loader__tip"><span class="loader__tag">TIP</span> <span class="loader__tip-text"></span></p>
      <figure class="loader__quote">
        <blockquote>“${QUOTE}”</blockquote>
        <figcaption>SURVIVOR’S RULE #1</figcaption>
      </figure>
    </div>
  </div>`;

  // hlavička hneď (skript je synchrónny, takže nič nepreblikne)
  document.currentScript.insertAdjacentHTML('beforebegin', LOADER + HEADER);

  (function initLoader() {
    const loader = document.querySelector('.loader');
    const pctEl = loader.querySelector('.loader__pct');
    const barEl = loader.querySelector('.loader__bar span');
    const tipEl = loader.querySelector('.loader__tip-text');
    // ukáže sa, len keď načítanie trvá dlhšie ako 0,6 s
    const showTimer = setTimeout(function () { loader.classList.add('is-visible'); }, 600);
    let tip = Math.floor(Math.random() * TIPS.length);
    tipEl.textContent = TIPS[tip];
    const tipTimer = setInterval(function () {
      tip = (tip + 1) % TIPS.length;
      tipEl.textContent = TIPS[tip];
    }, 3500);

    // percentá: HTML + písma + obrázky na stránke; číslo dobieha plynule
    let total = 2, done = 0, shown = 0, finished = false;
    function target() { return finished ? 100 : Math.min(95, (done / total) * 100); }
    const tick = setInterval(function () {
      const t = target();
      // po načítaní dobehne rýchlo, aby rýchle pripojenie obrazovku vôbec neuvidelo
      shown = Math.min(t, shown + (finished ? 25 : Math.max(1, (t - shown) * 0.2)));
      pctEl.textContent = Math.floor(shown);
      barEl.style.transform = 'scaleX(' + shown / 100 + ')';
      if (finished && shown >= 100) hide();
    }, 50);

    document.addEventListener('DOMContentLoaded', function () {
      done++;
      Array.prototype.forEach.call(document.images, function (img) {
        if (img.complete) return;
        total++;
        img.addEventListener('load', function () { done++; }, { once: true });
        img.addEventListener('error', function () { done++; }, { once: true });
      });
      if (document.fonts) document.fonts.ready.then(function () { done++; }); else done++;
    });
    window.addEventListener('load', function () { finished = true; });
    setTimeout(function () { finished = true; }, 20000); // poistka, nikdy neostane visieť

    function hide() {
      clearInterval(tick);
      clearInterval(tipTimer);
      clearTimeout(showTimer);
      loader.classList.add('is-done');
      setTimeout(function () { loader.remove(); }, 400);
    }
  })();

  // hamburger menu na mobile: podstránky cez celú obrazovku
  const menuBtn = document.querySelector('.menu-toggle');
  const header = document.querySelector('.site-header');
  function setMenu(open) {
    document.documentElement.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    // zvyšok stránky je počas otvoreného menu nedostupný pre klávesnicu aj čítačku
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el !== header && !el.classList.contains('skip-link') && el.tagName !== 'SCRIPT') el.inert = open;
    });
    if (open) header.querySelector('.main-nav a').focus();
  }
  menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
  });
  // po návrate tlačidlom Späť ani po zväčšení okna na desktop menu neostane otvorené
  window.addEventListener('pagehide', function () { setMenu(false); });
  window.matchMedia('(min-width: 641px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });

  // pätička, keď je stránka načítaná
  document.addEventListener('DOMContentLoaded', function () {
    const slot = document.querySelector('[data-site-footer]');
    if (slot) slot.outerHTML = FOOTER;

    const toggle = document.querySelector('.motion-toggle');
    function setMotion(off) {
      motionOff = off;
      document.documentElement.classList.toggle('motion-off', off);
      toggle.setAttribute('aria-pressed', String(off));
      toggle.textContent = off ? 'Play animations' : 'Pause animations';
      try { localStorage.setItem(MOTION_KEY, off ? '1' : '0'); } catch (e) { /* nevadí */ }
      document.dispatchEvent(new CustomEvent('motionchange', { detail: { off: off } }));
    }
    if (toggle) {
      setMotion(motionOff);
      toggle.addEventListener('click', function () { setMotion(!motionOff); });
    }

    // odkazy do nového okna to povedia aj čítačke obrazovky
    document.querySelectorAll('a[target="_blank"]').forEach(function (a) {
      if (a.querySelector('.visually-hidden')) return;
      a.insertAdjacentHTML('beforeend', '<span class="visually-hidden"> (opens in a new tab)</span>');
    });
  });
})();
