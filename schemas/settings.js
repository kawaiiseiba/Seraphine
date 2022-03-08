const mongoose = require('mongoose')

const settings = new mongoose.Schema({
    reminders: {
        isExist: Boolean,
        reason: String
    },
    isDonationNeeded: {
        isExist: Boolean,
        reason: String
    },
    isMaintenance: {
        isExist: Boolean,
        reason: String
    },
    changelog: [{
        version: String,
        text: String
    }],
    application_id: {
        type: String,
        required: true
    },
    default_prefix: {
        type: String,
        required: true
    },
    server_prefix: [{
        guild_id: String,
        prefix: String
    }]
}, { collection: 'music_settings' })

module.exports = mongoose.model('MusicSettings', settings)