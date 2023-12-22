import Log from "../models/log.model.js";
import { verifyToken } from "../middleware/verifyToken.js";
import Students from "../models/student.model.js";
import Internshipdtl from "../models/intdetails.model.js";
import { Op } from "sequelize";

export const createLogEntry = async (req, res) => {
  try {
    const { day, date, department, description } = req.body;

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
        userid: userid,
      },
    });

    const internship = await Internshipdtl.findOne({
      where: {
        logComplete: false,
        stdid: student.stdid,
      },
    });

    const existingLogEntry = await Log.findOne({
      where: {
        internshipid: internship.internshipid,
        day: day,
      },
    });

    if (existingLogEntry) {
      return res.status(400).json({ msg: "1" }); //Log entry with the same day already exists
    }
    const existingLogEntry1 = await Log.findOne({
      where: {
        internshipid: internship.internshipid,
        date: date,
      },
    });

    if (existingLogEntry1) {
      return res.status(400).json({ msg: "2" }); //Log entry with the same date already exists
    }

    if (parseInt(day) > parseInt(internship.workingDays)) {
      return res.status(400).json({
        msg: "3", //Invalid Day. Day cannot be more than Internship Duration
      });
    }

    // Create log entry
    const logEntry = await Log.create({
      day,
      date,
      department,
      description,
      internshipid: internship.internshipid,
    });

    return res
      .status(201)
      .json({ msg: "Log entry created successfully", logEntry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getEntries = async (req, res) => {
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
        userid: userid,
      },
    });

    const internship = await Internshipdtl.findOne({
      where: {
        logComplete: false,
        stdid: student.stdid,
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

export const submitLogbook = async (req, res) => {
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
        userid: userid,
      },
    });

    const internship = await Internshipdtl.findOne({
      where: {
        logComplete: false,
        stdid: student.stdid,
      },
    });

    await Internshipdtl.update(
      {
        logComplete: true,
      },
      {
        where: {
          internshipid: internship.internshipid,
        },
      }
    );

    res.status(200).json({ msg: "Logbook Submitted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const deleteLog = async (req, res) => {
  const { logid } = req.body;
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

    await Log.destroy({
      where: { logid: logid },
    });

    res.status(200).json({ msg: "Log Entry Deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const editLog = async (req, res) => {
  const { day, date, department, description, logid } = req.body;
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
        userid: userid,
      },
    });

    const internship = await Internshipdtl.findOne({
      where: {
        logComplete: false,
        stdid: student.stdid,
      },
    });

    const existingLogEntry = await Log.findOne({
      where: {
        internshipid: internship.internshipid,
        day: day,
        logid: {
          [Op.not]: logid,
        },
      },
    });
    if (existingLogEntry) {
      return res.status(400).json({ msg: "1" }); //Log entry with the same day already exists
    }
    const existingLogEntry1 = await Log.findOne({
      where: {
        internshipid: internship.internshipid,
        date: date,
        logid: {
          [Op.not]: logid,
        },
      },
    });

    if (existingLogEntry1) {
      return res.status(400).json({ msg: "2" }); //Log entry with the same date already exists
    }

    if (parseInt(day) > parseInt(internship.workingDays)) {
      return res.status(400).json({
        msg: "3", //Invalid Day. Day cannot be more than Internship Duration
      });
    }

    const updatedLog = await Log.update(
      {
        day: day,
        date: date,
        department: department,
        description: description,
      },
      {
        where: { logid: logid },
      }
    );

    res.status(200).json({ updatedLog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
