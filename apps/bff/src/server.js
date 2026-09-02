import express from "express";
import cors from "cors";
import fs from "node:fs";
import { config } from "./config.js";
import InboxReaderService from "./services/InboxReaderService.js"

const app = express();
const readerService = new InboxReaderService(
  "/Users/simon/WebstormProjects/js-pruefung/data/inbox"
);

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

readerService.startObserver(async ({ filename, filePath, data }) => {
  console.log(`Neue PDF-Datei gefunden: ${filename}`);
});
