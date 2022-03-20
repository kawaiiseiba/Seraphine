// const lyricsFinder = require('lyrics-finder')
// const { languages } = translate = require('@imlinhanchao/google-translate-api')
require('dotenv').config()
const Genius = require("genius-lyrics");
const Finder = new Genius.Client(process.env.GeniusToken)

module.exports = {
    name: 'lyrics',
    description: 'Searches the lyrics of the current song or by song title or artist.',
    options: [
        {
            name: 'title & artist',
            description: 'The "title by artist" search format.',
            type: 3
        }
    ],
    async execute(interaction, player, luka, error_logs, default_prefix) {
        try{
            const isDefault = (!interaction.options && !interaction.content.substring(0, interaction.content.indexOf(' ')))

            if (!interaction.member.voice.channel && isDefault) return await interaction.reply({ content: '❌ | You are not in a voice channel!', ephemeral: true })
            if ((interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) && isDefault)
                return await interaction.reply({ content: '❌ | You are not in my voice channel!', ephemeral: true })
            if(interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()

            const queue = player.getQueue(interaction.guildId)
    
            if ((!queue || !queue.playing) && isDefault) return interaction.type === `APPLICATION_COMMAND` ? 
                await interaction.followUp({content: '❌ | No music is being played!'}) :
                await interaction.reply({content: '❌ | No music is being played!'})

            const query = interaction.type === `APPLICATION_COMMAND` ? 
                interaction.options.getString('title_by_artist') :
                interaction.content.substring(0, interaction.content.indexOf(' ')) ? 
                    interaction.content.substring(0, interaction.content.indexOf(' ')) : 
                    `${queue.current.title} by ${queue.current.author}` 
            
            const searches = await Finder.songs.search(query)

            return console.log(searches)

            let lyrics = await lyricsFinder(author, title) 
                ? await lyricsFinder(author, title) 
                : await lyricsFinder(``, title) ? await lyricsFinder(``, title) : false

            // lyrics = !lyrics ? false : //lyricefind.com
            //     lyrics.match('--------------------------------------------------------------------------------') ?
            //     lyrics.split('--------------------------------------------------------------------------------')[0] : lyrics

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
        } catch (e){
            interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: 'There was an error trying to execute that command: ' + e.message }) :
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })

            error_logs.send({ embeds: handlers.errorInteractionLogs(interaction, e).embeds })
        }
    }
}