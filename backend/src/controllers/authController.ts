import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.registerUser(req.body);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.loginUser(req.body);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};
