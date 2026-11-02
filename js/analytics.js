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

  function setConsent(value) {
    consent = value;
    try { localStorage.setItem(KEY, value); } catch (e) { /* nevadí */ }
    if (value === 'granted') load();
    else if (loaded) {
      // odvolaný súhlas: zmaže cookies Google Analytics a stránku načíta bez merania
      document.cookie.split(';').forEach(function (c) {
        const name = c.split('=')[0].trim();
        if (name.indexOf('_ga') === 0) {
          ['', '; domain=.dominika-skulavik.com', '; domain=' + location.hostname].forEach(function (d) {
            document.cookie = name + '=; Max-Age=0; path=/' + d;
          });
        }
      });
      location.reload();
    }
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
  const NECESSARY = [
    ['analytics-consent', 'Until you clear it', 'Remembers your choice in this panel.', SITE],
    ['motion-off', 'Until you clear it', 'Remembers whether you paused the animations.', SITE],
    ['trophies', 'Until you clear it', 'Your unlocked trophies and the date you got each one.', SITE]
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

    '<section class="cookies__group">' +
      '<div class="cookies__head"><h3>Necessary</h3><span class="cookies__always">Always on</span></div>' +
      '<p>Without these the site would forget your settings on every page. They stay in your browser (local storage) and are never sent anywhere, so they can’t be switched off.</p>' +
      rows(NECESSARY) +
    '</section>' +

    '<section class="cookies__group">' +
      '<div class="cookies__head"><h3 id="cookies-analytics">Analytics</h3>' +
        '<label class="switch"><input type="checkbox" role="switch" aria-labelledby="cookies-analytics" class="cookies__toggle"><span class="switch__track" aria-hidden="true"></span></label>' +
      '</div>' +
      '<p>Counts visits and shows which pages and case files get read, where visitors come from and on what device. ' +
        'The data is processed by Google Ireland Ltd. and stays anonymous to me: I see totals, not people.</p>' +
      rows(ANALYTICS) +
    '</section>' +

    '<section class="cookies__group cookies__group--none">' +
      '<div class="cookies__head"><h3>Marketing</h3><span class="cookies__always">None</span></div>' +
      '<p>No advertising or tracking cookies from Meta, Google Ads or anyone else.</p>' +
    '</section>' +

    '<div class="cookies__actions">' +
      '<button type="button" class="consent__btn" data-consent="denied">Decline all</button>' +
      '<button type="button" class="consent__btn" data-consent="save">Save settings</button>' +
      '<button type="button" class="consent__btn consent__btn--yes" data-consent="granted">Accept all</button>' +
    '</div>';
  const toggle = panel.querySelector('.cookies__toggle');

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
    panel.showModal();
    panel.scrollTop = 0;
  }

  function decide(value) {
    bar.remove();
    if (panel.open) panel.close();
    if (value !== consent) setConsent(value);
    // trofej Cookie Monster (js/achievements.js)
    if (value === 'granted' && window.trophies) window.trophies.unlock('cookieMonster');
  }

  function onAction(e) {
    const b = e.target.closest('[data-consent]');
    if (!b) { if (e.target === panel) panel.close(); return; } // klik mimo panelu
    const action = b.dataset.consent;
    if (action === 'settings') openPanel();
    else if (action === 'close') panel.close();
    else if (action === 'save') decide(toggle.checked ? 'granted' : 'denied');
    else decide(action);
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
