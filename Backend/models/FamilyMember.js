import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  relationship: {
    type: String,
    required: [true, 'Relationship is required'],
    enum: ['self', 'mother', 'father', 'wife', 'husband', 'son', 'daughter', 'brother', 'sister', 'grandfather', 'grandmother', 'other'],
    default: 'self'
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  phoneNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Allow empty/null values or undefined
        if (!v || v.trim() === '') return true;
        // More flexible phone number validation
        // Allows various formats like: +92123456789, 03001234567, +1-555-123-4567, etc.
        return /^[\+]?[\d\s\-\(\)]{7,20}$/.test(v.trim());
      },
      message: 'Please enter a valid phone number (7-20 characters, only numbers, spaces, +, -, () allowed)'
    }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  medicalConditions: [{
    condition: String,
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['active', 'resolved', 'chronic'],
      default: 'active'
    }
  }],
  allergies: [String],
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date
  }],
  profilePicture: {
    type: String // Cloudinary URL
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  totalReports: {
    type: Number,
    default: 0
  },
  totalVitals: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update last activity when accessed
familyMemberSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Pre-save middleware to clean up phone number
familyMemberSchema.pre('save', function(next) {
  // Clean up phone number - remove if empty
  if (this.phoneNumber !== undefined && (!this.phoneNumber || this.phoneNumber.trim() === '')) {
    this.phoneNumber = undefined;
  }
  next();
});

// Index for better query performance
familyMemberSchema.index({ userId: 1, createdAt: -1 });
familyMemberSchema.index({ userId: 1, relationship: 1 });

export default mongoose.model('FamilyMember', familyMemberSchema);
