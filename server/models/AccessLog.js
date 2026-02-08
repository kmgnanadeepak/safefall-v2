import mongoose from 'mongoose';

const accessLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  resource: {
    type: String,
    required: true,
  },
  resourceId: mongoose.Schema.Types.ObjectId,
  granted: {
    type: Boolean,
    required: true,
  },
  reason: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

accessLogSchema.index({ userId: 1 });
accessLogSchema.index({ timestamp: -1 });

const AccessLog = mongoose.model('AccessLog', accessLogSchema);
export default AccessLog;
