
module.exports = {
    name: 'nowplaying',
    description: `See what's currently being played.`,
    type: 1,
    async execute(interaction, player, luka, args) {
        try{
            if (!interaction.member.voice.channel) return void await interaction.reply({ content: 'You are not in a voice channel!', ephemeral: true })
            if (interaction.guild.me.voice.channelId &&interaction.member.voice.channelId !== interaction.guild.me.voice.channelId)
                return void await interaction.reply({ content: 'You are not in my voice channel!', ephemeral: true })
            if(interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()
            
            const queue = player.getQueue(interaction.guildId)
            if (!queue || !queue.playing) return void interaction.type === `APPLICATION_COMMAND` ?
                await interaction.followUp({content: '❌ | No music is being played!'}) :
                await interaction.reply({content: '❌ | No music is being played!'})
    
            const current = queue.current

            const progress = queue.createProgressBar()
            const perc = queue.getPlayerTimestamp()
    
            const embed = {
                author: {
                    name: `Now Playing`,
                    iconURL: (interaction.type === `APPLICATION_COMMAND` ? interaction.user : interaction.author).displayAvatarURL({ dynamic: true })
                },
                title: current.title,
                url: current.url,
                color: 3092790,
                thumbnail: {
                    url: current.thumbnail,
                },
                fields: [
                    {
                        name: `Channel`,
                        value: current.author,
                        inline: true
                    },
                    {
                        name: `Duration`,
                        value: current.duration,
                        inline: true
                    },
                    {
                        name: '\u200b',
                        value: progress.replace(/ 0:00/g, ' ◉ LIVE')
                    }
                ],
                footer: {
                    iconURL: current.requestedBy.displayAvatarURL({ dynamic: true }),
                    text: `Requested by: ${current.requestedBy.tag}`
                }
            }
    
            return void interaction.type === `APPLICATION_COMMAND` ? 
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