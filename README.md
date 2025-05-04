# Couple Call Backend

This is the backend server for the Couple Call application. It provides WebRTC signaling, API routes, and database integration for features like feedback submission.

## Features
- WebRTC signaling for video calls
- REST API for app content (e.g., How-to-Use, Privacy Policy)
- Feedback submission with PostgreSQL integration

## Project Structure
```
backend/
  package.json       # Project dependencies
  server.js          # Main server file
  models/            # Data models (e.g., Room.js)
  routes/            # API routes (e.g., apiRoutes.js)
```

## Prerequisites
- Node.js (v16 or later)

## Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd couple-call-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:

- We use Supabase as our hosted PostgreSQL database. This is only used for /feedback endpoint.
Hence if you would like to test it just use your own supabase API credentials by creating a .env file in the root of the project and adding your Supabase project credentials:
 

5. Run the server:
   
- We use `nodemon` for automatic server restarts during development:
  
   ```bash
   npm start
   ```

## API Endpoints
### GET `/how-to-use`
Returns instructions for using the app.

### GET `/privacy-policy`
Returns the privacy policy details.

### POST `/feedback`
Submits user feedback.
- Request body:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Great app!"
  }
  ```
- Response:
  ```json
  {
    "message": "Feedback received successfully!"
  }
  ```



## License
This project is licensed under the MIT License.
