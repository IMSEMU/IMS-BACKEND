import { verifyToken } from "../middleware/verifyToken.js";
import Company from "../models/company.model.js";
import Students from "../models/student.model.js";
import CompSup from "../models/compsup.model.js";
import Internshipdtl from "../models/intdetails.model.js";

export const createApplication = async (req, res) => {
  const {
    photo,
    stdphoneno,
    stdaddress,
    compid,
    companyname,
    fields,
    website,
    compemail,
    compaddress,
    compphone,
    compfax,
    workdesc,
    supfname,
    suplname,
    supemail,
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

    await Students.update(
      {
        phoneno: stdphoneno,
        address: stdaddress,
        photo: photo,
      },
      {
        where: { userid: userid },
      }
    );

    let newCompany;
    if (compid === "") {
      newCompany = await Company.create({
        name: companyname,
        fields: fields,
        address: compaddress,
        fax: compfax,
        phoneno: compphone,
        email: compemail,
        website: website,
      });
    } else {
      newCompany = await Company.findOne({
        where: { companyid: compid },
      });
    }

    let compSup;
    compSup = await CompSup.findOne({
      where: { email: supemail },
    });
    if (!compSup) {
      compSup = await CompSup.create({
        firstname: supfname,
        lastname: suplname,
        email: supemail,
        position: position,
        companyid: newCompany.companyid,
      });
    }
    const student = await Students.findOne({
      where: { userid: userid },
    });
    await Internshipdtl.update(
      {
        filled_iaf: 1,
        workdesc: workdesc,
        companyid: newCompany.companyid,
        comp_sup: compSup.supid,
      },
      {
        where: { stdid: student.stdid },
      }
    );

    return res.json({ msg: "Application Successful" });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    return res.status(500).json({ msg: "Application Error" });
  }
};
