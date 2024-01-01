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
    compcity,
    country,
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
      return res.status(401).json({ msg: "1" }); //Unauthorized
    }

    // Verify refresh token and get user ID
    const { userid } = await verifyToken(refreshToken);
    if (!userid) {
      return res.status(401).json({ msg: "1" }); //Unauthorized
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
        city: compcity,
        country: country,
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
        comp_sup: compSup.supid,
      },
      {
        where: { stdid: student.stdid },
      }
    );

    return res.json({ msg: "Application Successful" });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    return res.status(500).json({ msg: "2" }); //Internal Server Error
  }
};

export const submitInsurance = async (req, res) => {
  const {
    idpassno,
    ayear,
    dept,
    faculty,
    fname,
    mname,
    pob,
    birthDate,
    issueDate,
    validity,
    sgk,
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
        id_passno: idpassno,
        academicYear: ayear,
        dept: dept,
        faculty: faculty,
        placeofBirth: pob,
        dateofBirth: birthDate,
        mother_name: mname,
        father_name: fname,
        issueDate: issueDate,
        validity: validity,
      },
      {
        where: { userid: userid },
      }
    );

    const student = await Students.findOne({
      where: { userid: userid },
    });
    const intdtl = await Internshipdtl.findOne({
      where: {
        stdid: student.stdid,
        filledSocial: false,
      },
    });

    const compsup = await CompSup.findOne({
      where: { supid: intdtl.comp_sup },
    });

    await Company.update(
      {
        sgk: sgk,
      },
      {
        where: { companyid: compsup.companyid },
      }
    );

    await Internshipdtl.update(
      {
        filledSocial: 1,
      },
      {
        where: { internshipid: intdtl.internshipid },
      }
    );

    return res.json({ msg: "Form filled Successfully" });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    return res.status(500).json({ msg: "Error" });
  }
};
