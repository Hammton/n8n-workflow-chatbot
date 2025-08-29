"use client";

import { useState } from "react";
import { Chat } from "@/components/chat";
import { LandingPage } from "@/components/landing-page";
import { ErrorBoundary } from "@/components/error-boundary";

export default function Home() {
  const [showChat, setShowChat] = useState(false);

  return (
    <ErrorBoundary>
      {showChat ? (
        <Chat onBackToLanding={() => setShowChat(false)} />
      ) : (
        <LandingPage onStartChat={() => setShowChat(true)} />
      )}
    </ErrorBoundary>
  );
}
