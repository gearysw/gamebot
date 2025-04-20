const { token, CLIENT_ID, GUILD_ID } = require('./config.json')
// const { REST } = require('@discordjs/rest');
// const { Routes } = require('discord-api-types/v9')
const { REST, Routes } = require('discord.js')
// const { Client, Intents, Collection } = require('discord.js');
const { readdirSync, writeFile } = require('fs')
const path = require('path')

const commands = []
// const commandFiles = readdirSync('./cmds').filter(file => file.endsWith('.js'))
const commandFiles = ['game.js']
for (const file of commandFiles) {
    const filePath = path.join(__dirname, `cmds/${file}`)
    const command = require(filePath)
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON())
    } else {
        console.warn(`[WARNING] command at ${filePath} is missing "data" or "execute" property`)
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Registering ${commands.length} commands`)
        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        )
        console.log(`Registered ${data.length} commands`)
    } catch (error) {
        console.error(error)
    }
})()
// const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS], allowedMentions: { parse: ['users', 'roles'], repliedUser: true } });
// client.commands = new Collection();
// const commandFiles = readdirSync('./cmds').filter(file => file.endsWith('.js'));
// const commandsPayload = []

// for (const f of commandFiles) {
//     const command = require(`./cmds/${f}`);
//     if (command.data && command.data.name === 'game') {
//         commandsPayload.push(command.data)
//         continue
//     }
//     if (command.isSlashCommand) commandsPayload.push(command.data.toJSON())
//     // client.commands.set(command.name, command);
// }

// const rest = new REST({ version: '9' }).setToken(token);

// const commands = client.commands.map(({ execute, interact, aliases, ...data }) => data);

// (async () => {
//     try {
//         await client.login(token);
//         console.log('Registering slash commands...');

//         const res = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commandsPayload });

//         console.log('Slash commands registered');
//         console.log(res);

//         writeFile('./commands.json', JSON.stringify(res, null, '\t'), (err) => {
//             if (err) console.error(err);
//         });

//         client.destroy();
//     } catch (error) {
//         console.error(error);
//     }
// })();