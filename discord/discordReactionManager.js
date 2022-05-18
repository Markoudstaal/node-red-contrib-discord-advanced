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

      const getMessage = (message, channel) => {
        var promise = new Promise((resolve, reject) => {
          bot.channels.fetch(channel).then(channelInstance => {
            return channelInstance.messages.fetch(message);
          }).then(message => {
            resolve(message);
          }).catch(error => {
            reject(error);
          })
        })
        return promise;
      }

      node.on('input', function (msg, send, done) {
        const message = checkIdOrObject(msg.message);
        const channel = checkIdOrObject(msg.channel);
        const collectionTime = msg.time || 600000;

        if (message && channel) {
          getMessage(message, channel).then(messageObject => {
            const collector = messageObject.createReactionCollector({
              time: collectionTime,
            });

            node.status({
              fill: "green",
              shape: "dot",
              text: "Collector created"
            });

            reactionCollectors.push(collector);

            collector.on('collect', (reaction, user) => {
              user.fetch(true).then(reactor => {
                const newMsg = {
                  payload: reaction._emoji.name,
                  count: reaction.count,
                  message: reaction.message,
                  user: Flatted.parse(Flatted.stringify(reactor))
                }
                send(newMsg);
                node.status({
                  fill: "green",
                  shape: "dot",
                  text: "Reaction sent"
                });
              }).catch(error => {
                setError(error, done);
              });
            });
          }).catch(function (err) {
            node.error(err);
            node.status({
              fill: "red",
              shape: "dot",
              text: "channel or message missing?"
            });
          });
        } else if (message) {
          setError("msg.channel isn't a string or object", done);
        } else {
          setError("msg.message isn't a string or object", done);
        }
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
