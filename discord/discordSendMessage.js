module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');
  const {
    MessageAttachment
  } = require('discord.js');

  function discordSendMessage(config) {
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

        console.log(timeDelay);

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
              check = check.id;
              return check;
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
          if (user && typeof user !== 'string') {
            if (user.hasOwnProperty('id')) {
              user = user.id;
            } else {
              setError(`msg.user needs to be either a string for the id or channel Object`)
            }
          }
          bot.users.fetch(user).then(user => {
            return user.send(payload, attachment);
          }).then(message => {
            setSucces(`message sent to ${message.channel.recipient.username}`)
          }).catch(err => {
            setError(err);
          })
        }

        const createChannelMessage = () => {
          if (channel && typeof channel !== 'string') {
            if (channel.hasOwnProperty('id')) {
              channel = channel.id;
            } else {
              setError(`msg.channel needs to be either a string for the id or channel Object`)
            }
          }
          getChannel(channel).then(channelInstance => {
            return channelInstance.send(payload, attachment);
          }).then((message) => {
            setSucces(`message sent, id = ${message.id}`);
          }).catch(err => {
            setError(err);
          });
        }

        const createMessage = () => {
          if (msg.user) {
            createPrivateMessage();
          } else if (msg.channel) {
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
  RED.nodes.registerType("discordSendMessage", discordSendMessage);
};
