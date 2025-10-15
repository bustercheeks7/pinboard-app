# 📌 Pinboard App

A modern, responsive **Pinboard** application built with **Next.js**, **React 19**, **Tailwind CSS v4**, and **Shadcn UI**.  
It’s fully production-ready and deployed on **Vercel**.

---

## 🚀 Tech Stack

### 🧱 Framework
**Next.js 15.2.4** (App Router + React Server Components)

- Uses the new `app/` directory layout (`layout.tsx`, `page.tsx`)
- Built with **React 19** and **TypeScript**
- Supports modern rendering features like **React Server Components (RSC)** and **streaming**

---

### 🎨 UI & Styling
**Shadcn UI + Radix UI + Tailwind CSS 4**

- Accessible, prebuilt UI components via **Shadcn UI**
- Built on **Radix UI** headless primitives
- Styled with **Tailwind CSS v4** using its new PostCSS plugin system
- Uses **default Tailwind themes** — no “new-york” or OKLCH color customizations

---

### 🌗 Theme System (Available but Inactive)

- Integrated with [`next-themes`](https://github.com/pacocoursey/next-themes) for potential light/dark mode support  
- Currently, the app **does not include a theme switcher** — it uses a single visual theme  
- The feature can be easily enabled later if needed

---

### ⚙️ State Management

- Uses **React Hooks** (`useState`, `useEffect`) for component-level state
- No external state management libraries (Redux, Zustand, etc.)
- Keeps the app lightweight and maintainable

---

### 🖱️ Drag & Drop

- Powered by **[@dnd-kit](https://github.com/clauderic/dnd-kit)**
- Enables smooth, touch-friendly drag-and-drop interactions
- Used for reordering items and categories

---

### 🧰 Additional Libraries

| Library | Purpose |
|----------|----------|
| **TypeScript 5** | Type safety across the app |
| **Lucide-React** | Icon set |
| **date-fns** | Date and time utilities |
| **react-hook-form** + **zod** | Form handling and validation |

---

## 🧑‍💻 Project Structure

```
pinboard-app/
├─ app/                → Next.js App Router pages and layouts
├─ components/ui/      → Shadcn UI components
├─ components/         → Custom app components
├─ hooks/              → Reusable React hooks
├─ lib/                → Utility functions
├─ styles/             → Global CSS
└─ public/             → Static assets
```

---

## ⚡ Development Commands

| Command | Description |
|----------|-------------|
| `npm run dev` | Run the app locally in development mode |
| `npm run build` | Build the app for production |
| `npm start` | Start the production build locally |

---

## 🌍 Deployment

Hosted on **[Vercel](https://vercel.com)**.  
Vercel automatically builds and deploys the app on every GitHub commit using:
```bash
npm install
npm run build
npm start
```

---

## ✅ Summary

| Feature | Status | Notes |
|----------|--------|-------|
| App Router + RSC | ✅ | Modern Next.js architecture |
| TypeScript | ✅ | Used throughout |
| Tailwind CSS 4 | ✅ | Default configuration |
| Shadcn UI + Radix UI | ✅ | Actively used |
| Dark Mode | ⚠️ | Supported in code, not implemented in UI |
| localStorage | ⚠️ | Only used internally by `next-themes` (not app data) |
| Drag and Drop | ✅ | Implemented via @dnd-kit |

---

### 🏁 Final Notes

This project reflects a **modern, maintainable frontend stack** with clean architecture, flexible component design, and current-generation React/Next.js tooling.  
The theme system and custom styling can easily be expanded in the future.
