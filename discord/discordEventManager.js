module.exports = function (RED) {
  var discordBotManager = require('./lib/discordBotManager.js');
  var discordFramework = require('./lib/discordFramework.js');
  const Flatted = require('flatted');
  const {
    GuildScheduledEventEntityType,
    GuildScheduledEventPrivacyLevel,
  } = require('discord.js');


  function discordEventManager(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var configNode = RED.nodes.getNode(config.token);

    discordBotManager.getBot(configNode).then(function (bot) {
      node.on('input', async function (msg, send, done) {
        
        const _guildID = config.guild || msg.guild || null;
        const _eventID = config.event || msg.event || null;
        const _action = msg.action || "info";

        const _eventName = msg.eventName || null;
        const _eventScheduledStartTime = msg.scheduledStartTime || null;
        const _eventScheduledEndTime = msg.scheduledEndTime || null;
        const _eventEventType = msg.eventType || "external";
        const _eventChannel = msg.channel || null;
        const _eventImage = null; //To-do.....
        const _eventReason = msg.reason || null;
        const _eventDescription = msg.description || null;
        const _eventLocation = msg.eventLocation || null;

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

        

        const infoEvent = async () => {
          try {
            let eventManager = await discordFramework.getEventManager(bot, _guildID)

            const eventID = discordFramework.checkIdOrObject(_eventID);

            let event = await eventManager.fetch(eventID)

            setSuccess(`event ${event.id} info obtained`, event);
          } catch (err) {
            setError(err);
          }
        }

        const getEvents = async () => {
          try {
            let eventManager = await discordFramework.getEventManager(bot, _guildID)

            let events = await eventManager.fetch()

            setSuccess(`events [${events.size}] obtained`, events);
          } catch (err) {
            setError(err);
          }
        }

        const deleteEvent = async () => {
          try {
            let eventManager = await discordFramework.getEventManager(bot, _guildID)

            const eventID = discordFramework.checkIdOrObject(_eventID);

            let event = await eventManager.fetch(eventID)
            let deleted = await eventManager.delete(event)

            setSuccess(`event ${event.id} deleted`, deleted);
          } catch (err) {
            setError(err);
          }
        }

        const createEvent = async () => {

          try {

            let eventManager = await discordFramework.getEventManager(bot, _guildID)
            const eventName = discordFramework.checkIdOrObject(_eventName)
            const eventChannel = discordFramework.checkIdOrObject(_eventChannel)
            

            if (!eventName) {
              throw (`msg.eventName wasn't set correctly`);
            }

            if (_eventScheduledStartTime == null) {
              throw (`msg.scheduledStartTime wasn't set correctly`);
            }

            if ( _eventEventType == "external" ){

              if ( _eventLocation == null ){

                throw (`msg.eventLocation wasn't set correctly, is required when event type is set to external`);

              }

              if ( _eventScheduledEndTime == null ){

                throw (`msg.eventScheduledEndTime wasn't set correctly, is required when event type is set to external`);

              }

            }
            else if ( _eventEventType == "voice" ){

              if ( !eventChannel ){

                throw (`msg.channel wasn't set correctly, is required when event type is set to voice`);

              }

            }
            else {

              throw (`msg.eventType wasn't set correctly, ${_eventEventType} is not a valid event type`)

            }

            const eventMetadata = {
              location: _eventLocation
            };
            
            eventScheduledEndTime = new Date(_eventScheduledEndTime) || null 

            let event = await eventManager.create({
              name: eventName,
              scheduledStartTime: new Date(_eventScheduledStartTime),
              scheduledEndTime: new Date(eventScheduledEndTime),
              privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
              entityType: _eventEventType == "voice" ? GuildScheduledEventEntityType.Voice : GuildScheduledEventEntityType.External,
              description: _eventDescription,
              channel: _eventChannel,
              image: null,
              reason: _eventReason,
              entityMetadata: eventMetadata
            });

            setSuccess(`event ${event.id} created`, event);
          } catch (err) {
            setError(err);
          }
        }



        switch (_action.toLowerCase()) {
          case 'info':
            await infoEvent();
            break;
          case 'all':
              await getEvents();
              break;
          case 'create':
            await createEvent();
            break;
          case 'delete':
            await deleteEvent();
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
  RED.nodes.registerType("discordEventManager", discordEventManager);
};
