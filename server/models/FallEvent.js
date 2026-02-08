import mongoose from 'mongoose';

const fallEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isEmergency: {
    type: Boolean,
    required: true,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  resolvedAt: {
    type: Date,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  resolutionNotes: {
    type: String,
    trim: true,
  },
});

fallEventSchema.index({ userId: 1 });
fallEventSchema.index({ timestamp: -1 });
fallEventSchema.index({ isEmergency: 1, resolved: 1 });

const FallEvent = mongoose.model('FallEvent', fallEventSchema);
export default FallEvent;
