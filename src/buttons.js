const { RequiredArg, Command } = require("./commands.js")

class Poll {
  constructor(message, options, title, time) {
    this.message = message
    this.options = options
    this.users = {}
    this.title = title || "Unnamed Poll"
    this.time = time

    this.collector = message.createMessageComponentCollector({
      time,
      componentType: 'BUTTON',
    });

    this.collector.on('collect', (interaction) => {
      const option = interaction.component.label;
      const poll = Polls[interaction.message.id];
      const voter = poll.users[interaction.user.id];

      if (voter == interaction.component.label) {
        options[option] -= 1;
        delete poll.users[interaction.user.id];
      } else {
        if (voter) options[voter] -= 1;

        options[option] += 1;
        poll.users[interaction.user.id] = option;
      }

      console.log("- " + Colors.cyan.colorize("Sucesfully voted in a poll:") +
        "\n\tVoter name: " + interaction.user.tag +
        "\n\tVoter ID: " + interaction.user.id +
        "\n\tVoted option name: " + option +
        "\n\tPoll ID: " + interaction.message.id +
        "\n\tPoll title: " + Polls[interaction.message.id].title +
        "\n\tPoll options: " + JSON.stringify(poll.options) +
        "\n\tPoll voters: " + JSON.stringify(poll.users))
      poll.update()
      interaction.reply({content: 'successfully voted', ephemeral: true});
    });
  }

  update(buttons) {
    let embed = new Discord.MessageEmbed()
      .setColor(this.message.member.displayHexColor)
      .setTitle(this.title)
      .setFooter("Expires after " + Time.convertTime(this.time))
      .setTimestamp();

    let voters = "People who voted:\n" +
      (Object.keys(this.users).map((user) => '<@' + user.toString() + '>').join(" ") || "`none`");

    embed.setDescription(voters);

    for (let buttonname of Object.keys(this.options)) {
      embed.addField(buttonname, this.options[buttonname].toString(), true)
    }

    this.message.edit({
      content: null,
      embeds: [embed],
      components: buttons
    });
  }
}

Polls = {}

Commands.poll = new Command("Creates a poll where anyone can vote, you can have 5 different options at max\n a simple yes/no poll can be created by omitting some/all arguments\na duration can also be specified (in minutes).", (message, args) => {
    if (args.length > 7) throw ("You can only have 5 different options at max.");

    const options = {};
    const buttons = new Discord.MessageActionRow();

    if (args.length > 2) {
      for (const option of args.slice(2))
        options[option] = 0;

      const components = Array.from(Object.keys(options), (option) => {
        return new Discord.MessageButton({
          style: "PRIMARY",
          label: option,
          customId: 'option-' + option
        });
      });

      buttons.addComponents(components);
    } else {
      options['Yes'] = 0;
      options['No'] = 0;

      buttons.addComponents([
        new Discord.MessageButton({
          style: 'SUCCESS',
          label: 'Yes',
          customId: 'option-yes'
        }),
        new Discord.MessageButton({
          style: 'DANGER',
          label: 'No',
          customId: 'option-no'
        })
      ]);
    }

    message.channel.send("Creating poll...").then((poll) => {
      const time = Math.min(parseFloat(args[1]) * 60 * 1000 || 300000, 0x7FFFFFFF);

      Polls[poll.id] = new Poll(poll, options, args[0] || message.author.username + "'s poll br", time);
      Polls[poll.id].update([buttons])
      console.log("- " + Colors.cyan.colorize("Sucessfully created a poll:") +
        "\n\tCreator: " + poll.author.username +
        "\n\tPoll title: " + Polls[poll.id].title +
        "\n\tPoll duration: " + Time.convertTime(Polls[poll.id].time) +
        "\n\tPoll options: " + Object.keys(Polls[poll.id].options))
      setTimeout(() => {
        message.edit("[This poll is closed.]", poll.embeds)
        console.log("- " + Colors.cyan.colorize("Sucessfully closed a poll:") +
          "\n\tCreator: " + poll.author.username +
          "\n\tPoll title: " + Polls[poll.id].title +
          "\n\tPoll options: " + JSON.stringify(Polls[poll.id].options) +
          "\n\tPoll voters: " + JSON.stringify(Polls[poll.id].users))
        Polls[poll.id] = undefined
      }, time)
    })
}, "Utility", [
  new RequiredArg(0, undefined, "title", true),
  new RequiredArg(1, undefined, "duration", true),
  new RequiredArg(2, undefined, "option 1", true),
  new RequiredArg(3, undefined, "option 2", true),
  new RequiredArg(4, undefined, "option 3", true),
  new RequiredArg(5, undefined, "option 4", true),
  new RequiredArg(6, undefined, "option 5", true)
]);
