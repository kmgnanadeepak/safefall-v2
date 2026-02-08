import Emergency from '../models/Emergency.js';
import User from '../models/User.js';
import FallEvent from '../models/FallEvent.js';
import Notification from '../models/Notification.js';

export const getActiveEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find({
      status: { $in: ['active', 'acknowledged'] },
    })
      .populate('userId', 'name email')
      .populate('fallEventId')
      .sort({ createdAt: -1 })
      .lean();

    res.json(emergencies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const acknowledgeEmergency = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });

    emergency.status = 'acknowledged';
    emergency.acknowledgedAt = new Date();
    emergency.acknowledgedBy = req.user._id;
    await emergency.save();

    await Notification.create({
      userId: emergency.userId,
      type: 'emergency_acknowledged',
      message: 'Your emergency has been acknowledged by hospital staff.',
      metadata: { emergencyId: emergency._id },
    });

    res.json(emergency);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resolveEmergency = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { notes } = req.body;
    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });

    await FallEvent.findByIdAndUpdate(emergency.fallEventId, {
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: req.user._id,
      resolutionNotes: notes,
    });

    emergency.status = 'resolved';
    emergency.resolvedAt = new Date();
    emergency.resolvedBy = req.user._id;
    await emergency.save();

    await Notification.create({
      userId: emergency.userId,
      type: 'emergency_resolved',
      message: 'Your emergency has been resolved by hospital staff.',
      metadata: { emergencyId: emergency._id },
    });

    res.json(emergency);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;
    const emergency = await Emergency.findOne({
      userId: patientId,
      status: { $in: ['active', 'acknowledged'] },
    });
    if (!emergency) return res.status(404).json({ message: 'No active emergency for this patient' });

    const patient = await User.findById(patientId).select('name email');
    const fallEvent = await FallEvent.findById(emergency.fallEventId);
    res.json({ patient, emergency, fallEvent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
