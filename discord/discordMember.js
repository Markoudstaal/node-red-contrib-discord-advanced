const Flatted = require('flatted');
module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');

  function discordMember(config) {
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
      };

     

registerCallback('guildMemberAdd', message => {
        var msgid = RED.util.generateId();
          var msg = {
            _msgid: msgid
          }
          msg.payload = Flatted.parse(Flatted.stringify(message));
          msg.payload.event = "guildMemberAdd";




        node.send(msg);
      });

registerCallback('guildMemberRemove', message => {
       var msgid = RED.util.generateId();
          var msg = {
            _msgid: msgid
          }
          msg.payload = Flatted.parse(Flatted.stringify(message));
          msg.payload.event = "guildMemberRemove";

        node.send(msg);
      });



 });
};
  RED.nodes.registerType("discordMember", discordMember);
};
