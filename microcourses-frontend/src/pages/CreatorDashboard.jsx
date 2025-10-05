import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Dashboard.css";
import CreateCourse from "./CreateCourse";
import AddLesson from "./AddLesson"; // ✅ Import new Add Lesson component

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", role: "" });
  const [activeTab, setActiveTab] = useState("dashboard"); // track active section

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    try {
      const decoded = jwtDecode(token);
      setUser({
        name: decoded.sub?.split("@")[0] || "Creator",
        role: decoded.role || "creator",
      });
    } catch (err) {
      console.error("Token decoding error:", err);
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* === Sidebar === */}
      <aside className="dashboard-sidebar">
        <h2 className="logo">🎬 Creator Panel</h2>
        <nav>
          <ul>
            <li
              className={activeTab === "dashboard" ? "active" : ""}
              onClick={() => setActiveTab("dashboard")}
            >
              🏠 Dashboard
            </li>
            <li
              className={activeTab === "mycourses" ? "active" : ""}
              onClick={() => setActiveTab("mycourses")}
            >
              📚 My Courses
            </li>
            <li
              className={activeTab === "create" ? "active" : ""}
              onClick={() => setActiveTab("create")}
            >
              ➕ Create Course
            </li>
            <li
              className={activeTab === "addlesson" ? "active" : ""}
              onClick={() => setActiveTab("addlesson")}
            >
              📝 Add Lesson
            </li>
            <li
              className={activeTab === "earnings" ? "active" : ""}
              onClick={() => setActiveTab("earnings")}
            >
              💰 Earnings
            </li>
            <li
              className={activeTab === "settings" ? "active" : ""}
              onClick={() => setActiveTab("settings")}
            >
              ⚙️ Settings
            </li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </aside>

      {/* === Main Content === */}
      <main className="dashboard-content">
        {/* Dashboard Section */}
        {activeTab === "dashboard" && (
          <div className="welcome-card">
            <h1>
              🎥 Welcome, <span>{user.name}</span> 👋
            </h1>
            <h3 className="role-tag">Role: {user.role.toUpperCase()}</h3>
            <p>
              💡 “Create. Inspire. Educate.” <br />
              Your creativity shapes the learning experience for thousands of
              students. Start creating impactful micro-courses today and empower
              minds around the world 🌍.
            </p>
          </div>
        )}

        {/* Create Course Section */}
        {activeTab === "create" && <CreateCourse />}

        {/* Add Lesson Section */}
        {activeTab === "addlesson" && <AddLesson />}

        {/* My Courses Section */}
        {activeTab === "mycourses" && (
          <div className="welcome-card">
            <h2>📚 My Courses</h2>
            <p>View, edit, and manage all your published and pending courses.</p>
            <button
              className="auth-btn"
              onClick={() => navigate("/my-courses")}
              style={{ marginTop: "15px" }}
            >
              View My Courses
            </button>
          </div>
        )}

        {/* Earnings Section */}
        {activeTab === "earnings" && (
          <div className="welcome-card">
            <h2>💰 Earnings Overview</h2>
            <p>
              Check your total revenue, pending payouts, and monthly analytics.
            </p>
          </div>
        )}

        {/* Settings Section */}
        {activeTab === "settings" && (
          <div className="welcome-card">
            <h2>⚙️ Settings</h2>
            <p>Update your profile, change password, and manage notifications.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreatorDashboard;
