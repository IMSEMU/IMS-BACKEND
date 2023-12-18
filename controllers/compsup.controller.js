import { verifyToken } from "../middleware/verifyToken.js";
import { Op } from "sequelize";
import Company from "../models/company.model.js";
import Students from "../models/student.model.js";
import Internshipdtl from "../models/intdetails.model.js";
import IntWork from "../models/intwork.model.js";
import CompSup from "../models/compsup.model.js";
import Users from "../models/user.model.js";
import Notifications from "../models/notification.model.js";
import Log from "../models/log.model.js";
import DeptSup from "../models/deptsup.model.js";
import DueDates from "../models/duedates.model.js";

export const compGetStudents = async (req, res) => {
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
    const stdintdtl = await Internshipdtl.findAll({
      where: {
        comp_sup: compsup.supid,
      },
    });

    const students = [];
    const check = [];
    for (const internshipDetail of stdintdtl) {
      const student = await Students.findOne({
        where: { stdid: internshipDetail.stdid },
      });
      if (student && !check.includes(student.stdid)) {
        const stduser = await Users.findOne({
          where: { userid: student.userId },
          attributes: ["firstname", "lastname", "email"],
        });
        const internships = [];

        const allInternships = await Internshipdtl.findAll({
          where: { stdid: student.stdid, comp_sup: compsup.supid },
        });

        for (const internshipdtl of allInternships) {
          const deptsup = await DeptSup.findOne({
            where: { supid: internshipdtl.dept_sup },
          });

          internships.push({
            internshipdtl,
            deptsup,
          });
        }

        students.push({
          student,
          stduser,
          internships: internships,
        });

        check.push(student.stdid);
      }
    }

    res.status(200).json(students);
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

    const compsup = await CompSup.findOne({
      where: { userid: userid },
    });

    const std = await Students.findOne({
      where: { stdid: stdid },
    });
    const student = await Users.findOne({
      attributes: ["firstname", "lastname"],
      where: { userid: std.userId },
    });

    const company = await Company.findOne({
      where: {
        companyid: compsup.companyid,
      },
    });

    const info = {
      student: student,
      company: company,
    };

    res.status(200).json(info);
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

export const saveConForm = async (req, res) => {
  const { stdid, docSrc } = req.body;
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
        stdid: stdid,
      },
    });

    const internship = await Internshipdtl.findOne({
      where: {
        stdid: stdid,
        filledConForm: false,
        iafConfirmed: true,
      },
    });

    await Internshipdtl.update(
      {
        filledConForm: true,
        conForm: docSrc,
      },
      {
        where: { internshipid: internship.internshipid },
      }
    );

    await Notifications.create({
      trigger: "Confirmation Submitted",
      message:
        "Your Internship Confirmation was submitted and is awaiting approval.",
      userid: student.userId,
    });

    res.status(200).json({ msg: "Confirmation Successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getLogbook = async (req, res) => {
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

    const compsup = await CompSup.findOne({
      where: {
        userid: userid,
      },
    });

    const internship = await Internshipdtl.findOne({
      where: {
        logComplete: true,
        stdid: stdid,
        comp_sup: compsup.supid,
      },
    });

    const logbookEntries = await Log.findAll({
      where: { internshipid: internship.internshipid },
    });
    res.status(200).json(logbookEntries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const approveLogbook = async (req, res) => {
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

    const compsup = await CompSup.findOne({
      where: {
        userid: userid,
      },
    });

    const student = await Students.findOne({
      where: { stdid: stdid },
    });

    const internship = await Internshipdtl.findOne({
      where: {
        logComplete: true,
        stdid: stdid,
        comp_sup: compsup.supid,
      },
    });

    await Internshipdtl.update(
      {
        logConfirmed: true,
      },
      {
        where: { internshipid: internship.internshipid },
      }
    );

    await Notifications.create({
      trigger: "Logbook Approved",
      message: "Your Logbook was approved!",
      userid: student.userId,
    });

    res.status(200).json({ msg: "Logbook Approved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const rejectLogbook = async (req, res) => {
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

    const compsup = await CompSup.findOne({
      where: {
        userid: userid,
      },
    });

    const student = await Students.findOne({
      where: { stdid: stdid },
    });

    const internship = await Internshipdtl.findOne({
      where: {
        logComplete: true,
        stdid: stdid,
        comp_sup: compsup.supid,
      },
    });

    await Internshipdtl.update(
      {
        logComplete: false,
      },
      {
        where: { internshipid: internship.internshipid },
      }
    );

    await Notifications.create({
      trigger: "Logbook Rejected",
      message:
        "Your Logbook was rejected! Correct it and submit again for approval.",
      userid: student.userId,
    });

    res.status(200).json({ msg: "Internship Rejected" });
    // res.status(200).json(intdtl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const submitCompEval = async (req, res) => {
  const {
    stdid,
    interest,
    attendance,
    technicalAbility,
    generalBehavior,
    overallEvaluation,
    summary,
    generalComments,
  } = req.body;
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
      where: {
        userid: userid,
      },
    });

    const student = await Students.findOne({
      where: { stdid: stdid },
    });

    const internship = await Internshipdtl.findOne({
      where: {
        compEvalFilled: false,
        stdid: stdid,
        comp_sup: compsup.supid,
      },
    });

    await Internshipdtl.update(
      {
        compEvalFilled: true,
        interest: interest,
        attendance: attendance,
        technicalablilty: technicalAbility,
        generalbehaviour: generalBehavior,
        overalleval: overallEvaluation,
        summary: summary,
        compgeneralcomments: generalComments,
      },
      {
        where: { internshipid: internship.internshipid },
      }
    );

    res.status(200).json({ msg: "Evaluation Successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getToDo = async (req, res) => {
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

    const intdtl = await Internshipdtl.findAll({
      where: {
        [Op.or]: [
          {
            iafConfirmed: true,
            filledConForm: false,
          },
          {
            logComplete: true,
            logConfirmed: false,
          },
          {
            logConfirmed: true,
            compEvalFilled: false,
          },
        ],
        comp_sup: compsup.supid,
      },
    });

    const todos = [];
    for (const internship of intdtl) {
      const student = await Students.findOne({
        where: { stdid: internship.stdid },
      });

      const stduser = await Users.findOne({
        where: { userid: student.userId },
        attributes: ["firstname", "lastname", "email"],
      });

      todos.push({
        photo: student.photo,
        internshipid: internship.internshipid,
        stdid: student.stdid,
        firstname: stduser.firstname,
        lastname: stduser.lastname,
        iafConfirmed: internship.iafConfirmed,
        filledConForm: internship.filledConForm,
        logComplete: internship.logComplete,
        logConfirmed: internship.logConfirmed,
        compEvalFilled: internship.compEvalFilled,
      });
    }
    res.status(200).json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getCompDueDates = async (req, res) => {
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
      where: {
        userid: userid,
      },
    });

    const intdtl = await Internshipdtl.findAll({
      where: {
        comp_sup: compsup.supid,
        overallresult: null,
      },
    });

    let deptsups = [];
    let duedates = [];
    for (const internship of intdtl) {
      const intdetails = await Internshipdtl.findOne({
        where: { internshipid: internship.internshipid },
      });

      if (intdetails.dept_sup && !deptsups.includes(intdetails.dept_sup)) {
        const ddates = await DueDates.findAll({
          where: {
            [Op.or]: [
              {
                name: "Internship Confirmation Form",
              },
              {
                name: "Logbook",
              },
              {
                name: "Company Evaluation Form",
              },
            ],
            supid: intdetails.dept_sup,
          },
        });
        deptsups.push(intdetails.dept_sup);

        for (const date of ddates) {
          duedates.push(date);
        }
      }
    }
    res.status(200).json(duedates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
