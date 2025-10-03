const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../utils/config');

// messageId -> { channelId, guildId, prize, endTime, hostId, roleId, winners }
const giveaways = new Map();

// Parse durations like "1h", "30m", "1h30m", "2d4h"
function parseDuration(input) {
  if (!input) return null;
  const s = String(input).toLowerCase().replace(/\s+/g, '');
  const regex = /(\d+)\s*([smhd])/g;
  let ms = 0;
  let match;
  while ((match = regex.exec(s))) {
    const val = parseInt(match[1], 10);
    const unit = match[2];
    if (Number.isNaN(val)) return null;
    switch (unit) {
      case 's': ms += val * 1000; break;
      case 'm': ms += val * 60 * 1000; break;
      case 'h': ms += val * 60 * 60 * 1000; break;
      case 'd': ms += val * 24 * 60 * 60 * 1000; break;
      default: return null;
    }
  }
  return ms > 0 ? ms : null;
}

async function endGiveaway(client, messageId) {
  const gw = giveaways.get(messageId);
  if (!gw) return;
  try {
    const channel = await client.channels.fetch(gw.channelId);
    const message = await channel.messages.fetch(messageId);
    const reaction = message.reactions.resolve('🎉') || message.reactions.cache.get('🎉');
    let users = [];
    if (reaction) {
      const fetched = await reaction.users.fetch();
      users = fetched.filter(u => !u.bot).map(u => u.id);
    }
    // Role filter
    if (gw.roleId) {
      const guild = await client.guilds.fetch(gw.guildId);
      const roleId = gw.roleId;
      const filtered = [];
      for (const uid of users) {
        try {
          const member = await guild.members.fetch(uid);
          if (member.roles.cache.has(roleId)) filtered.push(uid);
        } catch {}
      }
      users = filtered;
    }
    if (users.length === 0) {
      await channel.send({ content: `Kein Gewinner für **${gw.prize}** – keine gültigen Teilnehmer.` });
    } else {
      const winnersCount = Math.min(gw.winners || 1, users.length);
      const shuffled = users.sort(() => Math.random() - 0.5);
      const winnerIds = shuffled.slice(0, winnersCount);
      const mentions = winnerIds.map(id => `<@${id}>`).join(', ');
      await channel.send({ content: `🎉 Glückwunsch ${mentions}! Du hast **${gw.prize}** gewonnen!` });
    }
  } catch (err) {
    console.error('Fehler beim Beenden des Giveaways:', err);
  } finally {
    giveaways.delete(messageId);
  }
}

function buildCreateModal() {
  const modal = new ModalBuilder().setCustomId('gw_create_modal').setTitle('Giveaway erstellen');
  const prize = new TextInputBuilder().setCustomId('prize_input').setLabel('Preis').setStyle(TextInputStyle.Short).setRequired(true);
  const duration = new TextInputBuilder().setCustomId('duration_input').setLabel('Dauer (z.B. 1h30m)').setStyle(TextInputStyle.Short).setRequired(true);
  const defWinners = String(config.get('giveaway.default_winners', 1));
  const winners = new TextInputBuilder().setCustomId('winners_input').setLabel('Anzahl Gewinner (optional)').setStyle(TextInputStyle.Short).setRequired(false).setValue(defWinners);
  const role = new TextInputBuilder().setCustomId('role_input').setLabel('Rolle (optional: @Rolle oder ID)').setStyle(TextInputStyle.Short).setRequired(false);
  modal.addComponents(
    new ActionRowBuilder().addComponents(prize),
    new ActionRowBuilder().addComponents(duration),
    new ActionRowBuilder().addComponents(winners),
    new ActionRowBuilder().addComponents(role),
  );
  return modal;
}

function buildGiveawayEmbed({ prize, endTime, winners, roleId, hostId }) {
  const lines = [
    `• Preis: ${prize}`,
    `• Gewinner: ${winners}`,
    `• Ende: <t:${Math.floor(endTime / 1000)}:R>`,
  ];
  if (roleId) lines.push(`• Bedingung: Rolle <@&${roleId}>`);
  lines.push('', 'Teilnahme: Reagiere mit 🎉');
  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('🎉 Giveaway!')
    .setDescription(lines.join('\n'))
    .setFooter({ text: `Gastgeber: ${hostId ? `@${hostId}` : ''}` });
}

module.exports = {
  data: new SlashCommandBuilder().setName('giveaway').setDescription('Erstellt ein neues Giveaway'),
  async execute(interaction) {
    const modal = buildCreateModal();
    await interaction.showModal(modal);
  },
  parseDuration,
  endGiveaway,
  giveaways,
  buildCreateModal,
  buildGiveawayEmbed,
};
