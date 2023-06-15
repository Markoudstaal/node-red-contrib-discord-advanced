module.exports = function (RED) {
    var discordBotManager = require('./lib/discordBotManager.js');
    function discordActivity(config) {
        RED.nodes.createNode(this, config);
        var configNode = RED.nodes.getNode(config.token);
        var node = this;

        discordBotManager.getBot(configNode).then(function (bot) {
            node.on('input', function (msg) {
                try {
                    const types = msg.type || Number(config.atype)|| null;
                    const status = msg.status ||config.astatus || 'online';
                    const url = msg.url ||config.aurl || null;
                    const statustext= msg.text || config.atext || null;

                    bot.user.setPresence({ activities: [{ name: statustext, type: types, url: url }], status: status });

                    msg.payload = {
                        status: bot.presence['status'],
                        bot: bot.presence.activities[0],
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
