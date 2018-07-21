const command = require("discord.js-commando");
var CommandCounter = require("../../index.js")

class UserStatsCommand extends command.Command
 {
    constructor(client)
    {
        super(client, {
            name: "userstats",
            group: "util",
            memberName: "userstats",
            description: "Returns the number of command requests sent by a user to Slav Bot.",
            examples: ["`!userstats`"]
        });
    }

    async run(message, args)
    {
        message.channel.startTyping();
        message.reply("<@" + message.author.id + "> You have sent " CommandCounter.getCommandCounter(message.author.id) + " requests to Slav Bot.").catch(error => console.log("Send Error - " + error));
        message.channel.stopTyping();
    }
}

module.exports = UserStatsCommand;