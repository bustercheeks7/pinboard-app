# Pinboard App

A customizable service organization and bookmarking application that helps you manage and categorize your favorite web services, tools, and resources with visual organization and flexible filtering.

## Features

### Service Management
- **Add & organize services** - Save web services with names, URLs, descriptions, and metadata
- **Multi-category support** - Assign services to multiple categories for flexible organization
- **Custom flags** - Mark services with custom flags (e.g., "paid", "untested", "deprecated")
- **Tagging system** - Add general tags that appear across all categories, plus category-specific tags
- **Rating system** - Rate services per category (1-5 stars) to track your preferences
- **Visual customization** - Adjust card background intensity for each service

### Category Organization
- **Custom categories** - Create unlimited categories to organize your services
- **Category tagging** - Add tags to categories for better organization
- **Drag & drop reordering** - Rearrange both services and categories with intuitive drag-and-drop
- **Color coding** - Each category gets a unique hue for visual distinction
- **Collapsible sections** - Expand/collapse categories to focus on what matters

### User Interface
- **Responsive layout** - Works seamlessly on desktop and mobile devices
- **Column control** - Switch between 1, 2, or 3 column layouts
- **Customizable text colors** - Choose from multiple text color options for better readability
- **Toggle visibility** - Show/hide descriptions, tags, ratings, and URLs as needed
- **Dark theme** - Clean, modern dark interface

### Data Management
- **Local storage** - All data is saved in your browser's localStorage
- **Export/Import** - Download your pinboard as JSON or import from a file
- **Auto-fetch metadata** - Automatically retrieve titles and descriptions from URLs
- **Persistent settings** - Your layout preferences are remembered across sessions

### Link Handling
- **Click to open** - Left-click any service card to open its URL in a new tab
- **Middle-click support** - Use middle mouse button to open links in background tabs
- **External link indicators** - Visual cues show when you're linking to external services

## Tech Stack

- **Next.js 15.2.4** - React framework with App Router
- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Shadcn UI** - Accessible component library built on Radix UI
- **@dnd-kit** - Smooth drag-and-drop interactions
- **next-themes** - Theme management system

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app will be available at `http://localhost:3000`

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── api/fetch-metadata/      # Metadata fetching API
├── components/
│   ├── pinboard-app.tsx         # Main application component
│   ├── category-section.tsx     # Category display & management
│   ├── service-card.tsx         # Individual service cards
│   ├── add-service-dialog.tsx   # Add new service dialog
│   ├── edit-category-dialog.tsx # Edit category dialog
│   └── ui/                      # Shadcn UI components
├── hooks/                       # Custom React hooks
├── lib/                         # Utility functions
└── public/                      # Static assets
```

## Usage

### Adding a Service
1. Click "Add Service" button
2. Enter the service URL (metadata will auto-fetch)
3. Assign to one or more categories
4. Optionally add flags, tags, ratings, and description
5. Click "Add Service"

### Organizing Services
- **Reorder services** - Enable drag & drop mode and drag cards within categories
- **Reorder categories** - Drag category headers to change their order
- **Edit services** - Click the edit icon on any service card
- **Delete services** - Use the delete button in the edit dialog

### Customizing Your View
- **Change layout** - Use the columns selector (1-3 columns)
- **Adjust colors** - Click the palette icon to choose text colors
- **Toggle elements** - Use the settings menu to show/hide descriptions, tags, ratings, or URLs
- **Edit title** - Click the edit icon next to the pinboard title

### Managing Data
- **Export** - Click "Export JSON" to download your pinboard
- **Import** - Click "Import JSON" to load a previously exported pinboard
- **Category management** - Click "Edit Categories" to manage category tags and settings

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- localStorage API
- fetch API

## License

This project is open source and available for personal and commercial use.
