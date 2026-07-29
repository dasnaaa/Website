#!/usr/bin/env node
// Builds dist/worker.js: inlines the static site files as JS string constants,
// then appends the routing/blog logic from worker.tpl.js.
// Run: node worker/build.js

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "css/style.css"), "utf8");
const js = fs.readFileSync(path.join(root, "js/main.js"), "utf8");
const svg = fs.readFileSync(path.join(root, "assets/favicon.svg"), "utf8");
const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");

const workerLogic = fs.readFileSync(path.join(__dirname, "worker.tpl.js"), "utf8");

const bundle = `const HTML = ${JSON.stringify(html)};
const CSS = ${JSON.stringify(css)};
const JS = ${JSON.stringify(js)};
const SVG = ${JSON.stringify(svg)};
const ROBOTS = ${JSON.stringify(robots)};
const ASSETS = {
  "/": { type: "text/html; charset=utf-8", body: HTML },
  "/index.html": { type: "text/html; charset=utf-8", body: HTML },
  "/css/style.css": { type: "text/css; charset=utf-8", body: CSS },
  "/js/main.js": { type: "application/javascript; charset=utf-8", body: JS },
  "/assets/favicon.svg": { type: "image/svg+xml", body: SVG },
  "/robots.txt": { type: "text/plain; charset=utf-8", body: ROBOTS },
};

${workerLogic}`;

const distDir = path.join(root, "dist");
fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, "worker.js"), bundle);
console.log(`Built dist/worker.js: ${bundle.length} bytes`);
