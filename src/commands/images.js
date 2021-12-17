const { Command } = require('../command.js')
const { MessageAttachment } = require('discord.js')

const chadImage = new MessageAttachment("./src/commands/images/giga chad.jpg")
const amogusimage = new MessageAttachment("./src/commands/images/amogus.gif")
const sdrogoimage = new MessageAttachment("./src/commands/images/sdrogo.jpg")
const vshitimage = new MessageAttachment("./src/commands/images/vshit.png")
const uwuimage = new MessageAttachment("./src/commands/images/uwu.png")
const horseimages = [
    new MessageAttachment("./src/commands/images/Horse/horse1.jpg"),
    new MessageAttachment("./src/commands/images/Horse/horse2.jpg"),
    new MessageAttachment("./src/commands/images/Horse/horse3.jpg"),
    new MessageAttachment("./src/commands/images/Horse/horse4.jpg"),
    new MessageAttachment("./src/commands/images/Horse/horse5.jpg"),
]

module.exports = [
    new Command({
        name: "chad",
        description: "Sends a beautiful giga chad",
        category: "Images",
        async run(message, args) {
            message.channel.send({
                content: "epik",
                files: [chadImage]
            })
        }
    }),
    new Command({
        name: "amogus",
        description: "It's pretty sus",
        category: "Images",
        async run(message, args) {
            message.channel.send({
                content: "sus",
                files: [amogusimage]
            })
        }
    }),
    new Command({
        name: "sdrogo",
        description: "Sdrogo man is da wae",
        category: "Images",
        async run(message, args) {
            message.channel.send({
                content: "hm yes",
                files: [sdrogoimage]
            })
        }
    }),
    new Command({
        name: "vshit",
        description: "Vsauce here",
        category: "Images",
        async run(message, args) {
            message.channel.send({
                content: "hey vsauce, Michael here, could you get out of my bathroom?",
                files: [vshitimage]
            })
        }
    }),
    new Command({
        name: "uwu",
        description: "Sends a super cute kawaii image ^w^",
        category: "Images",
        async run(message, args) {
            message.channel.send({
                content: ":3",
                files: [uwuimage]
            })
        }
    }),
    new Command({
        name: "horse",
        description: "Sends a random horse photo, idk why i made this",
        category: "Images",
        async run(message, args) {
            let selection = Math.floor(Math.random() * 6)
            message.channel.send({
                content: "have a horse i guess",
                files: [horseimages[selection]]
            })
        }
    }),
    new Command({
        name: "whoasked",
        description: "Finds the person who asked with the brand new OmegaSearch algorithm",
        category: "Images",
        async run(message, args) {
            message.channel.send("https://tenor.com/view/meme-who-asked-satellite-looking-radar-gif-17171784")
            message.channel.send("Asking neighbours if they know who asked...")
            setTimeout(() => { message.channel.send("Asking the government if they know who asked...") }, 3000)
            setTimeout(() => { message.channel.send("Asking the aliens if they know who asked...") }, 6000)
            setTimeout(() => { message.channel.send("Asking god if they know who asked...") }, 9000)
            setTimeout(() => { message.channel.send("Asking google if they know who asked...") }, 12000)
            setTimeout(() => { message.channel.send("Yeah no, nobody asked.") }, 15000)
        }
    }),
]