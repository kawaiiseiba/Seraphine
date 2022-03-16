const handlers = require('../handlers/handlers')
const settings = require('../schemas/settings')

module.exports = {
    name: 'dj',
    description: 'Set and assign @DJ role to user.',
    options: [
        {
            name: 'user',
            type: 6,
            description: 'User to assign @DJ role.',
            required: true
        }
    ],
    async execute(interaction, player, luka, error_logs, default_prefix) {
        try{

            const user = interaction.type === `APPLICATION_COMMAND` ? 
                interaction.options.getUser('user') : 
                interaction.mentions.users.first() ? interaction.mentions.users.first() : false

            if(!user) return
            if(user.bot) return
            if(interaction.type === `APPLICATION_COMMAND`) await interaction.deferReply()

            const restrict = {
                content: `>>> Only those with \`ADMINISTRATOR\`, \`MANAGE_CHANNEL\`, \`MANAGE_ROLES\` permissions or with \`@DJ\` named role can use this command freely!\nBeing alone with **${luka.user.username}** works too!\nUse \`${default_prefix}dj <@user>\` or \`/dj user: <@user>\` to assign \`@DJ\` role to mentioned users.`
            }
            if(handlers.isVoiceAndRoleRestricted(interaction, false)) return void interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp(restrict) :
                interaction.reply(restrict)

            const member = await interaction.guild.members.cache.get(user.id)

            if(member.roles.cache.some(role => role.name === 'DJ')) return void interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: `✅ | ${user.toString()}, Already got the role!` }) :
                interaction.reply({ content:  `✅ | ${user.toString()}, Already got the role!` })

            const isDJExist = interaction.guild.roles.cache.find(role => role.name === `DJ`)

            const djRole = isDJExist ? isDJExist : await interaction.guild.roles.create({
                name: 'DJ',
                color: '#e1299e',
                reason: `${luka.user.username} will give role for accessibility`,
                permissions: []
            }).catch(e => {
                interaction.type === `APPLICATION_COMMAND` ? 
                    interaction.followUp({ content: 'There was an error trying to execute that command: ' + e.message }) :
                    interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })

                error_logs.send({ embeds: handlers.errorInteractionLogs(interaction, e).embeds })
            })

            if(!djRole) return void interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: `🚫 | **${luka.user.username}** doesn't have \`Manage Roles\` permission. Try again after you give me \`Manage Roles\` permission...`}) :
                interaction.reply({ content: `🚫 | **${luka.user.username}** doesn't have \`Manage Roles\` permission. Try again after you give me \`Manage Roles\` permission...`})

            member.roles.add(djRole)

            const content = `✅ | \`@${djRole.name}\` role has been ${!isDJExist ? `created & assigned` : `assigned`} to ${user.toString()}`
            return void interaction.type === `APPLICATION_COMMAND` ? 
                await interaction.followUp({ content }) :
                await interaction.reply({ content })

        } catch (e){
            interaction.type === `APPLICATION_COMMAND` ? 
                interaction.followUp({ content: 'There was an error trying to execute that command: ' + e.message }) :
                interaction.reply({ content: 'There was an error trying to execute that command: ' + e.message })

            error_logs.send({ embeds: handlers.errorInteractionLogs(interaction, e).embeds })
        }
    }
}