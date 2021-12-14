const { RequiredArg, Command, Commands } = require("../../commands.js")
const { Time } = require('../../constants.js')
const { MessageEmbed } = require('discord.js')

const brainfuck = {
    run(code, input) {
        if (!code) throw "No code will give no result"
        const memory = new Uint8Array(100)
        const started = Date.now()
        let pointer = 0
        let output = ""
        for (let i = 0; i < code.length && i >= 0; i++) {
            if (Date.now() - started >= Time.second * 30) throw "Too much time passed..."
            const char = code[i]
            switch (char) {
                case "+": memory[pointer] += 1; break
                case "-": memory[pointer] -= 1; break
                case ">": pointer = (pointer + 1) % 101; break
                case "<": pointer = pointer == 0 ? 100 : pointer - 1; break
                case "[": {
                    if (memory[pointer] != 0) break
                    let scope = 0
                    i++
                    while (i < code.length) {
                        if (code[i] == "]") {
                            if (scope == 0) break
                            scope--
                        }
                        if (code[i] == "[") scope++
                        i++
                    }
                    break
                }
                case "]": {
                    if (memory[pointer] == 0) break
                    let scope = 0
                    i--
                    while (i > 0) {
                        if (code[i] == "[") {
                            if (scope == 0) break
                            scope--
                        }
                        if (code[i] == "]") scope++
                        i--
                    }
                    break
                }
                case ".": output += String.fromCharCode(memory[pointer]); break
                case ",": { 
                    const char = input?.shift() ?? ""
                    memory[pointer] = char.charCodeAt()
                    break
                }
            }
        }
        const ResultEmbed = new MessageEmbed()
            .setColor("#0368f8")
            .setTitle("Brainfuck code results:")
            .setFooter("code ran in " + Time.convertTime(Date.now() - started))
        if (output != "") ResultEmbed.addField("Output:", "```" + output + "```")
        let memstr = "```js\n"
        for (let n in memory) {
            if (memory[n] == 0) continue
            memstr += "[" + n + "] = " + memory[n] + "\n"
        }
        memstr += memstr != "```js\n" ? "```" : "//memory is empty...\n```"
        ResultEmbed.setDescription(`**Memory:** ${memstr}`)
        return [ResultEmbed, output == this.sentence]
    },
    sentence: Math.random().toString(36).substr(2, 5),
    help:
        "`&brainfuck show` shows the current challenge\n" + 
        "`&brainfuck solve (code)` tries to solve the challenge with the given code\n" +
        "`&brainfuck sandbox (code) [input]` runs any given code"
}

Commands.brainfuck = new Command("Solve challenges with this esoteric language\n\n" + brainfuck.help, (message, args) => {
    switch (args[0]) {
        case "show": {
            message.channel.send(`Figure out how to output the string "${brainfuck.sentence}" using as less instructions as possible`)
            break
        }
        case "solve": {
            const time = Date.now()
            const EconomySystem = Economy.getEconomySystem(message.author)
            const diff = time - EconomySystem.bftime
            if (diff < Time.minute * 2) {
                message.channel.send(`You already completed a BrainFuck challenge recently...come back in ${Time.convertTime(Time.minute * 2 - diff)}`)
                break
            }
            const code = args[1] || ""
            const [ResultEmbed, isCorrect] = brainfuck.run(code)
            message.channel.send({embeds: [ResultEmbed]})
            if (isCorrect) {
                message.channel.send("You completed the BrainFuck challenge!")
                EconomySystem.give(Math.floor(brainfuck.sentence.length / code.length * 100000), message)
                brainfuck.sentence = Math.random().toString(36).substr(2, Math.ceil(Math.random() * 10))
                break
            } else message.channel.send(`Sadly, the output is not the desired one (${brainfuck.sentence})`)
            EconomySystem.bftime = time
            break
        }
        case "sandbox": {
            const [ResultEmbed, isCorrect] = brainfuck.run(args[1] || "", [...args[2] ?? ""])
            message.channel.send({embeds: [ResultEmbed]})
            if (isCorrect) {
                message.channel.send("Hey! are you trying to figure out the solution to the challenge!?\njust to be sure I won't let you submit this answer for 20 minutes")
                Economy.getEconomySystem(message.author).bftime = Date.now() + Time.minute * 10
            }
            break
        }
        default: {
            message.channel.send(brainfuck.help.replace(/\&/g, Prefix.get(message.guild.id)))
            return
        }
    }
}, "Game", [new RequiredArg(0, brainfuck.help, "command"), new RequiredArg(1, undefined, "code", true)], "https://en.wikipedia.org/wiki/brainfuck")