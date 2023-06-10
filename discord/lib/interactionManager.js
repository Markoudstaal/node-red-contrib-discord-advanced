let interactions = {};

const registerInteraction = (interaction) => {    
    interactions[interaction.id]=interaction;
}

const getInteraction = (interactionId) => {
    let interaction = interactions[interactionId];    
    delete interactions[interactionId];
    return interaction;
}

module.exports = {
    registerInteraction: registerInteraction,
    getInteraction: getInteraction
}