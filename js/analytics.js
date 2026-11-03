/* =========================================================
   Google Analytics 4 — načíta sa AŽ po súhlase návštevníka (GDPR)
   Na stránke:  <script src="js/analytics.js"></script>  vysoko v <head>

   Rozhodnutie sa pamätá v prehliadači; zmeniť ho dá tlačidlo
   „Cookie settings“ v pätičke. Na localhoste sa nemeria nič.
   Udalosti (konverzie):  window.analytics.event('nazov', { ... })
   ========================================================= */
(function () {
  'use strict';

  const GA_ID = 'G-5GWMT3L1D0';
  const KEY = 'analytics-consent'; // 'granted' | 'denied'
  const LIVE = location.hostname === 'www.dominika-skulavik.com' || location.hostname === 'dominika-skulavik.com';

  let consent = null;
  try { consent = localStorage.getItem(KEY); } catch (e) { /* súkromné okno: lišta sa ukáže znova */ }

  // pamäť webu (trofeje, nájdené súbory, pauza animácií) sa dá vypnúť v nastaveniach;
  // ostatné skripty sa pýtajú window.siteMemory.allowed() predtým, než niečo uložia
  const MEMORY_KEY = 'site-memory'; // 'off' = web si nič nepamätá
  const MEMORY_ITEMS = ['motion-off', 'trophies', 'found-files'];
  let memory = true;
  try { memory = localStorage.getItem(MEMORY_KEY) !== 'off'; } catch (e) { /* nevadí */ }
  window.siteMemory = { allowed: function () { return memory; } };

  let loaded = false;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function load() {
    if (loaded || !LIVE) return;
    loaded = true;
    gtag('js', new Date());
    gtag('config', GA_ID);
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  // vráti true, ak treba stránku načítať znova (GA už bežal)
  function setConsent(value) {
    consent = value;
    try { localStorage.setItem(KEY, value); } catch (e) { /* nevadí */ }
    if (value === 'granted') { load(); return false; }
    if (!loaded) return false;
    // odvolaný súhlas: zmaže cookies Google Analytics a stránku načíta bez merania
    document.cookie.split(';').forEach(function (c) {
      const name = c.split('=')[0].trim();
      if (name.indexOf('_ga') === 0) {
        ['', '; domain=.dominika-skulavik.com', '; domain=' + location.hostname].forEach(function (d) {
          document.cookie = name + '=; Max-Age=0; path=/' + d;
        });
      }
    });
    return true;
  }

  // vráti true, ak treba stránku načítať znova (aby zabudla, čo mala v pamäti)
  function setMemory(on) {
    if (on === memory) return false;
    memory = on;
    try {
      if (on) localStorage.removeItem(MEMORY_KEY);
      else {
        localStorage.setItem(MEMORY_KEY, 'off');
        MEMORY_ITEMS.forEach(function (k) { localStorage.removeItem(k); });
      }
    } catch (e) { /* nevadí */ }
    return !on;
  }

  if (consent === 'granted') load();

  window.analytics = {
    // konverzia; bez súhlasu sa nepošle nič
    event: function (name, params) {
      if (loaded) gtag('event', name, params || {});
    }
  };

  /* ---------- Čo web ukladá (zobrazí sa v nastaveniach) ----------
     [názov, platnosť, popis, kto]; pri zmene na webe uprav aj tu */
  const SITE = 'dominika-skulavik.com';
  // vždy uložené, inak by sa lišta so súhlasom pýtala na každej stránke
  const ALWAYS = [
    ['analytics-consent', 'Until you clear it', 'Remembers your choice about analytics.', SITE],
    ['site-memory', 'Until you clear it', 'Remembers that you switched the site memory off.', SITE]
  ];
  const NECESSARY = [
    ['motion-off', 'Until you clear it', 'Remembers whether you paused the animations.', SITE],
    ['trophies', 'Until you clear it', 'Your unlocked trophies and the date you got each one.', SITE],
    ['found-files', 'Until you clear it', 'Which case file documents you have already opened.', SITE]
  ];
  const ANALYTICS = [
    ['_ga', '2 years', 'Tells one visit from another, so the same visitor isn’t counted twice.', 'Google'],
    ['_ga_' + GA_ID.replace('G-', ''), '2 years', 'Keeps the state of your current visit for this site’s statistics.', 'Google']
  ];

  function rows(list) {
    return '<ul class="cookies__list">' + list.map(function (c) {
      return '<li class="cookie"><code class="cookie__name">' + c[0] + '</code>' +
        '<dl class="cookie__meta">' +
          '<div><dt>Expires</dt><dd>' + c[1] + '</dd></div>' +
          '<div><dt>Purpose</dt><dd>' + c[2] + '</dd></div>' +
          '<div><dt>Set by</dt><dd>' + c[3] + '</dd></div>' +
        '</dl></li>';
    }).join('') + '</ul>';
  }

  /* ---------- Nastavenia cookies (dialóg) ---------- */
  const panel = document.createElement('dialog');
  panel.className = 'cookies';
  panel.setAttribute('aria-labelledby', 'cookies-title');
  panel.innerHTML =
    '<button type="button" class="cookies__close" data-consent="close">Close ✕</button>' +
    '<p class="cookies__eyebrow">Save file</p>' +
    '<h2 class="cookies__title" id="cookies-title">Cookie settings</h2>' +
    '<p class="cookies__lead">This site keeps a few small notes in your browser so it works the way you left it. ' +
      'If you allow it, it also uses Google Analytics to see which case files get read and whether anyone downloads the CV. ' +
      'Nothing here is used for ads.</p>' +

    // zapamätanie samotnej voľby: nedá sa vypnúť, inak by sa lišta pýtala na každej stránke
    '<section class="cookies__group">' +
      '<div class="cookies__head"><h3>Your choice</h3><span class="cookies__always">Always on</span></div>' +
      rows(ALWAYS) +
    '</section>' +

    '<section class="cookies__group">' +
      '<div class="cookies__head"><h3 id="cookies-memory">Necessary</h3>' +
        '<label class="switch"><input type="checkbox" role="switch" aria-labelledby="cookies-memory" class="cookies__memory"><span class="switch__track" aria-hidden="true"></span></label>' +
      '</div>' +
      rows(NECESSARY) +
    '</section>' +

    '<section class="cookies__group">' +
      '<div class="cookies__head"><h3 id="cookies-analytics">Analytics</h3>' +
        '<label class="switch"><input type="checkbox" role="switch" aria-labelledby="cookies-analytics" class="cookies__toggle"><span class="switch__track" aria-hidden="true"></span></label>' +
      '</div>' +
      rows(ANALYTICS) +
    '</section>' +

    '<div class="cookies__actions">' +
      '<button type="button" class="consent__btn" data-consent="none">Decline all</button>' +
      '<button type="button" class="consent__btn" data-consent="save">Save settings</button>' +
      '<button type="button" class="consent__btn consent__btn--yes" data-consent="all">Accept all</button>' +
    '</div>';
  const toggle = panel.querySelector('.cookies__toggle');
  const memoryToggle = panel.querySelector('.cookies__memory');

  /* ---------- Lišta so súhlasom (pri prvej návšteve) ---------- */
  const bar = document.createElement('section');
  bar.className = 'consent';
  bar.setAttribute('aria-label', 'Cookie consent');
  bar.innerHTML =
    '<p class="consent__text"><span class="consent__label">Save file</span>' +
    'May I use Google Analytics to see which pages get read? It sets cookies only if you accept.</p>' +
    '<div class="consent__actions">' +
      '<button type="button" class="consent__btn consent__btn--yes" data-consent="granted">Accept</button>' +
      '<button type="button" class="consent__btn" data-consent="denied">Decline</button>' +
      '<button type="button" class="consent__btn" data-consent="settings">Customize</button>' +
    '</div>';

  function openPanel() {
    toggle.checked = consent === 'granted';
    memoryToggle.checked = memory;
    panel.showModal();
    panel.scrollTop = 0;
  }

  // value: analytika 'granted' | 'denied'; mem: pamäť webu true | false (undefined = bez zmeny)
  function decide(value, mem) {
    bar.remove();
    if (panel.open) panel.close();
    // trofej Cookie Monster (js/achievements.js); pri vypnutej pamäti sa neuloží
    if (value === 'granted' && window.trophies) window.trophies.unlock('cookieMonster');
    const reloadConsent = value !== consent && setConsent(value);
    const reloadMemory = mem !== undefined && setMemory(mem);
    if (reloadConsent || reloadMemory) location.reload();
  }

  function onAction(e) {
    const b = e.target.closest('[data-consent]');
    if (!b) { if (e.target === panel) panel.close(); return; } // klik mimo panelu
    const action = b.dataset.consent;
    if (action === 'settings') openPanel();
    else if (action === 'close') panel.close();
    else if (action === 'save') decide(toggle.checked ? 'granted' : 'denied', memoryToggle.checked);
    else if (action === 'all') decide('granted', true);
    else if (action === 'none') decide('denied', false);
    else decide(action); // lišta: Accept / Decline sa týka len analytiky
  }
  bar.addEventListener('click', onAction);
  panel.addEventListener('click', onAction);

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(panel);
    if (consent !== 'granted' && consent !== 'denied') document.body.appendChild(bar);
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('.consent-settings')) { openPanel(); return; }
    // konverzie: stiahnutie CV (a odkiaľ) a klik na kontakt
    const link = e.target.closest('a');
    if (!link) return;
    if (/Dominika_Skulavikova_CV\.pdf$/.test(link.getAttribute('href') || '')) {
      window.analytics.event('cv_download', { placement: link.closest('.site-footer') ? 'footer' : 'field_notes' });
    }
    if (link.classList.contains('social__link')) {
      window.analytics.event('contact_click', { channel: link.textContent.trim().split(' ')[0].toLowerCase() });
    }
  });
})();
