import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { Document } from "../objects/Document.js";

export default class ScannerReaderService {
  constructor(directory) {
    this.directory = directory;
    this.watcher = null;
    this.processingPaths = new Set();
  }

  startObserver(onPdf) {
    this.watcher = fs.watch(this.directory, async (eventType, filename) => {
      if (!filename) {
        return;
      }

      if (path.extname(filename).toLowerCase() !== ".pdf") {
        return;
      }

      if (eventType !== "rename") {
        return;
      }

      const filePath = path.join(this.directory, filename);

      if (this.processingPaths.has(filePath)) {
        return;
      }
      this.processingPaths.add(filePath);

      try {
        try {
          await fsPromises.access(filePath, fsPromises.constants.F_OK);
        } catch {
          return;
        }

        await this.waitForFile(filePath);

        try {
          await fsPromises.access(filePath, fsPromises.constants.F_OK);
        } catch {
          return;
        }

        const document = Document.fromExistingFile(filePath);

        await onPdf(document);
      } catch (error) {
        console.log(`Error processing ${filename}`, error);
      } finally {
        this.processingPaths.delete(filePath);
      }
    });
    console.log("Observer started");
  }

  async waitForFile(filePath, retries = 10) {
    for (let i = 0; i < retries; i++) {
      try {
        await fsPromises.access(filePath);

        const size1 = (await fsPromises.stat(filePath)).size;

        await new Promise((resolve) => setTimeout(resolve, 500));

        const size2 = (await fsPromises.stat(filePath)).size;

        if (size1 === size2) {
          return;
        }
      } catch (error) {
        console.error(`Error waiting for file ${filePath}:`, error);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error(`File was not made available in time: ${filePath}`);
  }

  stopObserver() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}
