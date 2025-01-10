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
import size from "gulp-size";
import changed from "gulp-changed";
import cache from "gulp-cached";
import remember from "gulp-remember";
import filter from "gulp-filter";
import vinylFs from "vinyl-fs";

import { paths, config } from "./config.js";

// Disable fs.Stats deprecation warning
process.env.NO_DEPRECATION = "*";

const browserSync = browserSyncLib.create();
const sass = gulpSass(dartSass);

// Size tracking
const sizes = {
  scripts: {
    original: size({ title: "JavaScript (Original)", ...config.size }),
    optimized: size({ title: "JavaScript (Minified)", ...config.size }),
  },
  styles: {
    original: size({ title: "CSS (Original)", ...config.size }),
    optimized: size({ title: "CSS (Minified)", ...config.size }),
  },
  images: {
    original: size({ title: "Images (Original)", ...config.size }),
    optimized: size({ title: "Images (Optimized)", ...config.size }),
  },
  html: {
    original: size({ title: "HTML (Original)", ...config.size }),
    optimized: size({ title: "HTML (Minified)", ...config.size }),
  },
};

// Cache busting string
const cacheBust = Date.now().toString();

// Persistent data cache
const dataCache = new Map();

// Error handler
function handleError(err) {
  console.error(err.toString());
  this.emit("end");
}

// Ensure directories exist
function ensureDirectories(done) {
  const directories = Object.values(paths)
    .map((p) => p.replace(/\/\*\*.*$/, ""))
    .filter((dir, index, self) => self.indexOf(dir) === index);

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  done();
}

// Clean dist folder
function clean(done) {
  deleteAsync([paths.dist], { force: true }).then(() => done());
}

// Load JSON data with caching
function loadData() {
  const dataObj = {
    cacheBust,
  };

  try {
    fs.readdirSync(paths.data)
      .filter((filename) => filename.endsWith(".json"))
      .forEach((filename) => {
        const key = path.basename(filename, ".json");
        const filePath = path.join(paths.data, filename);
        const stats = fs.statSync(filePath);

        if (
          !dataCache.has(filePath) ||
          dataCache.get(filePath).mtime < stats.mtime
        ) {
          try {
            dataObj[key] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            dataCache.set(filePath, { data: dataObj[key], mtime: stats.mtime });
          } catch (error) {
            console.error(`Error parsing ${filePath}:`, error);
            dataObj[key] = {};
          }
        } else {
          dataObj[key] = dataCache.get(filePath).data;
        }
      });
    return dataObj;
  } catch (error) {
    console.error("Error reading data directory:", error);
    return {};
  }
}

// Function to log size comparison
function logSizeComparison(type) {
  const originalSize = sizes[type].original.size;
  const optimizedSize = sizes[type].optimized.size;
  const savings = originalSize - optimizedSize;

  // Skip logging if there's no original size or no change
  if (originalSize === 0 || savings === 0) {
    return;
  }

  const percentage = ((savings / originalSize) * 100).toFixed(2);
  console.log(
    `${type} size savings: ${(savings / 1024).toFixed(2)} KB (${percentage}% reduction)`
  );
}

// HTML optimization
function html() {
  return gulp
    .src(`${paths.dist}/**/*.html`)
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(changed(paths.dist, { hasChanged: changed.compareLastModifiedTime }))
    .pipe(sizes.html.original)
    .pipe(htmlmin(config.html))
    .pipe(
      prettier({
        parser: "html",
        htmlWhitespaceSensitivity: "ignore",
        bracketSameLine: true,
      })
    )
    .pipe(sizes.html.optimized)
    .on("end", () => logSizeComparison("html"))
    .pipe(gulp.dest(paths.dist));
}

// SCSS compilation
function scss() {
  return gulp
    .src(paths.scss)
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(cache("scss"))
    .pipe(sourcemaps.init())
    .pipe(sizes.styles.original)
    .pipe(sass(config.sass).on("error", sass.logError))
    .pipe(
      postcss([
        autoprefixer(config.postcss.autoprefixer),
        cssnano(config.postcss.cssnano),
      ])
    )
    .pipe(sizes.styles.optimized)
    .on("end", () => logSizeComparison("styles"))
    .pipe(sourcemaps.write("."))
    .pipe(remember("scss"))
    .pipe(gulp.dest(`${paths.dist}/assets/css`))
    .pipe(filter("**/*.css"))
    .pipe(browserSync.stream());
}

// CSS optimization
function css() {
  return gulp
    .src(paths.css)
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(cache("css"))
    .pipe(sourcemaps.init())
    .pipe(
      postcss([
        autoprefixer(config.postcss.autoprefixer),
        cssnano(config.postcss.cssnano),
      ])
    )
    .pipe(sourcemaps.write("."))
    .pipe(remember("css"))
    .pipe(size({ ...config.size, title: "Optimized CSS" }))
    .pipe(gulp.dest(`${paths.dist}/assets/css`))
    .pipe(filter("**/*.css"))
    .pipe(browserSync.stream());
}

// JavaScript optimization
function scripts() {
  return gulp
    .src(paths.scripts)
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(cache("scripts"))
    .pipe(sourcemaps.init())
    .pipe(sizes.scripts.original)
    .pipe(terser(config.terser))
    .pipe(sizes.scripts.optimized)
    .on("end", () => logSizeComparison("scripts"))
    .pipe(sourcemaps.write("."))
    .pipe(remember("scripts"))
    .pipe(gulp.dest(`${paths.dist}/assets/js`))
    .pipe(filter("**/*.js"))
    .pipe(browserSync.stream());
}

// Image optimization
async function images(done) {
  try {
    const imagemin = (await import("gulp-imagemin")).default;
    const mozjpeg = (await import("imagemin-mozjpeg")).default;
    const optipng = (await import("imagemin-optipng")).default;
    const svgo = (await import("imagemin-svgo")).default;
    const gifsicle = (await import("imagemin-gifsicle")).default;

    const stream = vinylFs
      .src(paths.images, {
        encoding: null,
        resolveSymlinks: false,
        removeBOM: false,
      })
      .pipe(plumber({ errorHandler: handleError }))
      .pipe(
        changed(`${paths.dist}/assets/img`, {
          hasChanged: changed.compareLastModifiedTime,
        })
      )
      .pipe(sizes.images.original)
      .pipe(
        imagemin(
          [
            mozjpeg(config.imagemin.mozjpeg),
            optipng(config.imagemin.optipng),
            svgo(config.imagemin.svgo),
            gifsicle(config.imagemin.gifsicle),
          ],
          {
            verbose: false,
            silent: true,
          }
        )
      )
      .pipe(sizes.images.optimized)
      .on("end", () => logSizeComparison("images"))
      .pipe(vinylFs.dest(`${paths.dist}/assets/img`));

    stream.on("end", () => {
      browserSync.reload();
      done();
    });

    stream.on("error", (error) => {
      console.error("Error in images task:", error);
      done(error);
    });

    return stream;
  } catch (error) {
    console.error("Error loading image optimization modules:", error);
    done(error);
  }
}

// Asset copying
function assets() {
  const excludePatterns = [
    `!${paths.scss}`,
    `!${paths.css}`,
    `!${paths.scripts}`,
    `!${paths.images}`,
  ];

  return vinylFs
    .src([paths.assets, ...excludePatterns], {
      base: "src",
      encoding: null,
      resolveSymlinks: false,
      removeBOM: false,
    })
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(changed(paths.dist))
    .pipe(size({ ...config.size, title: "Copied Assets" }))
    .pipe(vinylFs.dest(paths.dist))
    .pipe(browserSync.stream());
}

// Handlebars templates compilation
function templates() {
  return gulp
    .src(paths.pages)
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(cache("templates"))
    .pipe(data(loadData))
    .pipe(
      hb({
        debug: false,
      })
        .partials(paths.layouts)
        .partials(paths.partials)
        .helpers(layouts)
        .helpers(paths.helpers)
        .decorators(paths.decorators)
        .data({ cacheBust })
    )
    .pipe(rename({ extname: ".html" }))
    .pipe(remember("templates"))
    .pipe(size({ ...config.size, title: "Compiled Templates" }))
    .pipe(gulp.dest(paths.dist));
}

// Clear template cache
function clearTemplateCache(done) {
  delete cache.caches["templates"];
  done();
}

// Build task
const build = gulp.series(
  clean,
  ensureDirectories,
  gulp.parallel(templates, assets, scss, css, scripts, images),
  html
);

// Development server
function serve(done) {
  browserSync.init(config.browserSync);

  // Watch templates
  gulp.watch(
    paths.pages,
    gulp.series(templates, html, (done) => {
      browserSync.reload();
      done();
    })
  );

  // Watch layouts and partials
  gulp.watch(
    [paths.layouts, paths.partials],
    gulp.series(clearTemplateCache, templates, html, (done) => {
      browserSync.reload();
      done();
    })
  );

  // Watch helpers and decorators
  gulp.watch(
    [paths.helpers, paths.decorators],
    gulp.series(clearTemplateCache, templates, html, (done) => {
      browserSync.reload();
      done();
    })
  );

  // Watch data files
  gulp.watch(
    `${paths.data}/**/*.json`,
    gulp.series(clearTemplateCache, templates, html, (done) => {
      browserSync.reload();
      done();
    })
  );

  // Watch styles
  gulp.watch(paths.scss, scss);
  gulp.watch(paths.css, css);

  // Watch scripts
  gulp.watch(
    paths.scripts,
    gulp.series(scripts, (done) => {
      browserSync.reload();
      done();
    })
  );

  // Watch images
  gulp.watch(
    paths.images,
    gulp.series(images, (done) => {
      browserSync.reload();
      done();
    })
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
    gulp.series(assets, (done) => {
      browserSync.reload();
      done();
    })
  );

  done();
}

// Default task
export default gulp.series(build, serve);

// Export tasks
export { clean, build };
