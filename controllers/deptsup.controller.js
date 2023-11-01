import { verifyToken } from "../middleware/verifyToken.js";
import { Op } from "sequelize";
import Company from "../models/company.model.js";
import Students from "../models/student.model.js";
import Internshipdtl from "../models/intdetails.model.js";
import Users from "../models/user.model.js";
import CompSup from "../models/compsup.model.js";

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
            reportConfirmed: false,
          },
        ],
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

    const student = await Students.findOne({
      where: {
        stdid: stdid,
      },
    });
    const internship = await Internshipdtl.findOne({
      where: {
        stdid: stdid,
        internshipid: id,
      },
    });
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
      stdfname: std.firstname,
      stdlname: std.lastname,
      stdemail: std.email,
      stdphone: student.phoneno,
      stdaddress: student.address,
      compname: company.name,
      fields: company.fields,
      website: company.website,
      compemail: company.email,
      compphone: company.phoneno,
      compaddress: company.address,
      compfax: company.fax,
      workdesc: internship.workdesc,
      supfname: compsup.firstname,
      suplname: compsup.lastname,
      supemail: compsup.email,
      position: compsup.position,
    };

    res.status(200).json(iaf);
    // res.status(200).json(intdtl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
