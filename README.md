# Gulp Handlebars Starter

A simple setup using **Gulp** and **Handlebars** (with layout support) to compile HTML, copy assets, and run a live server.

## Features

- **Handlebars** templating with layouts & partials
- **Data merging** from JSON files
- **BrowserSync** for live reload

## Quick Start

```bash
npm install
npm run serve # This runs Gulp, serves your files at http://localhost:3000, and watches for changes.
npm run build # This just runs Gulp.
```

## Structure (Example)

```
src/
├─ data/                # JSON files
├─ templates/
│   ├─ layouts/         # Layout .hbs files
│   ├─ partials/        # Partial .hbs files
│   └─ pages/           # Page .hbs files
└─ assets/              # CSS, JS, images, fonts
```

That’s it! Enjoy this basic Gulp + Handlebars workflow.
