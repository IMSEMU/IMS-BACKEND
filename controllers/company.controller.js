import { verifyToken } from "../middleware/verifyToken.js";
import Company from "../models/company.model.js";
import Students from "../models/student.model.js";
import Internshipdtl from "../models/intdetails.model.js";
import CompSup from "../models/compsup.model.js";

export const getCompanies = async (req, res) => {
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

    const companies = await Company.findAll();
    res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getCompany = async (req, res) => {
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
    });
    const intdtl = await Internshipdtl.findOne({
      where: { stdid: std.stdid, overallresult: null },
    });

    const comp = await Company.findOne({
      where: { companyid: intdtl.companyid },
      attributes: [
        "companyid",
        "name",
        "address",
        "fields",
        "phoneno",
        "email",
        "website",
      ],
    });
    const compsup = await CompSup.findOne({
      where: { supid: intdtl.comp_sup },
    });
    const companydtl = {
      companyid: comp.companyid,
      compname: comp.name,
      address: comp.address,
      fields: comp.fields,
      phoneno: comp.phoneno,
      email: comp.email,
      website: comp.website,
      firstname: compsup.firstname,
      lastname: compsup.lastname,
      supemail: compsup.email,
      position: compsup.position,
    };
    res.status(200).json(companydtl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
