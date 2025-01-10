export const paths = {
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
  maps: "src/assets/**/*.map",
  dist: "dist",
};

export const config = {
  html: {
    collapseWhitespace: true,
    removeComments: true,
    minifyJS: true,
    minifyCSS: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
  },
  sass: {
    outputStyle: "compressed",
    precision: 6,
    sourceMapContents: true,
    includePaths: ["node_modules"],
  },
  terser: {
    compress: {
      drop_console: false,
      drop_debugger: true,
    },
    mangle: true,
    format: {
      comments: false,
    },
  },
  imagemin: {
    mozjpeg: {
      quality: 85,
      progressive: true,
    },
    optipng: {
      optimizationLevel: 3,
    },
    svgo: {
      plugins: [
        { name: "preset-default" },
        { name: "removeViewBox", active: false },
        { name: "removeDimensions", active: true },
      ],
    },
    gifsicle: {
      optimizationLevel: 2,
    },
  },
  postcss: {
    autoprefixer: {
      cascade: false,
      grid: "autoplace",
    },
    cssnano: {
      preset: [
        "default",
        {
          discardComments: { removeAll: true },
          zindex: false,
        },
      ],
    },
  },
  browserSync: {
    server: {
      baseDir: paths.dist,
      middleware: [
        function (req, res, next) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          next();
        },
      ],
    },
  },
  size: {
    showFiles: true,
    showTotal: true,
    pretty: true,
  },
  plumber: {
    errorHandler: function (err) {
      console.error(err.toString());
      this.emit("end");
    },
  },
};
