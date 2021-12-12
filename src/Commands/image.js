const { Commands, Command } = require('../commands.js');
const { MessageAttachment } = require('discord.js');
//images commands

const chadimage = new MessageAttachment("../src/Pictures/giga chad.jpg")

Commands.chad = new Command("Sends a beautiful giga chad", (message, args) => {
    message.channel.send("epik")
    message.channel.send({ files: [chadimage] })
}, "Images")

const amogusimage = new MessageAttachment("../src/Pictures/amogus.gif")

Commands.amogus = new Command("It's pretty sus", (message, args) => {
    message.channel.send("sus")
    message.channel.send({ files: [amogusimage] })
}, "Images")

const sdrogoimage = new MessageAttachment("../src/Pictures/sdrogo.jpg")

Commands.sdrogo = new Command("Sdrogo man is da wae", (message, args) => {
    message.channel.send("hm yes")
    message.channel.send({ files: [sdrogoimage] })
}, "Images")

const vshitimage = new MessageAttachment("../src/Pictures/vshit.png")

Commands.vshit = new Command("Vsauce here", (message, args) => {
    message.channel.send("hey vsauce, Michael here, could you get out of my bathroom?")
    message.channel.send({ files: [vshitimage] })
}, "Images")

const uwuimage = new MessageAttachment("../src/Pictures/uwu.png")

Commands.uwu = new Command("Sends a super cute kawaii image ^w^", (message, args) => {
    message.channel.send(":3")
    message.channel.send({ files: [uwuimage] })
}, "Images")

const horseimages = [
    new MessageAttachment("../src/Pictures/Horse/horse1.jpg"),
    new MessageAttachment("../src/Pictures/Horse/horse2.jpg"),
    new MessageAttachment("../src/Pictures/Horse/horse3.jpg"),
    new MessageAttachment("../src/Pictures/Horse/horse4.jpg"),
    new MessageAttachment("../src/Pictures/Horse/horse5.jpg"),
]

Commands.horse = new Command("Sends a random horse photo, idk why I made this", (message, args) => {
    message.channel.send("have a horse I guess")
    let horse = Math.floor(Math.random() * 6)
    message.channel.send({ files: [horseimages[horse]] })
}, "Images")

Commands.whoasked = new Command("Finds out the person who asked", (message, args) => {
    message.channel.send("https://tenor.com/view/meme-who-asked-satellite-looking-radar-gif-17171784")
    message.channel.send("Asking neighbours if they know who asked...")
    setTimeout(() => { message.channel.send("Asking the government if they know who asked...") }, 3000)
    setTimeout(() => { message.channel.send("Asking the aliens if they know who asked...") }, 6000)
    setTimeout(() => { message.channel.send("Asking god if they know who asked...") }, 9000)
    setTimeout(() => { message.channel.send("Asking google if they know who asked...") }, 12000)
    setTimeout(() => { message.channel.send("Yeah no, nobody asked.") }, 15000)
}, "Images")
