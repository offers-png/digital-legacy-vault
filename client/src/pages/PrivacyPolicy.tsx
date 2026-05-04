import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Lock className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold text-slate-900">Digital Legacy Vault</span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Privacy Policy</h1>
            <p className="text-slate-500">Last updated: May 2026</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-slate-700 leading-relaxed">
                Digital Legacy Vault (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our,&rdquo; or &ldquo;Company&rdquo;) is committed to protecting your privacy. This Privacy
                Policy explains how we collect, use, disclose, and safeguard your information when you use our website and
                services. By using Digital Legacy Vault, you consent to the data practices described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">2.1 Personal Information</h3>
              <p className="text-slate-700 mb-3">We collect the following personal information:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Name and email address (from Google OAuth authentication)</li>
                <li>Account profile information and preferences</li>
                <li>Check-in history and timestamps</li>
                <li>Executor designations and contact information</li>
                <li>Payment information (processed securely through Stripe)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">2.2 Sensitive Data (Encrypted)</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-slate-700">
                  <strong className="text-blue-900">Zero-Knowledge Architecture:</strong> Digital assets (crypto keys, passwords, social media credentials, etc.) are encrypted end-to-end with
                  AES-256-GCM encryption. We <strong>cannot access</strong> your encrypted data&mdash;only you can decrypt it with your master password.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">2.3 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>IP address and geographic location data</li>
                <li>Device information (browser type, operating system, device type)</li>
                <li>Usage data (pages visited, time spent, features used)</li>
                <li>Referral source and marketing campaign data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Service Delivery:</strong> Providing and maintaining the Digital Legacy Vault service</li>
                <li><strong>Payments:</strong> Processing transactions and billing (via Stripe)</li>
                <li><strong>Notifications:</strong> Sending check-in reminders, executor notifications, and system alerts</li>
                <li><strong>Security:</strong> Detecting and preventing fraud, abuse, and security incidents</li>
                <li><strong>Improvement:</strong> Analyzing usage patterns to improve our service</li>
                <li><strong>Legal Compliance:</strong> Meeting legal and regulatory obligations</li>
                <li><strong>Support:</strong> Responding to customer support requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
              <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Encryption in Transit:</strong> All data transmitted uses HTTPS/TLS 1.3 encryption</li>
                  <li><strong>Encryption at Rest:</strong> Sensitive data encrypted with AES-256-GCM</li>
                  <li><strong>Zero-Knowledge:</strong> Client-side encryption ensures we cannot access your sensitive data</li>
                  <li><strong>Access Controls:</strong> Role-based access and principle of least privilege</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Retention</h2>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mt-3">
                <li>Permanently delete all encrypted digital assets within 30 days of account deletion</li>
                <li>Remove all personal information from active databases within 30 days</li>
                <li>Retain backup copies for an additional 90 days for disaster recovery purposes</li>
                <li>Retain transaction records as required by law (typically 7 years for financial records)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Third-Party Services</h2>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-slate-900">Google OAuth</p>
                  <p className="text-slate-700 text-sm">For secure authentication. See <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a></p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="font-semibold text-slate-900">Stripe</p>
                  <p className="text-slate-700 text-sm">For payment processing. See <a href="https://stripe.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Stripe&apos;s Privacy Policy</a></p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="font-semibold text-slate-900">Supabase</p>
                  <p className="text-slate-700 text-sm">For database hosting. See <a href="https://supabase.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Supabase&apos;s Privacy Policy</a></p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Your Privacy Rights</h2>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and all associated data</li>
                <li><strong>Export:</strong> Download your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p className="text-slate-700 mt-4">
                To exercise any of these rights, contact us at <a href="mailto:privacy@digitallegacyvault.com" className="text-blue-600 hover:underline">privacy@digitallegacyvault.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Data Deletion Process</h2>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700 mt-3">
                <li>Email <a href="mailto:support@digitallegacyvault.com" className="text-blue-600 hover:underline">support@digitallegacyvault.com</a> from your registered address</li>
                <li>Include &ldquo;Account Deletion Request&rdquo; in the subject line</li>
                <li>We will confirm receipt within 24 hours</li>
                <li>Your account and data will be permanently deleted within 30 days</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-slate-700">
                Digital Legacy Vault is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-slate-700">
                We may update this Privacy Policy from time to time. We will notify you of significant changes via email and prominent notice on our website.
              </p>
            </section>

            <section className="bg-slate-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Contact Us</h2>
              <div className="space-y-2 text-slate-700">
                <p><strong>Email:</strong> <a href="mailto:privacy@digitallegacyvault.com" className="text-blue-600 hover:underline">privacy@digitallegacyvault.com</a></p>
                <p><strong>Support:</strong> <a href="mailto:support@digitallegacyvault.com" className="text-blue-600 hover:underline">support@digitallegacyvault.com</a></p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <Button onClick={() => navigate("/")} variant="outline" className="w-full sm:w-auto">
              &larr; Back to Home
            </Button>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-slate-500">
          &copy; 2026 Digital Legacy Vault. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
