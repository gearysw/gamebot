const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Help!',
    execute: async (bot, message, args, child) => {
        const games = ['csgo', 'csgo10', 'squad', 'forza', 'civilisation', 'rocketleague', 'tabletop', 'apex', 'wreckfest', 'beatsaber', 'vr', 'factorio', 'minecraft', 'borderlands', 'halo', 'tarkov', 'siege', 'farming', 'overwatch', 'bf3'];

        const embed = new Discord.RichEmbed()
            .setTitle('Game Bot commands')
            .setColor('#ff5555')
            .addField('!game [name of game] in', 'Add yourself to the roster', true)
            .addField('!game [name of game] out', 'Remove yourself from the roster', true)
            .addField('!game [name of game] clear', 'Clear the roster', true)
            .addField('List of games', games.sort().join(', '))
            .addField('!scrim [team1 or team2]', 'Add yourself to the respective team')
            .addField('!scrim start [map name]', 'Spin up the server on the specified map (ex. de_dust2)')
            .addField('!scrim clear', 'Clear the roster', true)
            .addField('!scrim end', 'Kill the server', true)
            .addField('!steamid [Steam ID]', 'Add your Steam ID to the database with the format `!steamid STEAM_X:Y:Z`');

        message.channel.send(embed);
    }
}