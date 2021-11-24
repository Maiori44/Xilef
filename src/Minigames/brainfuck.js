const { DiscordAPIError } = require("discord.js");
const { RequiredArg, Command } = require("./../commands.js")
const { Game } = require("./../minigames.js")

class BrainfuckGame {
    constructor () {

    }
}

Brainfuck = new Game(() => { return new BrainfuckGame() })
Brainfuck.run = (code) => {
    if (!code) throw "No code will give no result"
    const memory = [0]
    const started = Date.now()
    let pointer = 0
    let output = ""
    for (let i = 0; i < code.length && i >= 0; i++) {
        if (Date.now() - started >= Time.second * 30) throw "Too much time passed..."
        const char = code[i]
        switch (char) {
            case "+": memory[pointer] = (memory[pointer] + 1) % 256; break
            case "-": memory[pointer] = memory[pointer] == 0 ? 255 : memory[pointer] - 1; break
            case "<": pointer--; memory[pointer] = memory[pointer] ?? 0; break
            case ">": pointer++; memory[pointer] = memory[pointer] ?? 0; break
            case "[": {
                if (memory[pointer] != 0) break
                i++
                while (i < code.length) {
                    if (code[i] == "]") break
                    i++
                }
                break
            }
            case "]": {
                if (memory[pointer] == 0) break
                i--
                while (i > 0) {
                    if (code[i] == "[") break
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
        memstr += "[" + n + "] = " + memory[n] + "\n"
    }
    memstr += "```"
    ResultEmbed.addField("Memory:", memstr)
    return ResultEmbed
}
Brainfuck.help = 
    "`&brainfuck show` shows the current challenge\n" + 
    "`&brainfuck skip` skips the current challenge\n" +
    "`&brainfuck solve (code)` tries to solve the challenge with the given code\n" +
    "`&brainfuck sandbox (code)` runs any given code"

Commands.brainfuck = new Command("Solve challenges with this esoteric language\n\n" + Brainfuck.help, (message, args) => {
    
    switch (args[0]) {
        case "sandbox": {
            message.channel.send({ embeds: [Brainfuck.run(args[1])] })
            break
        }
    }
}, "Game", [new RequiredArg(0, Brainfuck.help, "command"), new RequiredArg(1, undefined, "code", true)], "https://en.wikipedia.org/wiki/Brainfuck")