import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Auth.css";

const Auth = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        // Registration API call
        await axios.post("http://127.0.0.1:8000/users/register", formData);
        toast.success("🎉 Registration successful! Please login now.");
        setIsRegistering(false);
      } else {
        // Login API call
        const data = new URLSearchParams();
        data.append("username", formData.email);
        data.append("password", formData.password);

        const res = await axios.post("http://127.0.0.1:8000/login/", data, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const token = res.data.access_token;
        localStorage.setItem("token", token);

        // Decode JWT to extract role
        const decoded = jwtDecode(token);
        const role = decoded.role;
        toast.success(`Welcome back, ${role.toUpperCase()} 👋`);

        // Redirect based on role
        if (role === "student") navigate("/dashboard/student");
        else if (role === "creator") navigate("/dashboard/creator");
        else if (role === "admin") navigate("/dashboard/admin");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "❌ Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-glass">
        <h1 className="auth-heading">
          {isRegistering ? "Create Your Account ✨" : "Welcome Back 👋"}
        </h1>
        <p className="auth-sub">
          {isRegistering
            ? "Join MicroCourses as a Student or Creator and start your journey 🚀"
            : "Login to continue learning or creating amazing courses 🎓"}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="auth-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="auth-input"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="auth-input"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {isRegistering && (
            <select
              name="role"
              className="auth-input"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">🎓 Student</option>
              <option value="creator">🎬 Creator</option>
            </select>
          )}

          <button className="auth-btn" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegistering
              ? "Register"
              : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          {isRegistering
            ? "Already have an account?"
            : "Don’t have an account?"}
          <span
            className="auth-toggle"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? " Login here" : " Register here"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
