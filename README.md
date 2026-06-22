# Secure Proctor

Secure Proctor is an online examination proctoring platform that analyzes webcam streams to detect suspicious behavior during examinations. The system assists examiners by generating reviewable evidence and integrity metrics, while ensuring that all decisions remain subject to human review.

## Features

- Real-time webcam monitoring
- Client-side AI inference for reduced server load and latency
- Suspicious activity detection using:
  - COCO-SSD (object detection)
  - PoseNet (human pose estimation)
- Automated violation logging
- Trust Score computation based on violation severity and frequency
- Evidence generation for examiner review
- Secure authentication and user management
- Exam session monitoring dashboard

## Tech Stack

### Frontend
- React.js
- Redux
- Material-UI

### Backend
- Node.js
- Express.js
- Passport.js
- JWT Authentication

### Database
- MongoDB Atlas
- Mongoose

### Deep Learning Models
- COCO-SSD, PoseNet from TensorFlow.js

## Architecture

1. Webcam frames are captured in the browser.
2. TensorFlow.js models perform inference on the client side.
3. Detected violations are logged and scored.
4. Session data is transmitted to the backend.
5. Examiners can review generated evidence and Trust Scores.

## Installation

### Clone the Repository

```bash
git clone <repository-url>
cd secure-proctor
```

### Install Dependencies

```bash
cd client
npm install
```

### Environment Variables

Before running, create a file:

```text
server/config/keys.js
```

Example:

```javascript
module.exports = {
  mongoURI: "mongodb_connection_string",
  secretOrKey: "secret",
};
```

## Running the Application

### Run Both Concurrently

```bash
npm run dev
```

## Trust Score

The platform computes a Trust Score using an exponential decay-based formulation that considers:

- Violation severity
- Violation frequency
- Repeated suspicious behavior

The score is intended to support examiner decision-making and should not be treated as a final verdict.

## Future Enhancements

- Advanced behavioral analytics
- Audio-based anomaly detection
- Detailed examination analytics dashboard
- Cloud deployment support
