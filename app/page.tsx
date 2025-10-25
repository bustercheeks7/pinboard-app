"use client"; // must be first

// Force dynamic rendering to bypass prerender bug
export const dynamic = "force-dynamic";

import { PinboardApp } from "@/components/pinboard-app";

export default function Home() {
  return <PinboardApp />;
}
