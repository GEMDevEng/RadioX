# App Flow Document for RadioX

## 1. Introduction

### 1.1 Purpose
This App Flow Document outlines the user interaction flows for RadioX Free Edition, a web application designed to convert X posts into high-quality audio clips for podcast distribution. It details the sequence of user actions and system responses across three primary flows: Search to Audio, Podcast Creation, and API Usage Monitoring. The document ensures that the application provides an intuitive, accessible, and efficient experience for its target audience—content creators, accessibility advocates, small businesses, and niche content communities—while operating within the X API Free Tier constraints (500 posts/month, 100 read requests/month).

### 1.2 Scope
The document covers the main user journeys within RadioX, focusing on how users navigate the application to achieve their goals, such as converting posts to audio, creating podcasts, and monitoring API usage. It includes detailed steps for each flow, specifying user inputs, system outputs, and relevant notes to guide development and ensure usability. The flows are based on information from the RadioX Product Requirements Document (PRD), Product Description, and Target Audience Analysis, ensuring alignment with the application’s functionality and user needs.

### 1.3 Context
RadioX Free Edition enables users to transform X posts into audio clips using Google Cloud Text-to-Speech (TTS), generate podcast RSS feeds, and monitor API usage. The application is built with a React frontend, Node.js/Express backend, MongoDB database, Redis for caching, and AWS S3 for audio storage. It targets users aged 25-45 who are tech-savvy but not necessarily developers, prioritizing accessibility (WCAG compliance) and cost-effectiveness within API limits. The app flows are designed to be user-friendly, supporting non-technical users in repurposing social media content into engaging audio formats.

## 2. Main User Flow: Search to Audio

This flow describes the process of searching for X posts by hashtags, converting them into audio clips, and managing the resulting audio.

| Step | User Action | System Response | Notes |
|------|-------------|-----------------|-------|
| **1. Login** | User accesses the RadioX website and logs in with email and password. | Authenticates using JWT and redirects to the dashboard. | Redirects to login page if not authenticated. Password reset available. |
| **2. Navigate to Search** | Clicks "Search" button/link on dashboard. | Displays Search page with a hashtag