const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'help',
    description: 'List of available commands',
    execute: async (bot, message, args, child) => {
        const gamesObject = await fs.promises.readFile('./games.json', 'utf-8');
        const games = JSON.parse(gamesObject).games;

        const embed = new MessageEmbed()
            .setTitle('Game Bot commands')
            .setColor('#ff5555')
            .setDescription('Arguments inside angle brackets <> denotes optional arguments.')
            .addField('!game [name of game] in <minutes>', 'Add yourself to the roster <optionally include how long you are in for>', true)
            .addField('!game [name of game] out', 'Remove yourself from the roster', true)
            .addField('!game [name of game] reserve [minutes]', 'Add yourself to the roster in the given minutes')
            .addField('!game [name of game] clear', 'Clear the roster', true)
            .addField('!game list', 'Show the list of games on file', true)
            .addField('!game add [name of game]', 'Add a game to the list', true)
            .addField('!game remove [name of game]', 'Remove a game from the list', true)
            .addField('List of games', games.sort().join(', '))
            // .addField('!scrim [team1 or team2]', 'Add yourself to the respective team')
            // .addField('!scrim start [map name]', 'Spin up the server on the specified map (ex. de_dust2)')
            // .addField('!scrim clear', 'Clear the roster', true)
            // .addField('!scrim end', 'Kill the server', true)
            .addField('!steamid [Steam ID]', 'Add your Steam ID to the database with the format `!steamid STEAM_X:Y:Z`')
            .addField('!roll XdY', 'Roll X Y-sided dice')
            .addField('!instants [search terms]', 'Search for instant sounds on myinstants.com');

        message.channel.send({ embeds: [embed] });
    },
    interact: async (interaction) => {
        const gamesObject = await fs.promises.readFile('./games.json', 'utf-8');
        const games = JSON.parse(gamesObject).games;

        const embed = new MessageEmbed()
            .setTitle('Game Bot commands')
            .setColor('#ff5555')
            .setDescription('Arguments inside angle brackets <> denotes optional arguments.')
            .addField('!game [name of game] in <minutes>', 'Add yourself to the roster <optionally include how long you are in for>', true)
            .addField('!game [name of game] out', 'Remove yourself from the roster', true)
            .addField('!game [name of game] reserve [minutes]', 'Add yourself to the roster in the given minutes')
            .addField('!game [name of game] clear', 'Clear the roster', true)
            .addField('!game list', 'Show the list of games on file', true)
            .addField('!game add [name of game]', 'Add a game to the list', true)
            .addField('!game remove [name of game]', 'Remove a game from the list', true)
            .addField('List of games', games.sort().join(', '))
            // .addField('!scrim [team1 or team2]', 'Add yourself to the respective team')
            // .addField('!scrim start [map name]', 'Spin up the server on the specified map (ex. de_dust2)')
            // .addField('!scrim clear', 'Clear the roster', true)
            // .addField('!scrim end', 'Kill the server', true)
            .addField('!steamid [Steam ID]', 'Add your Steam ID to the database with the format `!steamid STEAM_X:Y:Z`')
            .addField('!roll XdY', 'Roll X Y-sided dice')
            .addField('!instants [search terms]', 'Search for instant sounds on myinstants.com');

        await interaction.reply({ embeds: [embed] });
    }
}