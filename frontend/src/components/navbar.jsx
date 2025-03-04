import { useNavigate } from "react-router-dom"; // Import navigation hook
import "../assets/styles/Navbar.css";
import Logo from "../assets/images/logo.png";

export default function Navbar({ setUser }) {
    const navigate = useNavigate();

    const handleSignOut = () => {
        // Clear user session
        localStorage.removeItem("token");
        localStorage.removeItem("username");

        // Update state (App.jsx)
        setUser(null);

        // Redirect to Auth page
        navigate("/");
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <img src={Logo} className="logo-img" alt="Logo" />
            </div>
            <button className="signout-btn" onClick={handleSignOut}>
                Sign out <span>&rarr;</span>
            </button>
        </nav>
    );
}
