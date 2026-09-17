import { findUp } from "find-up";
import path from "node:path";

const projectWorkspacePathString = await findUp("pnpm-workspace.yaml");
const projectRoot = path.dirname(projectWorkspacePathString);
export const bffAppRoot = path.join(projectRoot, "apps/bff");
