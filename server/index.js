const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const WebSocket = require("ws");
const authRoutes = require("./routes/auth");
const Message = require("./models/Message"); // Import the Message model

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);

const MONGO_URI = "mongodb://localhost:27017/chatapp"; // Change if using MongoDB Atlas

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.log("❌ MongoDB Connection Error:", err));

const wss = new WebSocket.Server({ server });

let onlineUsers = {}; // Store connected users

// Fetch previous messages between two users
app.get("/messages/:user1/:user2", async (req, res) => {
    const { user1, user2 } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        }).sort({ createdAt: 1 }); // Sort by oldest messages first

        res.json(messages);
    } catch (error) {
        console.error("❌ Error fetching messages:", error);
        res.status(500).json({ error: "Server error fetching messages" });
    }
});

wss.on("connection", (ws) => {
    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === "login") {
                onlineUsers[data.username] = ws;
                console.log(`🟢 ${data.username} connected`);

                // Send list of online users
                const usersList = Object.keys(onlineUsers);
                usersList.forEach((user) => {
                    if (onlineUsers[user]) {
                        onlineUsers[user].send(JSON.stringify({ type: "online_users", users: usersList }));
                    }
                });

            } else if (data.type === "private_message") {
                const { sender, receiver, text } = data;
                
                // Save message to database
                const newMessage = new Message({ sender, receiver, text });
                await newMessage.save();

                const messageData = { type: "private_message", sender, text, private: true };

                // Send message to receiver if online
                if (onlineUsers[receiver]) {
                    onlineUsers[receiver].send(JSON.stringify(messageData));
                }
                
                // Send message back to sender
                if (onlineUsers[sender]) {
                    onlineUsers[sender].send(JSON.stringify(messageData));
                }
            } 
            
            else if (data.type === "fetch_messages") {
                const { user1, user2 } = data;

                // Fetch previous messages from MongoDB
                const messages = await Message.find({
                    $or: [
                        { sender: user1, receiver: user2 },
                        { sender: user2, receiver: user1 }
                    ]
                }).sort({ createdAt: 1 });

                ws.send(JSON.stringify({ type: "chat_history", messages }));
            } 
            
            else if (data.type === "typing") {
                const { sender, receiver } = data;

                if (onlineUsers[receiver]) {
                    onlineUsers[receiver].send(JSON.stringify({ type: "typing", sender }));
                }
            }

        } catch (error) {
            console.error("❌ WebSocket Error:", error);
        }
    });

    ws.on("close", () => {
        for (let user in onlineUsers) {
            if (onlineUsers[user] === ws) {
                delete onlineUsers[user];
                console.log(`🔴 ${user} disconnected`);

                // Update online users list
                const usersList = Object.keys(onlineUsers);
                usersList.forEach((user) => {
                    if (onlineUsers[user]) {
                        onlineUsers[user].send(JSON.stringify({ type: "online_users", users: usersList }));
                    }
                });

                break;
            }
        }
    });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
