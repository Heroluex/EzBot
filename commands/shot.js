const cfg = require('../utils/config');

module.exports = {
  name: 'shot',
  async handleMessage(message) {
    const prefix = cfg.get('bot.prefix', '!');
    if (!message.content.startsWith(prefix + 'shot')) return;
    // User-Mention extrahieren
    const mention = message.mentions.users.first();
    if (!mention) {
      await message.reply('Bitte erwähne einen User! Beispiel: !shot @user');
      return;
    }
    await message.channel.send(`💥 ${mention} wurde abgeschossen!`);
  },
};
