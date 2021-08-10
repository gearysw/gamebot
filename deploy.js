const { token, CLIENT_ID, GUILD_ID } = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents, Collection } = require('discord.js');
const { readdirSync, writeFile } = require('fs');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS], allowedMentions: { parse: ['users', 'roles'], repliedUser: true } });
client.commands = new Collection();
const commandFiles = readdirSync('./cmds').filter(file => file.endsWith('.js'));

for (const f of commandFiles) {
    const command = require(`./cmds/${f}`);
    client.commands.set(command.name, command);
}

const rest = new REST({ version: '9' }).setToken(token);

const commands = client.commands.map(({ execute, interact, aliases, ...data }) => data);

(async () => {
    try {
        await client.login(token);
        console.log('Registering slash commands...');

        const res = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });

        console.log('Slash commands registered');
        console.log(res);

        writeFile('./commands.json', JSON.stringify(res, null, '\t'), (err) => {
            if (err) console.error(err);
        });

        client.destroy();
    } catch (error) {
        console.error(error);
    }
})();