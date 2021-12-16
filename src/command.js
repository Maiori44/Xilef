/** @format */

const { Message } = require("discord.js");

class Command {
	/**
	 * @typedef {{name: string, description: string, permission: Discord.PermissionString, run: (message: Message, args: string[], client: LocalClient) => Promise<void>}} CommandOptions
	 * @param {CommandOptions} options
	 */
	constructor(options) {
		this.name = options.name;
		this.description = options.description;
		this.permission = options.permission;
		this.run = options.run;
	}
}

module.exports = {
	Command
}