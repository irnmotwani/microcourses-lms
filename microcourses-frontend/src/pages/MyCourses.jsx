import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://microcourses-lms.onrender.com";

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null); // open course
  const [lessons, setLessons] = useState({});
  const [expandedLesson, setExpandedLesson] = useState(null); // open lesson
  const [user, setUser] = useState({ name: "", role: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    try {
      const decoded = jwtDecode(token);
      setUser({
        name: decoded.sub?.split("@")[0] || "Creator",
        role: decoded.role || "creator",
      });

      axios
        .get(`${API_BASE}/creator/my-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setCourses(res.data))
        .catch((err) => console.error("Error fetching courses:", err));
    } catch (err) {
      console.error("Token error:", err);
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const getStatusColor = (status) => {
    if (status === "Approved") return "#4CAF50";
    if (status === "Pending") return "#F1C40F";
    return "#E74C3C";
  };

  // Toggle course lessons
  const toggleLessons = async (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_BASE}/lessons/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLessons((prev) => ({ ...prev, [courseId]: res.data }));
      setExpandedCourse(courseId);
    } catch (err) {
      console.error("Error fetching lessons:", err);
    }
  };

  // Toggle specific lesson to show its content
  const toggleLessonContent = (lessonId) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <h2 className="logo">🎬 Creator Panel</h2>
        <nav>
          <ul>
            <li onClick={() => navigate("/dashboard/creator")}>🏠 Dashboard</li>
            <li className="active">📚 My Courses</li>
          
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="welcome-card">
          <h1>
            🎥 Welcome, <span>{user.name}</span> 👋
          </h1>
          <p>Here are all your created courses — expand to view lessons:</p>

          <div style={{ marginTop: "25px", width: "100%" }}>
            {courses.length === 0 ? (
              <p>No courses found. Create one to get started!</p>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="course-card"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    padding: "15px 20px",
                    borderRadius: "12px",
                    marginBottom: "14px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleLessons(course.id)}
                  >
                    <div>
                      <h3 style={{ margin: 0, color: "#fff" }}>{course.title}</h3>
                      <p style={{ margin: "5px 0", color: "#ccc" }}>
                        {course.description}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        backgroundColor: getStatusColor(course.status),
                        color: "#fff",
                        textTransform: "capitalize",
                      }}
                    >
                      {course.status || "Pending"}
                    </span>
                  </div>

                  {/* === Lessons dropdown === */}
                  {expandedCourse === course.id && (
                    <div
                      style={{
                        marginTop: "10px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "10px",
                        padding: "10px 15px",
                      }}
                    >
                      <h4 style={{ color: "#ffd369", marginBottom: "8px" }}>
                        📘 Lessons:
                      </h4>
                      {lessons[course.id]?.length > 0 ? (
                        <ul style={{ listStyle: "none", padding: 0, color: "#fff" }}>
                          {lessons[course.id].map((lesson, index) => (
                            <li
                              key={lesson.id}
                              style={{
                                marginBottom: "8px",
                                padding: "8px 10px",
                                borderRadius: "6px",
                                background: "rgba(255,255,255,0.1)",
                                cursor: "pointer",
                              }}
                              onClick={() => toggleLessonContent(lesson.id)}
                            >
                              <strong>
                                Lesson {index + 1}: {lesson.title}
                              </strong>

                              {/* Show content on click */}
                              {expandedLesson === lesson.id && (
                                <div
                                  style={{
                                    marginTop: "8px",
                                    background: "rgba(255,255,255,0.08)",
                                    borderRadius: "6px",
                                    padding: "8px 12px",
                                    color: "#dcdcdc",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  {lesson.content || "No content available."}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ color: "#ccc" }}>No lessons found for this course.</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyCourses;
