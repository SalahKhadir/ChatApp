const express = require("express");
const Group = require("../models/Group");
const Message = require("../models/Message");

const router = express.Router();

// Create a new group
router.post("/create", async (req, res) => {
    const { name, members } = req.body;

    if (!name || !members || members.length === 0) {
        return res.status(400).json({ error: "Group name and members are required" });
    }

    try {
        const existingGroup = await Group.findOne({ name });
        if (existingGroup) {
            return res.status(400).json({ error: "Group name already exists" });
        }

        const newGroup = new Group({ name, members });
        await newGroup.save();

        res.json({ message: "Group created successfully", group: newGroup });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Get group messages
router.get("/messages/:groupName", async (req, res) => {
    try {
        const messages = await Message.find({ receiver: req.params.groupName, isGroup: true })
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "Server error fetching messages" });
    }
});

module.exports = router;
