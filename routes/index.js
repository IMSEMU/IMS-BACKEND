import express from "express";
import {
  Login,
  Logout,
  ForgotPassword,
  newPassword,
} from "../controllers/user.controller.js";

import { Register, getStudent } from "../controllers/student.controller.js";

import { refreshToken } from "../controllers/RefreshToken.js";
import { createLogEntry, getEntries } from "../controllers/log.controller.js";
import { createApplication } from "../controllers/internship.controller.js";
import { getCompanies } from "../controllers/company.controller.js";

const router = express.Router();

//user routes
router.post("/login", Login);
router.get("/token", refreshToken);
router.delete("/logout", Logout);

// Logbook
router.post("/createlog", createLogEntry);
router.get("/viewlog", getEntries);

//student routes
router.post("/register", Register);
router.get("/getstudent", getStudent);
router.post("/createapp", createApplication);

//company routes
router.get("/getcomp", getCompanies);

/* forgot password */
router.post("/forgotpassword", ForgotPassword);
router.post("/newPassword/:token", newPassword);

export default router;
