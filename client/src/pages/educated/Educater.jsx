import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/educated/Navbar";
import Sidebar from "../../components/educated/Sidebar";
import Footer from "../../components/educated/Footer";

const Educater = () => {
  return (
    <div className="text-default min-h-screen bg-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1">{<Outlet />}</div>
      </div>
      <Footer />
    </div>
  );
};

export default Educater;
