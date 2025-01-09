# 🚀 Gulp Handlebars Kit

A modern starter kit for building fast, beautiful static sites with Gulp and Handlebars. Features a powerful build system, live reload, and a beautiful default theme.

[![License: CC0](https://img.shields.io/badge/License-CC0-lightgrey.svg)](LICENSE)

## ✨ Features

- 🛠 **Powerful Build System**:
  - SCSS compilation with autoprefixer and minification
  - JavaScript optimization and bundling
  - Image optimization (JPEG, PNG, SVG)
- 📦 **Handlebars Integration**:
  - Layout system for template inheritance
  - Partial support for reusable components
  - JSON data integration
- 🔄 **Development Experience**:
  - Live reload with BrowserSync
  - Source maps for SCSS and JS
  - Error handling and notifications
  - Optimized production builds

## 🚦 Quick Start

1. **Clone and Install**:

   ```bash
   git clone https://github.com/aesisify/gulp-handlebars-starter.git
   cd gulp-handlebars-starter
   npm install
   ```

2. **Development**:

   ```bash
   npm run dev     # Start development server with live reload
   ```

3. **Production**:
   ```bash
   npm run build   # Create optimized production build
   ```

## 📁 Project Structure

```
.
├── src/                  # Source files
│   ├── assets/          # Static assets
│   │   ├── css/        # SCSS/CSS files
│   │   ├── js/         # JavaScript files
│   │   └── img/        # Images
│   ├── data/           # JSON data files
│   └── templates/      # Handlebars templates
│       ├── layouts/    # Base layouts
│       ├── pages/      # Page templates
│       └── partials/   # Reusable components
├── dist/               # Compiled files (not versioned)
├── gulpfile.js        # Gulp configuration
└── package.json       # Project dependencies
```

## 🛠 Development

### Template Structure

- Use `layouts` for base page structures
- Create reusable components in `partials`
- Store page-specific templates in `pages`
- Add global data in `data/site.json`

### Styles

- SCSS with modern features
- Autoprefixer for cross-browser support
- Source maps for debugging
- Minification for production

### JavaScript

- ES6+ support
- Source maps for debugging
- Terser for minification
- Console stripping in production

### Assets

- Automatic image optimization
- SVG optimization
- Asset copying and watching
- Cache busting

## 🎯 Production Optimizations

- Minified HTML, CSS, and JavaScript
- Optimized images
- Removed source maps
- Cleaned console logs
- Proper cache headers

## 📝 License

This project is licensed under the CC0 License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Submit a Pull Request

## 💖 Credits

Created with ❤️ by [Oğuz 'Aesisify' Gergin](https://github.com/aesisify)
