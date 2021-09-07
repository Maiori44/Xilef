const { RequiredArg, Command } = require("./commands");
const VM = require('vm');
const { inspect } = require("util");
const Discord = require("discord.js");

const globals = {
  WebAssembly,
  assert: require('assert'),
  buffer: require('buffer'),
  crypto: require('crypto'),
  events: require('events'),
  path: require('path'),
  perf_hooks: require('perf_hooks'),
  stream: require('stream'),
  string_decoder: require('string_decoder'),
  timers: require('timers'),
  url: require('url'),
  util: require('util'),

  DEBUG: {
    AVAILABLE_MODULES: [
      'assert', 'buffer',
      'crypto', 'events',
      'path', 'perf_hooks',
      'stream', 'string_decoder',
      'timers', 'url', 'util'
    ]
  }
};

const description = [
  ' & eval but better',
  String(),
  'Example:',
  '&debug \\`\\`\\`js',
  '1 + 1',
  '\\`\\`\\`'
].join('\n');

Commands.debug = new Command(description, (/** @type {Discord.Message} */ message) => {
  try {
    /** @type {string} */
    const code = message.content
      .slice(Prefix.get(message.guild.id).length + 5)
      .match(/```js\n([^]*)\n```/)?.[1] ?? String();

    const result = inspect(evaluate(code, {...globals, message})).split('\n');
    /** @type {string[]} */
    const pages = [];

    for (let i = 0, charc = 0,/** @type {string[]} */ stack = []; i < result.length; i++) {
      const line = result[i];
      if (charc + line.length > 3950) {
        pages.push(stack.join('\n'));
        stack = [];
        charc = 0;
      }
      stack.push(line);
      charc += line.length;
      if (i == result.length - 1) {
        pages.push(stack.join('\n'));
        stack = [];
        charc = 0;
      }
    }

    pages.map(
      page => new Discord.MessageEmbed()
        .setColor('#0368f8')
        .setDescription('```js\n' + page + '\n```')
    ).forEach((page)=> message.channel.send(page))

  } catch (error) {
    console.error(error);
    message.channel.send(
      new Discord.MessageEmbed()
        .setColor('RED')
        .setTitle('error - debug')
        .setDescription('```\n' + error + '\n```')
    );
  }
}, 'Developer', [new RequiredArg(0, 'No code supplied.', 'code block', false)]);

/**
 * **Evaluate a JavaScript code using node's `vm` module.**
 *
 * @param {string} code - The code string to evaluate.
 * @param {VM.Context} [globals] - Globals to put. May be used to override other variables.
 * @returns - The result of the last expression in the code. May be a {@link Promise}.
 */
function evaluate(code, globals) {
  const context = {
    ...globals
  };

  return new VM.Script(code, {
    filename: 'evaluate',
  }).runInNewContext(context, {
    breakOnSigint: true,
  });
}

const NewProcess = require('child_process').spawn

Commands.shutdown = new Command("Shuts down the bot after a given time\nDeveloper only", (message, args) => {
    if (message.author.id != "621307633718132746") throw ("Sorry, this command is for the bot owner only")
    if (args[0]) {
        warning = args[0]
        client.user.setActivity(args[0] + ", ping me for info")
    }
    const timeleft = parseFloat(args[1]) * 60 * 1000
    console.log("- " + Colors.cyan.colorize("Shutdown initiated:") +
        "\n\tTime left: " + (timeleft ? (timeleft / 1000) + " seconds" : Colors.hyellow.colorize("None")) +
        "\n\tReason: " + (args[0] || Colors.hyellow.colorize("None")) +
        "\n\tRestart?: " + (args[2] ? "true" : "false"))
    setTimeout(() => {
        console.log("- Shutting down...")
        message.channel.send("Shutting down...").then(() => {
            if (args[2]) {
                NewProcess("cmd.exe", ["/c", debugmode ? "testbot.bat" : "startbot.bat"], { detached: true })
                setTimeout(() => message.channel.send("Bot restarted successfully").then(() => process.exit(0), 2500))
            } else process.exit(0)
        })
    }, timeleft || 0)
}, "Developer", [
    new RequiredArg(0, undefined, "message", true),
    new RequiredArg(1, undefined, "time", true),
    new RequiredArg(2, undefined, "restart?", true)
])

Commands.restart = new Command("Restarts the bot\n(internally calls `&shutdown`)", (message, args) => {
    Commands.shutdown.call(message, ["The bot is currently restarting", 0, true])
}, "Developer")