import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const file of ["index.html", "styles.css", "app.js"]) {
  copyFileSync(file, join(dist, file));
}

for (const file of ["CitrixBootstrap.js", "CitrixWebRTC.js"]) {
  const from = join("node_modules", "@citrix", "ucsdk", file);
  const to = join(dist, file);
  let content = readFileSync(from, "utf8");

  if (file === "CitrixWebRTC.js") {
    content = content.replace(
      ':f.CitrixWebRTC=k()})(self,function(){',
      ':k()})(self,function(){'
    );
  }

  writeFileSync(to, content);
}
