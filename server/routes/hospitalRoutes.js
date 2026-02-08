import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { patientAccess } from '../middleware/rowLevelSecurity.js';
import * as hospitalController from '../controllers/hospitalController.js';
import * as healthProfileController from '../controllers/healthProfileController.js';
import * as locationController from '../controllers/locationController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('hospital'));

router.get('/emergencies', hospitalController.getActiveEmergencies);
router.post('/emergencies/:emergencyId/acknowledge', hospitalController.acknowledgeEmergency);
router.post('/emergencies/:emergencyId/resolve', hospitalController.resolveEmergency);
router.get('/patients/:patientId/details', patientAccess('patientId'), hospitalController.getPatientDetails);
router.get('/patients/:patientId/health-profile', patientAccess('patientId'), healthProfileController.getProfile);
router.get('/patients/:patientId/location', patientAccess('patientId'), locationController.getLocation);

export default router;
