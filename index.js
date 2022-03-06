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

const GAMES_VC = require('./schemas/games_voice')

const db = mongoose.connection
db.on('error', e => console.log({ message: e.message }))

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    luka.commands.set(command.name, command)
}

const slashCommands = require('./modules/slash-commands')

const { Player, QueueRepeatMode } = require("discord-player")
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
  
player.on('error', (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`)
})

player.on('connectionError', (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`)
    queue.skip()
})

player.on("trackStart", (queue, track) => {
    if(queue.guild.id !== OfficialServer) return queue.guild.channels.cache.get('890153344956514335').send(`🎶 | Now playing **${track.title}** in **${queue.connection.channel.name}**!\n${track.url}`)
    queue.metadata.channel.send(`🎶 | Now playing **${track.title}** in **${queue.connection.channel.name}**!`)
})

player.on('trackAdd', (queue, track) => queue.metadata.channel.send(`🎶 | Track **${track.title}** queued!`))

player.on('botDisconnect', queue => {
    queue.metadata.channel.send('❌ | **I was manually disconnected from the voice channel, clearing queue!**')
})

player.on('channelEmpty', (queue, track) => queue.metadata.channel.send('❌ | Nobody is in the voice channel, leaving...'))

player.on('queueEnd', (queue, track) => {
    queue.metadata.channel.send('✅ | **Queue finished!**')
})

luka.on('interactionCreate', async interaction => {
    try{
        if(!interaction.inGuild()) return await interaction.reply({ content: `⚠️ **This command cannot be used in private messages**`})
        if(!interaction.isCommand()) return

        const data = (await settings.find())[0]

        if(!data) return await interaction.reply({
            content: `There's something wrong within our servers, please wait for a while and try again.`,
            ephemeral: true
        })

        if(data.isMaintenance.isExist) return await interaction.reply({
            content: `${luka.user.username} is under maintenance.\nReason: ${data.isMaintenance.reason}`
        })

        const misc = [ data.reminders.isExist, data.isDonationNeeded.isExist ]

        const command = luka.commands.get(interaction.commandName)
        command.execute(interaction, player, luka, misc)    

    } catch(e) {
        console.log(e);
        interaction.followUp({
            content: 'There was an error trying to execute that command: ' + e.message,
        })
    }
})

luka.on('messageCreate', async msg => {
    if(msg.author.bot) return
    if(msg.channel.type == 'DM') return await msg.reply({ content: `⚠️ **Command cannot be used in private messages**`})
    if(!msg.content.startsWith('.')) return

    const content = msg.content
    const pos_command = content.substring(0, content.indexOf(' '))
    if(!pos_command) return

    const command = luka.commands.get(pos_command.substring(1))

    command.execute(msg, player, luka)
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
