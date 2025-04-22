# RadioX User Guide

Welcome to RadioX, the application that transforms X posts into high-quality audio clips. This guide will walk you through all the features and functionality of RadioX.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Searching X Posts](#searching-x-posts)
4. [Creating Audio Clips](#creating-audio-clips)
5. [Managing Audio Library](#managing-audio-library)
6. [Creating and Managing Podcasts](#creating-and-managing-podcasts)
7. [User Profile and Settings](#user-profile-and-settings)
8. [API Usage Monitoring](#api-usage-monitoring)
9. [Troubleshooting](#troubleshooting)

## Getting Started

### Registration and Login

1. **Registration**: Visit the RadioX website and click on "Sign Up" to create a new account.
   - Fill in your name, email address, and password.
   - Click "Sign Up" to create your account.

2. **Login**: Once registered, you can log in using your email and password.
   - Enter your email address and password.
   - Click "Sign In" to access your account.

### Connecting Your X Account

To use RadioX effectively, you need to connect your X account:

1. Go to your Profile page by clicking on your name in the top-right corner and selecting "Profile".
2. In the sidebar, click "Connect X Account".
3. Enter your X username and API credentials (API Key and API Secret).
4. Click "Connect Account" to link your X account to RadioX.

## Dashboard

The Dashboard is your home base in RadioX, providing an overview of your activity and quick access to key features.

### Dashboard Features

- **Usage Statistics**: View your current audio clips count, podcasts count, and API usage.
- **Recent Audio Clips**: See your most recently created audio clips.
- **Quick Actions**: Access common tasks like searching X posts, creating audio clips, and managing podcasts.

## Searching X Posts

RadioX allows you to search for X posts in several ways:

### Search by Hashtag

1. Go to the Search page by clicking "Search" in the navigation menu.
2. Select the "Hashtag" tab.
3. Enter a hashtag (without the # symbol) in the search field.
4. Use filters to refine your search:
   - **Text Only**: Show only posts without images or videos.
   - **Minimum Likes**: Set a minimum number of likes for posts.
   - **Maximum Results**: Limit the number of results.
5. Click "Search" to find posts.

### Search by User

1. On the Search page, select the "User" tab.
2. Enter a X username (without the @ symbol).
3. Apply filters as needed.
4. Click "Search" to find posts from that user.

### Search by URL

1. On the Search page, select the "URL" tab.
2. Paste a X post URL into the search field.
3. Click "Search" to retrieve the post.

### Search by Thread

1. On the Search page, select the "Thread" tab.
2. Paste a X thread URL into the search field.
3. Click "Search" to retrieve the entire thread.

## Creating Audio Clips

You can create audio clips from X posts, threads, or custom text:

### From X Posts

1. After searching for posts, select the ones you want to convert by checking the boxes next to them.
2. Click "Convert Selected" to proceed to the conversion settings.
3. Choose voice settings:
   - **Voice**: Select from various voice options.
   - **Background Music**: Enable/disable and adjust volume.
4. Preview the audio if desired.
5. Click "Create Audio Clip" to generate the audio.

### From X Threads

1. After searching for a thread, click "Convert to Audio".
2. Configure voice settings as above.
3. Click "Create Audio Clip" to generate the audio.

### From Custom Text

1. Go to the Create page by clicking "Create" in the navigation menu.
2. Select the "Custom Text" tab.
3. Enter your text in the provided field.
4. Configure voice settings.
5. Click "Create Audio Clip" to generate the audio.

## Managing Audio Library

The Audio Library is where all your created audio clips are stored:

### Browsing Your Library

1. Go to the Library page by clicking "Library" in the navigation menu.
2. View your audio clips, sorted by creation date (newest first).
3. Use the search bar to find specific clips by title or content.
4. Use filters to sort by duration, creation date, or source type.

### Playing Audio Clips

1. Click the play button on any audio clip to listen to it.
2. Use the audio player controls to pause, adjust volume, or change playback speed.

### Editing Audio Clips

1. Click the "Edit" button (pencil icon) on an audio clip.
2. Update the title, description, or privacy settings.
3. Click "Save Changes" to update the clip.

### Downloading Audio Clips

1. Click the "Download" button (download icon) on an audio clip.
2. The audio file will be downloaded to your device in MP3 format.

### Deleting Audio Clips

1. Click the "Delete" button (trash icon) on an audio clip.
2. Confirm the deletion when prompted.

## Creating and Managing Podcasts

RadioX allows you to organize your audio clips into podcasts:

### Creating a Podcast

1. Go to the Podcasts page by clicking "Podcasts" in the navigation menu.
2. Click "Create New Podcast".
3. Fill in the podcast details:
   - **Title**: Enter a name for your podcast.
   - **Description**: Provide a description of your podcast.
   - **Category**: Select a category that best fits your content.
   - **Language**: Choose the primary language of your podcast.
   - **Author**: Enter the author name (your name or brand).
   - **Email**: Provide a contact email.
   - **Explicit Content**: Toggle if your podcast contains explicit content.
   - **Artwork**: Upload an image (1400x1400px recommended).
4. Click "Create Podcast" to save.

### Adding Episodes

1. On the Podcasts page, click on a podcast to view its details.
2. Click "Add Episode".
3. Select an audio clip from your library to add as an episode.
4. Arrange the episode order if needed.
5. Click "Add" to include the clip as an episode.

### Managing Episodes

1. On the podcast details page, you can:
   - Reorder episodes by dragging them.
   - Remove episodes by clicking the "Remove" button.
   - View episode details by clicking on an episode.

### Publishing Your Podcast

1. On the podcast details page, click "Generate RSS Feed".
2. Copy the RSS feed URL.
3. Submit this URL to podcast directories like Apple Podcasts, Spotify, or Google Podcasts.

## User Profile and Settings

Manage your account settings and preferences:

### Updating Profile Information

1. Go to your Profile page by clicking on your name in the top-right corner and selecting "Profile".
2. Update your name, email, or password.
3. Click "Update Profile" to save changes.

### Adjusting Preferences

1. On the Profile page, scroll to the Preferences section.
2. Customize settings:
   - **Default Voice**: Choose your preferred voice for audio conversion.
   - **Default Background Music Volume**: Set the default volume level.
   - **Notifications**: Enable/disable email notifications.
   - **Theme**: Choose between light, dark, or system default.
3. Click "Save Preferences" to update.

### Managing X Account Connection

1. On the Profile page, you can:
   - Connect a X account if not already connected.
   - Disconnect your current X account.
   - Update your X API credentials.

## API Usage Monitoring

Keep track of your API usage to stay within limits:

### Viewing Usage Statistics

1. Go to the Dashboard to see your current API usage.
2. For detailed statistics, click "View Details" under the API Usage section.

### Understanding Limits

- **Posts Limit**: Maximum number of X posts you can convert per month (500 in Free Edition).
- **Read Requests Limit**: Maximum number of X API read requests per month (100 in Free Edition).

### Receiving Alerts

- You'll receive in-app notifications when you reach 80% of your monthly limit.
- Email alerts are sent if you've enabled notifications in your profile settings.

## Troubleshooting

### Common Issues and Solutions

#### Connection Issues

- **X API Connection Fails**: Verify your API credentials are correct and that your X developer account is in good standing.
- **Audio Doesn't Play**: Check your internet connection and try refreshing the page.

#### Conversion Problems

- **Conversion Takes Too Long**: Large threads or posts with many special characters may take longer to process.
- **Conversion Fails**: Try again with a shorter post or thread, or try using custom text input instead.

#### Podcast Publishing Issues

- **RSS Feed Not Updating**: It may take up to 24 hours for podcast directories to update after changes.
- **Artwork Not Showing**: Ensure your artwork meets the requirements (square image, 1400x1400px recommended).

### Getting Help

If you encounter issues not covered in this guide:

1. Check the FAQ section on our website.
2. Contact support at support@radiox.com.
3. Visit our GitHub repository for technical issues: [RadioX Issues](https://github.com/GEMDevEng/RadioX/issues).
