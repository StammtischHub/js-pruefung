import express from "express";
import cors from "cors";
import fs from "node:fs";
import { config } from "./config.js";

const app = express();

app.use(cors());
app.use(express.json());

function ensureFolders() {
  Object.values(config.paths).forEach((folder) => {
    fs.mkdirSync(folder, { recursive: true });
  });
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

ensureFolders();

app.listen(config.port, () => {
  console.log(`BFF laeuft auf http://localhost:${config.port}`);
});
