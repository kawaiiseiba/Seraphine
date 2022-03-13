
module.exports = {
    name: 'shuffle',
    description: 'Shuffle the queue.',
    type: 1,
    async execute(interaction, player, luka, args) {
        try{
            if (!interaction.member.voice.channel) return void interaction.reply({ content: 'You are not in a voice channel!', ephemeral: true })
            if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) 
                return void interaction.reply({ content: 'You are not in my voice channel!', ephemeral: true })
            if(interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()

            const queue = player.getQueue(interaction.guildId)
            if (!queue || !queue.playing) return void interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({content: '❌ | No music is being played!'}) :
                interaction.reply ({content: '❌ | No music is being played!'})
                
            queue.shuffle()
            interaction.tyoe === `APPLICATION_COMMAND` ? 
                await interaction.followUp({ content: '✅ | Queue has been shuffled!' }) : 
                await interaction.reply({ content: '✅ | Queue has been shuffled!' })
        } catch (e){
            interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: 'There was an error trying to execute that command: ' + e.message }) :
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })

            args.error_logs.send({ embeds: args.handlers.errorInteractionLogs(interaction, e).embeds })
        }
    }
}