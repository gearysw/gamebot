const { token, CLIENT_ID, GUILD_ID, LEADERSHIP_ROLE } = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents, Collection } = require('discord.js');
const { readdirSync } = require('fs');
const axios = require('axios');
const { exit } = require('process');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS], allowedMentions: { parse: ['users', 'roles'], repliedUser: true } });
client.commands = new Collection();
const commandFiles = readdirSync('./cmds').filter(file => file.endsWith('.js'));

for (const f of commandFiles) {
    const command = require(`./cmds/${f}`);
    client.commands.set(command.name, command);
}

const APP_ID = '497643945636134932';
const url = `https://discord.com/api/v8/applications/${APP_ID}/guilds/${GUILD_ID}/commands`;
const headers = {
    Authorization: `Bot ${token}`
}

const rest = new REST({ version: '9' }).setToken(token);

const deployCommand = [{
    name: 'deploy',
    description: 'Deploy or update slash commands',
    default_permission: false
}];

axios({
    method: 'put',
    url: url,
    headers: headers,
    data: deployCommand
}).then(res => console.log(res.data));

const commands = client.commands.map(({ execute, interact, aliases, ...data }) => data);

(async () => {
    try {
        await client.login(token);
        console.log('Registering slash commands...');

        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });

        console.log('Slash commands registered');
        await client.destroy();
    } catch (error) {
        console.error(error);
    }
})();