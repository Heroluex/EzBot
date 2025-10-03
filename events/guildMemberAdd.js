const settings = require('../utils/settings');
const config = require('../utils/config');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    try {
  const yamlRole = config.get('autorole.role_id', '').trim();
  const roleId = yamlRole || settings.getAutorole(member.guild.id);
      if (!roleId) return;
      const role = member.guild.roles.cache.get(roleId) || await member.guild.roles.fetch(roleId).catch(() => null);
      if (!role) return;
      await member.roles.add(roleId).catch(() => null);
    } catch (e) {
      console.error('Autorole error:', e);
    }
  }
};
