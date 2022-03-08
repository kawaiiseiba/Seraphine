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

const db = mongoose.connection
db.on('error', e => console.log({ message: e.message }))

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  luka.commands.set(command.name, command);
}

const slashCommands = require('./modules/slash-commands')

const { Player, QueueRepeatMode } = require("discord-player")
const player = new Player(luka)
// const player = new Player(luka, {
//   ytdlOptions: {
//     quality: 'highest',
//     filter: 'audioonly',
//     highWaterMark: 1 << 25,
//     dlChunkSize: 0
//   }
// })

const resetStatusActivity = () => {

    const status = [ 
        { 
            name: `your requests 🎶`,
            type: 'LISTENING',
        },
        { 
            name: `for donations~`,
            type: 'WATCHING',
        }
    ]

    luka.user.setPresence({ 
        activities: [ status[getRandomIntInclusive(0, status.length - 1)] ],
        status: 'online'
    })
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min) //The maximum is inclusive and the minimum is inclusive
}
  
player.on('error', (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`)
})

player.on('connectionError', (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`)
})

player.on("trackStart", (queue, track) => {
    if(queue.guild.id !== OfficialServer) return queue.metadata.channel.send(`🎶 | Now playing **${track.title}** in **${queue.connection.channel.name}**!`)  
    queue.guild.channels.cache.get('890153344956514335').send(`▶ | Now playing **${track.title}** in **${queue.connection.channel.name}**!\n${track.url}`)
})

player.on('trackAdd', (queue, track) => queue.metadata.channel.send(`🎶 | Track **${track.title}** added to the queue!`))
player.on('botDisconnect', queue => queue.metadata.channel.send(`❌ | I was manually disconnected from **${queue.connection.channel.name}**, clearing queue!`))
player.on('channelEmpty', queue => queue.metadata.channel.send('❌ | Nobody is in the voice channel, leaving...'))
player.on('queueEnd', queue => queue.metadata.channel.send('✅ | **Queue finished!**'))

luka.on('interactionCreate', async interaction => {
  try{
    if(!interaction.inGuild()) return
    if(!interaction.isCommand()) return

    const command = luka.commands.get(interaction.commandName)
    command.execute(interaction, player, luka)    

  } catch(e) {
    console.log(error);
    interaction.followUp({
      content: 'There was an error trying to execute that command: ' + error.message,
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

//   await slashCommands(luka)
  const datenow = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
  console.log(`Seraphine went online~\nDate: ${datenow}`)
})

luka.login(process.env.Seraphine)
