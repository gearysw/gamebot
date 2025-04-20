const { token, CLIENT_ID, GUILD_ID } = require('./config.json')
const { REST, Routes } = require('discord.js')
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