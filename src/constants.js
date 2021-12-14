require("dotenv").config();

const { Client, Intents, MessageActionRow, MessageButton } = require('discord.js')
const fs = require('fs')

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS ,
    ]
})

const Time = {
    day: 86400000,
    hour: 3600000,
    minute: 60000,
    second: 1000,
    convertTime(time) {
        if (time < time.second) return time + " milliseconds"
        else if (time < time.minute) return (Math.floor(time / time.second)) + " seconds"
        else if (time < time.hour) return (Math.floor(time / time.minute)) + " minutes"
        else if (time < time.day) return (Math.floor(time / time.hour)) + " hours"
        else return (Math.floor(time / time.day)) + " days"
    }
}

class Colorizer {
    constructor(color) {
        this.color = color
    }

    colorize(text) {
        return this.color + text + Colors.white.color + Colors.hblack.color
    }
}

const Colors = {
    white: new Colorizer("\033[97m"),
    green: new Colorizer("\x1B[92m"),
    red: new Colorizer("\x1B[31m"),
    blue: new Colorizer("\x1B[34m"),
    yellow: new Colorizer("\x1B[33m"),
    purple: new Colorizer("\x1B[35m"),
    cyan: new Colorizer("\x1B[36m"),
    hblack: new Colorizer("\x1B[40m"),
    hred: new Colorizer("\x1B[41m"),
    hgreen: new Colorizer("\x1B[42m"),
    hyellow: new Colorizer("\x1B[43m"),
    hblue: new Colorizer("\x1B[44m"),
    hpurple: new Colorizer("\x1B[45m"),
    hcyan: new Colorizer("\x1B[46m"),
}

const GetPercentual = () => {
    return Math.floor(Math.random() * 101)
}

const isDebugging = (process.argv[2] == "-debug" ? true : false);

const Prefix = {
    /**
     * @param {string} guildID
     * @returns {string} - The guild's prefix. fallbacks to the global prefix (client.prefix)
     */
    get(guildID) {
      return isDebugging ? "beta&" : (this.read()[guildID] ?? client.prefix)
    },
  
    /**
     * Gets the whole prefixes.json
     * @returns {{[string in string]: string}}
     */
    read() {
      return JSON.parse(fs.readFileSync("./src/Data/prefixes.json", "utf8"))
    }
}

const Buttons = new MessageActionRow({
    components: [
        new MessageButton()
            .setStyle("LINK")
            .setURL("https://github.com/Felix-44/Xilef")
            .setLabel("Github page"),
        new MessageButton()
            .setStyle("LINK")
            .setURL("https://discord.gg/Qyz5HgrxWg")
            .setLabel("Official server"),
        new MessageButton()
            .setStyle("LINK")
            .setURL("https://discord.com/api/oauth2/authorize?client_id=852882606629847050&permissions=275415091200&scope=bot")
            .setLabel("Invite bot"),
    ]
});

module.exports = {
    client,
    Time,
    Prefix,
    Colors,
    GetPercentual,
    isDebugging,
    Buttons
}