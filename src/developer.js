const { RequiredArg, Command } = require("./commands");

const Discord = require("discord.js");
const { Console } = require("console");
const { inspect } = require("util");
const Stream = require("stream");
const VM = require('vm')

const globals = {
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
  '&eval but better',
  String(),
  'Example:',
  '&debug \\`\\`\\`js',
  '1 + 1',
  '\\`\\`\\`'
].join('\n');

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

Commands.debug = new Command(description, (/** @type {Discord.Message} */ message) => {
  try {
    /** @type {string} */
    const code = message.content
      .slice(Prefix.get(message.guild.id).length + 5)
      .match(/```js\n([^]*)\n```/)?.[1] ?? String();

    /** @type {string[]} */
    const stdout = []
    /** @type {string[]} */
    const stderr = []

    const context = {
      message,
      console: new Console(
        new Stream.Writable({ // stdout
          write(chunk, encoding, callback) {
            stdout.push(chunk);
            callback(null)
          }
        }),
        new Stream.Writable({ // stderr
          write(chunk, encoding, callback) {
            stderr.push(chunk);
            callback(null)
          }
        })
      ),
    }

    const result = evaluate(code, { ...globals, ...context });

    if (!(result == undefined && stdout.length != 0 || stderr.length != 0)) {
      const expression = inspect(result).split('\n');
      /** @type {string[]} */
      const expressionPages = [];

      for (let i = 0, charc = 0,/** @type {string[]} */ stack = []; i < expression.length; i++) {
        const line = expression[i];
        if (charc + line.length > 3950) {
          expressionPages.push(stack.join('\n'));
          stack = [];
          charc = 0;
        }
        stack.push(line);
        charc += line.length;
        if (i == expression.length - 1) {
          expressionPages.push(stack.join('\n'));
          stack = [];
          charc = 0;
        }
      }

      const expressionEmbeds = expressionPages.map(
        page => new Discord.MessageEmbed()
          .setColor('#0368f8')
          .setDescription('```js\n' + page + '\n```')
      )

      expressionEmbeds[0].setTitle('expression')

      for (const embed of expressionEmbeds) message.channel.send(embed)
    }

    if (stdout.length != 0) {
      const stdoutString = stdout.join('\n').split('\n')

      /** @type {string[]} */
      const stdoutPages = [];

      for (let i = 0, charc = 0,/** @type {string[]} */ stack = []; i < stdoutString.length; i++) {
        const line = stdoutString[i];
        if (charc + line.length > 3950) {
          stdoutPages.push(stack.join('\n'));
          stack = [];
          charc = 0;
        }
        stack.push(line);
        charc += line.length;
        if (i == stdoutString.length - 1) {
          stdoutPages.push(stack.join('\n'));
          stack = [];
          charc = 0;
        }
      }

      const stdoutEmbeds = stdoutPages.map(
        page => new Discord.MessageEmbed()
          .setColor('#0368f8')
          .setDescription('```js\n' + page + '\n```')
      )

      stdoutEmbeds[0].setTitle('stdout')

      for (const embed of stdoutEmbeds) message.channel.send(embed)
    }

    if (stderr.length != 0) {
      const stderrString = stderr.join('\n').split('\n')

      /** @type {string[]} */
      const stderrPages = [];

      for (let i = 0, charc = 0,/** @type {string[]} */ stack = []; i < stderrString.length; i++) {
        const line = stderrString[i];
        if (charc + line.length > 3950) {
          stderrPages.push(stack.join('\n'));
          stack = [];
          charc = 0;
        }
        stack.push(line);
        charc += line.length;
        if (i == stderrString.length - 1) {
          stderrPages.push(stack.join('\n'));
          stack = [];
          charc = 0;
        }
      }

      const stderrEmbeds = stderrPages.map(
        page => new Discord.MessageEmbed()
          .setColor('#0368f8')
          .setDescription('```js\n' + page + '\n```')
      )

      stderrEmbeds[0].setTitle('stderr')

      for (const embed of stderrEmbeds) message.channel.send(embed)
    }
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

const NewProcess = require('child_process').spawn;

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