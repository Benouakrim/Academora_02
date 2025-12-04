import { Router, Request, Response, NextFunction } from 'express';
import { PublicProfileService } from '../services/PublicProfileService';

const router = Router();

/**
 * GET /profiles/:username
 * Get public profile by username (public endpoint)
 */
router.get('/:username', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required' });
    }

    const profile = await PublicProfileService.getPublicProfile(username);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /profiles/check-username
 * Check if username is available (public endpoint)
 */
router.post('/check-username', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Validate username format (alphanumeric, underscores, hyphens, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        available: false,
        error: 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens',
      });
    }

    const available = await PublicProfileService.isUsernameAvailable(username);

    return res.status(200).json({
      available,
      username,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
