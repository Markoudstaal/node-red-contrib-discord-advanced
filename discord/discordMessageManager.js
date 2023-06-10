module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');
  var messagesFormatter = require('./lib/messagesFormatter.js');
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
        const channel = config.channel || msg.channel || null;
        const action = msg.action || 'create';
        const user = msg.user || null;
        const content = msg.payload?.content || checkString(msg.payload) || ' ';
        const messageId = msg.message || null;
        const inputEmbeds = msg.payload?.embeds || msg.payload?.embed || msg.embeds || msg.embed;
        const inputAttachments = msg.payload?.attachments || msg.payload?.attachment || msg.attachments || msg.attachment;
        const inputComponents = msg.payload?.components || msg.components;
        const crosspost = msg.crosspost || false;

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

        const getChannel = async (id) => {
          const channelID = checkIdOrObject(id);
          if (!channelID) {
            throw (`msg.channel wasn't set correctly`);
          }
          return await bot.channels.fetch(channelID);
        }

        const getMessage = async (channel, message) => {
          const channelID = checkIdOrObject(channel);
          const messageID = checkIdOrObject(message);
          if (!channelID) {
            throw (`msg.channel wasn't set correctly`);
          } else if (!messageID) {
            throw (`msg.message wasn't set correctly`)
          }

          let channelInstance = await bot.channels.fetch(channelID);
          return await channelInstance.messages.fetch(messageID);
        }

        const createPrivateMessage = async () => {
          const userID = checkIdOrObject(user);
          if (!userID) {
            setError(`msg.user wasn't set correctly`);
            return;
          }
          try {
            let user = await bot.users.fetch(userID);
            let messageObject = {
              embeds: embeds,
              content: content,
              files: attachments,
              components: components
            };
            let resultMessage = await user.send(messageObject);
            setSuccess(`message sent to ${resultMessage.channel.recipient.username}`, resultMessage);
          } catch (err) {
            setError(err);
          }
        }

        const createChannelMessage = async () => {
          try {
            let channelInstance = await getChannel(channel);
            let messageObject = {
              embeds: embeds,
              content: content,
              files: attachments,
              components: components
            };
            let resultMessage = await channelInstance.send(messageObject);
            let resultCrossPosting = "";

            if(crosspost)
            {              
              if (resultMessage.channel.type === ChannelType.GuildAnnouncement) 
                await resultMessage.crosspost();
              else
                resultCrossPosting = "Not published";
            }

            setSuccess(`message sent, id = ${resultMessage.id} ${resultCrossPosting}`, resultMessage);
          } catch (err) {
            setError(err);
          }
        }

        const createMessage = async () => {
          if (user) {
            await createPrivateMessage();
          } else if (channel) {
            await createChannelMessage();
          } else {
            setError('to send messages either msg.channel or msg.user needs to be set');
          }
        }

        const editMessage = async () => {
          try {
            let message = await getMessage(channel, messageId)
            let messageObject = {
              embeds: embeds,
              content: content,
              files: attachments,
              components: components
            };
            message = await message.edit(messageObject);
            setSuccess(`message ${message.id} edited`, message);
          } catch (err) {
            setError(err);
          }
        }

        const deleteMessage = async () => {
          try {
            let message = await getMessage(channel, messageId);
            let resultMessage = await message.delete();
            setSuccess(`message ${resultMessage.id} deleted`, resultMessage);
          } catch (err) {
            setError(err);
          }
        }

        const replyMessage = async () => {
          try {
            let message = await getMessage(channel, messageId)
            let messageObject = {
              embeds: embeds,
              content: content,
              files: attachments,
              components: components
            };
            message = await message.reply(messageObject);
            setSuccess(`message ${message.id} replied`, message);
          } catch (err) {
            setError(err);
          }
        }

        const reactToMessage = async () => {
          try {
            let message = await getMessage(channel, messageId);
            const emoji = message.guild.emojis.cache.find(emoji => emoji.name === content);
            let reaction = await message.react(emoji || content);
            const newMsg = {
              emoji: reaction._emoji.name,
              animated: reaction.emoji.animated,
              count: reaction.count,
              message: Flatted.parse(Flatted.stringify(message))
            };

            setSuccess(`message ${message.id} reacted`, newMsg);
          } catch (err) {
            setError(err);
          }
        }

        const crosspostMessage = async () => {
          try {
            let message = await getMessage(channel, messageId);  
            if (message.channel.type === ChannelType.GuildAnnouncement)
              await message.crosspost();
            else
              throw "It's not a Announcement channel";

            const newMsg = {
              message: Flatted.parse(Flatted.stringify(message))
            };

            setSuccess(`message ${message.id} crossposted`, newMsg);
          } catch (err) {
            setError(err);
          }
        }

        let attachments, embeds, components;
        try {
          attachments = messagesFormatter.formatAttachments(inputAttachments);
          embeds = messagesFormatter.formatEmbeds(inputEmbeds);
          components = messagesFormatter.formatComponents(inputComponents);
        } catch (error) {
          setError(error);
          return;
        }

        switch (action.toLowerCase()) {
          case 'create':
            await createMessage();
            break;
          case 'edit':
            await editMessage();
            break;
          case 'delete':
            await deleteMessage();
            break;
          case 'reply':
            await replyMessage();
            break;
          case 'react':
            await reactToMessage();
            break;
          case 'crosspost':
            await crosspostMessage();
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
  RED.nodes.registerType("discordMessageManager", discordMessageManager);
};
