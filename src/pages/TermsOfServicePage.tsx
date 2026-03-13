import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import campusvoiceLogo from '@/assets/campusvoice-logo-new.png';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Terms of Service - CampusVoice.AI"
        description="Terms of Service for CampusVoice.AI, an AI-powered messaging intelligence platform for higher education institutions."
        keywords={['terms of service', 'terms', 'CampusVoice', 'higher education', 'SaaS']}
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
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-sm">Last updated: March 13, 2026</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground/85 text-[15px] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the CampusVoice.AI platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms. If you do not agree, you may not use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p>
              CampusVoice.AI is an AI-powered strategic messaging intelligence platform designed for higher education institutions. The Service provides tools for content generation, brand voice analysis, message evaluation, journey design, and related communications capabilities.
            </p>
            <p>
              The Service is currently offered in <strong>beta</strong>. Features, functionality, and availability may change at any time without prior notice as we continue to develop and improve the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Account Responsibilities</h2>
            <p>You are responsible for:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Providing accurate and current information during registration and use</li>
              <li>Notifying us promptly of any unauthorized use of your account</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms or pose a security risk.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Acceptable Use</h2>
            <p>You agree <strong>not</strong> to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Upload, submit, or process personally identifiable information (PII) of students, including Social Security numbers, student IDs, dates of birth, GPAs, financial aid data, or any records protected under FERPA</li>
              <li>Use AI-generated outputs in a manner that is misleading, deceptive, or harmful</li>
              <li>Attempt to reverse-engineer, copy, or redistribute any part of the platform</li>
              <li>Use the Service for any unlawful purpose or in violation of any applicable regulations</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. AI-Generated Content</h2>
            <p>
              The Service uses artificial intelligence to generate content, evaluations, and recommendations. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>AI-generated outputs are <strong>suggestions only</strong> and must be reviewed by a qualified human before use</li>
              <li>We do not guarantee the accuracy, completeness, or suitability of any AI-generated content</li>
              <li>You are solely responsible for verifying that AI-generated content complies with your institution's brand guidelines, policies, and applicable laws</li>
              <li>AI outputs should not be relied upon for legal, regulatory, or compliance decisions</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Intellectual Property</h2>
            <p>
              <strong>Your Content:</strong> You retain all ownership rights to the content you upload, create, or input into the platform (including writing samples, brand guidelines, institutional facts, and photography). By using the Service, you grant us a limited, non-exclusive license to process your content solely for the purpose of delivering the Service.
            </p>
            <p>
              <strong>Our Platform:</strong> CampusVoice.AI and its underlying technology, design, code, and documentation are the intellectual property of CampusVoice.AI. Nothing in these Terms transfers ownership of our platform or any related intellectual property to you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Data Handling</h2>
            <p>
              Your use of the Service is also governed by our{' '}
              <Link to="/privacy" className="text-accent hover:underline underline-offset-4">
                Privacy Policy
              </Link>
              , which describes how we collect, use, and protect your data.
            </p>
            <p>
              We do <strong>not</strong> sell your personal information or institutional data to third parties. Your content is processed solely to deliver and improve the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Third-Party Services</h2>
            <p>
              The Service integrates with third-party AI model providers to power content generation and analysis features, including:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Google (Gemini models)</strong> — for content generation, evaluation, and analysis</li>
              <li><strong>OpenAI (GPT models)</strong> — for content generation, evaluation, and analysis</li>
            </ul>
            <p>
              Content sent to these providers is used solely to generate responses for your requests. These providers are bound by data processing agreements and are not permitted to use your data to train their models.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Service Availability</h2>
            <p>
              As a beta product, the Service is provided on an "as available" basis. We do not guarantee uninterrupted or error-free operation. We reserve the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Modify, suspend, or discontinue features at any time</li>
              <li>Perform maintenance that may temporarily affect availability</li>
              <li>Update these Terms to reflect changes in the Service</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, CampusVoice.AI and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to loss of data, revenue, or reputation.
            </p>
            <p>
              Our total aggregate liability for any claims arising under these Terms shall not exceed the amount you paid for the Service during the twelve (12) months preceding the claim.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">11. Termination</h2>
            <p>
              Either party may terminate the use of the Service at any time. Upon termination:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Your access to the Service will be revoked</li>
              <li>You may request export or deletion of your data by contacting us</li>
              <li>We will delete or anonymize your data within 90 days, unless retention is required by law</li>
            </ul>
            <p>
              We may also terminate or suspend your access immediately if you violate these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict-of-law principles. Any disputes arising from these Terms shall be resolved in the state or federal courts located in Delaware.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">13. Contact Us</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:sales@campusvoice.ai" className="text-accent hover:underline underline-offset-4">
                sales@campusvoice.ai
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
