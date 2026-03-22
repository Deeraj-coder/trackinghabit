const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema({
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
    date: { type: String, required: true },     // YYYY-MM-DD format
    completed: { type: Boolean, default: true },
}, { timestamps: true });

habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HabitLog', habitLogSchema);
