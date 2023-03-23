module.exports = function(RED) {
    var discordBotManager = require('./lib/discordBotManager.js');
    function discordActivity(config) {
        RED.nodes.createNode(this, config);
        var configNode = RED.nodes.getNode(config.token);
        var node = this;


    discordBotManager.getBot(configNode).then(function (bot) {
      node.on('input', function(msg) {
                bot.user.setActivity(msg.text, { type: 1, url: msg.url, status: "idle"});
        node.status({
        fill: "green",
        shape: "dot",
        text: "Update status zu:"+msg.text+""
      });



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