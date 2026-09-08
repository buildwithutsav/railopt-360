"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 4200);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="railopt-intro">
      <div className="intro-grid" />

      <div className="intro-glow intro-glow-one" />
      <div className="intro-glow intro-glow-two" />

      <div className="intro-content">

        {/* Logo */}
        <div className="railopt-logo-wrapper">
          <div className="railopt-logo">

            <svg
              viewBox="0 0 120 120"
              xmlns="http://www.w3.org/2000/svg"
              className="railopt-logo-svg"
            >
              <circle
                cx="60"
                cy="60"
                r="53"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />

              <path
                d="M40 30H67C83 30 92 39 92 52C92 63 85 71 74 74L94 94H78L60 76H52V94H40V30Z"
                fill="currentColor"
              />

              <path
                d="M52 41V65H66C74 65 79 61 79 53C79 45 74 41 66 41H52Z"
                fill="#070B14"
              />

              <path
                d="M28 99H92"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeLinecap="round"
              />

              <path
                d="M38 93L32 105M50 93L46 105M70 93L74 105M82 93L88 105"
                stroke="#f59e0b"
                strokeWidth="2"
              />
            </svg>

          </div>
        </div>

        {/* Brand */}
        <div className="intro-brand">
          <h1>
            RAIL<span>OPT</span> 360
          </h1>

          <p className="intro-description">
            AI-Powered Railway Maintenance Optimization
          </p>

          <p className="intro-tagline">
            One Corridor. One Intelligent Plan. Maximum Asset Availability.
          </p>
        </div>

        {/* Railway animation */}
        <div className="rail-animation">
          <div className="rail-track">
            <div className="rail-sleeper sleeper-1" />
            <div className="rail-sleeper sleeper-2" />
            <div className="rail-sleeper sleeper-3" />
            <div className="rail-sleeper sleeper-4" />
            <div className="rail-sleeper sleeper-5" />
            <div className="rail-sleeper sleeper-6" />
            <div className="rail-sleeper sleeper-7" />
            <div className="rail-sleeper sleeper-8" />

            <div className="rail-progress" />
          </div>
        </div>

        <div className="intro-status">
          <span className="status-dot" />
          INITIALIZING PLANNING INTELLIGENCE
        </div>

      </div>

      <div className="intro-footer">
        SIH 2026 · PS 26027 · MINISTRY OF RAILWAYS
      </div>
    </main>
  );
}