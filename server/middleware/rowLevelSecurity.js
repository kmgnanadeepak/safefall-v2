import Emergency from '../models/Emergency.js';
import User from '../models/User.js';
import FallEvent from '../models/FallEvent.js';
import { logAccess } from '../utils/logger.js';
import AccessLog from '../models/AccessLog.js';

const checkPatientAccess = async (req, patientId) => {
  if (req.user.role === 'patient') {
    return req.user._id.toString() === patientId.toString();
  }

  if (req.user.role === 'hospital') {
    const hospital = await User.findById(req.user._id);
    const isAssigned = hospital.assignedPatients?.some(
      (p) => p.toString() === patientId.toString()
    );
    if (isAssigned) {
      await logAccess(AccessLog, req.user._id, 'access_patient', 'patient', patientId, true, 'Patient assigned to hospital');
      return true;
    }

    const activeEmergency = await Emergency.findOne({
      userId: patientId,
      status: { $in: ['active', 'acknowledged'] },
    });
    if (activeEmergency) {
      await logAccess(AccessLog, req.user._id, 'access_patient', 'patient', patientId, true, 'Active emergency - temporary access');
      return true;
    }

    await logAccess(AccessLog, req.user._id, 'access_patient', 'patient', patientId, false, 'No assignment or active emergency');
    return false;
  }

  return false;
};

export const patientAccess = (paramName = 'patientId') => {
  return async (req, res, next) => {
    const patientId = req.params[paramName] || req.params.id || req.body.userId;
    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID required' });
    }

    const hasAccess = await checkPatientAccess(req, patientId);
    if (!hasAccess) {
      await logAccess(AccessLog, req.user._id, 'access_denied', 'patient', patientId, false, 'Row-level security denied');
      return res.status(403).json({ message: 'Access denied - you do not have permission to access this patient data' });
    }
    req.patientId = patientId;
    next();
  };
};

export const ownDataOnly = (paramName = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[paramName] || req.params.id;
    if (req.user.role !== 'patient' || req.user._id.toString() !== resourceUserId?.toString()) {
      return res.status(403).json({ message: 'Access denied - you can only access your own data' });
    }
    next();
  };
};
