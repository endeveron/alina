import { Router } from 'express';
import { body } from 'express-validator';

import { speechToText, textToSpeech } from '../controllers/chat';
import { handleHttpError } from '../helpers/error';
import { checkAuth } from '../middleware/check-auth';

const router = Router();
router.use(checkAuth);

router.post(
  '/speech-to-text',
  [
    body('config').notEmpty(),
    body('recordingBase64').notEmpty(),
    body('userId').isLength({ min: 24, max: 24 }),
  ],
  speechToText
);

router.post(
  '/text-to-speech',
  [body('text').isString().notEmpty()],
  textToSpeech
);

router.use(handleHttpError);

export default router;
