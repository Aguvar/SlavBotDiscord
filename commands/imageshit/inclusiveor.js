const request = require('request');
const command = require("discord.js-commando");
var CommandCounter = require("../../index.js")

class InclusiveorCommand extends command.Command
 {
    constructor(client)
    {
        super(client, {
            name: "inclusiveor",
            group: "imageshit",
            memberName: "inclusiveor",
            description: "Gives a random Image from /r/InclusiveOr.",
            examples: ["`!inclusiveor`"]
        });
    }

    async run(message, args)
    {
        message.channel.startTyping();
        CommandCounter.addCommandCounter(message.author.id)
        var url = "https://www.reddit.com/r/InclusiveOr/random/.json";
        request(url, { json: true }, (err, res, redditResponse) => {
            if (err) { message.reply("Error - " + err.message).catch(error => console.log("Send Error - " + error)); message.channel.stopTyping(); return console.log(err); }
            var title = redditResponse[0].data.children[0].data.title;
            var url = redditResponse[0].data.children[0].data.url;
            var thumbnail = redditResponse[0].data.children[0].data.thumbnail;

            if(thumbnail == "nsfw")
            {
                this.run(message, args)
                return;
            }
            else if(url.indexOf(".png") == -1 && url.indexOf(".jpg") == -1 && url.indexOf(".jpeg") == -1 && url.indexOf(".gif") == -1)
            {
                if(thumbnail.indexOf(".png") == -1 && thumbnail.indexOf(".jpg") == -1 && thumbnail.indexOf(".jpeg") == -1 && thumbnail.indexOf(".gif") == -1)
                {
                    this.run(message, args)
                    return;
                }
                else
                {
                    url = thumbnail;
                }
            }
            
            if(title == "" || title == null)
            {
                title = "***Yes***";
            }
            else
            {
                title = "***" + title + "***";
            }

            if(url != null || url != "")
            {
                message.channel.send(title, {files: [url]}).catch(error => console.log("Send Error - " + error));
            }
            else
            {
                this.run(message, args)
            }
            
            
            message.channel.stopTyping();
        });
    }
}

module.exports = InclusiveorCommand;