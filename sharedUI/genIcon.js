const fs = require('fs');
const path = require('path');

// Konfigurasi folder
const ASSETS_DIR = path.join(__dirname, '../sharedUI/src/assets'); 
const OUTPUT_FILE = path.join(__dirname, '../sharedUI/src/lib/constants/icon2.ts');

// Pastikan folder output ada
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(ASSETS_DIR).filter(file => file.endsWith('.svg'));

let iconEntries = "";

files.forEach((file) => {
  const name = path.parse(file).name;
  
  // 1. Baca isi file SVG
  const filePath = path.join(ASSETS_DIR, file);
  const svgData = fs.readFileSync(filePath);
  
  // 2. Konversi ke Base64
  const base64Data = svgData.toString('base64');
  
  // 3. Gabungkan menjadi Data URI
  const dataUri = `data:image/svg+xml;base64,${base64Data}`;
  
  // 4. Masukkan ke dalam entry object
  iconEntries += `  "${name}": "${dataUri}",\n`;
});

const content = `/**
 * FILE INI DIHASILKAN OTOMATIS OLEH scripts/genIcons.js
 * JANGAN EDIT MANUAL!
 * * Ikon disimpan dalam format Base64 sehingga bisa digunakan 
 * di lingkungan apapun tanpa perlu loader khusus.
 */

export const ICONS = {
${iconEntries}} as const;

export type IconType = keyof typeof ICONS;
`;

fs.writeFileSync(OUTPUT_FILE, content);
console.log(`✅ Berhasil! ${files.length} ikon telah di-convert ke Base64 di ${OUTPUT_FILE}`);