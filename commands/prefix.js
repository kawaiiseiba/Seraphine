const settings = require('../schemas/settings')

module.exports = {
    name: 'prefix',
    description: 'Change command prefix.',
    options: [
        {
            name: 'set',
            type: 4,
            description: 'Characters except whitespace and "/", Max length 2.',
            required: false
        }
    ],
    async execute(interaction, player, luka, args) {
        try{
            const prefix = interaction.type === `APPLICATION_COMMAND` ? 
                interaction.options.getString('set') : 
                interaction.content.substring(0, interaction.content.indexOf(' ')) ? interaction.content.substring(interaction.content.indexOf(' ') + 1) : false
            
            if(interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()

            const application_settings = (await settings.find()).find(data => data.application_id === luka.user.id)
            if(!application_settings) return await interaction.reply({
                content: `There's something wrong within our servers, please wait for a while and try again.`
            })
            
            const default_prefix = application_settings.server_prefix.find(data => data.guild_id === interaction.guild.id) ? 
                (application_settings.server_prefix.find(data => data.guild_id === interaction.guild.id)).prefix : 
                application_settings.default_prefix

            if(!prefix) return void await interaction.reply({ content: `⚙️ | This server prefix is \`${default_prefix}\`, Example: \`${default_prefix}play\``, ephemeral: true  })
            if(prefix.length === 1 && prefix === `/`) return void await interaction.reply({ content: `❌ | This prefix is already available in slash commands!`, ephemeral: true  })
            if(prefix.length > 2) return void await interaction.reply({ content: `❌ | A maximum of 2 character length only!`, ephemeral: true })
            if(interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()

            const hasPrefix = application_settings.server_prefix.find(data => data.guild_id === interaction.guild.id)
            if(hasPrefix) hasPrefix.prefix = prefix 
            if(!hasPrefix) application_settings.server_prefix.push({
                guild_id: interaction.guild.id,
                prefix: prefix
            })

            if(await application_settings.save()) return void interaction.type === `APPLICATION_COMMAND` ? 
                await interaction.followUp({ content: `✅ | Prefix has been set to \`${prefix}\`!` }) : 
                await interaction.reply({ content: `✅ | Prefix has been set to \`${prefix}\`!` })

            return void interaction.type === `APPLICATION_COMMAND` ? 
                await interaction.followUp({ content: '❌ | Something went wrong!' }) :
                await interaction.reply({ content: '❌ | Something went wrong!' })

        } catch (e){
            interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: 'There was an error trying to execute that command: ' + e.message }) :
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })

            args.error_logs.send({ embeds: args.handlers.errorInteractionLogs(interaction, e).embeds })
        }
    }
}