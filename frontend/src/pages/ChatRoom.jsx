import { useState, useEffect, useRef } from "react";
import "../assets/styles/ChatRoom.css";

export default function ChatRoom() {
    const [conversations, setConversations] = useState({});
    const [inputMessage, setInputMessage] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUser, setTypingUser] = useState(null); // Store who is typing
    const socket = useRef(null);
    const username = localStorage.getItem("username");

    useEffect(() => {
        socket.current = new WebSocket("ws://localhost:5000");

        socket.current.onopen = () => {
            console.log("✅ Connected to WebSocket server");
            socket.current.send(JSON.stringify({ type: "login", username }));
        };

        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📩 Message received:", data);

            if (data.type === "online_users") {
                setOnlineUsers(data.users.filter(user => user !== username));
            }
            else if (data.type === "private_message") {
                setConversations((prev) => {
                    const updated = { ...prev };
                    if (!updated[data.sender]) updated[data.sender] = [];
                    updated[data.sender].push({ sender: data.sender, text: data.text });
                    return updated;
                });
            }
            else if (data.type === "chat_history") {
                setConversations((prev) => ({
                    ...prev,
                    [selectedUser]: data.messages.map(msg => ({
                        sender: msg.sender === username ? "Me" : msg.sender,
                        text: msg.text
                    }))
                }));
            }
            else if (data.type === "typing") {
                if (data.sender !== username) {
                    setTypingUser(data.sender);
                    setTimeout(() => setTypingUser(null), 2000); // Remove after 2 sec
                }
            }
        };

        return () => {
            socket.current.close();
        };
    }, []);

    const selectChatUser = async (user) => {
        setSelectedUser(user);

        // Fetch message history from MongoDB
        try {
            const response = await fetch(`http://localhost:5000/messages/${username}/${user}`);
            const messages = await response.json();
            console.log("📜 Fetched Chat History:", messages);

            setConversations((prev) => ({
                ...prev,
                [user]: messages.map(msg => ({
                    sender: msg.sender === username ? "Me" : msg.sender,
                    text: msg.text
                }))
            }));
        } catch (error) {
            console.error("❌ Error fetching chat history:", error);
        }
    };

    const sendMessage = () => {
        if (inputMessage.trim() === "" || !selectedUser) return;

        const messageData = {
            type: "private_message",
            sender: username,
            receiver: selectedUser,
            text: inputMessage,
        };

        socket.current.send(JSON.stringify(messageData));

        setConversations((prev) => {
            const updated = { ...prev };
            if (!updated[selectedUser]) updated[selectedUser] = [];
            updated[selectedUser].push({ sender: "Me", text: inputMessage });
            return updated;
        });

        setInputMessage("");
    };

    const handleTyping = () => {
        if (selectedUser) {
            socket.current.send(JSON.stringify({
                type: "typing",
                sender: username,
                receiver: selectedUser
            }));
        }
    };

    return (
        <div className="chatroom-container">
            {/* Sidebar for Online Users */}
            <div className="chatroom-sidebar">
                <h3 className="title">Online Users</h3><br/>
                <div className="chatroom-contacts">
                    {onlineUsers.length > 0 ? (
                        onlineUsers.map((user, index) => (
                            <div key={index} className="chatroom-contact" onClick={() => selectChatUser(user)}>
                                <strong>{user}</strong>
                                <p>Click to chat</p>
                            </div>
                        ))
                    ) : (
                        <p>No online users</p>
                    )}
                </div>
            </div>

            {/* Chat Box */}
            <div className="chatroom-box">
                <h3>{selectedUser ? `Chat with ${selectedUser}` : ""}</h3>
                <div className="chatroom-messages">
                    {selectedUser && conversations[selectedUser]
                        ? conversations[selectedUser].map((msg, index) => (
                            <div key={index} className={`chatroom-message ${msg.sender === "Me" ? "chatroom-sent" : "chatroom-received"}`}>
                                <strong>{msg.sender}:</strong> {msg.text}
                            </div>
                        ))
                        : <p style={{ color: "#ccc" }}>No messages yet. Start the conversation!</p>}

                    {/* Typing Indicator */}
                    {typingUser && typingUser === selectedUser && (
                        <p className="typing-indicator">{typingUser} is typing...</p>
                    )}
                </div>

                {/* Input Box */}
                <div className="chatroom-input-box">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleTyping}
                        placeholder={selectedUser ? `Message ${selectedUser}...` : "Select a user first"}
                        className="chatroom-input"
                        disabled={!selectedUser}
                    />
                    <button className="chatroom-send-button" onClick={sendMessage} disabled={!selectedUser}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
