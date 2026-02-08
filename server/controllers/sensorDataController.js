import SensorData from '../models/SensorData.js';

export const addSensorData = async (req, res) => {
  try {
    const { accelerometer, gyroscope } = req.body;
    const data = await SensorData.create({
      userId: req.patientId,
      accelerometer: accelerometer || { x: 0, y: 0, z: 0 },
      gyroscope: gyroscope || { x: 0, y: 0, z: 0 },
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSensorData = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const data = await SensorData.find({ userId: req.patientId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    res.json(data.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
