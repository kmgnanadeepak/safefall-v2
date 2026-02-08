import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['emergency_triggered', 'emergency_acknowledged', 'emergency_resolved', 'fall_detected', 'info'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  metadata: {
    fallEventId: mongoose.Schema.Types.ObjectId,
    emergencyId: mongoose.Schema.Types.ObjectId,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

notificationSchema.index({ userId: 1 });
notificationSchema.index({ timestamp: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
