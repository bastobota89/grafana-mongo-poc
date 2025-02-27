require('dotenv').config();
const mongoose = require('mongoose');
const Record = require('../models/Record');

// Function to generate random date within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Function to generate random coordinates
function generateCoordinates() {
  return {
    lat: Math.random() * 180 - 90,  // Random latitude between -90 and 90
    lng: Math.random() * 360 - 180  // Random longitude between -180 and 180
  };
}

// Function to generate identifier
function generateIdentifier(index) {
  const prefix = ['PRJ', 'TSK', 'DOC', 'REQ', 'BUG'];
  return `${prefix[Math.floor(Math.random() * prefix.length)]}-${String(index).padStart(7, '0')}`;
}

// Function to generate random title with additional content for larger size
function generateTitle() {
  const actions = ['Update', 'Create', 'Review', 'Deploy', 'Test', 'Debug'];
  const components = ['Database', 'API', 'Frontend', 'Backend', 'Documentation', 'Infrastructure'];
  const details = ['Integration', 'Feature', 'Bugfix', 'Enhancement', 'Optimization'];
  
  const baseTitle = `${actions[Math.floor(Math.random() * actions.length)]} ${
    components[Math.floor(Math.random() * components.length)]} ${
    details[Math.floor(Math.random() * details.length)]}`;

  // Add additional description to increase record size
  const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ${Math.random().toString(36).substring(7)}`;
  
  return `${baseTitle} - ${lorem}`;
}

async function* recordGenerator(startIndex, count, startDate) {
  for (let i = 0; i < count; i++) {
    const coords = generateCoordinates();
    yield {
      timeline: new Date(startDate.getTime() + i * 60000), // Increment by one minute
      title: generateTitle(),
      identifier: generateIdentifier(startIndex + i),
      lat: coords.lat,
      lng: coords.lng
    };
  }
}

async function insertBatch(records) {
  try {
    await Record.insertMany(records, { ordered: false });
    return true;
  } catch (error) {
    console.error('Error inserting batch:', error);
    return false;
  }
}

async function seedData() {
  try {
    // Configure MongoDB for larger operations
    mongoose.set('bufferCommands', false);
    
    // Connect to MongoDB with increased timeout and buffer size
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      socketTimeoutMS: 30000,
      writeConcern: {
        w: 1,
        j: false
      }
    });
    console.log('Connected to MongoDB');

    // Clear existing records
    await Record.deleteMany({});
    console.log('Cleared existing records');

    // Calculate total records for every minute in the last 6 months
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setMonth(endDate.getMonth() - 6);
    const totalRecords = Math.floor((endDate - startDate) / 60000); // Total minutes in 6 months
    const batchSize = 100; // Smaller batch size for memory efficiency

    let successCount = 0;
    let failedCount = 0;
    
    // Process records in smaller batches
    for (let i = 0; i < totalRecords; i += batchSize) {
      const records = [];
      const recordGen = recordGenerator(i, Math.min(batchSize, totalRecords - i), startDate);
      
      for await (const record of recordGen) {
        records.push(record);
      }

      const success = await insertBatch(records);
      if (success) {
        successCount += records.length;
        console.log(`Processed ${successCount} records successfully`);
      } else {
        failedCount += records.length;
      }

      // Add a small delay between batches to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Seeding completed. Successful: ${successCount}, Failed: ${failedCount}`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Closing MongoDB connection...');
  await mongoose.connection.close();
  process.exit(0);
});

seedData(); 