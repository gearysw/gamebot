const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Help!',
    execute: async (bot, message, args) => {
        const embed = new Discord.RichEmbed()
            .setTitle('Game Bot commands')
            .setColor('#ff5555')
            .addField('!game in', 'Add yourself to the roster')
            .addField('!game out', 'Remove yourself from the roster')
            .addField('!game clear', 'Clear the roster')

        message.channel.send(embed);
    }
}