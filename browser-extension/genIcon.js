const fs = require('fs');
const path = require('path');

// Konfigurasi folder
const ASSETS_DIR = path.join(__dirname, '../browser-extension/assets'); // Sesuaikan folder ikon Anda
const OUTPUT_FILE = path.join(__dirname, '../browser-extension/lib/constants/icon2.ts');

const files = fs.readdirSync(ASSETS_DIR).filter(file => file.endsWith('.svg'));

let imports = "";
let iconEntries = "";

files.forEach((file) => {
  const name = path.parse(file).name;
  // Ubah nama-file-kebab ke camelCase untuk variabel (misal: home-active -> homeActive)
  const varName = name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  
  imports += `import ${varName} from "data-base64:~assets/${file}";\n`;
  iconEntries += `  "${name}": ${varName},\n`;
});

const content = `// FILE INI DIHASILKAN OTOMATIS OLEH scripts/genIcons.js
// JANGAN EDIT MANUAL!

${imports}
export const ICONS = {
${iconEntries}} as const;

export type IconType = keyof typeof ICONS;
`;

fs.writeFileSync(OUTPUT_FILE, content);
console.log(`✅ Berhasil men-generate ${files.length} ikon ke ${OUTPUT_FILE}`);