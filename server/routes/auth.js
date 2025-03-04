const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const SECRET_KEY = "your_secret_key"; // Change this in production

// Signup Route
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();

        const token = jwt.sign({ username: newUser.username }, "your_secret_key", { expiresIn: "1h" });

        res.status(201).json({ token, username: newUser.username });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign({ username: user.username }, "your_secret_key", { expiresIn: "1h" });

        res.json({ token, username: user.username });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


module.exports = router;
