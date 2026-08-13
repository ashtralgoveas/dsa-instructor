import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dsaRouter from "./routes/dsa.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const port = Number(process.env.PORT) || 3000;

const clientDistPath = path.resolve(__dirname, "../../client/dist");
const clientIndexPath = path.join(clientDistPath, "index.html");
const serveClient = fs.existsSync(clientIndexPath);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/dsa", dsaRouter);

if (serveClient) {
  app.use(express.static(clientDistPath));

  // SPA fallback for React Router routes (/dashboard, /topics, ...)
  app.get("/{*path}", (req, res) => {
    if (req.path.startsWith("/api")) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.sendFile(clientIndexPath);
  });
}

app.listen(port, () => {
  console.log(`DSA Instructor API listening on http://localhost:${port}`);
  if (serveClient) {
    console.log(`Serving frontend from ${clientDistPath}`);
  } else {
    console.log(
      "Frontend build not found (client/dist). API-only mode. Run npm run build for full production."
    );
  }
});
