"use client";

import Link from "next/link";
import { Activity, Zap, Factory } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col font-sans">
      <header className="px-8 py-6 flex justify-between items-center border-b border-surface-hairline bg-surface-card">
        <div>
          <h1 className="text-2xl font-serif italic text-brand-primary">
            EcoMeter.
          </h1>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-6 py-2 text-text-ink font-bold hover:bg-surface-soft rounded-2xl transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-2 bg-brand-primary text-text-on-dark font-bold rounded-2xl hover:bg-brand-primary-active transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl w-full text-center space-y-8">
          <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-text-ink leading-tight">
            Transform ESG from a{" "}
            <span className="text-brand-accent-amber line-through opacity-70">
              cost center
            </span>{" "}
            <br />
            to a <span className="text-brand-primary">profit driver.</span>
          </h2>
          <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            AI-powered IoT telemetry built for enterprise operations. Predict
            bills, detect anomalies, and export SRUK-compliant carbon audits in
            one click.
          </p>
          <div className="flex justify-center gap-6 mt-12">
            <div className="bg-surface-card p-6 border border-surface-hairline rounded-3xl w-64 text-left">
              <Zap className="w-8 h-8 text-brand-accent-amber mb-4" />
              <h3 className="font-bold text-lg mb-2">Predictive AI</h3>
              <p className="text-sm text-text-muted">
                Simulate operational cuts and forecast electricity bills with
                97% accuracy.
              </p>
            </div>
            <div className="bg-surface-card p-6 border border-surface-hairline rounded-3xl w-64 text-left">
              <Activity className="w-8 h-8 text-brand-accent-teal mb-4" />
              <h3 className="font-bold text-lg mb-2">Real-time IoT</h3>
              <p className="text-sm text-text-muted">
                Plug-and-play sensor integration mapped directly to your
                organizational topology.
              </p>
            </div>
            <div className="bg-surface-card p-6 border border-surface-hairline rounded-3xl w-64 text-left">
              <Factory className="w-8 h-8 text-brand-primary mb-4" />
              <h3 className="font-bold text-lg mb-2">SRUK Certified</h3>
              <p className="text-sm text-text-muted">
                Download complete audit trails ready for National Carbon
                Registry submission.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
