const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./src/config/db'); // Ensure you have this file or code

// Route Imports
const AuthRoute = require('./src/routes/Auth');
const UserRoute = require('./src/routes/User');
const ProjectRoute = require('./src/routes/Project');
const AdminRoute = require('./src/routes/Admin');
const UploadRoute = require('./src/routes/Upload');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));

// Body Parsers with increased limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', AuthRoute);
app.use('/api/users', UserRoute);
app.use('/api/projects', ProjectRoute);
app.use('/api/admin', AdminRoute);
app.use('/api/upload', UploadRoute);

// Health Check
app.get('/', (req, res) => res.send('PowerFolio API is Running 🚀'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 12000;


// Start Server after DB Connection
connectDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}).catch(err => console.error('❌ Database Connection Failed:', err));