const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Help!',
    execute: async (bot, message, args) => {
        const games = ['csgo', 'squad', 'forza', 'civilisation', 'rocketleague', 'tabletop', 'apex', 'wreckfest', 'beatsaber', 'vr', 'factorio', 'minecraft', 'borderlands', 'halo', 'tarkov', 'siege', 'farming', 'overwatch'];

        const embed = new Discord.RichEmbed()
            .setTitle('Game Bot commands')
            .setColor('#ff5555')
            .addField('!game [name of game] in', 'Add yourself to the roster')
            .addField('!game [name of game] out', 'Remove yourself from the roster')
            .addField('!game [name of game] clear', 'Clear the roster')
            .addField('List of games', games.sort().join(', '));

        message.channel.send(embed);
    }
}