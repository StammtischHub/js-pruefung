import { findUp } from "find-up";
import path from "node:path";

const rootWorkspace = await findUp("pnpm-workspace.yaml");
const projectRoot = path.dirname(rootWorkspace);

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

  classificationType: {
    auto: "AUTO",
    corrected: "CORRECTED",
    manual: "MANUAL",
  },
};
