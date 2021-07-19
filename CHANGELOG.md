# Changelog

## 1.1

* Added ability to send private messages with discordSendMessage.

## 1.0.1

* Add the msg.memberRoleIDs output to the discordMessage node.
## 1.0.0

Initial publicly usable versions of `node-red-contrib-discord-advanced`.
This builds on [`node-red-contrib-discord`](https://github.com/jorisvddonk/node-red-contrib-discord).

**Breaking changes when updating from `node-red-contrib-discord`:**
The discordMessage node supplies the msg.data object. This is the full message object recieved from DiscordJS.
Since the API was updated this object has changed. To find out what data is now in the object see the [documentation](https://discord.js.org/#/docs/main/stable/class/Message). The same goes for msg.member, see it's documentation [here](https://discord.js.org/#/docs/main/stable/class/GuildMember), and msg.author which you can find [here](https://discord.js.org/#/docs/main/stable/class/User).

Current additional features:
* Updated the code base to use DiscordJS V12.
* Added discordDeleteMessage with the ability to delete existing discord messages.
* Added ability to edit messages by providing a message id to the discordSendMessage node.
* Updated node documentation.
