import { Router } from 'express';
// import { body } from 'express-validator';

import { handleHttpError } from '../helpers/error';
import { checkAuth } from '../middleware/check-auth';

const router = Router();
router.use(checkAuth);

// router.get('/favorites', getFavorites);
// router.post(
//   '/evaluate-fact',
//   body('factId').isLength({ min: 24, max: 24 }),
//   body('userId').isLength({ min: 24, max: 24 }),
//   evaluateFact
// );

router.use(handleHttpError);

export default router;
