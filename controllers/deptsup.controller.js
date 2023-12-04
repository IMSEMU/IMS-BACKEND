import { verifyToken } from "../middleware/verifyToken.js";
import { Op, Sequelize } from "sequelize";
import Company from "../models/company.model.js";
import Students from "../models/student.model.js";
import Internshipdtl from "../models/intdetails.model.js";
import Users from "../models/user.model.js";
import CompSup from "../models/compsup.model.js";
import { generateOtp } from "../utils/otp.js";
import { Email } from "../utils/mail.js";
import bcrypt from "bcrypt";
import db from "../config/db.config.js";
import IntWork from "../models/intwork.model.js";
import Notifications from "../models/notification.model.js";
import DeptSup from "../models/deptsup.model.js";
import Log from "../models/log.model.js";

export const getSubmissions = async (req, res) => {
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

    const deptsup = await DeptSup.findOne({
      where: { userid: userid },
    });

    const intdtl = await Internshipdtl.findAll({
      where: {
        [Op.or]: [
          {
            filled_iaf: true,
            iafConfirmed: false,
          },
          {
            filledConForm: true,
            conFormConfirmed: false,
          },
          {
            filledSocial: true,
            sifConfirmed: false,
          },
          {
            filledSocial: true,
            sifConfirmed: false,
          },
          {
            logComplete: true,
            logConfirmed: false,
          },
          {
            compEvalFilled: true,
            compEvalConfirmed: false,
          },
          {
            reportComplete: true,
            deptEvalFilled: false,
          },
        ],
        dept_sup: deptsup.supid,
      },
    });
    res.status(200).json(intdtl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getInternship = async (req, res) => {
  const stdid = req.params.stdid;
  const id = req.params.id;
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

    const deptsup = await DeptSup.findOne({
      where: { userid: userid },
    });

    const student = await Students.findOne({
      where: {
        stdid: stdid,
      },
    });
    const internship = await Internshipdtl.findOne({
      where: {
        stdid: stdid,
        internshipid: id,
        dept_sup: deptsup.supid,
      },
    });

    const intwork = await db.query(
      "SELECT intworkid, intdetailInternshipid, workdone.work, other " +
        "FROM intwork " +
        "LEFT JOIN workdone ON workdone.workId = intwork.workdoneWorkid " +
        "WHERE intdetailInternshipid = :id",
      {
        replacements: {
          id: `${id}`,
        },
        type: db.QueryTypes.SELECT,
      }
    );

    const std = await Users.findOne({
      where: {
        userid: student.userId,
      },
    });
    const company = await Company.findOne({
      where: {
        companyid: internship.companyid,
      },
    });
    const compsup = await CompSup.findOne({
      where: {
        supid: internship.comp_sup,
      },
    });
    const iaf = {
      photo: student.photo,
      stdid: student.stdid,
      stdfname: std.firstname,
      stdlname: std.lastname,
      stdemail: std.email,
      stdphone: student.phoneno,
      stdaddress: student.address,
      idpassno: student.id_passno,
      ayear: student.academicYear,
      dept: student.dept,
      fname: student.father_name,
      mname: student.mother_name,
      pob: student.placeofBirth,
      dob: student.dateofBirth,
      doi: student.issueDate,
      validity: student.validity,
      faculty: student.faculty,
      compname: company.name,
      fields: company.fields,
      website: company.website,
      compemail: company.email,
      compphone: company.phoneno,
      compaddress: company.address,
      compfax: company.fax,
      city: company.city,
      country: company.country,
      sgk: company.sgk,
      workdesc: internship.workdesc,
      supfname: compsup.firstname,
      suplname: compsup.lastname,
      supemail: compsup.email,
      position: compsup.position,
      startdate: internship.startDate,
      enddate: internship.endDate,
      duration: internship.workingDays,
      docsrc: internship.conForm,
      interest: internship.interest,
      attendance: internship.attendance,
      technicalablilty: internship.technicalablilty,
      generalbehaviour: internship.generalbehaviour,
      overalleval: internship.overalleval,
      summary: internship.summary,
      generalcomments: internship.compgeneralcomments,
      reportDocSrc: internship.report,
      intwork: intwork,
    };

    res.status(200).json(iaf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const confirmApplication = async (req, res) => {
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

    const deptsup = await DeptSup.findOne({
      where: { userid: userid },
    });

    const student = await Students.findOne({
      where: {
        stdid: stdid,
      },
    });

    const internship = await Internshipdtl.findOne({
      where: {
        stdid: stdid,
        filled_iaf: true,
        iafConfirmed: false,
        dept_sup: deptsup.supid,
      },
    });
    const compsup = await CompSup.findOne({
      where: {
        supid: internship.comp_sup,
      },
    });

    const userExists = await Users.findOne({
      where: {
        [Op.or]: [{ userid: compsup.userid }, { email: compsup.email }],
      },
    });
    if (!userExists) {
      const token = generateOtp();
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashPassword = await bcrypt.hash(token, salt);

      const newUser = await Users.create({
        firstname: compsup.firstname,
        lastname: compsup.lastname,
        email: compsup.email,
        password: hashPassword,
        refresh_token: token,
        roleId: "3",
      });

      await CompSup.update(
        {
          userid: newUser.userid,
        },
        {
          where: {
            email: newUser.email,
          },
        }
      );

      const url = `http://localhost:3000/new-password?token=${token}`;

      await new Email(newUser.email, url, token).sendNewCompSup();
    } else {
      const url = `http://localhost:3000/login`;
      const token = " ";

      await new Email(compsup.email, url, token).sendNewStudentAdded();
    }

    await Internshipdtl.update(
      {
        iafConfirmed: true,
      },
      {
        where: {
          internshipid: internship.internshipid,
        },
      }
    );

    await Notifications.create({
      trigger: "Application Confirmed",
      message: "Your Internship Application was Confirmed!",
      userid: student.userId,
    });

    res.status(200).json({ msg: "Internship Confirmed" });
    // res.status(200).json(intdtl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const rejectApplication = async (req, res) => {
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

    const deptsup = await DeptSup.findOne({
      where: { userid: userid },
    });

    const student = await Students.update(
      {
        phoneno: null,
        address: null,
        photo: null,
      },
      {
        where: {
          stdid: stdid,
        },
      }
    );
    const internship = await Internshipdtl.findOne({
      where: {
        stdid: stdid,
        filled_iaf: true,
        iafConfirmed: false,
        dept_sup: deptsup.supid,
      },
    });
    const otherSupStudents = await Internshipdtl.findAll({
      where: { comp_sup: internship.comp_sup },
    });
    const otherCompStudents = await Internshipdtl.findAll({
      where: { companyid: internship.companyid },
    });
    const updatedInternship = await Internshipdtl.update(
      {
        filled_iaf: false,
        workdesc: null,
        companyid: null,
        comp_sup: null,
      },
      {
        where: {
          stdid: stdid,
          filled_iaf: true,
          iafConfirmed: false,
        },
      }
    );
    if (otherSupStudents.length === 1) {
      const std = otherSupStudents[0];
      await CompSup.destroy({
        where: { supid: std.comp_sup },
      });
      if (otherCompStudents.length === 1) {
        const int = otherCompStudents[0];
        await Company.destroy({
          where: { companyid: int.companyid },
        });
      }
    }

    await Notifications.create({
      trigger: "Application Rejected",
      message: "Your Internship Application was Rejected!",
      userid: student.userId,
    });

    res.status(200).json({ msg: "Internship Rejected" });
    // res.status(200).json(intdtl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const confirmConfirmation = async (req, res) => {
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

    const deptsup = await DeptSup.findOne({
      where: { userid: userid },
    });

    const student = await Students.findOne({
      where: {
        stdid: stdid,
      },
    });
    const internship = await Internshipdtl.findOne({
      where: {
        stdid: stdid,
        filledConForm: true,
        conFormConfirmed: false,
        dept_sup: deptsup.supid,
      },
    });

    await Internshipdtl.update(
      {
        conFormConfirmed: true,
      },
      {
        where: {
          internshipid: internship.internshipid,
        },
      }
    );

    const compsup = await CompSup.findOne({
      where: { supid: internship.comp_sup },
    });

    await Notifications.create({
      trigger: "Confirmation Confirmed",
      message: "Your Internship Confirmation was Confirmed!",
      userid: student.userId,
    });

    await Notifications.create({
      trigger: "Confirmation Confirmed",
      message: `Your Internship Confirmation for ${stdid} was Confirmed!`,
      userid: compsup.userid,
    });

    res.status(200).json({ msg: "Internship Confirmed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const rejectConfirmation = async (req, res) => {
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

    const deptsup = await DeptSup.findOne({
      where: { userid: userid },
    });

    const student = await Students.findOne({
      where: {
        stdid: stdid,
      },
    });

    const internship = await Internshipdtl.findOne({
      where: {
        stdid: stdid,
        filledConForm: true,
        conFormConfirmed: false,
        dept_sup: deptsup.supid,
      },
    });

    const compsup = await CompSup.findOne({
      where: { supid: internship.compsup },
    });

    await Internshipdtl.update(
      {
        startDate: null,
        endDate: null,
        workingDays: null,
        filledConForm: false,
      },
      {
        where: { internshipid: internship.internshipid },
      }
    );
    IntWork.destroy({
      where: {
        intdetailInternshipid: internship.internshipid,
      },
    });

    await Notifications.create({
      trigger: "Confirmation Rejected",
      message: "Your Internship Confirmation was Rejected!",
      userid: student.userId,
    });

    await Notifications.create({
      trigger: "Confirmation Rejected",
      message: `Your Internship Confirmation for ${stdid} was Rejected! Please fill it again.`,
      userid: compsup.userid,
    });

    res.status(200).json({ msg: "Internship Rejected" });
    // res.status(200).json(intdtl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const confirmInsurance = async (req, res) => {
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

    const deptsup = await DeptSup.findOne({
      where: { userid: userid },
    });

    const student = await Students.findOne({
      where: {
        stdid: stdid,
      },
    });
    const internship = await Internshipdtl.findOne({
      where: {
        stdid: stdid,
        filledSocial: true,
        sifConfirmed: false,
        dept_sup: deptsup.supid,
      },
    });

    await Internshipdtl.update(
      {
        sifConfirmed: true,
      },
      {
        where: {
          internshipid: internship.internshipid,
        },
      }
    );

    await Notifications.create({
      trigger: "Isurance Confirmed",
      message: "Your Social Insurance Form was Confirmed!",
      userid: student.userId,
    });

    res.status(200).json({ msg: "Social Insurance Confirmed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getDeptLogbook = async (req, res) => {
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

    const deptsup = await DeptSup.findOne({
      where: {
        userid: userid,
      },
    });

    const internship = await Internshipdtl.findOne({
      where: {
        logConfirmed: true,
        stdid: stdid,
        dept_sup: deptsup.supid,
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

export const confirmEvaluation = async (req, res) => {
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

    const deptsup = await DeptSup.findOne({
      where: { userid: userid },
    });

    const student = await Students.findOne({
      where: {
        stdid: stdid,
      },
    });
    const internship = await Internshipdtl.findOne({
      where: {
        stdid: stdid,
        compEvalFilled: true,
        compEvalConfirmed: false,
        dept_sup: deptsup.supid,
      },
    });

    await Internshipdtl.update(
      {
        compEvalConfirmed: true,
      },
      {
        where: {
          internshipid: internship.internshipid,
        },
      }
    );

    const compsup = await CompSup.findOne({
      where: { supid: internship.comp_sup },
    });

    await Notifications.create({
      trigger: "Evaluation Confirmed",
      message: "Your Trainee Evaluation was Confirmed!",
      userid: student.userId,
    });

    await Notifications.create({
      trigger: "Evaluation Confirmed",
      message: `Your Trainee Evaluation for ${stdid} was Confirmed!`,
      userid: compsup.userid,
    });

    res.status(200).json({ msg: "Internship Confirmed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const rejectEvaluation = async (req, res) => {
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

    const deptsup = await DeptSup.findOne({
      where: { userid: userid },
    });
    const student = await Students.findOne({
      where: {
        stdid: stdid,
      },
    });
    const internship = await Internshipdtl.findOne({
      where: {
        stdid: stdid,
        compEvalFilled: true,
        compEvalConfirmed: false,
        dept_sup: deptsup.supid,
      },
    });

    await Internshipdtl.update(
      {
        compEvalFilled: false,
        interest: null,
        attendance: null,
        technicalablilty: null,
        generalbehaviour: null,
        overalleval: null,
        summary: null,
        compgeneralcomments: null,
      },
      {
        where: { internshipid: internship.internshipid },
      }
    );
    const compsup = await CompSup.findOne({
      where: { supid: internship.comp_sup },
    });

    await Notifications.create({
      trigger: "Evaluation Rejected",
      message: "Your Trainee Evaluation was Rejected!",
      userid: student.userId,
    });

    await Notifications.create({
      trigger: "Evaluation Rejected",
      message: `Your Trainee Evaluation for ${stdid} was Rejected! Please fill it again.`,
      userid: compsup.userid,
    });

    res.status(200).json({ msg: "Internship Rejected" });
    // res.status(200).json(intdtl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const submitDeptEval = async (req, res) => {
  const {
    stdid,
    quality,
    itwork,
    knowledge,
    answeringQuestions,
    grade,
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

    const deptsup = await DeptSup.findOne({
      where: {
        userid: userid,
      },
    });

    const student = await Students.findOne({
      where: { stdid: stdid },
    });

    const internship = await Internshipdtl.findOne({
      where: {
        reportComplete: true,
        deptEvalFilled: false,
        stdid: stdid,
      },
    });

    await Internshipdtl.update(
      {
        deptEvalFilled: true,
        quality: quality,
        itwork: itwork,
        knowledge: knowledge,
        answeringquestions: answeringQuestions,
        overallresult: grade,
        deptgeneralComments: generalComments,
      },
      {
        where: { internshipid: internship.internshipid },
      }
    );

    if (grade === "S") {
      await Internshipdtl.update(
        {
          intComplete: true,
        },
        {
          where: { internshipid: internship.internshipid },
        }
      );
      const stduser = await Users.findOne({
        where: { userid: student.userId },
      });
      await Notifications.create({
        trigger: "Internship Evaluated",
        message: "Your Internship was Satisfactory!",
        userid: student.userId,
      });
      const url = " ";
      const token = " ";

      await new Email(stduser.email, url, token).sendSatisfactoryInternship();
      if (internship.workingDays === "20") {
        const previousInternships = await Internshipdtl.findAll({
          where: { stdid: stdid, intComplete: true },
        });
        if (previousInternships.length === 1) {
          await Internshipdtl.create({
            stdid: stdid,
            dept_sup: "1",
          });
        }
      }
    } else {
      await Notifications.create({
        trigger: "Internship Evaluated",
        message:
          "Your Internship was Unsatisfactory! You have to reapply for another internship.",
        userid: student.userId,
      });
      await Internshipdtl.create({
        stdid: stdid,
        dept_sup: "1",
      });
    }

    res.status(200).json({ msg: "Evaluation Successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
