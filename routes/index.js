import express from "express";
import {
  Login,
  Logout,
  ForgotPassword,
  newPassword,
  getNotifications,
  getAnnouncements,
  getCompletedInternships,
  getAvailableInternships,
} from "../controllers/user.controller.js";

import {
  Register,
  getPhoto,
  getStudent,
  saveReport,
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
  addAnnouncement,
  addInternshipPosition,
  confirmApplication,
  confirmConfirmation,
  confirmEvaluation,
  confirmInsurance,
  deleteAnnouncement,
  deleteInternshipPosition,
  editAnnouncement,
  editInternshipPosition,
  getDeptLogbook,
  getInternship,
  getStudents,
  getSubmissions,
  rejectApplication,
  rejectConfirmation,
  rejectEvaluation,
  submitDeptEval,
} from "../controllers/deptsup.controller.js";
import {
  approveLogbook,
  compGetStudents,
  getLogbook,
  getStudentCompany,
  getToDo,
  rejectLogbook,
  saveConForm,
  submitCompEval,
  submitConForm,
} from "../controllers/compsup.controller.js";

const router = express.Router();

//user routes
router.post("/login", Login);
router.get("/token", refreshToken);
router.delete("/logout", Logout);
router.get("/getnotifs", getNotifications);
router.get("/getannouncements", getAnnouncements);
router.get("/getcompletedint", getCompletedInternships);
router.get("/getintpositions", getAvailableInternships);

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
router.post("/savereport", saveReport);

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
router.post("/viewlogdept", getDeptLogbook);
router.post("/confirmeval", confirmEvaluation);
router.post("/rejecteval", rejectEvaluation);
router.post("/submitdepteval", submitDeptEval);
router.post("/addannouncement", addAnnouncement);
router.post("/editannouncement", editAnnouncement);
router.post("/deleteannouncement", deleteAnnouncement);
router.get("/getstd", getStudents);
router.post("/addintpostion", addInternshipPosition);
router.post("/editintposition", editInternshipPosition);
router.post("/deleteintposition", deleteInternshipPosition);

//compsup routes

router.post("/getstdcomp", getStudentCompany);
router.post("/submitconform", submitConForm);
router.post("/saveconform", saveConForm);
router.post("/viewsubmittedlog", getLogbook);
router.post("/approvelog", approveLogbook);
router.post("/rejectlog", rejectLogbook);
router.post("/submitcompeval", submitCompEval);
router.get("/gettodos", getToDo);
router.get("/compgetstd", compGetStudents);

/* forgot password */
router.post("/forgotpassword", ForgotPassword);
router.post("/newPassword/:token", newPassword);

export default router;
