import Link from "next/link";

export const metadata = { title: "Privacy Policy | RunItSimply" };

export default function PrivacyPage() {
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
          <h1 className="mb-2 text-2xl font-extrabold">Privacy Policy</h1>
          <p className="mb-8 text-sm text-gray-400">Last updated: April 2026</p>

          <div className="space-y-6 font-body text-sm leading-relaxed text-gray-700">
            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">1. Information We Collect</h2>
              <p>We collect information you provide when creating an account (email, business name, phone), data you enter into the platform (clients, employees, schedules, expenses), and usage information to improve the service.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">2. How We Use Your Information</h2>
              <p>Your information is used to provide and improve the RunItSimply service, process payments, send account-related notifications, and respond to support requests. We do not use your business data for advertising.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">3. Data Storage</h2>
              <p>Your data is stored securely using Supabase (PostgreSQL), hosted on infrastructure with industry-standard security measures. All data is encrypted in transit using TLS. Access to your data is controlled by row-level security policies.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">4. Data Sharing</h2>
              <p>We do not sell, rent, or share your personal data or business data with third parties for marketing purposes. We may share data with service providers who help us operate the platform (Supabase, Stripe, Vercel), subject to their own privacy policies.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">5. Payment Information</h2>
              <p>Payment processing is handled by Stripe. We do not store your credit card information on our servers. Stripe&apos;s privacy policy applies to all payment data.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">6. Cookies</h2>
              <p>We use cookies and local storage to maintain your session and remember your preferences (such as language selection). These are essential for the service to function and are not used for tracking.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">7. Your Rights</h2>
              <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us. Account deletion removes all associated data from our systems within 30 days.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">8. Data Retention</h2>
              <p>We retain your data for as long as your account is active. If your subscription lapses, we retain data for 90 days before deletion to allow for reactivation.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">9. Changes to This Policy</h2>
              <p>We may update this policy periodically. We will notify you of significant changes by email. Continued use of the service constitutes acceptance of the updated policy.</p>
            </section>

            <section>
              <h2 className="mb-2 font-bold text-[#1A1D26]">10. Contact</h2>
              <p>For privacy questions or data requests, contact us through the contact form on our website.</p>
            </section>
          </div>
        </div>

        <p className="mt-6 text-center font-body text-[11px] text-gray-400">
          <Link href="/" className="hover:underline">Home</Link>
          {" · "}
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
        </p>
      </div>
    </div>
  );
}
