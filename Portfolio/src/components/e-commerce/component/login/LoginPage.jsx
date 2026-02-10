import React, { useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import authSideImg from "../../../../assets/grocery_auth_side_v2.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // "https://grocerybackend-87gs.onrender.com/api/auth/login",
  const loginDetails = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://grocery-ai.onrender.com/api/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } },
      );

      const { token, user } = response.data;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role);
        localStorage.setItem("user", user.name);

        if (user.role === "customer") navigate("/grocery/home");
        else if (user.role === "seller") navigate("/grocery/seller");
        else if (user.role === "admin") navigate("/grocery/admin");
        else alert("Invalid Role");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="page-container">
      {/* Background orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="login-card">
        {/* Left side visual */}
        <div className="visual-side">
          <div
            className="visual-image"
            style={{
              backgroundImage: `url(${authSideImg})`,
            }}
          ></div>
          <div className="visual-overlay"></div>
          <div className="visual-content">
            <div className="logo-box">
              <FaUser size={24} />
            </div>
            <h1 className="visual-title">Welcome Back</h1>
            <p className="visual-text">
              Sign in to continue your journey with us and explore endless
              possibilities.
            </p>
          </div>
        </div>

        {/* Right side form */}
        <div className="form-side">
          <div className="form-header">
            <h2 className="form-title">Login</h2>
            <p className="form-subtitle">Access your account</p>
          </div>

          <form onSubmit={loginDetails}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Password</label>
                <a href="/grocery" className="forgot-link">
                  Forgot Password?
                </a>
              </div>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              <div className="btn-content">
                <span>Sign In</span>
                <FiArrowRight className="btn-arrow" />
              </div>
            </button>

            <div className="signup-text">
              Don't have an account?
              <button
                type="button"
                className="signup-link"
                onClick={() => navigate("/grocery/register")}
              >
                Sign Up /
              </button>
              <p></p>
              <button
                type="button"
                className="signup-link"
                onClick={() => navigate("/grocery")}
              >
                Continue Shop
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
