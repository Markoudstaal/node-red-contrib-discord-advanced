const Flatted = require('flatted');
module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');

  function discordInteraction(config) {
    RED.nodes.createNode(this, config);
    var configNode = RED.nodes.getNode(config.token);
    var node = this;
    let interactionType = config.interactionType || "all";
    discordBotManager.getBot(configNode).then(function (bot) {
      var callbacks = [];
      node.status({
        fill: "green",
        shape: "dot",
        text: "ready"
      });

      const matchInteractionType = (interaction) => {
        switch (interactionType) {
          case "button": 
            return interaction.isButton(); 
          case "selectMenu":
            return interaction.isSelectMenu(); 
          case "all":
            return true;               
          default:
            return false;
        }
      };

      var registerCallback = function (eventName, listener) {
        callbacks.push({
          'eventName': eventName,
          'listener': listener
        });
        bot.on(eventName, listener);
      }

      registerCallback("interactionCreate", async interaction => {                
        if (!matchInteractionType(interaction)) return;

        await interaction.deferUpdate();
        let message = {};
        message.payload = Flatted.parse(Flatted.stringify(interaction));        
        message.payload.message = Flatted.parse(Flatted.stringify(interaction.message));        
        message.payload.message.author = Flatted.parse(Flatted.stringify(interaction.message.author));        
        message.payload.user = Flatted.parse(Flatted.stringify(interaction.user));        
        message.payload.member = Flatted.parse(Flatted.stringify(interaction.member));        
        message.payload.member.guild = Flatted.parse(Flatted.stringify(interaction.member.guild));        
        node.send(message);
      })    

      registerCallback('error', error => {
        node.error(error);
        node.status({
          fill: "red",
          shape: "dot",
          text: error
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
  RED.nodes.registerType("discordInteraction", discordInteraction);
};
