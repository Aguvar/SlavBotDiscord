const command = require("discord.js-commando");
const randomAnimals = require('random-animals')
var CommandCounter = require("../../index.js")

class RandomdogoCommand extends command.Command
 {
    constructor(client)
    {
        super(client, {
            name: "randomdogo",
            group: "imageshit",
            memberName: "randomdogo",
            description: "Gives an image of a random dogo.",
            examples: ["`!randomdogo`"]
        });
    }

    async run(message, args)
    {
        message.channel.startTyping();
        CommandCounter.addCommandCounter(message.author.id)
        randomAnimals.dog().then(dog => message.channel.send("", {files: [dog]}).catch(error => console.log("Send Error - " + error)));
        message.channel.stopTyping();
    }
}

module.exports = RandomdogoCommand;