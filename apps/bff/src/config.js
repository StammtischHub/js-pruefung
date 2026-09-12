import { findUp } from "find-up";
import path from "node:path";
import { bffAppRoot, projectRoot } from "./utils/pathHelper.js";

export const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation',
    },
    servers: [
      {
        url: 'http://localhost:4000/api/',
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
    scanner: path.join(projectRoot, "data", "scanner"),
    inbox: path.join(projectRoot, "data", "inbox"),
    waiting: path.join(projectRoot, "data", "waiting"),
    processed: path.join(projectRoot, "data", "processed"),
    trash: path.join(projectRoot, "data", "trash"),
  },

  metadataFile: path.join(projectRoot, "data", "metadata.json"),

  confidenceThreshold: 0.6,

  deletionRetentionSeconds: 30,

  fileSizeUploadLimit: 20 * 1024 * 1024, // 20MB
};
