import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import HealthProfile from '../models/HealthProfile.js';
import { OAuth2Client } from 'google-auth-library';
import { bootstrapPatientDevData } from '../services/seedDevData.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }
    if (!['patient', 'hospital'].includes(role)) {
      return res.status(400).json({ message: 'Role must be patient or hospital' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: password,
      role,
    });

    if (role === 'patient') {
      await HealthProfile.create({ userId: user._id });
      if (process.env.NODE_ENV !== 'production') {
        await bootstrapPatientDevData(user._id);
      }
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Login failed' });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { credential, role } = req.body;
    if (!credential || !role) {
      return res.status(400).json({ message: 'Google credential and role required' });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ $or: [{ email }, { googleId }] });
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        passwordHash: 'google-auth-no-password',
        role,
      });
      if (role === 'patient') {
        await HealthProfile.create({ userId: user._id });
        if (process.env.NODE_ENV !== 'production') {
          await bootstrapPatientDevData(user._id);
        }
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(401).json({ message: err.message || 'Google auth failed' });
  }
};
