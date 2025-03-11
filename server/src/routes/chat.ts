import { Router } from 'express';
import { body } from 'express-validator';

import { akAI } from '../controllers/chat';
import { handleHttpError } from '../helpers/error';
import { checkAuth } from '../middleware/check-auth';

const router = Router();
router.use(checkAuth);

router.post(
  '/',
  [
    body('config').notEmpty(),
    body('recordingBase64').notEmpty(),
    body('userId').isLength({ min: 24, max: 24 }),
  ],
  akAI
);

router.use(handleHttpError);

export default router;
