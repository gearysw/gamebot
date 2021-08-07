const { MessageActionRow, MessageButton } = require('discord.js');

const options = [{
    name: 'minutes',
    description: 'Minutes to wait to collect votes',
    type: 4,
    required: true
}, {
    name: 'question',
    description: 'What are you voting on?',
    type: 3,
    required: true
}];

for (let i = 1; i <= 10; i++) {
    let bool = false;
    if (i < 3) bool = true;
    const option = {
        name: `poll-option-${i}`,
        description: `Option ${i}`,
        type: 3,
        required: bool
    };

    options.push(option);
}

module.exports = {
    name: 'poll',
    description: 'Start a poll with up to 10 options, with results collected after the defined time in minutes',
    options: options,
    interact: async interaction => {
        const options = interaction.options.data;
        // console.log(options);
        interaction.reply({ content: 'Poll created', ephemeral: true });
        const pollOptions = options.slice(2);

        const channel = interaction.channel;

        //TODO figure out how to start a second row programmatically
        let messageContent = { content: options[1].value, components: [] };

        const row1 = new MessageActionRow();
        const row2 = new MessageActionRow();
        for ([i, o] of pollOptions.entries()) {
            if (i < 5) {
                row1.addComponents(new MessageButton().setCustomId(o.name).setLabel(o.value).setStyle('PRIMARY'));
                // messageContent['components'].push(row1);
            }
            if (i >= 5) {
                row2.addComponents(new MessageButton().setCustomId(o.name).setLabel(o.value).setStyle('PRIMARY'));
                // messageContent['components'].push(row2);
            }
        }
        messageContent['components'].push(row1);
        if (pollOptions.length > 5) messageContent['components'].push(row2);

        channel.send(messageContent);
    }
}