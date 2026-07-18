import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as any;
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    return next(new AppError('Invalid token or token has expired.', 401));
  }
};
