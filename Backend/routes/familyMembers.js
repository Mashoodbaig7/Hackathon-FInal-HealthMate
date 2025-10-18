import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import FamilyMember from '../models/FamilyMember.js';
import Report from '../models/Report.js';
import Vitals from '../models/Vitals.js';

const router = express.Router();

// Get all family members for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const familyMembers = await FamilyMember.find({ 
      userId: req.user._id,
      isActive: true 
    }).sort({ createdAt: -1 });

    // Calculate stats for each family member
    const membersWithStats = await Promise.all(
      familyMembers.map(async (member) => {
        const [totalReports, totalVitals] = await Promise.all([
          Report.countDocuments({ userId: req.user._id, familyMemberId: member._id }),
          Vitals.countDocuments({ userId: req.user._id, familyMemberId: member._id })
        ]);

        return {
          ...member.toObject(),
          totalReports,
          totalVitals
        };
      })
    );

    res.json({
      success: true,
      message: 'Family members retrieved successfully',
      data: { familyMembers: membersWithStats }
    });

  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch family members',
      error: error.message
    });
  }
});

// Get single family member
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const familyMember = await FamilyMember.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    // Get recent reports and vitals
    const [recentReports, recentVitals, totalReports, totalVitals] = await Promise.all([
      Report.find({ 
        userId: req.user._id, 
        familyMemberId: familyMember._id 
      }).sort({ reportDate: -1 }).limit(5),
      Vitals.find({ 
        userId: req.user._id, 
        familyMemberId: familyMember._id 
      }).sort({ recordDate: -1 }).limit(5),
      Report.countDocuments({ userId: req.user._id, familyMemberId: familyMember._id }),
      Vitals.countDocuments({ userId: req.user._id, familyMemberId: familyMember._id })
    ]);

    res.json({
      success: true,
      message: 'Family member retrieved successfully',
      data: {
        familyMember: {
          ...familyMember.toObject(),
          totalReports,
          totalVitals
        },
        recentReports,
        recentVitals
      }
    });

  } catch (error) {
    console.error('Error fetching family member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch family member',
      error: error.message
    });
  }
});

// Create new family member
router.post('/', authenticateToken, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('relationship')
    .isIn(['self', 'mother', 'father', 'wife', 'husband', 'son', 'daughter', 'brother', 'sister', 'grandfather', 'grandmother', 'other'])
    .withMessage('Invalid relationship'),
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
  body('phoneNumber')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      if (value.length < 7 || value.length > 20) {
        throw new Error('Phone number must be between 7 and 20 characters');
      }
      if (!/^[\+]?[\d\s\-\(\)]+$/.test(value)) {
        throw new Error('Phone number can only contain numbers, spaces, +, -, () characters');
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

    console.log('📥 Received request body:', req.body);
    
    const familyMemberData = {
      userId: req.user._id,
      ...req.body
    };

    console.log('🔍 Creating family member with data:', familyMemberData);

    // Convert dateOfBirth to Date object if provided
    if (familyMemberData.dateOfBirth) {
      familyMemberData.dateOfBirth = new Date(familyMemberData.dateOfBirth);
    }

    // Clean phone number if provided
    if (familyMemberData.phoneNumber) {
      familyMemberData.phoneNumber = familyMemberData.phoneNumber.trim();
      console.log('📞 Phone number after trim:', familyMemberData.phoneNumber);
    }

    const familyMember = new FamilyMember(familyMemberData);
    await familyMember.save();

    res.status(201).json({
      success: true,
      message: 'Family member added successfully',
      data: { familyMember }
    });

  } catch (error) {
    console.error('❌ Error creating family member:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      console.error('🔍 Validation errors:', validationErrors);
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add family member',
      error: error.message
    });
  }
});

// Update family member
router.put('/:id', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('relationship')
    .optional()
    .isIn(['self', 'mother', 'father', 'wife', 'husband', 'son', 'daughter', 'brother', 'sister', 'grandfather', 'grandmother', 'other'])
    .withMessage('Invalid relationship'),
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
  body('phoneNumber')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      if (value.length < 7 || value.length > 20) {
        throw new Error('Phone number must be between 7 and 20 characters');
      }
      if (!/^[\+]?[\d\s\-\(\)]+$/.test(value)) {
        throw new Error('Phone number can only contain numbers, spaces, +, -, () characters');
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

    const familyMember = await FamilyMember.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    const allowedUpdates = [
      'name', 'relationship', 'dateOfBirth', 'gender', 'bloodGroup',
      'phoneNumber', 'emergencyContact', 'medicalConditions', 'allergies', 'currentMedications'
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

    Object.assign(familyMember, updates);
    await familyMember.save();

    res.json({
      success: true,
      message: 'Family member updated successfully',
      data: { familyMember }
    });

  } catch (error) {
    console.error('Error updating family member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update family member',
      error: error.message
    });
  }
});

// Delete family member (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const familyMember = await FamilyMember.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    // Soft delete
    familyMember.isActive = false;
    await familyMember.save();

    res.json({
      success: true,
      message: 'Family member deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting family member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete family member',
      error: error.message
    });
  }
});

// Add medical condition to family member
router.post('/:id/medical-conditions', authenticateToken, [
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

    const familyMember = await FamilyMember.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    const { condition, diagnosedDate, status = 'active' } = req.body;

    const medicalCondition = {
      condition,
      diagnosedDate: diagnosedDate ? new Date(diagnosedDate) : new Date(),
      status
    };

    familyMember.medicalConditions.push(medicalCondition);
    await familyMember.save();

    res.json({
      success: true,
      message: 'Medical condition added successfully',
      data: { familyMember }
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

export default router;
