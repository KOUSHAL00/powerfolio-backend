const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const { protect } = require('../middleware/Auth');

// @route   GET /api/projects
// @desc    Get all approved projects (Public) with Search
router.get('/', async (req, res) => {
  try {
    // Query Parameters
    const { search, tech, sort, limit = 20, page = 1 } = req.query;
    
    // Default: Only show approved projects to public
    let query = { status: 'approved' };

    // Search Logic
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { techStack: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const projects = await Project.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/projects
// @desc    Create new project
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, techStack, github, liveLink, thumbnail, tags, category } = req.body;

    const project = await Project.create({
      title,
      description,
      techStack, // Expecting array of strings
      github,
      liveLink,
      thumbnail, // Expecting Base64 string or URL
      tags,
      category,
      author: req.user.id,
      status: 'pending' // Always pending initially
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, { $inc: { projectCount: 1 } });

    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });

    // Allow Author OR Admin to delete
    if (project.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await project.deleteOne();
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/projects/:id   
// @desc    Update project
router.put('/:id', protect, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check ownership: Allow Author OR Admin
    if (project.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
    }

    // Update fields
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;