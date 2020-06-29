module.exports = {
    name: 'roll',
    aliases: ['rolldice', 'diceroll', 'dice'],
    description: 'Roll XdY dice\nX = number of dice\nY = number of sides',
    category: 'Miscellaneous',
    showInHelp: true,
    easteregg: false,
    usage: 'XdY',
    args: true,
    execute: async (bot, message, args, child) => {
        if (args[0].match(/\dd\d/)) {
            let numDice = parseInt(args[0].split('d')[0]);
            let diceType = parseInt(args[0].split('d')[1]);
            let min = Math.ceil(numDice);
            let max = Math.floor(numDice * diceType);
            let num = Math.floor(Math.random() * (max - min + 1) + min);
            if (num === 69) {
                message.channel.send(`${num}...Nice`);
            } else {
                if (message.author.id === '327778816359399424' && (num > 1000 || num === Infinity)) {
                    message.channel.send('Stop it, Nils.');
                    return;
                }
                message.channel.send(num);
            }
        } else {
            if (args[0].match(/d\d/)) {
                let diceType = parseInt(args[0].split('d')[1]);
                let num = Math.floor(Math.random() * diceType) + 1;
                message.channel.send(`${num}\nBut please, follow the bloody syntax!`);

            } else {
                message.channel.send('Follow the syntax!');
            }
        }
    }
}