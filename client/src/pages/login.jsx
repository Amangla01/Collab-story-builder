import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authServices";

export default function Login(){
    const [form, setForm] = useState({ email: "", password: ""});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await loginUser(form.email, form.password)
            login(data);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "something went wrong")
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1 className="auth-title">🔪 Story builder</h1>
                <h2 className="auth-subtitle">Welcome back</h2>

                {error && <div className="error-msg">{error}</div> }

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label >Email</label>
                        <input type="email"
                                name="email"
                                placeholder="Your@email.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                         />
                    </div>
                    <div className="form-group">
                        <label >Password</label>
                        <input type="password"
                                name="password"
                                placeholder="Your Password"
                                value={form.password}
                                onChange={handleChange}
                                required
                         />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't Have An Account?{" "}
                    <Link to = "/register">Register</Link>
                </p>
            </div>
        </div>
    )
}