module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');

  function discordPermissions(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var configNode = RED.nodes.getNode(config.token);
    discordBotManager.getBot(configNode).then(function (bot) {
      node.on('input', function (msg, send, done) {
        const action = msg.action || 'get';
        const user = msg.user || null;
        const guild = msg.guild || null;
        const role = msg.role || null;

        const setError = (error) => {
          node.status({
            fill: "red",
            shape: "dot",
            text: error
          })
          done(error);
        }

        const setSucces = (succesMessage) => {
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

        const sendRoles = () => {
          const userID = checkIdOrObject(user);
          const guildID = checkIdOrObject(guild);

          if (!userID) {
            setError(`msg.user wasn't set correctly`);
          } else if (!guildID) {
            setError(`msg.guild wasn't set correctly`);
          } else {
            bot.guilds.fetch(guildID).then(guild => {
              return guild.members.fetch(userID);
            }).then(user => {
              var msgid = RED.util.generateId();
              var msg = {
                _msgid: msgid
              }
              msg.roles = user.roles.cache.array();
              send(msg);
              setSucces(`roles sent`);
            }).catch(error => {
              setError(error);
            });
          }
        }

        switch (action.toLowerCase()) {
          case 'get':
            sendRoles();
            break;
          default:
            setError(`msg.action has an incorrect value`)
        }
      });

      node.on('close', function () {
        discordBotManager.closeBot(bot);
      });
    }).catch(err => {
      console.log(err);
    });
  }
  RED.nodes.registerType("discordPermissions", discordPermissions);
}
