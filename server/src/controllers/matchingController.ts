import { Request, Response, NextFunction } from 'express';
import { MatchingService } from '../services/MatchingService';

export const calculateMatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = req.body; // Already validated by middleware
    const matches = await MatchingService.findMatches(profile);
    res.status(200).json(matches);
  } catch (err) {
    next(err);
  }
};
