/**
 * build.js — genera dist/index.html con todas las diapositivas incrustadas.
 * Uso: node build.js
 * Resultado: dist/index.html abre directamente en el navegador (sin servidor).
 */

const fs   = require('fs');
const path = require('path');

const ROOT  = __dirname;
const DIST  = path.join(ROOT, 'dist');

// ── Lee loader.js para extraer la lista de slides ──────────────────────────
const loaderSrc = fs.readFileSync(path.join(ROOT, 'js', 'loader.js'), 'utf8');
const urlMatch  = loaderSrc.match(/const slideUrls\s*=\s*\[([\s\S]*?)\];/);
if (!urlMatch) { console.error('No se encontró slideUrls en loader.js'); process.exit(1); }

const slideUrls = [...urlMatch[1].matchAll(/"([^"]+)"/g)].map(m => m[1]);

// ── Lee y concatena todos los slides ──────────────────────────────────────
const slidesHtml = slideUrls.map(url => {
  const filePath = path.join(ROOT, url.replace(/\//g, path.sep));
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠  No encontrado: ${filePath}`);
    return `<!-- MISSING: ${url} -->`;
  }
  return fs.readFileSync(filePath, 'utf8');
}).join('\n\n');

// ── Lee index.html y sustituye el <deck-stage> vacío ──────────────────────
let indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// Elimina la carga dinámica (script loader) — ya no se necesita
indexHtml = indexHtml.replace(/<script[^>]+loader\.js[^>]*><\/script>/g, '');

// Incrusta los slides dentro de <deck-stage>
indexHtml = indexHtml.replace(
  /(<deck-stage[^>]*>)\s*(<\/deck-stage>)/,
  `$1\n${slidesHtml}\n$2`
);

// ── Inlinea styles.css y sus @import (hace el HTML truly standalone) ───────
function inlineCss(cssText, baseDir) {
  return cssText.replace(/@import\s+url\(["']?([^"')]+)["']?\)\s*;/g, (_, ref) => {
    const refPath = path.join(baseDir, ref.replace(/\//g, path.sep));
    if (!fs.existsSync(refPath)) {
      console.warn(`⚠  CSS no encontrado: ${refPath}`);
      return '';
    }
    const inner = fs.readFileSync(refPath, 'utf8');
    return inlineCss(inner, path.dirname(refPath));   // resuelve @import anidados
  });
}

const stylesSrc  = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
const inlinedCss = inlineCss(stylesSrc, ROOT);

// Reemplaza el <link rel="stylesheet" href="styles.css"> por <style>
indexHtml = indexHtml.replace(
  /<link\s+rel="stylesheet"\s+href="styles\.css">/,
  `<style>\n${inlinedCss}\n</style>`
);

// ── Escribe resultado ──────────────────────────────────────────────────────
if (!fs.existsSync(DIST)) fs.mkdirSync(DIST);

// Copia assets (imágenes, js del deck)
['assets', 'deck-stage.js'].forEach(item => {
  const src = path.join(ROOT, item);
  if (!fs.existsSync(src)) return;
  const dst = path.join(DIST, item);
  if (fs.statSync(src).isDirectory()) {
    copyDir(src, dst);
  } else {
    fs.copyFileSync(src, dst);
  }
});

function copyDir(src, dst) {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  fs.readdirSync(src).forEach(f => {
    const s = path.join(src, f), d = path.join(dst, f);
    fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  });
}

fs.writeFileSync(path.join(DIST, 'index.html'), indexHtml, 'utf8');

console.log(`\n✅  Build completado → dist/index.html`);
console.log(`   ${slideUrls.length} diapositivas incrustadas · CSS inline`);
console.log(`   Abre dist/index.html directamente en el navegador.\n`);
