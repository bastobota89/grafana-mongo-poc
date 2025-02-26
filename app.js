require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Record = require('./models/Record');

const app = express();
const port = process.env.PORT || 4000;

// CORS configuration - allow all origins
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.get('/api/data', async (req, res) => {
  try {
    const { limit = 100, page = 1, from, to } = req.query;
    
    // Convert to numbers and validate
    const limitNum = Math.min(Math.max(parseInt(limit), 1), 1000);
    const pageNum = Math.max(parseInt(page), 1);
    const skip = (pageNum - 1) * limitNum;

    // Build query with time range if provided
    const query = {};
    if (from || to) {
      query.timeline = {};
      if (from) {
        query.timeline.$gte = new Date(parseInt(from));
      }
      if (to) {
        query.timeline.$lte = new Date(parseInt(to));
      }
    }

    // Get total count for pagination info with time range filter
    const totalRecords = await Record.countDocuments(query);
    
    // Fetch records with pagination and time range filter
    const records = await Record.find(query)
      .sort({ timeline: -1 })
      .skip(skip)
      .limit(limitNum);

    // Send response with pagination metadata
    res.json({
      data: records,
      pagination: {
        total: totalRecords,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalRecords / limitNum)
      },
      timeRange: {
        from: from ? new Date(parseInt(from)) : null,
        to: to ? new Date(parseInt(to)) : null
      }
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Error fetching records' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 