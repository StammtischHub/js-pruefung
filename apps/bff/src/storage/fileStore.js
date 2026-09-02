import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";

export async function moveToInbox(file, id) {
  const targetPath = path.join(config.paths.inbox, `${id}.pdf`);
  await fs.rename(file.path, targetPath);
  return targetPath;
}
