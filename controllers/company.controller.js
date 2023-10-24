import { verifyToken } from "../middleware/verifyToken.js";
import Company from "../models/company.model.js";

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
