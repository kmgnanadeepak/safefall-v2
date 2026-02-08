import FallEvent from '../models/FallEvent.js';

export const getHistory = async (req, res) => {
  try {
    const events = await FallEvent.find({ userId: req.patientId })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await FallEvent.findOne({ _id: req.params.id, userId: req.patientId });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
