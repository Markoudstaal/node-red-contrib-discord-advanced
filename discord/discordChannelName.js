module.exports = function(RED) {
    var discordBotManager = require('./lib/discordBotManager.js');
    function discordChannelName(config) {
        RED.nodes.createNode(this, config);
        var configNode = RED.nodes.getNode(config.token);
        var node = this;

   discordBotManager.getBot(configNode).then(function (bot) {
      node.on('input', function(msg) {
    const channel = config.channel || msg.channel || null;
    bot.channels.cache.get(channel).setName(msg.name);
      });

    node.on('close', function() {
                discordBotManager.closeBot(bot);
            }); 

});
};
  RED.nodes.registerType("discordChannelName", discordChannelName);
};
