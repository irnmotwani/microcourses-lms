import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "./Dashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", role: "" });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [approvedCourses, setApprovedCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [lessons, setLessons] = useState({});

  // ✅ Load user, approved courses, and enrollments
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    try {
      const decoded = jwtDecode(token);
      setUser({
        name: decoded.sub?.split("@")[0] || "User",
        role: decoded.role || "student",
      });

      axios
        .get("http://127.0.0.1:8000/courses/approved")
        .then((res) => setApprovedCourses(res.data))
        .catch(() => console.error("❌ Failed to load approved courses"));

      axios
        .get("http://127.0.0.1:8000/students/enrollments", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setEnrolledCourses(res.data))
        .catch(() => console.error("❌ Failed to load enrolled courses"));
    } catch (err) {
      console.error("Token error:", err);
      navigate("/");
    }
  }, [navigate]);

  // ✅ Fetch lessons
  const fetchLessons = async (courseId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`http://127.0.0.1:8000/lessons/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLessons((prev) => ({
        ...prev,
        [courseId]: res.data.map((l) => ({ ...l, showContent: false })),
      }));
    } catch (err) {
      console.error("❌ Error fetching lessons:", err);
    }
  };

  // ✅ Toggle lesson content visibility
  const toggleLessonContent = (courseId, lessonId) => {
    setLessons((prev) => ({
      ...prev,
      [courseId]: prev[courseId].map((lesson) =>
        lesson.id === lessonId
          ? { ...lesson, showContent: !lesson.showContent }
          : lesson
      ),
    }));
  };

  // ✅ Mark lesson complete
  const handleCompleteLesson = async (lessonId, courseId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/students/complete-lesson",
        { lesson_id: lessonId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      fetchProgress(courseId);
    } catch (err) {
      alert(err.response?.data?.detail || "❌ Failed to mark lesson completed");
    }
  };

  // ✅ Fetch progress per course
  const fetchProgress = async (courseId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/students/progress/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgressData((prev) => ({
        ...prev,
        [courseId]: res.data,
      }));
    } catch (err) {
      console.error("❌ Error fetching progress:", err);
    }
  };

  // ✅ Enroll in a course
  const handleEnroll = async (course) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://127.0.0.1:8000/students/enroll",
        { course_id: course.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`🎉 Enrolled in "${course.title}"`);
      setEnrolledCourses([...enrolledCourses, course]);
    } catch (err) {
      alert(err.response?.data?.detail || "❌ Enrollment failed");
    }
  };

  // ✅ Download certificate
  const handleDownloadCertificate = async (courseId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/students/certificate/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // get as PDF
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Certificate_Course_${courseId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("❌ Could not generate certificate.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* === Sidebar === */}
      <aside className="dashboard-sidebar">
        <h2 className="logo">🎓 Student Panel</h2>
        <nav>
          <ul>
            {["dashboard", "available", "mycourses", "progress", "settings"].map((tab) => (
              <li
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "dashboard"
                  ? "🏠 Dashboard"
                  : tab === "available"
                  ? "🎓 Available Courses"
                  : tab === "mycourses"
                  ? "📚 My Enrolled Courses"
                  : tab === "progress"
                  ? "📈 Progress"
                  : "⚙️ Settings"}
              </li>
            ))}
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
      </aside>

      {/* === Main Content === */}
      <main className="dashboard-content">
        {/* 🏠 Dashboard */}
        {activeTab === "dashboard" && (
          <div className="welcome-card fadeIn">
            <h1>
              Welcome, <span>{user.name}</span> 👋
            </h1>
            <p>Keep learning — complete your lessons to unlock your certificate!</p>
          </div>
        )}

        {/* 🎓 Available Courses */}
        {activeTab === "available" && (
          <div className="welcome-card fadeIn">
            <h2>🎓 Available Courses</h2>
            {approvedCourses.length === 0 ? (
              <p>No approved courses yet.</p>
            ) : (
              approvedCourses.map((course) => (
                <div key={course.id} className="course-card">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <button className="auth-btn" onClick={() => handleEnroll(course)}>
                    Enroll
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 📚 My Courses */}
        {activeTab === "mycourses" && (
          <div className="welcome-card fadeIn">
            <h2>📚 My Enrolled Courses</h2>
            {enrolledCourses.length === 0 ? (
              <p>No enrolled courses.</p>
            ) : (
              enrolledCourses.map((course) => (
                <div key={course.id} className="course-card">
                  <h3>{course.title}</h3>
                  <button
                    className="auth-btn"
                    onClick={() => {
                      fetchLessons(course.id);
                      fetchProgress(course.id);
                    }}
                  >
                    📘 View Lessons
                  </button>

                  {/* Lessons */}
                  {lessons[course.id] && (
                    <div className="lesson-list">
                      {lessons[course.id].map((lesson) => (
                        <div key={lesson.id} className="lesson-item">
                          <div
                            onClick={() => toggleLessonContent(course.id, lesson.id)}
                            style={{ cursor: "pointer", fontWeight: "bold" }}
                          >
                            📖 {lesson.title}
                          </div>
                          {lesson.showContent && (
                            <div
                              style={{
                                background: "rgba(255,255,255,0.1)",
                                marginTop: "5px",
                                padding: "10px",
                                borderRadius: "8px",
                              }}
                            >
                              <p>{lesson.content}</p>
                              <button
                                className="small-btn"
                                onClick={() => handleCompleteLesson(lesson.id, course.id)}
                              >
                                ✅ Mark Complete
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 📈 Progress Page */}
        {activeTab === "progress" && (
          <div className="welcome-card fadeIn">
            <h2>📈 Course Progress</h2>
            {Object.keys(progressData).length === 0 ? (
              <p>No progress data yet.</p>
            ) : (
              Object.values(progressData).map((p) => {
                const percent =
                  p.total_lessons > 0
                    ? Math.round((p.completed_lessons.length / p.total_lessons) * 100)
                    : 0;

                return (
                  <div
                    key={p.course_id}
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      padding: "15px 20px",
                      borderRadius: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <h3>📘 Course #{p.course_id}</h3>
                    <div
                      className="progress-bar-container"
                      style={{ marginTop: "10px" }}
                    >
                      <div
                        className="progress-bar"
                        style={{ width: `${percent}%` }}
                      ></div>
                      <span>{percent}% completed</span>
                    </div>

                    {/* 🎓 Show certificate button ONLY when 100% completed */}
                    {percent === 100 && (
                      <button
                        className="auth-btn"
                        style={{
                          marginTop: "10px",
                          background: "linear-gradient(90deg, #4CAF50, #2E8B57)",
                        }}
                        onClick={() => handleDownloadCertificate(p.course_id)}
                      >
                        🎓 Download Certificate
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
