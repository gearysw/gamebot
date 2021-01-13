const Discord = require('discord.js');
const fs = require('fs');
const { expiration } = require('../config.json');

module.exports = {
    name: 'game',
    description: 'Add yourself to the list of people looking to join a game',
    execute: async (bot, message, args, child) => {
        const gamesObject = await fs.promises.readFile('./games.json', 'utf8');
        const games = JSON.parse(gamesObject).games;

        try {
            // game over YEAHHHHH
            if (args[0] === 'over' || (games.includes(args[0]) && args[1] === 'over')) return message.channel.send('https://www.youtube.com/watch?v=IsS_VMzY10I');

            // show the list of games
            if (args[0] === 'list') return message.channel.send(games.sort().join(', '));

            // command to add a game to the list of games
            if (args[0] === 'add') {
                // catch error in case no game is appended
                if (!args[1]) return message.channel.send('What game?')

                if (games.includes(args[1])) return message.channel.send(`${args[1]} is already on the list.`);

                games.push(args[1]);

                const json = {
                    "games": games
                }

                fs.writeFile('./games.json', JSON.stringify(json, null, '\t'), err => {
                    if (err) console.error(err);
                    message.channel.send(`${args[1]} added to the list.`);
                });
                return;
            }

            // command to remove a game from a list
            if (args[0] === 'remove') {
                if (!args[1]) return message.channel.send('What game?');

                if (!games.includes(args[1])) return message.channel.send(`${args[1]} is not even on the list.`);

                const index = games.indexOf(args[1])
                games.splice(index, 1);

                const json = {
                    "games": games
                }

                fs.writeFile('./games.json', JSON.stringify(json, null, '\t'), err => {
                    if (err) console.error(err);
                    message.channel.send(`${args[1]} removed from the list.`);
                });
                return;
            }

            // if no args included, send help
            if (!games.includes(args[0])) {
                bot.commands.get('help').execute(bot, message, args, child);
            }

            // if only game is included in command, show the roster only
            if (games.includes(args[0]) && args.length === 1) {
                if (!fs.existsSync(`./games/${args[0]}.json`)) {
                    fs.writeFileSync(`./games/${args[0]}.json`, JSON.stringify({}));
                }
                fs.readFile(`./games/${args[0]}.json`, (err, content) => {
                    if (err) return console.error(err);
                    let object = JSON.parse(content);

                    sendRosterEmbed(args[0], '', object, message.channel);
                });
            }

            // add message author to roster of specified game
            if (games.includes(args[0]) && args[1] === 'in') {
                // console.log(parseInt(args[2]));
                const expirationLength = (isNaN(parseInt(args[2])) || parseInt(args[2]) > 300) ? expiration : Math.abs(parseInt(args[2]) * 60000);
                // console.log(expirationLength);

                if (!fs.existsSync(`./games/${args[0]}.json`)) {
                    fs.writeFileSync(`./games/${args[0]}.json`, JSON.stringify({}));
                }
                fs.readFile(`./games/${args[0]}.json`, (err, content) => {
                    if (err) return console.error(err);
                    let gamers = JSON.parse(content);

                    if (Object.keys(gamers).indexOf(message.author.id) > -1) { // refreshes the check in timer instead
                        gamers[message.author.id]['expire'] = Date.now() + expirationLength;
                        sendRosterEmbed(args[0], `You've updated your check in.`, gamers, message.channel);

                        fs.writeFile(`./games/${args[0]}.json`, JSON.stringify(gamers, null, '\t'), err => {
                            if (err) return console.error(err);
                        });
                        return;
                    }
                    gamers[message.author.id] = {
                        name: (!message.member.nickname) ? message.author.username : message.member.nickname,
                        expire: Date.now() + expirationLength
                    };

                    fs.writeFile(`./games/${args[0]}.json`, JSON.stringify(gamers, null, '\t'), err => {
                        if (err) return console.error(err);
                    });

                    sendRosterEmbed(args[0], `You're now on the ${args[0]} roster.`, gamers, message.channel);
                });
            }

            // remove message author from roster of specified game
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

                    sendRosterEmbed(args[0], `You've abandoned your friends.`, gamers, message.channel);
                });
            }

            // clear the roster of specified game
            if (games.includes(args[0]) && args[1] === 'clear') {
                fs.writeFile(`./games/${args[0]}.json`, JSON.stringify({}), err => {
                    if (err) return console.error(err);
                    message.channel.send(`${args[0]} roster cleared`);
                });
            }
        } catch (error) {
            console.error(error);
        }

    }
}
/**
 * 
 * @param {string} game Game being checked into
 * @param {string} remark Message for the bot to send, if empty put '' (empty string)
 * @param {Object} roster Roster object
 * @param {Object} channel message.channel
 */
async function sendRosterEmbed(game, remark, roster, channel) {
    let gamers = []
    // if (Object.keys(roster) === 0) {
    //     channel.send({ embed: new Discord.MessageEmbed().setTitle(`${game} roster - 0`).setColor('#ff5555') });
    //     return
    // }
    for (const prop in roster) {
        gamers.push(`${roster[prop].name} - expires in ${Math.ceil(Math.trunc((roster[prop].expire - Date.now())/60000))} minutes`)
    }

    const embed = new Discord.MessageEmbed()
        .setTitle(`${game} roster - ${gamers.length}`)
        .setColor('#ff5555')
        .setDescription(gamers.join('\n'));

    channel.send(remark, { embed: embed });
}