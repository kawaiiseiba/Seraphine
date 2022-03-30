const handlers = require("../handlers/handlers")

module.exports = {
    name: 'play',
    description: 'Play Youtube/Spotify music.',
    options: [
        {
            name: 'search',
            description: 'The song or playlist you want to play.',
            type: 3,
            required: true
        }
    ],
    async execute(interaction, player, luka, error_logs, default_prefix) {
        try{
            const query = interaction.type === `APPLICATION_COMMAND` ? 
                interaction.options.getString('search') : 
                interaction.content.substring(0, interaction.content.indexOf(' ')) ? interaction.content.substring(interaction.content.indexOf(' ') + 1) : false
            
            if(!query) return
    
            const vc = interaction.member.voice
    
            if(!vc.channelId) return await interaction.reply({ content: `${(interaction.type === `APPLICATION_COMMAND` ? interaction.user : interaction.author).toString()} You need to be in a voice channel to play music!`, ephemeral: true })
            if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) 
                return await interaction.reply({ content: '❌ | You are not in my voice channel!', ephemeral: true, })
    
            const queue = player.createQueue(interaction.guild, {
                metadata: {
                    channel: interaction.channel
                },
                // leaveOnEmptyCooldown: 30000,
                ytdlOptions: {
                    quality: 'highest',
                    filter: 'audioonly',
                    highWaterMark: 1 << 25,
                    dlChunkSize: 0
                },
                initialVolume: 50
            })
    
            try {
                if (!queue.connection) await queue.connect(interaction.member.voice.channel)
            } catch {
                queue.destroy()
                return await interaction.reply({ content: "Could not join your voice channel!", ephemeral: true })
            }

            if (interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()
            const searchResult = await player.search(query, {
                requestedBy: interaction.type === `APPLICATION_COMMAND` ? interaction.user : interaction.author
            }).catch(() => {})
    
            const not_found = `>>> No results were found!\nCheck whether the song or playlist exists publicly.\nI won't play songs that is flagged inappropriate, age-restricted or offensive.`
    
            if (!searchResult || !searchResult.tracks.length)return interaction.type === `APPLICATION_COMMAND` ? 
                await interaction.followUp({content: not_found }) : 
                await interaction.reply({ content: not_found })

            const result = `🔎 | **Searching ${searchResult.playlist ? 'playlist' : 'track'}...**`

            interaction.type === `APPLICATION_COMMAND` ? 
                await interaction.followUp({ content: result }) :
                await interaction.reply({ content: result })
    
            searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0])
            if (!queue.playing) await queue.play()
        } catch (e){
            console.log(e)
            interaction.type === `APPLICATION_COMMAND` ? 
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message, ephemeral: true }) :
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })
        
            error_logs.send({ embeds: handlers.errorInteractionLogs(interaction, e).embeds })
        }
    }
}