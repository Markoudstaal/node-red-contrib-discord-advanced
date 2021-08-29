# Changelog

## 2.3.1

Bugfix: code would ignore msg.attachment when the message to be sent was an embed.
## 2.3.0

discordMessageManager now has an ouput that passes the Object of the message that was created, edited or deleted.

## 2.2.0

Added the ability to send and edit embed messages with discordMessageManager.
## 2.1.0

* Add the discordPermissions node which allows checking of roles a specific user has in a guild.
## 2.0.2

* Hotfix for error handling when msg.message isn't supplied.
## 2.0.1

* Hotfix for message sending not working when supplying an object for msg.channel or msg.user
## 2.0.0
**Breaking changes!!**
The discordSendMessage and discordDeleteMessage nodes have been removed and its functionality moved into the discordMessageManager.
To edit or delete messages you now need to send msg.action with either 'edit' or 'delete' to the discordMessageManager.
Also to edit or delete messages the variable for the message object or ID is now called msg.message for more clarity.

I know these changes make a lot of difference for flow's but this change will mean new functionality's won't require breaking changes. 
These should be the last breaking changes from my code, they could still happen if DiscordJS changes.

Other changes:
* Lots of code refactoring for a more robust code base.
* Better error messages when wrong data is supplied or there's problems in DiscordJS.

## 1.1.1

* Added Discord to the Readme.
* Updated description.
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
