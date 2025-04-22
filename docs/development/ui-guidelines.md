# UI Guidelines for RadioX

## Design System

RadioX follows a modern, clean design system with a focus on usability and accessibility. The application supports both light and dark modes to accommodate user preferences and reduce eye strain.

### Color Palette

#### Primary Colors
- Primary: Indigo (#4F46E5)
- Secondary: Pink (#EC4899)
- Accent: Emerald (#10B981)

#### Dark Mode Colors
- Background: Dark Gray (#111827)
- Card Background: Slate Gray (#1F2937)
- Text: White (#FFFFFF) and Light Gray (#D1D5DB)
- Borders: Dark Gray (#374151)

#### Light Mode Colors
- Background: Light Gray (#F9FAFB)
- Card Background: White (#FFFFFF)
- Text: Dark Gray (#111827) and Gray (#4B5563)
- Borders: Light Gray (#E5E7EB)

### Typography

- Font Family: Inter, system UI fonts
- Headings: 
  - H1: 2.25rem (36px), font-weight: 700
  - H2: 1.875rem (30px), font-weight: 700
  - H3: 1.5rem (24px), font-weight: 600
  - H4: 1.25rem (20px), font-weight: 600
- Body: 1rem (16px), font-weight: 400
- Small: 0.875rem (14px), font-weight: 400

### Components

#### Cards
Cards are used to group related content and provide visual separation. They have rounded corners, subtle shadows, and proper padding.

```jsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 dark:text-gray-200 dark:border dark:border-gray-700">
  {/* Card content */}
</div>
```

#### Buttons

Primary Button:
```jsx
<button className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
  Button Text
</button>
```

Secondary Button:
```jsx
<button className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
  Button Text
</button>
```

#### Navigation

The navigation bar uses a dark background with light text. Active items are highlighted with a darker background.

```jsx
<nav className="bg-gray-900 text-white shadow-lg">
  {/* Navigation content */}
</nav>
```

#### Forms

Form inputs have consistent styling with proper focus states and error handling.

```jsx
<input 
  type="text" 
  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
/>
```

## Dark Mode Implementation

RadioX implements dark mode using Tailwind CSS's dark mode feature. The application detects the user's system preference and also allows manual toggling.

### How to Use Dark Mode Classes

1. Add the `dark:` prefix to any Tailwind class to apply it only in dark mode:

```jsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Dark mode compatible content
</div>
```

2. The dark mode toggle in the navbar allows users to switch between modes:

```jsx
const toggleDarkMode = () => {
  setDarkMode(!darkMode);
  localStorage.setItem('darkMode', (!darkMode).toString());
  
  if (!darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
```

## Accessibility Guidelines

- Ensure sufficient color contrast (WCAG AA compliance)
- Provide text alternatives for non-text content
- Make all functionality available from a keyboard
- Use semantic HTML elements
- Include proper ARIA attributes when necessary
- Ensure focus states are visible
- Test with screen readers

## Responsive Design

RadioX is designed to work on all device sizes, from mobile phones to desktop computers. The application uses a mobile-first approach with responsive breakpoints:

- Small (sm): 640px
- Medium (md): 768px
- Large (lg): 1024px
- Extra Large (xl): 1280px
- 2XL (2xl): 1536px

Example of responsive design:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Responsive grid content */}
</div>
```

## Icons

RadioX uses React Icons (specifically Feather Icons) for a consistent and modern icon set. Icons should be used with appropriate text labels or aria-labels for accessibility.

```jsx
import { FiHome, FiSearch, FiSettings } from 'react-icons/fi';

// Usage
<FiHome className="w-5 h-5" />
```

## Animation and Transitions

Use subtle animations and transitions to enhance the user experience without being distracting.

```jsx
<button className="transition-colors duration-200 ease-in-out">
  Smooth transition
</button>
```

## Best Practices

1. Maintain consistency across the application
2. Prioritize readability and usability
3. Design for accessibility from the start
4. Test on multiple devices and browsers
5. Use responsive design principles
6. Keep performance in mind (minimize large images, animations, etc.)
7. Follow the established component patterns
8. Document any new UI patterns or components
