module.exports = function(RED) {
    var discordBotManager = require('./lib/discordBotManager.js');
    function discordActivity(config) {
        RED.nodes.createNode(this, config);
        var configNode = RED.nodes.getNode(config.token);
        var node = this;


    discordBotManager.getBot(configNode).then(function (bot) {
      node.on('input', function(msg) {

        const type= msg.type;
        const status = msg.status || 'Online';
        const user = msg.user || null;
        const url = msg.url || null;
        msg.payload.status= bot.presence['status'];
        msg.payload.bot= bot.presence.activities[0];

        bot.user.setPresence({ activities: [{ name: msg.text,type: type,url:url}], status: status });
        node.status({fill: "green",shape: "dot",text: "Bot Activities Change"});
        node.send(msg.payload);
            });

       node.on('close', function() {
                discordBotManager.closeBot(bot);
            }); 
  }).catch(err => {
            console.log(err);
            node.status({
                fill: "red",
                shape: "dot",
                text: err
            });
        });
    }
    RED.nodes.registerType("discordActivity", discordActivity);
};
