const {
    AttachmentBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
  } = require('discord.js');

  const formatAttachments = (inputAttachments) => {
    let attachments = [];
    if (inputAttachments) {
      if (typeof inputAttachments === 'string') {
        attachments.push(new AttachmentBuilder(inputAttachments));
      } else if (Array.isArray(inputAttachments)) {
        inputAttachments.forEach(attachment => {
          if (typeof attachment === 'string') {                
            attachments.push(new AttachmentBuilder(attachment));
          } else if (typeof attachment === 'object') {
            attachments.push(new AttachmentBuilder(attachment.buffer, { name: attachment.name}));
          } 
        });
      } else if (typeof inputAttachments === 'object') {
        attachments.push(new AttachmentBuilder(inputAttachments.buffer, {name: inputAttachments.name}));
      } else {
        throw "msg.attachments isn't a string or array";
      }
    }
    return attachments;
  }

  const formatEmbeds = (inputEmbeds) => {
    let embeds = [];
    if (inputEmbeds) {
      if (Array.isArray(inputEmbeds)) {
        inputEmbeds.forEach(embed => {
          embeds.push(embed);
        });
      } else if (typeof inputEmbeds === 'object') {
        embeds.push(inputEmbeds);
      } else {
        throw "msg.embeds isn't a string or array";
      }
    }
    return embeds;
  }

const formatComponents = (inputComponents) => {
    let components = [];
    if (inputComponents) {
      inputComponents.forEach(component => {
        if (component.type == 1) {
          var actionRow = new ActionRowBuilder();
          component.components.forEach(subComponentData => {
            switch (subComponentData.type) {
              case 2:
                actionRow.addComponents(new ButtonBuilder(subComponentData));
                break;
              case 3:
                actionRow.addComponents(new StringSelectMenuBuilder(subComponentData));
                break;
            }
          });
          components.push(actionRow);
        }
      });
    }
    return components;
  }

module.exports = {
    formatComponents: formatComponents,
    formatAttachments: formatAttachments,
    formatEmbeds: formatEmbeds
}