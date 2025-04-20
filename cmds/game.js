const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
// const { execute } = require('./game');
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const { expiration } = require('../config.json')

const games = JSON.parse(fs.readFileSync('./games.json', 'utf-8')).games

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game')
        .setDescription('Add yourself to the list of people looking to join a game')
        .addSubcommand(subcommand =>
            subcommand
                .setName('roster')
                .setDescription('View current game roster or add yourself to the list')
                .addStringOption(option =>
                    option.setName('command')
                        .setDescription('Command to execute')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Show roster', value: 'show' },
                            { name: 'Check in', value: 'in' },
                            { name: 'Check out', value: 'out' },
                            { name: 'Reserve place', value: 'reserve' }
                        ))
                .addStringOption(option =>
                    option.setName('game')
                        .setDescription('Game roster to perform command on')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addNumberOption(option =>
                    option.setName('minutes')
                        .setDescription('How long (minutes) to check in for or reserve your spot. Default 75 for check in and 30 for reserve')
                ))
        .addSubcommand(subcommand =>
            subcommand.setName('list')
                .setDescription('Game list commands')
                .addStringOption(option =>
                    option.setName('command')
                        .setDescription('Command to perform')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Add game to list of games', value: 'add' },
                            { name: 'Remove game from list of games', value: 'remove' },
                            { name: 'Show list of games', value: 'show' },
                        )
                )
                .addStringOption(option =>
                    option.setName('game')
                        .setDescription('Game to add to or remove from the list')
                )
        ),
    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'roster':
                const rosterCommand = interaction.options.getString('command')
                const rosterGame = interaction.options.getString('game')
                const minutes = interaction.options.getNumber('minutes') || 75
                const userId = interaction.user.id
                const userName = (!interaction.member.nickname) ? interaction.user.username : interaction.member.nickname

                if (!games.includes(rosterGame)) return interaction.reply({ content: "This game doesn't exist in the list. Add the game first.", flags: MessageFlags.Ephemeral })
                // interaction.reply(`${rosterCommand} ${game} ${minutes}`)
                if (rosterCommand === 'show') {
                    const reply = await showCurrentRoster(rosterGame)
                    interaction.reply({ embeds: [reply] })
                }
                if (rosterCommand === 'in') {
                    let reply
                    if (minutes) reply = await gameIn(rosterGame, userName, interaction.user.id, minutes * 60_000)
                    else reply = await gameIn(rosterGame, userName, userId)
                    interaction.reply(reply)
                }
                if (rosterCommand === 'out') {
                    const reply = await gameOut(rosterGame, userId)
                    interaction.reply(reply)
                }
                if (rosterCommand === 'reserve') {
                    let reply
                    if (minutes) reply = await gameReserve(rosterGame, userId, userName, interaction.channelId, minutes * 60_000)
                    // if (minutes) reply = await gameReserve(rosterGame, userId, userName, interaction.channelId, minutes * 1000) //? for debug only
                    else reply = await gameReserve(rosterGame, userId, userName, interaction.channelId)
                    interaction.reply(reply)
                }
                break

            case 'list':
                const listCommand = interaction.options.getString('command')
                const listGame = interaction.options.getString('game')

                if (listCommand === 'show') return interaction.reply(games.sort().join(', '));
                if (listCommand === 'add') {
                    if (!listGame) return await interaction.reply({ content: 'Please include a game to add to the list.', flags: MessageFlags.Ephemeral })
                    const reply = await addGame(listGame)
                    interaction.reply(reply)
                }
                if (listCommand === 'remove') {
                    if (!listGame) return await interaction.reply({ content: 'Please include a game to add to the list.', flags: MessageFlags.Ephemeral })
                    const reply = await removeGame(listGame)
                    interaction.reply(reply)
                }
                break

            default:
                return await interaction.reply({
                    content: 'invalid command provided',
                    flags: MessageFlags.Ephemeral
                })
        }
    },
    async autocomplete(interaction) {
        const focusVal = interaction.options.getFocused()
        const filtered = games.filter(item => item.includes(focusVal))
        const searchResults = filtered.slice(0, 25)
        await interaction.respond(
            searchResults.map(choice => ({ name: choice, value: choice }))
        )
    },
    async reservationHandler(game, name, playerId, expiration) {
        const reply = await gameIn(game, name, playerId, expiration)
        reply['content'] = `<@${playerId}>, you're now on the ${game} roster.`
        return reply
    }
}

/**
 * @param {string} game name of game
 * @returns embed object of roster
 */
async function showCurrentRoster(game) {
    if (!fs.existsSync(`./games/${game}.json`)) fs.writeFileSync(`./games/${game}.json`, JSON.stringify({}))

    const roster = JSON.parse(fs.readFileSync(`./games/${game}.json`, 'utf-8'))
    const gamers = []
    const reserves = []

    for (const p in roster) {
        gamers.push(`${roster[p].name} - expires in ${Math.ceil(Math.trunc((roster[p].expire - Date.now()) / 60_000))} minute(s)`)
    }

    const reservedPlayers = JSON.parse(fs.readFileSync('./games/reserves.json', 'utf-8'))
    for (const p in reservedPlayers) {
        const reservedGame = reservedPlayers[p].game
        if (reservedGame !== game) continue

        const minutesLeft = Math.ceil((reservedPlayers[p].time - Date.now()) / 60_000)
        reserves.push(`${reservedPlayers[p].name} in ${minutesLeft} minute(s)`)
    }

    const embed = new EmbedBuilder()
        .setTitle(`${game} roster - ${gamers.length}`)
        .setColor(0xFF5555)
        .setDescription(gamers.join('\n') || 'none')
        .addFields(
            { name: 'reserves', value: reserves.join('\n') || 'none' }
        )

    return embed
}

/**
 * @param {string} game name of game
 * @param {string} playerName server nickname or username of player
 * @param {string} playerId Discord ID of player
 * @param {number} expirationLength length in minutes to stay checked in
 * @returns reply object
 */
async function gameIn(game, playerName, playerId, expirationLength = expiration) {
    const reserves = JSON.parse(fs.readFileSync('./games/reserves.json', 'utf-8'))

    for (r in reserves) {
        if (reserves[r].id === playerId) delete reserves[r]
    }
    fs.writeFileSync('./games/reserves.json', JSON.stringify(reserves, null, '\t'))
    if (!fs.existsSync(`./games/${game}.json`)) fs.writeFileSync(`./games/${game}.json`, JSON.stringify({}))

    const gamers = JSON.parse(fs.readFileSync(`./games/${game}.json`, 'utf-8'))

    if (Object.keys(gamers).indexOf(playerId) > -1) {
        gamers[playerId]['expire'] = Date.now() + (parseInt(expirationLength))
        fs.writeFileSync(`./games/${game}.json`, JSON.stringify(gamers, null, '\t'))
        const embed = await showCurrentRoster(game)
        return { content: `You've updated your check in.`, embeds: [embed] }
    }
    gamers[playerId] = {
        name: playerName,
        expire: Date.now() + expirationLength
    }
    fs.writeFileSync(`./games/${game}.json`, JSON.stringify(gamers, null, '\t'))
    const embed = await showCurrentRoster(game)
    return { content: `You're now on the ${game} roster.`, embeds: [embed] }
}

/**
 * @param {string} game name of game
 * @param {string} playerId Discord ID of the player
 * @returns reply object
 */
async function gameOut(game, playerId) {
    if (!fs.existsSync(`./games/${game}.json`)) fs.writeFileSync(`./games/${game}.json`, JSON.stringify({}))

    const gamers = JSON.parse(fs.readFileSync(`./games/${game}.json`, 'utf-8'))
    if (Object.keys(gamers).indexOf(playerId) === -1) return { content: `You're not even on the roster. Why would you abandon something you haven't started?` }
    delete gamers[playerId]

    fs.writeFileSync(`./games/${game}.json`, JSON.stringify(gamers, null, '\t'))

    const embed = await showCurrentRoster(game)
    return { content: `You've abandoned your friends.`, embeds: [embed] }
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
async function gameReserve(game, playerId, playerName, channel, time = 1_800_000) {
    if (!fs.existsSync('./games/reserves.json')) fs.writeFileSync('./games/reserves.json', JSON.stringify({}))
    if (time === undefined) return { content: 'When do you want to check in?' }

    const reserves = JSON.parse(fs.readFileSync('./games/reserves.json', 'utf-8'))

    let selectObj = ''
    if (Object.keys(reserves).length > 0) {
        for (res in reserves) {
            if (reserves[res].id === playerId) {
                selectObj = res;
            } else selectObj = uuidv4()
        }
    } else selectObj = uuidv4()

    reserves[selectObj] = {
        id: playerId,
        time: Date.now() + time,
        name: playerName,
        channel: channel,
        game: game
    }

    fs.writeFileSync('./games/reserves.json', JSON.stringify(reserves, null, '\t'))

    return { content: `You've reserved your spot on ${game} in ${Math.ceil(time / 60_000)} minute(s).` }
}

/**
 * 
 * @param {string} game name of game
 * @returns reply object
 */
async function addGame(game) {
    if (games.includes(game)) return { content: `${game} is already on the list.`, flags: MessageFlags.Ephemeral }
    games.push(game)
    const json = {
        "games": games
    }

    fs.writeFileSync('./games.json', JSON.stringify(json, null, '\t'));
    return { content: `${game} added to the list` }
}

/**
 * 
 * @param {string} game name of game
 * @returns reply object
 */
async function removeGame(game) {
    if (!games.includes(game)) return { content: `${game} is not even on the list.`, flags: MessageFlags.Ephemeral }

    const index = games.indexOf(game)
    games.splice(index, 1)

    const json = { "games": games }

    fs.writeFileSync('./games.json', JSON.stringify(json, null, '\t'))
    return { content: `${game} removed from the list` }
}