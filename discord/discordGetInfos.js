module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');
  const Flatted = require('flatted');
  const {
    AttachmentBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChannelType
  } = require('discord.js');

  const checkString = (field) => typeof field === 'string' ? field : false;

  function discordGetInfos(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var configNode = RED.nodes.getNode(config.token);

    discordBotManager.getBot(configNode).then(function (bot) {
      node.on('input', async function (msg, send, done) {
        const channel =  msg.channel || config.channel || null;
        const action = msg.action || config.action ||'guildinfo';
        const user = msg.user || config.uid ||null;
        const messageId = msg.message ||config.messageId || null;
        const guildId= msg.guildId||config.guildId || null;
        const roleId= msg.roleId|| config.roleId || null;


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

        const channelinfos = async () => {
          try {
            let channelInstance = await bot.channels.cache.get(channel);

            setSuccess(`Get Channel Information, id = channel`, channelInstance);
          } catch (err) {
            setError("msg.channel not set");
          }
        }


        const channellist = async () => {
          try {
            let channelInstance = await bot.guilds.cache.get(guildId);
            let channels=await channelInstance.channels.fetch();
            setSuccess(`Get all Channel, id = ${guildId}`, channels);
          } catch (err) {
            setError("msg.guildId not set");
          }
        }

       const guildinfo= async () => {
          try {
            let channelInstance = await bot.guilds.cache.get(guildId);
            setSuccess(`Guild Info, id = ${guildId}`, channelInstance);
          } catch (err) {
            setError("msg.guildId not set");
          }
        }
       const rolelist= async () => {
          try {
            let channelInstance = await bot.guilds.cache.get(guildId);
            let channels=await channelInstance.roles.fetch();
            setSuccess(`List All Roles, id = ${guildId}`, channels);
          } catch (err) {
            setError("msg.guildId not set");
          }
        }

    const rolebyid= async () => {
          try {
            let channelInstance = await bot.guilds.cache.get(guildId);
            let channels=await channelInstance.roles.cache.get(roleId);
            setSuccess(`Roles Info, id = ${roleId}`, channels);
          } catch (err) {
            setError("msg.guildId or msg.roleId not set");
          }
        }

    const memberlist= async () => {
          try {
            let channelInstance = await bot.guilds.cache.get(guildId);
            let channels=await channelInstance.members.fetch();
            setSuccess(`Get All Members, id = ${guildId}`, channels);
          } catch (err) {
            setError("msg.guildId not set");
          }
        }



    const memberbyid= async () => {
          try {
            let channels=await bot.users.fetch(user);
            setSuccess(`Members By Id, id = ${user}`, channels);
          } catch (err) {
            setError("msg.user not set");
          }
        }

    const memberbyrole= async () => {
          try {
            let interaction=await bot.guilds.cache.get(guildId);
            let test= await interaction.members.fetch();
            let role = await interaction.roles.cache.find(role => role.id ===roleId);
            let totalAdmin = await role.members.map(m => m);

            setSuccess(`Members list by Role, id = ${roleId}`, totalAdmin);
          } catch (err) {
            setError("msg.guildId or msg.roleId not set");
          }
        }


    const messageinfo= async () => {
          try {
       let channelInstance = await bot.channels.fetch(channel);
	let message = await channelInstance.messages.fetch(messageId);
            setSuccess(`Message info, id = ${messageId}`, message);
          } catch (err) {
            setError("msg.channel or msg.message not set");
          }
        }


        switch (action.toLowerCase()) {
          case 'channelinfos':
            await channelinfos();
            break;
          case 'channellist':
            await channellist();
            break;
          case 'rolelist':
            await rolelist();
            break;
         case 'rolebyid':
            await rolebyid();
            break;
          case 'memberlist':
            await memberlist();
            break;
          case 'memberbyid':
            await memberbyid();
            break;
          case 'memberbyrole':
            await memberbyrole();
            break;
          case 'messageinfo':
            await messageinfo();
            break;
          case 'guildinfo':
            await guildinfo();
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
  RED.nodes.registerType("discordGetInfos", discordGetInfos);
};
