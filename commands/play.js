const playdl = require('play-dl')

module.exports = {
    name: 'play',
    description: 'Play Youtube/Spotify music',
    type: 1,
    options: [
        {
            name: 'search',
            description: 'Search through youtube or use youtube/spotify links or playlist links',
            type: 3,
            required: true
        }
    ],
    async execute(interaction, player, luka, misc = []) {

        const query = interaction.type === `APPLICATION_COMMAND` ? 
        interaction.options.getString('search') : 
        interaction.content.substring(interaction.content.indexOf(' ') + 1)

        const vc = interaction.member.voice

        if(!vc.channelId) return await interaction.reply({ content: `${interaction.user.toString()} You need to be in a voice channel to play music!`, ephemeral: true })
        if (
            interaction.guild.me.voice.channelId &&
            interaction.member.voice.channelId !== interaction.guild.me.voice.channelId
        ) return await interaction.reply({ content: 'You are not in my voice channel!', ephemeral: true, })

        const queue = player.createQueue(interaction.guild, {
            metadata: {
                channel: interaction.channel
            },
            leaveOnEmptyCooldown: 30000,
            ytdlOptions: {
                quality: 'highest',
                filter: 'audioonly',
                highWaterMark: 1 << 25,
                dlChunkSize: 0
            }
        })

        try {
            if (!queue.connection) await queue.connect(interaction.member.voice.channel)
        } catch {
            queue.destroy()
            return await interaction.reply({ content: "Could not join your voice channel!", ephemeral: true })
        }

        if (interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()
        const searchResult = await player.search(query, {
            requestedBy: interaction.user
        }).catch(() => {})

        const not_found = '> No results were found!'

        if (!searchResult || !searchResult.tracks.length) 
            return interaction.type === `APPLICATION_COMMAND` ? 
                await interaction.followUp({content: not_found }) : 
                await interaction.reply({ content: not_found })

        const result = `⏱ | Loading your ${searchResult.playlist ? 'playlist' : 'track'}...`

        interaction.type === `APPLICATION_COMMAND` ? 
        await interaction.followUp({ content: result }) :
        await interaction.reply({ content: result })

        searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0])
        if (!queue.playing) await queue.play()
    }
}