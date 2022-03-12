
module.exports = {
    name: 'remove',
    description: 'Remove a specific track.',
    type: 1,
    async execute(interaction, player, luka, args) {
        try{
            if (!interaction.member.voice.channel) return void interaction.reply({ content: 'You are not in a voice channel!', ephemeral: true })
            if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId)
                return void interaction.reply({ content: 'You are not in my voice channel!', ephemeral: true })
            if(interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()

            const queue = player.getQueue(interaction.guildId)
            if (!queue || !queue.playing) return void interaction.followUp({content: '❌ | No music is being played!'})

            const number = interaction.type === `APPLICATION_COMMAND` ? 
                interaction.options.getInteger('track') - 1 : 
                interaction.content.substring(0, interaction.content.indexOf(' ')) ? parseInt(interaction.content.substring(interaction.content.indexOf(' ') + 1)) - 1 : false

            if(!number) return
            if (number > queue.tracks.length) return void interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: '❌ | Track number greater than queue depth!' }) :
                interaction.reply({ content: '❌ | Track number greater than queue depth!' })
    
            const removedTrack = queue.remove(number)

            return void interaction.type === `APPLICATION_COMMAND`? 
                await interaction.followUp({ content: removedTrack ? `✅ | Removed **${removedTrack}**!` : '❌ | Something went wrong!' }): 
                await interaction.reply({ content: removedTrack ? `✅ | Removed **${removedTrack}**!` : '❌ | Something went wrong!' })
        } catch (e){
            interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: 'There was an error trying to execute that command: ' + e.message }) :
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })

            args.error_logs.send({ embeds: args.handlers.errorInteractionLogs(interaction, e).embeds })
        }
    }
}