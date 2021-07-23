require("dotenv").config() //setup the .env
const Discord = require("discord.js") //takes the discord api or something

const client = new Discord.Client(); //makes a new client
client.login(process.env.TOKEN); //logins in the client

const prefix = "&" //defines the bot prefix

require("./economy.js")
require("./commands.js")

client.on("ready", () => console.log("Bot ready"));
client.on("message", (message) => { //function called when a message is sent
    if (message.author.bot) return
    if (message.content.startsWith(prefix)) {
        let args = message.content.substr(1).split(" ")
        let command = args.shift()
        if (command == "") {
            message.channel.send('Wow great command, " ", makes complete sense')
            return
        }
        else if (Commands[command]) {
            try {
                Commands[command].call(message, args)
            } catch (errormsg) {
                message.channel.send(errormsg.toString().slice(0, 1900))
                console.error(errormsg)
            }
        }
        else {
            message.channel.send("Breaking news " + message.author.username + " is officially an idiot, that command doesn't exist")
        }
    }
})