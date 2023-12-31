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
  getStdDueDates,
  getStudent,
  saveReport,
} from "../controllers/student.controller.js";

import { refreshToken } from "../controllers/RefreshToken.js";
import {
  createLogEntry,
  deleteLog,
  editLog,
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
  editDueDates,
  editInternshipPosition,
  getDeptDueDates,
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
  getCompDueDates,
  getLogbook,
  getStudentCompany,
  getToDo,
  rejectLogbook,
  saveConForm,
  submitCompEval,
  submitConForm,
} from "../controllers/compsup.controller.js";
import {
  addNewAdmin,
  addNewDeptSup,
  assignDeptSup,
  getDeptSup,
  getStudentstoAssign,
} from "../controllers/admin.controller.js";
import {
  addComment,
  addPost,
  bookmarkPost,
  deleteBookmark,
  deleteComment,
  deletePost,
  getBookmarks,
  getFeed,
  likePost,
  unlikePost,
} from "../controllers/posts.controller.js";

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
router.post("/deletelog", deleteLog);
router.post("/editlog", editLog);

//student routes
router.post("/register", Register);
router.get("/getstudent", getStudent);
router.post("/createapp", createApplication);
router.post("/submitins", submitInsurance);
router.get("/getphoto", getPhoto);
router.post("/savereport", saveReport);
router.get("/getstdduedates", getStdDueDates);

//post routes
router.post("/addpost", addPost);
router.get("/getfeed", getFeed);
router.post("/addcomment", addComment);
router.post("/likepost", likePost);
router.post("/unlikepost", unlikePost);
router.post("/deletepost", deletePost);
router.post("/deletecomment", deleteComment);
router.post("/bookmarkpost", bookmarkPost);
router.post("/deletebookmark", deleteBookmark);
router.get("/getbookmarks", getBookmarks);

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
router.post("/editduedates", editDueDates);
router.get("/getdeptduedates", getDeptDueDates);

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
router.get("/getcompduedates", getCompDueDates);

/* forgot password */
router.post("/forgotpassword", ForgotPassword);
router.post("/newPassword/:token", newPassword);

//admin routes
router.post("/addadmin", addNewAdmin);
router.post("/adddeptsup", addNewDeptSup);
router.get("/getstdtoassign", getStudentstoAssign);
router.get("/getdeptsup", getDeptSup);
router.post("/assigndept", assignDeptSup);

export default router;
