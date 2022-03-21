// const lyricsFinder = require('lyrics-finder')
// const { languages } = translate = require('@imlinhanchao/google-translate-api')
require('dotenv').config()
const Genius = require("genius-lyrics");
const handlers = require('../handlers/handlers');
const Finder = new Genius.Client(process.env.GeniusLyrics)

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
            const isDefault = (interaction.type === `APPLICATION_COMMAND` && interaction.options.data.length < 1) || interaction.type !== `APPLICATION_COMMAND` && !interaction.content?.substring(0, interaction.content.indexOf(' '))

            if (!interaction.member.voice.channel && isDefault) return await interaction.reply({ content: '❌ | You are not in a voice channel!', ephemeral: true })
            if ((interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) && isDefault)
                return await interaction.reply({ content: '❌ | You are not in my voice channel!', ephemeral: true })
            if(interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()

            const queue = player.getQueue(interaction.guildId)
    
            if (typeof queue === "undefined" && isDefault) return interaction.type === `APPLICATION_COMMAND` ? 
                await interaction.followUp({content: '❌ | No music is being played!'}) :
                await interaction.reply({content: '❌ | No music is being played!'})

            const query = isDefault ? 
                queue.current.title : interaction.type === `APPLICATION_COMMAND` ? 
                    interaction.options.getString('title_by_artist') : 
                    interaction.content?.substring(interaction.content.indexOf(' ') + 1)

            const searches = await Finder.songs.search(query)

            const { title, artist } = query.split('by').length <= 1 ? 
                { title: query, artist: null } :
                { title: query.split('by')[0].trim(), artist: query.split('by')[1].trim() }

            const filter = searches.find(song => artist && song.artist.name.toLowerCase().includes(artist))

            const song = filter ? filter : searches[0]

            if(!song) return await interaction.type === `APPLICATION_COMMAND` 
                ? await interaction.followUp({ content: `❌ | Lyrics not found!` }) 
                : await interaction.reply({ content: `❌ | Lyrics not found!` })

            const lyrics = (await song.lyrics()).split('\n\n')

            let str = ``
            
            const split_lyrics = lyrics.reduce((result, v, i) => {
                str += v
                const index = Math.floor(str.length/1100)
              
                if(!result[index]) {
                    result[index] = [] // start a new chunk
                }
              
                result[index].push(v)
              
                return result
            }, [])

            split_lyrics.map(async (v,i) => {
                const result = v.join('\n\n')

                const embed = {
                    title: song.title,
                    color: 3092790,
                    thumbnail: {
                        url: song.image
                    },
                    description: `**Artist**: \`${song.artist.name}\`\n\n\`\`\`${result}\`\`\``
                }

                if(i < 1) return interaction.type === `APPLICATION_COMMAND` 
                    ? await interaction.followUp({ embeds: [embed] }) 
                    : await interaction.reply({ embeds: [embed] })

                const additional_embed = {
                    color: 3092790,
                    description: `\`\`\`${result}\`\`\``
                }

                await interaction.channel.send({ embeds: [additional_embed] })
            })
        } catch (e){
            console.log(e)
            interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: 'There was an error trying to execute that command: ' + e.message }) :
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })

            error_logs.send({ embeds: handlers.errorInteractionLogs(interaction, e).embeds })
        }
    }
}