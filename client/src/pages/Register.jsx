import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/authServices";

export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: ""});
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
        try{
            const data = await registerUser(form.name, form.email, form.password);
            login(data);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false)
        }
    }

    return(
        <div className="auth-container">
            <div className="auth-box">
                <h1 className="auth-title">🔪 Story Builder</h1>
                <h2 className="auth-subtitle">Create an Account</h2>

                {error && <div className="error-msg">{error}</div> }

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label >Name</label>
                        <input type="text"
                                name="name"
                                placeholder="Your Name"
                                value={form.name}
                                onChange={handleChange}
                                required
                         />
                    </div>
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
                                placeholder="Min 6 Characters"
                                value={form.password}
                                onChange={handleChange}
                                required
                         />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
                </p>

            </div>
        </div>
    )
}