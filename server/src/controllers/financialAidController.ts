import { Request, Response, NextFunction } from 'express';
import { FinancialAidService } from '../services/FinancialAidService';

export const predict = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body; // Validated by middleware
    const result = await FinancialAidService.predict(data);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
