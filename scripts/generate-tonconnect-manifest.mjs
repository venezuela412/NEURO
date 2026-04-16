import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDirectory, "..");
const outputPath = path.join(workspaceRoot, "apps/miniapp/public/tonconnect-manifest.json");

function sanitizeUrl(value, fallback) {
  try {
    const url = new URL(value ?? fallback);
    return url.toString().replace(/\/$/, "");
  } catch {
    return fallback.replace(/\/$/, "");
  }
}

const appUrl = sanitizeUrl(process.env.VITE_APP_URL, "http://localhost:5173");
const manifest = {
  url: appUrl,
  name: "NEURO",
  iconUrl: `${appUrl}/favicon.svg`,
  termsOfUseUrl: `${appUrl}/terms`,
  privacyPolicyUrl: `${appUrl}/privacy`,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

process.stdout.write(`Generated TonConnect manifest at ${outputPath}\n`);
