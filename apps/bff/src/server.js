import express from "express";
import cors from "cors";
import fs from "node:fs";
import { config } from "./config.js";
import healthRouter from "./routes/health.js";
import documentsRouter from "./routes/documents.js";

const app = express();

app.use(cors());
app.use(express.json());

function ensureFolders() {
  Object.values(config.paths).forEach((folder) => {
    fs.mkdirSync(folder, { recursive: true });
  });
}

app.use("/api/health", healthRouter);
app.use("/api/documents", documentsRouter);

ensureFolders();

app.listen(config.port, () => {
  console.log(`BFF laeuft auf http://localhost:${config.port}`);
});
