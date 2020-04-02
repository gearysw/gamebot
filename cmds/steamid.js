const fs = require('fs');

module.exports = {
    name: 'steamid',
    description: 'Add your steamID to the database',
    execute: async (bot, message, args, child) => {
        const regex = /^STEAM_[0-5]:[01]:\d+$/;
        if (!args.length) return message.channel.send('Provide your Steam ID in the format of `STEAM_X:Y:Z`, where X, Y, Z are integers');

        if (args[0].toUpperCase().match(regex)) {
            fs.readFile('./games/steamid.json', (err, content) => {
                if (err) return console.error(err);
                let steamid = JSON.parse(content);

                if (Object.keys(steamid).indexOf(message.author.id) > -1) return message.channel.send('You already stored your Steam ID.');
                steamid[message.author.id] = args[0].toUpperCase();

                fs.writeFile('./games/steamid.json', JSON.stringify(steamid, null, '\t'), err => {
                    if (err) return console.error(err);
                    message.channel.send('Steam ID added.');
                });
            });
        } else message.channel.send('Provide your steamID in the format of `STEAM_X:Y:Z`, where X, Y, Z are integers');
    }
}