# Dominika Škulavíková — Portfolio

Survival-horror portfólio (UX/UI dizajn + front-end). Čisté HTML, CSS a JavaScript, bez frameworkov a bez build krokov.

## Štruktúra

```
portfolio/
├── index.html        Home — Game library
├── portfolio.html    Portfolio — Case files
├── about.html        About me — Survivor file
├── css/style.css     všetky štýly (farby sú hore v :root)
├── js/layout.js      spoločná hlavička, menu a pätička
├── js/main.js        knižnica hier, spisy, inventár, radar, tlačidlo hore
├── files/            bakalárka na stiahnutie
└── images/           fotky, favicon
```

## Ako upravovať

- **Texty** sú priamo v HTML súboroch. Otvor stránku, nájdi text, prepíš ho.
- **Farby a písma** zmeníš na jednom mieste: premenné v `:root` na začiatku `css/style.css`.
- **Portfolio = priečinky podľa firiem.** Každá firma má priečinok na stole (`<button class="folder" data-dossier="id">`) a spis, ktorý sa po kliknutí otvorí (`<dialog class="dossier" id="dossier-id">`).
  - **Nový dokument** vo firme: v jej spise skopíruj jeden `<article class="doc" data-title="Názov">` a uprav TASK / PROBLEM / SOLUTION. Obsah spisu, číslovanie strán aj počítadlá sa doplnia samé.
  - **Nová firma**: skopíruj jeden priečinok aj jeden celý `<dialog>` a v oboch zmeň `id` (napr. `data-dossier="nova"` a `id="dossier-nova"`).
  - Odkaz `portfolio.html#isat` otvorí rovno spis ISAT.
- **Screenshot** k dokumentu: daj obrázok do `images/` a nahraď
  `<figure class="doc__shot">[ADD SCREENSHOT]</figure>` za
  `<figure class="doc__shot"><img src="images/nazov.jpg" alt="Popis obrázka"></figure>`.
- **Nové DLC / položka / štatistika** (prepínače): tlačidlo má `data-switch="skupina"` a `data-target="id"`, panel má rovnaké `id`. Panely, ktoré nemajú byť vidieť hneď, majú atribút `hidden`.

### Na doplnenie (hľadaj `[ADD`)

- screenshoty a odkazy na case studies (`portfolio.html`)
- jednovetové popisy modulov Sklad, Organizácia, Evidencia zvierat, Emisie, Info-správca (`index.html`)

## Kontakt

Samostatná stránka Contact už nie je. Kontakty sú v pätičke každej stránky (`<footer id="contact">`) a položka Contact v menu na ňu skočí.

- **Hlavička, menu a pätička** sú spoločné pre všetky stránky v súbore `js/layout.js` — zmenu (napr. kontakt alebo novú položku menu) urobíš len tam.

## Prístupnosť (WCAG 2.2 AA)

- Farby textu na papieri a priečinkoch sú prepočítané na kontrast min. 4,5 : 1 — pri zmene farieb v `:root` to over (napr. webaim.org/resources/contrastchecker).
- V pätičke je tlačidlo **Pause animations** (pamätá si voľbu); systémové „obmedziť pohyb“ funguje tiež.
- Odkazy s `target="_blank"` dostanú text „(opens in a new tab)“ pre čítačky automaticky (`js/layout.js`).
- Každý nový obrázok potrebuje `alt` s popisom; čisto dekoratívny má `alt=""`.

## Lokálne spustenie

Vo VS Code nainštaluj rozšírenie **Live Server**, klikni pravým na `index.html` → **Open with Live Server**.

## Web naživo

Adresa: **https://www.dominika-skulavik.com** (GitHub Pages, doména z Websupportu).

- Každá zmena: commit → push do vetvy `main` → o minútku je naživo.
- Súbor `CNAME` nemaž, drží vlastnú doménu.
- Súbory, ktoré na GitHub nepatria (nepoužívané obrázky), sú v `.gitignore`.
