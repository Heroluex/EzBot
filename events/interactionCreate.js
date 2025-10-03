const { ModalBuilder } = require('discord.js');
const giveawayModule = require('../commands/giveaway');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        // Handle unknown interaction (old/stale interaction)
        if (error.code === 10062) {
          console.log('Ignoring unknown interaction (likely stale)');
          return;
        }
        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: 64 });
          } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: 64 });
          }
        } catch (err) {
          console.error('Error sending error message:', err);
        }
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId !== 'gw_create_modal') return;
      // Read modal fields
      const prize = interaction.fields.getTextInputValue('prize_input');
      const durationStr = interaction.fields.getTextInputValue('duration_input');
  const winnersStr = interaction.fields.getTextInputValue('winners_input') || String(require('../utils/config').get('giveaway.default_winners', 1));
      const roleInput = interaction.fields.getTextInputValue('role_input') || '';

      const dur = giveawayModule.parseDuration(durationStr);
      if (!dur) {
        return interaction.reply({ content: 'Ungültige Dauer. Beispiel: 30m, 1h30m, 2d', flags: 64 });
      }
      let winners = parseInt(winnersStr, 10);
      if (Number.isNaN(winners) || winners < 1) winners = 1;
      if (winners > 10) winners = 10; // simple upper bound

      // Resolve role input
      let roleId = null;
      const allowRoleReq = require('../utils/config').get('giveaway.allow_role_requirement', true);
      if (allowRoleReq && roleInput) {
        const mention = roleInput.match(/^<@&(\d+)>$/);
        if (mention) {
          roleId = mention[1];
        } else if (/^\d{5,}$/.test(roleInput)) {
          roleId = roleInput;
        } else {
          const found = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === roleInput.toLowerCase());
          if (found) roleId = found.id;
        }
      }

      const endTime = Date.now() + dur;
      const embed = giveawayModule.buildGiveawayEmbed({ prize, endTime, winners, roleId, hostId: interaction.user.id });
      const msg = await interaction.channel.send({ embeds: [embed] });
      try { await msg.react('🎉'); } catch {}

      giveawayModule.giveaways.set(msg.id, {
        channelId: interaction.channel.id,
        guildId: interaction.guild.id,
        prize,
        endTime,
        hostId: interaction.user.id,
        roleId,
        winners,
      });

      setTimeout(() => giveawayModule.endGiveaway(interaction.client, msg.id), dur);
      return interaction.reply({ content: 'Giveaway erstellt! 🎉', flags: 64 });
    }
  },
};
