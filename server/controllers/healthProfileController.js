import HealthProfile from '../models/HealthProfile.js';

export const getProfile = async (req, res) => {
  try {
    const profile = await HealthProfile.findOne({ userId: req.patientId });
    if (!profile) {
      return res.json({
        age: '',
        gender: '',
        bloodGroup: '',
        conditions: [],
        allergies: [],
        notes: '',
      });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { age, gender, bloodGroup, conditions, allergies, notes } = req.body;
    const profile = await HealthProfile.findOneAndUpdate(
      { userId: req.patientId },
      { age, gender, bloodGroup, conditions, allergies, notes, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
