import express from 'express'
import { Router } from 'express';
import { login, signup } from '../controllers/auth.controller';
import rateLimitter from '../middleware/rateLimitter';

const router:Router = express.Router();

router.post('/signup',rateLimitter,signup);
router.post('/login',rateLimitter,login);

export default router;
