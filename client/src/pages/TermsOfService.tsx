import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useLocation } from "wouter";

export default function TermsOfService() {
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
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Terms of Service</h1>
            <p className="text-slate-500">Last updated: May 2026</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-700 leading-relaxed">
                By accessing and using Digital Legacy Vault (&ldquo;Service&rdquo;), you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use this Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Description of Service</h2>
              <p className="text-slate-700 mb-3">Digital Legacy Vault provides a secure platform for storing and managing digital assets, including:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Cryptocurrency wallet keys and recovery phrases</li>
                <li>Passwords and login credentials</li>
                <li>Social media account information</li>
                <li>Domain registrations and hosting credentials</li>
                <li>Business and personal documentation</li>
                <li>Dead Man&apos;s Switch check-in system</li>
                <li>Executor designation and notification system</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Account and Registration</h2>
              <p className="text-slate-700 mb-4">To use the Service, you must create an account using Google OAuth. You agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Be at least 18 years old</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. User Responsibilities</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <p className="text-slate-700 mb-4"><strong className="text-amber-900">You are solely responsible for:</strong></p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Data Accuracy:</strong> Ensuring all information you store is accurate and up-to-date</li>
                  <li><strong>Password Security:</strong> Safeguarding your master encryption password (we cannot recover it)</li>
                  <li><strong>Check-Ins:</strong> Completing regular check-ins to prevent premature executor notifications</li>
                  <li><strong>Executor Communication:</strong> Informing your designated executors of their role</li>
                  <li><strong>Legal Compliance:</strong> Using the Service in compliance with all applicable laws</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Prohibited Activities</h2>
              <p className="text-slate-700 mb-3">You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Use the Service for any illegal purpose</li>
                <li>Store stolen credentials or information obtained through unauthorized means</li>
                <li>Attempt to bypass or interfere with security features</li>
                <li>Access another user&apos;s account without authorization</li>
                <li>Reverse engineer or disassemble any part of the Service</li>
                <li>Transmit viruses, malware, or other malicious code</li>
                <li>Impersonate another person or entity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Payment and Subscription</h2>
              <p className="text-slate-700 mb-4">
                Digital Legacy Vault offers both free and paid subscription tiers. All payments are processed securely through Stripe. We offer a 30-day money-back guarantee on all paid plans.
              </p>
              <p className="text-slate-700">
                You may cancel your subscription at any time and retain access until the end of your current billing period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Dead Man&apos;s Switch Policy</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                  <li>You must check in at least once every 30 days</li>
                  <li>Reminder emails are sent at 25 days, 28 days, and 30 days</li>
                  <li>If you miss 2 consecutive check-in periods (60 days), executors are notified</li>
                  <li>Executors must provide a death certificate to access your encrypted assets</li>
                  <li>You can reset the timer at any time by checking in</li>
                </ol>
                <p className="text-slate-700 mt-4">
                  <strong>Important:</strong> False notifications caused by failing to check in are your responsibility.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Data Encryption and Security</h2>
              <p className="text-slate-700 mb-4">
                We employ end-to-end encryption (AES-256-GCM) for all sensitive data. <strong>We cannot access, decrypt, or recover your encrypted data.</strong> If you lose your master password, your data cannot be recovered.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-900 font-semibold">&#9888; Critical: Store your master password securely</p>
                <p className="text-red-800 text-sm mt-2">
                  There is no password recovery mechanism. Lost passwords mean permanent loss of access to encrypted data.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Disclaimer of Warranties</h2>
              <p className="text-slate-700">
                THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Limitation of Liability</h2>
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-6">
                <p className="text-slate-700 mb-4">TO THE MAXIMUM EXTENT PERMITTED BY LAW, DIGITAL LEGACY VAULT SHALL NOT BE LIABLE FOR:</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Indirect, incidental, special, consequential, or punitive damages</li>
                  <li>Loss of profits, revenue, data, or use</li>
                  <li>Damages arising from lost or compromised passwords</li>
                  <li>Premature executor notifications due to missed check-ins</li>
                  <li>Unauthorized access to accounts due to user negligence</li>
                </ul>
                <p className="text-slate-700 mt-4">
                  <strong>Maximum Liability:</strong> Our total liability for any claim shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Indemnification</h2>
              <p className="text-slate-700">
                You agree to indemnify and hold harmless Digital Legacy Vault from any claims, damages, losses, and expenses arising from your use or misuse of the Service, your violation of these Terms, or your violation of any rights of another party.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Account Termination</h2>
              <p className="text-slate-700 mb-4">You may terminate your account at any time by contacting support. Upon termination, your data will be permanently deleted within 30 days.</p>
              <p className="text-slate-700">We reserve the right to suspend or terminate your account immediately for violation of these Terms, illegal activity, or at our sole discretion.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Governing Law</h2>
              <p className="text-slate-700">
                These Terms are governed by the laws of the State of New York, United States. Any disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Modifications to Terms</h2>
              <p className="text-slate-700">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email and prominent notice on the website. Continued use constitutes acceptance.
              </p>
            </section>

            <section className="bg-slate-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">15. Contact Information</h2>
              <div className="space-y-2 text-slate-700">
                <p><strong>Email:</strong> <a href="mailto:legal@digitallegacyvault.com" className="text-blue-600 hover:underline">legal@digitallegacyvault.com</a></p>
                <p><strong>Support:</strong> <a href="mailto:support@digitallegacyvault.com" className="text-blue-600 hover:underline">support@digitallegacyvault.com</a></p>
              </div>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <p className="text-blue-900 font-semibold mb-2">Acknowledgment</p>
              <p className="text-blue-800 text-sm">
                BY USING DIGITAL LEGACY VAULT, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM.
              </p>
            </div>
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
