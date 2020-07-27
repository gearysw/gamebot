module.exports = {
    name: 'stdin',
    description: 'write stdin commands to child process',
    execute: async (bot, message, args, child) => {
        if (message.author.id != '197530293597372416') return message.channel.send(`Hey, you're not Geary.`);

        child.stdin.write(`${args.join(' ')}\n`);

        message.channel.send(`Command \`${args.join(' ')}\` sent to child process.`);
    }
}