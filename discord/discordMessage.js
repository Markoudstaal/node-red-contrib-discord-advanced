const Flatted = require('flatted');
module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');

  function discordMessage(config) {
    RED.nodes.createNode(this, config);
    var configNode = RED.nodes.getNode(config.token);
    var node = this;
    discordBotManager.getBot(configNode).then(function (bot) {
      var callbacks = [];
      node.status({
        fill: "green",
        shape: "dot",
        text: "ready"
      });

      var registerCallback = function (eventName, listener) {
        callbacks.push({
          'eventName': eventName,
          'listener': listener
        });
        bot.on(eventName, listener);
      }
      registerCallback('message', message => {
        if (message.author !== bot.user) {
          var msgid = RED.util.generateId();
          var msg = {
            _msgid: msgid
          }
          msg.payload = message.content;
          msg.channel = Flatted.parse(Flatted.stringify(message.channel));
          msg.author = Flatted.parse(Flatted.stringify(message.author));
          msg.member = Flatted.parse(Flatted.stringify(message.member));
          msg.memberRoleNames = message.member ? message.member.roles.cache.array().map(function (item) {
            return item.name
          }) : null;
          try {
            msg.data = Flatted.parse(Flatted.stringify(message));
          } catch (e) {
            node.warn("Could not set `msg.data`: JSON serialization failed");
          }
          node.send(msg);
        }
      });
      registerCallback('error', error => {
        node.error(error);
        node.status({
          fill: "red",
          shape: "dot",
          text: "error"
        });
      });
      node.on('close', function () {
        callbacks.forEach(function (cb) {
          bot.removeListener(cb.eventName, cb.listener);
        });
        discordBotManager.closeBot(bot);
      });
    }).catch(function (err) {
      node.error(err);
      node.status({
        fill: "red",
        shape: "dot",
        text: "wrong token?"
      });
    });
  }
  RED.nodes.registerType("discordMessage", discordMessage);
};
