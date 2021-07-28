module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');
  const {
    MessageAttachment
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

        const setSucces = (succesMessage) => {
          node.status({
            fill: "green",
            shape: "dot",
            text: succesMessage
          });
          done();
        }

        const checkIdOrObject = (check) => {
          if (typeof check !== 'string') {
            if (check.hasOwnProperty('id')) {
              return check.id;
            } else {
              return false;
            }
          } else {
            return check;
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
              return user.send(payload, attachment);
            }).then(message => {
              setSucces(`message sent to ${message.channel.recipient.username}`)
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
              return channelInstance.send(payload, attachment);
            }).then((message) => {
              setSucces(`message sent, id = ${message.id}`);
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
              return message.edit(payload);
            })
            .then(message => {
              setSucces(`message ${message.id} edited`);
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
              setSucces(`message ${message.id} deleted`);
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

      });
    }).catch(err => {
      console.log(err);
    });
  }
  RED.nodes.registerType("discordMessageManager", discordMessageManager);
};
