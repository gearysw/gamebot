const { prefix, token, CSGO_PATH } = require('./config.json');
const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
// const { spawn } = require('child_process');

bot.commands = new Collection();

const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));

for (const f of commandFiles) {
    const command = require(`./cmds/${f}`);
    bot.commands.set(command.name, command);
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
        const gamesObj = await fs.promises.readFile('./games.json', 'utf-8');
        const games = JSON.parse(gamesObj).games;
        const reservesObj = await fs.promises.readFile(`./games/reserves.json`, 'utf-8');
        let reserves = JSON.parse(reservesObj);

        for (const g of games) {
            if (!fs.existsSync(`./games/${g}.json`)) continue;

            fs.readFile(`./games/${g}.json`, 'utf8', (err, content) => {
                if (err) return console.error(err);

                let contentObj = JSON.parse(content); //! unexpected end of JSON input
                for (const prop in contentObj) {
                    if (contentObj[prop].expire < Date.now()) delete contentObj[prop];
                }

                fs.writeFile(`./games/${g}.json`, JSON.stringify(contentObj, null, '\t'), err => {
                    if (err) console.error(err)
                });
            })
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
        // }, 60000);
    }, 10000); //! for debug purposes only
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

            command.execute(bot, message, args, child);
        } catch (error) {
            console.error(error);
            message.channel.send('Helpful error message');
            message.guild.members.get('197530293597372416').send(error);
        }
    }
});