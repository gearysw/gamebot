const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'game',
    description: 'Add yourself to the list of people looking to join a game',
    execute: async (bot, message, args) => {
        if (!args.length) {
            fs.readFile('./gamers.json', (err, content) => {
                if (err) console.error(err);
                let gamers = JSON.parse(content);

                const embed = new Discord.RichEmbed()
                    .setTitle(`Ready players - ${Object.values(gamers).length}`)
                    .setColor('#ff5555')
                    .setDescription(Object.values(gamers).join('\n'));
                message.channel.send(embed);
            });
        }
        if (args[0] === 'in') {
            fs.readFile('./gamers.json', (err, content) => {
                if (err) return console.error(err);
                let gamers = JSON.parse(content);

                if (Object.keys(gamers).indexOf(message.author.id) > -1) return message.channel.send(`You're already in the roster.`);
                gamers[message.author.id] = (!message.member.nickname) ? message.author.username : message.member.nickname;

                fs.writeFile('./gamers.json', JSON.stringify(gamers, null, '\t'), err => {
                    if (err) return console.error(err);
                });

                const embed = new Discord.RichEmbed()
                    .setTitle(`Ready players - ${Object.values(gamers).length}`)
                    .setColor('#ff5555')
                    .setDescription(Object.values(gamers).join('\n'));
                message.channel.send(`You're now on the roster.`, {
                    embed: embed
                });
            });
        }
        if (args[0] === 'out') {
            fs.readFile('./gamers.json', (err, content) => {
                if (err) return console.error(err);
                let gamers = JSON.parse(content);

                if (Object.keys(gamers).indexOf(message.author.id) === -1) return (message.channel.send(`You're not even on the roster. Why would you abandon something you haven't started?`));
                delete gamers[message.author.id];

                fs.writeFile('./gamers.json', JSON.stringify(gamers, null, '\t'), err => {
                    if (err) return console.error(err);
                });

                const embed = new Discord.RichEmbed()
                    .setTitle(`Ready players - ${Object.values(gamers).length}`)
                    .setColor('#ff5555')
                    .setDescription(Object.values(gamers).join('\n'));
                message.channel.send(`You've abandoned your friends.`, {
                    embed: embed
                });
            });
        }
        if (args[0] === 'clear') {
            fs.writeFile('./gamers.json', JSON.stringify({}), err => {
                if (err) console.error(err);
                message.channel.send('Roster cleared.');
            });
        }
    }
}