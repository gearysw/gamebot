const Discord = require('discord.js');
const fs = require('fs');
const { CSGO_PATH, connect } = require('../config.json');
const { maps } = require('../games/maps.json');

/** Constructs a roster to be used in a scrim */
class Roster {
    /**
     * 
     * @param {string[]} players Array of string, where each string is a Steam ID
     */
    constructor(players) {
        this.player1 = players[0];
        this.player2 = players[1];
        this.player3 = players[2];
        this.player4 = players[3];
        this.player5 = players[4];
        this.config =
            `"Match"
{
    "scrim" "1"
    "side_type" "always_knife"
    "players_per_team"  "5"
    "num_maps"  "1"
    "skip_veto" "1"

    "team1"
    {
        "name"  "Home"
        "players"
        {
            "${this.player1}"    ""
            "${this.player2}"    ""
            "${this.player3}"    ""
            "${this.player4}"    ""
            "${this.player5}"    ""
        }
    }

    "cvars"
    {
        "get5_live_countdown_time"  "5"
        "mp_halftime_duration"  "15"
        "mp_match_can_clinch"   "1"
        "mp_overtime_enable"    "1"
        "mp_match_restart_delay"    "15"
        "get5_max_pause_time"   "180"
        "get5_check_auths"  "1"
        "get5_demo_name_format" "ACRLScrim_{TIME}_{MAPNAME}"
        "get5_kick_when_no_match_loaded"    "0"
        "get5_print_damage" "1"
    }
}`
    }
}
// module.exports = {
//     name: 'scrim',
//     description: 'currently disabled',
//     execute: async (bot, message, args, child) => {
//         message.channel.send('Scrim function is currently disabled.');
//     }
// }
// module.exports = {
//     name: 'scrim',
//     description: 'Assign yourself to a team then start a server to jump right in',
//     execute: async (bot, message, args, child) => {
//         if (!args.length) {
//             fs.readFile('./games/scrim.json', (err, content) => {
//                 if (err) return console.error(err);
//                 const roster = JSON.parse(content);
//                 let team1 = [];
//                 let team2 = [];

//                 for (const i of Object.keys(roster.team1)) {
//                     const name = (!bot.guilds.cache.first().members.cache.get(i).nickname) ? bot.guilds.cache.first().members.cache.get(i).user.username : bot.guilds.cache.first().members.cache.get(i).nickname;
//                     team1.push(name);
//                 }
//                 for (const i of Object.keys(roster.team2)) {
//                     const name = (!bot.guilds.cache.first().members.cache.get(i).nickname) ? bot.guilds.cache.first().members.cache.get(i).user.username : bot.guilds.cache.first().members.cache.get(i).nickname;
//                     team2.push(name);
//                 }

//                 const embed = new Discord.MessageEmbed().setTitle('5v5 Scrim Roster').setColor('#ff5555')
//                     .addField(`Team 1 - ${team1.length}`, team1.join('\n') || 'empty', true)
//                     .addField(`Team 2 - ${team2.length}`, team2.join('\n') || 'empty', true);

//                 message.channel.send(embed);
//             });
//         }

//         if (args[0] === 'help') return bot.commands.get('help').execute(bot, message, args, child);
//         fs.readFile('./games/steamid.json', (err, content) => {
//             if (err) return console.error(err);
//             const steamIDs = JSON.parse(content);

//             if (Object.keys(steamIDs).indexOf(message.author.id) === -1) return message.channel.send(`Your Steam ID is not in the database yet. Add your ID using the \`!steamid\` command.`);
//         });

//         if (args[0] === 'team1' || args[0] === 'team2') {
//             fs.readFile('./games/scrim.json', async (err, content) => {
//                 if (err) return console.error(err);
//                 let roster = JSON.parse(content);

//                 delete roster['team1'][message.author.id];
//                 delete roster['team2'][message.author.id];

//                 fs.readFile('./games/steamid.json', (err, content) => {
//                     if (err) return console.error(err);
//                     const steamid = JSON.parse(content);
//                     const discordid = message.author.id;

//                     roster[args[0]][discordid] = steamid[discordid];
//                     fs.writeFile('./games/scrim.json', JSON.stringify(roster, null, '\t'), err => {
//                         if (err) return console.error(err);
//                         let team1 = [];
//                         let team2 = [];

//                         for (const t of Object.keys(roster.team1)) {
//                             const name = (!bot.guilds.cache.first().members.cache.get(t).nickname) ? bot.guilds.cache.first().members.cache.get(t).user.username : bot.guilds.cache.first().members.cache.get(t).nickname;
//                             team1.push(name);
//                         }
//                         for (const t of Object.keys(roster.team2)) {
//                             const name = (!bot.guilds.cache.first().members.cache.get(t).nickname) ? bot.guilds.cache.first().members.cache.get(t).user.username : bot.guilds.cache.first().members.cache.get(t).nickname;
//                             team2.push(name);
//                         }

//                         const embed = new Discord.MessageEmbed().setTitle('5v5 Scrim Roster').setColor('#ff5555')
//                             .addField(`Team 1 - ${team1.length}`, team1.join('\n') || 'empty', true)
//                             .addField(`Team 2 - ${team2.length}`, team2.join('\n') || 'empty', true);
//                         message.channel.send(embed);
//                     });
//                 });
//             });
//         }

//         if (args[0] === 'clear') {
//             const roster = {
//                 "team1": {},
//                 "team2": {}
//             };
//             fs.writeFile('./games/scrim.json', JSON.stringify(roster, null, '\t'), err => {
//                 if (err) return console.error(err);
//                 message.channel.send('Scrim roster cleared.');
//             });
//         }

//         if (args[0] === 'end') {
//             child.stdin.write(`quit\n`);
//             message.channel.send('Server shutting down.');
//             const roster = {
//                 "team1": {},
//                 "team2": {}
//             };
//             fs.writeFile('./games/scrim.json', JSON.stringify(roster, null, '\t'), err => {
//                 if (err) return console.error(err);
//                 message.channel.send('Scrim roster cleared.');
//             });
//         }

//         if (args[0] === 'start') {
//             if (!args[1]) return message.channel.send('Specify a map to play in. PLEASE PLEASE PLEASE write the map name correctly');

//             // check for correct map name
//             // const activeMaps = ['de_anubis', 'de_cache', 'de_dust2', 'de_inferno', 'de_mirage', 'de_nuke', 'de_mutiny', 'de_overpass', 'de_swamp', 'de_vertigo'];
//             let map;
//             if (args[1] === 'random') {
//                 map = maps[Math.floor(Math.random() * maps.length)];
//                 message.channel.send(`Map selected: ${map}`);
//             } else {
//                 if (!maps.includes(args[1])) return message.channel.send('Map not found or not in active duty');
//                 map = args[1];
//             }

//             fs.readFile('./games/scrim.json', (err, content) => {
//                 if (err) return console.error(err);
//                 const roster = JSON.parse(content);
//                 if (Object.values(roster.team1).length != 5 && Object.values(roster.team2).length != 5) return message.channel.send('Not enough players for a scrim.');
//                 if (!Object.keys(roster.team1).includes(message.author.id) && !Object.keys(roster.team2).includes(message.author.id)) return message.channel.send('You are not on the scrim roster. Sod off.');

//                 const rosterArray = Object.values(roster.team1);
//                 const scrimRoster = new Roster(rosterArray);

//                 fs.writeFile(`${CSGO_PATH}/csgo/addons/sourcemod/configs/get5/scrim_template.cfg`, scrimRoster.config, async err => {
//                     if (err) return console.error(err);
//                     child.stdin.write(`./srcds_run -game csgo -tickrate 128 -net_port_try 1 -console -usercon +game_type 0 +game_mode 1 +map ${map} +maxplayers 12\n`);
//                     const msg = await message.channel.send('Server spinning up...');
//                     bot.setTimeout(() => {
//                         msg.edit(`\`${connect}\``);
//                     }, 20000);
//                 });
//             });
//         }

//         if (args[0] === 'test') {
//             if (message.author.id != '197530293597372416') return;

//             // const mapFiles = await fs.promises.readdir(`${CSGO_PATH}/csgo/maps`).filter(file => file.endsWith('.bsp'));
//             // const maps = [];
//             // for (const m of mapFiles) {
//             //     const map = m.slice(0, -4);
//             //     maps.push(map);
//             // }
//             // if (!maps.includes(args[1])) return message.channel.send('No map found with that name');

//             // const rosterArray = ['STEAM_0:1:52265309', 'STEAM_1:1:.....', 'STEAM_1:1:.....', 'STEAM_1:1:.....', 'STEAM_1:1:.....'];
//             // const testRoster = new Roster(rosterArray);

//             // fs.writeFile(`${CSGO_PATH}/csgo/addons/sourcemod/configs/get5/scrim_template.cfg`, testRoster.config, async err => {
//             //     if (err) return console.error(err);
//             //     child.stdin.write(`./srcds_run -debug -condebug -game csgo -tickrate 128 -net_port_try 1 -console -usercon +game_type 0 +game_mode 1 +map ${args[1]} +maxplayers 12\n`);
//             //     const msg = await message.channel.send('Spinning up test server');
//             //     bot.setTimeout(() => {
//             //         msg.edit(`\`${connect}\``);
//             //     }, 20000);
//             // });
//             // const activeMaps = ['de_anubis', 'de_cache', 'de_dust2', 'de_inferno', 'de_mirage', 'de_nuke', 'de_mutiny', 'de_overpass', 'de_swamp', 'de_vertigo'];
//             let map;
//             if (args[1] === 'random') {
//                 map = maps[Math.floor(Math.random() * maps.length)];
//                 message.channel.send(`Map selected: ${map}`);
//             } else {
//                 if (!maps.includes(args[1])) return message.channel.send('Map not found or not in active duty');
//                 map = args[1];
//             }
//         }

//         if (args[0] === 'write') {
//             fs.readFile('./games/scrim.json', (err, content) => {
//                 if (err) return console.error(err);
//                 const roster = JSON.parse(content);
//                 if (Object.values(roster.team1).length != 5 && Object.values(roster.team2).length != 5) return message.channel.send('Not enough players for a scrim.');
//                 if (!Object.keys(roster.team1).includes(message.author.id) && !Object.keys(roster.team2).includes(message.author.id)) return message.channel.send('You are not on the scrim roster. Sod off.');

//                 const rosterArray = Object.values(roster.team1);
//                 const scrimRoster = new Roster(rosterArray);

//                 fs.writeFile(`${CSGO_PATH}/csgo/addons/sourcemod/configs/get5/scrim_template.cfg`, scrimRoster.config, async err => {
//                     if (err) return console.error(err);
//                     message.channel.send('Scrim roster written to server file. Tell Geary to run this command on the server `./srcds_run -game csgo -tickrate 128 -net_port_try 1 -console -usercon +game_type 0 +game_mode 1 +map [map name] +maxplayers 12`');
//                 });
//             });
//         }
//     }
// }