module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');
  const {
    MessageAttachment
  } = require('discord.js');

  function discordSendMessage(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var configNode = RED.nodes.getNode(config.token);
    discordBotManager.getBot(configNode).then(function (bot) {
      node.on('input', function (msg) {
        if (!msg.channel) {
          node.error(`msg.channel wasn't set`);
          node.status({
            fill: "red",
            shape: "dot",
            text: `msg.channel is required`
          })
          return;
        }

        var channel = config.channel || msg.channel;
        if (channel && typeof channel !== 'string') {
          if (channel.hasOwnProperty('id')) {
            channel = channel.id;
          } else {
            node.error(`msg.channel needs to be either a string for the id or channel Object`);
            node.status({
              fill: "red",
              shape: "dot",
              text: `msg.channel is not a string or Object`
            })
            return;
          }
        }

        var msgId = undefined || msg.id;
        if (msgId && typeof msgId !== 'string') {
          if (msgId.hasOwnProperty('id')) {
            msgId = msgID.id;
          } else {
            msgId = undefined;
            node.error(`msg.id needs to be either a string for the id or message Object`);
            node.status({
              fill: "red",
              shape: "dot",
              text: `msg.id is not a string or Object`
            })
            return;
          }
        }

        let attachment = null;
        if (msg.attachment) {
          attachment = new MessageAttachment(msg.attachment);
        }

        bot.channels.fetch(channel).then((channelInstance) => {
          if (msgId) {
            channelInstance.messages.fetch(msgId).then(message => {
              message.edit(msg.payload).then(function () {
                node.status({
                  fill: "green",
                  shape: "dot",
                  text: "message sent"
                });
              }).catch(function (err) {
                node.error("Couldn't edit message:" + err);
                node.status({
                  fill: "red",
                  shape: "dot",
                  text: "Error while editing message"
                });
              });
            }).catch(error => {
              node.error(`Couldn't find the message: ${error}`);
              node.status({
                fill: "red",
                shape: "dot",
                text: "Couldn't find supplied message with supplied message ID"
              });
            });
          } else {
            channelInstance.send(msg.payload, attachment).then(function () {
              node.status({
                fill: "green",
                shape: "dot",
                text: "message sent"
              });
            }).catch(function (err) {
              node.error("Couldn't send to channel:" + err);
              node.status({
                fill: "red",
                shape: "dot",
                text: "Couldn't send message to the channel."
              });
            });
          };
        }).catch(error => {
          node.error(`Couldn't find the supplied channel ID: ${error}`);
          node.status({
            fill: "red",
            shape: "dot",
            text: `Couldn't find channel with the supplied channel ID...`
          });
        });

        node.on('close', function () {
          discordBotManager.closeBot(bot);
        });
      });
    });
  }
  RED.nodes.registerType("discordSendMessage", discordSendMessage);
};
