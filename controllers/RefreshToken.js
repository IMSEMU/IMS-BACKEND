import Users from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    const user = await Users.findOne({
      where: {
        refresh_token: refreshToken,
      },
    });
    if (user) {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err) return res.sendStatus(403);
          const userId = user.userid;
          const firstname = user.firstname;
          const lastname = user.lastname;
          const email = user.email;
          const userrole = user.roleId;
          const accessToken = jwt.sign(
            { userId, firstname, lastname, email },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: '15s',
            }
          );
          const userInformation = {
            accessToken,
              userId,
              firstname,
              lastname,
              email,
              userrole,
          
          };
  
          // Send both accessToken and user information as JSON response
          res.json(userInformation);
        }
      );
    }
  } catch (error) {
    console.log(error);
  }
};
