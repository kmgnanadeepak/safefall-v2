import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fallEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FallEvent',
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active',
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  acknowledgedAt: {
    type: Date,
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolvedAt: {
    type: Date,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

emergencySchema.index({ userId: 1 });
emergencySchema.index({ status: 1 });
emergencySchema.index({ createdAt: -1 });

const Emergency = mongoose.model('Emergency', emergencySchema);
export default Emergency;
