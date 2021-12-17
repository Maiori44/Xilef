/** @format */

const { Message } = require("discord.js");

class Command {
	/**
	 * @typedef {{name: string, description: string, permission: Discord.PermissionString, category: String, run: (message: Message, args: string[], client: LocalClient) => Promise<void>}} CommandOptions
	 * @param {CommandOptions} options
	 */
	constructor(options) {
		this.name = options.name;
		this.description = options.description;
		this.permission = options.permission || 0;
		this.category = options.category;
		this.run = options.run;
	}
}

module.exports = {
	Command
}