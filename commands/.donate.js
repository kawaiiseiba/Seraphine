module.exports = {
    name: 'donate',
    description: 'Keeps the server running.',
    async execute(interaction, player, luka, args) {
        try{
            const author = luka.users.cache.get('851062978416869377')

            const embed = {
                color: 3092790,
                author: {
                    name: author.username,
                    icon_url: author.displayAvatarURL({ dynamic: true })
                },
                description: `Created ${luka.user.username} music bot, because of increased demands.`,
                thumbnail: {
                    url: author.displayAvatarURL({ dynamic: true })
                },
                fields: [
                    {
                        name: `Want to keep ${luka.user.username} running?`,
                        value: `<:kofi:896972221577306142> Buy me a [☕ Coffee](https://ko-fi.com/kawaiiseiba)\n\nDear potential supporter, I would like to use the opportunity to thank you in advance for your support. Buying me a coffee or giving me tips will certainly not make me rich, but it can help to keep the server up & running.\n\nThank you very much!`
                    }
                ]
            }

            const components = {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Donate",
                        emoji: {
                            name: `☕`
                        },
                        style: 1,
                        custom_id: "donate",
                        disabled: false
                    },
                    {
                        type: 2,
                        label: "Join our Support Server",
                        emoji: {
                            name: `invite`,
                            id: `658538493949116428`
                        },
                        style: 5,
                        url: `https://discord.gg/GFnCHrTE`
                    }
                ]
            }
            
            return void interaction.type === `APPLICATION_COMMAND` 
                ? await interaction.followUp({ embeds:[embed], components: [components] }) 
                : await interaction.reply({ embeds:[embed], components: [components] })
        } catch (e){
            interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: 'There was an error trying to execute that command: ' + e.message }) :
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })

            args.error_logs.send({ embeds: args.handlers.errorInteractionLogs(interaction, e).embeds })
        }
    }
}