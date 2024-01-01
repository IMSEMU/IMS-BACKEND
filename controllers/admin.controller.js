import { verifyToken } from "../middleware/verifyToken.js";
import Users from "../models/user.model.js";
import { generateOtp } from "../utils/otp.js";
import bcrypt from "bcrypt";
import { Email } from "../utils/mail.js";
import DeptSup from "../models/deptsup.model.js";
import Internshipdtl from "../models/intdetails.model.js";
import Students from "../models/student.model.js";

export const addNewAdmin = async (req, res) => {
  const { firstname, lastname, email } = req.body;

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

    const checkUser = await Users.findOne({
      where: { email: email, roleId: "4" },
    });
    if (!checkUser) {
      const token = generateOtp();
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashPassword = await bcrypt.hash(token, salt);

      const adminUser = await Users.create({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: hashPassword,
        refresh_token: token,
        roleId: "4",
      });

      const url = `http://localhost:3000/new-password?token=${token}`;

      await new Email(adminUser.email, url, token).sendNewAdmin();

      res.status(200).json(adminUser);
    } else {
      res.status(500).json({ msg: "1" }); //Admin User Already Exists
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "2" }); //Internal server error
  }
};

export const addNewDeptSup = async (req, res) => {
  const { firstname, lastname, email, dept } = req.body;

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

    const checkUser = await Users.findOne({
      where: { email: email, roleId: "2" },
    });
    if (!checkUser) {
      const token = generateOtp();
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashPassword = await bcrypt.hash(token, salt);

      const deptUser = await Users.create({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: hashPassword,
        refresh_token: token,
        roleId: "2",
      });

      const deptsup = await DeptSup.create({
        firstname: firstname,
        lastname: lastname,
        email: email,
        department: dept,
        userid: deptUser.userid,
      });

      const url = `http://localhost:3000/new-password?token=${token}`;

      await new Email(deptsup.email, url, token).sendNewDeptSup();

      res.status(200).json(deptsup);
    } else {
      res.status(500).json({ msg: "1" }); //Department Supervisor Already Exists
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "2" }); //Internal server error
  }
};

export const getStudentstoAssign = async (req, res) => {
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

    const intdetails = await Internshipdtl.findAll({
      where: { dept_sup: null },
    });

    let studentinfo = [];
    for (const internship of intdetails) {
      const student = await Students.findOne({
        where: { stdid: internship.stdid },
      });
      const stduser = await Users.findOne({
        where: { userid: student.userId },
        attributes: ["firstname", "lastname", "email"],
      });

      studentinfo.push({
        student,
        internship,
        stduser,
      });
    }

    res.status(200).json(studentinfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getDeptSup = async (req, res) => {
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

    const deptsup = await DeptSup.findAll();

    res.status(200).json(deptsup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const assignDeptSup = async (req, res) => {
  const { stdid, deptsupid } = req.body;
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

    const intdtl = await Internshipdtl.findOne({
      where: { stdid: stdid, dept_sup: null },
    });

    await Internshipdtl.update(
      {
        dept_sup: deptsupid,
      },
      { where: { internshipid: intdtl.internshipid } }
    );

    res.status(200).json({ msg: "Department Supervisor Assigned!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
