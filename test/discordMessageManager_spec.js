const helper = require("node-red-node-test-helper");
const discordMessageManager = require("../discord/discordMessageManager");
const discordToken = require("../discord/discord-token");
const sinon = require("sinon");
const discord = require('discord.js');
const discordBotManager = require('../discord/lib/discordBotManager');

helper.init(require.resolve('node-red'));
const stubDiscord = sinon.createStubInstance(discord.Client);
const noError = "";

describe('Discord Message Manager Node', function () {
    let getBotStub;

    before(() => {
        stubDiscord.login.resolves();
        getBotStub = sinon.stub(discordBotManager, 'getBot').resolves(stubDiscord);
    });

    after(() => getBotStub.restore());    

    afterEach(function () {
        helper.unload();
    });

    it('Node should be loaded', function (done) {
        var flow = [{ id: "n1", type: "discordMessageManager", name: "test name", token: "24205d54014eb63f" }, 
                    { id: "24205d54014eb63f", type: "discord-token", name: "node boy"}];        

        helper.load([discordToken, discordMessageManager], flow, () => {
            var n1 = helper.getNode("n1");
            try {
                n1.should.have.property('name', 'test name');
                done();
            } catch (err) {
                done(err);
            }
        });
    });


    it('Error with no channel or user should fail', function (done) {
        var flow = [{ id: "n1", type: "discordMessageManager", name: "test name", token: "24205d54014eb63f" },
        { id: "24205d54014eb63f", type: "discord-token", name: "node boy" }];

        helper.load([discordToken, discordMessageManager], flow, () => {
            let n1 = helper.getNode("n1");
            const nodeRedMsg = { payload: {}, _msgid: 'dd3be2d56799887c' };

            n1.receive(nodeRedMsg);
            n1.on('call:error', call => {
                call.should.be.calledWithExactly('to send messages either msg.channel or msg.user needs to be set', nodeRedMsg);
                done();
            });
        });
    });

    it('Action type incorrect value should fail', function (done) {
        var flow = [{ id: "n1", type: "discordMessageManager", name: "test name", token: "24205d54014eb63f" },
        { id: "24205d54014eb63f", type: "discord-token", name: "node boy" }];

        helper.load([discordToken, discordMessageManager], flow, () => {
            let n1 = helper.getNode("n1");
            let nodeRedMsg = { payload: {}, _msgid: 'dd3be2d56799887c', action: "actionx" };
            
            n1.receive(nodeRedMsg);
            n1.on('call:error', call => {
                call.should.be.calledWithExactly('msg.action has an incorrect value', nodeRedMsg);
                done();
            });
        });
    });

    
    it('Send channel message keep input _msgid and input properties', function (done) {
        stubDiscord.channels = sinon.createStubInstance(discord.ChannelManager);
        const outputPayload = { message: "Hello there", channel: "1111111111" };
        stubDiscord.channels.fetch.resolves({
            send: () => new Promise((resolve) => resolve(outputPayload))
        });
        
        let flow = [ { id: "n1", type: "discordMessageManager", name: "test name", token: "24205d54014eb63f", wires: [["n2"]]},
            { id: "24205d54014eb63f", type: "discord-token", name: "node boy" },
            { id: "n2", type: "helper" }];
            
        helper.load([discordToken, discordMessageManager], flow, () => {
            let n1 = helper.getNode("n1");
            let n2 = helper.getNode("n2");
            let nodeRedMsg = { _msgid: 'dd3be2d56799887c', payload: "Hello there", channel: "1111111111", topic: "10" };

            n1.receive(nodeRedMsg);
            n1.on('call:error', call => {
                done(call);
            });
            n2.on("input", function (msg) {
                try {
                    msg.should.have.property('payload', outputPayload);
                    msg.should.have.property('_msgid', 'dd3be2d56799887c');
                    msg.should.have.property('channel', '1111111111');
                    msg.should.have.property('topic', '10');
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    });

    it('Take message content from msg.payload.content', function (done) {
        stubDiscord.channels = sinon.createStubInstance(discord.ChannelManager);
        const outputPayload = { message: "Hello there", channel: "1111111111" };
        const expectedContent = "expected content message";
        const inputNodeRedMsg = { _msgid: 'dd3be2d56799887c', payload: { content: expectedContent}, channel: "1111111111", topic: "10" };        
        stubDiscord.channels.fetch.resolves({
            send: (obj) => new Promise((resolve, reject) => {                
                if (obj.content !== expectedContent)
                    reject(expectedContent);

                resolve(outputPayload);
            })                
        });
        let flow = [
            { id: "n1", type: "discordMessageManager", name: "test name", token: "24205d54014eb63f", wires: [["n2"]] },
            { id: "24205d54014eb63f", type: "discord-token", name: "node boy" },
            { id: "n2", type: "helper" }
        ];

        helper.load([discordToken, discordMessageManager], flow, () => {
            let n1 = helper.getNode("n1");
            let n2 = helper.getNode("n2");

            n1.receive(inputNodeRedMsg);
            n1.on('call:error', call => {
                done(call);
            });
            n2.on("input", () => done());
        });
    });

    it('Take message content from msg.payload', function (done) {
        stubDiscord.channels = sinon.createStubInstance(discord.ChannelManager);
        const outputPayload = { message: "Hello there", channel: "1111111111" };
        const expectedContent = "expected content message";
        const inputNodeRedMsg = { _msgid: 'dd3be2d56799887c', payload: expectedContent, channel: "1111111111", topic: "10" };
        stubDiscord.channels.fetch.resolves({
            send: (obj) => new Promise((resolve, reject) => {
                if (obj.content !== expectedContent)
                    reject(expectedContent);

                resolve(outputPayload);
            })
        });
        let flow = [
            { id: "n1", type: "discordMessageManager", name: "test name", token: "24205d54014eb63f", wires: [["n2"]] },
            { id: "24205d54014eb63f", type: "discord-token", name: "node boy" },
            { id: "n2", type: "helper" }
        ];

        helper.load([discordToken, discordMessageManager], flow, () => {
            let n1 = helper.getNode("n1");
            let n2 = helper.getNode("n2");

            n1.receive(inputNodeRedMsg);
            n1.on('call:error', call => {
                done(call);
            });
            n2.on("input", () => done());
        });
    });

    it('Take embed content from msg.payload.embed', function (done) {
        stubDiscord.channels = sinon.createStubInstance(discord.ChannelManager);
        const outputPayload = { message: "Hello there", channel: "1111111111" };
        const embed = [{ color: 0x0099ff, title: 'Some title', url: 'https://discord.js.org' }];
        const inputNodeRedMsg = { _msgid: 'dd3be2d56799887c', payload: { content: "hi", embed: embed} , channel: "1111111111", topic: "10" };
        stubDiscord.channels.fetch.resolves({
            send: (obj) => new Promise((resolve, reject) => {
                if (obj.embeds.length == 0)
                    reject("Error Embed expected");

                resolve(outputPayload);
            })
        });
        let flow = [
            { id: "n1", type: "discordMessageManager", name: "test name", token: "24205d54014eb63f", wires: [["n2"]] },
            { id: "24205d54014eb63f", type: "discord-token", name: "node boy" },
            { id: "n2", type: "helper" }
        ];

        helper.load([discordToken, discordMessageManager], flow, () => {
            let n1 = helper.getNode("n1");
            let n2 = helper.getNode("n2");

            n1.receive(inputNodeRedMsg);
            n1.on('call:error', call => {
                done(call);
            });
            n2.on("input", () => done());
        });
    });

    it('Take embed content from msg.embed and keep msg.embed on ouput', function (done) {
        stubDiscord.channels = sinon.createStubInstance(discord.ChannelManager);
        const outputPayload = { message: "Hello there", channel: "1111111111" };
        const embed = [{ color: 0x0099ff, title: 'Some title', url: 'https://discord.js.org' }];
        const inputNodeRedMsg = { _msgid: 'dd3be2d56799887c', payload: "Hi", embed: embed, channel: "1111111111", topic: "10" };
        stubDiscord.channels.fetch.resolves({
            send: (obj) => new Promise((resolve, reject) => {
                if (obj.embeds.length == 0)
                    reject("Error Embed expected");

                resolve(outputPayload);
            })
        });
        let flow = [
            { id: "n1", type: "discordMessageManager", name: "test name", token: "24205d54014eb63f", wires: [["n2"]] },
            { id: "24205d54014eb63f", type: "discord-token", name: "node boy" },
            { id: "n2", type: "helper" }
        ];

        helper.load([discordToken, discordMessageManager], flow, () => {
            let n1 = helper.getNode("n1");
            let n2 = helper.getNode("n2");

            n1.receive(inputNodeRedMsg);
            n1.on('call:error', call => {
                done(call);
            });
            n2.on("input", (msg) => {
                try {
                    msg.should.have.property('payload', outputPayload);
                    msg.should.have.property('_msgid', 'dd3be2d56799887c');
                    msg.should.have.property('channel', '1111111111');
                    msg.should.have.property('embed', embed);
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    });

    it('Take attachment content from msg.payload.attachment', function (done) {
        stubDiscord.channels = sinon.createStubInstance(discord.ChannelManager);
        const outputPayload = { message: "Hello there", channel: "1111111111" };
        const attachments = [{ title: 'Some title', url: 'https://discord.js.org' }];
        const inputNodeRedMsg = { _msgid: 'dd3be2d56799887c', payload: { content: "hi", attachments: attachments }, channel: "1111111111", topic: "10" };
        stubDiscord.channels.fetch.resolves({
            send: (obj) => new Promise((resolve, reject) => {
                if (obj.files.length == 0)
                    reject("Error attachment expected");

                resolve(outputPayload);
            })
        });
        let flow = [
            { id: "n1", type: "discordMessageManager", name: "test name", token: "24205d54014eb63f", wires: [["n2"]] },
            { id: "24205d54014eb63f", type: "discord-token", name: "node boy" },
            { id: "n2", type: "helper" }
        ];

        helper.load([discordToken, discordMessageManager], flow, () => {
            let n1 = helper.getNode("n1");
            let n2 = helper.getNode("n2");

            n1.receive(inputNodeRedMsg);
            n1.on('call:error', call => {
                done(call);
            });
            n2.on("input", () => done());
        });
    });

    it('Take attachment content from msg.attachment and keep msg.attachment on ouput', function (done) {
        stubDiscord.channels = sinon.createStubInstance(discord.ChannelManager);
        const outputPayload = { message: "Hello there", channel: "1111111111" };
        const attachments = [{ color: 0x0099ff, title: 'Some title', url: 'https://discord.js.org' }];
        const inputNodeRedMsg = { _msgid: 'dd3be2d56799887c', payload: "Hi", attachments: attachments, channel: "1111111111", topic: "10" };
        stubDiscord.channels.fetch.resolves({
            send: (obj) => new Promise((resolve, reject) => {
                if (obj.files.length == 0)
                    reject("Error attachment expected");

                resolve(outputPayload);
            })
        });
        let flow = [
            { id: "n1", type: "discordMessageManager", name: "test name", token: "24205d54014eb63f", wires: [["n2"]] },
            { id: "24205d54014eb63f", type: "discord-token", name: "node boy" },
            { id: "n2", type: "helper" }
        ];

        helper.load([discordToken, discordMessageManager], flow, () => {
            let n1 = helper.getNode("n1");
            let n2 = helper.getNode("n2");

            n1.receive(inputNodeRedMsg);
            n1.on('call:error', call => {
                call.should.be.calledWithExactly(noError);
                done();
            });
            n2.on("input", (msg) => {
                try {
                    msg.should.have.property('payload', outputPayload);
                    msg.should.have.property('_msgid', 'dd3be2d56799887c');
                    msg.should.have.property('channel', '1111111111');
                    msg.should.have.property('attachments', attachments);
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    });
    
    it('Take components content from msg.payload.components', function (done) {
        stubDiscord.channels = sinon.createStubInstance(discord.ChannelManager);
        const outputPayload = { message: "Hello there", channel: "1111111111" };
        const components = [
            {
                "type": 1,
                "components": [
                    { "type": 2, "label": "Option 1", "style": 3, "custom_id": "click_opt1" },
                    { "type": 2, "label": "Option 2", "style": 4, "custom_id": "click_opt2" }
                ]
            }
        ];
        const inputNodeRedMsg = { _msgid: 'dd3be2d56799887c', payload: { content: "hi", components: components }, channel: "1111111111", topic: "10" };
        stubDiscord.channels.fetch.resolves({
            send: (obj) => new Promise((resolve, reject) => {
                if (obj.components.length == 0)
                    reject("Error components expected");

                resolve(outputPayload);
            })
        });
        let flow = [
            { id: "n1", type: "discordMessageManager", name: "test name", token: "24205d54014eb63f", wires: [["n2"]] },
            { id: "24205d54014eb63f", type: "discord-token", name: "node boy" },
            { id: "n2", type: "helper" }
        ];

        helper.load([discordToken, discordMessageManager], flow, () => {
            let n1 = helper.getNode("n1");
            let n2 = helper.getNode("n2");

            n1.receive(inputNodeRedMsg);
            n1.on('call:error', call => {
                call.should.be.calledWithExactly(noError);
                done();
            });
            n2.on("input", () => done());
        });
    });

    it('Take component content from msg.components and keep msg.components on ouput', function (done) {
        stubDiscord.channels = sinon.createStubInstance(discord.ChannelManager);
        const outputPayload = { message: "Hello there", channel: "1111111111" };
        const components = [
            {
                "type": 1,
                "components": [
                    { "type": 2, "label": "Option 1", "style": 3, "custom_id": "click_opt1" },
                    { "type": 2, "label": "Option 2", "style": 4, "custom_id": "click_opt2" }
                ]
            }
        ];
        const inputNodeRedMsg = { _msgid: 'dd3be2d56799887c', payload: "Hi", components: components, channel: "1111111111", topic: "10" };
        stubDiscord.channels.fetch.resolves({
            send: (obj) => new Promise((resolve, reject) => {
                if (obj.components.length == 0)
                    reject("Error components expected");

                resolve(outputPayload);
            })
        });
        let flow = [
            { id: "n1", type: "discordMessageManager", name: "test name", token: "24205d54014eb63f", wires: [["n2"]] },
            { id: "24205d54014eb63f", type: "discord-token", name: "node boy" },
            { id: "n2", type: "helper" }
        ];

        helper.load([discordToken, discordMessageManager], flow, () => {
            let n1 = helper.getNode("n1");
            let n2 = helper.getNode("n2");

            n1.receive(inputNodeRedMsg);
            n1.on('call:error', call => {                
                call.should.be.calledWithExactly(noError);
                done();
            });
            n2.on("input", (msg) => {
                try {
                    msg.should.have.property('payload', outputPayload);
                    msg.should.have.property('_msgid', 'dd3be2d56799887c');
                    msg.should.have.property('channel', '1111111111');
                    msg.should.have.property('components', components);
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    });
});