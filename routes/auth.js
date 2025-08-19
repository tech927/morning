import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validate.js';
import { authLimiter } from '../middleware/limiter.js';
import { registerUser, loginUser, getCurrentUser } from '../services/auth.service.js';

const router = express.Router();

router.post('/register', authLimiter, validateRegister, async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      message: 'User registered successfully. Please login.',
      user
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', authLimiter, validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user._id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
