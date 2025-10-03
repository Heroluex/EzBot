const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong!'),
  async execute(interaction) {
    const sent = await interaction.reply({ content: 'Pong! 🏓', fetchReply: true });
  const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
  await interaction.editReply(`Pong! 🏓\nBot-Latenz: ${botLatency} ms`);
  },
};