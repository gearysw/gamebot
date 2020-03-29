const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'game',
    description: 'Add yourself to the list of people looking to join a game',
    execute: async (bot, message, args) => {
        const games = ['csgo', 'csgo10', 'squad', 'forza', 'civilisation', 'rocketleague', 'tabletop', 'apex', 'wreckfest', 'beatsaber', 'vr', 'factorio', 'minecraft', 'borderlands', 'halo', 'tarkov', 'siege', 'farming', 'overwatch', 'bf3'];

        if (args[0] === 'over' || (games.includes(args[0]) && args[1] === 'over')) return message.channel.send('https://www.youtube.com/watch?v=IsS_VMzY10I');
        if (!games.includes(args[0])) {
            bot.commands.get('help').execute(bot, message, args);
        }
        if (games.includes(args[0]) && args.length === 1) {
            if (!fs.existsSync(`./games/${args[0]}.json`)) {
                fs.writeFileSync(`./games/${args[0]}.json`, JSON.stringify({}));
            }
            fs.readFile(`./games/${args[0]}.json`, (err, content) => {
                if (err) return console.error(err);
                let gamers = JSON.parse(content);

                const embed = new Discord.RichEmbed()
                    .setTitle(`${args[0]} roster - ${Object.values(gamers).length}`)
                    .setColor('#ff5555')
                    .setDescription(Object.values(gamers).join('\n'));
                message.channel.send(embed);
            });
        }
        if (games.includes(args[0]) && args[1] === 'in') {
            if (!fs.existsSync(`./games/${args[0]}.json`)) {
                fs.writeFileSync(`./games/${args[0]}.json`, JSON.stringify({}));
            }
            fs.readFile(`./games/${args[0]}.json`, (err, content) => {
                if (err) return console.error(err);
                let gamers = JSON.parse(content);

                if (Object.keys(gamers).indexOf(message.author.id) > -1) return message.channel.send(`You're already in the ${args[0]} roster.`);
                gamers[message.author.id] = (!message.member.nickname) ? message.author.username : message.member.nickname;

                fs.writeFile(`./games/${args[0]}.json`, JSON.stringify(gamers, null, '\t'), err => {
                    if (err) return console.error(err);
                });

                const embed = new Discord.RichEmbed()
                    .setTitle(`${args[0]} roster - ${Object.values(gamers).length}`)
                    .setColor('#ff5555')
                    .setDescription(Object.values(gamers).join('\n'));
                message.channel.send(`You're now on the ${args[0]} roster.`, { embed: embed });
            });
        }
        if (games.includes(args[0]) && args[1] === 'out') {
            if (!fs.existsSync(`./games/${args[0]}.json`)) {
                fs.writeFileSync(`./games/${args[0]}.json`, JSON.stringify({}))
            }
            fs.readFile(`./games/${args[0]}.json`, (err, content) => {
                if (err) return console.error(err);
                let gamers = JSON.parse(content);

                if (Object.keys(gamers).indexOf(message.author.id) === -1) return message.channel.send(`You're not even on the roster. Why would you abandon something you haven't started?`);
                delete gamers[message.author.id];

                fs.writeFile(`./games/${args[0]}.json`, JSON.stringify(gamers, null, '\t'), err => {
                    if (err) console.error(err);
                });

                const embed = new Discord.RichEmbed()
                    .setTitle(`${args[0]} roster - ${Object.values(gamers).length}`)
                    .setColor('#ff5555')
                    .setDescription(Object.values(gamers).join('\n'));
                message.channel.send(`You've abandoned your friends.`, { embed: embed });
            });
        }
        if (games.includes(args[0]) && args[1] === 'clear') {
            fs.writeFile(`./games/${args[0]}.json`, JSON.stringify({}), err => {
                if (err) return console.error(err);
                message.channel.send(`${args[0]} roster cleared`);
            });
        }
    }
}