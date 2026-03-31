#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "src", "heysupport.js");
const distDir = path.join(__dirname, "dist");
const dist = path.join(distDir, "heysupport.js");
const distMin = path.join(distDir, "heysupport.min.js");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy source to dist (no build tools needed — it's vanilla JS)
const source = fs.readFileSync(src, "utf8");

// Add banner
const banner = `/*! HeySupport Chat Widget v1.0.0 | MIT License | https://github.com/heysmmprovider/heysupport */\n`;

fs.writeFileSync(dist, banner + source);
console.log("Built: dist/heysupport.js (" + Math.round(source.length / 1024) + " KB)");

// Simple minification: strip comments and collapse whitespace
let minified = source
  // Remove single-line comments (but not URLs)
  .replace(/(?<![:"'])\/\/.*$/gm, "")
  // Remove multi-line comments
  .replace(/\/\*[\s\S]*?\*\//g, "")
  // Collapse whitespace
  .replace(/\n\s*\n/g, "\n")
  .replace(/  +/g, " ")
  .trim();

fs.writeFileSync(distMin, banner + minified);
console.log(
  "Built: dist/heysupport.min.js (" +
    Math.round(minified.length / 1024) +
    " KB)"
);
