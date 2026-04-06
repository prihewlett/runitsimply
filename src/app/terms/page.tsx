import Link from "next/link";

export const metadata = { title: "Terms of Service | RunItSimply" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-lg font-extrabold text-white">
              R
            </div>
            <div className="text-xl font-extrabold tracking-tight">RunItSimply</div>
          </Link>
        </div>

        <div className="rounded-[16px] border border-[#F0F2F5] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <h1 className="mb-2 text-2xl font-extrabold">Terms of Service</h1>
          <p className="mb-8 text-sm text-gray-400">Last updated: April 2026</p>

          <div className="space-y-6 font-body text-sm leading-relaxed text-gray-700">
            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">1. Acceptance of Terms</h2>
              <p>By creating an account or using RunItSimply, you agree to these Terms of Service. If you do not agree, please do not use the service.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">2. Description of Service</h2>
              <p>RunItSimply provides a business management platform for small home service businesses, including tools for scheduling, client management, payroll, expenses, and messaging. The service is provided on a subscription basis following a free trial period.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">3. Free Trial</h2>
              <p>New accounts receive a 14-day free trial with full access to all features. After the trial ends, continued access requires an active paid subscription. Your data is retained for a reasonable period after trial expiration.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">4. Subscriptions and Billing</h2>
              <p>Paid subscriptions are billed monthly. You may cancel at any time. Cancellation takes effect at the end of the current billing period. No refunds are issued for partial months. Payments are processed securely via Stripe.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">5. Your Responsibilities</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials, ensuring all data you enter is accurate, and complying with applicable laws in your jurisdiction. You may not use RunItSimply to engage in any illegal activity.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">6. Limitation of Liability</h2>
              <p>RunItSimply is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service, including but not limited to loss of data or business interruption.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">7. Termination</h2>
              <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time by contacting support.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">8. Changes to Terms</h2>
              <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify you of material changes by email.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">9. Governing Law</h2>
              <p>These terms are governed by the laws of the United States. Any disputes shall be resolved in the jurisdiction where RunItSimply is operated.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">10. Contact</h2>
              <p>For questions about these terms, contact us through the contact form on our website.</p>
            </section>
          </div>
        </div>

        <p className="mt-6 text-center font-body text-[11px] text-gray-400">
          <Link href="/" className="hover:underline">Home</Link>
          {" · "}
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
