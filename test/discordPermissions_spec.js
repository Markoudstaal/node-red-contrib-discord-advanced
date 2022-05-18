const helper = require("node-red-node-test-helper");
const discordPermissions = require("../discord/discordPermissions");
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

    after( () => getBotStub.restore() );

    afterEach(function () {
        helper.unload();
    });

    it('Node should be loaded', function (done) {
        var flow = [{ id: "n1", type: "discordPermissions", name: "test name", token: "24205d54014eb63f" }, 
                    { id: "24205d54014eb63f", type: "discord-token", name: "node boy"}];        

        helper.load([discordToken, discordPermissions], flow, () => {
            var n1 = helper.getNode("n1");
            try {
                n1.should.have.property('name', 'test name');
                done();
            } catch (err) {
                done(err);
            }
        });
    });


    it(`msg.user wasn't set correctly`, function (done) {
        var flow = [{ id: "n1", type: "discordPermissions", name: "test name", token: "24205d54014eb63f" },
        { id: "24205d54014eb63f", type: "discord-token", name: "node boy" }];

        helper.load([discordToken, discordPermissions], flow, () => {
            let n1 = helper.getNode("n1");
            const nodeRedMsg = { payload: {}, _msgid: 'dd3be2d56799887c' };

            n1.receive(nodeRedMsg);
            n1.on('call:error', call => {
                call.should.be.calledWithExactly(`msg.user wasn't set correctly`, nodeRedMsg);
                done();
            });
        });
    });

    it(`msg.guild wasn't set correctly`, function (done) {
        var flow = [{ id: "n1", type: "discordPermissions", name: "test name", token: "24205d54014eb63f" },
        { id: "24205d54014eb63f", type: "discord-token", name: "node boy" }];

        helper.load([discordToken, discordPermissions], flow, () => {
            let n1 = helper.getNode("n1");
            const nodeRedMsg = { payload: {}, _msgid: 'dd3be2d56799887c', user: "99991231931" };

            n1.receive(nodeRedMsg);
            n1.on('call:error', call => {
                call.should.be.calledWithExactly(`msg.guild wasn't set correctly`, nodeRedMsg);
                done();
            });
        });
    });

    it('Get Roles keep input _msgid and input properties on the output', function (done) {
        stubDiscord.guilds = sinon.createStubInstance(discord.GuildManager);
        let stubGuild = sinon.createStubInstance(discord.Guild);
        stubGuild.members = sinon.createStubInstance(discord.GuildMemberManager);
        const user = {
            name: "Juancito",
            roles: {
                cache: {
                    each: (func) => {
                        func("role1");
                        func("role2");
                        func("role3");                        
                    }
                }
            }
        };
        stubGuild.members.fetch.resolves( user );
        stubDiscord.guilds.fetch.resolves( stubGuild );

        let flow = [{ id: "n1", type: "discordPermissions", name: "test name", token: "24205d54014eb63f", wires: [["n2"]] },
        { id: "24205d54014eb63f", type: "discord-token", name: "node boy" },
        { id: "n2", type: "helper" }];

        helper.load([discordToken, discordPermissions], flow, () => {
            let n1 = helper.getNode("n1");
            let n2 = helper.getNode("n2");
            let nodeRedMsg = { _msgid: 'dd3be2d56799887c', user: "99991231931", guild: "111111111", payload: "Hello there", channel: "1111111111", topic: "10" };

            n1.receive(nodeRedMsg);
            n1.on('call:error', call => {
                done(call);
            });
            n2.on("input", function (msg) {
                try {
                    msg.should.have.property('payload', ["role1", "role2", "role3"]);
                    msg.should.have.property('_msgid', nodeRedMsg._msgid);
                    msg.should.have.property('channel', nodeRedMsg.channel);
                    msg.should.have.property('topic', nodeRedMsg.topic);
                    msg.should.have.property('user', nodeRedMsg.user);
                    msg.should.have.property('guild', nodeRedMsg.guild);
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    });

    it('Wrong token calls node.status', function (done) {
        const err = "Error [TOKEN_INVALID]: An invalid token was provided.";
        getBotStub.restore();
        getBotStub = sinon.stub(discordBotManager, 'getBot').rejects(err);

        let flow = [{ id: "n1", type: "discordPermissions", name: "test name", token: "24205d54014eb63f", wires: [["n2"]] },
        { id: "24205d54014eb63f", type: "discord-token", name: "node boy" },
        { id: "n2", type: "helper" }];

        helper.load([discordToken, discordPermissions], flow, () => {
            let n1 = helper.getNode("n1");

            n1.status.should.be.calledWithExactly({
                fill: "red",
                shape: "dot",
                text: err
            });
            done();
        });
    });
});