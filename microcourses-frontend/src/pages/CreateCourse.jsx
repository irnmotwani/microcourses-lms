import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Dashboard.css"; // using same theme as dashboards

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);

  // Handle input field change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit course data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first!");
        return;
      }

      // POST request to backend
      await axios.post("http://127.0.0.1:8000/creator/courses", formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send JWT token to backend
        },
      });

      toast.success("🎉 Course submitted for admin approval!");
      setFormData({ title: "", description: "", category: "" }); // reset form
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "❌ Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="welcome-card">
      <h2>➕ Create a New Course</h2>
      <p>
        Fill out the details below to create a new course. Once submitted, the
        admin will review and approve your course before it goes live.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <input
          type="text"
          name="title"
          placeholder="Course Title"
          className="auth-input"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Course Description"
          className="auth-input"
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
        ></textarea>
        <input
          type="text"
          name="category"
          placeholder="Course Category"
          className="auth-input"
          value={formData.category}
          onChange={handleChange}
          required
        />

        <button className="auth-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit for Review"}
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;
