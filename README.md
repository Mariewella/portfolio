# Dominika Škulaviková — Portfolio

This website presents my portfolio as a UX/UI designer and front-end developer. It is themed as a survival-horror game: projects are case files, skills are survivor stats, and exploring the site unlocks trophies.

**Live site:** [www.dominika-skulavik.com](https://www.dominika-skulavik.com)

## Built with

Plain HTML, CSS and JavaScript, with no frameworks and no build step. It is hosted on GitHub Pages.

## What's inside

- **Shared layout:** one script (`js/layout.js`) provides the header, navigation and footer for every page.
- **Clean URLs:** addresses like `/portfolio/claim` work on static hosting through a redirect in `404.html`.
- **Privacy:** analytics load only after the visitor gives consent, and cookie choices can be changed at any time.
- **Security:** each page has a Content Security Policy.
- **Accessibility:** built with WCAG 2.2 AA in mind, including keyboard navigation, checked text contrast and an option to pause animations.
- **Trophies:** unlocked trophies and their dates are saved in the visitor's browser, and this site memory can be switched off.

## Structure

```
portfolio/
├── index.html        Home: game library
├── portfolio.html    Portfolio: case files
├── about.html        About me: survivor file
├── 404.html          Game over page and clean URL redirect
├── css/style.css     All styles
├── js/               Layout, interactions, trophies and analytics
├── files/            CV and bachelor thesis
└── images/           Images and project visuals
```

## Run locally

The site uses root-absolute paths, so it needs a local web server and won't work by opening the files directly.

## Copyright

© Dominika Škulaviková. All rights reserved. The code is public so it can be read, but the texts, images and code may not be reused without permission.
