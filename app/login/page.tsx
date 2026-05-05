"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to login with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-surface-card border border-surface-hairline rounded-[32px] p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif italic text-brand-primary mb-2">
            EcoMeter.
          </h1>
          <p className="text-sm text-text-muted">
            Sign in to your operational dashboard.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted-soft mb-2">
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-surface-soft border border-surface-hairline rounded-xl text-sm focus:outline-none focus:border-brand-primary transition-colors"
              placeholder="name@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted-soft mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-surface-soft border border-surface-hairline rounded-xl text-sm focus:outline-none focus:border-brand-primary transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-text-on-dark px-4 py-3 rounded-xl font-bold tracking-wide hover:bg-brand-primary-active transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            SIGN IN
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px bg-surface-hairline flex-1"></div>
          <span className="text-xs text-text-muted uppercase">or</span>
          <div className="h-px bg-surface-hairline flex-1"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-gray-900 border border-gray-200 px-4 py-3 rounded-xl font-bold tracking-wide hover:bg-gray-50 transition-colors disabled:opacity-70 flex justify-center items-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-sm text-text-muted mt-8">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-brand-primary font-bold hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
