const fs = require('fs')
const settings = require('../schemas/settings')

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

            const application_settings = (await settings.find()).find(data => data.application_id === luka.user.id)
            if(!application_settings) return await interaction.reply({
                content: `There's something wrong within our servers, please wait for a while and try again.`
            })
            
            const default_prefix = application_settings.server_prefix.find(data => data.guild_id === interaction.guild.id) ? 
                (application_settings.server_prefix.find(data => data.guild_id === interaction.guild.id)).prefix : 
                application_settings.default_prefix

            const embed = {
                title: `${luka.user.username} 🎶 | Commands`,
                color: 3092790,
                thumbnail: {
                    url: luka.user.displayAvatarURL({ dynamic: true })
                },
                description: `Supports __**Chat Commands**__ and __**Slash Commands**__ (NEW!)\n\n**Chat command**: \`${default_prefix}\` Example: \`${default_prefix}play <search>\`\n**Slash command**: \`/\` Example: \`/play <search>\`\n\n${commands.join('\n\n')}`
            }

            return interaction.type === `APPLICATION_COMMAND` ? 
                await interaction.followUp({ embeds: [embed] }) : 
                await interaction.reply({ embeds: [embed] })
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