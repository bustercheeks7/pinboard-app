📌 Pinboard App

A modern, responsive pinboard application built with Next.js, React 19, Tailwind CSS v4, and Shadcn UI.
It’s fully production-ready and deployed on Vercel.

🚀 Tech Stack
🧱 Framework

Next.js 15.2.4 (App Router + React Server Components)

Uses the new app/ directory layout (layout.tsx, page.tsx)

Built with React 19 and TypeScript

Supports modern rendering patterns like server components and streaming

🎨 UI and Styling

Shadcn UI + Radix UI primitives + Tailwind CSS 4

Accessible, prebuilt UI components using Shadcn UI

Built on Radix UI headless primitives

Styled with Tailwind CSS v4 through the new PostCSS plugin system

Uses Tailwind’s default theme — no custom colors or OKLCH variants

🌗 Theme System (Available but Not Active)

next-themes integration is present in the codebase,
but the app currently does not include any light/dark theme toggle or mode switching.

next-themes is ready to use if you add a switcher later

For now, the app uses a single visual theme

⚙️ State Management

React Hooks

No external state-management libraries

Components use local state (useState, useEffect)

Keeps the app lightweight and simple

🖱️ Drag and Drop

@dnd-kit

Used for interactive drag-and-drop functionality

Supports reordering items and categories

Works on desktop and mobile devices

🧰 Other Libraries

TypeScript 5 – adds static type checking

Lucide-React – icons

date-fns – date/time utilities

react-hook-form + zod – form handling and validation

🧑‍💻 Project Structure
