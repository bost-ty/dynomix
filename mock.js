import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

String.prototype.toNumber = (s) => Number(s);

const allowedOrigins = new Set([
  "https://dyno.bostwick.dev",
  "http://localhost:5173",
  "http://localhost:8000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8000",
]);

const nameTables = [
  [
    "MV-",
    "local-",
    "temp-",
    "TEMP_",
    "FINAL-",
    "FINAL_FINAL-",
    "exported-",
    null,
  ],
  ["playback_", "title_", "list_", null],
  [
    "EpisodePlayback_",
    "Countdown_",
    "List_",
    "Comp_",
    "L3_",
    "output-",
    "imported-",
  ],
  [
    "final_",
    "final_final_",
    "THISONE-",
    "USETHISONE_",
    "not_final-",
    "temp_",
    "WIP-",
    null,
  ],
  ["4k_", "1080p_", "full_", "compressed_", null, null, null],
  ["quiz", "featured-chat", "GTC"],
  ["v1", "-v2", "v2_final", "_final_v2", "final_final_v2", null],
  ["_final.mov", "-export.mp4", ".gttitle", ".png", ".jpg", ".jpeg", null],
];

function generateInputName(index) {
  let parts = [];
  for (const table of nameTables) {
    if (Math.random() > 0.33) {
      const idx = index % table.length;
      parts.push(table[idx]);
    }
  }
  return parts.length > 0 ? parts.join("") : generateInputName(index);
}

const port = 3000;

const dataLength = 120;
const data = [];

for (let i = 0; i < dataLength; i++) {
  let r = randomUUID();
  data.push({
    title: generateInputName(i),
    key: r,
    number: i + 1,
  });
}

const server = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Methods", "GET");
  // Allow access from our domain + specific local ports only
  if (allowedOrigins.has(req.headers.origin)) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
    if (req.url === "/instance/VMIX_B/inputs") {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify(data));
    }
  } else {
    res.statusCode = 403;
    res.end("Forbidden");
  }
});

server.listen(port, () => {
  console.log(`Mock API data server is running locally on port ${port}`);
});
