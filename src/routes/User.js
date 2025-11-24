const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const { protect } = require('../middleware/Auth');

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    // Fetch user details
    const user = await User.findById(req.user.id);
    // Fetch user's projects
    const projects = await Project.find({ author: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, location, website, github, linkedin, twitter } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, location, website, github, linkedin, twitter },
      { new: true, runValidators: true }
    );

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

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch user's projects
    const projects = await Project.find({ 
      author: req.params.id,
      status: 'approved'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;