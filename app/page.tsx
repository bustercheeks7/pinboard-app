// ✅ This must be the very first line
export const dynamic = 'force-dynamic';

import React from 'react';

export default function Page() {
  return <main>Hello world</main>;
}

"use client"

import { PinboardApp } from "@/components/pinboard-app"

export default function Home() {
  return <PinboardApp />
}
