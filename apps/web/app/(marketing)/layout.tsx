import Link from "next/link";
import Image from "next/image";
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({ subsets: ['latin'], weight: '800' });

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-200 font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 transition-transform duration-300 group-hover:scale-110">
              <Image src="/Browser_icon.svg" alt="MailFlow Logo" fill className="object-contain" />
            </div>
            <span className={`${orbitron.className} text-2xl tracking-tight text-blue-600`}>MailFlow</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#security" className="hover:text-blue-600 transition-colors">Security</Link>
            <Link href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</Link>
            <Link href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="bg-blue-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Sign Up for Free
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {children}
      </main>

      <footer className="border-t border-gray-200 py-16 bg-gray-50 mt-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-6 h-6">
                <Image src="/Browser_icon.svg" alt="MailFlow Logo" fill className="object-contain grayscale opacity-70" />
              </div>
              <span className={`${orbitron.className} text-lg tracking-tight text-gray-500`}>MailFlow</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Secure, fast, and professional enterprise email hosting designed for modern teams.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-blue-600">Features</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Security</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Enterprise</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-blue-600">Help Center</Link></li>
              <li><Link href="#" className="hover:text-blue-600">API Documentation</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Community</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-blue-600">About Us</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Careers</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} MailFlow Inc. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400 items-center justify-center">
            <span>Powered by <a href="https://x010.tech" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">x010.tech</a></span>
            <span className="hidden md:inline">•</span>
            <a href="https://sportyxi.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">SportyXi</a>
            <span className="hidden md:inline">•</span>
            <span>English (US)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
