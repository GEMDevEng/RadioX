# RadioX Free Edition

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

**RadioX Free Edition** is a lightweight web application that transforms X posts into high-quality audio clips, making social media content more accessible and engaging. Designed for content creators, accessibility advocates, and small businesses, RadioX operates within the X API Free Tier limits, ensuring cost-effectiveness while delivering professional audio output.

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [Tech Stack](#tech-stack)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [License](#license)
- [Contact](#contact)

---

## Introduction

RadioX Free Edition allows users to convert up to 500 X posts per month into audio clips using Google Cloud Text-to-Speech (TTS). The application is built with accessibility in mind, adhering to WCAG 2.1 Level AA standards, making it an ideal tool for users who prioritize inclusivity. With features like hashtag-based search, customizable audio settings, and podcast RSS feed generation, RadioX simplifies the process of repurposing social media content for audio formats.

### Target Audience
- **Content Creators**: Repurpose top-performing posts into podcasts.
- **Accessibility Advocates**: Make X content accessible to visually impaired audiences.
- **Small Businesses**: Create audio versions of announcements and testimonials.
- **Niche Communities**: Convert specialized content into audio for broader reach.

---

## Features

### Core Features
- **Hashtag Search Engine**: Search X posts by hashtags with filtering and sorting options.
- **Smart Search**: Use natural language processing and voice commands to find content.
- **Post Selection System**: Select posts for conversion with previews and engagement metrics.
- **Audio Conversion Engine**: Convert posts to audio with customizable voice and background music.
- **Audio Library Management**: Manage, preview, and download audio clips.
- **Podcast Publishing System**: Generate RSS feeds for podcast distribution.
- **Usage Monitoring Dashboard**: Track API usage to stay within Free Tier limits.
- **User Account Management**: Secure authentication and profile management.
- **Dark Mode Support**: Modern UI with light and dark mode options for reduced eye strain.

### Secondary Features
- **AI-Powered Content Recommendations**: Get personalized content suggestions based on your interests.
- **Automated Podcast Creation**: Use AI to generate podcast descriptions, titles, and show notes.
- **Advanced Analytics**: User segmentation, predictive analytics, and custom reporting.
- **Favorites System**: Save and organize favorite hashtags and posts.
- **Trending Analysis**: View trending hashtags and receive suggestions.
- **Audio Enhancement**: Improve audio quality with noise reduction and volume normalization.
- **Export Options**: Download, share, or embed audio clips.

---

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)
- [AWS Account](https://aws.amazon.com/) (for S3 storage)
- [X Developer Account](https://developer.x.com/) (for API access)
- [Google Cloud Account](https://cloud.google.com/) (for TTS API)

### Setup Instructions

#### Manual Setup
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
   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit the `.env` file with your actual credentials:
     ```env
     MONGODB_URI=your_mongodb_uri
     REDIS_URL=your_redis_url
     AWS_ACCESS_KEY_ID=your_aws_access_key
     AWS_SECRET_ACCESS_KEY=your_aws_secret_key
     X_API_KEY=your_x_api_key
     GOOGLE_CLOUD_TTS_KEY=your_google_cloud_tts_key
     JWT_SECRET=your_jwt_secret
     ```

4. Run the application in development mode:
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:3000`.

#### Docker Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/GEMDevEng/RadioX.git
   cd RadioX
   ```

2. Set up environment variables:
   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit the `.env` file with your actual credentials.

3. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Access the application at `http://localhost:3000`.

#### Production Deployment
1. Clone the repository:
   ```bash
   git clone https://github.com/GEMDevEng/RadioX.git
   cd RadioX
   ```

2. Set up environment variables for production:
   ```bash
   cp .env.production.template .env.production
   ```
   Edit the `.env.production` file with your actual credentials and configuration.

3. Create required directories:
   ```bash
   mkdir -p logs uploads backups ssl mongo-init redis
   ```

4. Generate SSL certificates for HTTPS:
   ```bash
   # For production, use a proper SSL certificate from a trusted CA
   # For testing, you can generate a self-signed certificate:
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout ssl/radiox.key -out ssl/radiox.crt
   ```

5. Deploy the application using the deployment script:
   ```bash
   ./scripts/deploy-production.sh
   ```

6. Access the application at your configured domain.

7. Monitor the application:
   - Access Grafana dashboards at `http://your-domain:3001`
   - View logs in the ELK stack at `http://your-domain:5601`

8. Backup and restore:
   - Automated backups run daily at 2:00 AM
   - Manual backup: `./scripts/backup-database.sh`
   - Restore from backup: `./scripts/restore-database.sh --latest`

9. Rollback to a previous version if needed:
   ```bash
   ./scripts/rollback-production.sh <previous-tag>
   ```

---

## Usage

### User Registration and Login
1. Navigate to the registration page and create an account with a valid email and password.
2. Log in using your credentials to access the dashboard.

### Searching for Posts
1. On the dashboard, click "Search" and enter one or more hashtags.
2. Use filters (e.g., text-only posts) and sorting options (e.g., by likes) to refine results.
3. Select posts for conversion by checking the boxes next to them.

### Converting Posts to Audio
1. After selecting posts, click "Convert to Audio."
2. Choose a voice and background music, adjust settings (speed, volume), and preview.
3. Confirm and start the conversion process.
4. Once complete, access the audio clips in the Audio Library.

### Managing Audio Clips
1. In the Audio Library, preview clips using the play button.
2. Download clips in MP3 or WAV format.
3. Edit metadata (title, description) or delete unwanted clips.

### Creating Podcasts
1. Navigate to "Podcasts" and create a new podcast by entering title, description, and artwork.
2. Add audio clips as episodes and arrange their order.
3. Generate the RSS feed and copy the URL for distribution.
4. Follow the provided guides to submit your podcast to platforms like Spotify.

### Monitoring API Usage
1. On the dashboard, view your current API usage and remaining quota.
2. Receive alerts when usage approaches 80% of the monthly limit.

---

## Contributing

We welcome contributions to RadioX Free Edition! To contribute:

1. **Fork the repository** and create a new branch for your feature or fix.
2. **Follow coding standards**:
   - Use React functional components with hooks.
   - Style with Tailwind CSS.
   - Ensure accessibility (WCAG 2.1 Level AA).
3. **Write tests** for new features or fixes.
4. **Submit a pull request** with a clear description of your changes.

For more details, see our [Contribution Guidelines](CONTRIBUTING.md).

---

## Tech Stack

### Frontend
- **React**: UI framework
- **Tailwind CSS**: Styling
- **React Router**: Navigation
- **Redux/Context API**: State management
- **Jest, React Testing Library, Cypress**: Testing

### Backend
- **Node.js**: Runtime
- **Express.js**: API framework
- **MongoDB**: Database
- **Redis**: Caching and queues
- **Bull**: Job management
- **JWT, bcrypt, Helmet**: Security

### Infrastructure
- **AWS S3**: Audio storage
- **Docker**: Containerization
- **Kubernetes**: Orchestration
- **GitHub Actions**: CI/CD
- **Prometheus, Grafana, ELK Stack**: Monitoring and logging

### APIs
- **X API**: Post retrieval
- **Google Cloud TTS**: Audio conversion
- **SendGrid**: Email notifications

---

## Testing

RadioX Free Edition employs a comprehensive testing strategy:
- **Unit Testing**: Components and functions with Jest.
- **Integration Testing**: API interactions with Supertest.
- **UI Testing**: User flows with Cypress.
- **Performance Testing**: Load handling with JMeter.
- **Security Testing**: Vulnerability scans with OWASP ZAP.
- **Accessibility Testing**: Compliance with axe-core and manual screen reader tests.

---

## Deployment

The application is deployed on AWS using:
- **Docker** for containerization.
- **Kubernetes** for orchestration.
- **GitHub Actions** for automated CI/CD pipelines.
- **Prometheus and Grafana** for real-time monitoring.
- **ELK Stack** for centralized logging.

---

## Documentation

Detailed documentation is available in the `docs` directory:

- **API Documentation**: Available at `/api-docs` when running the application
  - Endpoints documentation
  - Request/response schemas
  - Authentication details

- **Product Documentation**: `/docs/product/`
  - Product Description
  - Target Audience Analysis
  - Product Requirements Document

- **Development Documentation**: `/docs/development/`
  - Frontend Guidelines
  - Backend Structure
  - Software Requirements
  - App Flow
  - Features Results
  - Security Guidelines
  - Agentic Coding Best Practices

- **Planning Documentation**: `/docs/planning/`
  - Work Breakdown Structure
  - Project Rules
  - Implementation Plan
  - Task List
  - Tickets List
  - Tech Stack
  - Knowledge Graph
  - Gantt Chart

- **Architecture Documentation**: `/docs/architecture/`
  - Directory Structure
  - Comprehensive Build Guide

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For support or contributions, please contact:

- **Email**: support@radiox.com
- **GitHub Issues**: [RadioX Issues](https://github.com/GEMDevEng/RadioX/issues)

---

*Built with ❤️ for accessibility and innovation.*
