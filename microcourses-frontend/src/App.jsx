import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import CreatorDashboard from "./pages/CreatorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateCourse from "./pages/CreateCourse";
import MyCourses from "./pages/MyCourses"; // 🔹 New import

function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/dashboard/student" element={<StudentDashboard />} />
      <Route path="/dashboard/creator" element={<CreatorDashboard />} />
      <Route path="/dashboard/admin" element={<AdminDashboard />} />
      <Route path="/my-courses" element={<MyCourses />} />
      <Route path="/creator/create-course" element={<CreateCourse />} />
    </Routes>
  );
}

export default App;
