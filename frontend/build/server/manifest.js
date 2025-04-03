const manifest = (() => {
  function __memo(fn) {
    let value;
    return () => (value ??= value = fn());
  }

  return {
    appDir: "_app",
    appPath: "_app",
    assets: new Set(["favicon.png"]),
    mimeTypes: { ".png": "image/png" },
    _: {
      client: {
        start: "_app/immutable/entry/start.BoGve1Ar.js",
        app: "_app/immutable/entry/app.aeXuy6m0.js",
        imports: [
          "_app/immutable/entry/start.BoGve1Ar.js",
          "_app/immutable/chunks/CyZx-cfw.js",
          "_app/immutable/chunks/nwBLtpdx.js",
          "_app/immutable/chunks/Zg7hjcAr.js",
          "_app/immutable/entry/app.aeXuy6m0.js",
          "_app/immutable/chunks/nwBLtpdx.js",
          "_app/immutable/chunks/BdGLW2Tw.js",
          "_app/immutable/chunks/26I3BnCA.js",
          "_app/immutable/chunks/Zg7hjcAr.js",
        ],
        stylesheets: [],
        fonts: [],
        uses_env_dynamic_public: false,
      },
      nodes: [
        __memo(() => import("./chunks/0-BBSsQlj2.js")),
        __memo(() => import("./chunks/1-_Co2NxOX.js")),
        __memo(() => import("./chunks/2-BhKDLGN8.js")),
      ],
      routes: [
        {
          id: "/",
          pattern: /^\/$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 2 },
          endpoint: null,
        },
      ],
      prerendered_routes: new Set([]),
      matchers: async () => {
        return {};
      },
      server_assets: {},
    },
  };
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
