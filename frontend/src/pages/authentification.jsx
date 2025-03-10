import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../assets/styles/authentification.css";
import Logo from "../assets/images/logo.png";

export default function Auth({ setUser }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async () => {
        setError("");

        if (!username || !password || (!isLogin && !email)) {
            setError("All fields are required!");
            return;
        }

        try {
            const endpoint = isLogin ? "/auth/login" : "/auth/signup";
            const response = await axios.post(`http://localhost:5000${endpoint}`, {
                username,
                email: isLogin ? undefined : email,
                password,
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("username", response.data.username);
            setUser(response.data.username);
            navigate("/chat");
        } catch (err) {
            setError(err.response?.data?.message || "Authentication failed.");
        }
    };

    return (
        <div className="auth-page__container">
            <div className="auth-navbar">
                <img src={Logo} className="logoimg" alt="Logo" />
            </div>
            <div className="container">
                <div className="auth-form__container">
                    <h2 className="auth-form__header">{isLogin ? "Log in" : "Sign up"}</h2>
                    <p className="auth-form__subheader">{isLogin ? "Welcome to ChatApp!" : "Join us today!"}</p>

                    <label className="auth-form__label">Username</label>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        className="auth-form__input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    {!isLogin && (
                        <>
                            <label className="auth-form__label">Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="auth-form__input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </>
                    )}

                    <label className="auth-form__label">Password</label>
                    <div className="auth-form__password-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="auth-form__input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <span className="auth-form__eye-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? "🙈" : "👁"}
                        </span>
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button className="auth-form__button" onClick={handleAuth}>{isLogin ? "Log in" : "Sign up"}</button>

                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <a href="#" onClick={() => setIsLogin(!isLogin)} className="auth-form__link">
                            {isLogin ? "Sign up" : "Log in"}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
