"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Search, Lock, Server, Users, Cloud, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function MarketingPage() {
  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      
      {/* Subtle Dot Pattern Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=')] opacity-60 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] animate-pulse-slow"></div>
        {/* Blue glowing orb top right */}
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-blue-50/50 blur-3xl opacity-60 pointer-events-none"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[80vh] flex flex-col items-center justify-center pt-8 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
            Introducing the new MailFlow Enterprise
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
              Secure Business Email <br className="hidden md:block" />
              for <span className="text-blue-600">Modern Teams.</span>
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience the perfect balance of uncompromising security, blistering performance, and intuitive design. Built for businesses that demand reliability.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/signup" 
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-md text-base font-semibold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Start 15-Day Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#features" 
              className="w-full sm:w-auto bg-white text-gray-700 border border-gray-300 px-8 py-4 rounded-md text-base font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              Explore Features
            </Link>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 text-sm text-gray-400"
          >
            No credit card required. Cancel anytime.
          </motion.p>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="relative z-10 py-12 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-8">Trusted by innovative teams worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale">
            {/* Mock Company Logos using text for simplicity */}
            <h3 className="text-xl font-bold font-serif">Acme Corp</h3>
            <h3 className="text-xl font-bold tracking-tighter">GLOBAL<span className="font-light">INDUSTRIES</span></h3>
            <h3 className="text-xl font-extrabold italic">TechSolutions</h3>
            <h3 className="text-xl font-semibold uppercase">Nexus</h3>
            <h3 className="text-xl font-bold tracking-widest">Apex</h3>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="relative z-10 py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to work smarter</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Powerful features wrapped in an elegant interface, designed to keep your team productive and secure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Lightning Fast Search", desc: "Find any email, attachment, or contact in milliseconds with our advanced indexing engine." },
              { icon: ShieldCheck, title: "Enterprise Security", desc: "End-to-end encryption, 2FA, and strict DMARC enforcement keep your data safe." },
              { icon: Cloud, title: "99.99% Uptime SLA", desc: "Reliable infrastructure ensures your business email is always online when you need it." },
              { icon: Users, title: "Seamless Collaboration", desc: "Shared inboxes, team aliases, and collaborative drafting make teamwork effortless." },
              { icon: Search, title: "Smart Organization", desc: "Automated filters, smart folders, and priority inbox keep the clutter away." },
              { icon: Server, title: "Admin Console", desc: "Granular control over domains, users, groups, and security policies from one dashboard." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep Dive Section - Text Left, UI Mockup Right */}
      <section className="relative z-10 py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="order-2 lg:order-1"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                An inbox designed for <span className="text-blue-600">focus.</span>
              </h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                We've stripped away the clutter so you can focus on what matters. With our clean, distraction-free interface, reading and composing emails feels like a breeze.
              </p>
              <ul className="space-y-4">
                {[
                  "Clean, borderless reading pane",
                  "Rich text editor with markdown support",
                  "Instant keyboard shortcuts",
                  "Dark mode and customizable themes"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="order-1 lg:order-2 relative"
            >
              {/* Decorative background blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>
              
              {/* Mockup Window */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col h-[450px] w-full transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                {/* Window Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="mx-auto bg-white border border-gray-200 rounded-md px-32 py-1 flex items-center justify-center">
                    <span className="text-xs text-gray-400 font-medium">mailflow.com/inbox</span>
                  </div>
                </div>
                {/* Window Body (Mock UI) */}
                <div className="flex flex-1">
                  {/* Sidebar */}
                  <div className="w-48 border-r border-gray-100 p-4 space-y-3">
                    <div className="w-full h-8 bg-blue-600 rounded-md mb-6"></div>
                    <div className="w-full h-6 bg-blue-50 rounded-md"></div>
                    <div className="w-3/4 h-6 bg-gray-50 rounded-md"></div>
                    <div className="w-5/6 h-6 bg-gray-50 rounded-md"></div>
                  </div>
                  {/* List */}
                  <div className="w-64 border-r border-gray-100 flex flex-col">
                    <div className="p-4 border-b border-gray-100"><div className="w-full h-8 bg-gray-100 rounded-md"></div></div>
                    <div className="p-4 border-b border-gray-100 bg-blue-50"><div className="w-3/4 h-4 bg-gray-300 rounded mb-2"></div><div className="w-full h-3 bg-gray-200 rounded"></div></div>
                    <div className="p-4 border-b border-gray-100"><div className="w-2/3 h-4 bg-gray-200 rounded mb-2"></div><div className="w-full h-3 bg-gray-100 rounded"></div></div>
                    <div className="p-4 border-b border-gray-100"><div className="w-4/5 h-4 bg-gray-200 rounded mb-2"></div><div className="w-full h-3 bg-gray-100 rounded"></div></div>
                  </div>
                  {/* Pane */}
                  <div className="flex-1 p-8">
                    <div className="w-1/2 h-8 bg-gray-200 rounded-md mb-8"></div>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="w-32 h-4 bg-gray-200 rounded mb-1.5"></div>
                        <div className="w-24 h-3 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="w-full h-3 bg-gray-100 rounded"></div>
                      <div className="w-full h-3 bg-gray-100 rounded"></div>
                      <div className="w-4/5 h-3 bg-gray-100 rounded"></div>
                      <div className="w-5/6 h-3 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-32 px-6 bg-white border-t border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Premium email. <span className="text-blue-600">Unbeatable price.</span>
            </h2>
            <p className="text-xl text-gray-500">
              Get the same enterprise-grade security and reliability as Zoho and Google Workspace, but at a fraction of the cost.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Free Tier */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 flex flex-col hover:shadow-lg transition-shadow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-500 min-h-[48px]">Perfect for personal projects and very small teams.</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-extrabold text-gray-900">$0</span>
                <span className="text-gray-500">/user/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {["Up to 5 Users", "5GB Storage per user", "Webmail Access Only", "Standard Security", "Community Support"].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="w-full block text-center bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:border-gray-300 hover:bg-gray-50 transition-all">
                Get Started
              </Link>
            </div>

            {/* Basic Tier (Highlighted) */}
            <div className="bg-blue-600 rounded-2xl border border-blue-600 p-8 flex flex-col shadow-2xl relative transform md:-translate-y-4">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wider">
                Most Popular
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
                <p className="text-blue-200 min-h-[48px]">Everything you need to run your business professionally.</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-extrabold text-white">$0.80</span>
                <span className="text-blue-200">/user/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {["Unlimited Users", "25GB Storage per user", "Custom Domain Hosting", "IMAP / POP / SMTP Access", "Priority 24/7 Support"].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-blue-300 shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="w-full block text-center bg-white text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-md">
                Start 15-Day Trial
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col hover:shadow-lg transition-shadow shadow-sm">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                <p className="text-gray-500 min-h-[48px]">Advanced compliance and vast storage for power users.</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-extrabold text-gray-900">$2.50</span>
                <span className="text-gray-500">/user/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {["100GB Storage per user", "eDiscovery & Archiving", "Advanced Threat Protection", "Huge 1GB Attachments", "Dedicated Account Manager"].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="w-full block text-center bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition-all">
                Contact Sales
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6 bg-blue-600 overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-700 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to upgrade your workflow?</h2>
            <p className="text-xl text-blue-100 mb-10 font-light max-w-2xl mx-auto">Join thousands of professionals who have already made the switch to MailFlow. Setup takes less than 5 minutes.</p>
            <Link 
              href="/signup" 
              className="inline-flex bg-white text-blue-600 px-10 py-4 rounded-md text-lg font-bold hover:bg-gray-50 transition-colors items-center gap-2 shadow-lg hover:shadow-xl"
            >
              Create Your Workspace
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
