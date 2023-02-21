# Changelog\

## 3.4.0.alpha.1
* Feature - Add and remove roles to users
* Feature - Crosspost an existing message or crosspost a new message on an announcement channel

## 3.4.0.alpha.0
* Enhancement - Moving to Discord.js 14.7
* Feature - Attachments from buffer added

## 3.3.4
* Hotfix - Fix making async to input function not catching errors when formatting embeds, componentes, etc

## 3.3.3
* Hotfix - Remove timedelay references for discordMessageManager when "action=delete"- Removed it in Discord.js v13.
* Feature - Filter messages by channel on discordMessage.

## 3.3.2
* Feature - React 'action' to messages on discordMessageManager by Unicode or name of custom guild emoji (action='react').
* Feature - Reply 'action' for messages on discordMessageManager (action='reply').
* Hotfix - discordMessageManager not sending messages when embeds is an array.

## 3.3.1
* Hotfix - Not sending messages when payload is undefined and there is embed.

## 3.3.0
* Hotfix - Remove ID word on label for the channel input text to prevent autocomplete from browsers.
* Feature - discordReactionManager: user from the message in the output, complete flow message is being copied to the output.
* Feature - Ephemeral check for commands (Auto reply).
* Hotfix - Null validation when trying to access to msg.payload properties.
* Hotfix - debugger instruction removed from discordInteraction node.

## 3.2.4
* Hotfix - fixed interactions on direct messages
## 3.2.3
* Hotfix - discordMessageManager: ReferenceError: setError is not defined -> invalid token causes nodered to get stuck in crash loop.
## 3.2.2
* Enhancement - Discord Nodes are Changing msg Objects Unexpectedly. Now full input message is passing from input to output in discordMessageManager and discordPermissions
* Hotfix - TypeError: Do not know how to serialize a BigInt
## 3.2.1
* Enhancement - attachments array added to msg.data on discordMessage node output.
* Hotfix - Finding message and channel catchs error when message or channel does not exist.
## 3.2.0
* Adds the discordInteraction node with initial capabilites. See wiki for more information.
* msg.components added when sending messages through DiscordMessageManager.
## 3.1.1
Added msg.data.reference to discordMessage. This allows you to check what a message is replying to.
## 3.1.0
Adds the discordReactionManager node with initial capabilites. See documentation in node-red for more information.
## 3.0.5
Fix for when the user who sent a message is a bot.
## 3.0.4
Better error handling in discordMessage
## 3.0.3
Better error handling in discordMessage
## 3.0.2
Actually fix the banner issue.
## 3.0.1
Fixed an issue where flattening the User Object would error out due to the banner not being cached.
## 3.0.0
**Breaking changes!!**
This update brings Discord v13 to to this node. This also means node version 16.6 or higher is now required.

Other breaking changes:
* When sending embeds the msg.payload will stay the content of the messages. You supply the Embed Object through msg.embeds (or msg.embed) as a MessageEmbed object or an array of MessageEmbeds. This allows multiple embeds to be added to a message and also the abilty to set the content of the message which will be displayed seperately.

New features:
* msg.attachment or msg.attachments can now be an array of String which allows multiple attachments to be added.

## 2.3.2

Added msg.request as an output to discordMessageManager. This will output the original input msg.
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
