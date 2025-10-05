import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import "./Dashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", role: "" });
  const [activeTab, setActiveTab] = useState("overview");
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return navigate("/");

    try {
      const decoded = jwtDecode(token);
      setUser({
        name: decoded.sub?.split("@")[0] || "Admin",
        role: decoded.role || "admin",
      });

      Promise.all([fetchStats(), fetchPendingCourses(), fetchUsers()]);
    } catch (err) {
      console.error("Token decoding error:", err);
      navigate("/");
    }
  }, []);

  // ✅ Fetch Platform Stats
  const fetchStats = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch stats:", err);
    }
  };

  // ✅ Fetch Pending Courses
  const fetchPendingCourses = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/admin/review/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch All Users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
    }
  };

  // ✅ Approve Course
  const handleApprove = async (courseId) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/admin/approve/${courseId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Course approved successfully!");
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      fetchStats();
    } catch (err) {
      alert("❌ Failed to approve course!");
    }
  };

  // ✅ Update User Role
  const updateRole = async (userId, newRole) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/admin/users/${userId}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ Updated user role to ${newRole}`);
      fetchUsers();
    } catch (err) {
      alert("❌ Failed to update role!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // 🎨 Chart Config
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50"];
  const chartData = [
    { name: "Total Users", value: stats.total_users || 0 },
    { name: "Total Courses", value: stats.total_courses || 0 },
    { name: "Approved Courses", value: stats.approved_courses || 0 },
    { name: "Enrollments", value: stats.total_enrollments || 0 },
  ];

  return (
    <div className="dashboard-container">
      {/* === Sidebar === */}
      <aside className="dashboard-sidebar">
        <h2 className="logo">🛠️ Admin Panel</h2>
        <nav>
          <ul>
            <li
              className={activeTab === "overview" ? "active" : ""}
              onClick={() => setActiveTab("overview")}
            >
              📊 Overview
            </li>
            <li
              className={activeTab === "courses" ? "active" : ""}
              onClick={() => setActiveTab("courses")}
            >
              📋 Manage Courses
            </li>
            <li
              className={activeTab === "users" ? "active" : ""}
              onClick={() => setActiveTab("users")}
            >
              👥 Manage Users
            </li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </aside>

      {/* === Main Content === */}
      <main className="dashboard-content">
        {/* === Overview Section === */}
        {activeTab === "overview" && (
          <div className="welcome-card fadeIn" style={{ width: "90%" }}>
            <h1>📊 Platform Overview</h1>
            <p>Real-time insights about courses, users, and enrollments.</p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-around",
                marginTop: "30px",
              }}
            >
              {/* Pie Chart */}
              <div style={{ width: "45%", height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div style={{ width: "45%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* === Manage Courses Section === */}
        {activeTab === "courses" && (
          <div className="welcome-card fadeIn">
            <h2>📋 Pending Courses for Approval</h2>
            {loading ? (
              <p>Loading...</p>
            ) : courses.length === 0 ? (
              <p>🎉 No pending courses to review.</p>
            ) : (
              courses.map((course) => (
                <div key={course.id} className="course-card">
                  <div>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                  </div>
                  <button
                    className="auth-btn"
                    onClick={() => handleApprove(course.id)}
                  >
                    ✅ Approve
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* === Manage Users Section === */}
        {activeTab === "users" && (
          <div className="welcome-card fadeIn">
            <h2>👥 Manage Users</h2>
            {users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <table
                style={{
                  width: "100%",
                  marginTop: "20px",
                  borderCollapse: "collapse",
                  color: "white",
                }}
              >
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.2)" }}>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                          style={{
                            background: "#1e1f3b",
                            color: "white",
                            border: "1px solid #555",
                            borderRadius: "5px",
                            padding: "4px",
                          }}
                        >
                          <option value="student">Student</option>
                          <option value="creator">Creator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
