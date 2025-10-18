import mongoose from 'mongoose';

const vitalsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  familyMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
    required: true
  },
  familyMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
    required: true
  },
  recordDate: {
    type: Date,
    required: [true, 'Record date is required'],
    default: Date.now
  },
  bloodPressure: {
    systolic: {
      type: Number,
      min: [50, 'Systolic pressure too low'],
      max: [300, 'Systolic pressure too high']
    },
    diastolic: {
      type: Number,
      min: [30, 'Diastolic pressure too low'],
      max: [200, 'Diastolic pressure too high']
    },
    unit: {
      type: String,
      default: 'mmHg'
    }
  },
  bloodSugar: {
    fasting: {
      type: Number,
      min: [50, 'Blood sugar too low'],
      max: [600, 'Blood sugar too high']
    },
    postMeal: {
      type: Number,
      min: [50, 'Blood sugar too low'],
      max: [600, 'Blood sugar too high']
    },
    random: {
      type: Number,
      min: [50, 'Blood sugar too low'],
      max: [600, 'Blood sugar too high']
    },
    hba1c: {
      type: Number,
      min: [3, 'HbA1c too low'],
      max: [20, 'HbA1c too high']
    },
    unit: {
      type: String,
      default: 'mg/dL'
    }
  },
  weight: {
    value: {
      type: Number,
      min: [20, 'Weight too low'],
      max: [500, 'Weight too high']
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  height: {
    value: {
      type: Number,
      min: [50, 'Height too low'],
      max: [300, 'Height too high']
    },
    unit: {
      type: String,
      enum: ['cm', 'ft'],
      default: 'cm'
    }
  },
  temperature: {
    value: {
      type: Number,
      min: [90, 'Temperature too low'],
      max: [115, 'Temperature too high']
    },
    unit: {
      type: String,
      enum: ['celsius', 'fahrenheit'],
      default: 'fahrenheit'
    }
  },
  heartRate: {
    value: {
      type: Number,
      min: [30, 'Heart rate too low'],
      max: [250, 'Heart rate too high']
    },
    unit: {
      type: String,
      default: 'bpm'
    }
  },
  oxygenSaturation: {
    value: {
      type: Number,
      min: [70, 'Oxygen saturation too low'],
      max: [100, 'Oxygen saturation too high']
    },
    unit: {
      type: String,
      default: '%'
    }
  },
  cholesterol: {
    total: {
      type: Number,
      min: [100, 'Total cholesterol too low'],
      max: [500, 'Total cholesterol too high']
    },
    ldl: {
      type: Number,
      min: [50, 'LDL cholesterol too low'],
      max: [300, 'LDL cholesterol too high']
    },
    hdl: {
      type: Number,
      min: [20, 'HDL cholesterol too low'],
      max: [150, 'HDL cholesterol too high']
    },
    triglycerides: {
      type: Number,
      min: [50, 'Triglycerides too low'],
      max: [1000, 'Triglycerides too high']
    },
    unit: {
      type: String,
      default: 'mg/dL'
    }
  },
  bmi: {
    type: Number,
    min: [10, 'BMI too low'],
    max: [60, 'BMI too high']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'very_poor']
  },
  symptoms: [String],
  medicationTaken: [{
    name: String,
    dosage: String,
    time: Date
  }],
  location: {
    type: String,
    trim: true
  },
  recordedBy: {
    type: String,
    enum: ['self', 'doctor', 'nurse', 'family_member', 'other'],
    default: 'self'
  },
  isManualEntry: {
    type: Boolean,
    default: true
  },
  aiInsights: {
    riskAssessment: String,
    recommendations: [String],
    trendAnalysis: String,
    generatedAt: Date
  }
}, {
  timestamps: true
});

// Calculate BMI automatically if height and weight are provided
vitalsSchema.pre('save', function(next) {
  if (this.weight?.value && this.height?.value) {
    const weightInKg = this.weight.unit === 'lbs' ? this.weight.value * 0.453592 : this.weight.value;
    const heightInM = this.height.unit === 'ft' ? this.height.value * 0.3048 : this.height.value / 100;
    
    this.bmi = Math.round((weightInKg / (heightInM * heightInM)) * 100) / 100;
  }
  next();
});

// Index for better query performance
vitalsSchema.index({ userId: 1, recordDate: -1 });
vitalsSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Vitals', vitalsSchema);
