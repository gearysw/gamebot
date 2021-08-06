module.exports = {
    name: 'roll',
    description: 'Roll XdY dice\nX = number of dice\nY = number of sides',
    options: [
        // {
        //     name: 'dice',
        //     type: 'STRING',
        //     description: 'Dice to roll (XdY)',
        //     required: true
        // },
        {
            name: 'total',
            type: 1,
            description: 'Return total of rolled dice',
            options: [{
                name: 'dice',
                type: 3,
                description: 'Dice to roll (XdY)',
                required: true
            }]
        },
        {
            name: 'verbose',
            type: 1,
            description: 'Return value of each rolled die',
            options: [{
                name: 'dice',
                type: 3,
                description: 'Dice to roll (XdY)',
                required: true
            }]
        }
    ],
    // execute: async (bot, message, args, child) => {
    //     if (args[0].match(/^[1-9]\d*d[1-9]\d*$/)) {

    //         if (args[1] === 'v' || args[1] === 'verbose') {
    //             const numDice = parseInt(args[0].split('d')[0]);
    //             const diceType = parseInt(args[0].split('d')[1]);
    //             let diceRolls = [];
    //             for (let i = 0; i < numDice; i++) {
    //                 const roll = Math.ceil(Math.random() * diceType);
    //                 diceRolls.push(roll);
    //             }

    //             const total = diceRolls.reduce((a, b) => {
    //                 return a + b;
    //             }, 0);

    //             const msg = `${diceRolls.join(' + ')} = ${total}`;
    //             message.channel.send(msg);
    //         } else {
    //             let numDice = parseInt(args[0].split('d')[0]);
    //             let diceType = parseInt(args[0].split('d')[1]);
    //             let min = Math.ceil(numDice);
    //             let max = Math.floor(numDice * diceType);
    //             let num = Math.floor(Math.random() * (max - min + 1) + min);

    //             if (num === 69) {
    //                 message.channel.send(`${num}...Nice`);
    //             } else {
    //                 if (message.author.id === '327778816359399424' && (num > 10000 || num === Infinity)) {
    //                     message.channel.send('Stop it, Nils.');
    //                     return;
    //                 }
    //                 message.channel.send(num.toString());
    //             }
    //         }
    //     } else {
    //         if (args[0].match(/d\d/)) {
    //             let diceType = parseInt(args[0].split('d')[1]);
    //             let num = Math.floor(Math.random() * diceType) + 1;
    //             message.channel.send(`${num}\nBut please, follow the bloody syntax!`);

    //         } else {
    //             message.channel.send('Follow the syntax!');
    //         }
    //     }
    // },
    execute: async (bot, message, args, child) => {
        if (['v', 'verbose'].includes(args[1])) return rollVerbose(args);
        return roll(args);
    },
    interact: async interaction => {
        const subcommand = interaction.options.getSubcommand();
        const args = interaction.options.getString('dice');
        // console.log(interaction.options);
        let dice;
        // const Roll = await roll(args);
        if (subcommand === 'total') dice = await roll([args]);
        if (subcommand === 'verbose') dice = await rollVerbose([args]);
        interaction.reply(dice);
        // interaction.reply('test');
    }
}

async function roll(args) {
    if (!args[0].match(/^[1-9]\d*d[1-9]\d*$/)) return 'Please follow the syntax XdY, where X is number of dice and Y is type of dice.';

    const numDice = parseInt(args[0].split('d')[0]);
    const diceType = parseInt(args[0].split('d')[1]);
    let diceRolls = [];
    for (let i = 0; i < numDice; i++) {
        const roll = Math.ceil(Math.random() * diceType);
        diceRolls.push(roll);
    }

    const total = diceRolls.reduce((a, b) => {
        return a + b;
    }, 0);

    return total.toString();
}

async function rollVerbose(args) {
    if (!args[0].match(/^[1-9]\d*d[1-9]\d*$/)) return 'Please follow the syntax XdY, where X is number of dice and Y is type of dice.';

    const numDice = parseInt(args[0].split('d')[0]);
    const diceType = parseInt(args[0].split('d')[1]);
    let diceRolls = [];
    for (let i = 0; i < numDice; i++) {
        const roll = Math.ceil(Math.random() * diceType);
        diceRolls.push(roll);
    }

    const total = diceRolls.reduce((a, b) => {
        return a + b;
    }, 0);

    return `${diceRolls.join(' + ')} = ${total}`
}