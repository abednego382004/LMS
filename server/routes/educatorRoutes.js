import express from "express";
import {
  addCourse,
  educatorDahboardData,
  getEducatedCourses,
  getEnrolledStudentsData,
  updateRoleToEducator,
} from "../controllers/educatedController.js";
import upload from "../configs/multer.js";
import { protectEducator } from "../middlewares/authMiddleware.js";

const educatorRouter = express.Router();

educatorRouter.get("/update-role", updateRoleToEducator);
educatorRouter.post(
  "/add-course",
  upload.single("image"),
  protectEducator,
  addCourse
);
educatorRouter.get("/courses", protectEducator, getEducatedCourses);
educatorRouter.get("/dashboard", protectEducator, educatorDahboardData);
educatorRouter.get(
  "/enrolled-students",
  protectEducator,
  getEnrolledStudentsData
);

export default educatorRouter;
