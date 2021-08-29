module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');
  const Flatted = require('flatted');
  const {
    MessageAttachment,
    MessageEmbed
  } = require('discord.js');

  function discordMessageManager(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var configNode = RED.nodes.getNode(config.token);
    discordBotManager.getBot(configNode).then(function (bot) {
      node.on('input', function (msg, send, done) {
        const action = msg.action || 'create';
        const payload = msg.payload || '';
        const channel = config.channel || msg.channel || null;
        const user = msg.user || null;
        const message = msg.message || null;
        const embed = msg.embed || false;
        const timeDelay = msg.timedelay || 0;

        let attachment = null;
        if (msg.attachment) {
          attachment = new MessageAttachment(msg.attachment);
        }

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
              if (embed) {
                messageObject.embed = payload;
              } else {
                messageObject.content = payload;
              }
              if (attachment) {
                messageObject.files = [attachment];
              }
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
              if (embed) {
                messageObject.embed = payload;
              } else {
                messageObject.content = payload;
              }
              if (attachment) {
                messageObject.files = [attachment];
              }
              return channelInstance.send(messageObject);
            }).then((message) => {
              setSucces(`message sent, id = ${message.id}`, message);
            }).catch(err => {
              setError(err);
            });
          }
        }

        const createMessage = () => {
          if (embed && (typeof payload !== 'object' || payload === null)) {
            setError(`no (correct) embed object was supplied`)
            return null;
          }
          if (user) {
            createPrivateMessage();
          } else if (channel) {
            createChannelMessage();
          } else {
            setError('to send messages either msg.channel or msg.user needs to be set');
          }
        }

        const editMessage = () => {
          if (embed && (typeof payload !== 'object' || payload === null)) {
            setError(`no (correct) embed object was supplied`)
            return null;
          }
          getMessage(channel, message)
            .then(message => {
              return embed ? message.edit(new MessageEmbed(payload)) : message.edit(payload);
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
