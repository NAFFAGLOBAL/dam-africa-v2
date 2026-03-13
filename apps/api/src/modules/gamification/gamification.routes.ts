import { Router } from 'express';
import { gamificationController } from './gamification.controller';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateBody, validateQuery } from '../../middleware/validate';
import { awardBadgeSchema, leaderboardQuerySchema } from './gamification.schemas';

const router = Router();

// User routes
router.get('/badges', authenticateUser, gamificationController.getBadgeDefinitions);
router.get('/my-badges', authenticateUser, gamificationController.getMyBadges);
router.get('/my-ranking', authenticateUser, gamificationController.getMyRanking);
router.get('/leaderboard', authenticateUser, validateQuery(leaderboardQuerySchema), gamificationController.getLeaderboard);

// Admin routes
router.get('/drivers/:driverId/badges', authenticateAdmin, gamificationController.getDriverBadges);
router.get('/drivers/:driverId/ranking', authenticateAdmin, gamificationController.getDriverRanking);
router.post('/award', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN'), validateBody(awardBadgeSchema), gamificationController.awardBadge);

export default router;
