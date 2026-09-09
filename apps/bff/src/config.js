import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const projectRoot = path.resolve(__dirname, "../../../");

export const config = {
  port: process.env.PORT || 4000,

  classificationServiceUrl:
    process.env.CLASSIFICATION_SERVICE_URL || "http://localhost:8080/api/v1/classify/",

  paths: {
    scanner: path.join(projectRoot, "data", "scanner"),
    inbox: path.join(projectRoot, "data", "inbox"),
    waiting: path.join(projectRoot, "data", "waiting"),
    processed: path.join(projectRoot, "data", "processed"),
    trash: path.join(projectRoot, "data", "trash"),
  },

  metadataFile: path.join(projectRoot, "data", "metadata.json"),

  deletionRetentionDays: 30,

  fileSizeUploadLimit: 20 * 1024 * 1024, // 20MB

  states: {
    inbox: "INBOX",
    scanner: "SCANNER",
    processed: "PROCESSED",
    waiting: "WAITING",
    trash: "TRASH",
  },

  source: {
    auto: "AUTO",
    manual: "MANUAL",
  },
};
