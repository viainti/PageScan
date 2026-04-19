import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const extensionDir = join(root, "extension");
const distDir = join(root, "dist-extension");

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

if (!existsSync(extensionDir)) {
  throw new Error("Missing extension/ directory.");
}

const filesToCopy = [
  "manifest.json",
  "icon16.png",
  "icon32.png",
  "icon48.png",
  "icon128.png",
  "favicon.ico",
];

for (const file of filesToCopy) {
  const source = join(root, "public", file);
  if (existsSync(source)) {
    cpSync(source, join(distDir, file));
  }
}

cpSync(extensionDir, distDir, { recursive: true });
