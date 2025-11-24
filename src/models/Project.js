const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [{ type: String }], // Array of strings
  github: { type: String, required: true },
  liveLink: { type: String }, // Optional live demo link
  thumbnail: { type: String, required: true }, // Base64 or URL
  tags: [{ type: String }], // Array of search tags
  category: { 
    type: String, 
    enum: ['web', 'mobile', 'ai', 'data', 'other'],
    default: 'web' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);