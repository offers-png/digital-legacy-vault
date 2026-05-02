import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

/**
 * Privacy Policy Page
 */
export default function PrivacyPolicy() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-8">
          ← Back
        </Button>

        <div className="prose prose-sm max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: April 2026</p>

          <h2>1. Introduction</h2>
          <p>
            Digital Legacy Vault ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your information when you use our website and
            services.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>2.1 Personal Information</h3>
          <p>We collect the following personal information:</p>
          <ul>
            <li>Name and email address (from Google OAuth)</li>
            <li>Account profile information</li>
            <li>Check-in history and timestamps</li>
            <li>Executor designations and relationships</li>
          </ul>

          <h3>2.2 Sensitive Data</h3>
          <p>
            Digital assets (crypto keys, passwords, social media credentials, etc.) are encrypted end-to-end with
            AES-256-GCM encryption. We cannot access your encrypted data—only you can decrypt it with your password.
          </p>

          <h3>2.3 Automatically Collected Information</h3>
          <ul>
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent</li>
            <li>Referral source</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use collected information for:</p>
          <ul>
            <li>Providing and maintaining the service</li>
            <li>Processing transactions and payments</li>
            <li>Sending check-in reminders and notifications</li>
            <li>Notifying executors of missed check-ins or death verification</li>
            <li>Improving and optimizing our service</li>
            <li>Complying with legal obligations</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement industry-standard security measures including HTTPS/TLS encryption, AES-256-GCM encryption for
            sensitive data, secure password hashing, and regular security audits. However, no method of transmission over
            the internet is 100% secure.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            We retain your personal information as long as your account is active. Upon account deletion, we will remove
            all personal data within 30 days, except where required by law.
          </p>

          <h2>6. Third-Party Services</h2>
          <p>
            We use Google OAuth for authentication and Stripe for payment processing. These services have their own
            privacy policies, and we encourage you to review them.
          </p>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Opt-out of communications</li>
          </ul>

          <h2>8. Data Deletion</h2>
          <p>
            To delete your account and all associated data, contact us at support@digitallegacyvault.com. We will
            process your request within 30 days.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant changes via email or by
            posting a notice on our website.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
            <br />
            Email: support@digitallegacyvault.com
          </p>
        </div>
      </div>
    </div>
  );
}
