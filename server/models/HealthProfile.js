import mongoose from 'mongoose';

const healthProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    min: 0,
    max: 150,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say', ''],
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
  },
  conditions: [{
    type: String,
    trim: true,
  }],
  allergies: [{
    type: String,
    trim: true,
  }],
  notes: {
    type: String,
    trim: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

healthProfileSchema.index({ userId: 1 });

const HealthProfile = mongoose.model('HealthProfile', healthProfileSchema);
export default HealthProfile;
