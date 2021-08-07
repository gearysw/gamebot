const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { expiration } = require('../config.json');
const { v4: uuidv4 } = require('uuid');

const gamesObject = fs.readFileSync('./games.json', 'utf-8');
const games = JSON.parse(gamesObject).games;

const choices = [];
for (g of games) {
    choices.push({
        name: g,
        value: g
    });
}

module.exports = {
    name: 'game',
    description: 'Add yourself to the list of people looking to join a game',
    options: [{
        name: 'roster',
        description: 'Game roster commands',
        type: 2,
        options: [{
                name: 'show',
                description: 'Show roster of a game',
                type: 1,
                options: [{
                    name: 'game',
                    description: 'Name of the game',
                    type: 3,
                    required: true,
                    choices: choices
                }]
            },
            {
                name: 'in',
                description: 'Check into a game roster',
                type: 1,
                options: [{
                    name: 'game',
                    description: 'Name of the game',
                    type: 3,
                    required: true,
                    choices: choices
                }]
            },
            {
                name: 'out',
                description: 'Check out of a game roster',
                type: 1,
                options: [{
                    name: 'game',
                    description: 'Name of the game',
                    type: 3,
                    required: true,
                    choices: choices
                }]
            },
            {
                name: 'reserve',
                description: 'Reserve a spot on the game roster',
                type: 1,
                options: [{
                        name: 'game',
                        description: 'Name of the game',
                        type: 3,
                        required: true,
                        choices: choices
                    },
                    {
                        name: 'minutes',
                        description: 'How long until you check in. If omitted, defaults to 30 minutes.',
                        type: 4,
                        require: false
                    }
                ]
            },
            {
                name: 'clear',
                description: 'Clear the roster of a game',
                type: 1,
                options: [{
                    name: 'game',
                    description: 'Name of the game',
                    type: 3,
                    required: true
                }]
            }
        ]
    }, {
        name: 'list',
        description: 'Game list commands',
        type: 2,
        options: [{
            name: 'add',
            description: 'Add a game into the list',
            type: 1,
            options: [{
                name: 'game',
                description: 'Name of the game',
                type: 3,
                required: true
            }]
        }, {
            name: 'remove',
            description: 'Remove a game from the list',
            type: 1,
            options: [{
                name: 'game',
                description: 'Name of the game',
                type: 3,
                required: true
            }]
        }, {
            name: 'show',
            description: 'Returns the list of saved games',
            type: 1
        }]
    }],
    execute: async (bot, message, args, child) => {
        // const gamesObject = await fs.promises.readFile('./games.json', 'utf8');
        // const games = JSON.parse(gamesObject).games;

        try {
            // game over YEAHHHHH
            // if (args[0] === 'over' || (games.includes(args[0]) && args[1] === 'over')) return message.channel.send('https://www.youtube.com/watch?v=IsS_VMzY10I');
            if (args[0] === 'over' || (games.includes(args[0]) && args[1] === 'over')) return 'https://www.youtube.com/watch?v=IsS_VMzY10I';

            // show the list of games
            // if (args[0] === 'list') return message.channel.send(games.sort().join(', '));
            if (args[0] === 'list') return games.sort().join(', ');

            // command to add a game to the list of games
            if (args[0] === 'add') {
                // catch error in case no game is appended
                // if (!args[1]) return message.channel.send('What game?')
                if (!args[1]) return 'What game?';

                // if (games.includes(args[1])) return message.channel.send(`${args[1]} is already on the list.`);
                if (games.includes(args[1])) return `${args[1]} is already on the list.`

                games.push(args[1]);

                const json = {
                    "games": games
                }

                fs.writeFile('./games.json', JSON.stringify(json, null, '\t'), err => {
                    if (err) console.error(err);
                    // message.channel.send(`${args[1]} added to the list.`);
                    return `${args[1]} added to the list.`;

                });
                return;
            }

            // command to remove a game from a list
            if (args[0] === 'remove') {
                // if (!args[1]) return message.channel.send('What game?');
                if (!args[1]) return 'What game?';


                // if (!games.includes(args[1])) return message.channel.send(`${args[1]} is not even on the list.`);
                if (!games.includes(args[1])) return `${args[1]} is not even on the list.`;


                const index = games.indexOf(args[1])
                games.splice(index, 1);

                const json = {
                    "games": games
                }

                fs.writeFile('./games.json', JSON.stringify(json, null, '\t'), err => {
                    if (err) console.error(err);
                    // message.channel.send(`${args[1]} removed from the list.`);
                    return `${args[1]} removed from the list.`;

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

                    sendRosterEmbed(args[0], undefined, object, message.channel);
                });
            }

            // add message author to roster of specified game
            if (games.includes(args[0]) && args[1] === 'in') {
                const name = (!message.member.nickname) ? message.author.username : message.member.nickname;
                gameIn(message.author.id, name, message.channel, args);
            }

            // remove message author from roster of specified game
            if (games.includes(args[0]) && args[1] === 'out') {
                if (!fs.existsSync(`./games/${args[0]}.json`)) {
                    fs.writeFileSync(`./games/${args[0]}.json`, JSON.stringify({}));
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

            if (games.includes(args[0]) && args[1] === 'reserve') {
                if (!fs.existsSync(`./games/reserves.json`)) {
                    fs.writeFileSync(`./games/reserves.json`, JSON.stringify({}));
                }
                if (!args[2] || isNaN(parseInt(args[2]))) return message.channel.send('When do you want to game in?');

                const time = Math.abs(parseInt(args[2])) * 60000;
                // const time = Math.abs(parseInt(args[2])) * 1000; //! for debug purposes only

                //* include userID, name, channel, args
                fs.readFile(`./games/reserves.json`, (err, content) => {
                    if (err) return console.error(err);
                    let reserves = JSON.parse(content);

                    let selectObj = '';
                    if (Object.keys(reserves).length > 0) {
                        for (res in reserves) {
                            if (reserves[res].id === message.author.id) {
                                selectObj = res;
                            } else selectObj = uuidv4();
                        }
                    } else selectObj = uuidv4();

                    reserves[selectObj] = {
                        id: message.author.id,
                        refMessage: message.id,
                        time: Date.now() + time,
                        name: (!message.member.nickname) ? message.author.username : message.member.nickname,
                        channel: message.channel.id,
                        args: [args[0], 'in']
                    }

                    fs.writeFile(`./games/reserves.json`, JSON.stringify(reserves, null, '\t'), err => {
                        if (err) return console.error(err);
                        return `You've reserved your spot on ${args[0]} in ${Math.ceil(time/60000)} minute(s).`;
                    });
                });
            }

            // clear the roster of specified game
            if (games.includes(args[0]) && args[1] === 'clear') {
                fs.writeFile(`./games/${args[0]}.json`, JSON.stringify({}), err => {
                    if (err) return console.error(err);
                    return `${args[0]} roster cleared`;
                });
            }
        } catch (error) {
            console.error(error);
        }
    },
    checkIn: async (id, name, channel, args) => {
        gameIn(id, name, channel, args, true);
    },
    interact: async (interaction) => {
        const commandGroup = interaction.options.getSubcommandGroup();
        const subCommand = interaction.options.getSubcommand();
        const game = interaction.options.getString('game');
        const minutes = interaction.options.getInteger('minutes');

        if (commandGroup === 'list' && subCommand === 'show') interaction.reply(games.sort().join(', '));

    }
}
/**
 * 
 * @param {string} game Game being checked into
 * @param {string} remark Message for the bot to send, if empty put '' (empty string)
 * @param {Object} roster Roster object
 * @param {Object} channel message.channel
 */
async function sendRosterEmbed(game, remark = undefined, roster, channel, mentionID = undefined) {
    let gamers = [];
    let reserves = [];
    for (const prop in roster) {
        gamers.push(`${roster[prop].name} - expires in ${Math.ceil(Math.trunc((roster[prop].expire - Date.now())/60000))} minute(s)`)
    }

    const readReserves = await fs.promises.readFile(`./games/reserves.json`);
    const reservesList = JSON.parse(readReserves);

    for (const p in reservesList) {
        const reservedGame = reservesList[p].args[0];
        if (reservedGame !== game) continue;

        const minutesLeft = Math.ceil((reservesList[p].time - Date.now()) / 60000);
        reserves.push(`${reservesList[p].name} in ${minutesLeft} minute(s)`);
    }

    const embed = new MessageEmbed()
        .setTitle(`${game} roster - ${gamers.length}`)
        .setColor('#ff5555')
        .setDescription(gamers.join('\n'))
        .addField('reserves', reserves.join('\n') || 'none');

    // if (remark === undefined) {
    //     return channel.send({ embeds: [embed], allowedMentions: [mentionID] });

    // }

    // channel.send(remark, { embed: embed, ...(mentionID && { reply: mentionID }) });
    return { embeds: [embed], ...(mentionID && { allowedMentions: [mentionID] }), ...(remark && { content: remark }) };
}

/**
 * @param {String} discordID id of player
 * @param {String} name name of player
 * @param {String} channel channel id of message source 
 * @param {String[]} args arguments
 */
async function gameIn(discordID, name, channel, args, mention = false) {
    const expirationLength = (args[2] === undefined || isNaN(parseInt(args[2])) || parseInt(args[2]) > 300) ? expiration : Math.abs(parseInt(args[2]) * 60000);

    const content = fs.readFileSync('./games/reserves.json');
    const reserves = JSON.parse(content);

    for (r in reserves) {
        if (reserves[r].id === discordID) delete reserves[r];
    }

    fs.writeFile('./games/reserves.json', JSON.stringify(reserves, null, '\t'), err => {
        if (err) return console.error(err);
    });

    if (!fs.existsSync(`./games/${args[0]}.json`)) {
        fs.writeFileSync(`./games/${args[0]}.json`, JSON.stringify({}));
    }
    fs.readFile(`./games/${args[0]}.json`, (err, content) => {
        if (err) return console.error(err);
        let gamers = JSON.parse(content);

        if (Object.keys(gamers).indexOf(discordID) > -1) {
            gamers[discordID]['expire'] = Date.now() + expirationLength;
            sendRosterEmbed(args[0], `You've updated your check in.`, gamers, channel);

            fs.writeFile(`./games/${args[0]}.json`, JSON.stringify(gamers, null, '\t'), err => {
                if (err) return console.error(err);
            });
            return;
        }
        gamers[discordID] = {
            name: name,
            expire: Date.now() + expirationLength
        };

        fs.writeFile(`./games/${args[0]}.json`, JSON.stringify(gamers, null, '\t'), err => {
            if (err) return console.error(err);
        });

        const mentionID = (mention) ? discordID : undefined
        sendRosterEmbed(args[0], `You're now on the ${args[0]} roster.`, gamers, channel, mentionID);
    });
}