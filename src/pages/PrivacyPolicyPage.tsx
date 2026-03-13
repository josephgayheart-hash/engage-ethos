import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import campusvoiceLogo from '@/assets/campusvoice-logo-new.png';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy - CampusVoice.AI"
        description="Learn how CampusVoice.AI collects, uses, and protects your data. Our privacy practices for higher education institutions."
        keywords={['privacy policy', 'data protection', 'CampusVoice', 'higher education']}
      />

      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={campusvoiceLogo} alt="CampusVoice.AI" className="h-7 w-auto" />
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="space-y-2 mb-10">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm">Last updated: March 13, 2026</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground/85 text-[15px] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
            <p>
              CampusVoice.AI ("we," "our," or "us") provides AI-powered strategic messaging intelligence for higher education institutions. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
            <p><strong>Account Information:</strong> When you request access or create an account, we collect your name, email address, phone number, institution name, department, and job title.</p>
            <p><strong>Content Data:</strong> Content you upload or create within the platform, including writing samples, brand guidelines, messaging drafts, institutional facts, and campus photography.</p>
            <p><strong>Usage Data:</strong> We automatically collect information about how you interact with the platform, including features used, pages visited, and actions taken. This helps us improve our service.</p>
            <p><strong>Device &amp; Technical Data:</strong> Browser type, operating system, IP address, and similar technical information collected through standard web technologies.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To provide, maintain, and improve the CampusVoice.AI platform</li>
              <li>To process your account registration and manage your access</li>
              <li>To generate AI-powered content, evaluations, and recommendations tailored to your institution</li>
              <li>To analyze voice patterns and brand consistency across your communications</li>
              <li>To send service-related communications (account setup, product updates)</li>
              <li>To monitor platform performance and troubleshoot issues</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. AI Processing &amp; Third-Party Models</h2>
            <p>
              CampusVoice.AI uses artificial intelligence to power content generation, evaluation, and brand analysis features. Your content may be processed by third-party AI model providers, including:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Google (Gemini models)</strong> — for content generation, evaluation, and analysis</li>
              <li><strong>OpenAI (GPT models)</strong> — for content generation, evaluation, and analysis</li>
            </ul>
            <p>
              Content sent to these providers is used solely to generate responses for your requests. We do not permit these providers to use your data to train their models. All AI processing is governed by our data processing agreements with each provider.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Data Sharing &amp; Disclosure</h2>
            <p>We do <strong>not</strong> sell your personal information or institutional data to third parties. We may share information only in the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Service Providers:</strong> With trusted vendors who assist in operating our platform (hosting, email delivery, analytics), bound by confidentiality obligations</li>
              <li><strong>AI Model Providers:</strong> As described in Section 4, strictly for processing your content requests</li>
              <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. FERPA Awareness</h2>
            <p>
              We understand that higher education institutions operate under the Family Educational Rights and Privacy Act (FERPA). CampusVoice.AI is designed as a communications and marketing tool and is not intended to process, store, or manage student education records as defined under FERPA. We recommend that users do not upload content containing personally identifiable student education records to the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including encryption in transit (TLS) and at rest, role-based access controls, audit logging, and regular security reviews. However, no method of electronic transmission or storage is 100% secure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Data Retention</h2>
            <p>
              We retain your account and content data for as long as your account is active or as needed to provide services. If your institution's account is terminated, we will delete or anonymize your data within 90 days, unless retention is required by law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict certain processing</li>
              <li>Receive your data in a portable format</li>
            </ul>
            <p>To exercise any of these rights, please contact us at the address below.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page and updating the "Last updated" date. Continued use of the platform after changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:privacy@campusvoice.ai" className="text-accent hover:underline underline-offset-4">
                privacy@campusvoice.ai
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
