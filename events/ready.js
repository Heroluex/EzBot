module.exports = {
  name: 'clientReady',
  once: true,
  execute(client) {
    console.log(`Bot ist online als ${client.user.tag}!`);
  },
};