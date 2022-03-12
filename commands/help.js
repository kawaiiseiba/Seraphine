const fs = require('fs')
module.exports = {
    name: 'help',
    description: 'Shows information about available commands.',
    type: 1,
    async execute(interaction, player, luka, args) {
        try{
            if(interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()
            const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

            const commands = commandFiles.filter(i => i !== `help.js`).map(files => {
                const i = require(`./${files}`)

                return `🔻 \`${i.name}${i.options ? ` <${i.options[0].name}>` : ``}\` | ${i.description} ${i.options ? 
                    `__${capsFirst(i.options[0].name)}__: ${i.options[0].choices ? i.options[0].choices.map(i => `\`${i.name}\``).join(', ') : i.options[0].description}` : ``}`
            })

            return void interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ 
                    embeds: [{
                        title: `Commands`,
                        color: 3092790,
                        description: `**${luka.user.username}** music bot supports __**Chat Commands**__(classic way) and __**Slash Commands**__\n\n${commands.join('\n\n')}`
                    }]
                }) : interaction.reply({ 
                    embeds: [{
                        title: `Commands`,
                        color: 3092790,
                        description: `**${luka.user.username}** music bot supports __**Chat Commands**__(classic way) and __**Slash Commands**__\n\n${commands.join('\n\n')}`
                    }]
                })
        } catch (e){
            interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: 'There was an error trying to execute that command: ' + e.message }) :
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })

            args.error_logs.send({ embeds: args.handlers.errorInteractionLogs(interaction, e).embeds })
        }
    }
}

function capsFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}