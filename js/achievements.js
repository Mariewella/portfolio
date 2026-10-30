/* =========================================================
   Achievementy (trofeje)
   Ukladajú sa len v prehliadači návštevníka (localStorage)
   spolu s dátumom odomknutia; nikam sa neposielajú.

   Na stránke:  <script src="js/achievements.js"></script>  hneď za layout.js
   Odomknutie:  window.trophies.unlock('id')  (napr. z main.js alebo 404.js)

   Texty môžeš prepísať tu, id nechaj, inak sa stratí uložený postup.
   Podmienka (hint) sa ukáže až po odomknutí; dovtedy je utajená.
   ========================================================= */
(function () {
  'use strict';

  const TEAL = '#14b3ac', AMBER = '#f0a24a', RED = '#ef5a50';

  // id, názov, kategória, podmienka, hláška pri odomknutí, farba znaku, kresba znaku (SVG 140×140)
  const LIST = [
    {
      id: 'welcome', title: 'Welcome!', tag: 'Entrance', color: AMBER,
      hint: 'Visit the site for the first time.', line: 'The door is open.',
      art: '<rect x="52" y="42" width="36" height="62" fill="#f0a24a" fill-opacity="0.22"/><path d="M54 104 H86 L102 116 H38 Z" fill="#f0a24a" fill-opacity="0.3"/><g fill="none" stroke="#f0a24a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M50 104 V40 H90 V104"/><path d="M90 40 L104 33 V111 L90 104"/><circle cx="99" cy="74" r="2"/></g>'
    },
    {
      id: 'firstDocument', title: 'Find the first document', tag: 'Case file', color: RED,
      hint: 'Read a case file from the first page to the last.', line: 'Case file read.',
      art: '<path d="M46 34 H84 L96 46 V108 H46 Z" fill="#e8dfc6"/><path d="M84 34 V46 H96" fill="#c3b89c"/><g stroke="#9a8f78" stroke-width="2" stroke-linecap="round"><path d="M54 56 H86"/><path d="M54 64 H88"/><path d="M54 72 H80"/><path d="M54 80 H86"/></g><path d="M56 26 V44 a5 5 0 0 0 10 0 V30" fill="none" stroke="#a39d8c" stroke-width="2.2" stroke-linecap="round"/><g transform="rotate(-10 72 96)"><rect x="56" y="88" width="34" height="15" fill="none" stroke="#9c1f19" stroke-width="1.8"/><text x="73" y="99.5" text-anchor="middle" font-family="Special Elite, monospace" font-size="10" fill="#9c1f19">READ</text></g>'
    },
    {
      id: 'hoarder', title: 'Hoarder', tag: 'Inventory', color: TEAL,
      hint: 'Examine every item in the inventory.', line: 'Inventory catalogued.',
      art: '<g fill="#14b3ac" fill-opacity="0.35"><rect x="39" y="49" width="11" height="11" rx="1.5"/><rect x="56" y="49" width="11" height="11" rx="1.5"/><rect x="73" y="49" width="11" height="11" rx="1.5"/><rect x="90" y="49" width="11" height="11" rx="1.5"/><rect x="39" y="66" width="11" height="11" rx="1.5"/><rect x="56" y="66" width="11" height="11" rx="1.5"/><rect x="73" y="66" width="11" height="11" rx="1.5"/><rect x="90" y="66" width="11" height="11" rx="1.5"/><rect x="39" y="83" width="11" height="11" rx="1.5"/><rect x="56" y="83" width="11" height="11" rx="1.5"/><rect x="73" y="83" width="11" height="11" rx="1.5"/></g><g fill="none" stroke="#14b3ac" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="34" y="44" width="72" height="54" rx="3"/><path d="M60 44 V37 H80 V44"/><path d="M53 44 V98 M70 44 V98 M87 44 V98 M34 62 H106 M34 80 H106" stroke-width="1.2" stroke-opacity="0.6"/></g><circle cx="96" cy="92" r="11" fill="#0e100e" stroke="#f6efdc" stroke-width="2.5"/><path d="M104 100 L113 109" stroke="#f6efdc" stroke-width="3.5" stroke-linecap="round"/>'
    },
    {
      id: 'hired', title: 'Hired?', tag: 'Dossier', color: AMBER,
      hint: 'Download the CV.', line: 'Dossier acquired.',
      art: '<path d="M46 28 H80 L92 40 V98 H46 Z" fill="#e8dfc6"/><path d="M80 28 V40 H92" fill="#c3b89c"/><text x="58" y="54" font-family="Special Elite, monospace" font-size="17" fill="#2b2620">CV</text><path d="M69 62 V86 M60 78 L69 87 L78 78" fill="none" stroke="#a8231d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 104 V112 H94 V104" fill="none" stroke="#f0a24a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="99" cy="32" r="11" fill="#0e100e" stroke="#f0a24a" stroke-width="2"/><text x="99" y="37.5" text-anchor="middle" font-family="IM Fell English SC, Georgia, serif" font-size="16" fill="#f0a24a">?</text>'
    },
    {
      id: 'mainCharacter', title: 'Know the main character', tag: 'Profile', color: TEAL,
      hint: 'Read About me to the end and try every active skill.', line: 'Profile complete.',
      art: '<rect x="44" y="26" width="52" height="68" rx="4" fill="#14b3ac" fill-opacity="0.1"/><g fill="none" stroke="#14b3ac" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="44" y="26" width="52" height="68" rx="4"/><path d="M62 33 H78"/><circle cx="70" cy="54" r="10"/><path d="M54 86 C54 74 86 74 86 86"/></g><path d="M22 108 H50 L55 100 L61 118 L66 104 L70 108 H118" fill="none" stroke="#ef5a50" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'youDied', title: 'You died!', tag: 'Danger', color: RED, ground: '#1c1614',
      hint: 'Find the page that doesn’t exist.', line: 'Continue?',
      art: '<rect x="30" y="36" width="80" height="52" rx="4" fill="#0e100e" stroke="#ef5a50" stroke-width="2.5"/><path d="M30 52 H110 M30 72 H110 M56 36 V88 M84 36 V88" stroke="#ef5a50" stroke-opacity="0.18" stroke-width="1"/><path d="M36 64 H46 L50 52 L55 78 L59 64 H104" fill="none" stroke="#ef5a50" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><text x="70" y="114" text-anchor="middle" font-family="Special Elite, monospace" font-size="20" letter-spacing="3" fill="#ef5a50">404</text>'
    },
    {
      id: 'notTheFlashes', title: 'Not the flashes', tag: 'Settings', color: AMBER,
      hint: 'Pause the animations.', line: 'Lights steady.',
      art: '<g stroke="#f0a24a" stroke-opacity="0.4" stroke-width="2" stroke-linecap="round"><path d="M40 40 L46 46"/><path d="M34 62 H42"/><path d="M98 34 L94 42"/></g><path d="M74 28 L50 72 H66 L58 110 L90 62 H73 L84 28 Z" fill="#f0a24a" fill-opacity="0.18" stroke="#f0a24a" stroke-width="2.5" stroke-linejoin="round"/><circle cx="94" cy="94" r="17" fill="#0e100e" stroke="#f6efdc" stroke-width="2.5"/><rect x="87" y="86" width="5" height="16" rx="1" fill="#f6efdc"/><rect x="96" y="86" width="5" height="16" rx="1" fill="#f6efdc"/>'
    },
    {
      id: 'getInTouch', title: 'Get in touch', tag: 'Radio', color: TEAL,
      hint: 'Reach out on a social network or by e-mail.', line: 'Signal received.',
      art: '<rect x="54" y="46" width="32" height="62" rx="5" fill="#14b3ac" fill-opacity="0.1"/><g fill="none" stroke="#14b3ac" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="54" y="46" width="32" height="62" rx="5"/><path d="M60 46 V26"/><path d="M61 58 H79 M61 64 H79 M61 70 H79"/><circle cx="70" cy="90" r="6"/><path d="M96 54 A14 14 0 0 1 96 78"/><path d="M104 46 A24 24 0 0 1 104 86"/><path d="M44 54 A14 14 0 0 0 44 78"/><path d="M36 46 A24 24 0 0 0 36 86"/></g><circle cx="80" cy="52" r="2.2" fill="#ef5a50"/>'
    }
  ];

  const KEY = 'trophies';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { /* súkromné okno: postup sa nepamätá */ }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* nevadí */ }
  }

  function count() {
    return LIST.filter(function (a) { return saved[a.id]; }).length;
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /* ---------- Znaky (osemuholník s kresbou alebo zámok) ---------- */
  const OCTAGON = '42,6 98,6 134,42 134,98 98,134 42,134 6,98 6,42';
  const INNER = '46,16 94,16 124,46 124,94 94,124 46,124 16,94 16,46';

  function emblem(a) {
    return '<svg class="emblem" viewBox="0 0 140 140" aria-hidden="true" focusable="false">' +
      '<polygon points="' + OCTAGON + '" fill="' + (a.ground || '#0e100e') + '" stroke="' + a.color + '" stroke-width="2"/>' +
      '<polygon points="' + INNER + '" fill="' + a.color + '" fill-opacity="0.06" stroke="' + a.color + '" stroke-opacity="0.45" stroke-width="1" stroke-dasharray="3 4"/>' +
      '<g fill="' + a.color + '"><circle cx="70" cy="11" r="1.8"/><circle cx="129" cy="70" r="1.8"/><circle cx="70" cy="129" r="1.8"/><circle cx="11" cy="70" r="1.8"/></g>' +
      a.art + '</svg>';
  }

  const LOCK = '<svg class="emblem" viewBox="0 0 140 140" aria-hidden="true" focusable="false">' +
    '<polygon points="' + OCTAGON + '" fill="#101210" stroke="#3a3d38" stroke-width="2"/>' +
    '<polygon points="' + INNER + '" fill="none" stroke="#4a4d47" stroke-width="1" stroke-dasharray="3 4"/>' +
    '<g fill="none" stroke="#a39d8c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M56 64 V54 a14 14 0 0 1 28 0 V64"/><rect x="48" y="64" width="44" height="36" rx="4"/></g>' +
    '<circle cx="70" cy="79" r="4" fill="#a39d8c"/><path d="M70 82 V90" stroke="#a39d8c" stroke-width="3" stroke-linecap="round"/></svg>';

  /* ---------- Tlačidlo v navigácii ---------- */
  const nav = document.querySelector('.main-nav');
  const navBtn = document.createElement('button');
  navBtn.type = 'button';
  navBtn.className = 'nav-trophies';
  navBtn.setAttribute('aria-haspopup', 'dialog');
  nav.appendChild(navBtn);

  function updateNav() {
    navBtn.innerHTML = 'Your trophies <span class="nav-trophies__count">' + count() + '/' + LIST.length + '</span>';
  }
  updateNav();

  /* ---------- Zoznam trofejí (dialóg) ---------- */
  const box = document.createElement('dialog');
  box.className = 'trophies';
  box.setAttribute('aria-labelledby', 'trophies-title');
  box.innerHTML =
    '<button type="button" class="trophies__close" data-tr="close">Close ✕</button>' +
    '<header class="trophies__head">' +
      '<div class="trophies__intro">' +
        '<p class="trophies__eyebrow">Case log · Achievements</p>' +
        '<h2 class="trophies__title" id="trophies-title">Trophies</h2>' +
        '<p class="trophies__lead">Evidence recovered while exploring the site.</p>' +
      '</div>' +
      '<div class="trophies__progress">' +
        '<p>Progress <span class="trophies__count"></span></p>' +
      '</div>' +
    '</header>' +
    '<ul class="trophies__list"></ul>' +
    '<footer class="trophies__foot">' +
      '<p>Saved only in this browser, on this device.</p>' +
      '<div class="trophies__reset"></div>' +
    '</footer>';
  const listEl = box.querySelector('.trophies__list');
  const countEl = box.querySelector('.trophies__count');
  const resetEl = box.querySelector('.trophies__reset');

  function renderList() {
    countEl.textContent = count() + ' / ' + LIST.length;
    listEl.innerHTML = LIST.map(function (a, i) {
      const when = saved[a.id];
      const no = 'No. ' + String(i + 1).padStart(2, '0');
      return '<li class="trophy' + (when ? ' is-unlocked' : '') + '">' +
        '<p class="trophy__no">' + no + (when ? ' · ' + a.tag : '') + '</p>' +
        '<div class="trophy__emblem">' + (when ? emblem(a) : LOCK) + '</div>' +
        '<div class="trophy__body">' +
          '<h3 class="trophy__title">' + a.title + '</h3>' +
          '<p class="trophy__hint">' + (when ? a.hint : 'Classified. Keep exploring.') + '</p>' +
          '<span class="trophy__stamp">' + (when
            ? 'Unlocked · <time datetime="' + when + '">' + formatDate(when) + '</time>'
            : 'Locked') + '</span>' +
        '</div>' +
        '</li>';
    }).join('');
  }

  function resetButtons(confirming) {
    resetEl.innerHTML = confirming
      ? '<span>Lose all trophies?</span><button type="button" data-tr="reset-yes">Yes, reset</button><button type="button" data-tr="reset-no">Keep them</button>'
      : '<button type="button" data-tr="reset">Reset progress</button>';
  }

  box.addEventListener('click', function (e) {
    const b = e.target.closest('[data-tr]');
    if (!b) { if (e.target === box) box.close(); return; } // klik mimo zoznamu
    const action = b.dataset.tr;
    if (action === 'close') box.close();
    if (action === 'reset') { resetButtons(true); resetEl.querySelector('button').focus(); }
    if (action === 'reset-no') { resetButtons(false); resetEl.querySelector('button').focus(); }
    if (action === 'reset-yes') {
      saved = {};
      save();
      renderList();
      updateNav();
      resetButtons(false);
      resetEl.querySelector('button').focus();
    }
  });
  // na mobile je tlačidlo v zatvorenom menu skryté, fokus ide na hamburger
  box.addEventListener('close', function () {
    (navBtn.offsetParent ? navBtn : document.querySelector('.menu-toggle')).focus();
  });

  navBtn.addEventListener('click', function () {
    // na mobile najprv zavrie menu cez celú obrazovku
    const menuBtn = document.querySelector('.menu-toggle[aria-expanded="true"]');
    if (menuBtn) menuBtn.click();
    renderList();
    resetButtons(false);
    box.showModal();
    box.scrollTop = 0;
  });

  /* ---------- Hláška „Trophy unlocked“ (ako rádiový prenos) ---------- */
  const toast = document.createElement('div');
  toast.className = 'trophy-toast';
  toast.setAttribute('role', 'status');
  const queue = [];
  let showing = false;

  function next() {
    const a = queue.shift();
    if (!a) { showing = false; return; }
    showing = true;
    toast.innerHTML =
      '<span class="trophy-toast__emblem">' + emblem(a) + '</span>' +
      '<span class="trophy-toast__text">' +
        '<span class="trophy-toast__label">Trophy unlocked</span>' +
        '<strong class="trophy-toast__title">' + a.title + '</strong>' +
        '<span class="trophy-toast__line">' + a.line + '</span>' +
      '</span>';
    toast.classList.add('is-visible');
    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(next, 400);
    }, 5000);
  }

  function unlock(id) {
    const a = LIST.find(function (item) { return item.id === id; });
    if (!a || saved[id]) return;
    saved[id] = new Date().toISOString();
    save();
    updateNav();
    if (box.open) renderList();
    queue.push(a);
    if (!showing && toast.isConnected) next();
  }

  window.trophies = { unlock: unlock };

  /* ---------- Odomykanie, ktoré netreba riešiť inde ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    document.body.append(box, toast);
    unlock('welcome');
    // chvíľu počká: čítačka si všimne novú oblasť a hláška nezapadne pod načítavaciu obrazovku
    if (queue.length && !showing) { showing = true; setTimeout(next, 800); }
  });

  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (link && /Dominika_Skulavikova_CV\.pdf$/.test(link.getAttribute('href') || '')) unlock('hired');
    if (link && link.classList.contains('social__link')) unlock('getInTouch');
    // prepínač v pätičke už zmenil stav, keď sem klik dobublá
    if (e.target.closest('.motion-toggle') && document.documentElement.classList.contains('motion-off')) unlock('notTheFlashes');
  });
})();
