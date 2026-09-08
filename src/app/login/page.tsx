"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please enter username and password.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="railopt-login-page">
      <div className="login-grid" />

      <div className="login-shell">
        <section className="login-brand-panel">
          <div className="login-brand-badge">
            RAILOPT 360
          </div>

          <h1>
            Intelligent Railway
            <br />
            Maintenance Planning
          </h1>

          <p>
            Integrated decision-support for maintenance prioritization,
            opportunity discovery, block optimization and operational planning.
          </p>

          <div className="login-system-flow">
            <span>PRIORITIZE</span>
            <span>DISCOVER</span>
            <span>OPTIMIZE</span>
            <span>VALIDATE</span>
          </div>

          <div className="login-prototype-note">
            SIH 2026 · PS 26027 · Ministry of Railways
          </div>
        </section>

        <section className="login-card">
          <div className="login-card-header">
            <p>OPERATIONS ACCESS</p>

            <h2>Sign in to RAILOPT 360</h2>

            <span>
              Access the integrated maintenance planning workspace.
            </span>
          </div>

          <form onSubmit={handleLogin}>
            <label>
              USER ID
              <input
                type="text"
                placeholder="Enter user ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>

            <label>
              PASSWORD
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <div className="login-meta">
              <span>
                <span className="login-status-dot" />
                Planning System Online
              </span>

              <span>Prototype Access</span>
            </div>

            <button type="submit" className="login-button">
              ENTER COMMAND CENTER
            </button>
          </form>

          <div className="login-footer-note">
            Decision-support prototype · Not connected to live railway systems
          </div>
        </section>
      </div>
    </main>
  );
}