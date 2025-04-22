# RadioX Developer Guide

This guide provides information for developers who want to contribute to RadioX or extend its functionality.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [Backend Development](#backend-development)
5. [Frontend Development](#frontend-development)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Contributing Guidelines](#contributing-guidelines)

## Architecture Overview

RadioX is a full-stack JavaScript application with the following components:

- **Frontend**: React.js application with Tailwind CSS for styling
- **Backend API**: Express.js REST API
- **Processing Service**: Node.js service for audio processing
- **Database**: MongoDB for data storage
- **Cache/Queue**: Redis for caching and job queue
- **Storage**: AWS S3 for audio file storage
- **External APIs**: X API, Google Cloud Text-to-Speech API

### System Architecture Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Frontend  │────▶│  Backend API │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Processing │◀───▶│    Redis    │
                    │   Service   │     │ Cache/Queue │
                    └─────┬───────┘     └─────────────┘
                          │
                          ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Google TTS │◀───▶│   MongoDB   │     │    AWS S3    │
│     API     │     │  Database   │     │   Storage    │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Development Environment Setup

### Prerequisites

- Node.js 16+
- Docker and Docker Compose
- MongoDB (local or Docker)
- Redis (local or Docker)
- AWS account (for S3)
- X Developer account
- Google Cloud account (for TTS API)

### Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/GEMDevEng/RadioX.git
   cd RadioX
   ```

2. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development environment:
   ```bash
   # Using Docker
   docker-compose up -d
   
   # Or manually
   npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs
   - MongoDB Express: http://localhost:8081
   - Redis Commander: http://localhost:8082

## Project Structure

```
RadioX/
├── backend/                # Backend API
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── tests/              # Test files
│   └── utils/              # Utility functions
│
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── tests/              # Test files
│
├── processing/             # Processing service
│   ├── jobs/               # Background jobs
│   ├── services/           # Processing services
│   └── utils/              # Utility functions
│
├── infrastructure/         # Infrastructure configuration
│   ├── docker/             # Docker configuration
│   ├── monitoring/         # Monitoring configuration
│   └── logging/            # Logging configuration
│
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

## Backend Development

### API Structure

The backend follows a RESTful API design with the following structure:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Models**: Define database schemas
- **Routes**: Define API endpoints
- **Middleware**: Handle cross-cutting concerns

### Adding a New API Endpoint

1. Create a controller function in the appropriate controller file:
   ```javascript
   // controllers/exampleController.js
   const asyncHandler = require('express-async-handler');

   const newEndpoint = asyncHandler(async (req, res) => {
     // Your logic here
     res.json({ success: true, data: 'Example response' });
   });

   module.exports = { newEndpoint };
   ```

2. Add the route in the appropriate route file:
   ```javascript
   // routes/exampleRoutes.js
   const express = require('express');
   const { protect } = require('../middleware/authMiddleware');
   const { newEndpoint } = require('../controllers/exampleController');

   const router = express.Router();

   router.get('/example', protect, newEndpoint);

   module.exports = router;
   ```

3. Register the route in `app.js`:
   ```javascript
   const exampleRoutes = require('./routes/exampleRoutes');
   app.use('/api/example', exampleRoutes);
   ```

### Database Models

Models are defined using Mongoose schemas:

```javascript
// models/Example.js
const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Example', exampleSchema);
```

## Frontend Development

### Component Structure

The frontend follows a component-based architecture:

- **Pages**: Top-level components that represent routes
- **Components**: Reusable UI elements
- **Contexts**: State management using React Context API
- **Hooks**: Custom hooks for shared logic
- **Services**: API communication

### Adding a New Page

1. Create a new page component:
   ```jsx
   // src/pages/ExamplePage.js
   import React, { useState, useEffect } from 'react';
   import api from '../services/api';

   const ExamplePage = () => {
     const [data, setData] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');

     useEffect(() => {
       const fetchData = async () => {
         try {
           const response = await api.get('/example');
           setData(response.data);
         } catch (err) {
           setError('Failed to fetch data');
         } finally {
           setLoading(false);
         }
       };

       fetchData();
     }, []);

     if (loading) return <div>Loading...</div>;
     if (error) return <div>{error}</div>;

     return (
       <div>
         <h1>Example Page</h1>
         <pre>{JSON.stringify(data, null, 2)}</pre>
       </div>
     );
   };

   export default ExamplePage;
   ```

2. Add the route in `App.js`:
   ```jsx
   import ExamplePage from './pages/ExamplePage';

   // In your Routes component
   <Route path="/example" element={<ExamplePage />} />
   ```

### Styling with Tailwind CSS

RadioX uses Tailwind CSS for styling. To add styles:

1. Use Tailwind utility classes directly in your JSX:
   ```jsx
   <div className="flex flex-col items-center p-4 bg-white rounded shadow">
     <h1 className="text-2xl font-bold text-gray-800">Example</h1>
     <p className="mt-2 text-gray-600">This is an example component</p>
   </div>
   ```

2. For custom styles, extend the Tailwind configuration in `tailwind.config.js`.

## Testing

### Backend Testing

Backend tests use Jest and Supertest:

```javascript
// tests/unit/controllers/exampleController.test.js
const { newEndpoint } = require('../../../controllers/exampleController');

describe('Example Controller', () => {
  it('should return success response', async () => {
    const req = {};
    const res = {
      json: jest.fn(),
    };

    await newEndpoint(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    );
  });
});
```

Run backend tests:
```bash
npm test
```

### Frontend Testing

Frontend tests use Jest and React Testing Library:

```javascript
// src/pages/__tests__/ExamplePage.test.js
import { render, screen, waitFor } from '@testing-library/react';
import ExamplePage from '../ExamplePage';
import api from '../../services/api';

jest.mock('../../services/api');

describe('ExamplePage', () => {
  it('renders loading state initially', () => {
    render(<ExamplePage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders data when loaded', async () => {
    api.get.mockResolvedValue({ data: { message: 'Example data' } });
    
    render(<ExamplePage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText(/Example data/)).toBeInTheDocument();
  });
});
```

Run frontend tests:
```bash
cd frontend && npm test
```

## Deployment

### Docker Deployment

RadioX can be deployed using Docker Compose:

1. Build and start the production containers:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. For monitoring, add the monitoring stack:
   ```bash
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

3. For logging, add the logging stack:
   ```bash
   docker-compose -f docker-compose.logging.yml up -d
   ```

### CI/CD Pipeline

RadioX uses GitHub Actions for CI/CD:

- **CI Workflow**: Runs on pull requests to main and develop branches
  - Linting
  - Unit tests
  - Integration tests
  - Build verification

- **CD Workflow**: Runs on pushes to main branch
  - Builds Docker images
  - Pushes images to Docker Hub
  - Deploys to production server

## Monitoring and Logging

### Prometheus and Grafana

RadioX uses Prometheus for metrics collection and Grafana for visualization:

1. Access Prometheus: http://localhost:9090
2. Access Grafana: http://localhost:3001 (default credentials: admin/admin)

Key metrics to monitor:
- HTTP request count and duration
- Node.js memory usage and event loop lag
- MongoDB query performance
- Redis operation latency

### ELK Stack

RadioX uses the ELK stack for centralized logging:

1. Access Kibana: http://localhost:5601

Log types:
- Application logs (backend, processing)
- Access logs (HTTP requests)
- Error logs
- Audit logs (user actions)

## Contributing Guidelines

### Code Style

RadioX follows the Airbnb JavaScript Style Guide. We use ESLint and Prettier for code formatting:

```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix
```

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Commit Message Format

We follow the Conventional Commits specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Code style changes (formatting, etc.)
- refactor: Code changes that neither fix bugs nor add features
- perf: Performance improvements
- test: Adding or fixing tests
- chore: Changes to the build process or auxiliary tools

Example:
```
feat(audio): add background music support

Add ability to overlay background music on audio clips
with configurable volume levels.

Closes #123
```

For more information, please refer to the [CONTRIBUTING.md](../CONTRIBUTING.md) file in the repository.
