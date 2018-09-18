const command = require("discord.js-commando");
const Jimp = require("jimp");
const shortid = require("shortid");
const fs = require('fs-extra');
var resultHandler = function(err) { 
    if(err) {
       console.log("unlink failed", err);
    } else {
       console.log("file deleted");
    }
}
var CommandCounter = require("../../index.js")

class TPoseCommand extends command.Command
 {
    constructor(client)
    {
        super(client, {
            name: "tpose",
            group: "imageshit",
            memberName: "tpose",
            description: "***Asserting Dominance.*** Merges the avatar of the bot to the last image uploaded, your avatar or the avatar of the user you mentioned after the command.",
            examples: ["`!tpose`", "`!tpose avatar`","`!tpose @User`"]
        });
    }

    async run(message, args)
    {
        
        CommandCounter.addCommandCounter(message.author.id)
        var otherUser = false;
        var userID = "";
        var commandPrefix= "!"
        if(message.guild != null)
        {
            commandPrefix = message.guild.commandPrefix
        }
        if(args.length > 0)
        {
            console.log("args are present");
            var getUser = false;
            for(var i = 0; i < args.length; i++)
            {
                if(getUser)
                {
                    if(args[i].toString() == ">")
                    {
                        i = args.length;
                        otherUser = true;
                    }
                    else
                    {
                        if(args[i].toString() != "@" && !isNaN(args[i].toString()))
                        {
                            userID = userID + args[i].toString();
                        }
                    }
                }
                else
                {
                    if(args[i].toString() == "<")
                    {
                         getUser = true;
                    } 
                }
            }
        }
        
        var url = "";
        console.log(url);

        if(args.toString().toLowerCase() != "avatar" && !otherUser)
        {
            message.channel.fetchMessages({ around: message.id })
            .then(messages => {
                var messageID = "";
                messages.filter(msg => {
                    if(msg.attachments.last() != undefined)
                    {
                        var attachments = msg.attachments.array();
                        for(var i = attachments.length - 1; i > -1; i--)
                        {
                            if(attachments[i].height > 0)
                            {
                                if(messageID == "")
                                {
                                    messageID = msg.id;
                                    url = attachments[i].url;
                                }
                            }
                        }
                    }
                }); 

                if(messageID == "")
                {
                    message.channel.send("<@" + message.author.id + "> No image found, use `" + commandPrefix + "help tpose` for help.").catch(error => {console.log("Send Error - " + error); });
                    
                    return;
                }
                message.channel.send("***taking image***").catch(error => {console.log("Send Error - " + error); });
                Jimp.read("tpose.png").then(function (tposeImage) {
                    console.log("got image");
                    Jimp.read(url).then(function (userImage) {
                        console.log("got avatar");
                        if(userImage.bitmap.height > userImage.bitmap.width)
                        {
                            tposeImage.resize(userImage.bitmap.width * 0.75, userImage.bitmap.width * 0.75);
                        }
                        else if (userImage.bitmap.width > userImage.bitmap.height)
                        {
                            tposeImage.resize(userImage.bitmap.height * 0.75, userImage.bitmap.height * 0.75);
                        }
                        else
                        {
                            tposeImage.resize(userImage.bitmap.width * 0.75, userImage.bitmap.height * 0.75);
                        }
                        var x = (Math.random() * (userImage.bitmap.width)) - (tposeImage.bitmap.width / 2);
                        console.log(x);
                        var y = (Math.random() * (userImage.bitmap.height)) - (tposeImage.bitmap.height / 2);
                        console.log(y);
        
                        if(Math.random() * 100 < 50)
                        {
                            if(Math.random() * 100 < 50)
                            {
                                if(y < userImage.bitmap.height / 4)
                                {
                                    if(Math.random() * 100 < 50)
                                    {
                                        tposeImage.flip(false, true);
                                    }
                                    else
                                    {
                                        tposeImage.flip(true, true);
                                    }
                                }
                                else
                                {
                                    if(Math.random() * 100 < 50)
                                    {
                                        tposeImage.flip(false, false);
                                    }
                                    else
                                    {
                                        tposeImage.flip(true, false);
                                    }
                                }
                            }
                            else
                            {
                                if(x < userImage.bitmap.width / 4)
                                {
                                    tposeImage.rotate(90);
                                }
                                else if(x > userImage.bitmap.width / 4)
                                {
                                    tposeImage.rotate(-90);
                                }
        
                                if(Math.random() * 100 < 50)
                                {
                                    tposeImage.flip(false, false);
                                }
                                else
                                {
                                    tposeImage.flip(false, true);
                                }
                            }
                        }
        
                        
                        var mergedImage = userImage.composite(tposeImage, x, y );
                        const file = shortid.generate() + ".png"
                        mergedImage.write(file, function(error){
                            if(error) { console.log(error); return;};
                            console.log("got merged image");
                            console.log(file);
                            message.channel.send("***Asserting Dominance***", {
                                files: [file]
                            }).then(function(){
                                fs.remove(file, resultHandler);
                                
                            }).catch(function (err) {
                                message.channel.send("Error - " + err.message).catch(error => {console.log("Send Error - " + error); });
                                console.log(err.message);
                                
                                fs.remove(file, resultHandler);
                            });
                            console.log("Message Sent");
                        });
                    }).catch(function (err) {
                        message.channel.send("Error - " + err.message).catch(error => {console.log("Send Error - " + error); });
                        console.log(err.message);
                        
                    });
                }).catch(function (err) {
                    console.log(err.message);
                    
                });
            }).catch(function (err) {
                message.channel.send("Error - " + err.message).catch(error => {console.log("Send Error - " + error); });
                console.log(err.message);
                
            });
        }
        else if(args.toString().toLowerCase() == "avatar" || otherUser)
        {
            var promises = []
            if(otherUser)
            {
                console.log("other tpose");
                console.log(userID);

                promises.push(message.channel.client.fetchUser(userID)
                .then(user => {
                    if(user.avatarURL != undefined && user.avatarURL != null)
                       url = user.avatarURL;
                   else
                       url = "no user"
                }, rejection => {
                       console.log(rejection.message);
                       url = "no user";
                }))
            }
            else
            {
                console.log("self tpose");
                url = message.author.avatarURL;
            }

            Promise.all(promises).then(() => {
    Jimp.read("tpose.png").then(function (tposeImage) {
                    console.log("got image");
                    
                    Jimp.read(url).then(function (userImage) {
                        console.log("got avatar");
                        tposeImage.resize(userImage.bitmap.width * 0.75, userImage.bitmap.height * 0.75);
        
                        var x = (Math.random() * (userImage.bitmap.width)) - (tposeImage.bitmap.width / 2);
                        console.log(x);
                        var y = (Math.random() * (userImage.bitmap.height)) - (tposeImage.bitmap.height / 2);
                        console.log(y);
        
                        if(Math.random() * 100 < 50)
                        {
                            if(Math.random() * 100 < 50)
                            {
                                if(y < userImage.bitmap.height / 4)
                                {
                                    if(Math.random() * 100 < 50)
                                    {
                                        tposeImage.flip(false, true);
                                    }
                                    else
                                    {
                                        tposeImage.flip(true, true);
                                    }
                                }
                                else
                                {
                                    if(Math.random() * 100 < 50)
                                    {
                                        tposeImage.flip(false, false);
                                    }
                                    else
                                    {
                                        tposeImage.flip(true, false);
                                    }
                                }
                            }
                            else
                            {
                                if(x < userImage.bitmap.width / 4)
                                {
                                    tposeImage.rotate(90);
                                }
                                else if(x > userImage.bitmap.width / 4)
                                {
                                    tposeImage.rotate(-90);
                                }
        
                                if(Math.random() * 100 < 50)
                                {
                                    tposeImage.flip(false, false);
                                }
                                else
                                {
                                    tposeImage.flip(false, true);
                                }
                            }
                        }
        
                        
                        var mergedImage = userImage.composite(tposeImage, x, y );
                        const file = shortid.generate() + ".png"
                        mergedImage.write(file, function(error){
                            if(error) { console.log(error); return;};
                            console.log("got merged image");
                            console.log(file);
                            message.channel.send("***Asserting Dominance***", {
                                files: [file]
                            }).then(function(){
                                
                                fs.remove(file, resultHandler);
                            }).catch(function (err) {
                                message.channel.send("Error - " + err.message).catch(error => {console.log("Send Error - " + error); });
                                console.log(err.message);
                                
                                fs.remove(file, resultHandler);
                            });
                            console.log("Message Sent");
                        });
                    }).catch(function (err) {
                        if(url == "no user")
                        {
                            message.channel.send("<@" + message.author.id + "> No avatar found.").catch(error => {console.log("Send Error - " + error); });
                        }
                        else
                            message.channel.send("Error - " + err.message).catch(error => {console.log("Send Error - " + error); });
                        console.log(err.message);
                        
                    });
                }).catch(function (err) {
                    console.log(err.message);
                    
                });
            }).catch((e) => {
                console.log("User Data Error - " + e.message);
                message.channel.send("User data not found").catch(error => console.log("Send Error - " + error));
            });
            
        }
    }
}

module.exports = TPoseCommand;
