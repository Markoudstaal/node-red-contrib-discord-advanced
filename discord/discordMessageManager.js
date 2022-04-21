module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');
  const Flatted = require('flatted');
  const {
    MessageAttachment,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
    MessageComponent
  } = require('discord.js');

  function discordMessageManager(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var configNode = RED.nodes.getNode(config.token);
    discordBotManager.getBot(configNode).then(function (bot) {
      node.on('input', function (msg, send, done) {
        const action = msg.action || 'create';
        const payload = msg.payload || ' ';
        const channel = config.channel || msg.channel || null;
        const user = msg.user || null;
        const message = msg.message || null;
        const inputEmbeds = msg.embeds || msg.embed;
        const timeDelay = msg.timedelay || 0;
        const inputAttachments = msg.attachments || msg.attachment;        
        const inputComponents = msg.components;        

        const setError = (error) => {
          node.status({
            fill: "red",
            shape: "dot",
            text: error
          })
          done(error);
        }

        const setSucces = (succesMessage, data) => {
          node.status({
            fill: "green",
            shape: "dot",
            text: succesMessage
          });
          const newMsg = {
            payload: Flatted.parse(Flatted.stringify(data)),
            request: msg,
          };
          send(newMsg);
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

        const getChannel = (id) => {
          var promise = new Promise((resolve, reject) => {
            bot.channels.fetch(id).then((channelInstance) => {
              resolve(channelInstance);
            }).catch(err => {
              reject(err);
            });
          });
          return promise;
        }

        const getMessage = (channel, message) => {
          var promise = new Promise((resolve, reject) => {
            const channelID = checkIdOrObject(channel);
            const messageID = checkIdOrObject(message);
            if (!channelID) {
              reject(`msg.channel wasn't set correctly`);
            } else if (!messageID) {
              reject(`msg.message wasn't set correctly`)
            } else {
              getChannel(channelID).then(channelInstance => {
                return channelInstance.messages.fetch(messageID);
              }).then(message => {
                resolve(message);
              }).catch(err => {
                reject(err);
              })
            }
          });
          return promise;
        }

        const createPrivateMessage = () => {
          const userID = checkIdOrObject(user);
          if (!userID) {
            setError(`msg.user wasn't set correctly`);
          } else {
            bot.users.fetch(userID).then(user => {
              let messageObject = {};
              messageObject.embeds = embeds;
              messageObject.content = payload;
              messageObject.files = attachments;
              messageObject.components = components;
              return user.send(messageObject);
            }).then(message => {
              setSucces(`message sent to ${message.channel.recipient.username}`, message)
            }).catch(err => {
              setError(err);
            })
          }
        }

        const createChannelMessage = () => {
          const channelID = checkIdOrObject(channel);
          if (!channelID) {
            setError(`msg.channel wasn't set correctly`);
          } else {
            getChannel(channelID).then(channelInstance => {
              let messageObject = {};
              messageObject.embeds = embeds;
              messageObject.content = payload;
              messageObject.files = attachments;              
              messageObject.components = components;
              return channelInstance.send(messageObject);
            }).then((message) => {
              setSucces(`message sent, id = ${message.id}`, message);
            }).catch(err => {
              setError(err);
            });
          }
        }

        const createMessage = () => {
          if (user) {
            createPrivateMessage();
          } else if (channel) {
            createChannelMessage();
          } else {
            setError('to send messages either msg.channel or msg.user needs to be set');
          }
        }

        const editMessage = () => {
          getMessage(channel, message)
            .then(message => {
              let messageObject = {};
              messageObject.embeds = embeds;
              messageObject.content = payload;
              messageObject.files = attachments;
              messageObject.components = components;
              return message.edit(messageObject);
            })
            .then(message => {
              setSucces(`message ${message.id} edited`, message);
            })
            .catch(err => {
              setError(err);
            })
        }

        const deleteMessage = () => {
          getMessage(channel, message)
            .then(message => {
              return message.delete({
                timeout: timeDelay
              });
            })
            .then(message => {
              setSucces(`message ${message.id} deleted`, message);
            })
            .catch(err => {
              setError(err);
            })
        }

        var attachments = [];
        if (inputAttachments) {
          if (typeof inputAttachments === 'string') {
            attachments.push(new MessageAttachment(inputAttachments));
          } else if (Array.isArray(inputAttachments)) {
            inputAttachments.forEach(attachment => {
              attachments.push(new MessageAttachment(attachment));
            });
          } else {
            setError("msg.attachments isn't a string or array")
          }
        }

        var embeds = [];
        if (inputEmbeds) {
          if (typeof inputEmbeds === 'object') {
            embeds.push(new MessageEmbed(inputEmbeds));
          } else if (Array.isArray(inputEmbeds)) {
            inputEmbeds.forEach(embed => {
              embeds.push(new MessageEmbed(embed));
            });
          } else {
            setError("msg.embeds isn't a string or array")
          }
        }

        var components = [];
        if (inputComponents) {
          inputComponents.forEach(component => {
            if(component.type == 1)
            {
              var actionRow = new MessageActionRow();
              component.components.forEach(subComponentData => {
                switch (subComponentData.type) {
                  case 2:
                    actionRow.addComponents(new MessageButton(subComponentData));
                    break;
                  case 3:
                    actionRow.addComponents(new MessageSelectMenu(subComponentData));                    
                    break;
                }
              });
              components.push(actionRow);
            }                       
          });        
        }

        switch (action.toLowerCase()) {
          case 'create':
            createMessage();
            break;
          case 'edit':
            editMessage();
            break;
          case 'delete':
            deleteMessage();
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
    });
  }
  RED.nodes.registerType("discordMessageManager", discordMessageManager);
};
