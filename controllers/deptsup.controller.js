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
import Announcements from "../models/announcement.model.js";
import CompletedInternships from "../models/completedinternships.model.js";
import IntPositions from "../models/intpositions.model.js";
import DueDates from "../models/duedates.model.js";

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

    const dept_sup = await DeptSup.findOne({
      where: { userid: userid },
    });
    const stdintdtl = await Internshipdtl.findAll({
      where: {
        dept_sup: dept_sup.supid,
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
        const allInternships = await Internshipdtl.findAll({
          where: { stdid: student.stdid, dept_sup: dept_sup.supid },
        });

        const internships = [];
        for (const internshipdtl of allInternships) {
          const compsup = await CompSup.findOne({
            where: { supid: internshipdtl.comp_sup },
          });
          if (compsup) {
            const company = await Company.findOne({
              where: { companyid: compsup.companyid },
            });

            internships.push({
              internshipdtl,
              compsup,
              company,
            });
          }
        }

        students.push({
          student,
          stduser,
          internships: internships,
        });

        check.push(student.stdid);
      }
    }

    console.log(students);

    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

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
    const compsup = await CompSup.findOne({
      where: {
        supid: internship.comp_sup,
      },
    });
    const company = await Company.findOne({
      where: {
        companyid: compsup.companyid,
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
      return res.status(401).json({ msg: "1" }); //Unauthorized
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "1" }); //Unauthorized
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "2" }); //Internal Server Error
  }
};

export const rejectApplication = async (req, res) => {
  const { stdid } = req.body;

  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "1" }); //Unauthorized
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "1" }); //Unauthorized
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
    await Internshipdtl.update(
      {
        filled_iaf: false,
        workdesc: null,
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
    }

    await Notifications.create({
      trigger: "Application Rejected",
      message: "Your Internship Application was Rejected!",
      userid: student.userId,
    });

    res.status(200).json({ msg: "Internship Rejected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "2" }); //Internal Server Error
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
      where: { supid: internship.comp_sup },
    });

    await Internshipdtl.update(
      {
        startDate: null,
        endDate: null,
        workingDays: null,
        filledConForm: false,
        conForm: null,
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
        overallresult: null,
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
        dept_sup: deptsup.supid,
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

      const compsup = await CompSup.findOne({
        where: { supid: internship.comp_sup },
      });

      const alreadyCompleted = await CompletedInternships.findOne({
        where: { compid: compsup.companyid },
      });
      const currentDate = new Date();
      if (!alreadyCompleted) {
        await CompletedInternships.create({
          compid: compsup.companyid,
          year: currentDate,
        });
      } else {
        await CompletedInternships.update(
          {
            year: currentDate,
          },
          { where: { cintid: alreadyCompleted.cintid } }
        );
      }

      if (internship.workingDays === "20") {
        const previousInternships = await Internshipdtl.findAll({
          where: { stdid: stdid, intComplete: true },
        });
        if (previousInternships.length === 1) {
          await Internshipdtl.create({
            stdid: stdid,
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
      });
    }

    res.status(200).json({ msg: "Evaluation Successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const addAnnouncement = async (req, res) => {
  const { title, content } = req.body;
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

    const announcement = await Announcements.create({
      title: title,
      content: content,
      supid: deptsup.supid,
    });

    res.status(200).json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const editAnnouncement = async (req, res) => {
  const { id, title, content } = req.body;
  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "1" }); //Unauthorized
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "1" }); //Unauthorized
    }

    const deptsup = await DeptSup.findOne({
      where: {
        userid: userid,
      },
    });

    const announcement = await Announcements.findOne({
      where: { announcementid: id },
    });

    if (announcement.supid === deptsup.supid) {
      await Announcements.update(
        {
          title: title,
          content: content,
        },
        { where: { announcementid: id } }
      );
      res.status(200).json({ msg: "Announcement Edited Successfully!" });
    } else {
      return res.status(401).json({ msg: "1" }); //Unauthorized
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "2" }); //Internal server error
  }
};

export const deleteAnnouncement = async (req, res) => {
  const { id } = req.body;
  try {
    // Check if user is logged in
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "1" }); //Unauthorized
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "1" }); //Unauthorized
    }

    const deptsup = await DeptSup.findOne({
      where: {
        userid: userid,
      },
    });

    const announcement = await Announcements.findOne({
      where: { announcementid: id },
    });

    if (announcement.supid === deptsup.supid) {
      await Announcements.destroy({ where: { announcementid: id } });
      res.status(200).json({ msg: "Announcement Deleted Successfully!" });
    } else {
      return res.status(401).json({ msg: "1" }); //Unauthorized
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "2" }); //Internal server Error
  }
};

export const addInternshipPosition = async (req, res) => {
  const {
    companyname,
    country,
    city,
    desc,
    reqs,
    applyby,
    image,
    contact,
    position,
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

    const intPosition = await IntPositions.create({
      compname: companyname,
      country: country,
      city: city,
      desc: desc,
      requirements: reqs,
      photo: image,
      applyby: applyby,
      contact: contact,
      position: position,
      postedby: deptsup.supid,
    });

    res.status(200).json(intPosition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const editInternshipPosition = async (req, res) => {
  const {
    id,
    companyname,
    country,
    city,
    desc,
    reqs,
    applyby,
    image,
    contact,
    position,
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

    const intPosition = await IntPositions.findOne({
      where: { posid: id },
    });

    if (intPosition.postedby === deptsup.supid) {
      await IntPositions.update(
        {
          compname: companyname,
          country: country,
          city: city,
          desc: desc,
          requirements: reqs,
          photo: image,
          applyby: applyby,
          contact: contact,
          position: position,
        },
        { where: { posid: id } }
      );
      res.status(200).json({ msg: "Announcement Edited Successfully!" });
    } else {
      return res.status(401).json({ msg: "Unauthorized" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const deleteInternshipPosition = async (req, res) => {
  const { id } = req.body;
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

    const intpositions = await IntPositions.findOne({
      where: { posid: id },
    });

    if (intpositions.postedby === deptsup.supid) {
      await IntPositions.destroy({ where: { posid: id } });
      res
        .status(200)
        .json({ msg: "Internship Position Deleted Successfully!" });
    } else {
      return res.status(401).json({ msg: "Unauthorized" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const editDueDates = async (req, res) => {
  const { iaf, conform, sif, logbook, compeval, report } = req.body;
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

    if (iaf != "") {
      const findIaf = await DueDates.findOne({
        where: { name: "Internship Application Form", supid: deptsup.supid },
      });

      if (findIaf) {
        await DueDates.update(
          {
            date: iaf,
          },
          { where: { formid: findIaf.formid } }
        );
      } else {
        await DueDates.create({
          name: "Internship Application Form",
          date: iaf,
          supid: deptsup.supid,
        });
      }
    }
    if (conform != "") {
      const findConform = await DueDates.findOne({
        where: { name: "Internship Confirmation Form", supid: deptsup.supid },
      });

      if (findConform) {
        await DueDates.update(
          {
            date: conform,
          },
          { where: { formid: findConform.formid } }
        );
      } else {
        await DueDates.create({
          name: "Internship Confirmation Form",
          date: conform,
          supid: deptsup.supid,
        });
      }
    }

    if (sif != "") {
      const findSif = await DueDates.findOne({
        where: { name: "Social Insurance Form", supid: deptsup.supid },
      });

      if (findSif) {
        await DueDates.update(
          {
            date: sif,
          },
          { where: { formid: findSif.formid } }
        );
      } else {
        await DueDates.create({
          name: "Social Insurance Form",
          date: sif,
          supid: deptsup.supid,
        });
      }
    }
    if (logbook != "") {
      const findLogbook = await DueDates.findOne({
        where: { name: "Logbook", supid: deptsup.supid },
      });

      if (findLogbook) {
        await DueDates.update(
          {
            date: logbook,
          },
          { where: { formid: findLogbook.formid } }
        );
      } else {
        await DueDates.create({
          name: "Logbook",
          date: logbook,
          supid: deptsup.supid,
        });
      }
    }

    if (compeval != "") {
      const findCompEval = await DueDates.findOne({
        where: { name: "Company Evaluation Form", supid: deptsup.supid },
      });

      if (findCompEval) {
        await DueDates.update(
          {
            date: compeval,
          },
          { where: { formid: findCompEval.formid } }
        );
      } else {
        await DueDates.create({
          name: "Company Evaluation Form",
          date: compeval,
          supid: deptsup.supid,
        });
      }
    }

    if (report != "") {
      const findReport = await DueDates.findOne({
        where: { name: "Report", supid: deptsup.supid },
      });

      if (findReport) {
        await DueDates.update(
          {
            date: report,
          },
          { where: { formid: findReport.formid } }
        );
      } else {
        await DueDates.create({
          name: "Report",
          date: report,
          supid: deptsup.supid,
        });
      }
    }

    const duedates = await DueDates.findAll({
      where: { supid: deptsup.supid },
    });

    res.status(200).json(duedates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getDeptDueDates = async (req, res) => {
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

    const duedates = await DueDates.findAll({
      where: { supid: deptsup.supid },
    });

    res.status(200).json(duedates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
