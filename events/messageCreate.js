const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'messageCreate',
  execute(message) {
    if (message.author.bot) return;

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
    const command = commandFiles.find(file => file === `${commandName}.js`);

    if (!command) return;

    try {
      const commandModule = require(`../commands/${command}`);
      commandModule.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply('Es gab einen Fehler beim Ausführen des Commands!');
    }
  },
};