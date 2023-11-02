import express from "express";
import {
  Login,
  Logout,
  ForgotPassword,
  newPassword,
} from "../controllers/user.controller.js";

import {
  Register,
  getPhoto,
  getStudent,
} from "../controllers/student.controller.js";

import { refreshToken } from "../controllers/RefreshToken.js";
import { createLogEntry, getEntries } from "../controllers/log.controller.js";
import {
  createApplication,
  submitInsurance,
} from "../controllers/internship.controller.js";
import { getCompanies, getCompany } from "../controllers/company.controller.js";
import {
  confirmApplication,
  getInternship,
  getSubmissions,
} from "../controllers/deptsup.controller.js";

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
router.post("/submitins", submitInsurance);
router.get("/getphoto", getPhoto);
//company routes
router.get("/getcomps", getCompanies);
router.get("/getcomp", getCompany);

//deptsup routes
router.get("/getsubs", getSubmissions);
router.get("/getinternship/:stdid/:id", getInternship);
router.post("/confirmapp", confirmApplication);

/* forgot password */
router.post("/forgotpassword", ForgotPassword);
router.post("/newPassword/:token", newPassword);

export default router;
