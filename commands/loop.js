const { QueueRepeatMode } = require("discord-player")
const handlers = require("../handlers/handlers")

module.exports = {
    name: 'loop',
    description: 'Set loop mode.',
    options: [
        {
            name: 'mode',
            type: 4,
            description: 'Loop type',
            required: true,
            choices: [
                {
                    name: 'Off',
                    value: QueueRepeatMode.OFF,
                },
                {
                    name: 'Track',
                    value: QueueRepeatMode.TRACK,
                },
                {
                    name: 'Queue',
                    value: QueueRepeatMode.QUEUE,
                },
                {
                    name: 'Autoplay',
                    value: QueueRepeatMode.AUTOPLAY,
                },
            ]
        },
    ],
    async execute(interaction, player, luka, error_logs, default_prefix) {
        try{
            if (!interaction.member.voice.channel) return await interaction.reply({ content: '❌ | You are not in a voice channel!', ephemeral: true })
            if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId)
                return await interaction.reply({ content: '❌ | You are not in my voice channel!', ephemeral: true })
            if (interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()

            const restrict = {
                content: `>>> Only those with \`ADMINISTRATOR\`, \`MANAGE_CHANNEL\`, \`MANAGE_ROLES\` permissions or with \`@DJ\` named role can use this command freely!\nBeing alone with **${luka.user.username}** works too!\nUse \`${default_prefix}dj <@user>\` or \`/dj user: <@user>\` to assign \`@DJ\` role to mentioned users.`
            }
            if(handlers.isVoiceAndRoleRestricted(interaction, true)) return interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp(restrict) :
                interaction.reply(restrict)
    
            const queue = player.getQueue(interaction.guildId)
            if (typeof queue === "undefined") return interaction.type === `APPLICATION_COMMAND` ? 
                await interaction.followUp({content: '❌ | No music is being played!'}) : 
                await interaction.reply({content: '❌ | No music is being played!'})
    
            const loopMode = interaction.type === `APPLICATION_COMMAND` ? 
                interaction.options.getInteger('mode') : 
                interaction.content.substring(interaction.content.indexOf(' ') + 1) ? QueueRepeatMode[interaction.content.substring(interaction.content.indexOf(' ') + 1).toUpperCase()] : false
    
            if(!loopMode) return
    
            const success = queue.setRepeatMode(loopMode)
            const mode = loopMode === QueueRepeatMode.TRACK ? '🔂' : loopMode === QueueRepeatMode.QUEUE ? '🔁' : '▶'
    
            interaction.type === `APPLICATION_COMMAND` ? 
                await interaction.followUp({ content: success ? `${mode} | Updated loop mode!` : '❌ | Could not update loop mode!' }) :
                await interaction.reply({ content: success ? `${mode} | Updated loop mode!` : '❌ | Could not update loop mode!' })
        } catch (e){
            interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: 'There was an error trying to execute that command: ' + e.message }) :
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })

            error_logs.send({ embeds: handlers.errorInteractionLogs(interaction, e).embeds })
        }
    }
}