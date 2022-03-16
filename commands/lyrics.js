const lyricsFinder = require('lyrics-finder')
const { languages } = translate = require('@imlinhanchao/google-translate-api')

module.exports = {
    name: 'lyrics',
    description: 'Searches the lyrics of the current song or by song title or artist',
    options: [
        {
            name: 'title',
            description: 'The title of the song',
            type: 3
        },
        {
            name: 'artist',
            description: 'The title of the song',
            type: 3
        }
    ],
    async execute(interaction, player, luka, error_logs, default_prefix) {
        try{
            const isDefault = (!interaction.options && !interaction.content.substring(0, interaction.content.indexOf(' ')))
            console.log(isDefault)

            if (!interaction.member.voice.channel && isDefault) return await interaction.reply({ content: '❌ | You are not in a voice channel!', ephemeral: true })
            if ((interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) && isDefault)
                return await interaction.reply({ content: '❌ | You are not in my voice channel!', ephemeral: true })
            if(interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()

            const queue = player.getQueue(interaction.guildId)
    
            if ((!queue || !queue.playing) && isDefault) return interaction.type === `APPLICATION_COMMAND` ? 
                await interaction.followUp({content: '❌ | No music is being played!'}) :
                await interaction.reply({content: '❌ | No music is being played!'})
    
            let { title, author } = interaction.type === `APPLICATION_COMMAND` ? 
                { 
                    title: interaction.options.getString('search') ? interaction.options.getString('search') : ``,
                    author: interaction.options.getString('author') ? interaction.options.getString('author') : ``,
                } :
                interaction.content.substring(0, interaction.content.indexOf(' ')) ? 
                {
                    title: interaction.content.substring(interaction.content.indexOf(' ') + 1).split('-')[0],
                    author: interaction.content.substring(interaction.content.indexOf(' ') + 1).split('-')[1] ? 
                        interaction.content.substring(interaction.content.indexOf(' ') + 1).split('-')[1].trim() : `` 
                }
                : queue.current

            let lyrics = await lyricsFinder(author, title) 
                ? await lyricsFinder(author, title) 
                : await lyricsFinder(``, title) ? await lyricsFinder(``, title) : false

            lyrics = !lyrics ? false : //lyricefind.com
                lyrics.match('--------------------------------------------------------------------------------') ?
                lyrics.split('--------------------------------------------------------------------------------')[0] : lyrics

            if(!lyrics) return void interaction.type === `APPLICATION_COMMAND` 
                ? await interaction.followUp({ content: `❌ | Lyrics not found!` }) 
                : await interaction.reply({ content: `❌ | Lyrics not found!` })


            const lined_lyrics = lyrics.split('\n')
            const detected_language = languages[(await translate(lined_lyrics[0], {to: 'en'})).from.language.iso]

            const data = detected_language.toLowerCase() !== `english` && detected_language.toLowerCase() !== `filipino` ? 
                lined_lyrics.map(async i => {
                    if(i.length < 1) return i
                    return (await translate(i, {to: 'en'})).raw[0][0]
                }) : lyrics.split('\n')

            const raw = await Promise.all(data)

            let str = ``
            
            const split_lyrics = raw.reduce((result, v, i) => {
                str += v
                const index = Math.floor(str.length/3500)
              
                if(!result[index]) {
                    result[index] = [] // start a new chunk
                }
              
                result[index].push(v)
              
                return result
            }, [])

            return void split_lyrics.map(async (v,i) => {
                const result = v.join('\n')

                if(i < 1) return void interaction.type === `APPLICATION_COMMAND` 
                    ? await interaction.followUp({ content: `>>> **${title}**\n\n${result}` }) 
                    : await interaction.reply({ content: `>>> **${title}**\n\n${result}` })

                return void interaction.type === `APPLICATION_COMMAND` 
                    ? await interaction.followUp({ content: `>>> ${result}` }) 
                    : await interaction.channel.send({ content: `>>> ${result}` })
            })

            return console.log(result)
            
            return void interaction.type === `APPLICATION_COMMAND` 
                ? await interaction.followUp({ content: `>>> **${title}**\n\n${result}` }) 
                : await interaction.reply({ content: `>>> **${title}**\n\n${result}` })
        } catch (e){
            interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: 'There was an error trying to execute that command: ' + e.message }) :
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })

            error_logs.send({ embeds: handlers.errorInteractionLogs(interaction, e).embeds })
        }
    }
}