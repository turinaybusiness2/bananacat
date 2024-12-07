import restart from "vite-plugin-restart";

const isProd = process.env.NODE_ENV === "production";

export default {
  root: "src/",
  publicDir: "../static/",

  server: {
    host: true,
    open: true,
    proxy: {
      "/api": {
        target: isProd
          ? "https://forgivemeai.vercel.app/"
          : "http://localhost:3000", // Switch based on environment
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // Rewrites '/api/reply' to '/reply' for Express
      },
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  plugins: [restart({ restart: ["../static/**"] })],
};
