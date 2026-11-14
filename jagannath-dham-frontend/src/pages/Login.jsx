
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import authService from "../services/authService";
import api from "../services/api";
import "./Login.css";

export default function Login() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("login");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });

    const [registerData, setRegisterData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: ""
    });

    const switchTab = (tab) => {
        setActiveTab(tab);
        setError("");
        setSuccess("");
        setShowPassword(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const user = await authService.login(
                loginData.email,
                loginData.password
            );

            const routes = {
                USER: "/devotee",
                STAFF: "/staff",
                ADMIN: "/admin"
            };

            if (routes[user.role]) {
                navigate(routes[user.role], { replace: true });
            } else {
                authService.logout();
                setError("Invalid account role.");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            await api.post("/users/register", registerData);

            setLoginData({
                email: registerData.email,
                password: ""
            });

            setRegisterData({
                fullName: "",
                email: "",
                phone: "",
                password: ""
            });

            setActiveTab("login");
            setSuccess("Account created successfully. Please sign in.");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">

            {/* LEFT IMAGE PANEL */}

            <section className="auth-hero">

                <div className="auth-hero-overlay" />

                <div className="auth-hero-content">

                    <div className="auth-logo">
                        <span className="auth-logo-symbol">॥</span>
                        <span>Jagannath Dham</span>
                    </div>

                    <div className="auth-hero-message">
                        <span className="auth-eyebrow">
                            YOUR SPIRITUAL JOURNEY BEGINS HERE
                        </span>

                        <h1>
                            Experience the
                            <br />
                            Divine Darshan
                        </h1>

                        <p>
                            Plan your visit, book your darshan and
                            discover the spiritual beauty of Odisha
                            through one simple platform.
                        </p>

                        <div className="auth-divider" />

                        <span className="auth-jai">
                            ॥ JAI JAGANNATH ॥
                        </span>
                    </div>

                    <div className="auth-hero-footer">
                        Puri, Odisha, India
                    </div>

                </div>
            </section>

            {/* RIGHT FORM PANEL */}

            <section className="auth-form-section">

                <div className="auth-card">

                    <div className="auth-card-heading">
                        <span className="auth-card-label">
                            JAGANNATH DHAM
                        </span>

                        <h2>
                            {activeTab === "login"
                                ? "Welcome back"
                                : "Create your account"}
                        </h2>

                        <p>
                            {activeTab === "login"
                                ? "Sign in to continue your journey."
                                : "Enter your details to get started."}
                        </p>
                    </div>

                    {/* TABS */}

                    <div className="auth-tabs">
                        <button
                            type="button"
                            className={activeTab === "login" ? "active" : ""}
                            onClick={() => switchTab("login")}
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            className={activeTab === "register" ? "active" : ""}
                            onClick={() => switchTab("register")}
                        >
                            Register
                        </button>
                    </div>

                    {/* LOGIN */}

                    {activeTab === "login" && (
                        <form onSubmit={handleLogin}>

                            <div className="auth-input-group">
                                <label>Email Address</label>

                                <div className="auth-input">
                                    <Mail size={18} />

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={loginData.email}
                                        onChange={(e) =>
                                            setLoginData({
                                                ...loginData,
                                                email: e.target.value
                                            })
                                        }
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-input-group">
                                <label>Password</label>

                                <div className="auth-input">
                                    <Lock size={18} />

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={loginData.password}
                                        onChange={(e) =>
                                            setLoginData({
                                                ...loginData,
                                                password: e.target.value
                                            })
                                        }
                                        autoComplete="current-password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword
                                            ? <EyeOff size={18} />
                                            : <Eye size={18} />
                                        }
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="auth-error">{error}</div>
                            )}

                            {success && (
                                <div className="auth-success">{success}</div>
                            )}

                            <button
                                type="submit"
                                className="auth-primary-button"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>

                            <p className="auth-switch-text">
                                New to Jagannath Dham?
                                <button
                                    type="button"
                                    onClick={() => switchTab("register")}
                                >
                                    Create an account
                                </button>
                            </p>

                        </form>
                    )}

                    {/* REGISTER */}

                    {activeTab === "register" && (
                        <form onSubmit={handleRegister}>

                            <div className="auth-input-group">
                                <label>Full Name</label>

                                <div className="auth-input">
                                    <User size={18} />

                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={registerData.fullName}
                                        onChange={(e) =>
                                            setRegisterData({
                                                ...registerData,
                                                fullName: e.target.value
                                            })
                                        }
                                        autoComplete="name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-input-group">
                                <label>Email Address</label>

                                <div className="auth-input">
                                    <Mail size={18} />

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={registerData.email}
                                        onChange={(e) =>
                                            setRegisterData({
                                                ...registerData,
                                                email: e.target.value
                                            })
                                        }
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-input-group">
                                <label>Phone Number</label>

                                <div className="auth-input">
                                    <Phone size={18} />

                                    <input
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        value={registerData.phone}
                                        onChange={(e) =>
                                            setRegisterData({
                                                ...registerData,
                                                phone: e.target.value
                                            })
                                        }
                                        autoComplete="tel"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-input-group">
                                <label>Password</label>

                                <div className="auth-input">
                                    <Lock size={18} />

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        value={registerData.password}
                                        onChange={(e) =>
                                            setRegisterData({
                                                ...registerData,
                                                password: e.target.value
                                            })
                                        }
                                        autoComplete="new-password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword
                                            ? <EyeOff size={18} />
                                            : <Eye size={18} />
                                        }
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="auth-error">{error}</div>
                            )}

                            <button
                                type="submit"
                                className="auth-primary-button"
                                disabled={loading}
                            >
                                {loading ? "Creating account..." : "Create Account"}
                            </button>

                            <p className="auth-switch-text">
                                Already registered?
                                <button
                                    type="button"
                                    onClick={() => switchTab("login")}
                                >
                                    Sign in
                                </button>
                            </p>

                        </form>
                    )}

                    <div className="auth-card-footer">
                        © 2026 Jagannath Dham
                    </div>

                </div>

            </section>

        </main>
    );
}
