import express from "express";
import cors from "cors";
import { mkdirSync } from "node:fs";
import { config, swaggerOptions } from "./config.js";
import healthRouter from "./routes/health.js";
import documentsRouter from "./routes/documents.js";
import ScannerReaderService from "./services/ScannerReaderService.js";
import schedule from "node-schedule";
import { deleteOldFiles } from "./services/DeletionService.js";
import { errorHandler } from "./utils/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { bffAppRoot } from "./utils/pathHelper.js";

const app = express();
const readerService = new ScannerReaderService(config.paths.scanner);
const swaggerDocs = swaggerJsDoc(swaggerOptions);

function ensureFolders() {
  Object.values(config.paths).forEach((folder) => {
    mkdirSync(folder, { recursive: true });
  });
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(cors());
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/documents", documentsRouter);

app.use(errorHandler);

ensureFolders();

app.listen(config.port, () => {
  console.log(`BFF running on http://localhost:${config.port}`);
});

readerService.startObserver(async (document) => {
  try {
    await document.classify();
  } catch (error) {
    console.error(`Error processing document ${document.filename}`, error);
  }
});

schedule.scheduleJob(`*/${config.deletionRetentionSeconds} * * * * *`, () => {
  deleteOldFiles().then();
});
