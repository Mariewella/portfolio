(function () {
  'use strict';

  /* -------------------------------------------------------
     1. Prepínač panelov
     Tlačidlo:  <button data-switch="skupina" data-target="id-panelu">
     Panel:     <div id="id-panelu" hidden>
     Kliknutie zobrazí panel danej skupiny a ostatné skryje.
     ------------------------------------------------------- */
  function initSwitchers() {
    const buttons = document.querySelectorAll('[data-switch]');
    const groups = {};

    buttons.forEach(function (btn) {
      const name = btn.dataset.switch;
      (groups[name] = groups[name] || []).push(btn);
    });

    Object.keys(groups).forEach(function (name) {
      const group = groups[name];

      group.forEach(function (btn, index) {
        btn.addEventListener('click', function () {
          group.forEach(function (other) {
            const isActive = other === btn;
            other.setAttribute('aria-pressed', String(isActive));
            const panel = document.getElementById(other.dataset.target);
            if (panel) panel.hidden = !isActive;
          });

          // dá vedieť ostatným častiam stránky (napr. radarovému grafu)
          document.dispatchEvent(new CustomEvent('switch:' + name, { detail: { index: index, button: btn } }));
        });
      });
    });
  }

  /* -------------------------------------------------------
     Tlačidlo späť hore — v strede dole, len na dlhých stránkach
     Objaví sa po odscrollovaní o viac než jednu obrazovku.
     ------------------------------------------------------- */
  function initToTop() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"></path></svg>';
    document.body.appendChild(btn);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function update() {
      const long = document.documentElement.scrollHeight > window.innerHeight * 1.8;
      const visible = long && window.scrollY > window.innerHeight * 0.9 && !document.body.classList.contains('has-dossier');
      btn.classList.toggle('is-visible', visible);
      btn.tabIndex = visible ? 0 : -1;
      // na konci stránky sa posunie nad spodný riadok pätičky, aby ho neprekrylo
      const legal = document.querySelector('.site-footer__legal');
      const overlap = legal ? window.innerHeight - legal.getBoundingClientRect().top : 0;
      btn.style.bottom = overlap > 0 ? (overlap + 12) + 'px' : '';
    }
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion || document.documentElement.classList.contains('motion-off') ? 'auto' : 'smooth' });
      btn.blur();
    });
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* -------------------------------------------------------
     Home — knižnica hier po krokoch, ako menu v hre
     Start → režim → titul → detail. V každom kroku je len jedno
     rozhodnutie. Breadcrumbs a ◀ Back vracajú späť, Esc tiež.
     Režim s jediným titulom preskočí zoznam a otvorí rovno detail.
     ------------------------------------------------------- */
  function initLibrary() {
    const lib = document.querySelector('[data-library]');
    if (!lib) return;

    const screens = {};
    lib.querySelectorAll('[data-screen]').forEach(function (s) { screens[s.dataset.screen] = s; });
    const games = Array.from(lib.querySelectorAll('.game-detail[data-mode]'));
    const crumbs = lib.querySelector('.crumbs__list');
    const back = lib.querySelector('.library__back');
    const titlesEl = lib.querySelector('.titles');
    const modeNames = {};
    const state = { screen: 'start', mode: null, game: null };

    // počty
    lib.querySelectorAll('[data-count="titles"]').forEach(function (el) { el.textContent = games.length; });
    lib.querySelectorAll('.mode[data-mode]').forEach(function (btn) {
      const n = games.filter(function (g) { return g.dataset.mode === btn.dataset.mode; }).length;
      modeNames[btn.dataset.mode] = btn.querySelector('.mode__name').textContent;
      btn.querySelector('.mode__count').textContent = n + (n === 1 ? ' TITLE' : ' TITLES');
      btn.disabled = n === 0;
      btn.addEventListener('click', function () { openMode(btn.dataset.mode); });
    });

    function gamesIn(mode) { return games.filter(function (g) { return g.dataset.mode === mode; }); }

    function openMode(mode) {
      const list = gamesIn(mode);
      state.mode = mode;
      if (list.length === 1) { openGame(list[0]); return; }
      titlesEl.textContent = '';
      list.forEach(function (g) {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'title-card pick';
        const kind = g.querySelector('.cover__kind');
        card.innerHTML = '<span class="mode__count">' + (kind ? kind.textContent : '') + '</span><span class="title-card__name"></span>';
        card.querySelector('.title-card__name').textContent = g.dataset.name;
        card.addEventListener('click', function () { openGame(g); });
        titlesEl.appendChild(card);
      });
      show('titles');
    }

    function openGame(g) {
      state.game = g;
      games.forEach(function (x) { x.hidden = x !== g; });
      show('game');
    }

    // kliknuté tlačidlo zmizne, preto fokus presunieme na nový obsah obrazovky
    games.forEach(function (g) { g.tabIndex = -1; g.setAttribute('aria-label', g.dataset.name); });

    function show(name, quiet) {
      state.screen = name;
      Object.keys(screens).forEach(function (k) { screens[k].hidden = k !== name; });
      if (name === 'start' || name === 'modes') state.game = null;
      if (name === 'start') state.mode = null;
      renderCrumbs();
      back.hidden = name === 'start';
      if (quiet) return;
      const target = name === 'game' ? state.game
        : name === 'start' ? screens.start.querySelector('[data-go]')
        : screens[name].querySelector('.screen__prompt');
      if (target) target.focus({ preventScroll: true });
    }

    function goBack() {
      if (state.screen === 'game') {
        if (gamesIn(state.mode).length > 1) show('titles'); else show('modes');
      } else if (state.screen === 'titles') show('modes');
      else if (state.screen === 'modes') show('start');
    }

    function renderCrumbs() {
      const steps = [{ label: 'Start', go: function () { show('start'); } }];
      if (state.screen !== 'start') steps.push({ label: state.mode ? modeNames[state.mode] : 'Choose mode', go: function () { show(gamesIn(state.mode).length > 1 ? 'titles' : 'modes'); } });
      if (state.screen === 'titles' || state.screen === 'game') {
        if (state.screen === 'game') steps.push({ label: state.game.dataset.name });
        else steps[steps.length - 1].go = null;
      }
      if (state.screen === 'modes') steps[steps.length - 1] = { label: 'Choose mode' };
      crumbs.textContent = '';
      steps.forEach(function (step, i) {
        const li = document.createElement('li');
        const last = i === steps.length - 1;
        if (last || !step.go) {
          const span = document.createElement('span');
          span.textContent = step.label;
          if (last) span.setAttribute('aria-current', 'page');
          li.appendChild(span);
        } else {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = step.label;
          btn.addEventListener('click', step.go);
          li.appendChild(btn);
        }
        crumbs.appendChild(li);
      });
    }

    lib.querySelector('[data-go="modes"]').addEventListener('click', function () { show('modes'); });
    back.addEventListener('click', goBack);

    // Enter na úvodnej obrazovke, Esc o krok späť (keď nie je otvorený dialóg ani pole)
    document.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input, textarea, select, dialog')) return;
      if (document.documentElement.classList.contains('menu-open')) return;
      const r = lib.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      if (e.key === 'Escape' && state.screen !== 'start') { goBack(); e.preventDefault(); }
      if (e.key === 'Enter' && state.screen === 'start' && e.target === document.body) { show('modes'); e.preventDefault(); }
    });

    show('start', true);
  }

  /* -------------------------------------------------------
     2. About — radarový graf
     Kreslí detaily vybranej kategórie: každá položka v zozname
     .skills je jedna os, úroveň berie z triedy na .bar.
     Pri prepnutí sa tvar plynulo pretvorí z predchádzajúceho
     a mriežka s popiskami sa prelínajú.
     ------------------------------------------------------- */
  function initRadar() {
    const svg = document.querySelector('.radar');
    if (!svg) return;

    const NS = 'http://www.w3.org/2000/svg';
    // rozmery sa prepočítajú podľa šírky grafu (layout), 1 jednotka = 1 px,
    // takže popisky majú vždy skutočných 12 px aj na mobile
    let CX = 310, CY = 205, R = 140;
    let WRAP = 16;
    let NUMBERED = false;
    const legend = document.createElement('ol');
    legend.className = 'radar-legend';
    legend.setAttribute('aria-hidden', 'true'); // čítačka má všetko v aria-label grafu
    svg.after(legend);
    const LINE = 17;
    const LEVELS = { advanced: 0.9, skillful: 0.65, basic: 0.3 };
    const DURATION = 650;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function el(name, attrs) {
      const node = document.createElementNS(NS, name);
      Object.keys(attrs).forEach(function (key) { node.setAttribute(key, attrs[key]); });
      return node;
    }

    function angle(i, n) { return -Math.PI / 2 + (i * 2 * Math.PI) / n; }

    function point(a, scale) {
      return [CX + Math.cos(a) * R * scale, CY + Math.sin(a) * R * scale];
    }

    function toAttr(pts) {
      return pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    }

    // ako ďaleko od stredu je obrys mnohouholníka v danom smere (0–1)
    function radiusAt(poly, a) {
      const d = [Math.cos(a), Math.sin(a)];
      let best = 0;
      for (let k = 0; k < poly.length; k++) {
        const A = [poly[k][0] - CX, poly[k][1] - CY];
        const B = poly[(k + 1) % poly.length];
        const E = [B[0] - CX - A[0], B[1] - CY - A[1]];
        const den = d[0] * E[1] - d[1] * E[0];
        if (Math.abs(den) < 1e-9) continue;
        const t = (A[0] * E[1] - A[1] * E[0]) / den;
        const s = (A[0] * d[1] - A[1] * d[0]) / den;
        if (s >= -1e-6 && s <= 1 + 1e-6 && t > best) best = t;
      }
      return best / R;
    }

    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    // dlhý názov rozdelí na riadky po ~16 znakov
    function wrap(text) {
      const lines = [];
      text.split(' ').forEach(function (word) {
        const last = lines[lines.length - 1];
        if (last && (last + ' ' + word).length <= WRAP) lines[lines.length - 1] = last + ' ' + word;
        else lines.push(word);
      });
      return lines;
    }

    function readSkills(panel) {
      return Array.from(panel.querySelectorAll('.skills li')).map(function (li) {
        const bar = li.querySelector('.bar');
        const level = Object.keys(LEVELS).find(function (key) { return bar.classList.contains('bar--' + key); });
        return { name: li.querySelector('.skills__row span').textContent, value: LEVELS[level] || 0 };
      });
    }

    // mriežka a popisky pre n osí
    function buildLayer(skills) {
      const n = skills.length;
      const layer = el('g', { class: 'radar-layer' });

      const grid = el('g', { fill: 'none', stroke: '#3a3d38', 'stroke-width': 2 });
      [1 / 3, 2 / 3, 1].forEach(function (s) {
        const ring = skills.map(function (_, i) { return point(angle(i, n), s); });
        grid.appendChild(el('polygon', { points: toAttr(ring), 'stroke-dasharray': '8 8' }));
      });
      skills.forEach(function (_, i) {
        const p = point(angle(i, n), 1);
        grid.appendChild(el('line', { x1: CX, y1: CY, x2: p[0], y2: p[1] }));
      });
      layer.appendChild(grid);

      skills.forEach(function (s, i) {
        const p = point(angle(i, n), 1.14);
        const dx = p[0] - CX;
        const anchor = Math.abs(dx) < 20 ? 'middle' : dx > 0 ? 'start' : 'end';
        // na úzkom displeji len číslo osi, názvy sú v legende pod grafom
        const lines = NUMBERED ? [String(i + 1)] : wrap(s.name.toUpperCase());
        const top = p[1] - CY < -20 ? p[1] - (lines.length - 1) * LINE : p[1] - CY > 20 ? p[1] + 10 : p[1] - ((lines.length - 1) * LINE) / 2 + 5;
        const text = el('text', { class: 'radar-label', 'text-anchor': anchor });
        lines.forEach(function (line, j) {
          const tspan = el('tspan', { x: p[0], y: top + j * LINE });
          tspan.textContent = line;
          text.appendChild(tspan);
        });
        layer.appendChild(text);
      });
      return layer;
    }

    // stále prvky: vrstvy mriežky pod tvarom, tvar navrchu
    const layers = el('g', {});
    const fill = el('polygon', { class: 'radar-fill', fill: '#14b3ac', opacity: 0.45 });
    const outline = el('polygon', { fill: 'none', stroke: '#14b3ac', 'stroke-width': 4, 'stroke-linejoin': 'round' });
    const dots = el('g', {});
    [layers, fill, outline, dots].forEach(function (node) { svg.appendChild(node); });

    let current = null; // body tvaru, ktoré sú práve nakreslené
    let frame = 0;

    function render(pts) {
      current = pts;
      fill.setAttribute('points', toAttr(pts));
      outline.setAttribute('points', toAttr(pts));
      Array.from(dots.children).forEach(function (dot, i) {
        dot.setAttribute('cx', pts[i][0].toFixed(1));
        dot.setAttribute('cy', pts[i][1].toFixed(1));
      });
    }

    function draw(panel) {
      const skills = readSkills(panel);
      const n = skills.length;
      const angles = skills.map(function (_, i) { return angle(i, n); });
      const from = angles.map(function (a) { return current ? radiusAt(current, a) : 0; });
      const to = skills.map(function (s) { return s.value; });

      legend.textContent = '';
      skills.forEach(function (s) {
        const li = document.createElement('li');
        li.textContent = s.name;
        legend.appendChild(li);
      });

      svg.setAttribute('aria-label', 'Radar chart: ' + skills.map(function (s) {
        return s.name + ' ' + Math.round(s.value * 100) + '%';
      }).join(', '));

      // prelínanie mriežky a popiskov
      Array.from(layers.children).forEach(function (old) {
        old.style.opacity = 0;
        setTimeout(function () { old.remove(); }, DURATION);
      });
      const layer = buildLayer(skills);
      layer.style.opacity = reducedMotion || !current ? 1 : 0;
      layers.appendChild(layer);
      requestAnimationFrame(function () { layer.style.opacity = 1; });

      dots.textContent = '';
      skills.forEach(function () { dots.appendChild(el('circle', { class: 'radar-dot', r: 8 })); });

      // pretvorenie tvaru
      cancelAnimationFrame(frame);
      if (reducedMotion || document.documentElement.classList.contains('motion-off')) {
        render(angles.map(function (a, i) { return point(a, to[i]); }));
        return;
      }
      const start = performance.now();
      (function step(now) {
        const t = ease(Math.min(1, (now - start) / DURATION));
        render(angles.map(function (a, i) { return point(a, from[i] + (to[i] - from[i]) * t); }));
        if (t < 1) frame = requestAnimationFrame(step);
      })(start);
    }

    document.addEventListener('switch:stats', function (e) {
      draw(document.getElementById(e.detail.button.dataset.target));
    });

    function selectedPanel() {
      const btn = document.querySelector('[data-switch="stats"][aria-pressed="true"]') || document.querySelector('[data-switch="stats"]');
      return btn && document.getElementById(btn.dataset.target);
    }

    // veľkosť grafu podľa dostupnej šírky; polomer tak, aby sa zmestil najdlhší popisok
    const allSkills = Array.from(document.querySelectorAll('.skills li .skills__row > span:first-child'))
      .map(function (s) { return s.textContent.toUpperCase(); });
    let laidOutWidth = 0;
    function layout() {
      const W = Math.round(svg.getBoundingClientRect().width) || 560;
      if (W === laidOutWidth) return false;
      laidOutWidth = W;
      const narrow = W < 480;
      NUMBERED = narrow;
      legend.hidden = !narrow;
      const H = Math.round(narrow ? W : W * 400 / 620);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      // najširší riadok popisku, zmeraný v skutočnom písme
      const probe = el('text', { class: 'radar-label' });
      svg.appendChild(probe);
      let labelW = 0, maxLines = 1;
      allSkills.forEach(function (name, i) {
        const lines = NUMBERED ? [String(i % 9 + 1)] : wrap(name);
        maxLines = Math.max(maxLines, lines.length);
        lines.forEach(function (line) { probe.textContent = line; labelW = Math.max(labelW, probe.getComputedTextLength()); });
      });
      probe.remove();
      CX = W / 2;
      CY = H / 2 + 5;
      R = Math.max(50, Math.min(
        (W / 2 - labelW - 6) / 1.14,
        (H / 2 - 5 - maxLines * LINE - 4) / 1.14
      ));
      return true;
    }

    layout();
    const first = selectedPanel();
    if (first) draw(first);

    if ('ResizeObserver' in window) {
      new ResizeObserver(function () {
        const panel = selectedPanel();
        if (!layout() || !panel) return;
        current = null; // nová geometria: tvar nakreslíme nanovo
        Array.from(layers.children).forEach(function (old) { old.remove(); });
        draw(panel);
      }).observe(svg);
    }
  }

  /* -------------------------------------------------------
     3. Portfolio — priečinky a spisy (case files)
     Priečinok:  <button class="folder" data-dossier="isat">
     Spis:       <dialog class="dossier" id="dossier-isat">
     Dokumenty v spise sú <article class="doc" data-title="...">;
     obsah, číslovanie strán a počítadlá doplní skript sám.
     Odkaz portfolio.html#isat otvorí rovno daný spis.
     ------------------------------------------------------- */
  function initDossiers() {
    const dossiers = Array.from(document.querySelectorAll('.dossier'));
    if (!dossiers.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let docTotal = 0;

    dossiers.forEach(function (dialog) {
      const key = dialog.id.replace('dossier-', '');
      const docs = Array.from(dialog.querySelectorAll('.doc'));
      const toc = dialog.querySelector('.dossier__toc');
      const nav = dialog.querySelector('.dossier__nav');
      const page = dialog.querySelector('.dossier__page');
      let current = 0;
      docTotal += docs.length;

      const countEl = document.querySelector('[data-doc-count="' + key + '"]');
      if (countEl) countEl.textContent = docs.length;

      // obsah spisu
      const tocButtons = docs.map(function (doc, i) {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML = '<span>' + String(i + 1).padStart(2, '0') + '</span> ' + doc.dataset.title;
        btn.addEventListener('click', function () { show(i); });
        li.appendChild(btn);
        toc.appendChild(li);
        return btn;
      });

      // listovanie
      nav.innerHTML =
        '<button type="button" class="dossier__turn" data-turn="-1">← Previous</button>' +
        '<span class="dossier__pager"></span>' +
        '<button type="button" class="dossier__turn" data-turn="1">Next →</button>';
      const pager = nav.querySelector('.dossier__pager');
      const prev = nav.querySelector('[data-turn="-1"]');
      const next = nav.querySelector('[data-turn="1"]');
      prev.addEventListener('click', function () { show(current - 1); });
      next.addEventListener('click', function () { show(current + 1); });

      function show(i, instant) {
        if (i < 0 || i >= docs.length) return;
        const direction = i > current ? 'next' : 'prev';
        docs.forEach(function (doc, j) {
          doc.hidden = j !== i;
          doc.classList.remove('is-turning-next', 'is-turning-prev');
        });
        if (!instant && !reducedMotion && i !== current) {
          void docs[i].offsetWidth; // reštart animácie
          docs[i].classList.add('is-turning-' + direction);
        }
        current = i;
        tocButtons.forEach(function (btn, j) {
          if (j === i) btn.setAttribute('aria-current', 'page');
          else btn.removeAttribute('aria-current');
        });
        pager.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(docs.length).padStart(2, '0');
        prev.disabled = i === 0;
        next.disabled = i === docs.length - 1;
        page.scrollTop = 0;
      }

      dialog.addEventListener('keydown', function (e) {
        if (e.target.closest('input, textarea')) return;
        if (e.key === 'ArrowRight') show(current + 1);
        if (e.key === 'ArrowLeft') show(current - 1);
      });

      // zatvorenie: tlačidlo, klik mimo spisu, Esc (robí dialóg sám)
      dialog.querySelector('[data-close]').addEventListener('click', function () { dialog.close(); });
      dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
      dialog.addEventListener('close', function () {
        document.body.classList.remove('has-dossier');
        if (location.hash === '#' + key) history.replaceState(null, '', location.pathname + location.search);
        const folder = document.querySelector('[data-dossier="' + key + '"]');
        if (folder) folder.focus();
      });

      dialog.openAt = function (i) {
        show(i || 0, true);
        document.body.classList.add('has-dossier');
        dialog.showModal();
        if (location.hash !== '#' + key) history.replaceState(null, '', '#' + key);
      };

      show(0, true);
    });

    const docsEl = document.querySelector('[data-count="docs"]');
    const foldersEl = document.querySelector('[data-count="folders"]');
    if (docsEl) docsEl.textContent = docTotal;
    if (foldersEl) foldersEl.textContent = dossiers.length;

    document.querySelectorAll('[data-dossier]').forEach(function (folder) {
      folder.addEventListener('click', function () {
        const dialog = document.getElementById('dossier-' + folder.dataset.dossier);
        if (dialog) dialog.openAt(0);
      });
    });

    function openFromHash() {
      const dialog = location.hash && document.getElementById('dossier-' + location.hash.slice(1));
      if (dialog && dialog.classList.contains('dossier') && !dialog.open) dialog.openAt(0);
    }
    window.addEventListener('hashchange', openFromHash);
    openFromHash();
  }

  /* -------------------------------------------------------
     About — inventár: pás kartičiek, ktorý sa prepína sám
     Každé 4 s ďalšia vec. Klik (kartička, bodka), šípky ← →
     alebo potiahnutie prstom prepínanie zastaví a po 5 s
     nečinnosti sa znova rozbehne. Tlačidlo Pause ho zastaví úplne.
     ------------------------------------------------------- */
  function initInventory() {
    const box = document.querySelector('[data-inventory]');
    if (!box) return;

    const STEP = 4000;
    const IDLE = 5000;
    const cards = Array.from(box.querySelectorAll('.inv-card'));
    const track = box.querySelector('.inventory__track');
    const dotsEl = box.querySelector('.inventory__dots');
    const bar = box.querySelector('.inventory__progress');
    const toggle = box.querySelector('.inventory__toggle');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const n = cards.length;
    let current = 0;
    let timer = null;
    let idle = null;
    // pri vypnutých animáciách (systém alebo prepínač v pätičke) sa sám neprepína
    let stopped = reducedMotion || document.documentElement.classList.contains('motion-off');

    bar.style.setProperty('--step', STEP + 'ms');

    const dots = cards.map(function (card, i) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', card.dataset.name);
      dot.addEventListener('click', function () { userGo(i); });
      dotsEl.appendChild(dot);
      card.addEventListener('click', function () { userGo(i); });
      return dot;
    });

    // 3D náklon fotky: za kurzorom myši, na mobile za prstom ťahaným po predmete
    const canTilt = !reducedMotion;
    cards.forEach(function (card) {
      const art = card.querySelector('.inv-card__art');
      const img = art.querySelector('img');
      if (!img) return;
      const obj = document.createElement('span');
      obj.className = 'inv-card__obj';
      const glare = document.createElement('span');
      glare.className = 'inv-card__glare';
      glare.style.setProperty('--shape', 'url("' + img.getAttribute('src') + '")');
      art.insertBefore(obj, img);
      obj.appendChild(img);
      obj.appendChild(glare);
      if (!canTilt) return;

      let touching = false; // prst položený na predmete aktuálnej karty
      art.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' && card.hasAttribute('aria-current')) touching = true;
      });

      card.addEventListener('pointermove', function (e) {
        if (!card.hasAttribute('aria-current') || (e.pointerType !== 'mouse' && !touching)) return;
        const r = art.getBoundingClientRect();
        const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
        obj.style.setProperty('--ry', ((x - 0.5) * 34).toFixed(1) + 'deg');
        obj.style.setProperty('--rx', ((0.5 - y) * 26).toFixed(1) + 'deg');
        obj.style.setProperty('--sx', ((0.5 - x) * 24).toFixed(1) + 'px');
        obj.style.setProperty('--sy', (10 + (0.5 - y) * 14).toFixed(1) + 'px');
        glare.style.setProperty('--gx', (x * 100).toFixed(0) + '%');
        glare.style.setProperty('--gy', (y * 100).toFixed(0) + '%');
        if (!card.classList.contains('is-tilting')) { card.classList.add('is-tilting'); hold(); }
      });
      function untilt() {
        touching = false;
        if (!card.classList.contains('is-tilting')) return;
        card.classList.remove('is-tilting');
        ['--rx', '--ry', '--sx', '--sy'].forEach(function (p) { obj.style.removeProperty(p); });
        userGo(); // po 5 s nečinnosti pokračuje v prepínaní
      }
      card.addEventListener('pointerleave', untilt);
      // prst zdvihnutý alebo prehliadač prevzal posun stránky
      card.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') untilt(); });
      card.addEventListener('pointercancel', untilt);
    });

    function show(i) {
      current = (i + n) % n;
      cards.forEach(function (card, j) {
        let off = j - current;
        if (off > n / 2) off -= n;
        if (off < -n / 2) off += n;
        card.style.setProperty('--off', off);
        card.style.setProperty('--scale', off === 0 ? 1 : 0.78);
        card.style.setProperty('--fade', off === 0 ? 1 : Math.abs(off) === 1 ? 0.5 : 0);
        card.style.zIndex = 10 - Math.abs(off);
        card.style.visibility = Math.abs(off) > 1 ? 'hidden' : '';
        card.tabIndex = off === 0 ? 0 : -1;
        // bočné karty sú len náhľad: čítačka ich preskočí
        if (off === 0) { card.setAttribute('aria-current', 'true'); card.removeAttribute('aria-hidden'); }
        else { card.removeAttribute('aria-current'); card.setAttribute('aria-hidden', 'true'); }
      });
      dots.forEach(function (dot, j) {
        if (j === current) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    function restartBar() {
      bar.classList.remove('is-running');
      void bar.offsetWidth;
      bar.classList.add('is-running');
    }

    function play() {
      clearInterval(timer);
      clearTimeout(idle);
      if (stopped) return;
      toggle.textContent = '❚❚ Pause';
      toggle.classList.remove('is-waiting');
      restartBar();
      timer = setInterval(function () { show(current + 1); restartBar(); }, STEP);
    }

    function hold() {
      clearInterval(timer);
      clearTimeout(idle);
      bar.classList.remove('is-running');
    }

    // akcia používateľa: zastaví a po 5 s nečinnosti pokračuje
    function userGo(i) {
      if (i !== undefined) show(i);
      hold();
      if (stopped) return;
      toggle.textContent = 'Resumes in 5 s';
      toggle.classList.add('is-waiting');
      idle = setTimeout(play, IDLE);
    }

    toggle.addEventListener('click', function () {
      stopped = !stopped;
      toggle.setAttribute('aria-pressed', String(stopped));
      if (stopped) { hold(); toggle.textContent = '▶︎ Play'; toggle.classList.remove('is-waiting'); }
      else play();
    });

    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { userGo(current + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { userGo(current - 1); e.preventDefault(); }
    });

    let startX = null;
    track.addEventListener('pointerdown', function (e) {
      // ťahanie prstom po predmete ho natáča, neprepína kartu
      const onObject = e.pointerType !== 'mouse' && canTilt && e.target.closest('.inv-card[aria-current] .inv-card__art');
      startX = onObject ? null : e.clientX;
    });
    track.addEventListener('pointerup', function (e) {
      if (startX !== null && Math.abs(e.clientX - startX) > 40) userGo(current + (e.clientX < startX ? 1 : -1));
      startX = null;
    });
    track.addEventListener('pointercancel', function () { startX = null; });

    // keď je inventár mimo obrazovky alebo karta na pozadí, nebeží
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) play();
        else hold();
      }, { threshold: 0.3 }).observe(box);
    }

    document.addEventListener('motionchange', function (e) {
      if (e.detail.off !== stopped) toggle.click();
    });

    if (stopped) { toggle.textContent = '▶︎ Play'; toggle.setAttribute('aria-pressed', 'true'); }
    show(0);
  }

  /* -------------------------------------------------------
     Evidence: klik na prilepenú fotku ju zväčší,
     šípkami / potiahnutím sa listuje medzi fotkami toho istého spisu
  ------------------------------------------------------- */
  function initEvidence() {
    const galleries = document.querySelectorAll('.evidence');
    if (!galleries.length) return;

    const box = document.createElement('dialog');
    box.className = 'lightbox';
    box.setAttribute('aria-label', 'Enlarged photo');
    box.innerHTML =
      '<div class="lightbox__bar"><span class="lightbox__count"></span><button type="button" data-lb="close">Close ✕</button></div>' +
      '<figure class="lightbox__figure"><img alt=""><figcaption></figcaption></figure>' +
      '<div class="lightbox__nav"><button type="button" data-lb="-1">← Previous</button><button type="button" data-lb="1">Next →</button></div>';
    document.body.appendChild(box);
    const img = box.querySelector('img');
    const caption = box.querySelector('figcaption');
    const count = box.querySelector('.lightbox__count');
    const prev = box.querySelector('[data-lb="-1"]');
    const next = box.querySelector('[data-lb="1"]');
    let items = [], current = 0, opener = null;

    function show(i) {
      if (i < 0 || i >= items.length) return;
      current = i;
      const btn = items[i];
      const thumb = btn.querySelector('img');
      img.src = btn.dataset.full;
      img.alt = thumb.alt;
      caption.textContent = btn.closest('.snap').querySelector('.snap__caption').textContent;
      count.textContent = 'EXHIBIT ' + (i + 1) + ' / ' + items.length;
      prev.disabled = i === 0;
      next.disabled = i === items.length - 1;
    }

    galleries.forEach(function (list) {
      const buttons = Array.from(list.querySelectorAll('.snap__open'));
      buttons.forEach(function (btn, i) {
        btn.setAttribute('aria-label', 'Enlarge: ' + btn.closest('.snap').querySelector('.snap__caption').textContent);
        btn.addEventListener('click', function () {
          items = buttons;
          opener = btn;
          show(i);
          box.showModal();
        });
      });
    });

    box.addEventListener('click', function (e) {
      const b = e.target.closest('[data-lb]');
      if (b) {
        if (b.dataset.lb === 'close') box.close();
        else show(current + Number(b.dataset.lb));
      } else if (e.target === box) box.close(); // klik mimo fotky
    });
    box.addEventListener('keydown', function (e) {
      // Esc zavrie len fotku, spis pod ňou ostane otvorený
      if (e.key === 'Escape') { e.preventDefault(); box.close(); }
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'ArrowLeft') show(current - 1);
    });
    // potiahnutie prstom doľava / doprava
    let startX = null;
    box.addEventListener('pointerdown', function (e) { startX = e.pointerType === 'mouse' ? null : e.clientX; });
    box.addEventListener('pointerup', function (e) {
      if (startX !== null && Math.abs(e.clientX - startX) > 40) show(current + (e.clientX < startX ? 1 : -1));
      startX = null;
    });
    box.addEventListener('close', function () {
      img.removeAttribute('src');
      if (opener) opener.focus();
    });
  }

  /* ------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initSwitchers();
    initLibrary();
    initToTop();
    initRadar();
    initDossiers();
    initEvidence();
    initInventory();
  });
})();
