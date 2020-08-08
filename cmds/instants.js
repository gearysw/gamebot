const cheerio = require('cheerio');
const axios = require('axios');
const Discord = require('discord.js');

module.exports = {
    name: 'instants',
    aliases: ['myinstants', 'instantsounds'],
    description: 'Search for instant sounds on myinstants.com',
    execute: async (bot, message, args, child) => {
        const searchTerms = args.join('+');
        const url = `https://www.myinstants.com/search/?name=${searchTerms}`;
        const $ = await fetchHTML(url);
        const elementAmount = $('.instant').length;
        const nameArray = $('.instant-link').map((i, e) => { return $(e).text() }).get();

        const instantsEmbed = new Discord.MessageEmbed()
            .setTitle(`Instant Sounds - ${args.join(' ')}`)
            .setColor('#E53935')
            .setThumbnail('https://www.myinstants.com/media/favicon-96x96.png');

        for (let i = 0; i < elementAmount; i++) {
            const url = `https://myinstants.com${$('.instant-link')[i].attribs.href}\n`;
            instantsEmbed.addField(nameArray[i], url, true)
            if (i === 25) break;
        }

        message.channel.send(instantsEmbed);
    }
}

async function fetchHTML(url) {
    const { data } = await axios.get(url);
    return cheerio.load(data);
}