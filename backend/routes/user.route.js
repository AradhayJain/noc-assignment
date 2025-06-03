import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';
import { protect } from '../utils/authMiddleware.js';
import { fetchAllDataFromFolder } from '../controllers/SignalController.js';

const router= express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/data',fetchAllDataFromFolder);


export default router;
