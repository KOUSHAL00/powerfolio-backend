const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/analytics
// @desc    Get dashboard analytics
// @access  Private/Admin
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const approved = await Project.countDocuments({ status: 'approved' });
    const pending = await Project.countDocuments({ status: 'pending' });
    const rejected = await Project.countDocuments({ status: 'rejected' });

    // Top technologies
    const topTech = await Project.aggregate([
      { $match: { status: 'approved' } },
      { $unwind: '$techStack' },
      { $group: { _id: '$techStack', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    // Set to the first day of the month six months ago
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await Project.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Most viewed projects
    const topProjects = await Project.find({ status: 'approved' })
      .sort({ views: -1 })
      .limit(5)
      .select('title views author')
      .populate('author', 'name');

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalProjects,
        approved,
        pending,
        rejected,
        topTech,
        trends,
        topProjects
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/projects
// @desc    Get all projects for admin
// @access  Private/Admin
router.get('/projects', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const projects = await Project.find(query)
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Project.countDocuments(query);

    res.json({
      success: true,
      projects,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/projects/:id/approve
// @desc    Approve project
// @access  Private/Admin
router.put('/projects/:id/approve', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedAt: Date.now(),
        approvedBy: req.user.id
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }


    res.json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/projects/:id/reject
// @desc    Reject project
// @access  Private/Admin
router.put('/projects/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        rejectionReason: reason
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/deactivate
// @desc    Deactivate user
// @access  Private/Admin
router.put('/users/:id/deactivate', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;