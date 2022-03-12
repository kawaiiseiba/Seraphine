
module.exports = {
    name: 'stop',
    description: 'Luka will stop playing.',
    type: 1,
    async execute(interaction, player, luka, args) {
        try{
            if (!interaction.member.voice.channel) return void interaction.reply({ content: 'You are not in a voice channel!', ephemeral: true })
            if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) 
                return void interaction.reply({ content: 'You are not in my voice channel!', ephemeral: true })
            if(interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()

            const queue = player.getQueue(interaction.guildId)
            if (!queue || !queue.connection) return void interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: '❌ | No music is being played!' }) :
                interaction.reply({ content: '❌ | No music is being played!' })
    
            queue.destroy()
            return queue.destroyed ? interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({content: `🛑 | ${luka.user.username} stopped playing!`}) : 
                interaction.reply({content: `🛑 | ${luka.user.username} stopped playing!`}) : console.log("Cannot go further because the queue is destroyed")
        } catch (e){
            interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: 'There was an error trying to execute that command: ' + e.message }) :
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })

            args.error_logs.send({ embeds: args.handlers.errorInteractionLogs(interaction, e).embeds })
        }
    }
}