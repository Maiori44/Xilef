const { RequiredArg, Command } = require("./commands");

const Discord = require("discord.js");
const { Console } = require("console");
const { inspect } = require("util");
const { serialize, deserialize } = require("v8");
const Stream = require("stream");
const {Buffer} = require('buffer');
const VM = require('vm')
const childProcess = require('child_process');

function hasOwnProperty(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

const globals = {
  DEBUG: {
    AVAILABLE_MODULES: [
      'assert', 'buffer',
      'crypto', 'events',
      'path', 'perf_hooks',
      'stream', 'string_decoder',
      'timers', 'url', 'util'
    ]
  },
};

/** @param {string} code */
async function preprocess(code, extras) {
  function parseDirectives(code) {
    return code.split('\n')
    .reduce((directives, line, index) => {
      if (line.startsWith('// #')) {
        return directives.concat({ value: line, loc: index });
      } else return directives;
    }, []);
  }

  const directivesGathered = parseDirectives(code);
  if (debugmode) console.log(directivesGathered);

  let preprocessed = code
  for (const directive of directivesGathered) {
    const [name, ...args] = directive.value.slice('// #'.length).split(/ +/g);

    if (directives.has(name)) {
      const result = await directives.get(name)(args, code, directive, extras);

      if (result != undefined) {
        const resultDirectives = parseDirectives(result);

        if (resultDirectives.length !== 0) preprocessed = await preprocess(result, extras);
        else preprocessed = result
      }
    } else throw new Error(`unknown directive: '#${name}'`);
  }

  return preprocessed
}

const directives = new Map()
  .set('include', async ([rawPath], code, line, {message}) => {
    const [, ...path] = Array.from(rawPath.match(/^<(~|\d+)\/(~|\d+)\/(~|\d+)>$/) ?? []);

    if (path.length !== 3) throw new Error('invalid include path')

    if (path[0] === '~') path[0] = message.guild.id;
    if (path[1] === '~') path[1] = message.channel.id;
    if (path[2] === '~')
      throw new Error('messageID segment cannot be relative.')

    const { content: rawIncluded } = await message.client.guilds.fetch(path[0])
      .then((guild) => guild.channels.fetch(path[1]))
      .then((channel) => channel.messages.fetch(path[2]));

    const included = rawIncluded
      .match(/```(?:js|javascript)\n([^]*)\n```/i)?.[1];

    if (included == undefined) {
      message.channel.send(`**error**: could not parse the code included.\n**hint**: you may have tried to include a plain text instead of a javascript tagged code-block.`);
      throw new Error('could not parse the code included.');
    }

    return code.replace(line.value, included);
  });

const description = /* TODO: improve numbering */ `
A more advanced, but developer-only version of \`&eval\`.

**Features**
1. access to the \`require\` function, though it is limited. this \`require\` wraps node's  \`require\`, so there are some differences:
  1.1. limited access to the stdlib.
  1.2. a custom \`debug:<name>\` namespace for debug-specific modules.
2. access to the \`message\` object.
3. access to some Xilef variables. this can is achieved using the \`debug:xilef\` custom module (See #1.2)
4. the \`DEBUG\` global object. it is a namespace for some debug information, such as:
  4.1. \`AVAILABLE_MODULES\`: lists available stdlib modules that can be accessed using \`require\`. (See #1.1)
  4.2. \`OPTIONAL_FEATURES\`: lists options enabled using the \`#enable\` directive. (See #5.1)
  4.3. \`VM_CONFIG\`: list the current vm's configuration. (See #5.2)
5. debug directives (\`// #directive\`), such as:
  5.1. \`#enable\`: enable an optional feature. it accepts these arguments:
    5.1.1. \`async\` - enable resolving a promise expression to *expression*.
    5.1.2. \`await\` - enable using await outside an async function. This is done by wrapping the code within an async function. To output to *expression*, use \`return\`. Note that it doesn't await the result, so you will still need \`#enable async\`.
  5.2. \`#vmconf\`: configure the vm used to execute the code.  it accepts these arguments:
    5.2.1. \`timeout [number=1000]\` - set the vm's timeout to be \`number\`. if \`number\` is not supplied, it defaults to 1000.
  5.3. \`#include\` - include a standalone JavaScript code-block message.  it accepts these arguments:
    5.3.1. \`<path>\` - the path of the code to be included. It must be in the format \`<guildID/channelID/messageID>\`. One can also replace segments (excluding messageID) with \`~\` if the target is in the same guild/channel.

**Notes**
- You MUST use a code block with the JavaScript language tag (either \`js\` or \`javascript\`)
- Globals that are not defined in the specification are omitted, such as \`setTimeout\`

Example:
&debug \`\`\`js
const {setTimeout} = require('timers');

// #vmconf timeout 2000
// #enable async

new Promise((resolve) => {
  setTimeout(() => {
    message.channel.send("From \`&debug\`: Hello, World!");
  }, 2100);
})
\`\`\`
`.trim()

/**
 * @typedef {object} EvaluatorOptions
 * @property {?string[]} EvaluatorOptions.stdlibs
 * @property {?Record<string, unknown>} EvaluatorOptions.customModules
 * @property {?number} EvaluatorOptions.timeout
 */

/**
 * **Evaluate a JavaScript code using node's `vm` module.**
 *
 * @param {string} code - The code string to evaluate.
 * @param {VM.Context} [globals] - Globals to put. May be used to override other variables.
 * @param {EvaluatorOptions} config - Configurations for use. Properties may include:
 * - **`stdlibs`** {`string[]`} - node standard library modules to put.
 * - **`customModules`** {`{[K: string]: unknown}`} - custom modules to put. these modules
 *   can be accessed by `require('debug:<module>')`
 * - **`timeout`** {`number`} - the timout for the vm process.
 * @returns - The result of the last expression in the code. May be a {@link Promise}.
 */
function evaluate(code, globals, config = {}) {
  const context = {
    require: new Proxy(require, {
      apply(target, thisArg, [name]) {
        if (typeof name != 'string')
          throw new TypeError("The 'id' argument must be of type string.")

        if (require('module').builtinModules.includes(name)) {
          if (config?.stdlibs?.includes(name)) {
            return Reflect.apply(target, thisArg, [name]);
          } else throw new Error(`module '${name}' is restricted`);
        } else if (name.startsWith('debug:')) {
          return config.customModules[name.slice(6).toLowerCase()]
        } else throw new Error(`module '${name}' does not exist`);
      },
      get(target, property, receiver) {
        if (['cache', 'main'].includes(property))
          return 'restricted'
        else return Reflect.get(target, property,receiver)
      }
    }),
    ...globals
  };

  return new VM.Script(code, {
    filename: 'evaluate',
  }).runInNewContext(context, {
    breakOnSigint: true,
    timeout: config.timeout ?? 1000
  });
}
module.exports.evaluate = evaluate;

/**
 * @template {Record<string, any>} O
 * @template {Array<keyof O>} K
 * @param {O} object
 * @param {K} keys
 * @returns {Pick<O, K>}
 */
function pick(object, keys) {
  /** @type {O} */
  const obj = Object(object);
  const objPrototype = Object.getPrototypeOf(obj);

  /** @type {Array<keyof O>} */
  const picked = [];
  /** @type {Array<string | number | symbol>} */
  const pickedPrototype = [];

  for (const key of keys) {
    if (hasOwnProperty(obj, key)) picked.push(key);
    else if (Reflect.has(objPrototype, key)) pickedPrototype.push(key);
    else throw new TypeError(`No such property with name '${key}'`);
  }

  return Object.create(
    pickedPrototype.length == 0
      ? objPrototype
      : pick(objPrototype, pickedPrototype),
    picked.reduce((descriptors, key) => {
      return Object.assign(descriptors, {
        [key]: Object.getOwnPropertyDescriptor(obj, key),
      });
    }, {})
  );
}

/**
 * @template {Record<string, any>} O
 * @template {Array<keyof O>} K
 * @param {O} object
 * @param {K} keys
 * @returns {Omit<O, K>}
 */
function omit(object, keys) {
  /** @type {O} */
  const obj = Object(object);
  const objPrototype = Object.getPrototypeOf(obj);
  /** @type {Array<keyof O>} */
  const omitted = [];
  /** @type {Array<string | number | symbol>} */
  const omittedPrototype = [];

  for (const key of keys) {
    if (hasOwnProperty(obj, key)) omitted.push(key);
    else if (Reflect.has(objPrototype, key)) omittedPrototype.push(key);
    else throw new TypeError(`No such property with name '${key}'`);
  }

  const picked = Object.getOwnPropertyNames(obj).filter(
    (key) => !omitted.includes(key)
  );

  return Object.create(
    omittedPrototype.length == 0
      ? objPrototype
      : this.omit(objPrototype, omittedPrototype),
    picked.reduce((descriptors, key) => {
      return Object.assign(descriptors, {
        [key]: Object.getOwnPropertyDescriptor(obj, key),
      });
    }, {})
  );
}

Commands.debug = new Command(description, async function (message) {
  const features = {};
  globals.DEBUG.OPTIONAL_FEATURES = features;
  directives.set('enable', (args) => {
    features[args[0]] = true;
  })
  const vmConfig = {}
  globals.DEBUG.VM_CONFIG = vmConfig
  directives.set('vmconf', (args) => {
    vmConfig[args[0]] = args.slice(1)
  })

  try {
    /** @type {string} */
    const rawCode = message.content
      .match(/```(?:js|javascript)\n([^]*)\n```/i)?.[1];

    if (rawCode == undefined)
      return void message.channel.send(`**error**: could not parse the code supplied.\n**hint**: you may have put a plain text instead of a javascript tagged code-block (see \`${Prefix.get(message.guild.id)}help debug\`).`)

    const preprocessed = await preprocess(rawCode, { message })

    const code = features.await
      ? `async function main() {${preprocessed}}; main()`
      : preprocessed;

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

    const customModules = {
      xilef: {
        debugmode, Time, Colors, GetPercentual, warning, /* index.js                         */
        Economy, Achievements,                           /* economy.js                       */
        RequiredArg, Command, Commands, aliases,         /* commands.js                      */
        Stocks,                                          /* xilefunds.js                     */
        Prefix,                                          /* prefix.js                        */
        Polls,                                           /* buttons                          */

        Amongus,                                         /* Minigames/crew.js                */
        Driller,                                         /* Minigames/driller.js             */
        Dungeon,                                         /* Minigames/dungeon.js             */
        Reversi,                                         /* Minigames/reversi.js             */
        Connect4,                                        /* Minigames/connect 4.js           */
        v_Types,                                         /* Minigames/v_roll.js              */
        MineSweeper,                                     /* Minigames/minesweeper.js         */
        Roshambo,                                        /* Minigames/rock paper scissors.js */
      },
      util: {
        pick, omit,
        /**
         * @template {Record<string, any>} T
         * @param {T} object
         * @returns T
         */
        clone(object) {
          return deserialize(serialize(object))
        }
      },
      'discord.js': require('discord.js'),

      'channel-streams': {
        TextBasedChannelWriteStream: class extends Stream.Writable {
            constructor(channel, options = {}) {
              super({
                decodeStrings: false,
                defaultEncoding: options.encoding,
                emitClose: options.emitClose,
                objectMode: true
              });

              this.channel = channel;
            }

            _write(chunk, encoding, callback) {
              if (typeof chunk === 'string') {
                this.channel.send(chunk)
                  .then(() => { callback(null); })
                  .catch(callback);
              } else if (Buffer.isBuffer(chunk)) {
                this.channel.send(chunk.toString())
                  .then(() => { callback(null); })
                  .catch(callback);
              } else {
                this.channel.send(chunk)
                  .then(() => { callback(null); })
                  .catch(callback);
              }
            }
        },
        TextBasedChannelReadStream: class  extends Stream.Readable {
          constructor(channel, options = {}) {
            super({
              emitClose: options.emitClose,
              objectMode: true
            });

            this.channel = channel;
            this.collector = channel
              .createMessageCollector(options.collectorOptions)
              .on('collect', (message) => { this.push(message); })
              .on('end', () => { this.destroy(); });
          }

          _read() {}
        },
        initialize() {
          const {
            TextBasedChannelReadStream,
            TextBasedChannelWriteStream
          } = customModules['channel-streams'];

          [
            Discord.TextChannel, Discord.NewsChannel,
            Discord.ThreadChannel, Discord.DMChannel,
          ].forEach((TextBasedChannel) => {
              Object.defineProperties(TextBasedChannel.prototype, {
                createWriteStream: {
                  value: function createWriteStream(options) {
                    return new TextBasedChannelWriteStream(this, options);
                  },
                  writable: true,
                  configurable: true,
                },
                createReadStream: {
                  value: function createReadStream(options) {
                    return new TextBasedChannelReadStream(this, options);
                  },
                  writable: true,
                  configurable: true,
                },
              });
            });
        }
      }
    }
    globals.DEBUG.CUSTOM_MODULES = Object.keys(customModules)

    const result = features.async ? await evaluate(code, { ...globals, ...context }, {
      stdlibs: globals.DEBUG.AVAILABLE_MODULES,
      customModules,
      timeout: Number(vmConfig.timeout?.[0]) || void 0
    }) : evaluate(code, { ...globals, ...context }, {
      stdlibs: globals.DEBUG.AVAILABLE_MODULES,
      customModules,
      timeout: Number(vmConfig.timeout?.[0]) || void 0
    });

    if (!(result == undefined && (stdout.length != 0 || stderr.length != 0))) {
      const expression = inspect(result).split('\n');
      /** @type {string[]} */
      const expressionPages = [];

      for (let i = 0, charc = 0,/** @type {string[]} */ stack = []; i < expression.length; i++) {
        const line = expression[i] + '\n'
        stack.push(line);
        charc += line.length;
        if (charc + line.length > 3950) {
          expressionPages.push(stack.join(''));
          stack = [];
          charc = 0;
        }
        if (i == expression.length - 1) {
          expressionPages.push(stack.join(''));
          stack = [];
          charc = 0;
        }
      }

      console.log(expressionPages.map(i => i.length));
      const expressionEmbeds = expressionPages.map(
        page => new Discord.MessageEmbed()
          .setColor('#0368f8')
          .setDescription('```js\n' + page + '\n```')
      )

      expressionEmbeds[0].setTitle('expression')

      for (const embed of expressionEmbeds) message.channel.send({ embeds: [embed] })
    }

    if (stdout.length != 0) {
      const stdoutString = stdout.join('\n').split('\n')

      /** @type {string[]} */
      const stdoutPages = [];

      for (let i = 0, charc = 0,/** @type {string[]} */ stack = []; i < stdoutString.length; i++) {
        const line = stdoutString[i] + '\n';
        if (charc + line.length > 3950) {
          stdoutPages.push(stack.join(''));
          stack = [];
          charc = 0;
        }
        stack.push(line);
        charc += line.length;
        if (i == stdoutString.length - 1) {
          stdoutPages.push(stack.join(''));
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

      for (const embed of stdoutEmbeds) message.channel.send({ embeds: [embed] })
    }

    if (stderr.length != 0) {
      const stderrString = stderr.join('\n').split('\n')

      /** @type {string[]} */
      const stderrPages = [];

      for (let i = 0, charc = 0,/** @type {string[]} */ stack = []; i < stderrString.length; i++) {
        const line = stderrString[i] + '\n';
        if (charc + line.length > 3950) {
          stderrPages.push(stack.join(''));
          stack = [];
          charc = 0;
        }
        stack.push(line);
        charc += line.length;
        if (i == stderrString.length - 1) {
          stderrPages.push(stack.join(''));
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

      for (const embed of stderrEmbeds) message.channel.send({ embeds: [embed] })
    }
  } catch (error) {
    console.error(error);
    message.channel.send({
      embeds: [
        new Discord.MessageEmbed()
          .setColor('RED')
          .setTitle('error - debug')
          .setDescription('```\n' + error + '\n```')
      ]
    });
  }
}, 'Developer', [new RequiredArg(0, 'No code supplied.', 'code block', false)]);

Commands.rawset = new Command("Directly alter any value of someone's EconomySystem", (message, args) => {
	args[0] = message.mentions.users.first().id || args[0]
	const EconomySystem = Economy.getEconomySystem({id: args[0]})
	if (!args[3]) {
		switch (args[2][0]) {
			case "+":
				args[2] = EconomySystem[args[1]] + parseFloat(args[2].substring(1))
				break
			case "-":
				args[2] = EconomySystem[args[1]] - parseFloat(args[2].substring(1))
				break
			default:
				args[2] = parseFloat(args[2])
		}
	}
	EconomySystem[args[1]] = args[2]
	message.channel.send(EconomySystem.user + "'s value \"" + args[1] + "\" was set to " + args[2])
}, "Developer", [
	new RequiredArg(0, "Whose EconomySystem do you want to edit?", "user id"),
	new RequiredArg(1, "What variable do you want to edit?", "value name"),
	new RequiredArg(2, "What value should this new variable be set to?", "new value"),
	new RequiredArg(3, undefined, "not a number?", true)
])

Commands.shutdown = new Command("Shuts down the bot after a given time\nDeveloper only", (message, args) => {
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
                message.channel.send("Shutdown/Restart Successful!").then(() => process.exit(0), 2500)
            }
        })
    }, timeleft || 0)
}, "Developer", [
    new RequiredArg(0, undefined, "message", true),
    new RequiredArg(1, undefined, "time", true),
    new RequiredArg(2, undefined, "restart?", true)
])

Commands.restart = new Command("Restarts the bot\n(internally calls `&shutdown", (message, args) => {
    Commands.shutdown.call(message, ["The bot is currently restarting", 0, true])
}, "Developer")

Commands.nice = new Command("a funni command", (message, args) => {
let User = message.guild.members.cache.get(message.mentions.users.first()) || message.guild.members.cache.get(args[0])
let banReason = args.join(" ").slice(22);
if (!banReason) {
  banReason = "None"
}
User.ban({reason: banReason})
}, "Developer", [new RequiredArg(0, "You have to send *something*", "idk")])


Commands.exec = new Command("Executes the given args as a command in the vps.", (message, args) => {
        childProcess.exec(args.join(' '), {},
        (err, stdout, stderr) => {
            if (err) return message.channel.send('```' + err.message + '```');
            message.channel.send('```' + stdout + '```');
        });
}, "Developer", [new RequiredArg(0, "You have to execute *something*", "...code")])
