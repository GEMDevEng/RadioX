# Frontend Guidelines for RadioX

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive guide for developing and maintaining the frontend of RadioX, a web application that converts X posts into audio clips for podcast distribution. The guidelines ensure consistency, accessibility, performance, and alignment with the product’s requirements, particularly within the constraints of the X API Free Tier (500 posts/month, 100 read requests/month).

### 1.2 Overview
RadioX Free Edition is a lightweight web application designed to make social media content more accessible and engaging by converting X posts into professional audio clips using Google Cloud Text-to-Speech (TTS). Key features include:
- Converting up to 500 posts per month into audio.
- High-quality TTS with voice and background music selection.
- RSS feed generation for podcast distribution.
- A responsive, WCAG-compliant web interface built with React and Tailwind CSS.

The target audience includes independent content creators, accessibility advocates, small businesses, and niche content communities, typically aged 25-45, tech-savvy but not technical developers, with limited resources.

### 1.3 Scope
These guidelines cover:
- Project structure and naming conventions.
- Component development and state management.
- Styling with Tailwind CSS.
- Accessibility and WCAG compliance.
- Performance optimization.
- Routing, forms, API integration, testing, and deployment.
- Specific screen implementations based on the product’s requirements.

## 2. Project Structure

### 2.1 Folder Organization
The project follows a modular structure to enhance maintainability:
- `src/`
  - `components/` - Reusable UI components (e.g., `Button`, `Card`, `SearchBar`).
  - `pages/` - Screen-specific components (e.g., `LoginPage`, `DashboardPage`).
  - `hooks/` - Custom React hooks (e.g., `useApi`, `useAudioPlayer`).
  - `contexts/` - Global state management (e.g., `AuthContext`, `ApiUsageContext`).
  - `services/` - API clients and utilities (e.g., `XApiService`, `TtsService`).
  - `styles/` - Global styles and Tailwind configuration.
  - `assets/` - Images, fonts, and static assets.
  - `utils/` - Helper functions (e.g., `formatDate`, `validateForm`).

### 2.2 File Naming Conventions
- **Files**: Use kebab-case (e.g., `login-page.js`).
- **Components**: Use PascalCase (e.g., `LoginPage`).
- **Hooks and Utilities**: Use descriptive names (e.g., `useApiRequest`, `formatAudioDuration`).

## 3. Component Development

### 3.1 Component Types
Components are organized using the Atomic Design methodology:
- **Atoms**: Basic UI elements (e.g., `Button`, `Input`, `Label`).
- **Molecules**: Groups of atoms (e.g., `FormGroup`, `PostCard`).
- **Organisms**: Groups of molecules (e.g., `SearchPanel`, `AudioControls`).
- **Templates**: Layouts using organisms (e.g., `PageLayout`).
- **Pages**: Screen-specific components (e.g., `DashboardPage`).

### 3.2 State Management
- **Local State**: Use `useState` for component-specific data.
- **Global State**: Use React Context API for shared state (e.g., user authentication, API usage).
- **Optimization**: Use `useMemo` and `useCallback` to prevent unnecessary re-renders.

### 3.3 Reusability and Composability
- Design components to be reusable across screens.
- Use props to customize behavior and appearance.
- Avoid hardcoding styles or logic within components.

### 3.4 Example Component
```jsx
const Button = ({ children, variant = 'primary', onClick }) => {
  return (
    <button
      className={`px-4 py-2 rounded ${
        variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

## 4. Styling with Tailwind CSS

### 4.1 Configuration
- Customize the Tailwind configuration (`tailwind.config.js`) to include necessary components, colors, and typography.
- Use `purgeCSS` to remove unused styles in production builds.
- Define a consistent color palette and typography (e.g., primary colors, font sizes).

### 4.2 Usage
- **Utility-First**: Apply Tailwind utility classes directly in JSX for rapid styling.
- **Custom Components**: Create reusable components for complex styles (e.g., `Button`, `Card`).
- **Responsiveness**: Use responsive prefixes (e.g., `sm:`, `md:`) to adapt to different screen sizes.
- **Theming**: Implement light/dark mode using the `dark:` variant.

### 4.3 Example
```jsx
<div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-100 dark:bg-gray-800">
  <Button variant="primary">Convert Audio</Button>
  <Button variant="secondary">Cancel</Button>
</div>
```

## 5. Accessibility

### 5.1 WCAG Compliance
- Use semantic HTML elements (e.g., `<button>`, `<nav>`, `<main>`).
- Ensure color contrast meets WCAG 2.1 Level AA (minimum 4.5:1 for text).
- Provide alternative text for images and icons.
- Ensure all functionality is accessible via keyboard.

### 5.2 ARIA Attributes
- Use ARIA roles and properties for dynamic content (e.g., `role="alert"` for notifications).
- Ensure screen readers can interpret the UI correctly.

### 5.3 Keyboard Navigation
- Test that all interactive elements are focusable and operable via keyboard.
- Manage focus for modals and dynamic content (e.g., focus on the first input when a modal opens).

## 6. Performance Optimization

### 6.1 Code Splitting
- Use `React.lazy` and `Suspense` for lazy loading components.
- Split code into chunks based on routes (e.g., separate bundles for login and dashboard).

### 6.2 Image Optimization
- Use optimized formats (e.g., WebP, JPEG).
- Implement lazy loading for images below the fold.

### 6.3 Minimize Re-renders
- Use `React.memo` for pure components.
- Optimize state updates with `useMemo` and `useCallback`.

### 6.4 API Usage
- Implement caching for API responses to reduce redundant requests.
- Use pagination or lazy loading for large datasets (e.g., post lists).

## 7. Routing and Navigation

### 7.1 React Router
- Set up routes for each screen (e.g., `/login`, `/dashboard`, `/search`).
- Use protected routes for authenticated users.

### 7.2 Navigation
- Implement a consistent navigation menu (e.g., sidebar on desktop, hamburger menu on mobile).
- Highlight active links for better user orientation.

### 7.3 Example
```jsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  </BrowserRouter>
);
```

## 8. Forms and Validation

### 8.1 Form Handling
- Use Formik or React Hook Form for managing form state.
- Implement validation using Yup or similar.

### 8.2 Error Handling
- Display error messages close to relevant input fields.
- Provide user-friendly feedback for submission errors.

### 8.3 Example
```jsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input {...register('email')} className="border p-2 w-full" />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <input type="password" {...register('password')} className="border p-2 w-full" />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
      </div>
      <Button type="submit">Login</Button>
    </form>
  );
};
```

## 9. API Integration

### 9.1 API Client
- Use Axios or Fetch for API requests.
- Set up interceptors for authentication (e.g., adding JWT tokens) and error handling.

### 9.2 State Management
- Use context or Redux for managing API data globally.
- Handle loading states and errors in the UI (e.g., spinners, error messages).

### 9.3 Example
```jsx
import axios from 'axios';
import { useState, useEffect } from 'react';

const useApiRequest = (endpoint) => {
  const [data, setData] = use AscertainXApiRequest = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(endpoint);
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};
```

## 10. Testing

### 10.1 Unit Testing
- Test components in isolation using Jest and React Testing Library.
- Mock dependencies and API calls.

### 10.2 Integration Testing
- Test component interactions (e.g., form submission with validation).

### 10.3 End-to-End Testing
- Use Cypress for testing full application flows (e.g., login, search, audio conversion).

### 10.4 Example
```jsx
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('renders button with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## 11. Deployment

### 11.1 Build Process
- Use Create React App or similar for building the production bundle.
- Minify and compress assets for faster loading.

### 11.2 Environment Variables
- Use `.env` files for configuration (e.g., API keys, base URLs).
- Secure sensitive data using environment variables.

### 11.3 CI/CD
- Set up pipelines for automated testing and deployment (e.g., GitHub Actions).

## 12. Specific Screen Guidelines

The following sections outline the UI components and design considerations for each screen, based on the product requirements.

### 12.1 Login/Registration Screen
- **Description**: A simple, clean form for user authentication.
- **Components**:
  - `LoginForm`
  - `RegistrationForm`
  - `OAuthButton` (optional)
- **Notes**:
  - Use semantic HTML for form elements.
  - Implement form validation.
  - Include a “Forgot Password” link.

### 12.2 Dashboard Screen
- **Description**: Main hub displaying usage stats, recent audio clips, and quick search.
- **Components**:
  - `UsageStats`
  - `RecentAudioList`
  - `FavoriteHashtags`
  - `QuickSearchBar`
- **Notes**:
  - Highlight key metrics (e.g., API usage).
  - Ensure quick access to common actions.

### 12.3 Search Screen
- **Description**: Allows hashtag-based post searches.
- **Components**:
  - `SearchBar`
  - `PostList`
  - `PostItem`
  - `FilterControls`
- **Notes**:
  - Implement pagination or lazy loading for post lists.
  - Provide filters for post type, popularity, and date range.

### 12.4 Audio Customization Screen
- **Description**: Customizes audio conversion settings.
- **Components**:
  - `VoiceSelector`
  - `MusicLibrary`
  - `AudioSettingsPanel`
  - `GenerateButton`
- **Notes**:
  - Provide previews for voice and music selections.
  - Display estimated processing time.

### 12.5 Audio Library Screen
- **Description**: Manages generated audio clips.
- **Components**:
  - `AudioList`
  - `AudioItem`
  - `AudioPlayer`
  - `DownloadButton`
- **Notes**:
  - Allow sorting and filtering of audio clips.
  - Ensure audio playback is accessible and keyboard-friendly.

### 12.6 Podcast Management Screen
- **Description**: Handles podcast creation and RSS feed generation.
- **Components**:
  - `PodcastDetailsForm`
  - `EpisodeList`
  - `RssFeedPreview`
- **Notes**:
  - Provide drag-and-drop for reordering episodes.
  - Display RSS feed URL with a copy button.

### 12.7 Settings Screen
- **Description**: Manages user account and preferences.
- **Components**:
  - `AccountInfo`
  - `ApiConnectionStatus`
  - `NotificationPreferences`
- **Notes**:
  - Include options for default audio settings and theme selection.

### 12.8 Usage Monitor Screen
- **Description**: Tracks API usage and provides alerts.
- **Components**:
  - `UsageChart`
  - `RequestBreakdown`
  - `AlertBanner`
- **Notes**:
  - Use visual indicators for usage thresholds.
  - Include upgrade options for paid tiers.

## 13. Additional Guidelines

### 13.1 Common UI Patterns
| Pattern | Description | Notes |
|---------|-------------|-------|
| Buttons | Primary, secondary, destructive variants | Use consistent styles (e.g., `bg-blue-500` for primary). |
| Forms | Input fields, labels, error messages | Place error messages near inputs. |
| Modals | Pop-up dialogs | Ensure accessibility and focus management. |
| Loading States | Spinners, skeleton screens | Use for API calls and audio generation. |
| Error Messages | User-friendly error displays | Include retry options where applicable. |

### 13.2 Audio-Specific Guidelines
- **Audio Player**: Ensure controls (play, pause, volume) are accessible and keyboard-friendly.
- **Autoplay Policies**: Respect browser restrictions; require user interaction to start audio.
- **Transcripts**: Consider displaying original post text alongside audio for accessibility.

### 13.3 Responsive Design
- Use Tailwind’s responsive classes to adapt layouts (e.g., grid on desktop, list on mobile).
- Test on various screen sizes to ensure usability.

### 13.4 Security
- Handle JWT tokens securely (e.g., HTTP-only cookies).
- Sanitize user-generated content to prevent XSS attacks.
- Use React’s built-in escaping for JSX output.

### 13.5 Best Practices for React
- Use functional components with hooks.
- Avoid class components.
- Use `key` props correctly in lists.
- Handle side effects with `useEffect`.
- Write clean, readable code with proper naming and indentation.

### 13.6 Version Control and Collaboration
- Use Git for version control.
- Follow branching strategies (e.g., feature branches, pull requests).
- Write clear commit messages.
- Implement code review processes.

## 14. Recommendations
- **Component Library**: Consider using Storybook to document and develop reusable components.
- **Internationalization**: Plan for future multi-language support, though currently English-focused.
- **Upsell Components**: Design modals or banners to encourage upgrades when API limits are reached.