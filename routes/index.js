import express from "express";
import {
  Login,
  Logout,
  ForgotPassword,
  newPassword,
  getNotifications,
} from "../controllers/user.controller.js";

import {
  Register,
  getPhoto,
  getStudent,
} from "../controllers/student.controller.js";

import { refreshToken } from "../controllers/RefreshToken.js";
import {
  createLogEntry,
  getEntries,
  submitLogbook,
} from "../controllers/log.controller.js";
import {
  createApplication,
  submitInsurance,
} from "../controllers/internship.controller.js";
import { getCompanies, getCompany } from "../controllers/company.controller.js";
import {
  confirmApplication,
  confirmConfirmation,
  confirmInsurance,
  getInternship,
  getSubmissions,
  rejectApplication,
  rejectConfirmation,
} from "../controllers/deptsup.controller.js";
import {
  getStudentCompany,
  getStudents,
  saveConForm,
  submitConForm,
} from "../controllers/compsup.controller.js";

const router = express.Router();

//user routes
router.post("/login", Login);
router.get("/token", refreshToken);
router.delete("/logout", Logout);
router.get("/getnotifs", getNotifications);

// Logbook
router.post("/createlog", createLogEntry);
router.get("/viewlog", getEntries);
router.post("/submitlog", submitLogbook);

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
router.post("/rejectapp", rejectApplication);
router.post("/confirmcon", confirmConfirmation);
router.post("/rejectcon", rejectConfirmation);
router.post("/confirmins", confirmInsurance);

//compsup routes
router.get("/getstd", getStudents);
router.post("/getstdcomp", getStudentCompany);
router.post("/submitconform", submitConForm);
router.post("/saveconform", saveConForm);

/* forgot password */
router.post("/forgotpassword", ForgotPassword);
router.post("/newPassword/:token", newPassword);

export default router;
