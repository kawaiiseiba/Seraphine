require('dotenv').config()
const fs = require('fs')
const Discord = require('discord.js')
const Client = require('./client/Client')
const handlers = require('./handlers/handlers')

const luka = new Client()
luka.commands = new Discord.Collection()

const [ OfficialServer, InteractionLogs, ErrorLogs, GuildJoined, GuildLeave, GuildCount ] = 
    [ process.env.OfficialServer, process.env.InteractionLogs, process.env.ErrorLogs, process.env.GuildJoined, process.env.GuildLeave, process.env.GuildCount ]

const mongoose = require('mongoose')
mongoose.connect(process.env.AkashicRecords, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).catch(console.log)

const settings = require('./schemas/settings')

const db = mongoose.connection
db.on('error', e => console.log({ message: e.message }))

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    luka.commands.set(command.name, command)
}

const { Player } = require("discord-player")
const player = new Player(luka)

const slashCommands = async (luka) => {

    const slash_commands = await luka.api.applications(luka.user.id).commands().get()

    if(slash_commands.length > 0) return
    const commands = commandFiles.map(async files => {
        const slash = require(`./commands/${files}`)

        const { execute, ...command } = slash

        await luka.api.applications(luka.user.id).commands.post({
            data: command
        }).then(`Success: ${slash}`)
        .catch(console.error)
    })

    await Promise.all(commands).then(async () => {
        console.log(await luka.api.applications(luka.user.id).commands.get())
    })
}

const resetStatusActivity = () => {
    const status = [
        { 
            name: `your requests 🎶`,
            type: 'LISTENING',
        },
        // { 
        //     name: `for donations. 🎶`,
        //     type: 'WATCHING',
        // },
    ]

    luka.user.setPresence({ 
        activities: [ status[getRandomIntInclusive(0, status.length-1)] ],
        status: 'online'
    })
}

const getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// Player Events
player.on('error', (queue, error) => console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`))
player.on('connectionError', (queue, error) => console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`))
player.on("trackStart", (queue, track) => {
    queue.guild.id === OfficialServer ? 
        queue.guild.channels.cache.get('890153344956514335').send(`**Playing** 🎶 \`${track.title}\` - Now  in 🔉**${queue.connection.channel.name}**!\n${track.url}`) : 
        queue.metadata.channel.send(`**Playing** 🎶 \`${track.title}\` - Now in 🔉**${queue.connection.channel.name}**!`)
})
player.on('trackAdd', (queue, track) => queue.metadata.channel.send(`🎶 | **Track** \`${track.title}\` - Queued!`))
player.on('botDisconnect', queue => queue.metadata.channel.send(`❌ | I was manually disconnected from 🔉**${queue.connection.channel.name}**, clearing queue!`))
player.on('channelEmpty', queue => queue.metadata.channel.send(`❌ | Nobody is in 🔉**${queue.connection.channel.name}**, leaving...`))
player.on('queueEnd', queue => queue.metadata.channel.send('✅ | **Queue finished!**'))

luka.on('interactionCreate', async interaction => {
    const altria = luka.guilds.cache.get(OfficialServer)
    const interaction_logs = altria.channels.cache.get(InteractionLogs)
    const error_logs = altria.channels.cache.get(ErrorLogs)

    try{
        if(!interaction) return interaction.channel.send({ content: `Failed to handle interaction~` })
        if(!interaction.inGuild()) return await interaction.reply({ content: `⚠️ **This command cannot be used in private messages**`})
        if(!interaction.isCommand()) return

        const application_settings = (await settings.find()).find(data => data.application_id === luka.user.id)

        if(!application_settings) return await msg.reply({
            content: `There's something wrong within our servers, please wait for a while and try again.`
        })

        if(application_settings.isMaintenance.isExist) return await interaction.reply({
            content: `${luka.user.username} is under maintenance.\nReason: ${application_settings.isMaintenance.reason}`
        })

        const default_prefix = application_settings.server_prefix.find(data => data.guild_id === interaction.guild.id) ? 
            (application_settings.server_prefix.find(data => data.guild_id === interaction.guild.id)).prefix : 
            application_settings.default_prefix

        const command = luka.commands.get(interaction.commandName)
        
        command.execute(interaction, player, luka, error_logs, default_prefix)    
        interaction_logs.send({ embeds: handlers.interactionLogs(interaction).embeds })

    } catch(e) {
        error_logs.send({ embeds: handlers.errorInteractionLogs(interaction, e).embeds })
    }
})

luka.on('messageCreate', async interaction => {
    const altria = luka.guilds.cache.get(OfficialServer)
    const interaction_logs = altria.channels.cache.get(InteractionLogs)
    const error_logs = altria.channels.cache.get(ErrorLogs)

    try{
        if(interaction.author.bot) return
        if(interaction.channel.type == 'DM') return await interaction.reply({ content: `⚠️ **Commands cannot be used in private messages**`})
    
        const application_settings = (await settings.find()).find(data => data.application_id === luka.user.id)
    
        if(!application_settings) return await interaction.reply({
            content: `There's something wrong within our servers, please wait for a while and try again.`
        })
    
        const default_prefix = application_settings.server_prefix.find(data => data.guild_id === interaction.guild.id) ? 
            (application_settings.server_prefix.find(data => data.guild_id === interaction.guild.id)).prefix : 
            application_settings.default_prefix
    
        if(!interaction.content.startsWith(default_prefix)) return  
    
        const content = interaction.content
        const pos_command = content.substring(0, content.indexOf(' ')) ?
            content.substring(0, content.indexOf(' ')) : 
            content.substring(content.indexOf(' ') + 1)

        if(application_settings.isMaintenance.isExist) return await interaction.reply({
            content: `${luka.user.username} is under maintenance.\nReason: ${data.isMaintenance.reason}`
        })
    
        const command = luka.commands.get((pos_command.substring(1)).toLowerCase())
        if(!command) return
        
        command.execute(interaction, player, luka, error_logs, default_prefix)

        interaction_logs.send({ embeds: handlers.interactionLogs(interaction).embeds })
    } catch(e) {
        console.log(e)
        error_logs.send({ embeds: handlers.errorInteractionLogs(interaction, e).embeds })
    }
})

luka.on('guildCreate', async guild => {
    const owner = luka.users.cache.get(guild.ownerId)

    const altria = luka.guilds.cache.get(OfficialServer)
    const guild_logs = altria.channels.cache.get(GuildJoined)
    const guild_count = luka.guilds.cache.size
    const guild_count_vc = altria.channels.cache.get(GuildCount)

    await guild_logs.send({ embeds: handlers.guildJoined(luka, guild, owner).embeds })
    await guild_count_vc.setName(`Guilds Joined: ${guild_count.toLocaleString()}`)
})

luka.on('guildDelete', async guild => {
    const altria = melty.guilds.cache.get(OfficialServer)
    const guild_logs = altria.channels.cache.get(GuildJoined)
    const guild_count = melty.guilds.cache.size
    const guild_count_vc = altria.channels.cache.get(GuildCount)

    await guild_logs.send({ content: `**${luka.user.username}** leaves **${guild.name}** server @ <t:${Math.floor(Date.now() / 1000)}:F>` })
    await guild_count_vc.setName(`Guilds Joined: ${guild_count.toLocaleString()}`)
})

luka.once('ready', async () => {
  resetStatusActivity()

  /*************************************
  *
  *  ADDING SLASH COMMAND PERMISSIONS
  *
  *************************************/

  // const GUILD = luka.guilds.cache.get(OfficialServer)
  // const MANAGER_CMD = await GUILD.commands.fetch('915845240445886484')

  // const manager_permissions = {
  //   id: '908962125546934312',
  //   type: 'ROLE',
  //   permission: true,
  // }

  // MANAGER_CMD.permissions.add({ permissions: [manager_permissions] }).then(console.log)

    await slashCommands(luka)
    const datenow = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
    console.log(`Seraphine went online~\nDate: ${datenow}`)

    const altria = luka.guilds.cache.get(OfficialServer)
    
    const guild_count = luka.guilds.cache.size
    const guild_count_vc = altria.channels.resolve(GuildCount)

    guild_count_vc.setName(`Guilds Joined: ${guild_count.toLocaleString()}`)
})

luka.login(process.env.Seraphine)
