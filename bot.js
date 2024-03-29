const { prefix, token, CSGO_PATH, CLIENT_ID, GUILD_ID, BOT_OWNER, expiration } = require('./config.json');
const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS], allowedMentions: { parse: ['users', 'roles'], repliedUser: true } });
// const { spawn } = require('child_process');
const commandCache = require('./commands.json');
// const games = require('./games.json').games

bot.commands = new Collection();

const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));

for (const f of commandFiles) {
    const command = require(`./cmds/${f}`);
    bot.commands.set(command.data.name, command);
}

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
    setInterval(async () => {
        const games = JSON.parse(fs.readFileSync('./games.json', 'utf-8')).games;
        let reserves = JSON.parse(fs.readFileSync('./games/reserves.json', 'utf-8'));

        for (const g of games) {
            if (!fs.existsSync(`./games/${g}.json`)) continue;

            const content = JSON.parse(fs.readFileSync(`./games/${g}.json`, 'utf-8'));

            for (const prop in content) {
                if (content[prop].expire < Date.now()) delete content[prop];
            }

            fs.writeFileSync(`./games/${g}.json`, JSON.stringify(content, null, '\t'));
        }

        for (const r in reserves) { //! unexpected end of JSON input
            if (reserves[r].time < Date.now()) {
                const channel = await bot.channels.cache.get(reserves[r].channel);
                const command = bot.commands.get('game')
                const msg = await command.reservationHandler(reserves[r].game, reserves[r].name, reserves[r].id, expiration);
                delete reserves[r];

                channel.send(msg)
            }
        }
        fs.writeFileSync(`./games/reserves.json`, JSON.stringify(reserves, null, '\t'));
    }, 60000);
    // }, 10000); //! for debug purposes only
    setCommandPermissions();
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
    if (interaction.isCommand()) commandHandler(interaction);
    if (interaction.isButton()) buttonHandler(interaction);
    if (interaction.isAutocomplete() && interaction.commandName === 'game') {
        const gamesFile = await fs.promises.readFile('./games.json')
        const games = JSON.parse(gamesFile).games

        const currentValue = interaction.options.getFocused()
        const searchResults = games.filter(item => item.includes(currentValue))
        const response = []
        for (const i of searchResults) {
            response.push({ name: i, value: i })
        }
        interaction.respond(response)
    }
});

async function setCommandPermissions() {
    bot.application.fetch();
    const index = commandCache.map(c => c.name).indexOf('deploy');
    if (index === -1) return;
    const deployCommand = await bot.guilds.cache.get(GUILD_ID).commands.fetch(commandCache[index].id);
    const permissions = [{
        id: BOT_OWNER,
        type: 'USER',
        permission: true
    }];
    await deployCommand.permissions.add({ permissions });
}

async function commandHandler(interaction) {
    if (!bot.commands.has(interaction.commandName)) return;
    try {
        await bot.commands.get(interaction.commandName).interact(interaction);
    } catch (error) {
        console.error(error);
    }
}

async function buttonHandler(interaction) {
    if (interaction.customId.includes('poll-option')) pollHandler(interaction);
}

async function pollHandler(interaction) {
    console.log(`message ID: ${interaction.message.id}\nbutton ID: ${interaction.customId}`);
    interaction.reply({ content: 'Your poll has been stored!', ephemeral: true });
}