/** @format */

const { Message, Collection } = require("discord.js");
const { LocalClient } = require('./client.js')

class RequiredArg {
	/**
	 * @typedef {{errorMsg: String, argIndex: Number, argName: String, validValues?: string[]}}
	 * @param {RequiredArgOptions} options 
	 */
	constructor(options) {
		this.errorMsg = options.errorMsg;
		this.argIndex = options.argIndex;
		this.argName = options.argName;
		this.validValues = options.validValues;
	}
}
class Command {
	/**
	 * @typedef {{name: string, description: string, permission: Discord.PermissionString, requiredArgs: RequiredArg[], category: String, run: (message: Message, args: string[], client: LocalClient) => Promise<void>, subCommands: Collection<String, Command>}} CommandOptions
	 * @param {CommandOptions} options
	 */
	constructor(options) {
		this.name = options.name;
		this.description = options.description;
		this.permission = options.permission || 0;
		this.category = options.category;
		this.run = options.run;
		this.subCommands = options.subCommands;
		this.requiredArgs = options.requiredArgs;
	}
}

module.exports = {
	Command,
	RequiredArg
}