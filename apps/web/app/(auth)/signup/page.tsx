"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import Image from "next/image";
import { Orbitron } from 'next/font/google';
import { CheckCircle2, ShieldCheck, Zap, Globe, Eye, EyeOff } from "lucide-react";

const orbitron = Orbitron({ subsets: ['latin'], weight: '800' });

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long.";
    const weakPasswords = ["12345678", "password", "qwertyui", "123456789"];
    if (weakPasswords.includes(pwd.toLowerCase())) return "Please choose a stronger password.";
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
          first_name: firstName,
          last_name: lastName,
          organization_name: "My Workspace" // Simplified for the mockup
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Signup failed");
      }

      // Automatically log them in by fetching the token
      const loginRes = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }),
      });

      if (loginRes.ok) {
        const data = await loginRes.json();
        localStorage.setItem("token", data.access_token);
        login(data.user);
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* Left Pane - Branding & Features */}
      <div className="hidden lg:flex lg:w-5/12 bg-blue-600 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-700 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-16">
            <Image src="/Browser_icon.svg" alt="MailFlow Logo" width={36} height={36} className="brightness-0 invert w-9 h-9" />
            <span className={`${orbitron.className} text-3xl tracking-tight text-white`}>MailFlow</span>
          </Link>

          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            The secure email platform for modern teams.
          </h1>
          <p className="text-blue-100 text-lg mb-12">
            Join thousands of businesses that trust MailFlow for their daily communication and collaboration needs.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-blue-200 shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold">Enterprise-grade Security</h3>
                <p className="text-blue-200 text-sm mt-1">End-to-end encryption and strict DMARC enforcement by default.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 text-blue-200 shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold">Blazing Fast Performance</h3>
                <p className="text-blue-200 text-sm mt-1">Sub-50ms search latency across your entire organization's history.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Globe className="w-6 h-6 text-blue-200 shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold">Custom Domains</h3>
                <p className="text-blue-200 text-sm mt-1">Connect your own domain and create professional aliases instantly.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-blue-200 text-sm">
          © {new Date().getFullYear()} MailFlow Inc. All rights reserved.
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-24">
        <div className="w-full max-w-md mx-auto">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <Image src="/Browser_icon.svg" alt="MailFlow Logo" width={32} height={32} className="w-8 h-8" />
            <span className={`${orbitron.className} text-2xl tracking-tight text-blue-600`}>MailFlow</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
            <p className="text-gray-500">Start your 15-day free trial. No credit card required.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSignup}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100 font-medium">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start mt-4">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {loading ? "Creating account..." : "Sign up for free"}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Already have a MailFlow account?{" "}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
