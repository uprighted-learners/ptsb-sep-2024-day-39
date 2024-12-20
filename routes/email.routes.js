import express from 'express';
import { createMessage } from '../controllers/email.controllers.js';

const router = express.Router();

router.post('/send', createMessage);

export default router;
