import Students from "../models/student.model.js";
import Users from "../models/user.model.js";
import bcrypt from "bcrypt";
import { verifyToken } from "../middleware/verifyToken.js";
import Internshipdtl from "../models/intdetails.model.js";
import Company from "../models/company.model.js";
import Notifications from "../models/notification.model.js";
import DueDates from "../models/duedates.model.js";
import CompSup from "../models/compsup.model.js";

export const Register = async (req, res) => {
  const { stdid, firstname, lastname, email, password, confPassword } =
    req.body;

  // Check if password is missing or undefined
  if (!password) {
    return res.status(400).json({ msg: "1", requestBody: req.body }); //Password is required
  }

  // Check if password and confirm password match
  if (password !== confPassword) {
    return res.status(400).json({ msg: "2" }); //Password and Confirm Password do not match
  }

  const saltRounds = 10;

  try {
    // Check if a user with the same email already exists
    const existingUser = await Users.findOne({ where: { email: email } });

    if (existingUser) {
      return res.status(400).json({ msg: "3" }); //Email already exists
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await Users.create({
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: hashPassword,
      roleId: "1",
    });

    await Students.create({
      stdid: stdid,
      userId: newUser.userid,
    });
    await Internshipdtl.create({
      stdid: stdid,
    });

    return res.json({ msg: "Registration Successful" });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    return res.status(500).json({ msg: "4" }); //Registration Error
  }
};

export const getStudent = async (req, res) => {
  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    const std = await Students.findOne({
      where: { userid: userid },
      attributes: ["userId", "stdid", "phoneno", "address"],
    });
    const intdtl = await Internshipdtl.findOne({
      where: { stdid: std.stdid, overallresult: null },
    });
    const compsup = await CompSup.findOne({
      where: { supid: intdtl.comp_sup },
    });

    let student;
    if (compsup) {
      const company = await Company.findOne({
        where: { companyid: compsup.companyid },
      });

      student = {
        userid: std.userId,
        stdid: std.stdid,
        phoneno: std.phoneno,
        address: std.address,
        country: company.country,
        startdate: intdtl.startDate,
        enddate: intdtl.endDate,
        duration: intdtl.workingDays,
        filled_iaf: intdtl.filled_iaf,
        iafConfirmed: intdtl.iafConfirmed,
        filledConForm: intdtl.filledConForm,
        conFormConfirmed: intdtl.conFormConfirmed,
        filledSocial: intdtl.filledSocial,
        sifConfirmed: intdtl.sifConfirmed,
        logComplete: intdtl.logComplete,
        logConfirmed: intdtl.logConfirmed,
        reportComplete: intdtl.reportComplete,
      };
    } else {
      student = {
        userid: std.userId,
        stdid: std.stdid,
        phoneno: std.phoneno,
        address: std.address,
        startdate: intdtl.startDate,
        enddate: intdtl.endDate,
        duration: intdtl.workingDays,
        filled_iaf: intdtl.filled_iaf,
        iafConfirmed: intdtl.iafConfirmed,
        filledConForm: intdtl.filledConForm,
        conFormConfirmed: intdtl.conFormConfirmed,
        filledSocial: intdtl.filledSocial,
        sifConfirmed: intdtl.sifConfirmed,
        logComplete: intdtl.logComplete,
        logConfirmed: intdtl.logConfirmed,
        reportComplete: intdtl.reportComplete,
      };
    }

    res.status(200).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getPhoto = async (req, res) => {
  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    const student = await Students.findOne({
      where: { userid: userid },
      attributes: ["photo"],
    });
    res.status(200).json(student.photo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const saveReport = async (req, res) => {
  const { docSrc } = req.body;
  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const student = await Students.findOne({
      where: {
        userId: userid,
      },
    });

    const internship = await Internshipdtl.findOne({
      where: {
        stdid: student.stdid,
        reportComplete: false,
        overallresult: null,
      },
    });

    await Internshipdtl.update(
      {
        reportComplete: true,
        report: docSrc,
      },
      {
        where: { internshipid: internship.internshipid },
      }
    );

    await Notifications.create({
      trigger: "Report Submited",
      message: "Your Report was submitted and will be graded.",
      userid: student.userId,
    });

    res.status(200).json({ msg: "Submission Successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getStdDueDates = async (req, res) => {
  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const student = await Students.findOne({
      where: {
        userid: userid,
      },
    });

    const intdtl = await Internshipdtl.findOne({
      where: {
        stdid: student.stdid,
        overallresult: null,
      },
    });

    let duedates = [];
    if (intdtl.dept_sup) {
      duedates = await DueDates.findAll({
        where: { supid: intdtl.dept_sup },
      });
    }

    res.status(200).json(duedates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
