import {useState, useEffect, useRef} from "react";
import "../assets/styles/ChatRoom.css";

export default function ChatRoom() {
    const [conversations, setConversations] = useState({});
    const [inputMessage, setInputMessage] = useState("");
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatType, setChatType] = useState("private");
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUser, setTypingUser] = useState(null);
    const [globalChat] = useState("GlobalChat"); // Single group chat
    const socket = useRef(null);
    const username = localStorage.getItem("username");

    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        socket.current = new WebSocket("ws://localhost:5000");

        socket.current.onopen = () => {
            socket.current.send(JSON.stringify({type: "login", username}));
        };

        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "online_users") {
                setOnlineUsers(data.users.filter(user => user !== username));
            } else if (data.type === "private_message" || data.type === "group_message") {
                setConversations((prev) => {
                    const chatKey = data.type === "group_message" ? data.group : data.sender;
                    const updated = {...prev};
                    if (!updated[chatKey]) updated[chatKey] = [];
                    updated[chatKey].push({sender: data.sender, text: data.text});
                    return {...updated};  // Ensure a fresh copy is returned for state update
                });

                if (Notification.permission === "granted" && data.sender !== username) {
                    new Notification(`💬 New message from ${data.sender}`, {
                        body: data.text,
                        icon: "/public/logo.png"
                    });
                }
            } else if (data.type === "chat_history" || data.type === "group_chat_history") {
                setConversations((prev) => ({
                    ...prev,
                    [selectedChat]: data.messages.map(msg => ({
                        sender: msg.sender === username ? "Me" : msg.sender,
                        text: msg.text
                    }))
                }));
            } else if (data.type === "typing") {
                if (data.sender !== username) {
                    setTypingUser(data.sender);
                    setTimeout(() => setTypingUser(null), 2000);
                }
            }
        };

        return () => {
            socket.current.close();
        };
    }, []);

    const selectChatUser = async (user, type) => {
        setSelectedChat(user);
        setChatType(type);

        const endpoint = type === "group"
            ? `http://localhost:5000/group/messages/${user}`
            : `http://localhost:5000/messages/${username}/${user}`;

        try {
            const response = await fetch(endpoint);
            const messages = await response.json();

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
        if (inputMessage.trim() === "" || !selectedChat) return;

        const messageData = {
            type: chatType === "group" ? "group_message" : "private_message",
            sender: username,
            receiver: selectedChat,
            group: chatType === "group" ? selectedChat : null,
            text: inputMessage,
        };

        socket.current.send(JSON.stringify(messageData));

        setConversations((prev) => {
            const updated = {...prev};
            if (!updated[selectedChat]) updated[selectedChat] = [];
            updated[selectedChat].push({sender: "Me", text: inputMessage});
            return updated;
        });

        setInputMessage("");
    };

    const handleTyping = () => {
        if (selectedChat) {
            socket.current.send(JSON.stringify({
                type: "typing",
                sender: username,
                receiver: selectedChat
            }));
        }
    };

    return (
        <div className="chatroom-container">
            <div className="chatroom-sidebar">
                <h3 className="title">Online Users</h3>
                <div className="chatroom-contacts">
                    {onlineUsers.length > 0 ? (
                        onlineUsers.map((user, index) => (
                            <div key={index} className="chatroom-contact"
                                 onClick={() => selectChatUser(user, "private")}>
                                <strong>{user}</strong>
                                <p>Click to chat</p>
                            </div>
                        ))
                    ) : (
                        <p>No online users</p>
                    )}
                </div>

                <h3 className="title">Global Chat</h3>
                <div className="chatroom-contacts">
                    <div className="chatroom-contact" onClick={() => selectChatUser(globalChat, "group")}>
                        <strong>Global Chat</strong>
                        <p>Join the group</p>
                    </div>
                </div>
            </div>

            <div className="chatroom-box">
                <h3>{selectedChat ? `Chat with ${selectedChat}` : "Select a chat"}</h3>
                <div className="chatroom-messages">
                    {selectedChat && conversations[selectedChat]
                        ? conversations[selectedChat].map((msg, index) => (
                            <div key={index}
                                 className={`chatroom-message ${msg.sender === "Me" ? "chatroom-sent" : "chatroom-received"}`}>
                                <strong>{msg.sender}:</strong> {msg.text}
                            </div>
                        ))
                        : <p>No messages yet. Start the conversation!</p>}

                    {typingUser && typingUser === selectedChat && (
                        <p className="typing-indicator">{typingUser} is typing...</p>
                    )}
                </div>

                {/* 🛠 FIXED INPUT BOX AND BUTTON STYLING */}
                <div className="chatroom-input-box">
                    <input
                        type="text"
                        className="chatroom-input"  // Fixed class name
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleTyping}
                        placeholder="Type a message..."
                        disabled={!selectedChat}
                    />
                    <button
                        className="chatroom-send-button"  // Fixed class name
                        onClick={sendMessage}
                        disabled={!selectedChat}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
