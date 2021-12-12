const { MessageEmbed, MessageAttachment, MessageActionRow, MessageButton } = require('discord.js')
const fs = require('fs');
const { inspect } = require('util');
const { Colors, Prefix } = require('./constants.js');

class RequiredArg {
    constructor(argnum, errormsg, name, notrequired) {
        this.argnum = argnum
        this.errormsg = errormsg
        this.name = name
        this.notrequired = notrequired
    }

    check(args) {
        if (this.notrequired || args[this.argnum]) { return true }
        return false
    }
}

class Command {
    constructor(description, action, category, requiredargs, link) {
        this.description = description
        this.action = action
        this.category = category
        this.requiredargs = requiredargs
        this.link = link
        console.log("- " + Colors.green.colorize("Loaded command ") + Colors.hgreen.colorize((Object.keys(Commands).length + 1) + "/42"))
    }

    call(message, args) {
        if (this.category == "Developer") {
            const isdev = message.author.client.guilds.cache.get('875695405550166106')
                .members.cache.get(message.author.id)
                ?.roles.cache.has("875699796139208724")
            if (!isdev) {
                throw ("Only my developers can use this command")
            }
        }
        if (this.requiredargs)
            for (const arg of this.requiredargs)
                if (!arg.check(args)) throw { msg: arg.errormsg.replace(/\&/g, Prefix.get(message.guild.id)), name: arg.name, num: arg.argnum }

        this.action(message, args)
    }
}
const Commands = {}

module.exports = {
    Commands,
    Command,
    RequiredArg
}

var normalizedPath = require("path").join(__dirname, "./Commands");

fs.readdirSync(normalizedPath).forEach(function(file) {
  require("./Commands/" + file);
});
