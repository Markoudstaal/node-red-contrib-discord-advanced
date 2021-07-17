module.exports = function(RED) {
    var discordBotManager = require('./lib/discordBotManager.js');

    function discordClient(config) {
        RED.nodes.createNode(this, config);
        var configNode = RED.nodes.getNode(config.token);
        var node = this;
        discordBotManager.getBot(configNode).then(function(bot){
            node.on('input', function(msg) {
                msg.discord = bot;
                node.send(msg);
            });
            node.on('close', function() {
                discordBotManager.closeBot(bot);
            });            
        });
    }
    RED.nodes.registerType("discordClient", discordClient);
};