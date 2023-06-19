const Flatted = require('flatted');
module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');

  function discordReactionManager(config) {
    RED.nodes.createNode(this, config);
    var configNode = RED.nodes.getNode(config.token);
    var node = this;

    discordBotManager.getBot(configNode).then(function (bot) {
      node.status({
        fill: "green",
        shape: "dot",
        text: "Ready"
      });

      var reactionCollectors = [];

      const checkIdOrObject = (check) => {
        try {
          if (typeof check !== 'string') {
            if (check.hasOwnProperty('id')) {
              return check.id;
            } else {
              return false;
            }
          } else {
            return check;
          }
        } catch (error) {
          return false;
        }
      }

      const setError = (error, done) => {
        node.status({
          fill: "red",
          shape: "dot",
          text: error
        })
        done(error);
      }

      const getMessage = async (message, channel) => {
        let channelInstance = await bot.channels.fetch(channel);
        return await channelInstance.messages.fetch(message);
      }

      node.on('input', async function (msg, send, done) {
        const message = checkIdOrObject(msg.message);
        const channel = checkIdOrObject(msg.channel);
        const collectionTime = msg.time || 600000;

        if (!channel) {
          setError("msg.channel isn't a string or object", done);
          return;
        }
        if (!message) {
          setError("msg.message isn't a string or object", done);
          return;
        }

        let messageObject;
        try {
          messageObject = await getMessage(message, channel);
        } catch (error) {
          node.error(error);
          node.status({
            fill: "red",
            shape: "dot",
            text: "channel or message missing?"
          });
          return;
        }

        const collector = messageObject.createReactionCollector({
          time: collectionTime,
          dispose: true,
          remove: true,
        });
        
        reactionCollectors.push(collector);
        node.status({
          fill: "green",
          shape: "dot",
          text: "Collector created"
        });

        collector.on('remove', async (reaction, user) => {
          try {
            let messageUser = await bot.users.fetch(reaction.message.author.id);
            let reactor = await user.fetch(true);

            const newMsg = {
              payload: reaction._emoji.name,
              count: reaction.count,
              type: "remove",
              message: Flatted.parse(Flatted.stringify(reaction.message)),
              user: Flatted.parse(Flatted.stringify(reactor)),
              _originalFlowMessage: msg
            }
            newMsg.message.user = Flatted.parse(Flatted.stringify(messageUser));

            send(newMsg);
            node.status({
              fill: "green",
              shape: "dot",
              text: "Reaction remove"
            });
          } catch (error) {
            setError(error, done);
          }
        });


        collector.on('collect', async (reaction, user) => {
          try {
            let messageUser = await bot.users.fetch(reaction.message.author.id);
            let reactor = await user.fetch(true);

            const newMsg = {
              payload: reaction._emoji.name,
              count: reaction.count,
              type: "set",
              message: Flatted.parse(Flatted.stringify(reaction.message)),
              user: Flatted.parse(Flatted.stringify(reactor)),
              _originalFlowMessage: msg
            }
            newMsg.message.user = Flatted.parse(Flatted.stringify(messageUser));

            send(newMsg);
            node.status({
              fill: "green",
              shape: "dot",
              text: "Reaction sent"
            });
          } catch (error) {
            setError(error, done);
          }
        });

      });

      node.on('close', function () {
        reactionCollectors.forEach(function (collector) {
          collector.stop();
        });
        discordBotManager.closeBot(bot);
      });

    }).catch(function (err) {
      node.error(err);
      node.status({
        fill: "red",
        shape: "dot",
        text: err
      });
    });
  }

  RED.nodes.registerType("discordReactionManager", discordReactionManager);
}
