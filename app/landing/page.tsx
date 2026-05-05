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
            Masuk
          </Link>
          <Link
            href="/register"
            className="px-6 py-2 bg-brand-primary text-text-on-dark font-bold rounded-2xl hover:bg-brand-primary-active transition-colors"
          >
            Mulai Sekarang
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl w-full text-center space-y-8">
          <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-text-ink leading-tight">
            Ubah ESG dari{" "}
            <span className="text-brand-accent-amber line-through opacity-70">
              beban biaya
            </span>{" "}
            <br />
            jadi <span className="text-brand-primary">mesin profit.</span>
          </h2>
          <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            Telemetri IoT bertenaga AI yang dibangun buat operasional enterprise. Prediksi tagihan, deteksi anomali, dan ekspor audit karbon sesuai SRUK dalam satu klik.
          </p>
          <div className="flex justify-center gap-6 mt-12">
            <div className="bg-surface-card p-6 border border-surface-hairline rounded-2xl w-64 text-left">
              <Zap className="w-8 h-8 text-brand-accent-amber mb-4" />
              <h3 className="font-bold text-lg mb-2">AI Prediktif</h3>
              <p className="text-sm text-text-muted">
                Simulasi pengurangan operasional dan prediksi tagihan listrik dengan akurasi 97%.
              </p>
            </div>
            <div className="bg-surface-card p-6 border border-surface-hairline rounded-2xl w-64 text-left">
              <Activity className="w-8 h-8 text-brand-accent-teal mb-4" />
              <h3 className="font-bold text-lg mb-2">IoT Real-time</h3>
              <p className="text-sm text-text-muted">
                Integrasi sensor plug-and-play yang langsung terpetakan ke topologi organisasi kamu.
              </p>
            </div>
            <div className="bg-surface-card p-6 border border-surface-hairline rounded-2xl w-64 text-left">
              <Factory className="w-8 h-8 text-brand-primary mb-4" />
              <h3 className="font-bold text-lg mb-2">Bersertifikat SRUK</h3>
              <p className="text-sm text-text-muted">
                Unduh jejak audit lengkap yang siap untuk pengajuan ke Registri Karbon Nasional.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
