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
                        choices: choices,
                    },
                    {
                        name: 'minutes',
                        description: 'How long to check in for. If omitted, defaults to 75 minutes.',
                        type: 4,
                        required: false
                    }
                ]
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
                const embed = await showCurrentRoster(args[0]);
                return { embeds: [embed] };
            }

            // add message author to roster of specified game
            if (games.includes(args[0]) && args[1] === 'in') {
                const name = (!message.member.nickname) ? message.author.username : message.member.nickname;
                // gameIn(message.author.id, name, message.channel, args);
                // let reply;
                if (args[2]) return gameIn(args[0], name, message.author.id, parseInt(args[2]) * 60000);
                else return gameIn(args[0], name, message.author.id)
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
        // console.log(subCommand);

        if (commandGroup === 'list' && subCommand === 'show') interaction.reply(games.sort().join(', '));
        if (commandGroup === 'roster' && subCommand === 'show') {
            // console.log(game);
            const interactionReply = await showCurrentRoster(game);
            interaction.reply({ embeds: [interactionReply] });
        }
        if (commandGroup === 'roster' && subCommand === 'in') {
            const name = (!interaction.member.nickname) ? interaction.user.username : interaction.member.nickname;
            let reply;
            if (minutes) reply = await gameIn(game, name, interaction.user.id, minutes * 60000)
            else reply = await gameIn(game, name, interaction.user.id);

            interaction.reply(reply);
        }

    }
}
/**
 * 
 * @param {string} game name of game
 * @returns embed object of roster
 */
async function showCurrentRoster(game) {
    if (!fs.existsSync(`./games/${game}.json`)) fs.writeFileSync(`./games/${game}.json`, JSON.stringify({}));

    const roster = JSON.parse(fs.readFileSync(`./games/${game}.json`, 'utf-8'));
    const gamers = [];
    const reserves = [];

    for (const p in roster) {
        gamers.push(`${roster[p].name} - expires in ${Math.ceil(Math.trunc((roster[p].expire - Date.now())/60000))} minute(s)`)
    }

    const reservedPlayers = JSON.parse(fs.readFileSync('./games/reserves.json', 'utf-8'));
    for (const p in reservedPlayers) {
        const reservedGame = reservedPlayers[p].game;
        if (reservedGame !== game) continue;

        const minutesLeft = Math.ceil((reservedPlayers[p].time - Date.now()) / 60000);
        reserves.push(`${reservedPlayers[p].name} in ${minutesLeft} minute(s)`);
    }

    const embed = new MessageEmbed()
        .setTitle(`${game} roster - ${gamers.length}`)
        .setColor('#ff5555')
        .setDescription(gamers.join('\n'))
        .addField('reserves', reserves.join('\n') || 'none');

    return embed;
}

/**
 * 
 * @param {string} game name of game
 * @param {string} playerName server nickname or username of player
 * @param {string} playerId Discord ID of player
 * @param {number} expirationLength length in minutes to stay checked in
 * @returns reply object
 */
async function gameIn(game, playerName, playerId, expirationLength = expiration) {
    const reserves = JSON.parse(fs.readFileSync('./games/reserves.json', 'utf-8'));

    for (r in reserves) {
        if (reserves[r].id === playerId) delete reserves[r];
    }

    fs.writeFileSync('./games/reserves.json', JSON.stringify(reserves, null, '\t'));

    if (!fs.existsSync(`./games/${game}.json`)) fs.writeFileSync(`./games/${game}.json`, JSON.stringify({}));

    const gamers = JSON.parse(fs.readFileSync(`./games/${game}.json`, 'utf-8'));

    if (Object.keys(gamers).indexOf(playerId) > -1) {
        gamers[playerId]['expire'] = Date.now() + (parseInt(expirationLength));

        fs.writeFileSync(`./games/${game}.json`, JSON.stringify(gamers, null, '\t'))
        const embed = await showCurrentRoster(game);
        return { content: `You've updated your check in.`, embeds: [embed] };
    }

    gamers[playerId] = {
        name: playerName,
        expire: Date.now() + expirationLength
    }

    fs.writeFileSync(`./games/${game}.json`, JSON.stringify(gamers, null, '\t'));

    const embed = await showCurrentRoster(game);
    return { content: `You're now on the ${game} roster.`, embeds: [embed] };
}


async function gameReserve() {

}