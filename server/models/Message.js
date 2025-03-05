const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true }, // Can be a user OR a group name
    text: { type: String, required: true },
    isGroup: { type: Boolean, default: false }, // Indicates if it's a group message
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", MessageSchema);
