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
- PostgreSQL (for feedback storage)

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
   - Install PostgreSQL if not already installed.
   - Create a database:
     ```bash
     createdb couple_call_dev
     ```
   - Create a `.env` file in the project root with the following content:
     ```env
     DB_USER=your_username
     DB_HOST=localhost
     DB_NAME=couple_call_dev
     DB_PASSWORD=your_password
     DB_PORT=5432
     ```

4. Run the server:
   ```bash
   node backend/server.js
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

## Development
- Use `nodemon` for automatic server restarts during development:
  ```bash
  npm install -g nodemon
  nodemon backend/server.js
  ```

## License
This project is licensed under the MIT License.