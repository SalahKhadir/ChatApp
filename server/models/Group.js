const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    members: { type: [String], default: [] } // List of usernames in the group
});

module.exports = mongoose.model("Group", GroupSchema);
