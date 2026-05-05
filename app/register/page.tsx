"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useNotification } from "@/components/NotificationProvider";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addNotification } = useNotification();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        role: "admin", 
        createdAt: new Date().toISOString()
      });
      addNotification("Akun berhasil dibuat. Selamat datang di EcoMeter!", "success");
      router.push("/");
    } catch (err: any) {
      addNotification(err.message || "Gagal mendaftar", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await setDoc(doc(db, "users", result.user.uid), {
        name: result.user.displayName,
        email: result.user.email,
        role: "admin",
        createdAt: new Date().toISOString()
      }, { merge: true });
      addNotification("Registrasi Google selesai otomatis.", "success");
      router.push("/");
    } catch (err: any) {
      addNotification(err.message || "Gagal mendaftar dengan Google", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-surface-canvas"></div>

      <div className="w-full max-w-md bg-surface-dark-elevated border border-surface-hairline/20 rounded-2xl p-8 relative z-10 text-white">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold italic mb-2">Buat Akun</h1>
          <p className="text-sm text-text-on-dark-soft tracking-wide">Mulai kelola portofolio energi kamu sekarang.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary transition-colors placeholder:text-text-on-dark-soft/50"
              placeholder="Budi Santoso"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">Alamat Email</label>
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
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">Kata Sandi</label>
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
            {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Daftar"}
          </button>
        </form>

        <div className="my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-hairline/10"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
            <span className="bg-surface-dark-elevated px-2 text-text-on-dark-soft">atau lanjutkan dengan</span>
          </div>
        </div>

        <button
          onClick={handleGoogleRegister}
          type="button"
          disabled={loading}
          className="w-full bg-white text-black px-4 py-3 rounded-xl text-sm font-bold tracking-wide hover:bg-gray-100 transition-colors flex justify-center items-center"
        >
          Google
        </button>

        <p className="mt-6 text-center text-sm text-text-on-dark-soft">
          Sudah punya akun? <Link href="/login" className="text-brand-accent-teal hover:underline font-medium">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
