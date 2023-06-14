module.exports = function (RED) {
    var discordBotManager = require('./lib/discordBotManager.js');
    function discordActivity(config) {
        RED.nodes.createNode(this, config);
        var configNode = RED.nodes.getNode(config.token);
        var node = this;

        discordBotManager.getBot(configNode).then(function (bot) {
            node.on('input', function (msg) {
                try {
                    const type = msg.type;
                    const status = msg.status || 'online';
                    const url = msg.url || null;

                    bot.user.setPresence({ activities: [{ name: msg.text, type: type, url: url }], status: status });

                    msg.payload = {
                        status: bot.presence['status'],
                        bot: bot.presence.activities[0]
                    }                    

                    node.status({ fill: "green", shape: "dot", text: "Bot Activities Changed" });
                    node.send(msg);
                } catch (error) {
                    node.error(error);
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: error
                    });
                }
            });

            node.on('close', function () {
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
