import jwt from 'jsonwebtoken';
import { promisify } from 'util';

export const verifyToken = async (refreshToken) => {
  try {
    const decoded = await promisify(jwt.verify)(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    return {
      userid: decoded.userid,
    };
  } catch (error) {
    console.error('Invalid refresh token:', error);
    return null;
  }
};
