const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { expiration } = require('../config.json');
const { v4: uuidv4 } = require('uuid');

const games = JSON.parse(fs.readFileSync('./games.json', 'utf-8')).games;
// const games = JSON.parse(gamesObject).games;

// const choices = [];
// for (g of games) {
//     choices.push({
//         name: g,
//         value: g
//     });
// }
const choices = [{
    name: 'Apex Legends',
    value: 'apex'
}, {
    name: 'Civilisation series',
    value: 'civ'
}, {
    name: 'Counter Strike: Global Offensive',
    value: 'csgo'
}, {
    name: 'Counter Strike: Global Offensive 10 man',
    value: 'csgo10'
}, {
    name: 'Party Games',
    value: 'partygames'
}, {
    name: 'Overwatch',
    value: 'overwatch'
}, {
    name: 'Rocket League',
    value: 'rocketleague'
}, {
    name: 'Sea of Thieves',
    value: 'seaofthieves'
}, {
    name: 'Rainbow 6: Siege',
    value: 'siege'
}, {
    name: 'Squad',
    value: 'squad'
}, {
    name: 'Valorant',
    value: 'valorant'
}, {
    name: 'VR Games',
    value: 'vr'
}]

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
                return await addGame(args[1]);
            }

            // command to remove a game from a list
            if (args[0] === 'remove') {
                // if (!args[1]) return message.channel.send('What game?');
                if (!args[1]) return 'What game?';


                // if (!games.includes(args[1])) return message.channel.send(`${args[1]} is not even on the list.`);
                return await removeGame(args[1]);
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
                const reply = await gameOut(args[0], message.author.id)
                return reply;
            }

            if (games.includes(args[0]) && args[1] === 'reserve') {
                const name = (!message.member.nickname) ? message.author.username : message.member.nickname;
                if (!args[2] || isNaN(parseInt(args[2]))) return await gameReserve(args[0], message.author.id, name, message.channel.id);
                return await gameReserve(args[0], message.author.id, name, message.channel.id, args[2] * 60000);
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
    reservationHandler: async (game, name, playerId, expiration) => {
        const reply = await gameIn(game, name, playerId, expiration);
        reply['content'] = `<@${playerId}>, you're now on the ${game} roster.`;

        return reply;
    },
    interact: async (interaction) => {
        const commandGroup = interaction.options.getSubcommandGroup();
        const subCommand = interaction.options.getSubcommand();
        const game = interaction.options.getString('game');
        const minutes = interaction.options.getInteger('minutes');

        if (commandGroup === 'roster' && !games.includes(game)) interaction.reply({ content: `${game} is not on the list of games`, ephemeral: true });

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
        if (commandGroup === 'roster' && subCommand === 'out') {
            const reply = await gameOut(game, interaction.user.id);
            interaction.reply(reply);
        }
        if (commandGroup === 'roster' && subCommand === 'reserve') {
            const name = (!interaction.member.nickname) ? interaction.user.username : interaction.member.nickname;
            let reply;
            if (minutes) reply = await gameReserve(game, interaction.user.id, name, interaction.channelId, minutes * 60000);
            else reply = await gameReserve(game, interaction.user.id, name, interaction.channelId);

            interaction.reply(reply);
        }
        if (commandGroup === 'list' && subCommand === 'add') {
            const reply = await addGame(game);
            interaction.reply(reply);
        }
        if (commandGroup === 'list' && subCommand === 'remove') {
            const reply = await removeGame(game);
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

/**
 * 
 * @param {string} game name of game
 * @param {string} playerId Discord ID of the player
 * @returns interaction reply object
 */
async function gameOut(game, playerId) {
    if (!fs.existsSync(`./games/${game}.json`)) fs.writeFileSync(`./games/${game}.json`, JSON.stringify({}));

    const gamers = JSON.parse(fs.readFileSync(`./games/${game}.json`, 'utf-8'));
    if (Object.keys(gamers).indexOf(playerId) === -1) return { content: `You're not even on the roster. Why would you abandon something you haven't started?` };
    delete gamers[playerId];

    fs.writeFileSync(`./games/${game}.json`, JSON.stringify(gamers, null, '\t'));

    const embed = await showCurrentRoster(game);
    return { content: `You've abandoned your friends.`, embeds: [embed] };
}

/**
 * 
 * @param {string} game name of game
 * @param {string} playerId Discord ID of player
 * @param {string} playerName Server nickname or username of user
 * @param {string} channel channel ID where player reserved spot
 * @param {number} time time until check in in milliseconds
 * @returns reply object
 */
async function gameReserve(game, playerId, playerName, channel, time = 1800000) {
    if (!fs.existsSync('./games/reserves.json')) fs.writeFileSync('./games/reserves.json', JSON.stringify({}));
    if (time === undefined) return { content: 'When do you want to check in?' };

    const reserves = JSON.parse(fs.readFileSync('./games/reserves.json', 'utf-8'));

    let selectObj = '';
    if (Object.keys(reserves).length > 0) {
        for (res in reserves) {
            if (reserves[res].id === playerId) {
                selectObj = res;
            } else selectObj = uuidv4();
        }
    } else selectObj = uuidv4();

    reserves[selectObj] = {
        id: playerId,
        time: Date.now() + time,
        name: playerName,
        channel: channel,
        game: game
    }

    fs.writeFileSync('./games/reserves.json', JSON.stringify(reserves, null, '\t'));

    return { content: `You've reserved your spot on ${game} in ${Math.ceil(time/60000)} minute(s).` };
}

/**
 * 
 * @param {string} game name of game
 * @returns reply object
 */
async function addGame(game) {
    if (games.includes(game)) return { content: `${game} is already on the list.`, ephemeral: true };
    games.push(game);
    const json = {
        "games": games
    }

    fs.writeFileSync('./games.json', JSON.stringify(json, null, '\t'));
    return { content: `${game} added to the list` };
}

/**
 * 
 * @param {string} game name of game
 * @returns reply object
 */
async function removeGame(game) {
    if (!games.includes(game)) return { content: `${game} is not even on the list.`, ephemeral: true };

    const index = games.indexOf(game);
    games.splice(index, 1);

    const json = { "games": games };

    fs.writeFileSync('./games.json', JSON.stringify(json, null, '\t'));
    return { content: `${game} removed from the list` };
}