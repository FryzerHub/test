import { createServer } from "http";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const HOST      = "93.115.101.142";
const PORT      = 13424;
const HTML_FILE = join(dirname(fileURLToPath(import.meta.url)), "index.html");
// ─────────────────────────────────────────────────────────────────────────────

if (!existsSync(HTML_FILE)) {
  console.error(`❌ index.html not found at: ${HTML_FILE}`);
  process.exit(1);
}

const server = createServer(async (req, res) => {
  // Only serve GET /
  if (req.method !== "GET" || req.url !== "/") {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
    return;
  }

  try {
    const html = await readFile(HTML_FILE);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
    console.log(`[${new Date().toISOString()}] GET / → 200`);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("500 Internal Server Error");
    console.error("❌ Error reading index.html:", err.message);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}/`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use.`);
  } else if (err.code === "EADDRNOTAVAIL") {
    console.error(`❌ IP address ${HOST} is not available on this machine.`);
  } else {
    console.error("❌ Server error:", err.message);
  }
  process.exit(1);
});

// Graceful shutdown
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    console.log(`\n⚡ ${sig} — shutting down server...`);
    server.close(() => {
      console.log("✅ Server closed.");
      process.exit(0);
    });
  });
}
