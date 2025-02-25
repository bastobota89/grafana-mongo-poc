const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  timeline: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  identifier: {
    type: String,
    required: true,
    unique: true
  },
  lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  lng: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Record', recordSchema); 