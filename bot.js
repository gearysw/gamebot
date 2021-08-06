const { prefix, token, CSGO_PATH, CLIENT_ID, GUILD_ID, LEADERSHIP_ROLE } = require('./config.json');
const { Client, Intents, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
// const { data } = require('cheerio/lib/api/attributes');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS], allowedMentions: { parse: ['users', 'roles'], repliedUser: true } });
// const { spawn } = require('child_process');

bot.commands = new Collection();
// bot.interactions = new Collection();

const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));

for (const f of commandFiles) {
    const command = require(`./cmds/${f}`);
    bot.commands.set(command.name, command);
}
// deployHelp();

const child = 'spawn'; //* Use this if the bot doesn't need to use node's child processes
// const child = spawn('sh');
// child.stdout.on('data', data => { console.log(`stdout: ${data}`) });
// child.stderr.on('data', data => { console.log(`stderr: ${data}`) });
// child.on('error', err => { console.log(`child error: ${err}`) });
// child.stdin.write(`cd ${CSGO_PATH}\n`);
// child.on('close', code => { console.log(`child process closed with code ${code}`) });
// child.on('exit', code => { console.log(`child process exited with code ${code}`) });

bot.login(token);

bot.on('ready', async () => {
    console.log(`Logged in as ${bot.user.username}`);
    // console.log(bot.guilds.cache.first().id);
    // deployDeploy(GUILD_ID);
    setInterval(async () => {
        const gamesObj = await fs.promises.readFile('./games.json', 'utf-8');
        const games = JSON.parse(gamesObj).games;
        const reservesObj = await fs.promises.readFile(`./games/reserves.json`, 'utf-8');
        let reserves = JSON.parse(reservesObj);

        for (const g of games) {
            if (!fs.existsSync(`./games/${g}.json`)) continue;

            const content = fs.readFileSync(`./games/${g}.json`);
            const contentObj = JSON.parse(content);

            for (const prop in contentObj) {
                if (contentObj[prop].expire < Date.now()) delete contentObj[prop];
            }

            fs.writeFile(`./games/${g}.json`, JSON.stringify(contentObj, null, '\t'), err => {
                if (err) console.error(err)
            });
        }

        for (const r in reserves) {
            if (reserves[r].time < Date.now()) {
                const channel = await bot.channels.cache.get(reserves[r].channel);
                bot.commands.get('game').checkIn(reserves[r].id, reserves[r].name, channel, reserves[r].args);
                delete reserves[r];
            }
        }
        fs.writeFile(`./games/reserves.json`, JSON.stringify(reserves, null, '\t'), err => {
            if (err) console.error(err);
        })
    }, 60000);
    // }, 10000); //! for debug purposes only
    // console.log(bot.interactions.get('help').name);
    setCommandPermissions();
    // console.log(bot.application.id);
});

bot.on('messageCreate', async (message) => {
    if (message.author.bot) return; //*  ignores messages made by bots
    if (message.channel.type === ('dm' || 'group')) return; //* ignores messages outside of channels
    if (message.content.toLowerCase().includes('\`')) return; //* ignores messages with code blocks

    const args = message.content.toLowerCase().split(/ +/);
    const commandName = args.shift();

    if (commandName.startsWith(prefix)) {
        try {
            const cmds = commandName.slice(prefix.length);
            const command = bot.commands.get(cmds) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmd));
            if (cmds.includes(prefix)) return;
            if (!command) return;
            if (command.args && !args.length) return message.channel.send(`You need to provide arguments for that command. Type \`${prefix}help ${command.name}\` to see how to use the command.`);

            const reply = await command.execute(bot, message, args, child);
            message.channel.send(reply);
        } catch (error) {
            console.error(error);
            message.channel.send('Helpful error message');
            message.guild.members.get('197530293597372416').send(error);
        }
    }
});

bot.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    // console.log(interaction);
    // if (interaction.commandName === 'deploy') {
    //     // await interaction.deferReply();
    //     try {
    //         deployCommands();
    //         await interaction.reply({ content: 'Commands deployed!', ephemeral: true });
    //         return;
    //     } catch (error) {
    //         interaction.reply({ content: 'Deploy failed', ephemeral: true });
    //         console.error(error);
    //     }
    // }

    // if (interaction.commandName === 'update') {
    //     try {
    //         updateCommands();
    //         await interaction.reply({ content: 'Commands updated!', ephemeral: true });
    //         return;
    //     } catch (error) {
    //         interaction.reply({ content: 'Update failed', ephemeral: true });
    //         console.error(error);
    //     }

    // }

    if (!bot.commands.has(interaction.commandName)) return;

    try {
        await bot.commands.get(interaction.commandName).interact(interaction);
    } catch (error) {
        console.error(error);
    }
    // const command = bot.commands.get(interaction.commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmd));
    // if (!command) return interaction.reply({ content: 'Unknown command', ephemeral: true });
    // const reply = command.execute(bot, interation, )
});

async function deployDeploy(guild) {
    const data = [{
            name: 'deploy',
            description: 'Deploys the slash commands'
        },
        {
            name: 'update',
            description: 'Updates slash commands'
        }
    ];

    const command = await bot.guilds.cache.get(guild).commands.set(data);
    // console.log(command);
}

async function updateCommands() {
    const commands = bot.commands.map(({ interact, execute, aliases, ...data }) => data);
    const rest = new REST({ version: '9' }).setToken(token);
    // console.log(commands);

    try {
        console.log('Registering slash commands...');

        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });

        console.log('Slash commands registered');
    } catch (error) {
        console.error(error);
    }
}

async function deployCommands() {
    const commands = bot.commands.map(({ execute, interact, aliases, ...data }) => data);
    // console.log(commands);
    await bot.guilds.cache.get(GUILD_ID).commands.set(commands);
}

async function deployHelp() {
    const command = require('./cmds/help.js');
    bot.interactions.set(command.name, command);
}

async function setCommandPermissions() {
    bot.application.fetch();
    const deployCommand = await bot.guilds.cache.get(GUILD_ID).commands.fetch('873344126622507048');
    // console.log(deployCommand);
    const permissions = [{
        id: LEADERSHIP_ROLE,
        type: 'ROLE',
        permission: true
    }];
    await deployCommand.permissions.add({ permissions });
}