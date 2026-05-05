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
import { useNotification } from "@/components/NotificationProvider";
import { logActivity } from "@/lib/activityLog";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addNotification } = useNotification();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await logActivity(cred.user.uid, "login", `Email login: ${email}`, "success", { method: "email" });
      addNotification("Login successful. Initializing workspace.", "success");
      router.push("/");
    } catch (err: any) {
      addNotification(err.message || "Failed to login", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const cred = await signInWithPopup(auth, provider);
      await logActivity(cred.user.uid, "login", `Google login: ${cred.user.email}`, "success", { method: "google" });
      addNotification("Google Login successful.", "success");
      router.push("/");
    } catch (err: any) {
      addNotification(err.message || "Failed to login", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-surface-canvas overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-brand-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-brand-accent-teal/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="w-full max-w-md bg-surface-dark-elevated border border-surface-hairline/20 rounded-[32px] p-8 shadow-2xl relative z-10 text-white">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold italic mb-2">
            EcoMeter
          </h1>
          <p className="text-sm text-text-on-dark-soft tracking-wide">
            Sign in to access your energy portfolio.
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary transition-colors placeholder:text-text-on-dark-soft/50"
              placeholder="admin@ecometer.io"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary transition-colors placeholder:text-text-on-dark-soft/50"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-text-on-dark px-4 py-3 rounded-xl text-sm font-bold tracking-wide hover:bg-brand-primary-active transition-colors mt-2 flex justify-center items-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-hairline/10"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
            <span className="bg-surface-dark-elevated px-2 text-text-on-dark-soft">
              or continue with
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full bg-white text-black px-4 py-3 rounded-xl text-sm font-bold tracking-wide hover:bg-gray-100 transition-colors flex justify-center items-center"
        >
          Google
        </button>

        <p className="mt-6 text-center text-sm text-text-on-dark-soft">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-brand-accent-teal hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
