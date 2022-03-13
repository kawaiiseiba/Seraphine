const lyricsFinder = require('lyrics-finder')
const { languages } = translate = require('@imlinhanchao/google-translate-api')

module.exports = {
    name: 'lyrics',
    description: 'Searches the lyrics of the current playing song.',
    type: 1,
    async execute(interaction, player, luka, args) {
        try{
            if (!interaction.member.voice.channel) return await interaction.reply({ content: 'You are not in a voice channel!', ephemeral: true })
            if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId)
                return await interaction.reply({ content: 'You are not in my voice channel!', ephemeral: true })
            if(interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()

            const queue = player.getQueue(interaction.guildId)
    
            if (!queue || !queue.connection) return interaction.type === `APPLICATION_COMMAND` ? 
                await interaction.followUp({content: '❌ | No music is being played!'}) :
                await interaction.reply({content: '❌ | No music is being played!'})
    
            let { title, author } = queue.current

            const lyrics = await lyricsFinder(author, title) 
                ? await lyricsFinder(author, title) 
                : await lyricsFinder(``, title) ? await lyricsFinder(``, title) : false

            if(!lyrics) return void interaction.type === `APPLICATION_COMMAND` 
                ? await interaction.followUp({ content: `> Lyrics not found!` }) 
                : await interaction.reply({ content: `> Lyrics not found!` })

            const lined_lyrics = lyrics.split('\n')
            const detected_language = languages[(await translate(lined_lyrics[0], {to: 'en'})).from.language.iso]

            const data = detected_language.toLowerCase() !== `english` || detected_language.toLowerCase() !== `filipino` ? 
                lined_lyrics.map(async i => {
                    if(i.length < 1) return i
                    return (await translate(i, {to: 'en'})).raw[0][0]
                }) : lyrics

            const raw = await Promise.all(data)
            
            const result = raw.reduce((result, v, i) => {
                const chunkIndex = Math.floor([...result[]]/10)
              
                if(!resultArray[chunkIndex]) {
                    resultArray[chunkIndex] = [] // start a new chunk
                }
              
                resultArray[chunkIndex].push(item)
              
                return resultArray
                if(!result[i]) result[i] = []

                const index = result[i].join(' ').length >= 4000 ? i+1 : i

                if(result[i].join(' ').length >= 4000) {
                    result[index] = []
                }

                result[index].push(v)

                return result
            }, [])

            return console.log(result)
            
            return void interaction.type === `APPLICATION_COMMAND` 
                ? await interaction.followUp({ content: `>>> **${title}**\n\n${result}` }) 
                : await interaction.reply({ content: `>>> **${title}**\n\n${result}` })
        } catch (e){
            interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: 'There was an error trying to execute that command: ' + e.message }) :
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })

            args.error_logs.send({ embeds: args.handlers.errorInteractionLogs(interaction, e).embeds })
        }
    }
}