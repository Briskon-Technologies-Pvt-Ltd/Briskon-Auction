"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedMode, setSelectedMode] = useState<
    "forward" | "reverse" | "marketplace"
  >("forward");

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectParam = searchParams.get("redirect");
      if (redirectParam) {
        router.push(redirectParam);
        return;
      }
      // Redirect based on user role
      switch (user.role) {
        case "buyer":
          router.push("/dashboard/buyer");
          break;
        case "seller":
          router.push("/dashboard/seller");
          break;
        case "both":
          router.push("/dashboard");
          break;
        default:
          router.push("/");
      }
    }
  }, [isAuthenticated, user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await login(email, password, selectedMode);

    if (!result.success) {
      setError(result.error || "Login failed");
    }
  };

  const loading = isLoading;
  const project = selectedMode;
  const setProject = (mode: "forward" | "reverse" | "marketplace") =>
    setSelectedMode(mode);
  const handleLogin = handleSubmit;

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center text-gray-900">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center py-4 px-6 sm:py-6 sm:px-10 md:py-8 md:px-16 lg:py-12 lg:px-24 bg-slate-950 overflow-hidden">
      {/* Global Backdrop Layer - Blurred background spanning the whole screen */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/ice.jpg"
          alt="App Background"
          className="w-full h-full object-cover opacity-60 grayscale-[0.1]"
        />
        <div className="absolute inset-0 bg-[#121951]/80" />
      </div>

      {/* Main Login Card - Centered Split Layout */}
      <div className="relative z-10 w-full max-w-[1440px] max-h-[calc(100vh-2rem)] bg-white rounded-[2rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden border border-white/10 animate-in fade-in zoom-in duration-500">
        {/* Left Section - Image & Branding (Matching the reference image style) */}
        <div className="w-full md:w-1/2 relative min-h-[240px] md:min-h-[500px] overflow-hidden flex flex-col justify-end p-6 lg:p-12">
          {/* Inner Image Layer (Unblurred mountain) */}
          <div className="absolute inset-0 z-0">
            <img
              src="/ice.jpg"
              alt="Design Detail"
              className="w-full h-full object-cover"
            />
            {/* Dark Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 via-transparent to-transparent" />
          </div>

          {/* Branding Content pinned to bottom-left */}
          <div className="relative z-10 space-y-4">
            <h1 className="text-3xl md:text-4xl 2xl:text-5xl text-[#12195a] font-normal tracking-[0.2em] drop-shadow-2xl">
              A-Z AUCTION
            </h1>
            <div className="flex flex-wrap gap-2 pt-4">
              <div
                className={`px-4 py-2 rounded-full text-[10px] font-normal backdrop-blur-md border flex items-center gap-2 transition-all duration-300 ${
                  selectedMode === "forward"
                    ? "bg-[#313eba] text-white border-[#313eba]"
                    : "bg-white text-[#12195a] border-gray-500"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    selectedMode === "forward" ? "bg-white" : "bg-[#12195a]"
                  }`}
                />{" "}
                FORWARD
              </div>

              <div
                className={`px-4 py-2 rounded-full text-[10px] font-normal backdrop-blur-md border flex items-center gap-2 transition-all duration-300 ${
                  selectedMode === "reverse"
                    ? "bg-[#313eba] text-white border-[#313eba]"
                    : "bg-white text-[#12195a] border-gray-500"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    selectedMode === "reverse" ? "bg-white" : "bg-[#12195a]"
                  }`}
                />{" "}
                REVERSE
              </div>
              <div
                className={`px-4 py-2 rounded-full text-[10px] font-normal backdrop-blur-md border flex items-center gap-2 transition-all duration-300 ${
                  selectedMode === "marketplace"
                    ? "bg-[#313eba] text-white border-[#313eba]"
                    : "bg-white text-[#12195a] border-gray-500"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    selectedMode === "marketplace" ? "bg-white" : "bg-[#12195a]"
                  }`}
                />{" "}
                MARKETPLACE
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Authentication Form */}
        <div className="flex-1 bg-white p-6 lg:p-14 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            {/* Header Area with Briskon Logo */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Image
                  src="/briskon-auction-logo.svg"
                  alt="Briskon Logo"
                  width={150}
                  height={44}
                  className="h-9 w-auto"
                />
                {/* <span className="px-2.5 py-1 rounded text-[12px] font-normal bg-[#313eba] text-white tracking-[0.15em] uppercase shadow-sm">
                  Auction
                </span> */}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                Enter your email and password to access your account.
              </p>
            </div>

            {/* Mode Selection Tabs (Unified with the form) */}
            <div className="flex gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-100">
              <button
                onClick={() => setProject("forward")}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                  project === "forward"
                    ? "bg-white shadow-[0_2px_8px_rgba(37,99,235,0.1)] text-[#313eba]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Forward
              </button>
              <button
                onClick={() => setProject("reverse")}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                  project === "reverse"
                    ? "bg-white shadow-[0_2px_8px_rgba(37,99,235,0.1)] text-[#313eba]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Reverse
              </button>
              <button
                onClick={() => setProject("marketplace")}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                  project === "marketplace"
                    ? "bg-white shadow-[0_2px_8px_rgba(37,99,235,0.1)] text-[#313eba]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Marketplace
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                {/* Email address field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black tracking-widest ml-1">
                    Email address
                  </label>

                  <div className="group relative">
                    {/* Black outline */}
                    <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-black" />

                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors" />

                    <input
                      type="email"
                      required
                      className="
        w-full pl-12 pr-4 py-4
        bg-white
        rounded-[2rem]
        outline-none
        appearance-none
        border-none
        focus:outline-none
        text-sm font-medium
      "
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                {/* Password field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black tracking-widest ml-1">
                    Password
                  </label>
                  <div className="group relative">
                    {/* Black outline */}
                    <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-black" />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className=" w-full pl-12 pr-4 py-4
        bg-white
        rounded-[2rem]
        outline-none
        appearance-none
        border-none
        focus:outline-none
        text-sm font-medium"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl animate-in fade-in slide-in-from-top-1 duration-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#313eba] hover:bg-[#313eba]/80 text-white font-semibold py-4 
                rounded-[2rem] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl
                 shadow-blue-500/20 active:scale-[0.98] tracking-widest  text-xs"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sign in
                  </>
                ) : (
                  "Sign in"
                )}
              </button>

              <div className="flex items-center justify-between mx-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
                  />
                  <span className="text-xs font-normal text-gray-600 group-hover:text-gray-600 transition-colors">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-[11px] font-normal text-gray-600 hover:text-[#313eba]/80 tracking-tight"
                >
                  Forgot password?
                </a>
              </div>
            </form>

            <div className="pt-8 text-left text-[10px] font-normal tracking-widest">
              © 2026 Briskon ·{" "}
              <a
                href="#"
                className="hover:text-gray-600 transition-colors underline  underline-offset-2"
              >
                Privacy policy
              </a>{" "}
              ·{" "}
              <a
                href="#"
                className="hover:text-gray-600 transition-colors underline  underline-offset-2"
              >
                Terms and conditions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
