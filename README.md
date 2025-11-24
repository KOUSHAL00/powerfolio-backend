# PowerFolio-Backend(Node.js)
The backend is built with Node.js and Express, designed to be robust, scalable, and secure. It handles data persistence, authentication, file storage, and AI logic.

Key Features Implemented
Authentication & Security
JWT Authentication: Stateless authentication using JSON Web Tokens.
Role-Based Access Control (RBAC): Middleware (protect, authorize) to separate user and admin capabilities.
Password Hashing: Integrated bcryptjs for secure password storage.
Account Deactivation: Logic to prevent banned/deleted users from logging in (returning 403 Forbidden).

Project Management API
CRUD Operations: Full Create, Read, Update, Delete capabilities for projects.
Advanced Search: Server-side filtering using Regex for titles, descriptions, and tech stacks.
Pagination: Optimized data fetching with limit and skip.

Admin Capabilities
Approval Workflow: Projects created by users start as pending. Admins must approve them to make them public.
Analytics Engine: Aggregates data for Total Users, Project Status counts (Approved/Pending/Rejected), and Trends.
User Management: Admin can view all users and deactivate bad actors.
Image & File Handling
Cloudinary Integration: Direct upload to Cloud storage for optimized image delivery.
Multer: Middleware to handle multipart/form-data for file uploads.
Payload Optimization: Server configured to handle up to 50MB payloads to prevent PayloadTooLargeError.
AI Integration (Google Gemini)
Proxy Routes: Backend acts as a secure proxy to Google's Gemini API to hide API keys from the client.
Contextual Prompts: Custom endpoints to generate project ideas and improve text descriptions.

Tech Stack (Backend)
Runtime: Node.js
Framework: Express.js
Database: MongoDB (Mongoose ODM)
Storage: Cloudinary
