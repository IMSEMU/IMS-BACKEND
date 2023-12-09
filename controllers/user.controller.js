import jwt from "jsonwebtoken";
import Users from "../models/user.model.js";
import { generateOtp } from "../utils/otp.js";
import { Email } from "../utils/mail.js";
import { Sequelize, where } from "sequelize";
import bcrypt from "bcrypt";
import Notifications from "../models/notification.model.js";
import { verifyToken } from "../middleware/verifyToken.js";
import Announcements from "../models/announcement.model.js";
import CompletedInternships from "../models/completedinternships.model.js";
import Company from "../models/company.model.js";
import IntPositions from "../models/intpositions.model.js";

export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      // attributes: ['id', 'name', 'email'],
    });
    res.json(users);
  } catch (error) {
    console.log(error);
  }
};

const generateTokens = (userid, firstname, lastname, email, userrole) => {
  const accessToken = jwt.sign(
    { userid, firstname, lastname, email, userrole },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "600s",
    }
  );

  const refreshToken = jwt.sign(
    { userid, firstname, lastname, email, userrole },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return { accessToken, refreshToken };
};

const processUser = async (user) => {
  const userid = user.userid;
  const firstname = user.firstname;
  const lastname = user.lastname;
  const email = user.email;
  const userrole = user.roleId;

  const { accessToken, refreshToken } = generateTokens(
    userid,
    firstname,
    lastname,
    email,
    userrole
  );

  await Users.update(
    { refresh_token: refreshToken },
    {
      where: {
        userid: userid,
      },
    }
  );

  return {
    refreshToken,
    accessToken,
    user: {
      userid,
      firstname,
      lastname,
      email,
      userrole,
    },
  };
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ msg: "Wrong Password" });
    }

    const processedUser = await processUser(user);
    res.cookie("refreshToken", processedUser.refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ status: "success", ...processedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Login Exception Raised" });
  }
};

export const Logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    const user = await Users.findAll({
      where: {
        refresh_token: refreshToken,
      },
    });
    if (!user[0]) return res.sendStatus(204);
    const userid = user[0].userid;
    const userfName = user[0].firstname;
    const userlName = user[0].lastname;
    await Users.update(
      { refresh_token: null },
      {
        where: {
          userid: userid,
        },
      }
    );
    res.clearCookie("refreshToken");
    return res.status(200).json({ msg: "Logged out" });
  } catch (error) {
    return res.status(404).json({ msg: "404 Logout Exception Raised " });
  }
};

export const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const token = generateOtp();

    const updated = await Users.findOne({
      where: {
        email,
      },
    });
    if (!updated) {
      res.status(404).json({ message: "There is no user with that address" });
    } else {
      await Users.update(
        { refresh_token: token },
        {
          where: {
            email: updated.email,
          },
        }
      );

      const url = `http://localhost:3000/new-password?token=${token}`;

      await new Email(email, url, token).sendPasswordReset();
      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "There was an error sending the email" });
  }
};

export const newPassword = async (req, res) => {
  const token = req.params.token;
  const saltRounds = 10;

  const user = await Users.findOne({
    where: {
      refresh_token: token,
    },
  });
  if (!user) {
    res.status(400).json({ msg: "Token is invalid or has expired" });
  } else {
    const { password, confPassword } = req.body;
    if (password == "") {
      return res.status(400).json({ msg: "Password cannot be blank" });
    } else if (password !== confPassword) {
      return res
        .status(400)
        .json({ msg: "Password and Confirm Password do not match" });
    } else {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashPassword = await bcrypt.hash(password, salt);
      await Users.update(
        { password: hashPassword, refresh_token: null },
        {
          where: {
            email: user.email,
          },
        }
      );
      res.status(200).json({ msg: "Password Changed" });
    }
  }
};

export const getNotifications = async (req, res) => {
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

    const notifications = await Notifications.findAll({
      where: {
        userid: userid,
      },
      order: [["notifdate", "DESC"]],
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcements.findAll();
    res.status(200).json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getCompletedInternships = async (req, res) => {
  try {
    const completedinternships = await CompletedInternships.findAll();

    const companies = [];
    for (const internship of completedinternships) {
      console.log(internship);
      const company = await Company.findOne({
        where: { companyid: internship.compid },
      });

      companies.push({
        year: internship.year,
        company: company,
      });
    }
    res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getAvailableInternships = async (req, res) => {
  try {
    const internships = await IntPositions.findAll();

    res.status(200).json(internships);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
