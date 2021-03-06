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

class CropCommand extends command.Command
 {
    constructor(client)
    {
        super(client, {
            name: "crop",
            group: "imageshit",
            memberName: "crop",
            description: "Crop out a number of pixels of an image from a given direction. Crop the last image uploaded, your avatar or the avatar of the user you mentioned in the user parameter.",
            examples: ["`!crop up|200`", "`!crop up|200|@User`", "`!crop up|200|avatar`", "`!crop down|300`", "`!crop left|300`", "`!crop right|150`"]
        });
    }

    async run(message, args)
    {
        
        CommandCounter.addCommandCounter(message.author.id);
        var otherUser = false;
        var userID = "";

        var commandPrefix= "!"
        if(message.guild != null)
        {
            commandPrefix = message.guild.commandPrefix
        }

        var parameters = args.split("|");
        var userOption = "";
        var direction = "";
        var pixels = "";

        if(parameters.length >= 2)
        {
            direction = parameters[0];
            pixels = parameters[1];
        }

        if(parameters.length > 2)
        {
            userOption = parameters[2];
            console.log("args are present");
            var getUser = false;
            for(var i = 0; i < userOption.length; i++)
            {
                if(getUser)
                {
                    if(userOption[i].toString() == ">")
                    {
                        i = userOption.length;
                        otherUser = true;
                    }
                    else
                    {
                        if(userOption[i].toString() != "@" && !isNaN(userOption[i].toString()))
                        {
                            userID = userID + userOption[i].toString();
                        }
                    }
                }
                else
                {
                    if(userOption[i].toString() == "<")
                    {
                         getUser = true;
                    } 
                }
            }
        }
        
        var url = "";
        console.log("crop");
        console.log(url);

        if(direction != "")
        {
            if(direction.toLowerCase() != "left" && direction.toLowerCase() != "right" && direction.toLowerCase() != "up" && direction.toLowerCase() != "down")
            {
                message.channel.send("<@" + message.author.id + "> Invalid direction parameter, use `" + commandPrefix + "help crop` for help.").catch(error => {console.log("Send Error - " + error); });
                
                return;
            }
        }


        if(userOption.toString().toLowerCase() != "avatar" && !otherUser && direction != "" && pixels != "")
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
                    message.channel.send("<@" + message.author.id + "> No image found, use `" + commandPrefix + "help crop` for help.").catch(error => {console.log("Send Error - " + error); });
                    
                    return;
                }
                message.channel.send("***taking image***").catch(error => {console.log("Send Error - " + error); });
                Jimp.read(url).then(function (userImage) {
                    console.log("got last image to crop");
                    
                    var x = 0;
                    var y = 0;
                    var width = 0;
                    var height = 0;
                    var directioDetail = "";

                    var pixelValue = parseInt(pixels);

                    if(direction.toLowerCase() == "right")
                    {
                        if(pixelValue >= userImage.bitmap.width || pixelValue <= 0)
                        {
                            message.channel.send("<@" + message.author.id + "> The pixel parameter given must be less than the width of the given image and greater than 0 for a right directional crop. You have given a value of " + pixelValue + " for an image with a resolution of " + userImage.bitmap.width + "x" + userImage.bitmap.height + ". Use `" + commandPrefix + "help crop` for help.").catch(error => {console.log("Send Error - " + error); });
                            
                            return;
                        }
                        else
                        {
                            x = pixelValue;
                            height = userImage.bitmap.height;
                            width = userImage.bitmap.width - pixelValue;
                            directioDetail = "left side";
                        }
                    }
                    else if(direction.toLowerCase() == "left")
                    {
                        if(pixelValue >= userImage.bitmap.width || pixelValue <= 0)
                        {
                            message.channel.send("<@" + message.author.id + "> The pixel parameter given must be less than the width of the given image and greater than 0 for a left directional crop. You have given a value of " + pixelValue + " for an image with a resolution of " + userImage.bitmap.width + "x" + userImage.bitmap.height + ". Use `" + commandPrefix + "help crop` for help.").catch(error => {console.log("Send Error - " + error); });
                            
                            return;
                        }
                        else
                        {
                            height = userImage.bitmap.height;
                            width = userImage.bitmap.width - pixelValue;
                            directioDetail = "right side";
                        }
                    }
                    else if(direction.toLowerCase() == "up")
                    {
                        if(pixelValue >= userImage.bitmap.height || pixelValue <= 0)
                        {
                            message.channel.send("<@" + message.author.id + "> The pixel parameter given must be less than the height of the given image and greater than 0 for a upper directional crop. You have given a value of " + pixelValue + " for an image with a resolution of " + userImage.bitmap.width + "x" + userImage.bitmap.height + ". Use `" + commandPrefix + "help crop` for help.").catch(error => {console.log("Send Error - " + error); });
                            
                            return;
                        }
                        else
                        {
                            height = userImage.bitmap.height - pixelValue;
                            width = userImage.bitmap.width;
                            directioDetail = "bottom";
                        }
                    }
                    else if(direction.toLowerCase() == "down")
                    {
                        if(pixelValue >= userImage.bitmap.height || pixelValue <= 0)
                        {
                            message.channel.send("<@" + message.author.id + "> The pixel parameter given must be less than the height of the given image and greater than 0 for a downward directional crop. You have given a value of " + pixelValue + " for an image with a resolution of " + userImage.bitmap.width + "x" + userImage.bitmap.height + ". Use `" + commandPrefix + "help crop` for help.").catch(error => {console.log("Send Error - " + error); });
                            
                            return;
                        }
                        else
                        {
                            y = pixelValue;
                            height = userImage.bitmap.height - pixelValue;
                            width = userImage.bitmap.width;
                            directioDetail = "top";
                        }
                    }

                    userImage.crop(x, y, width, height);
    
                    const file = "TempStorage/" + shortid.generate() + ".png"
                    userImage.write(file, function(error){
                        if(error) { console.log(error); return;};
                        console.log(file);
                        message.channel.send("***Cropped out " + pixelValue + " pixels from the " + directioDetail + " of the image.***", {
                            files: [file]
                        }).then(function(){
                            
                            fs.remove(file, resultHandler);

                        }).catch(function (err) {
                            message.channel.send("Error - " + err.message).catch(error => {console.log("Send Error - " + error); });
                            console.log(err.message);
                            
                            fs.remove(file, resultHandler);

                        });
                        console.log("Message Sent");
                    })
                }).catch(function (err) {
                    message.channel.send("Error - " + err.message).catch(error => {console.log("Send Error - " + error); });
                    console.log(err.message);
                    
                }); 
            }).catch(function (err) {
                message.channel.send("Error - " + err.message).catch(error => {console.log("Send Error - " + error); });
                console.log(err.message);
                
            });
        }
        else if((userOption.toString().toLowerCase() == "avatar" || otherUser) && (direction != "" && pixels != ""))
        {
            var promises = []

            if(otherUser)
            {
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
                url = message.author.avatarURL;
            }

            Promise.all(promises).then(() => {
                
                Jimp.read(url).then(function (userImage) {
                    console.log("got avatar");
                    
                    var x = 0;
                    var y = 0;
                    var width = 0;
                    var height = 0;
                    var directioDetail = "";

                    var pixelValue = parseInt(pixels);

                    if(direction.toLowerCase() == "right")
                    {
                        if(pixelValue >= userImage.bitmap.width || pixelValue <= 0)
                        {
                            message.channel.send("<@" + message.author.id + "> The pixel parameter given must be less than the width of the given image and greater than 0 for a right directional crop. You have given a value of " + pixelValue + " for an image with a resolution of " + userImage.bitmap.width + "x" + userImage.bitmap.height + ". Use `" + commandPrefix + "help crop` for help.").catch(error => {console.log("Send Error - " + error); });
                            
                            return;
                        }
                        else
                        {
                            x = pixelValue;
                            height = userImage.bitmap.height;
                            width = userImage.bitmap.width - pixelValue;
                            directioDetail = "left side";
                        }
                    }
                    else if(direction.toLowerCase() == "left")
                    {
                        if(pixelValue >= userImage.bitmap.width || pixelValue <= 0)
                        {
                            message.channel.send("<@" + message.author.id + "> The pixel parameter given must be less than the width of the given image and greater than 0 for a left directional crop. You have given a value of " + pixelValue + " for an image with a resolution of " + userImage.bitmap.width + "x" + userImage.bitmap.height + ". Use `" + commandPrefix + "help crop` for help.").catch(error => {console.log("Send Error - " + error); });
                            
                            return;
                        }
                        else
                        {
                            height = userImage.bitmap.height;
                            width = userImage.bitmap.width - pixelValue;
                            directioDetail = "right side";
                        }
                    }
                    else if(direction.toLowerCase() == "up")
                    {
                        if(pixelValue >= userImage.bitmap.height || pixelValue <= 0)
                        {
                            message.channel.send("<@" + message.author.id + "> The pixel parameter given must be less than the height of the given image and greater than 0 for a upper directional crop. You have given a value of " + pixelValue + " for an image with a resolution of " + userImage.bitmap.width + "x" + userImage.bitmap.height + ". Use `" + commandPrefix + "help crop` for help.").catch(error => {console.log("Send Error - " + error); });
                            
                            return;
                        }
                        else
                        {
                            height = userImage.bitmap.height - pixelValue;
                            width = userImage.bitmap.width;
                            directioDetail = "bottom";
                        }
                    }
                    else if(direction.toLowerCase() == "down")
                    {
                        if(pixelValue >= userImage.bitmap.height || pixelValue <= 0)
                        {
                            message.channel.send("<@" + message.author.id + "> The pixel parameter given must be less than the height of the given image and greater than 0 for a downward directional crop. You have given a value of " + pixelValue + " for an image with a resolution of " + userImage.bitmap.width + "x" + userImage.bitmap.height + ". Use `" + commandPrefix + "help crop` for help.").catch(error => {console.log("Send Error - " + error); });
                            
                            return;
                        }
                        else
                        {
                            y = pixelValue;
                            height = userImage.bitmap.height - pixelValue;
                            width = userImage.bitmap.width;
                            directioDetail = "top";
                        }
                    }

                    userImage.crop(x, y, width, height);
    
                    const file = "TempStorage/" + shortid.generate() + ".png"
                    userImage.write(file, function(error){
                        if(error) { console.log(error); return;};
                        console.log(file);
                        message.channel.send("***Cropped out " + pixelValue + " pixels from the " + directioDetail + " of the image.***", {
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
            }).catch((e) => {
                console.log("User Data Error - " + e.message);
                message.channel.send("User data not found").catch(error => console.log("Send Error - " + error));
            });
        }
        else
        {
            if(direction == "")
            {
                message.channel.send("<@" + message.author.id + "> No direction parameter given, use `" + commandPrefix + "help crop` for help.").catch(error => {console.log("Send Error - " + error); });
            }
            else if(pixels == "")
            {
                message.channel.send("<@" + message.author.id + "> No pixel parameter given, use `" + commandPrefix + "help crop` for help.").catch(error => {console.log("Send Error - " + error); });
            }

            
        }
    }
}

module.exports = CropCommand;
