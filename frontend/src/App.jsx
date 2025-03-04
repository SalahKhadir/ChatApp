import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/authentification";
import ChatRoom from "./pages/ChatRoom";
import Navbar from "./components/navbar";

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUser(storedUsername);
        }
    }, []);

    return (
        <Router>
            {user && <Navbar setUser={setUser} />} {/* Show Navbar only if logged in */}
            <Routes>
                <Route path="/" element={user ? <Navigate to="/chat" /> : <Auth setUser={setUser} />} />
                <Route path="/chat" element={user ? <ChatRoom /> : <Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
