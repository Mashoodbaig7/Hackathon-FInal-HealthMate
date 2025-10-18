import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Report from '../models/Report.js';
import Vitals from '../models/Vitals.js';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user: req.user }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Emergency contact name must be between 1 and 50 characters'),
  body('emergencyContact.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid emergency contact phone'),
  body('emergencyContact.relation')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Emergency contact relation must be between 1 and 50 characters'),
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  body('allergies.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each allergy must be between 1 and 100 characters')
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
      'name', 'phoneNumber', 'dateOfBirth', 'gender', 'bloodGroup',
      'emergencyContact', 'allergies'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Convert dateOfBirth to Date object if provided
    if (updates.dateOfBirth) {
      updates.dateOfBirth = new Date(updates.dateOfBirth);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Add medical condition
router.post('/medical-conditions', authenticateToken, [
  body('condition')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Condition must be between 1 and 100 characters'),
  body('diagnosedDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('status')
    .optional()
    .isIn(['active', 'resolved', 'chronic'])
    .withMessage('Status must be active, resolved, or chronic')
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

    const { condition, diagnosedDate, status = 'active' } = req.body;

    const user = await User.findById(req.user._id);
    
    const medicalCondition = {
      condition,
      diagnosedDate: diagnosedDate ? new Date(diagnosedDate) : new Date(),
      status
    };

    user.medicalConditions.push(medicalCondition);
    await user.save();

    res.json({
      success: true,
      message: 'Medical condition added successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Error adding medical condition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add medical condition',
      error: error.message
    });
  }
});

// Update medical condition
router.put('/medical-conditions/:conditionId', authenticateToken, [
  body('condition')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Condition must be between 1 and 100 characters'),
  body('status')
    .optional()
    .isIn(['active', 'resolved', 'chronic'])
    .withMessage('Status must be active, resolved, or chronic')
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

    const { conditionId } = req.params;
    const updates = req.body;

    const user = await User.findById(req.user._id);
    const condition = user.medicalConditions.id(conditionId);

    if (!condition) {
      return res.status(404).json({
        success: false,
        message: 'Medical condition not found'
      });
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        condition[key] = updates[key];
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Medical condition updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Error updating medical condition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medical condition',
      error: error.message
    });
  }
});

// Delete medical condition
router.delete('/medical-conditions/:conditionId', authenticateToken, async (req, res) => {
  try {
    const { conditionId } = req.params;

    const user = await User.findById(req.user._id);
    const condition = user.medicalConditions.id(conditionId);

    if (!condition) {
      return res.status(404).json({
        success: false,
        message: 'Medical condition not found'
      });
    }

    user.medicalConditions.pull(conditionId);
    await user.save();

    res.json({
      success: true,
      message: 'Medical condition deleted successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Error deleting medical condition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete medical condition',
      error: error.message
    });
  }
});

// Add current medication
router.post('/medications', authenticateToken, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Medication name must be between 1 and 100 characters'),
  body('dosage')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Dosage must be between 1 and 50 characters'),
  body('frequency')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Frequency must be between 1 and 50 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
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

    const { name, dosage, frequency, startDate, endDate } = req.body;

    const user = await User.findById(req.user._id);
    
    const medication = {
      name,
      dosage,
      frequency,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined
    };

    user.currentMedications.push(medication);
    await user.save();

    res.json({
      success: true,
      message: 'Medication added successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Error adding medication:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add medication',
      error: error.message
    });
  }
});

// Get user dashboard summary
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get counts and recent data
    const [
      totalReports,
      recentReports,
      totalVitals,
      recentVitals,
      latestReport,
      latestVital
    ] = await Promise.all([
      Report.countDocuments({ userId }),
      Report.countDocuments({ userId, createdAt: { $gte: thirtyDaysAgo } }),
      Vitals.countDocuments({ userId }),
      Vitals.countDocuments({ userId, recordDate: { $gte: thirtyDaysAgo } }),
      Report.findOne({ userId }).sort({ reportDate: -1 }).select('title reportType reportDate'),
      Vitals.findOne({ userId }).sort({ recordDate: -1 }).select('recordDate bloodPressure weight heartRate')
    ]);

    // Get report type distribution
    const reportTypes = await Report.aggregate([
      { $match: { userId } },
      { $group: { _id: '$reportType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const dashboard = {
      user: req.user,
      summary: {
        totalReports,
        recentReports,
        totalVitals,
        recentVitals
      },
      recent: {
        latestReport,
        latestVital
      },
      analytics: {
        reportTypes: reportTypes.map(rt => ({
          type: rt._id,
          count: rt.count
        }))
      }
    };

    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboard
    });

  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
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

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// Deactivate account
router.put('/deactivate', authenticateToken, [
  body('password')
    .notEmpty()
    .withMessage('Password is required to deactivate account')
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

    const { password } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Deactivate account
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Error deactivating account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate account',
      error: error.message
    });
  }
});

export default router;
