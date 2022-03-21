const handlers = require("../handlers/handlers")

module.exports = {
    name: 'jump',
    description: 'Jump to a specific track.',
    options: [
        {
            name: 'tracks',
            description: 'The number of tracks to skip',
            type: 4,
            required: true
        }
    ],
    async execute(interaction, player, luka, error_logs, default_prefix) {
        try{
            if (!interaction.member.voice.channel) return await interaction.reply({ content: '❌ | You are not in a voice channel!', ephemeral: true })
            if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId)
                return await interaction.reply({ content: '❌ | You are not in my voice channel!', ephemeral: true })
            if(interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()

            const restrict = {
                content: `>>> Only those with \`ADMINISTRATOR\`, \`MANAGE_CHANNEL\`, \`MANAGE_ROLES\` permissions or with \`@DJ\` named role can use this command freely!\nBeing alone with **${luka.user.username}** works too!\nUse \`${default_prefix}dj <@user>\` or \`/dj user: <@user>\` to assign \`@DJ\` role to mentioned users.`
            }
            if(handlers.isVoiceAndRoleRestricted(interaction, true)) return await interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp(restrict) :
                interaction.reply(restrict)
    
            const queue = player.getQueue(interaction.guildId)
            if (typeof queue === "undefined") return interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: '❌ | No music is being played!' }) :
                interaction.reply({ content: '❌ | No music is being played!' })
            
            const trackIndex = interaction.type === `APPLICATION_COMMAND` ? 
                interaction.options.getInteger('tracks') - 1 : 
                interaction.content.substring(0, interaction.content.indexOf(' ')) ? parseInt(interaction.content.substring(interaction.content.indexOf(' ') + 1)) - 1 : false 
            
            if(!trackIndex) return
            if (trackIndex > queue.tracks.length) return interaction.type === `APPLICATION_COMMAND` ?  
                await interaction.followUp({ content: '❌ | Track number greater than queue length!' }) :
                await interaction.reply({ content: '❌ | Track number greater than queue length!' })
    
            const trackName = queue.tracks[trackIndex].title
            queue.jump(trackIndex)
    
            return interaction.type === `APPLICATION_COMMAND` ?
                await interaction.followUp({ content: `⏭ | **${trackName}** has jumped the queue!` }) :
                await interaction.reply({ content: `⏭ | **${trackName}** has jumped the queue!` })
        } catch (e){
            interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: 'There was an error trying to execute that command: ' + e.message }) :
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })

            error_logs.send({ embeds: handlers.errorInteractionLogs(interaction, e).embeds })
        }
    }
}