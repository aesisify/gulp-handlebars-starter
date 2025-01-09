import gulp from "gulp";
import plumber from "gulp-plumber";
import data from "gulp-data";
import rename from "gulp-rename";
import hb from "gulp-hb";
import layouts from "handlebars-layouts";
import htmlmin from "gulp-htmlmin";
import prettier from "gulp-prettier";
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import terser from "gulp-terser";
import sourcemaps from "gulp-sourcemaps";
import browserSyncLib from "browser-sync";
import { deleteAsync } from "del";
import fs from "fs";
import path from "path";

const browserSync = browserSyncLib.create();

const sass = gulpSass(dartSass);

const paths = {
  data: "src/data",
  layouts: "src/templates/layouts/**/*.hbs",
  partials: "src/templates/partials/**/*.hbs",
  pages: "src/templates/pages/**/*.hbs",
  helpers: "src/helpers/**/*.js",
  decorators: "src/decorators/**/*.js",
  assets: "src/assets/**/*",
  scss: "src/assets/css/**/*.scss",
  css: "src/assets/css/**/*.css",
  scripts: "src/assets/js/**/*.js",
  images: "src/assets/img/**/*.{png,jpg,jpeg,svg}",
  dist: "dist",
};

// Ensure directories exist
function ensureDirectories(done) {
  const directories = [
    paths.data,
    path.dirname(paths.layouts), // Base directory of layouts
    path.dirname(paths.partials), // Base directory of partials
    path.dirname(paths.pages), // Base directory of pages
    paths.helpers,
    paths.decorators,
    paths.assets,
    paths.scss,
    paths.scripts,
    paths.images,
    paths.dist,
  ];

  directories.forEach((dir) => {
    const cleanDir = dir.replace(/\/\*\*.*$/, ""); // Remove wildcard patterns
    if (!fs.existsSync(cleanDir)) {
      fs.mkdirSync(cleanDir, { recursive: true });
      console.log(`Created missing directory: ${cleanDir}`);
    }
  });

  done(); // Signal task completion
}

// Clean dist folder
export async function clean() {
  await deleteAsync([paths.dist], { force: true });
}

// Load JSON data
export function loadData() {
  const dataObj = {};
  fs.readdirSync(paths.data)
    .filter((filename) => filename.endsWith(".json"))
    .forEach((filename) => {
      const key = path.basename(filename, ".json");
      const filePath = path.join(paths.data, filename);
      dataObj[key] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    });
  return dataObj;
}

function html() {
  return gulp
    .src(`${paths.dist}/**/*.html`) // Target all HTML files
    .pipe(
      htmlmin({
        collapseWhitespace: true, // Minify HTML
        removeComments: true, // Remove all comments
      })
    )
    .pipe(
      prettier({
        parser: "html", // Format with Prettier
        htmlWhitespaceSensitivity: "ignore",
        bracketSameLine: true,
      })
    )
    .pipe(gulp.dest(paths.dist)); // Save formatted and cleaned HTML
}

// Compile SCSS to CSS
export async function scss() {
  return gulp
    .src(paths.scss)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`${paths.dist}/assets/css`))
    .pipe(browserSync.stream());
}

// Copy plain CSS files
export function css() {
  return gulp
    .src(paths.css)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`${paths.dist}/assets/css`))
    .pipe(browserSync.stream());
}

// Optimize JavaScript files
export function scripts() {
  return gulp
    .src(paths.scripts)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`${paths.dist}/assets/js`))
    .pipe(browserSync.stream());
}

// Optimize and copy images
export async function images() {
  const imagemin = (await import("gulp-imagemin")).default;
  const mozjpeg = (await import("imagemin-mozjpeg")).default;
  const optipng = (await import("imagemin-optipng")).default;
  const svgo = (await import("imagemin-svgo")).default;

  return await gulp
    .src(paths.images)
    .pipe(plumber())
    .pipe(
      imagemin([
        mozjpeg({ quality: 75, progressive: true }), // Optimize JPEGs
        optipng({ optimizationLevel: 5 }), // Optimize PNGs
        svgo({
          plugins: [
            { name: "removeViewBox", active: false }, // Keep viewBox attribute
          ],
        }), // Optimize SVGs
      ])
    )
    .pipe(gulp.dest(`${paths.dist}/assets/img`));
}

// Copy assets
export function assets() {
  return gulp
    .src(paths.assets, { base: "src", encoding: false })
    .pipe(gulp.dest(paths.dist));
}

// Compile Handlebars templates to HTML
export function templates() {
  return gulp
    .src(paths.pages)
    .pipe(plumber())
    .pipe(data(loadData))
    .pipe(
      hb()
        .partials(paths.layouts)
        .partials(paths.partials)
        .helpers(paths.helpers)
        .decorators(paths.decorators)
        .helpers(layouts)
    )
    .pipe(rename({ extname: ".html" }))
    .pipe(gulp.dest(paths.dist));
}

// Reload BrowserSync
export function reload(done) {
  browserSync.reload();
  done();
}

// Serve with BrowserSync and watch for changes
export function serve() {
  browserSync.init({
    server: { baseDir: paths.dist },
  });

  gulp.watch(paths.scss, scss);
  gulp.watch(paths.css, css);
  gulp.watch(paths.scripts, scripts);
  gulp.watch(paths.images, images);
  gulp.watch(paths.pages, gulp.series(templates, html, reload));
  gulp.watch(paths.layouts, gulp.series(templates, html, reload));
  gulp.watch(paths.partials, gulp.series(templates, html, reload));
  gulp.watch(paths.helpers, gulp.series(templates, html, reload));
  gulp.watch(paths.decorators, gulp.series(templates, html, reload));
  gulp.watch(`${paths.data}/**/*.json`, gulp.series(templates, reload));
  gulp.watch(paths.assets, gulp.series(assets, reload));
}

// Build task
export const build = gulp.series(
  clean,
  ensureDirectories,
  gulp.parallel(templates, assets, scss, css, scripts, images),
  html
);

// Default task
export default gulp.series(build, serve);
