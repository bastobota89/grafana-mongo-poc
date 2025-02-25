# MongoDB API Application

This is a simple Node.js application that provides an API endpoint to fetch records from MongoDB.

## Running with Docker Compose

1. Make sure you have Docker and Docker Compose installed
2. Run the application:
   ```bash
   docker-compose up --build
   ```
3. The application will be available at http://localhost:3000
4. To seed the database with sample data:
   ```bash
   # If running locally:
   npm run seed

   # If running with Docker:
   docker-compose exec app npm run seed
   ```

To stop the application:
```bash
docker-compose down
```

To remove all data (including MongoDB volume):
```bash
docker-compose down -v
```

## Running Locally

### Prerequisites

- Node.js
- MongoDB running locally on port 27017

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update MongoDB connection string if needed

3. Start the application:
   ```bash
   npm start
   ```

4. (Optional) Seed the database with sample data:
   ```bash
   npm run seed
   ```

## API Endpoints

### GET /api/data
Returns a paginated list of records sorted by timeline in descending order.

Query Parameters:
- `limit` (optional): Number of records per page (default: 100, max: 1000)
- `page` (optional): Page number (default: 1)

Example requests:
```bash
# Get first 100 records (default)
GET /api/data

# Get 50 records from page 2
GET /api/data?limit=50&page=2

# Get maximum allowed records (1000)
GET /api/data?limit=1000
```

Response format:
```json
{
  "data": [
    {
      "_id": "string",
      "timeline": "2024-03-10T12:00:00.000Z",
      "title": "string",
      "identifier": "PRJ-00001",
      "lat": 45.123,
      "lng": -122.456,
      "createdAt": "2024-03-10T12:00:00.000Z",
      "updatedAt": "2024-03-10T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 10000,
    "page": 1,
    "limit": 100,
    "totalPages": 100
  }
}
```

## Sample Data
The seed script generates 10,000 sample records with the following characteristics:
- Timeline: Random dates from the last 3 months
- Title: Combination of random actions, components, and details
- Identifier: Unique ID in format PREFIX-XXXXX (e.g., PRJ-00001, TSK-00002)
- Latitude: Random value between -90 and 90
- Longitude: Random value between -180 and 180 