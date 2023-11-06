import { verifyToken } from "../middleware/verifyToken.js";
import { Op } from "sequelize";
import Company from "../models/company.model.js";
import Students from "../models/student.model.js";
import Internshipdtl from "../models/intdetails.model.js";
import IntWork from "../models/intwork.model.js";
import CompSup from "../models/compsup.model.js";
import { generateOtp } from "../utils/otp.js";
import { Email } from "../utils/mail.js";
import WorkDone from "../models/workdone.model.js";

export const getStudents = async (req, res) => {
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

    const compsup = await CompSup.findOne({
      where: { userid: userid },
    });
    const conFormStudents = await Internshipdtl.findAll({
      where: {
        comp_sup: compsup.supid,
        iafConfirmed: true,
        filledConForm: false,
      },
    });

    res.status(200).json(conFormStudents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
export const getStudentCompany = async (req, res) => {
  const { stdid } = req.body;
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
      where: { stdid: stdid },
    });

    const intdtl = await Internshipdtl.findOne({
      where: {
        stdid: stdid,
        iafConfirmed: true,
      },
    });

    const company = await Company.findOne({
      where: {
        companyid: intdtl.companyid,
      },
    });

    res.status(200).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const submitConForm = async (req, res) => {
  const { stdid, startDate, endDate, duration, worktobeDone, other } = req.body;
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

    const internship = await Internshipdtl.findOne({
      where: {
        stdid: stdid,
        filledConForm: false,
        iafConfirmed: true,
      },
    });

    await Internshipdtl.update(
      {
        startDate: startDate,
        endDate: endDate,
        workingDays: duration,
        filledConForm: true,
      },
      {
        where: { internshipid: internship.internshipid },
      }
    );

    for (const workid of worktobeDone) {
      await IntWork.create({
        intdetailInternshipid: internship.internshipid,
        workdoneWorkid: workid,
      });
    }

    if (other != "") {
      await IntWork.create({
        intdetailInternshipid: internship.internshipid,
        other: other,
      });
    }

    res.status(200).json({ msg: "Confirmation Successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
