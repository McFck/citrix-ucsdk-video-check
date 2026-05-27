import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";

const dist = "dist";

rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, "vendor"), { recursive: true });

for (const file of ["index.html", "styles.css", "app.js"]) {
  copyFileSync(file, join(dist, file));
}

for (const file of ["CitrixBootstrap.js", "CitrixWebRTC.js"]) {
  const from = join("node_modules", "@citrix", "ucsdk", file);
  const to = join(dist, "vendor", file);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
}
