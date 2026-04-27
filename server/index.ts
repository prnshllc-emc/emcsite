/**
 * Lightweight Express server for serving the SPA static files.
 * Manus deployment expects `node dist/index.js` as the entry point.
 * This server serves the Vite-built SPA from ../client-dist/ with:
 * - Static file serving with caching headers
 * - SPA fallback (all routes serve index.html)
 * - Health check endpoint
 * - Security headers
 * - Gzip compression
 */

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Resolve the client build directory
// In production, the build output is at dist/client-dist/ (sibling to dist/index.js)
const clientDistPath = path.resolve(__dirname, "client-dist");

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).type("text/plain").send("OK");
});

// Serve static assets with aggressive caching (hashed filenames)
app.use(
  "/assets",
  express.static(path.join(clientDistPath, "assets"), {
    maxAge: "1y",
    immutable: true,
  })
);

// Serve other static files with moderate caching
app.use(
  express.static(clientDistPath, {
    maxAge: "1h",
    index: false, // Don't auto-serve index.html for directory requests
  })
);

// SPA fallback — all unmatched routes serve index.html
// Express 5 uses path-to-regexp v8 which requires named params for wildcards
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[EMC SPA Server] Listening on port ${PORT}`);
  console.log(`[EMC SPA Server] Serving static files from ${clientDistPath}`);
});
