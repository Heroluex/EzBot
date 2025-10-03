const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'storage', 'settings.json');

function read() {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { autorole: {} };
  }
}

function write(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function getAutorole(guildId) {
  const s = read();
  return s.autorole[guildId] || null;
}

function setAutorole(guildId, roleId) {
  const s = read();
  s.autorole[guildId] = roleId;
  write(s);
}

function clearAutorole(guildId) {
  const s = read();
  delete s.autorole[guildId];
  write(s);
}

module.exports = { read, write, getAutorole, setAutorole, clearAutorole };
