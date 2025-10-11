# Pinboard Application

## Overview

This is a **Pinboard Application** built with Next.js 14+ that allows users to organize and manage services/links in a visual, customizable dashboard. The application features drag-and-drop functionality, categorization, tagging, ratings, and metadata fetching capabilities. Users can create custom categories with color themes, organize services with visual cards, and export/import their entire pinboard configuration.

The app is designed as a personal dashboard or bookmarking tool where users can:
- Add services/links with automatic metadata fetching
- Organize items into color-coded categories
- Rate and tag services for better organization
- Customize the visual appearance (columns, colors, text styles)
- Import/export configurations as JSON

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 15.5.4 with App Router and React Server Components (RSC)
- Uses the modern App Router pattern with RSC enabled
- Client-side interactivity handled through "use client" directives
- TypeScript for type safety throughout the application
- React 19 for improved performance and features

**UI Component Library**: Shadcn/ui with Radix UI primitives
- Component system based on Radix UI headless components
- Styled with Tailwind CSS using the "new-york" style variant
- Custom theming with CSS variables and OKLCH color space for better color consistency
- Dark mode support built-in

**State Management**: React local state with hooks
- No external state management library
- State managed at component level with useState
- Data persistence through localStorage (implied by import/export features)

**Drag and Drop**: @dnd-kit library
- Handles service reordering within categories
- Category reordering in settings
- Touch-friendly mobile support

### Core Features & Design Patterns

**Service Management**:
- Services contain: name, URL, description, categories (multi-select), flags, tags, ratings per category, display order, and color intensity
- CRUD operations for services with dialog-based forms
- Automatic metadata fetching from URLs (title and description extraction)
- URL validation with HTTPS prompt for plain domain entries

**Category System**:
- Categories have: unique ID, name, display order, optional hue (for color theming), and tags
- Color theming using HSL with configurable hue values (0-360)
- Service cards inherit category colors with adjustable intensity levels (default, lighter, light, bright)
- Categories can be reordered via drag-and-drop

**Customization Options**:
- Adjustable column count for responsive layouts
- Text color customization
- Toggle visibility of descriptions, URLs, tags, and ratings
- Per-service color intensity controls

**Data Persistence**:
- JSON-based export/download functionality
- JSON import with file upload
- All data stored in a structured `PinboardData` interface

### API Routes

**Metadata Fetching** (`/api/fetch-metadata`):
- POST endpoint that fetches and parses HTML from provided URLs
- Extracts title and description from HTML meta tags and title elements
- Handles HTML entity decoding for special characters
- Returns structured metadata for auto-populating service forms


### Styling & Theming

**CSS Architecture**:
- Tailwind CSS v4+ with custom CSS imports
- CSS variables for theme colors using OKLCH color space
- Dark mode with `.dark` class variant
- Custom animation utilities via `tw-animate-css`

**Color System**:
- Dynamic category colors based on HSL hue values
- Four intensity levels for service cards (bright: 50% saturation, light: 40%, lighter: 35%, default: 30%)
- Consistent lightness values for readability across dark backgrounds

**Typography**:
- Geist Sans as primary font
- Geist Mono for monospace elements
- Responsive text sizing and spacing

### External Dependencies

**UI & Components**:
- Radix UI primitives (@radix-ui/*) - Headless accessible components
- Lucide React - Icon library
- cmdk - Command palette component
- Embla Carousel - Carousel functionality
- React Hook Form with Zod resolvers - Form handling and validation
- class-variance-authority & clsx - Dynamic className management

**Drag & Drop**:
- @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities - Drag and drop functionality

**Utilities**:
- date-fns - Date manipulation
- tailwind-merge - Tailwind class merging utility
- next-themes - Theme management (dark/light mode)

**Analytics**:
- @vercel/analytics - Vercel Analytics integration

**Development**:
- Next.js 14+ - React framework with App Router
- TypeScript - Type safety
- Autoprefixer - CSS vendor prefixing

### Build & Deployment

**Environment Configuration**:
- Node options set to 4GB memory allocation for build and dev (`--max_old_space_size=4096`)
- Development server runs on port 5000, accessible on all network interfaces (0.0.0.0)
- Production build configured for Replit autoscale deployment
- First-time compilation takes approximately 125 seconds (normal Next.js 15 behavior with 821 modules)

**Project Structure**:
- `/app` - Next.js App Router pages and API routes
- `/components` - React components (feature components and UI primitives)
- `/hooks` - Custom React hooks
- `/lib` - Utility functions
- `/styles` - Global styles (duplicate globals.css in both `/app` and `/styles`)
