module.exports = function (RED) {
  var discordBotManager = require('node-red-contrib-discord-advanced/discord/lib/discordBotManager.js');
  var messagesFormatter = require('node-red-contrib-discord-advanced/discord/lib/messagesFormatter.js');
  const Flatted = require('flatted');
  const {
    ChannelType
  } = require('discord.js');

  const checkString = (field) => typeof field === 'string' ? field : false;

  function discordMessageManager(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var configNode = RED.nodes.getNode(config.token);

    discordBotManager.getBot(configNode).then(function (bot) {
      node.on('input', async function (msg, send, done) {
        const _guild = config.guild || msg.guild || null;
        const _action = msg.action || 'info';

        const _name = msg.name || null;
      

        const setError = (error) => {
          node.status({
            fill: "red",
            shape: "dot",
            text: error
          })
          done(error);
        }

        const setSuccess = (succesMessage, data) => {
          node.status({
            fill: "green",
            shape: "dot",
            text: succesMessage
          });

          msg.payload = Flatted.parse(Flatted.stringify(data));
          send(msg);
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

        const getGuild = async (id) => {
          const guildId = checkIdOrObject(id);
          if (!guildId) {
            throw (`msg.guild wasn't set correctly`);
          }
          return await bot.guilds.fetch(guildId);
        }


        const infoGuild = async () => {
          try {
            let guild = await getGuild(_guild)
            setSuccess(`guild ${_guild} info obtained`, guild);
          } catch (err) {
            setError(err);
          }
        }

        const setGuildName = async () => {

          let guild = await getGuild(_guild)
          let name = checkIdOrObject(_name)

          if (!name) {
            setError(`msg.name wasn't set correctly`);
            return;
          }

          try {

            guild.setName(name).then(updated => setSuccess(`Updated guild name to ${updated.name}`,updated) )

          } catch (err) {
            setError(err);
          }
        }

    
        switch (_action.toLowerCase()) {
          case 'info':
            await infoGuild();
            break;
          case 'name':
              await setGuildName();
              break; 
          default:
            setError(`msg.action has an incorrect value`)
        }

        node.on('close', function () {
          discordBotManager.closeBot(bot);
        });
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
  RED.nodes.registerType("discordGuildManager", discordMessageManager);
};
