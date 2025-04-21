# Comprehensive Knowledge Graph for RadioX Free Edition

## Overview
This knowledge graph provides a structured representation of the entities, relationships, and processes involved in **RadioX Free Edition**, a web application designed to convert X posts into audio clips for podcast distribution. It outlines the application's architecture, user interactions, and data flows to ensure clarity for developers, stakeholders, and users.

---

## Entities
The core components of RadioX Free Edition are represented as entities:

- **User**: Individuals or organizations interacting with the application, such as content creators, accessibility advocates, and small businesses.
- **Post**: X posts retrieved via the X API, consisting of text content and metadata (e.g., likes, reposts).
- **AudioClip**: Audio files generated from X posts, stored in AWS S3.
- **Podcast**: RSS feeds created by users, containing episodes derived from audio clips.
- **Hashtag**: Tags used to search for relevant X posts.
- **Voice**: Text-to-speech (TTS) voice options available for audio conversion.
- **Music**: Background music options that can be added to audio clips.
- **APIUsage**: Tracks API calls to monitor usage within the X API Free Tier limits.

---

## Relationships
The connections between entities define how they interact within the application:

- **User searches for Hashtag**: Users input hashtags to find relevant X posts.
- **Hashtag associated with Post**: Hashtags link to posts that contain them.
- **User selects Post**: Users choose specific posts for conversion into audio.
- **Post converted to AudioClip**: Selected posts are transformed into audio clips using Google Cloud TTS.
- **AudioClip part of Podcast**: Audio clips are incorporated into podcasts as episodes.
- **User creates Podcast**: Users generate podcasts from selected audio clips.
- **User monitors APIUsage**: Users track their API call usage to stay within limits.
- **Voice used in AudioClip**: A selected TTS voice is applied to generate the audio clip.
- **Music added to AudioClip**: Background music is mixed into the audio clip for enhancement.

---

## Processes
Key workflows within RadioX Free Edition include:

- **Authentication**: Users log in or register to access the application’s features.
- **Search**: Users search for X posts using hashtags, with results filtered and sorted for relevance.
- **Conversion**: Selected posts are converted into audio clips with customizable voice and music options.
- **Management**: Users can edit, delete, or organize their audio clips and podcasts.
- **Monitoring**: Users view API usage statistics and receive alerts when approaching Free Tier limits.

---

## Data Flows
The movement of data through the application is as follows:

- **X API → Posts**: Posts are retrieved from the X API based on hashtag searches.
- **Posts → AudioClips**: Posts are processed into audio clips using Google Cloud TTS.
- **AudioClips → AWS S3**: Generated audio files are stored in AWS S3 for accessibility and scalability.
- **AudioClips → Podcasts**: Audio clips are included in podcast RSS feeds for distribution.
- **APIUsage → Dashboard**: API usage data is displayed in a monitoring dashboard for user oversight.

---

## Constraints
The application operates under the following limitations and requirements:

- **API Limits**: Must adhere to X API Free Tier restrictions (500 posts/month, 100 read requests/month).
- **Accessibility**: The user interface must comply with WCAG 2.1 Level AA standards for inclusivity.
- **Security**: Data must be encrypted in transit and at rest, with robust authentication and authorization mechanisms.

---

## Visual Representation
A conceptual diagram of the knowledge graph can be visualized with:

- **Nodes**: User, Post, AudioClip, Podcast, Hashtag, Voice, Music, APIUsage
- **Edges**: 
  - User → searches for → Hashtag
  - Hashtag → associated with → Post
  - User → selects → Post
  - Post → converted to → AudioClip
  - AudioClip → part of → Podcast
  - User → creates → Podcast
  - User → monitors → APIUsage
  - Voice → used in → AudioClip
  - Music → added to → AudioClip

---

## Purpose and Utility
This knowledge graph serves as a comprehensive reference for understanding RadioX Free Edition’s components, interactions, and operational flow. It supports:

- **Development**: Guides implementation of features and integrations.
- **Testing**: Ensures all entities and relationships are functioning as intended.
- **Maintenance**: Facilitates troubleshooting and updates.
- **Collaboration**: Aligns stakeholders by providing a clear, shared understanding of the application.

---

## Key References
- RadioX Technical Product Requirements Document
- RadioX Product Description Document
- RadioX Target Audience Analysis Document

This structured overview ensures that RadioX Free Edition is well-documented and accessible to all involved parties, enabling efficient development and user satisfaction.