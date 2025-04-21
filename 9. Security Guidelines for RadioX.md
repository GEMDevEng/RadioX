# Security Guidelines for RadioX

## 1. Introduction

### 1.1 Purpose
This document provides comprehensive security guidelines for the development, deployment, and maintenance of RadioX, a web application that converts X posts into audio clips for podcast distribution. The guidelines ensure that RadioX adheres to industry best practices in cybersecurity, protecting user data, maintaining system integrity, and ensuring availability. They are based on a provided Security Requirements Checklist and tailored to RadioX's architecture, which includes a React frontend with Tailwind CSS, a Node.js/Express backend, MongoDB for data storage, Redis for caching, and integrations with external APIs such as X and Google Cloud Text-to-Speech (TTS).

### 1.2 Scope
These guidelines cover all critical aspects of security, including authentication, authorization, row-level security (RLS), secrets management, data handling, frontend security, attack surface reduction, logging, monitoring, and compliance with legal and regulatory requirements like GDPR. They apply to both the frontend and backend of RadioX and are designed to mitigate common security risks while ensuring the application remains user-friendly and scalable for its target audience of content creators, accessibility advocates, and small businesses.

### 1.3 Context
RadioX Free Edition enables users to transform up to 500 X posts per month into audio clips, operating within the X API Free Tier limits (500 posts/month, 100 read requests/month). Key features include user authentication, hashtag-based post searches, audio conversion with customizable settings, podcast RSS feed generation, and API usage monitoring. The application handles sensitive user data (e.g., email, audio metadata) and integrates with external APIs, making robust security essential to protect user privacy and maintain trust.

## 2. Authentication & Authorization

### 2.1 Secure Authentication System
- **JWT Implementation**: RadioX uses JSON Web Tokens (JWT) for authentication, as specified in the Technical Product Requirements Document (PRD). Tokens are signed with a strong secret key using HS256 or RS256 algorithms and have a short expiration time (e.g., 1 hour) to minimize risk if compromised. Implement refresh tokens to allow seamless user sessions without frequent re-authentication ([JWT Best Practices](https://jwt.io/introduction)).
- **Secure Token Storage**: On the client-side, store JWT in memory (e.g., JavaScript variables) rather than local storage or cookies to prevent cross-site scripting (XSS) attacks from accessing tokens. Avoid storing tokens in browser storage unless absolutely necessary.
- **Password Security**: Use bcrypt to hash passwords before storing them in MongoDB, ensuring protection against brute-force attacks. Implement password strength requirements (e.g., minimum length, mix of characters) during registration.

### 2.2 Role-Based Access Control (RBAC)
- **Define User Roles**: Implement roles such as 'user' and 'admin'. Users can manage their own audio clips, podcasts, and usage data, while admins may have access to system-wide data or user management functions.
- **Backend Validation**: Enforce RBAC on the backend for all API endpoints. For example, before allowing a user to delete an audio clip, verify their role and ownership (e.g., `userId` matches the clip’s owner). Use Express.js middleware to check roles consistently ([Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)).
- **Frontend Role Checks**: Conditionally render UI elements based on roles (e.g., hide admin controls for non-admins), but rely solely on backend validation for access control to prevent client-side bypass.

### 2.3 Protect API Endpoints
- **Authentication Middleware**: Implement Express.js middleware to validate JWT on every protected route (e.g., `/api/audio`, `/api/podcasts`). Return a 401 Unauthorized response for invalid or missing tokens.
- **No Public Exposure**: Ensure sensitive endpoints (e.g., `/api/usage`, `/api/auth/reset-password`) are not accessible without authentication. Use tools like Swagger to document and test API security.
- **IP Whitelisting**: For critical admin endpoints, consider implementing IP whitelisting to restrict access to trusted networks, if applicable.

## 3. Row-Level Security (RLS) & Policies

### 3.1 Implement RLS in MongoDB
- **Application-Level RLS**: MongoDB does not natively support row-level security, so implement RLS at the application level. Include filters in all database queries to restrict data access based on the user’s ID (e.g., `{ userId: req.user.id }`). For example, when fetching audio clips, ensure only the user’s clips are returned ([MongoDB Security](https://www.mongodb.com/docs/manual/security/)).
- **Aggregation Pipelines**: Use MongoDB’s aggregation framework with `$match` stages to enforce RLS. For instance, in a pipeline to list podcasts, include `{ $match: { userId: req