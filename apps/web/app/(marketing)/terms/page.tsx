import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - MailFlow",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-20 px-6 sm:px-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
      <p className="text-gray-500 mb-8">Last updated: October 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using MailFlow ("we," "our," or "us"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
          <p>
            MailFlow provides enterprise-grade email hosting and management solutions. We reserve the right to modify, suspend, or discontinue any part of the service at any time without prior notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>You must provide accurate and complete registration information.</li>
            <li>You are responsible for maintaining the security of your account passwords and API keys.</li>
            <li>You agree not to use MailFlow for sending spam, malware, phishing emails, or any illegal content.</li>
            <li>Violation of our anti-spam policies will result in immediate permanent account termination without refund.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data and Privacy</h2>
          <p>
            Your privacy is important to us. Please refer to our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> to understand how we collect, use, and protect your personal and company data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Limitation of Liability</h2>
          <p>
            MailFlow is provided "as is" without warranties of any kind. In no event shall MailFlow be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services.
          </p>
        </section>
      </div>
    </div>
  );
}
