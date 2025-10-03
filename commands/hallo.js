const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hallo')
    .setDescription('Grüßt zurück'),
  async execute(interaction) {
    await interaction.reply('Yo, was geht? Ich bin EzBot, dein cooler Begleiter! 🚀');
  },
};