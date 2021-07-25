module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');
  const {
    MessageAttachment
  } = require('discord.js');

  function discordSendMessage(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var configNode = RED.nodes.getNode(config.token);
    node.on('input', function (msg, send, done) {
      discordBotManager.getBot(configNode).then(function (bot) {
        const action = msg.action || 'create';
        const payload = msg.payload;

        let attachment = null;
        if (msg.attachment) {
          attachment = new MessageAttachment(msg.attachment);
        }

        const setError = (errorMessage) => {
          node.status({
            fill: "red",
            shape: "dot",
            text: errorMessage
          })
        }

        const setSucces = (succesMessage) => {
          node.status({
            fill: "green",
            shape: "dot",
            text: succesMessage
          });
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

        const createPrivateMessage = () => {
          var user = msg.user;
          if (user && typeof user !== 'string') {
            if (user.hasOwnProperty('id')) {
              user = user.id;
            } else {
              setError(`msg.user needs to be either a string for the id or channel Object`)
              done(`msg.user needs to be either a string for the id or channel Object`);
            }
          }
          bot.users.fetch(user).then(user => {
            return user.send(payload, attachment);
          }).then(message => {
            setSucces(`message sent to ${message.channel.recipient.username}`)
            done();
          }).catch(err => {
            setError(err);
            done(err);
          })
        }

        const createChannelMessage = () => {
          var channel = config.channel || msg.channel;
          if (channel && typeof channel !== 'string') {
            if (channel.hasOwnProperty('id')) {
              channel = channel.id;
            } else {
              setError(`msg.channel needs to be either a string for the id or channel Object`)
              done(`msg.channel needs to be either a string for the id or channel Object`);
            }
          }
          getChannel(channel).then(channelInstance => {
            return channelInstance.send(payload, attachment);
          }).then((message) => {
            setSucces(`message send, id = ${message.id}`);
            done();
          }).catch(err => {
            setError(err);
            done(err);
          });
        }

        const createMessage = () => {
          if (msg.user) {
            createPrivateMessage();
          } else if (msg.channel) {
            createChannelMessage();
          } else {
            setError('to send messages either msg.channel or msg.user needs to be set');
            done('to send messages either msg.channel or msg.user needs to be set');
          }
        }

        const editMessage = () => {

        }

        const deleteMessage = () => {

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

      }).catch(err => {
        done(err);
      });
    });
  }
  RED.nodes.registerType("discordSendMessage", discordSendMessage);
};
