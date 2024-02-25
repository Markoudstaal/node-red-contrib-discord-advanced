module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');
  const Flatted = require('flatted');

  function discordTyping(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var configNode = RED.nodes.getNode(config.token);

    discordBotManager.getBot(configNode).then(function (bot) {
      
      node.on('input', async function (msg, done) {

        const channel = config.channel || msg.channel || null;

        const setError = (error) => {
          node.status({
            fill: "red",
            shape: "dot",
            text: error
          })
          done(error);
        }

        const setSuccess = (succesMessage) => {
          node.status({
            fill: "green",
            shape: "dot",
            text: succesMessage
          });

          done();
        }

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

        const getChannel = async (id) => {
          const channelID = checkIdOrObject(id);
          if (!channelID) {
            throw (`msg.channel wasn't set correctly`);
          }
          return await bot.channels.fetch(channelID);
        }

        let channelInstance = null;

        try {          
          channelInstance = await getChannel(channel);
        }
        catch( err2 ){
          setError(err2);
        }

        if ( channelInstance != null ){
          await channelInstance.sendTyping();    
          setSuccess("Typing signal sent")

          node.on('close', function () {
            discordBotManager.closeBot(bot);
          });
        }

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

  RED.nodes.registerType("discordTyping", discordTyping);
};
