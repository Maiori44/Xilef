const { RequiredArg, Command } = require("./../commands.js")

Brainfuck = {
    run(code) {
        if (!code) throw "No code will give no result"
        const memory = new Uint8Array(100)
        const started = Date.now()
        let pointer = 0
        let output = ""
        for (let i = 0; i < code.length && i >= 0; i++) {
            if (Date.now() - started >= Time.second * 30) throw "Too much time passed..."
            const char = code[i]
            switch (char) {
                case "+": memory[pointer] = (memory[pointer] + 1) % 256; break
                case "-": memory[pointer] = memory[pointer] == 0 ? 255 : memory[pointer] - 1; break
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
            }
        }
        const ResultEmbed = new Discord.MessageEmbed()
            .setColor("#0368f8")
            .setTitle("Brainfuck code results:")
            .setDescription("code run in " + Time.convertTime(Date.now() - started))
        if (output != "") ResultEmbed.addField("Output:", "`" + output + "`")
        let memstr = "```js\n"
        for (let n in memory) {
            if (memory[n] == 0) continue
            memstr += "[" + n + "] = " + memory[n] + "\n"
        }
        memstr += "```"
        ResultEmbed.addField("Memory:", memstr)
        return [ResultEmbed, output == this.sentence]
    },
    sentence: Math.random().toString(36).substr(2, 5),
    help:
        "`&brainfuck show` shows the current challenge\n" + 
        "`&brainfuck solve (code)` tries to solve the challenge with the given code\n" +
        "`&brainfuck sandbox (code)` runs any given code"
}

Commands.brainfuck = new Command("Solve challenges with this esoteric language\n\n" + Brainfuck.help, (message, args) => {
    switch (args[0]) {
        case "show": {
            message.channel.send(`Figure out how to output the string "${Brainfuck.sentence}" using as less instructions as possible`)
            break
        }
        case "solve": {
            const time = Date.now()
            const EconomySystem = Economy.getEconomySystem(message.author)
            const diff = time - EconomySystem.bftime
            if (diff < Time.minute * 10) {
                message.channel.send(`You already completed a BrainFuck challenge recently...come back in ${Time.convertTime(Time.minute * 10 - diff)}`)
                break
            }
            const code = args[1] || ""
            const [ResultEmbed, isCorrect] = Brainfuck.run(code)
            message.channel.send({embeds: [ResultEmbed]})
            if (isCorrect) {
                message.channel.send("You completed the BrainFuck challenge!")
                EconomySystem.give(Brainfuck.sentence.length / code.length * 100000, message)
                Brainfuck.sentence = Math.random().toString(36).substr(2, Math.ceil(Math.random() * 10))
                break
            } else message.channel.send(`Sadly, the output is not the desired one (${Brainfuck.sentence})`)
            EconomySystem.bftime = time
            break
        }
        case "sandbox": {
            const [ResultEmbed, isCorrect] = Brainfuck.run(code)
            message.channel.send({embeds: [ResultEmbed]})
            if (isCorrect) {
                message.channel.send("Hey! are you trying to figure out the solution to the challenge!?\njust to be sure I won't let you submit this answer for 20 minutes")
                Economy.getEconomySystem(message.author).bftime = Date.now() + Time.minute * 10
            }
            break
        }
        default: {
            message.channel.send(Brainfuck.help.replace(/\&/g, Prefix.get(message.guild.id)))
            return
        }
    }
}, "Game", [new RequiredArg(0, Brainfuck.help, "command"), new RequiredArg(1, undefined, "code", true)], "https://en.wikipedia.org/wiki/Brainfuck")