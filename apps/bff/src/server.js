import express from "express";
import cors from "cors";
import fs from "node:fs";
import { config } from "./config.js";
import healthRouter from "./routes/health.js";
import documentsRouter from "./routes/documents.js";
import ScannerReaderService from "./services/ScannerReaderService.js";
import ClassificationService from "./services/ClassificationService.js";

const app = express();
const readerService = new ScannerReaderService("../../data/scanner");
const classificationService = new ClassificationService("http://localhost:8080/api/v1/classify/");

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
  console.log(`BFF running on http://localhost:${config.port}`);
});

readerService.startObserver(async (file, id) => {
  classificationService
    .classifyFile(file, id)
    .then((assessment) => classificationService.routeFileByConfidence(file, id, assessment));
});
