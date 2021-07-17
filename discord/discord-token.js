module.exports = function(RED) {
    function DiscordTokenNode(n) {
        RED.nodes.createNode(this,n);
        this.token = this.credentials.token;
        this.name = n.name;
    }
    RED.nodes.registerType("discord-token", DiscordTokenNode, {
        credentials: {
            token: {type:"text"}
        }
    });
};