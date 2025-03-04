import { useState, useEffect, useRef } from "react";
import "../assets/styles/ChatRoom.css";

export default function ChatRoom() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const socket = useRef(null);
    const username = localStorage.getItem("username");

    useEffect(() => {
        // Connect to WebSocket server
        socket.current = new WebSocket("ws://localhost:5000");

        socket.current.onopen = () => {
            console.log("✅ Connected to WebSocket server");
            socket.current.send(JSON.stringify({ type: "login", username }));
        };

        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📩 New message received:", data);

            setMessages((prev) => [...prev, data]);
        };

        return () => {
            socket.current.close();
        };
    }, []);

    const sendMessage = () => {
        if (inputMessage.trim() === "") return;

        const messageData = {
            type: "message",
            sender: username,
            text: inputMessage,
        };

        socket.current.send(JSON.stringify(messageData));
        setInputMessage("");
    };

    return (
        <div className="chatroom-container">
            {/* Sidebar with Contacts (Future Feature) */}
            <div className="chatroom-sidebar">
                <h3>Contacts</h3>
                <div className="chatroom-contacts">
                    <div className="chatroom-contact">
                        <strong>Bob</strong>
                        <p>Online</p>
                    </div>
                    <div className="chatroom-contact">
                        <strong>Alice</strong>
                        <p>Offline</p>
                    </div>
                </div>
            </div>

            {/* Main Chatbox */}
            <div className="chatroom-box">
                <div className="chatroom-messages">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`chatroom-message ${
                                msg.sender === username ? "chatroom-sent" : "chatroom-received"
                            }`}
                        >
                            <strong>{msg.sender}:</strong> {msg.text}
                        </div>
                    ))}
                </div>

                {/* Input Box */}
                <div className="chatroom-input-box">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="chatroom-input"
                    />
                    <button className="chatroom-send-button" onClick={sendMessage}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
