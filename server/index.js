const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const WebSocket = require("ws");
const authRoutes = require("./routes/auth");

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
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log("MongoDB Connection Error:", err));

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);
            if (!data.text || !data.sender) return;

            const msgObject = JSON.stringify({ text: data.text, sender: data.sender });

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(msgObject);
                }
            });
        } catch (error) {
            console.error("Invalid message format:", error);
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

server.listen(5000, () => console.log("Server running on port 5000"));
