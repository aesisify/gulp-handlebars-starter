/**
 * Gulpfile using Handlebars layout support via `handlebars-layouts`.
 */

const gulp = require("gulp");
const { deleteAsync } = require("del");
const plumber = require("gulp-plumber");
const data = require("gulp-data");
const hb = require("gulp-hb");
const layouts = require("handlebars-layouts");
const rename = require("gulp-rename");
const browserSync = require("browser-sync").create();
const fs = require("fs");
const path = require("path");

// Paths
const paths = {
  data: "src/data",
  layouts: "src/templates/layouts/**/*.hbs", // Layout files
  partials: "src/templates/partials/**/*.hbs", // Regular partials
  pages: "src/templates/pages/**/*.hbs", // Actual page templates
  helpers: "src/helpers/**/*.js", // Custom helper .js files
  decorators: "src/decorators/**/*.js", // Custom decorator .js files
  assets: "src/assets/**/*",
  dist: "dist",
};

// 0. Clean dist/ folder
async function clean() {
  await deleteAsync([paths.dist], { force: true });
}

// 1. Load JSON data from `src/data/*.json`
function loadData() {
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

// 2. Copy assets (images, fonts, CSS, JS, etc.)
function assets() {
  return gulp
    .src(paths.assets, { base: "src", encoding: false })
    .pipe(gulp.dest(paths.dist));
}

// 3. Compile Handlebars -> HTML with Layout Support
function templates() {
  return (
    gulp
      .src(paths.pages)
      .pipe(plumber()) // prevent pipeline crash on errors
      // Merge JSON data
      .pipe(data(loadData))
      .pipe(
        hb()
          // Load layout files as partials
          .partials(paths.layouts)
          // Load regular partials
          .partials(paths.partials)
          // Register custom helpers & decorators (if you have them)
          .helpers(paths.helpers)
          .decorators(paths.decorators)
          // Finally, register the layout helpers
          .helpers(layouts)
      )
      // Rename .hbs -> .html
      .pipe(rename({ extname: ".html" }))
      .pipe(gulp.dest(paths.dist))
  );
}

// 4. BrowserSync Reload
function reload(done) {
  browserSync.reload();
  done();
}

// 5. Serve and Watch
function serve() {
  browserSync.init({
    server: { baseDir: paths.dist },
  });

  gulp.watch(paths.pages, gulp.series(templates, reload));
  gulp.watch(paths.layouts, gulp.series(templates, reload));
  gulp.watch(paths.partials, gulp.series(templates, reload));
  gulp.watch(paths.helpers, gulp.series(templates, reload));
  gulp.watch(paths.decorators, gulp.series(templates, reload));
  gulp.watch(`${paths.data}/**/*.json`, gulp.series(templates, reload));
  gulp.watch(paths.assets, gulp.series(assets, reload));
}

// 6. Build
const build = gulp.series(clean, gulp.parallel(templates, assets));

// Exports
exports.templates = templates;
exports.assets = assets;
exports.build = build;
exports.serve = gulp.series(build, serve);
exports.default = exports.serve;
