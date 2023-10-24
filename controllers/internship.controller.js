import { verifyToken } from "../middleware/verifyToken.js";
import Company from "../models/company.model.js";
import Students from "../models/student.model.js";
import CompSup from "../models/compsup.model.js";

export const createApplication = async (req, res) => {
  const {
    stdphoneno,
    stdaddress,
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
        workdesc: workdesc,
        filled_iaf: 1,
      },
      {
        where: { userid: userid },
      }
    );
    const newCompany = await Company.create({
      name: companyname,
      fields: fields,
      address: compaddress,
      fax: compfax,
      phoneno: compphone,
      email: compemail,
      website: website,
    });
    await CompSup.create({
      firstname: supfname,
      lastname: suplname,
      email: supemail,
      position: position,
      companyid: newCompany.companyid,
    });

    return res.json({ msg: "Application Successful" });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    return res.status(500).json({ msg: "Application Error" });
  }
};
