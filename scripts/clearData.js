/**
 * Löscht den Inhalt aller Unterordner im "data"-Verzeichnis,
 * behält dabei aber die .gitkeep-Dateien.
 *
 * Aufruf:
 *   - node scripts/clearData.js
 *   - node scripts/clearData.js --dry-run   (zeigt nur an, was gelöscht würde)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import console from "node:console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const dataDir = path.resolve(__dirname, "..", "data");

if (!fs.existsSync(dataDir)) {
  console.error(`Fehler: Verzeichnis nicht gefunden: ${dataDir}`);
  process.exit(1);
}

let filesDeleted = 0;

function cleanFolder(folderPath) {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);

    if (entry.name === ".gitkeep") {
      continue;
    }

    if (entry.isDirectory()) {
      cleanFolder(fullPath);
    } else {
      filesDeleted++;
      if (dryRun) {
        console.log(`[dry-run] würde löschen: ${fullPath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`gelöscht: ${fullPath}`);
      }
    }
  }
}

function clearMetadataFile() {
  const metadataPath = path.join(dataDir, "metadata.json");

  if (!fs.existsSync(metadataPath)) {
    console.warn(`Warnung: ${metadataPath} nicht gefunden, überspringe.`);
    return;
  }

  if (dryRun) {
    console.log(`[dry-run] würde Inhalt von ${metadataPath} auf [] setzen`);
  } else {
    fs.writeFileSync(metadataPath, "[]", "utf-8");
    console.log(`geleert: ${metadataPath}`);
  }
}

const topLevelEntries = fs.readdirSync(dataDir, { withFileTypes: true });

let foldersProcessed = 0;

for (const entry of topLevelEntries) {
  if (entry.isDirectory()) {
    const folderPath = path.join(dataDir, entry.name);
    cleanFolder(folderPath);
    foldersProcessed++;
  }
}

clearMetadataFile();

const suffix = dryRun ? " (Dry-Run, nichts wurde tatsächlich gelöscht)" : "";

if (filesDeleted === 0) {
  console.log(
    `\nFertig. ${foldersProcessed} Unterordner in "${dataDir}" durchsucht — es gab nichts zu löschen.${suffix}`
  );
} else {
  console.log(
    `\nFertig. ${filesDeleted} Datei(en) in ${foldersProcessed} Unterordnern in "${dataDir}" gelöscht.${suffix}`
  );
}
