
const { Client, GatewayIntentBits, Partials } = require('discord.js');

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

const getGuild = async (bot, id) => {
    const guildId = checkIdOrObject(id);
    if (!guildId) {
        throw (`msg.guild wasn't set correctly`);
    }
    return await bot.guilds.fetch(guildId);
}



const getChannel = async (bot, id) => {
    const channelID = checkIdOrObject(id);
    if (!channelID) {
        throw (`msg.channel wasn't set correctly`);
    }
    return await bot.channels.fetch(channelID);
}

const getMessage = async (bot, channel, message) => {
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

module.exports = {
    checkIdOrObject: checkIdOrObject,
    getMessage: getMessage,
    getGuild: getGuild,
    getChannel: getChannel

};