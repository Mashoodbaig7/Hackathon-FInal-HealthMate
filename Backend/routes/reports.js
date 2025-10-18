import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken, checkResourceOwnership } from '../middleware/auth.js';
import { upload, deleteFromCloudinary, uploadToCloudinary } from '../config/cloudinary.js';
import { analyzeReport } from '../services/geminiService.js';
import Report from '../models/Report.js';

const router = express.Router();

// Get all reports for authenticated user
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('reportType').optional().isIn([
    'blood_test', 'urine_test', 'xray', 'mri', 'ct_scan', 
    'ultrasound', 'ecg', 'prescription', 'consultation', 'vaccination', 'other'
  ]).withMessage('Invalid report type'),
  query('sortBy').optional().isIn(['reportDate', 'createdAt', 'title']).withMessage('Invalid sort field'),
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
      limit = 10,
      reportType,
      sortBy = 'reportDate',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build query
    const query = { userId: req.user._id };
    
    if (reportType) {
      query.reportType = reportType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { hospitalName: { $regex: search, $options: 'i' } },
        { doctorName: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Execute query
    const [reports, totalCount] = await Promise.all([
      Report.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-aiAnalysis.confidence -cloudinaryPublicId'),
      Report.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      message: 'Reports retrieved successfully',
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
});

// Get single report by ID
router.get('/:id', authenticateToken, checkResourceOwnership(Report), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Report retrieved successfully',
      data: { report: req.resource }
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message
    });
  }
});

// Upload and analyze new report
router.post('/upload', authenticateToken, (req, res, next) => {
  console.log('🔥 POST /api/reports/upload hit!');
  console.log('User:', req.user?._id);
  console.log('Content-Type:', req.headers['content-type']);
  
  upload.single('reportFile')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message
      });
    }
    next();
  });
}, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('reportType')
    .isIn([
      'blood_test', 'urine_test', 'xray', 'mri', 'ct_scan',
      'ultrasound', 'ecg', 'prescription', 'consultation', 'vaccination', 'other'
    ])
    .withMessage('Invalid report type'),
  body('reportDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('hospitalName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Hospital name cannot exceed 100 characters'),
  body('doctorName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Doctor name cannot exceed 100 characters')
], async (req, res) => {
  try {
    console.log('📝 Inside upload route handler');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? 'File present' : 'No file');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    console.log('File received:', req.file ? req.file.originalname : 'No file');

    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const {
      title,
      description,
      reportType,
      reportDate,
      hospitalName,
      doctorName,
      familyMemberId
    } = req.body;

    console.log('familyMemberId from request:', familyMemberId);

    console.log('Uploading file to Cloudinary...');

    // Upload file to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      original_filename: req.file.originalname
    });

    console.log('File uploaded to Cloudinary:', uploadResult.secure_url);

    // Determine file type
    let fileType = 'document';
    if (req.file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (req.file.mimetype === 'application/pdf') {
      fileType = 'pdf';
    }

    console.log('File type determined:', fileType);
    // Create report document
    const reportData = {
      userId: req.user._id,
      title,
      description,
      reportType,
      reportDate: reportDate ? new Date(reportDate) : new Date(),
      hospitalName,
      doctorName,
      fileUrl: uploadResult.secure_url,
      fileType,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      cloudinaryPublicId: uploadResult.public_id
    };

    // Add familyMemberId if provided (not 'self' and not empty)
    if (familyMemberId && familyMemberId !== 'self' && familyMemberId.trim() !== '') {
      reportData.familyMemberId = familyMemberId;
      console.log('Added familyMemberId to report:', familyMemberId);
    } else {
      console.log('Report is for self, no familyMemberId added');
    }

   console.log('Report data to be saved:', reportData);

    const report = new Report(reportData);
    console.log('Report document created:', report);

    // Start AI analysis in background
    try {
      console.log('Starting AI analysis for report:', report._id);
      const aiAnalysis = await analyzeReport(
        uploadResult.secure_url,
        reportType,
        `Patient: ${req.user.name}, Report: ${title}`
      );
      
      report.aiAnalysis = aiAnalysis;
      console.log('AI analysis completed successfully');
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      // Continue saving report even if AI analysis fails
      report.aiAnalysis = {
        summary: {
          english: "AI analysis is currently unavailable. Please check back later.",
          urdu: "AI tahleel filhal uplabdh nahi hai. Baad mein check karen."
        },
        keyFindings: [],
        recommendations: {
          english: ["Please consult with your healthcare provider for report interpretation."],
          urdu: ["Report ki tashreeh ke liye apne doctor se miliye."]
        },
        questionsForDoctor: {
          english: ["Could you explain these results to me?"],
          urdu: ["Kya aap yeh nataaij samjha sakte hain?"]
        },
        dietarySuggestions: {
          foodsToAvoid: [],
          recommendedFoods: []
        },
        homeRemedies: {
          english: [],
          urdu: []
        },
        confidence: 0
      };
    }
    console.log('Report document created:', report);

    await report.save();
    console.log('Report document created:', report);

    res.status(201).json({
      success: true,
      message: 'Report uploaded and analyzed successfully',
      data: { report }
    });

  } catch (error) {
    console.error('Error uploading report:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload report',
      error: error.message
    });
  }
});

// Update report
router.put('/:id', authenticateToken, checkResourceOwnership(Report), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('hospitalName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Hospital name cannot exceed 100 characters'),
  body('doctorName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Doctor name cannot exceed 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters')
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

    const allowedUpdates = ['title', 'description', 'hospitalName', 'doctorName', 'tags'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: { report: updatedReport }
    });

  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report',
      error: error.message
    });
  }
});

// Add note to report
router.post('/:id/notes', authenticateToken, checkResourceOwnership(Report), [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Note content must be between 1 and 1000 characters')
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

    const { content } = req.body;
    const report = req.resource;

    report.notes.push({
      content,
      addedAt: new Date()
    });

    await report.save();

    res.json({
      success: true,
      message: 'Note added successfully',
      data: { report }
    });

  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message
    });
  }
});

// Delete report
router.delete('/:id', authenticateToken, checkResourceOwnership(Report), async (req, res) => {
  try {
    const report = req.resource;

    // Delete file from Cloudinary
    if (report.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(report.cloudinaryPublicId);
      } catch (deleteError) {
        console.error('Error deleting file from Cloudinary:', deleteError);
        // Continue with report deletion even if file deletion fails
      }
    }

    // Delete report from database
    await Report.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message
    });
  }
});

// Get report statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Report.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          reportsByType: {
            $push: '$reportType'
          },
          recentReports: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          },
          oldestReport: { $min: '$reportDate' },
          newestReport: { $max: '$reportDate' }
        }
      }
    ]);

    // Count reports by type
    const reportTypeCounts = {};
    if (stats.length > 0) {
      stats[0].reportsByType.forEach(type => {
        reportTypeCounts[type] = (reportTypeCounts[type] || 0) + 1;
      });
    }

    res.json({
      success: true,
      message: 'Report statistics retrieved successfully',
      data: {
        totalReports: stats.length > 0 ? stats[0].totalReports : 0,
        recentReports: stats.length > 0 ? stats[0].recentReports : 0,
        reportTypeCounts,
        dateRange: {
          oldest: stats.length > 0 ? stats[0].oldestReport : null,
          newest: stats.length > 0 ? stats[0].newestReport : null
        }
      }
    });

  } catch (error) {
    console.error('Error fetching report statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

export default router;
