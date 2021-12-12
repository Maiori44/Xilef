const { Command, Commands, RequiredArg } = require('../commands.js');

//math commands

Commands.dice = new Command("Gives you a number from 1 to 6, and maybe judge your result", (message) => {
    let randomnum = Math.ceil(Math.random() * 6)
    message.channel.send(message.author.username + " rolled " + randomnum)
    switch (randomnum) {
        case 1:
            message.channel.send("boy you suck")
            break
        case 6:
            message.channel.send("damn u lucky")
            break
    }
}, "Math")

Commands.clown = new Command("Given a person or a thing, the bot will say how much of a clown it is", (message, args) => {
    let name = args[0] || message.author.username
    let clownvalue = name.length + (Date.now() % 50)
    for (var i = 0; i < name.length; i++) {
        clownvalue = clownvalue + name.charCodeAt(i)
    }
    clownvalue = (clownvalue % 1000) / 10
    message.channel.send(name + " is a clown at " + clownvalue + "%")
    switch (Math.floor(clownvalue)) {
        case 0:
            message.channel.send("Wow, " + name + " is not a clown, " + name + " is an absolute chad")
            break
        case 69:
            message.channel.send("Noice.")
            break
        case 99:
            message.channel.send("Wow, " + name + " is not a clown, " + name + " is the entire circus")
            break
    }
}, "Math", [new RequiredArg(0, "You're a clown at 100%, since you didn't even give me something or someone", "something")])

const { evaluate } = require('../developer');

Commands.eval = new Command("Evaluates the given args as JavaScript code, and returns the output", (message, args) => {
    try {
        const EVAL = {
            AVAILABLE_MODULES: [
                'buffer', 'path',
                'stream', 'string_decoder',
                'url', 'util'
            ]
        };

        const code = message.content.match(/```(?:js|javascript)\n([^]*)\n```/i)?.[1]
            ?? args.join(" ")

        const output = evaluate(code, {
            EVAL, console: undefined // set to undefined because the
            // default one doesnt even work
        }, {
            stdlibs: EVAL.AVAILABLE_MODULES,
            timeout: 2000
        });
        message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor("#0368f8")
                    .setTitle("Output")
                    .setDescription("```js\n" +
                        (typeof output === 'string' ? output : inspect(output))
                        + "\n```")
                    .setTimestamp()
            ]
        })
    } catch (error) {
        message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor("#FF0000")
                    .setTitle("An error occured:")
                    .setDescription(`${error.name}: ${error.message}`)
                    .setTimestamp()
            ]
        })
    }
}, "Math", [new RequiredArg(0, "You have to evalute *something*", "...code")])
