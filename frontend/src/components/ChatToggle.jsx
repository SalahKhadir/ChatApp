import { useState } from "react";
import "../assets/styles/ChatToggle.css";
import ChatActions from "../assets/images/chat-action-icon.png";
import FriendIcon from "../assets/images/friend-icon.png";

const ChatToggle = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="chat-container">
            <div
                className={`chat-toggle ${open ? "hidden" : "visible"}`}
                onClick={() => setOpen(true)}
            >
                <span className="chat-icon">💬</span>
                <span className="chat-text">Chat</span>
            </div>

            {open && (
                <div className="chat-panel">
                    <div className="chat-title">FRIENDS</div>
                    <div className="chat-list">
                        {["name", "name", "name", "name"].map((friend, index) => (
                            <div key={index} className="chat-friend">
                                <img
                                    src={FriendIcon}
                                    alt="Friend Icon"
                                    className="friend-icon"
                                />
                                <span className="friend-name">{friend}</span>
                                <img
                                    src={ChatActions}
                                    alt="Chat Action"
                                    className="chat-action"
                                />
                            </div>
                        ))}
                    </div>
                    {/* Close Button */}
                    <button
                        className="chat-close"
                        onClick={() => setOpen(false)}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatToggle;
