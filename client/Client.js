const {Client, Collection, Intents} = require('discord.js');

module.exports = class extends Client {
  constructor(config) {
    super({
        partials: ["CHANNEL"],
        intents: [
            Intents.FLAGS.GUILDS, 
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_BANS, 
            Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, 
            Intents.FLAGS.GUILD_INTEGRATIONS,
            Intents.FLAGS.GUILD_INVITES,
            Intents.FLAGS.GUILD_WEBHOOKS,
            Intents.FLAGS.GUILD_INVITES,
            Intents.FLAGS.GUILD_VOICE_STATES,
            Intents.FLAGS.GUILD_PRESENCES,
            Intents.FLAGS.GUILD_MESSAGES,
            // Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            // Intents.FLAGS.GUILD_MESSAGE_TYPING,
            Intents.FLAGS.DIRECT_MESSAGES,
            // Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
            // Intents.FLAGS.DIRECT_MESSAGE_TYPING
          ] ,
    })

    this.commands = new Collection()

    this.config = config
  }
}