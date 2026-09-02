import fs from "node:fs"
import fsPromises from "node:fs/promises";
import path from "node:path";

export default class InboxReaderService {
  constructor(directory) {
    this.directory = directory;
    this.watcher = null;
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

      try {
        await this.waitForFile(filePath);

        const pdfBuffer = await fsPromises.readFile(filePath);

        await onPdf({
          filename,
          filePath,
          data: pdfBuffer,
        });
      } catch (error) {
        console.log(`Fehler beim Verarbeiten von ${filename}`, error);
      }
    });
    console.log("Observer gestartet");
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
        console.error(`Fehler beim Warten auf Datei ${filePath}:`, error);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error(`Datei wurde nicht rechtzeitig verfügbar: ${filePath}`);
  }

  stopObserver() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}
