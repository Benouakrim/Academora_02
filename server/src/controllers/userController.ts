import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined; // Clerk injects auth
    if (!clerkId) return res.status(401).json({ error: 'unauthenticated' });
    const profile = await UserService.getProfile(clerkId);
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) return res.status(401).json({ error: 'unauthenticated' });
    const updated = await UserService.updateProfile(clerkId, req.body);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const toggleSaved = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) return res.status(401).json({ error: 'unauthenticated' });
    const universityId = req.params.id;
    const result = await UserService.toggleSavedUniversity(clerkId, universityId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
