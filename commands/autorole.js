const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const settings = require('../utils/settings');
const config = require('../utils/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Konfiguriere die automatische Rolle für neue Mitglieder')
    .addSubcommand(sc => sc
      .setName('set')
      .setDescription('Setzt die Autorole')
      .addRoleOption(o => o.setName('rolle').setDescription('Die Rolle, die vergeben werden soll').setRequired(true)))
    .addSubcommand(sc => sc
      .setName('clear')
      .setDescription('Entfernt die Autorole-Konfiguration')),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: 'Du benötigst die Berechtigung Rollen verwalten.', flags: 64 });
    }

    const sub = interaction.options.getSubcommand();
    const yamlRole = (config.get('autorole.role_id', '') || '').trim();
    if (yamlRole) {
      return interaction.reply({ content: `In der YAML-Config ist bereits eine Autorole gesetzt (<@&${yamlRole}>). Ändere config.yaml, um sie zu aktualisieren.`, flags: 64 });
    }

    if (sub === 'set') {
      const role = interaction.options.getRole('rolle');
      if (!role) return interaction.reply({ content: 'Ungültige Rolle.', flags: 64 });
      settings.setAutorole(interaction.guild.id, role.id);
      return interaction.reply({ content: `Autorole gesetzt: ${role}`, flags: 64 });
    } else if (sub === 'clear') {
      settings.clearAutorole(interaction.guild.id);
      return interaction.reply({ content: 'Autorole entfernt.', flags: 64 });
    }
  },
};
