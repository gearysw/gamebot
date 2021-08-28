module.exports = {
    name: 'roll',
    description: 'Roll XdY dice\nX = number of dice\nY = number of sides',
    options: [{
            name: 'dice',
            type: 3,
            description: 'Dice to roll (XdY)',
            required: true
        },
        {
            name: 'verbose',
            type: 5,
            description: 'Set to true to return the value of each rolled die',
            required: false
        }
    ],
    execute: async (bot, message, args, child) => {
        if (['v', 'verbose'].includes(args[1])) return rollVerbose(args);
        return roll(args);
    },
    interact: async interaction => {
        const dice = interaction.options.getString('dice');
        const verbose = interaction.options.getBoolean('verbose')

        if (verbose) return interaction.reply(await rollVerbose([dice]))
        interaction.reply(await roll([dice]))
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