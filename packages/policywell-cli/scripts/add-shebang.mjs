import { chmodSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, "../dist/index.js");
const shebang = "#!/usr/bin/env node\n";
const body = readFileSync(target, "utf8");
const next = body.startsWith("#!") ? body : shebang + body;
writeFileSync(target, next, "utf8");
chmodSync(target, 0o755);
console.log("Shebang ensured on", target);
