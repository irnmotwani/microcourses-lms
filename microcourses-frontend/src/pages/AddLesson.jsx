import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Dashboard.css";

const AddLesson = () => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Fetch creator's courses for dropdown
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first!");

    axios
      .get("http://127.0.0.1:8000/creator/my-courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourses(res.data))
      .catch(() => toast.error("Failed to fetch courses"));
  }, []);

  // ✅ Handle input
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Submit new lesson
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://127.0.0.1:8000/lessons/", formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("🎉 Lesson added successfully!");
      setFormData({ course_id: "", title: "", content: "" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add lesson");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="welcome-card">
      <h2>📘 Add Lesson to a Course</h2>
      <p>
        Fill in the details below to add a new lesson under one of your
        existing courses.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <select
          name="course_id"
          className="auth-input"
          value={formData.course_id}
          onChange={handleChange}
          required
        >
          <option value="">Select a Course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="title"
          placeholder="Lesson Title"
          className="auth-input"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="content"
          placeholder="Lesson Content"
          className="auth-input"
          value={formData.content}
          onChange={handleChange}
          required
          rows="5"
        ></textarea>

        <button className="auth-btn" disabled={loading}>
          {loading ? "Saving..." : "Add Lesson"}
        </button>
      </form>
    </div>
  );
};

export default AddLesson;
