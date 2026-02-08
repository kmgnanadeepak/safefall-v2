import mongoose from 'mongoose';

const sensorDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accelerometer: {
    x: { type: Number },
    y: { type: Number },
    z: { type: Number },
  },
  gyroscope: {
    x: { type: Number },
    y: { type: Number },
    z: { type: Number },
  },
  heartRate: { type: Number },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

sensorDataSchema.index({ userId: 1, timestamp: -1 });
sensorDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 * 7 }); // TTL 7 days

const SensorData = mongoose.model('SensorData', sensorDataSchema);
export default SensorData;
