/**
 * Development-only simulator service.
 * Continuously generates sensor data, fall events, notifications, and emergencies.
 * Runs only when NODE_ENV=development.
 */

import User from '../models/User.js';
import SensorData from '../models/SensorData.js';
import FallEvent from '../models/FallEvent.js';
import Notification from '../models/Notification.js';
import Emergency from '../models/Emergency.js';

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

let intervalIds = [];
let isRunning = false;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

async function getPatientIds() {
  const users = await User.find({ role: 'patient' }).select('_id').lean();
  return users.map((u) => u._id);
}

async function generateSensorReadings(appLocals) {
  const ids = await getPatientIds();
  if (ids.length === 0) return;
  const base = 9.8;
  for (const userId of ids) {
    try {
      const acc = {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
        z: base + (Math.random() - 0.5) * 2,
      };
      const gyro = {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2,
      };
      await SensorData.create({
        userId,
        accelerometer: acc,
        gyroscope: gyro,
        heartRate: randInt(60, 95),
      });
    } catch (err) {
      console.error('[Dev Simulator] Sensor insert error:', err.message);
    }
  }
}

async function maybeGenerateNotification() {
  const ids = await getPatientIds();
  if (ids.length === 0) return;
  const userId = ids[randInt(0, ids.length - 1)];
  const types = [
    { type: 'info', message: 'Daily wellness reminder: Stay hydrated and take your medication.' },
    { type: 'fall_detected', message: 'Activity alert: Unusual movement detected. All clear if you are OK.' },
    { type: 'info', message: 'Your emergency contacts have been notified of your status.' },
  ];
  const t = types[randInt(0, types.length - 1)];
  try {
    await Notification.create({
      userId,
      type: t.type,
      message: t.message,
      read: false,
      timestamp: new Date(),
    });
    console.log('[Dev Simulator] Notification inserted for user:', userId);
  } catch (err) {
    console.error('[Dev Simulator] Notification insert error:', err.message);
  }
}

async function maybeGenerateFallEvent() {
  const ids = await getPatientIds();
  if (ids.length === 0) return;
  if (Math.random() > 0.25) return;
  const userId = ids[randInt(0, ids.length - 1)];
  try {
    const fe = await FallEvent.create({
      userId,
      timestamp: new Date(),
      isEmergency: Math.random() > 0.6,
      resolved: true,
      resolvedAt: new Date(Date.now() + randInt(2, 10) * 60 * 1000),
      location: { lat: 28.6139 + rand(-0.03, 0.03), lng: 77.209 + rand(-0.03, 0.03) },
      resolutionNotes: 'Simulated fall event - development mode',
    });
    await Notification.create({
      userId,
      type: 'fall_detected',
      message: `Fall event recorded at ${new Date().toLocaleTimeString()}. Marked as ${fe.isEmergency ? 'emergency' : 'false alarm'}.`,
      metadata: { fallEventId: fe._id },
    });
    console.log('[Dev Simulator] Fall event inserted for user:', userId);
  } catch (err) {
    console.error('[Dev Simulator] Fall event insert error:', err.message);
  }
}

async function maybeGenerateEmergency(appLocals) {
  const ids = await getPatientIds();
  if (ids.length === 0) return;
  if (Math.random() > 0.15) return;
  const userId = ids[randInt(0, ids.length - 1)];
  const hasActive = await Emergency.exists({ userId, status: { $in: ['active', 'acknowledged'] } });
  if (hasActive) return;
  try {
    const location = { lat: 28.6139 + rand(-0.02, 0.02), lng: 77.209 + rand(-0.02, 0.02) };
    const fallEvent = await FallEvent.create({
      userId,
      timestamp: new Date(),
      isEmergency: true,
      resolved: false,
      location,
    });
    const emergency = await Emergency.create({
      userId,
      fallEventId: fallEvent._id,
      status: 'active',
      location,
    });
    await Notification.create({
      userId,
      type: 'emergency_triggered',
      message: 'Emergency has been triggered. Help is on the way.',
      metadata: { emergencyId: emergency._id, fallEventId: fallEvent._id },
    });
    if (appLocals?.userLocations) {
      appLocals.userLocations[userId.toString()] = { lat: location.lat, lng: location.lng, updatedAt: new Date() };
    }
    if (appLocals?.io) {
      appLocals.io.emit('emergency', { ...emergency.toObject(), fallEvent });
    }
    console.log('[Dev Simulator] Emergency inserted for user:', userId);
  } catch (err) {
    console.error('[Dev Simulator] Emergency insert error:', err.message);
  }
}

export function startDevSimulator(app) {
  if (!isDev || isRunning) return;
  isRunning = true;
  console.log('[Dev Simulator] Starting development simulator...');

  const sid1 = setInterval(() => {
    generateSensorReadings(app?.locals).catch(() => {});
  }, 3000);
  intervalIds.push(sid1);

  const sid2 = setInterval(() => {
    maybeGenerateNotification().catch(() => {});
  }, 25000);
  intervalIds.push(sid2);

  const sid3 = setInterval(() => {
    maybeGenerateFallEvent().catch(() => {});
  }, 90000);
  intervalIds.push(sid3);

  const sid4 = setInterval(() => {
    maybeGenerateEmergency(app?.locals).catch(() => {});
  }, 120000);
  intervalIds.push(sid4);

  generateSensorReadings(app?.locals).catch(() => {});
  console.log('[Dev Simulator] Simulator started. Sensor data every 3s, notifications ~25s, fall events ~90s, emergencies ~2min.');
}

export function stopDevSimulator() {
  intervalIds.forEach((id) => clearInterval(id));
  intervalIds = [];
  isRunning = false;
  if (isDev) console.log('[Dev Simulator] Stopped.');
}
