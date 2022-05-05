const Flatted = require('flatted');
module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');

  function discordInteraction(config) {
    RED.nodes.createNode(this, config);
    var configNode = RED.nodes.getNode(config.token);
    var node = this;
    let interactionType = config.interactionType || "all";
    let custom_id = config.custom_id;
    let commandResponse = config.commandResponse || "OK!";
    let injectInteractionObject = config.interactionObject || false;

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
          case "command":
            return interaction.isCommand();
          case "messageContextMenu":
            return interaction.isMessageContextMenu();
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
        try {
          if (!matchInteractionType(interaction)) return;

          if (interaction.isCommand() || interaction.isMessageContextMenu()) {
            if (custom_id && custom_id.split(",").indexOf(interaction.commandName) < 0) return;
            await interaction.reply(commandResponse);
          }
          else {
            if (custom_id && custom_id.split(",").indexOf(interaction.customId) < 0) return;
            await interaction.deferUpdate();
          }

          let message = {};
          message.payload = Flatted.parse(Flatted.stringify(interaction));
          message.payload.user = Flatted.parse(Flatted.stringify(interaction.user));
          message.payload.member = Flatted.parse(Flatted.stringify(interaction.member));
          message.payload.member.guild = Flatted.parse(Flatted.stringify(interaction.member.guild));

          if (injectInteractionObject)
            message.interactionObject = interaction;

          if (interaction.isCommand() || interaction.isMessageContextMenu()) {
            message.payload.options = Flatted.parse(Flatted.stringify(interaction.options));
            message.payload.replyMessage = Flatted.parse(Flatted.stringify(await interaction.fetchReply()));
          }
          else {
            message.payload.message = Flatted.parse(Flatted.stringify(interaction.message));
            message.payload.message.author = Flatted.parse(Flatted.stringify(interaction.message.author));
          }

          node.send(message);
        } catch (error) {
          node.error(error);
          node.status({
            fill: "red",
            shape: "dot",
            text: error
          });
        }
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
