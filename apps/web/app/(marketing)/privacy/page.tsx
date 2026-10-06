import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - MailFlow",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-20 px-6 sm:px-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: October 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
          <p>When you use MailFlow, we may collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Account Information:</strong> Name, email address, payment details, and domain names.</li>
            <li><strong>Usage Data:</strong> IP addresses, browser types, and interaction metrics with our admin console.</li>
            <li><strong>Email Metadata:</strong> Sender, recipient, timestamps, and routing information necessary to deliver emails (we do not read the content of your private emails).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
          <p>We use your information strictly to provide, maintain, and improve our services. This includes:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Authenticating users and protecting against unauthorized access.</li>
            <li>Processing payments and sending billing notifications.</li>
            <li>Detecting and preventing spam, fraud, and abuse on our network.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Security</h2>
          <p>
            We implement industry-standard security measures, including encryption at rest and in transit, to protect your data. All passwords are cryptographically hashed, and sensitive API credentials are encrypted.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Third-Party Sharing</h2>
          <p>
            We do not sell your personal data to third parties. We may share necessary data with trusted service providers (such as payment processors and cloud infrastructure partners) solely for operating our service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact our support team at privacy@x010.tech.
          </p>
        </section>
      </div>
    </div>
  );
}
