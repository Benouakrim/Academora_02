import { Request, Response, NextFunction } from 'express'
import { AdminService } from '../services/AdminService'

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await AdminService.getDashboardStats()
    res.status(200).json(stats)
  } catch (err) {
    next(err)
  }
}
