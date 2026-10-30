// Copia só os arquivos públicos do site para dist/, que é a pasta publicada pela Netlify.
// Assim node_modules, funções, .env e readme não ficam acessíveis no site.
import { cpSync, rmSync, mkdirSync } from "node:fs";

const PUBLICOS = ["index.html", "styles.css", "script.js", "config.js", "assets"];

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
for (const item of PUBLICOS) cpSync(item, `dist/${item}`, { recursive: true });

console.log(`Site copiado para dist/: ${PUBLICOS.join(", ")}`);
