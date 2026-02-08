import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as emergencyController from '../controllers/emergencyController.js';
import * as emergencyContactController from '../controllers/emergencyContactController.js';
import * as healthProfileController from '../controllers/healthProfileController.js';
import * as fallEventController from '../controllers/fallEventController.js';
import * as sensorDataController from '../controllers/sensorDataController.js';
import * as locationController from '../controllers/locationController.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('patient'));

router.use((req, res, next) => {
  req.patientId = req.user._id;
  next();
});

router.get('/emergency/active', emergencyController.getActiveEmergency);
router.post('/emergency/simulate', emergencyController.simulateFall);
router.post('/emergency/create', emergencyController.createEmergency);
router.post('/emergency/cancel', emergencyController.cancelEmergency);
router.post('/emergency/countdown-ok', emergencyController.cancelCountdown);

router.get('/contacts', emergencyContactController.getContacts);
router.post('/contacts', emergencyContactController.createContact);
router.put('/contacts/:id', emergencyContactController.updateContact);
router.delete('/contacts/:id', emergencyContactController.deleteContact);

router.get('/health-profile', healthProfileController.getProfile);
router.put('/health-profile', healthProfileController.updateProfile);

router.get('/fall-history', fallEventController.getHistory);
router.get('/fall-history/:id', fallEventController.getEventById);

router.get('/sensor-data', sensorDataController.getSensorData);
router.post('/sensor-data', sensorDataController.addSensorData);

router.post('/location', locationController.updateLocation);

router.post('/analytics/chat', analyticsController.chat);

export default router;
