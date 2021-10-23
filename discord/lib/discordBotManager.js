const {
  Client,
  Intents,
} = require('discord.js');
var bots = new Map();
var getBot = function (configNode) {
  var promise = new Promise(function (resolve, reject) {
    var bot = undefined;
    if (bots.get(configNode) === undefined) {
      bot = new Client({
        intents: [
          Intents.FLAGS.GUILDS,
          Intents.FLAGS.GUILD_MESSAGES,
          Intents.FLAGS.DIRECT_MESSAGES
        ],
        partials: [
          "CHANNEL",
          "USER",
          "MESSAGE"
        ]
      });
      bots.set(configNode, bot);
      bot.numReferences = (bot.numReferences || 0) + 1;
      bot.login(configNode.token).then(function () {
        resolve(bot);
      }).catch(function (err) {
        reject(err);
      });
    } else {
      bot = bots.get(configNode);
      bot.numReferences = (bot.numReferences || 0) + 1;
      resolve(bot);
    }
  });
  return promise;
};
var closeBot = function (bot) {
  bot.numReferences -= 1;
  setTimeout(function () {
    if (bot.numReferences === 0) {
      try {
        bot.destroy(); // if a bot is not connected, destroy() won't work, so let's just wrap it in a try-catch..
      } catch (e) {}
      for (var i of bots.entries()) {
        if (i[1] === bot) {
          bots.delete(i[0]);
        }
      }
    }
  }, 1000);
};
module.exports = {
  getBot: getBot,
  closeBot: closeBot
}
