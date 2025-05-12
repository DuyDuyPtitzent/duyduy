import jwt from 'jsonwebtoken';
import { config } from '@/config/env';

export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwt.secret!, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const verifyToken = (token: string): any => { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    return jwt.verify(token, config.jwt.secret!);
  } catch (error) {
    return null;
  }
};