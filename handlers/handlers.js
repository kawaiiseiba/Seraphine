const { Permissions } = require('discord.js')

module.exports = {
    interactionLogs(interaction){
        return {
            embeds: [
                {
                    title: interaction.guild.name,
                    color: 3092790,
                    thumbnail: {
                        url: interaction.guild.iconURL()
                    },
                    fields: [
                        {
                            name: `User`,
                            value: `\`\`\`${(interaction.type === `DEFAULT` ? interaction.author : interaction.user).tag}\`\`\``,
                            inline: true
                        },
                        {
                            name: `Interaction Type`,
                            value: `\`\`\`${interaction.type}\`\`\``,
                            inline: true
                        },
                        {
                            name: `‏‏‎ ‎‎`,
                            value: `‎‏‏‎ ‎`,
                            inline: true
                        },
                        ...(isComponent(interaction)),
                        {
                            name: `Time`,
                            value: `<t:${Math.floor(Date.now() / 1000)}:F>`
                        }
                    ]
                }
            ]
        }
    },
    errorInteractionLogs(interaction, e){
        const data = interaction.options ? interaction.options.data[0] : false

        const hasOptions = !data ? [] : !data.options ? [] : data.options.map(i => {
            return `${i.name}: ${i.value}`
        })

        const interactionUsed = interaction.type === `DEFAULT` ? 
            `**Chat Command** \`\`\`${interaction.content}\`\`\`` : interaction.type === 'APPLICATION_COMMAND' ? 
            `**Slash Command** \`\`\`/${interaction.commandName} ${hasOptions.join(' ')}\`\`\`` : interaction.isButton() ? 
            `**Button Component** \`\`\`${interaction.customId}\`\`\`` : 
            `**Select Menu** \`\`\`${interaction.customId}\`\`\``

        let interactionData = { ...interaction }

        if(interaction.type === `DEFAULT` && !delete interactionData.embeds) return console.log(`Failed to remove Object Key "embeds" from interaction`)
        if(interaction.type === `DEFAULT` && !delete interactionData.reactions) return console.log(`Failed to remove Object Key "embeds" from interaction`)
        if(!delete interactionData.member) return console.log(`Failed to remove Object Key "members" from interaction`)
        if(!delete interactionData.webhook) return console.log(`Failed to remove Object Key "webhook" from interaction`)
        if(interactionData.message && !delete interactionData.message) return console.log(`Failed to remove Object Key "message" from interaction`)

        return {
            embeds: [
                {
                    color: 3092790,
                    description: `${interactionUsed}\n**Raw Data**\n\`\`\`json\n${JSON.stringify(interactionData, null, 2)}\`\`\`\n**Error message**\n\`\`\`${e}\`\`\``,
                    fields: [
                        {
                            name: `Time`,
                            value: `<t:${Math.floor(Date.now() / 1000)}:F>`
                        }
                    ]
                }
            ]
        }
    },
    guildJoined(luka, guild, owner){
        return {
            embeds: [
                {
                    color: 3092790,
                    title: guild.name,
                    description: `${luka.user.username} joins a new guild!`,
                    thumbnail: {
                        url: guild.iconURL()
                    },
                    fields: [
                        {
                            name: `Owner`,
                            value: `${owner.username}#${owner.discriminator}`,
                            inline: true
                        },
                        {
                            name: `Members`,
                            value: guild.memberCount.toLocaleString(),
                            inline: true
                        },
                        {
                            name: `Date joined`,
                            value: `<t:${Math.floor(Date.now() / 1000)}:F>`
                        }
                    ]
                }
            ]
        }
    },
    isVoiceAndRoleRestricted(interaction, isVoiceNeeded = false){
        const isConnected = isVoiceNeeded ? interaction.member.voice.channel.members.filter(m => !m.user.bot) : false
        const hasDJ = interaction.member.roles.cache.some(role => role.name === 'DJ')
        const hasPerms = (interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS) || interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES))

        return (isConnected && !(isConnected.size <= 1)) && (!hasDJ && !hasPerms) || !isVoiceNeeded && (!hasDJ && !hasPerms)
    }
}

function isComponent(interaction){

    const data = interaction.options ? interaction.options.data[0] : false

    const hasOptions = !data ? [] : !data.options ? [] : data.options.map(i => {
        return `${i.name}: ${i.value}`
    })

    return interaction.type === `DEFAULT` ? [
        {
            name: `Chat Command`,
            value: `\`\`\`${interaction.content}\`\`\``,
            inline: true
        },
        {
            name: `‏‏‎ ‎‎`,
            value: `‎‏‏‎ ‎`,
            inline: true
        }
    ] : interaction.type !== `DEFAULT` && interaction.type !== `APPLICATION_COMMAND` ? [
        {
            name: `Component Type`,
            value: `\`\`\`${interaction.componentType}\`\`\``,
            inline: true
        },
        {
            name: `Component ID`,
            value: `\`\`\`${interaction.customId}\`\`\``,
            inline: true
        },
        {
            name: `‏‏‎ ‎‎`,
            value: `‎‏‏‎ ‎`,
            inline: true
        }
    ] : [
        {
            name: `Slash Command`,
            value: `\`\`\`/${interaction.commandName} ${hasOptions.join(' ')}\`\`\``,
            inline: true
        },
        {
            name: `‏‏‎ ‎‎`,
            value: `‎‏‏‎ ‎`,
            inline: true
        }
    ]
}