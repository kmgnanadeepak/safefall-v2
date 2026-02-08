/**
 * Development-only seed script.
 * Seeds realistic demo data for all patient users when collections are empty.
 * Runs only when NODE_ENV=development.
 */

import User from '../models/User.js';
import EmergencyContact from '../models/EmergencyContact.js';
import HealthProfile from '../models/HealthProfile.js';
import FallEvent from '../models/FallEvent.js';
import SensorData from '../models/SensorData.js';
import Notification from '../models/Notification.js';
import Emergency from '../models/Emergency.js';

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

const DEMO_PATIENT = { email: 'demo@safefall.ai', password: 'demo123', name: 'Demo Patient', role: 'patient' };
const DEMO_HOSPITAL = { email: 'hospital@safefall.ai', password: 'hospital123', name: 'City Hospital', role: 'hospital' };

const CONTACTS = [
  { name: 'John Smith', relation: 'Son', phone: '+1-555-0101' },
  { name: 'Mary Johnson', relation: 'Daughter', phone: '+1-555-0102' },
  { name: 'Emergency Services', relation: 'Primary Care', phone: '911' },
];

const HEALTH = {
  age: 72,
  gender: 'male',
  bloodGroup: 'O+',
  conditions: ['Hypertension', 'Mild arthritis', 'Type 2 Diabetes'],
  allergies: ['Penicillin', 'Shellfish'],
  notes: 'Takes blood pressure medication daily. Uses walking cane occasionally.',
};

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

async function seedContacts(userId) {
  const count = await EmergencyContact.countDocuments({ userId });
  if (count > 0) return;
  for (const c of CONTACTS) {
    await EmergencyContact.create({ userId, ...c });
  }
  console.log('[Dev Seed] Emergency contacts created for user:', userId);
}

async function seedHealthProfile(userId) {
  const exists = await HealthProfile.exists({ userId });
  if (exists) return;
  await HealthProfile.create({ userId, ...HEALTH });
  console.log('[Dev Seed] Health profile created for user:', userId);
}

async function seedFallHistory(userId, count = 8) {
  const existing = await FallEvent.countDocuments({ userId });
  if (existing >= count) return;
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const daysAgo = randInt(1, 21);
    const ts = new Date(now);
    ts.setDate(ts.getDate() - daysAgo);
    ts.setMinutes(ts.getMinutes() + randInt(0, 59));
    await FallEvent.create({
      userId,
      timestamp: ts,
      isEmergency: Math.random() > 0.6,
      resolved: true,
      resolvedAt: new Date(ts.getTime() + randInt(5, 30) * 60 * 1000),
      location: { lat: 28.6139 + rand(-0.05, 0.05), lng: 77.209 + rand(-0.05, 0.05) },
    });
  }
  console.log('[Dev Seed] Fall history created for user:', userId);
}

async function seedSensorData(userId, points = 40) {
  const count = await SensorData.countDocuments({ userId });
  if (count >= points) return;
  const base = 9.8;
  const now = Date.now();
  const records = [];
  for (let i = 0; i < points; i++) {
    const t = new Date(now - (points - i) * 2000);
    records.push({
      userId,
      accelerometer: {
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 3,
        z: base + (Math.random() - 0.5) * 2,
      },
      gyroscope: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2,
      },
      heartRate: randInt(65, 85),
      timestamp: t,
    });
  }
  await SensorData.insertMany(records);
  console.log('[Dev Seed] Sensor data created for user:', userId);
}

async function seedNotifications(userId, count = 6) {
  const existing = await Notification.countDocuments({ userId });
  if (existing >= count) return;
  const types = [
    { type: 'fall_detected', message: 'Potential fall detected. Please confirm your status.' },
    { type: 'emergency_acknowledged', message: 'Your emergency has been acknowledged by hospital staff.' },
    { type: 'emergency_resolved', message: 'Your emergency was resolved successfully.' },
    { type: 'info', message: 'Your health profile was updated.' },
    { type: 'emergency_triggered', message: 'Emergency alert sent. Help is on the way.' },
    { type: 'info', message: 'Daily wellness check completed.' },
  ];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const t = types[i % types.length];
    const ts = new Date(now);
    ts.setHours(ts.getHours() - i * 4);
    await Notification.create({
      userId,
      type: t.type,
      message: t.message,
      read: Math.random() > 0.5,
      timestamp: ts,
    });
  }
  console.log('[Dev Seed] Notifications created for user:', userId);
}

async function seedOneActiveEmergency(userId, appLocals) {
  const active = await Emergency.findOne({ userId, status: { $in: ['active', 'acknowledged'] } });
  if (active) return;
  const fallEvent = await FallEvent.create({
    userId,
    timestamp: new Date(),
    isEmergency: true,
    resolved: false,
    location: { lat: 28.6139 + rand(-0.02, 0.02), lng: 77.209 + rand(-0.02, 0.02) },
  });
  const emergency = await Emergency.create({
    userId,
    fallEventId: fallEvent._id,
    status: Math.random() > 0.5 ? 'active' : 'acknowledged',
    location: fallEvent.location,
  });
  if (appLocals?.userLocations) {
    appLocals.userLocations[userId.toString()] = {
      lat: fallEvent.location.lat,
      lng: fallEvent.location.lng,
      updatedAt: new Date(),
    };
  }
  await Notification.create({
    userId,
    type: 'emergency_triggered',
    message: 'Emergency has been triggered. Help is on the way.',
    metadata: { emergencyId: emergency._id, fallEventId: fallEvent._id },
  });
  console.log('[Dev Seed] Active emergency created for user:', userId);
}

async function ensureDemoUsers() {
  const userCount = await User.countDocuments();
  if (userCount > 0) return null;

  const demoPatient = await User.create({
    name: DEMO_PATIENT.name,
    email: DEMO_PATIENT.email,
    passwordHash: DEMO_PATIENT.password,
    role: 'patient',
  });
  await HealthProfile.create({ userId: demoPatient._id });

  await User.create({
    name: DEMO_HOSPITAL.name,
    email: DEMO_HOSPITAL.email,
    passwordHash: DEMO_HOSPITAL.password,
    role: 'hospital',
  });

  console.log('[Dev Seed] Demo users created. Login: demo@safefall.ai / demo123');
  return demoPatient._id;
}

/**
 * Bootstrap dev data for a single newly registered patient.
 * Called from auth controller on patient registration in dev mode.
 */
export async function bootstrapPatientDevData(userId) {
  if (!isDev) return;
  try {
    await seedContacts(userId);
    await seedHealthProfile(userId);
    await seedFallHistory(userId, 5);
    await seedSensorData(userId, 25);
    await seedNotifications(userId, 4);
    console.log('[Dev Seed] Bootstrap data created for new patient:', userId);
  } catch (err) {
    console.error('[Dev Seed] Bootstrap error:', err.message);
  }
}

export async function runSeed(app) {
  if (!isDev) return;
  try {
    await ensureDemoUsers();
    const patients = await User.find({ role: 'patient' }).select('_id').lean();
    if (patients.length === 0) {
      console.log('[Dev Seed] No patient users found. Create an account to seed data.');
      return;
    }

    let emergencySeeded = 0;
    for (const p of patients) {
      const uid = p._id;
      await seedContacts(uid);
      await seedHealthProfile(uid);
      await seedFallHistory(uid);
      await seedSensorData(uid);
      await seedNotifications(uid);
      if (emergencySeeded < 2) {
        await seedOneActiveEmergency(uid, app?.locals);
        emergencySeeded++;
      }
    }

    console.log('[Dev Seed] Demo seed completed successfully.');
  } catch (err) {
    console.error('[Dev Seed] Error:', err.message);
  }
}
