# 🚀 Gulp Handlebars Starter

<div align="center">

[![Node.js Version][node-version-badge]](package.json)
[![License][license-badge]](LICENSE)

_A modern build system for static sites using Gulp 5 and Handlebars, featuring optimized asset processing and development workflow._

</div>

## ✨ Requirements

- Node.js >= 18.0.0
- npm or yarn

## 🎯 Features

### 🛠️ Build System

- **🏗️ Template Engine**: Handlebars with layouts, partials, helpers, and decorators support
- **🎨 CSS Processing**: SCSS compilation with PostCSS, Autoprefixer, and CSSnano
- **📜 JavaScript**: ES modules support with source maps and Terser minification
- **🖼️ Image Optimization**: Automatic compression for JPEG, PNG, SVG, and GIF files
- **📦 Asset Management**: Intelligent file watching and copying with caching
- **🔄 Development Server**: BrowserSync with live reload and CSS injection

### ⚡ Performance Optimizations

- 📊 Incremental builds with `gulp-cached` and `gulp-remember`
- 🗺️ Source maps for CSS and JavaScript
- 📦 Minification for all assets (HTML, CSS, JS, images)
- 🔒 Cache busting for production builds
- 🛡️ Error handling with plumber to prevent build breaks
- 🔍 Changed file detection for optimized rebuilds

## 🚀 Installation

```bash
git clone https://github.com/aesisify/gulp-handlebars-starter.git
cd gulp-handlebars-starter
npm install
```

## 📋 Usage

### Development

```bash
npm start    # Starts development server with live reload
```

### Production Build

```bash
npm run build    # Creates optimized production build
```

### Clean

```bash
npm run clean    # Removes the dist directory
```

## 📁 Project Structure

```
.
├── src/
│   ├── assets/          # Static assets
│   │   ├── css/        # CSS/SCSS files
│   │   ├── js/         # JavaScript files
│   │   └── img/        # Images
│   ├── data/           # JSON data files
│   └── templates/      # Handlebars templates
│       ├── layouts/    # Base layouts
│       ├── pages/      # Page templates
│       ├── partials/   # Reusable components
│       ├── helpers/    # Handlebars helper functions
│       └── decorators/ # Handlebars decorators
├── dist/               # Compiled files
├── gulpfile.js        # Gulp configuration
└── config.js          # Build configuration
```

## 🔧 Build System Details

### 📝 Template Processing

- ✨ Handlebars compilation with layout inheritance
- 🔄 JSON data integration with hot reloading
- 📦 HTML minification and formatting
- 🔄 Automatic partial and helper registration

### 🎨 Style Processing

- 📝 SCSS compilation with modern features
- 🔧 PostCSS integration with Autoprefixer
- 📦 CSS minification and optimization
- 🗺️ Source maps for development

### 📜 JavaScript Processing

- 📦 ES modules support
- 🔧 Code minification with Terser
- 🗺️ Source maps for debugging

### 📦 Asset Processing

- 🖼️ Automatic image optimization (mozjpeg, optipng, svgo, gifsicle)
- 👀 Intelligent file watching and copying
- 🔒 Cache busting for production

### 🔄 Development Server

- ⚡ Live reload for HTML changes
- 💉 CSS injection without page refresh
- 🌐 Automatic browser opening
- 📱 Cross-device testing support

## ⚠️ Known Issues

### Hot Reloading

- **🔄 Decorators and Helpers**: Changes to decorators and helpers require a manual server restart to take effect. The watch system detects the changes but the new implementations are not properly reloaded.

## 📄 License

CC0 - See [LICENSE](LICENSE) file for details.

## 👤 Author

Created by [Oğuz 'Aesisify' Gergin](https://github.com/aesisify)

[node-version-badge]: https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen
[license-badge]: https://img.shields.io/badge/license-CC0-blue
