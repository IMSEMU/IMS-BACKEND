import Log from '../models/log.model.js';
import { verifyToken } from '../middleware/verifyToken.js';


export const createLogEntry = async (req, res) => {
    try {
      const { day, date, department, description } = req.body;
  
      // Check if user is logged in
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }
  
      // Verify refresh token and get user ID
      const { userid } = await verifyToken(refreshToken);
      if (!userid) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }

  
      // Create log entry
      const logEntry = await Log.create({
        userid,
        day,
        date,
        department,
        description,
      });
  
      return res.status(201).json({ msg: 'Log entry created successfully', logEntry });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Internal server error' });
    }
  };

  export const getEntries = async (req, res) => {
    try {
     
      // Check if user is logged in
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }
  
      // Verify refresh token and get user ID
      const { userid } = await verifyToken(refreshToken);
      if (!userid) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }
  
      const logbookEntries = await Log.findAll({ where: { userid: userid } });
      res.status(200).json(logbookEntries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Internal server error' });
    }
  }