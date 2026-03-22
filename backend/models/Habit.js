const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: 'Other', trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
