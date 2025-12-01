import { Request, Response, NextFunction } from 'express';
import { UniversityService } from '../services/UniversityService';

export const getUniversities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = req.query;
    const universities = await UniversityService.getAll(filters);
    res.status(200).json(universities);
  } catch (err) {
    next(err);
  }
};

export const getUniversityBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const university = await UniversityService.getBySlug(slug);
    res.status(200).json(university);
  } catch (err) {
    next(err);
  }
};
