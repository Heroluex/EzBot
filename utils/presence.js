const cfg = require('./config');

const typeMap = {
  play: 0, playing: 0,
  watch: 3, watching: 3,
  listen: 2, listening: 2,
  stream: 1, streaming: 1,
  compete: 5, competing: 5
};

module.exports = function startPresence(client) {
  client.once('ready', () => {
    const rawActivities = cfg.get('bot.activities', []);
    const intervalSec = cfg.get('bot.activity_interval', 30);
    let activities = Array.isArray(rawActivities) ? rawActivities : [];
    if (activities.length === 0) activities = [{ text: 'Online', type: 'play' }];
    let i = 0;
    function setNextActivity() {
      const act = activities[i % activities.length];
      const type = typeMap[(act.type || 'play').toLowerCase()] ?? 0;
      client.user.setPresence({
        activities: [{ name: act.text, type }],
        status: 'online',
      });
      console.log(`Presence gesetzt: ${act.text} (Typ: ${act.type})`);
      i++;
    }
    setNextActivity();
    setInterval(setNextActivity, intervalSec * 1000);
  });
}
