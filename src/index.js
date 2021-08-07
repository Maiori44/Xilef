require("dotenv").config() //setup the .env
Discord = require("discord.js") //takes the discord api or something

client = new Discord.Client(); //makes a new client
client.login(process.env.TOKEN); //logins in the client

const prefix = "&" //defines the bot prefix

Date.day = 86400000
Date.hour = 3600000

GetPercentual = () => {
    return Math.floor(Math.random() * 101)
}

require("./economy.js")
require("./commands.js")
require("./buttons.js")
require("./minigames.js")

client.on("ready", () => console.log("Bot ready"));
client.on("message", (message) => { //function called when a message is sent
    if (message.author.bot) return
    if (message.content.startsWith(prefix)) {
        // create a regular expresion that matches either any string inside of double quotes, or any string without spaces that is outside of double quotes
        let regex = /"([^"]*?)"|[^ ]+/gm
        // make the output of .matchAll into an array, since .matchAll returns an iterator
        // then map each value (an array that contains strings or null) into a single string
        // index 0 being the full match, and the rest being the capturing groups
        let args = [...message.content.slice(prefix.length).matchAll(regex)]
        .map(el => el[1] || el[0] || "")
        let command = args.shift().toLowerCase()
        if (command == "") {
            message.channel.send('Wow great command, " ", makes complete sense')
            return
        } else if (Commands[command]) {
            try {
                Commands[command.toLowerCase()].call(message, args)
                Economy.save()
            } catch (errormsg) {
                message.channel.send(errormsg.toString().slice(0, 1900))
                console.error(errormsg)
            }
        } else {
            message.channel.send("That command doesn't exist buddy, use `&help` for a list of commands")
        }
    }
})