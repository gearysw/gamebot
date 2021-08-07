const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, GUILD_ID, CLIENT_ID } = require('../config.json')
const { readdirSync, writeFile } = require('fs');

const rest = new REST({ version: '9' }).setToken(token);

module.exports = {
    name: 'deploy',
    description: 'Deploy/update slash commands',
    default_permission: false,
    interact: async interaction => {
        const client = interaction.client;
        interaction.deferReply();

        const refreshedCommands = readdirSync('./cmds').filter(f => f.endsWith('.js'));
        for (f of refreshedCommands) {
            const refreshedCommand = require(`../cmds/${f}`);
            client.commands.set(refreshedCommand.name, refreshedCommand);
        }

        const commands = client.commands.map(({ execute, interact, aliases, ...data }) => data);
        const res = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        writeFile('./commands.json', JSON.stringify(res, null, '\t'), err => {
            if (err) console.error(err);
        });

        const updatedCommands = res.map(c => c.name);

        interaction.editReply({ content: `Updated commands: ${updatedCommands.join(', ')}`, ephemeral: true });
    }
}