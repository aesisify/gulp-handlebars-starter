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
import cache from "gulp-cached";
import remember from "gulp-remember";
import size from "gulp-size";
import filter from "gulp-filter";
import changed from "gulp-changed";

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
  const directories = Object.values(paths)
    .map((p) => p.replace(/\/\*\*.*$/, ""))
    .filter((dir, index, self) => self.indexOf(dir) === index);

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created missing directory: ${dir}`);
    }
  });
  done();
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
    .src(`${paths.dist}/**/*.html`)
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        minifyJS: true,
        minifyCSS: true,
      })
    )
    .pipe(
      prettier({
        parser: "html",
        htmlWhitespaceSensitivity: "ignore",
        bracketSameLine: true,
      })
    )
    .pipe(size({ title: "HTML", showFiles: true }))
    .pipe(gulp.dest(paths.dist));
}

// Compile SCSS to CSS
export function scss() {
  const processors = [
    autoprefixer(),
    cssnano({ preset: ["default", { discardComments: { removeAll: true } }] }),
  ];

  return gulp
    .src(paths.scss)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(postcss(processors))
    .pipe(sourcemaps.write("."))
    .pipe(size({ title: "CSS", showFiles: true }))
    .pipe(gulp.dest(`${paths.dist}/assets/css`))
    .pipe(browserSync.stream());
}

// Copy and optimize plain CSS files
export function css() {
  const processors = [
    autoprefixer(),
    cssnano({ preset: ["default", { discardComments: { removeAll: true } }] }),
  ];

  return gulp
    .src(paths.css)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write("."))
    .pipe(size({ title: "CSS", showFiles: true }))
    .pipe(gulp.dest(`${paths.dist}/assets/css`))
    .pipe(browserSync.stream());
}

// Optimize JavaScript files
export function scripts() {
  return gulp
    .src(paths.scripts)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(size({ title: "JS", showFiles: true }))
    .pipe(gulp.dest(`${paths.dist}/assets/js`))
    .pipe(browserSync.stream());
}

// Optimize and copy images
export async function images() {
  const imagemin = (await import("gulp-imagemin")).default;
  const mozjpeg = (await import("imagemin-mozjpeg")).default;
  const optipng = (await import("imagemin-optipng")).default;
  const svgo = (await import("imagemin-svgo")).default;

  return gulp
    .src(paths.images)
    .pipe(plumber())
    .pipe(changed(`${paths.dist}/assets/img`))
    .pipe(
      imagemin(
        [
          mozjpeg({ quality: 75, progressive: true }),
          optipng({ optimizationLevel: 5 }),
          svgo({
            plugins: [
              { name: "removeViewBox", active: false },
              { name: "cleanupIDs", active: false },
            ],
          }),
        ],
        { verbose: true }
      )
    )
    .pipe(size({ title: "Images", showFiles: true }))
    .pipe(gulp.dest(`${paths.dist}/assets/img`))
    .pipe(browserSync.stream());
}

// Copy assets
export function assets() {
  return gulp
    .src(paths.assets, { base: "src" })
    .pipe(changed(paths.dist))
    .pipe(size({ title: "Assets", showFiles: true }))
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.stream());
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
    .pipe(size({ title: "Templates", showFiles: true }))
    .pipe(gulp.dest(paths.dist));
}

// Reload BrowserSync
export function reload(done) {
  browserSync.reload();
  done();
}

// Optimized watch configuration
export function serve() {
  browserSync.init({
    server: { baseDir: paths.dist },
    open: false,
    notify: false,
    ghostMode: false,
    ui: false,
  });

  // Watch templates and related files
  gulp.watch(
    [
      paths.pages,
      paths.layouts,
      paths.partials,
      paths.helpers,
      paths.decorators,
    ],
    { ignoreInitial: false },
    gulp.series(templates, html, reload)
  );

  // Watch data files
  gulp.watch(
    `${paths.data}/**/*.json`,
    { ignoreInitial: false },
    gulp.series(templates, html, reload)
  );

  // Watch styles
  gulp.watch(paths.scss, { ignoreInitial: false }, scss);
  gulp.watch(paths.css, { ignoreInitial: false }, css);

  // Watch scripts
  gulp.watch(
    paths.scripts,
    { ignoreInitial: false },
    gulp.series(scripts, reload)
  );

  // Watch images
  gulp.watch(
    paths.images,
    { ignoreInitial: false },
    gulp.series(images, reload)
  );

  // Watch other assets
  gulp.watch(
    [
      paths.assets,
      `!${paths.scss}`,
      `!${paths.css}`,
      `!${paths.scripts}`,
      `!${paths.images}`,
    ],
    { ignoreInitial: false },
    gulp.series(assets, reload)
  );
}

// Development build
export const dev = gulp.series(
  clean,
  ensureDirectories,
  gulp.parallel(templates, assets, scss, css, scripts, images),
  html
);

// Production build
export const build = gulp.series(
  clean,
  ensureDirectories,
  gulp.parallel(templates, assets, scss, css, scripts, images),
  html
);

// Default task
export default gulp.series(dev, serve);
