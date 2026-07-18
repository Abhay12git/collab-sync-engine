import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as documentService from '../services/documentService';

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await documentService.createDocument(req.user!.id, req.body.title);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

export const list = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await documentService.listDocuments(req.user!.id);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

export const get = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await documentService.getDocument(req.user!.id, req.params.id);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

export const share = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, role } = req.body;
    const data = await documentService.shareDocument(req.user!.id, req.params.id, email, role);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};
