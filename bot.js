const { prefix, token, CSGO_PATH, CLIENT_ID, GUILD_ID, BOT_OWNER, expiration } = require('./config.json')
const { Client, Events, GatewayIntentBits, Collection, MessageFlags } = require('discord.js')
const fs = require('fs')
const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
    ],
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
})
// const { spawn } = require('child_process');

bot.commands = new Collection()
// const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'))
const commandFiles = ['game.js']
for (const f of commandFiles) {
    const command = require(`./cmds/${f}`)
    if ('data' in command && 'execute' in command) {
        bot.commands.set(command.data.name, command)
    } else {
        console.error(`[WARNING] command ${f} is missing 'data' or 'execute' property`)
    }
}

bot.login(token);

bot.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`)
    setInterval(async () => {
        const games = JSON.parse(fs.readFileSync('./games.json', 'utf-8')).games
        let reserves = JSON.parse(fs.readFileSync('./games/reserves.json', 'utf-8'))

        for (const g of games) {
            if (!fs.existsSync(`./games/${g}.json`)) continue
            const content = JSON.parse(fs.readFileSync(`./games/${g}.json`, 'utf-8'))

            for (const prop in content) {
                if (content[prop].expire < Date.now()) delete content[prop]
            }

            fs.writeFileSync(`./games/${g}.json`, JSON.stringify(content, null, '\t'))
        }

        for (const r in reserves) {
            if (reserves[r].time < Date.now()) {
                const channel = await bot.channels.fetch(reserves[r].channel)
                const command = bot.commands.get('game')
                const msg = await command.reservationHandler(reserves[r].game, reserves[r].name, reserves[r].id, expiration)

                delete reserves[r]
                channel.send(msg)
            }
        }
        fs.writeFileSync(`./games/reserves.json`, JSON.stringify(reserves, null, '\t'))
    }, 60_000)
    // }, 5000) //? for debug only
})

bot.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName)
        if (!command) return

        try {
            await command.execute(interaction)
        } catch (error) {
            console.error(error)
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Error executing command', flags: MessageFlags.Ephemeral })
            } else {
                await interaction.reply({ content: 'Error executing command', flags: MessageFlags.Ephemeral })
            }
        }
    } else if (interaction.isAutocomplete()) {
        const command = interaction.client.commands.get(interaction.commandName)
        if (!command) return

        try {
            await command.autocomplete(interaction)
        } catch (error) {
            console.error(error)
        }
    }
})