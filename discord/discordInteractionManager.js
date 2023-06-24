module.exports = function (RED) {
    var discordBotManager = require('./lib/discordBotManager.js');
    var discordInterationManager = require('./lib/interactionManager.js');
    var messagesFormatter = require('./lib/messagesFormatter.js');
    const Flatted = require('flatted');

    const checkString = (field) => typeof field === 'string' ? field : false;

    function discordInteractionManager(config) {
        RED.nodes.createNode(this, config);
        var configNode = RED.nodes.getNode(config.token);
        var node = this;

        discordBotManager.getBot(configNode).then(function (bot) {
            node.on('input', async (msg) => {
                try {
                    const content = msg.payload?.content || checkString(msg.payload) || ' ';
                    const inputEmbeds = msg.payload?.embeds || msg.payload?.embed || msg.embeds || msg.embed;
                    const inputAttachments = msg.payload?.attachments || msg.payload?.attachment || msg.attachments || msg.attachment;
                    const inputComponents = msg.payload?.components || msg.components;
                    const interactionId = msg.interactionId;
                    const action = msg.action || 'edit';
                    const autoCompleteChoices = msg.autoCompleteChoices || [];

                    const setError = (error) => {
                        node.status({
                            fill: "red",
                            shape: "dot",
                            text: error
                        })
                        node.error(error);
                    }

                    const setSuccess = (succesMessage, data) => {
                        node.status({
                            fill: "green",
                            shape: "dot",
                            text: succesMessage
                        });

                        msg.payload = Flatted.parse(Flatted.stringify(data));
                        node.send(msg);
                    }

                    const editInteractionReply = async () => {
                        await interaction.editReply({
                            embeds: embeds,
                            content: content,
                            files: attachments,
                            components: components
                        });

                        const newMsg = {
                            interaction: Flatted.parse(Flatted.stringify(interaction))
                        };


                        setSuccess(`interaction ${interactionId} edited`, newMsg);
                    }

                    const respondAutocomplete = async () => {
                        if (!interaction.isAutocomplete()) {
                            setError("Error: not autocomplete Interaction");
                            return;
                        }

                        const focusedValue = interaction.options.getFocused();
                        console.log(`Search ${focusedValue}`);
                        const filtered = autoCompleteChoices.filter(choice => choice.startsWith(focusedValue));

                        await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));

                        const newMsg = {
                            interaction: Flatted.parse(Flatted.stringify(interaction))
                        };


                        setSuccess(`interaction ${interactionId} filtered`, newMsg);
                    }

                    let interaction = await discordInterationManager.getInteraction(interactionId);

                    let attachments, embeds, components;
                    try {
                        attachments = messagesFormatter.formatAttachments(inputAttachments);
                        embeds = messagesFormatter.formatEmbeds(inputEmbeds);
                        components = messagesFormatter.formatComponents(inputComponents);
                    } catch (error) {
                        node.error(error);
                        node.status({
                            fill: "red",
                            shape: "dot",
                            text: error
                        });
                        return;
                    }

                    switch (action.toLowerCase()) {
                        case 'edit':
                            await editInteractionReply();
                            break;
                        case 'respondautocomplete':
                            await respondAutocomplete();
                            break;
                        default:
                            setError(`msg.action has an incorrect value`)
                    }


                } catch (error) {
                    node.error(error);
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: error
                    });
                }



            });

            node.on('close', function () {
                discordBotManager.closeBot(bot);
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
    RED.nodes.registerType("discordInteractionManager", discordInteractionManager);
};
