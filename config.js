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
  dist: "dist",
};

export const config = {
  html: {
    collapseWhitespace: true,
    removeComments: true,
    minifyJS: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log"],
      },
    },
    minifyCSS: true,
    removeAttributeQuotes: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    sortAttributes: true,
    sortClassName: true,
    decodeEntities: true,
    removeOptionalTags: true,
    quoteCharacter: '"',
  },
  sass: {
    outputStyle: "compressed",
    precision: 3,
    sourceMapContents: true,
    includePaths: ["node_modules"],
    quietDeps: true,
  },
  terser: {
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ["console.log"],
      passes: 2,
      unsafe_math: true,
      unsafe_methods: true,
    },
    mangle: {
      properties: false,
      toplevel: true,
    },
    format: {
      comments: false,
      max_line_len: 500,
    },
  },
  imagemin: {
    mozjpeg: {
      quality: 82,
      progressive: true,
      smooth: 1,
      trellis: true,
      trellisDC: true,
      dcScanOpt: 2,
      tune: "hvs-psnr",
      overshoot: true,
    },
    optipng: {
      optimizationLevel: 4,
      bitDepthReduction: true,
      colorTypeReduction: true,
      paletteReduction: true,
      interlaced: true,
      errorRecovery: true,
    },
    svgo: {
      plugins: [
        { name: "preset-default" },
        { name: "removeViewBox", active: false },
        { name: "removeDimensions", active: true },
        { name: "cleanupIDs", active: true },
        { name: "removeUselessDefs", active: true },
        { name: "removeEmptyAttrs", active: true },
        { name: "removeEmptyContainers", active: true },
        { name: "mergePaths", active: true },
        { name: "convertPathData", active: true },
        { name: "convertTransform", active: true },
        { name: "cleanupNumericValues", active: true },
        { name: "collapseGroups", active: true },
        { name: "removeUselessStrokeAndFill", active: true },
        { name: "removeUnusedNS", active: true },
        { name: "sortDefsChildren", active: true },
        { name: "removeTitle", active: true },
        { name: "removeDesc", active: true },
        { name: "removeEditorsNSData", active: true },
        { name: "removeEmptyText", active: true },
        { name: "convertStyleToAttrs", active: true },
        { name: "removeComments", active: true },
        { name: "inlineStyles", active: true },
        { name: "minifyStyles", active: true },
        { name: "cleanupAttrs", active: true },
        { name: "removeXMLProcInst", active: true },
        { name: "removeMetadata", active: true },
        { name: "sortAttrs", active: true },
      ],
    },
    gifsicle: {
      optimizationLevel: 3,
      interlaced: true,
      colors: 256,
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
          normalizeWhitespace: true,
          minifyFontValues: { removeQuotes: true },
          colormin: true,
          reduceIdents: true,
          mergeIdents: true,
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
          res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, private"
          );
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
          next();
        },
      ],
    },
    open: true,
    notify: true,
    ghostMode: false,
    port: 3000,
    logLevel: "info",
    logFileChanges: false,
    codeSync: true,
    reloadOnRestart: true,
    reloadDebounce: 100,
    injectChanges: false,
    socket: {
      domain: "localhost:3000",
    },
  },
  size: {
    showFiles: true,
    showTotal: true,
    pretty: true,
    gzip: true,
  },
  plumber: {
    errorHandler: function (err) {
      console.error(err.toString());
      this.emit("end");
    },
  },
};
