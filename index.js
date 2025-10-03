require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, Collection, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  // shot.js ist ein Text-Command, kein Slash-Command
  if (file === 'shot.js') continue;
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  }
}


const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    // Nur alle Commands für die eine Guild registrieren
    const guildId = process.env.GUILD_ID;
    if (!guildId) {
      console.warn('GUILD_ID nicht gesetzt. Registrierung übersprungen.');
      return;
    }
    // Erst löschen, dann neu registrieren
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), { body: [] }).catch(() => {});
    const data = await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), { body: commands });
    console.log(`Guild commands registered: ${data.length}`);
  } catch (error) {
    console.error(error);
  }
})();

// Event-Registrierung
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(process.env.DISCORD_TOKEN);
// Presence-Logik auslagern
require('./utils/presence')(client);