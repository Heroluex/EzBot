const fs = require('fs');
const path = require('path');
let yaml;
try {
  yaml = require('js-yaml');
} catch {
  // If js-yaml is not installed, we can still run, but advise installation
}

const file = path.join(__dirname, '..', 'config.yaml');
let cache = null;

function load() {
  if (!fs.existsSync(file)) return {};
  const raw = fs.readFileSync(file, 'utf8');
  if (yaml) {
    try { cache = yaml.load(raw) || {}; return cache; } catch { return {}; }
  }
  // naive fallback: not YAML parsing, return empty to avoid crash
  return {};
}

function get(pathStr, defVal) {
  const cfg = cache || load();
  return pathStr.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), cfg) ?? defVal;
}

module.exports = { load, get };
