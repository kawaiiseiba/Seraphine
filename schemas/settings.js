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
    }]
}, { collection: 'music_settings' })

module.exports = mongoose.model('MusicSettings', settings)