import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

/**
 * Terms of Service Page
 */
export default function TermsOfService() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-8">
          ← Back
        </Button>

        <div className="prose prose-sm max-w-none">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: April 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Digital Legacy Vault ("Service"), you accept and agree to be bound by the terms and
            provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>

          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on Digital
            Legacy Vault for personal, non-commercial transitory viewing only. This is the grant of a license, not a
            transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose or for any public display</li>
            <li>Attempting to decompile or reverse engineer any software contained on the Service</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
            <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
          </ul>

          <h2>3. Disclaimer</h2>
          <p>
            The materials on Digital Legacy Vault are provided on an 'as is' basis. Digital Legacy Vault makes no
            warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without
            limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or
            non-infringement of intellectual property or other violation of rights.
          </p>

          <h2>4. Limitations</h2>
          <p>
            In no event shall Digital Legacy Vault or its suppliers be liable for any damages (including, without
            limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or
            inability to use the materials on Digital Legacy Vault, even if Digital Legacy Vault or an authorized
            representative has been notified orally or in writing of the possibility of such damage.
          </p>

          <h2>5. Accuracy of Materials</h2>
          <p>
            The materials appearing on Digital Legacy Vault could include technical, typographical, or photographic
            errors. Digital Legacy Vault does not warrant that any of the materials on the Service are accurate,
            complete, or current. Digital Legacy Vault may make changes to the materials contained on the Service at any
            time without notice.
          </p>

          <h2>6. Links</h2>
          <p>
            Digital Legacy Vault has not reviewed all of the sites linked to its website and is not responsible for the
            contents of any such linked site. The inclusion of any link does not imply endorsement by Digital Legacy
            Vault of the site. Use of any such linked website is at the user's own risk.
          </p>

          <h2>7. Modifications</h2>
          <p>
            Digital Legacy Vault may revise these terms of service for the Service at any time without notice. By using
            this Service, you are agreeing to be bound by the then current version of these terms of service.
          </p>

          <h2>8. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the United States,
            and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>

          <h2>9. User Responsibilities</h2>
          <p>Users agree to:</p>
          <ul>
            <li>Maintain the confidentiality of their passwords</li>
            <li>Provide accurate and complete information</li>
            <li>Not use the Service for illegal or unauthorized purposes</li>
            <li>Not attempt to gain unauthorized access to the Service</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>

          <h2>10. Data Accuracy</h2>
          <p>
            Users are responsible for the accuracy of the information they store in the Service. Digital Legacy Vault
            is not responsible for errors, omissions, or inaccuracies in user-provided data.
          </p>

          <h2>11. Payment Terms</h2>
          <p>
            Payment for the Service is required to access premium features. All payments are processed securely through
            Stripe. Refunds are not available after 30 days of purchase.
          </p>

          <h2>12. Termination</h2>
          <p>
            Digital Legacy Vault reserves the right to terminate your account and access to the Service at any time, for
            any reason, with or without notice.
          </p>

          <h2>13. Contact</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:
            <br />
            Email: support@digitallegacyvault.com
          </p>
        </div>
      </div>
    </div>
  );
}
