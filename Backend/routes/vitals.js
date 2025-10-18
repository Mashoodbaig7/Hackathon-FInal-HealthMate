import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken, checkResourceOwnership } from '../middleware/auth.js';
import { analyzeVitals } from '../services/geminiService.js';
import Vitals from '../models/Vitals.js';

const router = express.Router();

// Get all vitals for authenticated user
router.get('/', authenticateToken, [
  query('familyMemberId').optional().isMongoId().withMessage('Invalid family member ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('sortBy').optional().isIn(['recordDate', 'createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      sortBy = 'recordDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { userId: req.user._id };
    
    if (startDate || endDate) {
      query.recordDate = {};
      if (startDate) query.recordDate.$gte = new Date(startDate);
      if (endDate) query.recordDate.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Execute query
    const [vitals, totalCount] = await Promise.all([
      Vitals.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Vitals.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      message: 'Vitals retrieved successfully',
      data: {
        vitals,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching vitals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vitals',
      error: error.message
    });
  }
});

// Get single vital record by ID
router.get('/:id', authenticateToken, checkResourceOwnership(Vitals), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Vital record retrieved successfully',
      data: { vital: req.resource }
    });
  } catch (error) {
    console.error('Error fetching vital record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vital record',
      error: error.message
    });
  }
});

// Create new vital record
router.post('/', authenticateToken, [
  body('recordDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('bloodPressure.systolic')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Systolic pressure must be between 50 and 300'),
  body('bloodPressure.diastolic')
    .optional()
    .isFloat({ min: 30, max: 200 })
    .withMessage('Diastolic pressure must be between 30 and 200'),
  body('bloodSugar.fasting')
    .optional()
    .isFloat({ min: 50, max: 600 })
    .withMessage('Fasting blood sugar must be between 50 and 600'),
  body('bloodSugar.postMeal')
    .optional()
    .isFloat({ min: 50, max: 600 })
    .withMessage('Post meal blood sugar must be between 50 and 600'),
  body('bloodSugar.random')
    .optional()
    .isFloat({ min: 50, max: 600 })
    .withMessage('Random blood sugar must be between 50 and 600'),
  body('bloodSugar.hba1c')
    .optional()
    .isFloat({ min: 3, max: 20 })
    .withMessage('HbA1c must be between 3 and 20'),
  body('weight.value')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500'),
  body('height.value')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300'),
  body('temperature.value')
    .optional()
    .isFloat({ min: 90, max: 115 })
    .withMessage('Temperature must be between 90 and 115'),
  body('heartRate.value')
    .optional()
    .isFloat({ min: 30, max: 250 })
    .withMessage('Heart rate must be between 30 and 250'),
  body('oxygenSaturation.value')
    .optional()
    .isFloat({ min: 70, max: 100 })
    .withMessage('Oxygen saturation must be between 70 and 100'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('mood')
    .optional()
    .isIn(['excellent', 'good', 'fair', 'poor', 'very_poor'])
    .withMessage('Invalid mood value'),
  body('recordedBy')
    .optional()
    .isIn(['self', 'doctor', 'nurse', 'family_member', 'other'])
    .withMessage('Invalid recorded by value')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if at least one vital sign is provided
    const hasVitalSigns = ['bloodPressure', 'bloodSugar', 'weight', 'height', 'temperature', 'heartRate', 'oxygenSaturation', 'cholesterol'].some(field => req.body[field] && Object.keys(req.body[field]).length > 0);

    if (!hasVitalSigns) {
      return res.status(400).json({
        success: false,
        message: 'At least one vital sign measurement is required'
      });
    }

    const vitalData = {
      userId: req.user._id,
      recordDate: req.body.recordDate ? new Date(req.body.recordDate) : new Date(),
      ...req.body
    };

    const vital = new Vitals(vitalData);

    // Get recent vitals for trend analysis
    const recentVitals = await Vitals.find({ userId: req.user._id })
      .sort({ recordDate: -1 })
      .limit(10)
      .select('-aiInsights');

    // Generate AI insights
    try {
      const insights = await analyzeVitals(vitalData, recentVitals);
      vital.aiInsights = {
        ...insights,
        generatedAt: new Date()
      };
    } catch (aiError) {
      console.error('AI analysis failed for vitals:', aiError);
      // Continue saving even if AI analysis fails
      vital.aiInsights = {
        riskAssessment: "AI analysis temporarily unavailable",
        recommendations: ["Please consult with your healthcare provider"],
        trendAnalysis: "Trend analysis not available",
        generatedAt: new Date()
      };
    }

    await vital.save();

    res.status(201).json({
      success: true,
      message: 'Vital record created successfully',
      data: { vital }
    });

  } catch (error) {
    console.error('Error creating vital record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vital record',
      error: error.message
    });
  }
});

// Update vital record
router.put('/:id', authenticateToken, checkResourceOwnership(Vitals), [
  body('bloodPressure.systolic')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Systolic pressure must be between 50 and 300'),
  body('bloodPressure.diastolic')
    .optional()
    .isFloat({ min: 30, max: 200 })
    .withMessage('Diastolic pressure must be between 30 and 200'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('mood')
    .optional()
    .isIn(['excellent', 'good', 'fair', 'poor', 'very_poor'])
    .withMessage('Invalid mood value')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedUpdates = [
      'bloodPressure', 'bloodSugar', 'weight', 'height', 'temperature', 
      'heartRate', 'oxygenSaturation', 'cholesterol', 'notes', 'mood', 
      'symptoms', 'medicationTaken'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedVital = await Vitals.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Vital record updated successfully',
      data: { vital: updatedVital }
    });

  } catch (error) {
    console.error('Error updating vital record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vital record',
      error: error.message
    });
  }
});

// Delete vital record
router.delete('/:id', authenticateToken, checkResourceOwnership(Vitals), async (req, res) => {
  try {
    await Vitals.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vital record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting vital record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vital record',
      error: error.message
    });
  }
});

// Get vitals statistics and trends
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get recent vitals for analysis
    const recentVitals = await Vitals.find({
      userId,
      recordDate: { $gte: thirtyDaysAgo }
    }).sort({ recordDate: -1 });

    // Get latest vital signs
    const latestVital = await Vitals.findOne({ userId })
      .sort({ recordDate: -1 });

    // Calculate averages for the last 30 days
    const stats = {
      totalRecords: recentVitals.length,
      latestRecord: latestVital,
      averages: {},
      trends: {}
    };

    if (recentVitals.length > 0) {
      // Calculate averages
      const sums = {
        systolic: 0,
        diastolic: 0,
        weight: 0,
        heartRate: 0,
        temperature: 0,
        counts: {
          bp: 0,
          weight: 0,
          heartRate: 0,
          temperature: 0
        }
      };

      recentVitals.forEach(vital => {
        if (vital.bloodPressure?.systolic) {
          sums.systolic += vital.bloodPressure.systolic;
          sums.counts.bp++;
        }
        if (vital.bloodPressure?.diastolic) {
          sums.diastolic += vital.bloodPressure.diastolic;
        }
        if (vital.weight?.value) {
          sums.weight += vital.weight.value;
          sums.counts.weight++;
        }
        if (vital.heartRate?.value) {
          sums.heartRate += vital.heartRate.value;
          sums.counts.heartRate++;
        }
        if (vital.temperature?.value) {
          sums.temperature += vital.temperature.value;
          sums.counts.temperature++;
        }
      });

      // Calculate averages
      if (sums.counts.bp > 0) {
        stats.averages.bloodPressure = {
          systolic: Math.round(sums.systolic / sums.counts.bp),
          diastolic: Math.round(sums.diastolic / sums.counts.bp)
        };
      }
      if (sums.counts.weight > 0) {
        stats.averages.weight = Math.round((sums.weight / sums.counts.weight) * 10) / 10;
      }
      if (sums.counts.heartRate > 0) {
        stats.averages.heartRate = Math.round(sums.heartRate / sums.counts.heartRate);
      }
      if (sums.counts.temperature > 0) {
        stats.averages.temperature = Math.round((sums.temperature / sums.counts.temperature) * 10) / 10;
      }
    }

    res.json({
      success: true,
      message: 'Vitals statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Error fetching vitals statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// Get vitals chart data
router.get('/charts/:type', authenticateToken, [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
  query('parameter').optional().isIn(['systolic', 'diastolic', 'weight', 'heartRate', 'temperature', 'bloodSugar']).withMessage('Invalid parameter')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type } = req.params;
    const { days = 30, parameter } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const vitals = await Vitals.find({
      userId: req.user._id,
      recordDate: { $gte: startDate }
    }).sort({ recordDate: 1 });

    let chartData = [];

    vitals.forEach(vital => {
      const dataPoint = {
        date: vital.recordDate,
        recordId: vital._id
      };

      switch (type) {
        case 'blood-pressure':
          if (vital.bloodPressure?.systolic && vital.bloodPressure?.diastolic) {
            dataPoint.systolic = vital.bloodPressure.systolic;
            dataPoint.diastolic = vital.bloodPressure.diastolic;
            chartData.push(dataPoint);
          }
          break;
        case 'weight':
          if (vital.weight?.value) {
            dataPoint.weight = vital.weight.value;
            dataPoint.unit = vital.weight.unit;
            chartData.push(dataPoint);
          }
          break;
        case 'heart-rate':
          if (vital.heartRate?.value) {
            dataPoint.heartRate = vital.heartRate.value;
            chartData.push(dataPoint);
          }
          break;
        case 'blood-sugar':
          if (vital.bloodSugar?.fasting || vital.bloodSugar?.postMeal || vital.bloodSugar?.random) {
            if (vital.bloodSugar.fasting) dataPoint.fasting = vital.bloodSugar.fasting;
            if (vital.bloodSugar.postMeal) dataPoint.postMeal = vital.bloodSugar.postMeal;
            if (vital.bloodSugar.random) dataPoint.random = vital.bloodSugar.random;
            chartData.push(dataPoint);
          }
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid chart type'
          });
      }
    });

    res.json({
      success: true,
      message: 'Chart data retrieved successfully',
      data: {
        chartData,
        type,
        dateRange: {
          start: startDate,
          end: new Date()
        },
        totalPoints: chartData.length
      }
    });

  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart data',
      error: error.message
    });
  }
});

export default router;
