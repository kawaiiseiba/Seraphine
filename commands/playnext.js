const handlers = require("../handlers/handlers")

module.exports = {
    name: 'playnext',
    description: 'Add a song to the top of the queue.',
    options: [
        {
            name: 'search',
            description: 'The song or playlist you want to play next.',
            type: 3,
            required: true
        }
    ],
    async execute(interaction, player, luka, error_logs, default_prefix) {
        try{
            if (!interaction.member.voice.channel) return void interaction.reply({ content: '❌ | You are not in a voice channel!', ephemeral: true })
            if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId)
                return void interaction.reply({ content: '❌ | You are not in my voice channel!', ephemeral: true })
            if(interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()

            const restrict = {
                content: `>>> Only those with \`ADMINISTRATOR\`, \`MANAGE_CHANNEL\`, \`MANAGE_ROLES\` permissions or with \`@DJ\` named role can use this command freely!\nBeing alone with **${luka.user.username}** works too!\nUse \`${default_prefix}dj <@user>\` or \`/dj user: <@user>\` to assign \`@DJ\` role to mentioned users.`
            }
            if(handlers.isVoiceAndRoleRestricted(interaction, true)) return void interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp(restrict) :
                interaction.reply(restrict)
      
            const query = interaction.type === `APPLICATION_COMMAND` ? 
                interaction.options.getString('search') : 
                interaction.content.substring(0, interaction.content.indexOf(' ')) ? interaction.content.substring(interaction.content.indexOf(' ') + 1) : false

            if(!query) return

            const queue = player.getQueue(interaction.guildId)
            if (!queue || !queue.playing) return void interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: '❌ | No music is being played!' }) :
                interaction.reply({ content: '❌ | No music is being played!' })

            const searchResult = await player.search(query, {
                requestedBy: interaction.type === `APPLICATION_COMMAND` ? interaction.user : interaction.author
            }).catch(() => {})
    
            if (!searchResult || !searchResult.tracks.length) return void interaction.type === `APPLICATION_COMMAND` ?
                interaction.followUp({content: 'No results were found!'}) :
                interaction.reply({content: 'No results were found!'})
      
            interaction.type === `APPLICATION_COMMAND` ? 
                await interaction.followUp({ content: `🔎 | **Searching ${searchResult.playlist ? 'playlist' : 'track'}...**` }) :
                await interaction.reply({ content: `🔎 | **Searching ${searchResult.playlist ? 'playlist' : 'track'}...**` })
            searchResult.playlist ? queue.insert(searchResult.tracks, 0) : queue.insert(searchResult.tracks[0], 0)
        } catch (e){
            interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: 'There was an error trying to execute that command: ' + e.message }) :
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })

            error_logs.send({ embeds: handlers.errorInteractionLogs(interaction, e).embeds })
        }
    }
}