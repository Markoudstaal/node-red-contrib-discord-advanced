module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');

  function discordPermissions(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var configNode = RED.nodes.getNode(config.token);
    discordBotManager.getBot(configNode).then(function (bot) {
      node.on('input', async function (msg, send, done) {
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

        const sendRoles = async () => {
          const userID = checkIdOrObject(user);
          const guildID = checkIdOrObject(guild);

          if (!userID) {
            setError(`msg.user wasn't set correctly`);
          } else if (!guildID) {
            setError(`msg.guild wasn't set correctly`);
          } else {

            try {
              const guildObject = await bot.guilds.fetch(guildID);
              const userObject = await guildObject.members.fetch(userID);

              let roles = [];
              userObject.roles.cache.each(role => {
                roles.push(role);
              });
              msg.payload = roles;
              msg.user = userObject;
              send(msg);
              setSuccess(`roles sent`);
            } catch (error) {
              setError(error);
            }
          }
        }

        const setRole = async () => {
          const userID = checkIdOrObject(user);
          const guildID = checkIdOrObject(guild);
          const roleID = checkIdOrObject(role);

          if (!userID) {
            setError(`msg.user wasn't set correctly`);
          } else if (!guildID) {
            setError(`msg.guild wasn't set correctly`);
          } else if (!roleID) {
            setError(`msg.role wasn't set correctly`);
          } else {
            try {
              const guildObject = await bot.guilds.fetch(guildID);
              const userObject = await guildObject.members.fetch(userID);

              await userObject.roles.add(roleID);
              msg.payload = "role set";
              send(msg);
              setSuccess(`role set`);
            } catch (error) {
              console.log(error);
              setError(error);
            }
          }
        }

        const removeRole = async () => {
          const userID = checkIdOrObject(user);
          const guildID = checkIdOrObject(guild);
          const roleID = checkIdOrObject(role);

          if (!userID) {
            setError(`msg.user wasn't set correctly`);
          } else if (!guildID) {
            setError(`msg.guild wasn't set correctly`);
          } else if (!roleID) {
            setError(`msg.role wasn't set correctly`);
          } else {
            try {
              const guildObject = await bot.guilds.fetch(guildID);
              const userObject = await guildObject.members.fetch(userID);

              await userObject.roles.remove(roleID);
              msg.payload = "role removed";
              send(msg);
              setSuccess(`role removed`);
            } catch (error) {
              setError(error);
            }
          }
        }

        switch (action.toLowerCase()) {
          case 'get':
            await sendRoles();
            break;
          case 'set':
            await setRole();
            break;
          case 'remove':
            await removeRole();
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
      node.status({
        fill: "red",
        shape: "dot",
        text: err
      });
    });
  }
  RED.nodes.registerType("discordPermissions", discordPermissions);
}
