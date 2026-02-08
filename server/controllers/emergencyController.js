import Emergency from '../models/Emergency.js';
import FallEvent from '../models/FallEvent.js';
import Notification from '../models/Notification.js';
import EmergencyContact from '../models/EmergencyContact.js';
import User from '../models/User.js';
import { sendEmergencyNotification } from '../services/emailService.js';

export const getActiveEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findOne({
      userId: req.patientId,
      status: { $in: ['active', 'acknowledged'] },
    }).populate('fallEventId');
    res.json(emergency || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const doCreateEmergency = async (userId, location) => {
  const fallEvent = await FallEvent.create({
    userId,
    isEmergency: true,
    resolved: false,
    location: location || undefined,
  });

  const emergency = await Emergency.create({
    userId,
    fallEventId: fallEvent._id,
    status: 'active',
    location: location || undefined,
  });

  await Notification.create({
    userId,
    type: 'emergency_triggered',
    message: 'Emergency has been triggered. Help is on the way.',
    metadata: { fallEventId: fallEvent._id, emergencyId: emergency._id },
  });

  const user = await User.findById(userId);
  const contacts = await EmergencyContact.find({ userId });
  await sendEmergencyNotification(
    user?.name,
    user?.email,
    contacts,
    { location: emergency.location }
  );

  return { emergency, fallEvent };
};

const getIO = (req) => req.app?.locals?.io;

export const createEmergency = async (req, res) => {
  try {
    const { location } = req.body;
    const userId = req.patientId;
    const { emergency, fallEvent } = await doCreateEmergency(userId, location);
    const io = getIO(req);
    if (io) {
      io.emit('emergency', { ...emergency.toObject(), fallEvent });
    }
    res.status(201).json({ emergency, fallEvent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const cancelEmergency = async (req, res) => {
  try {
    const userId = req.patientId;
    const emergency = await Emergency.findOne({
      userId,
      status: 'active',
    });
    if (!emergency) return res.status(404).json({ message: 'No active emergency' });

    await FallEvent.findByIdAndUpdate(emergency.fallEventId, {
      isEmergency: false,
      resolved: true,
      resolvedAt: new Date(),
    });
    emergency.status = 'resolved';
    emergency.resolvedAt = new Date();
    emergency.resolvedBy = userId;
    await emergency.save();

    await Notification.create({
      userId,
      type: 'emergency_resolved',
      message: 'Emergency was cancelled (false alarm).',
      metadata: { emergencyId: emergency._id },
    });

    res.json({ message: 'Emergency cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const simulateFall = async (req, res) => {
  try {
    res.json({ message: 'Fall simulation started - 30s countdown' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const cancelCountdown = async (req, res) => {
  try {
    const userId = req.patientId;
    const fallEvent = await FallEvent.create({
      userId,
      isEmergency: false,
      resolved: true,
      resolutionNotes: 'User confirmed OK during countdown',
    });
    res.status(201).json({ fallEvent, message: 'Countdown cancelled - no emergency' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
