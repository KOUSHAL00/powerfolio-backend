const express = require('express');
const router = express.Router();
const { upload } = require('../utils/cloudinary');
const { protect } = require('../middleware/auth');

// @route   POST /api/upload/image
// @desc    Upload single image
// @access  Private
router.post('/image', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    res.json({
      success: true,
      url: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/upload/images
// @desc    Upload multiple images
// @access  Private
router.post('/images', protect, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      });
    }

    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));

    res.json({
      success: true,
      images
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;