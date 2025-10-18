import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  familyMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
    required: false // Made optional to support self reports
  },
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  reportType: {
    type: String,
    required: true,
    enum: [
      'blood_test',
      'urine_test',
      'xray',
      'mri',
      'ct_scan',
      'ultrasound',
      'ecg',
      'prescription',
      'consultation',
      'vaccination',
      'other'
    ]
  },
  reportDate: {
    type: Date,
    required: [true, 'Report date is required'],
    default: Date.now
  },
  hospitalName: {
    type: String,
    trim: true
  },
  doctorName: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'image', 'document']
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  aiAnalysis: {
    summary: {
      english: String,
      urdu: String
    },
    keyFindings: [{
      parameter: String,
      value: String,
      normalRange: String,
      status: {
        type: String,
        enum: ['normal', 'high', 'low', 'critical', 'unknown'],
        default: 'unknown'
      },
      significance: String
    }],
    recommendations: {
      english: [String],
      urdu: [String]
    },
    questionsForDoctor: {
      english: [String],
      urdu: [String]
    },
    dietarySuggestions: {
      foodsToAvoid: [String],
      recommendedFoods: [String]
    },
    homeRemedies: {
      english: [String],
      urdu: [String]
    },
    analysisDate: {
      type: Date,
      default: Date.now
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  tags: [String],
  isPrivate: {
    type: Boolean,
    default: true
  },
  shareableLink: {
    token: String,
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  notes: [{
    content: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
reportSchema.index({ userId: 1, reportDate: -1 });
reportSchema.index({ userId: 1, reportType: 1 });
reportSchema.index({ createdAt: -1 });

export default mongoose.model('Report', reportSchema);
