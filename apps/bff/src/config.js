import path from "node:path";
import { bffAppRoot } from "./utils/pathHelper.js";

export const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Intelligentes Postfach – API",
      version: "1.1.0",
      description: "API Dokumentation",
    },
    servers: [
      {
        url: "http://localhost:4000/api/",
      },
    ],
  },
  apis: [`${bffAppRoot}/src/routes/docs/*.yaml`],
};

export const config = {
  port: process.env.PORT || 4000,

  classificationServiceUrl:
    process.env.CLASSIFICATION_SERVICE_URL || "http://localhost:8080/api/v1/classify/",

  paths: {
    scanner: path.join(bffAppRoot, "data", "scanner"),
    inbox: path.join(bffAppRoot, "data", "inbox"),
    waiting: path.join(bffAppRoot, "data", "waiting"),
    processed: path.join(bffAppRoot, "data", "processed"),
    trash: path.join(bffAppRoot, "data", "trash"),
  },

  metadataFile: path.join(bffAppRoot, "data", "metadata.json"),

  confidenceThreshold: 0.6,

  deletionRetentionSeconds: 30,

  fileSizeUploadLimit: 20 * 1024 * 1024, // 20MB
};
