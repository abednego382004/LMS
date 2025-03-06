import React from "react";
import { Route, Routes, useMatch } from "react-router-dom";
import Home from "./pages/student/Home";
import CouresesList from "./pages/student/CouresesList";
import CourseDEtails from "./pages/student/CourseDEtails";
import MyEnrollments from "./pages/student/MyEnrollments";
import Player from "./pages/student/Player";
import Loading from "./components/students/Loading";
import Educater from "./pages/educated/Educater";
import Dashboard from "./pages/educated/Dashboard";
import AddCourse from "./pages/educated/AddCourse";
import MyCourses from "./pages/educated/MyCourses";
import StudentsEnrolled from "./pages/educated/StudentsEnrolled";
import Navbar from "./components/students/Navbar";
import "quill/dist/quill.snow.css";

const App = () => {
  const isEducatedRoute = useMatch("/educator/*");
  return (
    <div className="text-default min-h-screen bg-white">
      {!isEducatedRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course-list" element={<CouresesList />} />
        <Route path="/course-list/:input" element={<CouresesList />} />
        <Route path="/course/:id" element={<CourseDEtails />} />
        <Route path="/my-enrollments" element={<MyEnrollments />} />
        <Route path="/player/:courseId" element={<Player />} />
        <Route path="/loading/:path" element={<Loading />} />
        <Route path="/educator" element={<Educater />}>
          <Route path="/educator" element={<Dashboard />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="student-enrolled" element={<StudentsEnrolled />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
