import express from 'express';
import authRoutes from './authRoutes.js';
import patientRoutes from './patientRoutes.js';
import hospitalRoutes from './hospitalRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/patient', patientRoutes);
router.use('/hospital', hospitalRoutes);
router.use('/notifications', notificationRoutes);

export default router;
