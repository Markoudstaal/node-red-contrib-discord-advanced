# node-red-contrib-discord-advanced

[![npm version](https://badge.fury.io/js/node-red-contrib-discord-advanced.svg)](https://badge.fury.io/js/node-red-contrib-discord-advanced) ![](https://img.shields.io/static/v1?label=discord.js&message=14.11.0&color=brightgreen)
 ![](https://img.shields.io/static/v1?label=node&message=%3E=16.9.0&color=brightgreen) 

Node-red nodes that allow you to interact with Discord, via [Discord.js](https://discord.js.org).

Currently the following actions are supported:
* Receive messages from any Discord servers your BOT is in.
* Send messages in a specific channel.
* Send private messages to users.
* Send and edit embed messages.
* Add attachments to messages.
* Edit, reply, delete messages in a channel.
* Publish messages to announcements channels.
* React to messages with emojis.
* Listen for reactions on a message.
* Listen for interactions on a message button or select menu.
* Listen for interactions on commands.
* Set Status text of the Bot
* Get permissions of a specific user. Add and remove roles. Listen when a user joins or leaves a guild.
* Change channel's name.
* Allow full control over the BOT by access to the DiscordJS client.

This repository builds on [node-red-contrib-discord](https://github.com/jorisvddonk/node-red-contrib-discord) by Joris vd Donk and [node-red-contrib-discord-advanced](https://github.com/Markoudstaal/node-red-contrib-discord-advanced) by javis86. The main intention is to add more features and keep the repository updated.

## Installation and documentation

The [Wiki](https://github.com/dochardi/node-red-contrib-discord-bot/wiki) is still being written when it comes to documentation but you can find a guide on how to install and setup the nodes [here](https://github.com/dochardi/node-red-contrib-discord-bot/wiki/Installation-and-setup).

## Nodes

node-red-contrib-discord-advanced gives you access to 8 nodes:

* **discordMessage** is a node with no inputs and one output allowing you to receive notifications of incoming messages.
* **discordMessageManager** allows (embed) messages to be sent to either channels or privatly to user. It also allows for editing and deleting of (embed) messages.
* **discordReactionManager** that allows you to listen to reactions on a message.
* **discordPermissions** allows you to check the permissions of a specifc user. This is useful when you get the user from another source than the discordMessage node. discorPermissions lets you to add role to an user and to remove role.
* **discordClient** is an advanced deprecated node with one input and one output allowing you to inject a references to a [Discord.js Client](https://discord.js.org/#/docs/main/stable/class/Client) into a message. This node can cause node-red to crash if you use it improperly, so take caution. Messages containing a Discord.js Client reference can *not* be forked (e.g. sent to two nodes), so you'll have to manually remove the reference to the Client via a function node using `delete msg.discord`.
* **discordInteraction** allows you to listen to commands, buttons and select menu interactions and to decide how to respond to them.
* **discordChannelName** allows you to change a channel's name.
* **discordMember** listens when a user joins or leaves a guild.
* **discordGetInfos** get all infos about the Selected guild.

## Changelog

See `CHANGELOG.md` for more info, including information regarding breaking changes per version.

## Common problems

### Empty payload in discordMessage

A common error on some applications is getting empty payload when receiving messages on discordMessage. On 1st of September, Discord changed the way an application gets messages from channel. If you are having this problem try enabling "Message Content Intent" for your bot on Discord Developer Portal.

![](https://raw.githubusercontent.com/Markoudstaal/node-red-contrib-discord-advanced/main/assets/message_content_intent.png)

## Support, issues and feature requests

For support in setting up and feature requests you can contact me on [this](https://discord.com/invite/jpzK52W8) discord.
Issues can also be reported there but prefferably via GitHub.

## Discord.js client sharing

All nodes share Discord.js clients based on the `discord-token` that they were configured with. That means that, when you add many `discordMessage` nodes configured with the exact same token, only a single connection with Discord will be made.
