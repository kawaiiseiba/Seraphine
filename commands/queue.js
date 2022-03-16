
module.exports = {
    name: 'queue',
    description: 'Shows all currently enqueued songs.',
    async execute(interaction, player, luka, error_logs, default_prefix) {
        try{
            if (!interaction.member.voice.channel) return await interaction.reply({ content: '❌ | You are not in a voice channel!', ephemeral: true })
            if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId)
                return await interaction.reply({ content: '❌ | You are not in my voice channel!', ephemeral: true })
            if(interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()
    
            const queue = player.getQueue(interaction.guildId)
            if (!queue || !queue.playing) 
                return interaction.type === `APPLICATION_COMMAND` ? 
                    await interaction.followUp({content: '❌ | No music is being played!'}) :
                    await interaction.reply({content: '❌ | No music is being played!'})
    
            const current = queue.current
    
            const upNext = queue.tracks.map((v,i) => {
                return `\`${i+1}.\` [${v.title}](${v.url})\n\`${v.duration} Requested by: ${v.requestedBy.tag}\``
            })
    
            const pagination = upNext.length <= 0 ? false : upNext.reduce((resultArray, item, index) => {
                const chunkIndex = Math.floor(index/10)
              
                if(!resultArray[chunkIndex]) {
                    resultArray[chunkIndex] = [] // start a new chunk
                }
              
                resultArray[chunkIndex].push(item)
              
                return resultArray
            }, [])
    
            let page = 1
    
            const total_page = !pagination ? 1 : pagination.length
            const user = (interaction.type === `APPLICATION_COMMAND` ? interaction.user : interaction.author)
    
            const embed = {
                title: `Queue for ${queue.guild.name}`,
                color: 3092790,
                description: `__**Now Playing**:__\n[${current.title}](${current.url})\n\`${current.duration} Requested by: ${current.requestedBy.tag}\`\n${pagination ? `\n__**Up Next**:__\n${pagination[0].join('\n\n')}` : ''}`,
                thumbnail: {
                    url: !queue.guild.iconURL() ? user.displayAvatarURL({ dynamic: true }) : queue.guild.iconURL()
                },
                footer: {
                    iconURL: user.displayAvatarURL({ dynamic: true }),
                    text: `Page ${page}/${total_page} | Loop: ${queue.repeatMode === 1 ? '✅' : '❌' } | Queue Loop: ${queue.repeatMode === 2 ? '✅' : '❌' }`
                }
            }
    
            const components = (page) => {
                return pagination.length < 1 ? [] : [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: "◄",
                                style: 1,
                                custom_id: "prev_page",
                                disabled: page === 1
                            },
                            {
                                type: 2,
                                label: "►",
                                style: 1,
                                custom_id: "next_page",
                                disabled: page === total_page
                            }
                        ]
                    }
                ]
            }
    
            const message = interaction.type === `APPLICATION_COMMAND` ? 
                await interaction.followUp({ embeds: [embed], components: components(page) }) : 
                await interaction.reply({ embeds: [embed], components: components(page) }) 
            
            
            if(pagination) {
                const filter = i => i.customId === 'prev_page' || i.customId === 'next_page' && i.user.id === (interaction.type === `APPLICATION_COMMAND` ? interaction.user.id : interaction.author.id)
    
                const collector = interaction.channel.createMessageComponentCollector({ filter, max: 18, time: 60000 })
    
                collector.on('collect', async i => {
                    try {
                        if (i.customId === 'prev_page') {
                            page -= 1
    
                            return await i.update({ 
                                embeds: [
                                    {
                                        color: 3092790,
                                        title: `Queue for ${queue.guild.name}`,
                                        description: `__**Now Playing**:__\n[${current.title}](${current.url})\n\`${current.duration} Requested by: ${current.requestedBy.tag}\`\n${upNext.length != 0 ? `\n__**Up Next**:__\n${pagination[page - 1].join('\n\n')}` : ''}`,
                                        thumbnail: {
                                            url: !queue.guild.iconURL() ? user.displayAvatarURL({ dynamic: true }) : queue.guild.iconURL()
                                        },
                                        footer: {
                                            iconURL: user.displayAvatarURL({ dynamic: true }),
                                            text: `Page ${page}/${pagination.length} | Loop: ${queue.repeatMode === 1 ? '✅' : '❌' } | Queue Loop: ${queue.repeatMode === 2 ? '✅' : '❌' }`
                                        }
                                    }
                                ],
                                components: components(page)
                            })
                        } else if (i.customId === 'next_page') {
                            page += 1
    
                            return await i.update({ 
                                embeds: [
                                    {
                                        color: 3092790,
                                        title: `Queue for ${queue.guild.name}`,
                                        description: `__**Now Playing**:__\n[${current.title}](${current.url})\n\`${current.duration} Requested by: ${current.requestedBy.tag}\`\n${upNext.length != 0 ? `\n__**Up Next**:__\n${pagination[page - 1].join('\n\n')}` : ''}`,
                                        thumbnail: {
                                            url: !queue.guild.iconURL() ? user.displayAvatarURL({ dynamic: true }) : queue.guild.iconURL()
                                        },
                                        footer: {
                                            iconURL: user.displayAvatarURL({ dynamic: true }),
                                            text: `Page ${page}/${pagination.length} | Loop: ${queue.repeatMode === 1 ? '✅' : '❌' } | Queue Loop: ${queue.repeatMode === 2 ? '✅' : '❌' }`
                                        }
                                    }
                                ],
                                components: components(page)
                            })
                        }
                    } catch(e) {
                        interaction.type === `APPLICATION_COMMAND` ? 
                            interaction.followUp({ content: 'There was an error trying to execute that interaction: ' + e.message, ephemeral: true }) :
                            interaction.reply({ content: 'There was an error trying to execute that interaction: ' + e.message })
            
                        error_logs.send({ embeds: handlers.errorInteractionLogs(interaction, e).embeds })
                    }
                })
    
                collector.on('end', async collected => {
                    const msg = collected.size <= 0 ? message : (Array.from(collected)[collected.size-1][1]).message
                    const components = [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    label: "◄",
                                    style: 2,
                                    custom_id: "prev_page",
                                    disabled: true
                                },
                                {
                                    type: 2,
                                    label: "►",
                                    style: 2,
                                    custom_id: "next_page",
                                    disabled: true
                                }
                            ]
                        }
                    ]
    
                    interaction.type === `APPLICATION_COMMAND` ? 
                        await interaction.editReply({ components }) : 
                        await msg.edit({ components })
                })
            }
        } catch (e){
            interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: 'There was an error trying to execute that command: ' + e.message }) :
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })

            error_logs.send({ embeds: handlers.errorInteractionLogs(interaction, e).embeds })
        }
    }
}