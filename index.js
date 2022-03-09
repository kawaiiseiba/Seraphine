require('dotenv').config()
const fs = require('fs')
const Discord = require('discord.js')
const Client = require('./client/Client')

const luka = new Client()
luka.commands = new Discord.Collection()

const OfficialServer = process.env.OfficialServer

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

const slashCommands = require('./modules/slash-commands')

const { Player } = require("discord-player")
const player = new Player(luka)

const resetStatusActivity = () => {
    const status = [
        { 
            name: `your requests 🎶`,
            type: 'LISTENING',
        },
        { 
            name: `for donations. 🎶`,
            type: 'WATCHING',
        },
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
        queue.guild.channels.cache.get('890153344956514335').send(`**Playing** 🎶 \`${track.title}\` - Now  in 🔈**${queue.connection.channel.name}**!\n${track.url}`) : 
        queue.metadata.channel.send(`**Playing** 🎶 \`${track.title}\` - Now in **${queue.connection.channel.name}**!`)
})
player.on('trackAdd', (queue, track) => queue.metadata.channel.send(`🎶 | **Track** \`${track.title}\` - Queued!`))
player.on('botDisconnect', queue => queue.metadata.channel.send(`❌ | **I was manually disconnected from 🔈**${queue.connection.channel.name}**, clearing queue!**`))
player.on('channelEmpty', queue => queue.metadata.channel.send(`❌ | Nobody is in 🔈**${queue.connection.channel.name}**, leaving...`))
player.on('queueEnd', queue => queue.metadata.channel.send('✅ | **Queue finished!**'))

luka.on('interactionCreate', async interaction => {
    try{
        if(!interaction.inGuild()) return await interaction.reply({ content: `⚠️ **This command cannot be used in private messages**`})
        if(!interaction.isCommand()) return

        const application_settings = (await settings.find()).find(data => data.application_id === luka.user.id)

        if(!application_settings) return await msg.reply({
            content: `There's something wrong within our servers, please wait for a while and try again.`
        })

        if(application_settings.isMaintenance.isExist) return await interaction.reply({
            content: `${luka.user.username} is under maintenance.\nReason: ${data.isMaintenance.reason}`
        })

        const command = luka.commands.get(interaction.commandName)
        command.execute(interaction, player, luka)    

    } catch(e) {
        console.log(e);
        interaction.followUp({
            content: 'There was an error trying to execute that command: ' + e.message,
        })
    }
})

luka.on('messageCreate', async msg => {
    try{
        if(msg.author.bot) return
        if(msg.channel.type == 'DM') return await msg.reply({ content: `⚠️ **Command cannot be used in private messages**`})
    
        const application_settings = (await settings.find()).find(data => data.application_id === luka.user.id)
    
        if(!application_settings) return await msg.reply({
            content: `There's something wrong within our servers, please wait for a while and try again.`
        })
    
        const default_prefix = application_settings.server_prefix.find(data => data.guild_id === msg.guild.id) ? 
            (application_settings.server_prefix.find(data => data.guild_id === msg.guild.id)).prefix : 
            application_settings.default_prefix
    
        if(!msg.content.startsWith(default_prefix)) return
    
        const content = msg.content
        const pos_command = content.substring(0, content.indexOf(' '))
    
        if(!pos_command) return
        if(application_settings.isMaintenance.isExist) return await interaction.reply({
            content: `${luka.user.username} is under maintenance.\nReason: ${data.isMaintenance.reason}`
        })
    
        const command = luka.commands.get(pos_command.substring(1))
    
        if(!command) return
        command.execute(msg, player, luka)
    } catch(e) {
        msg.reply({
            content: 'There was an error trying to execute that command: ' + e.message,
        })
    }
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

    // await slashCommands(luka)
    const datenow = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
    console.log(`Seraphine went online~\nDate: ${datenow}`)
})

luka.login(process.env.Seraphine)
