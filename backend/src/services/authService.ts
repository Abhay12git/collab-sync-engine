import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

const signToken = (id: string, email: string) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET || 'secret_key', {
    expiresIn: (process.env.JWT_EXPIRES_IN || '90d') as any,
  });
};

export const registerUser = async (data: any) => {
  const { email, password, name } = data;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already exists', 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const newUser = await User.create({ email, passwordHash, name });

  const token = signToken(newUser._id.toString(), newUser.email);
  return { user: { id: newUser._id, email: newUser.email, name: newUser.name }, token };
};

export const loginUser = async (data: any) => {
  const { email, password } = data;
  if (!email || !password) {
    throw new AppError('Please provide email and password!', 400);
  }

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError('Incorrect email or password', 401);
  }

  const token = signToken(user._id.toString(), user.email);
  return { user: { id: user._id, email: user.email, name: user.name }, token };
};
