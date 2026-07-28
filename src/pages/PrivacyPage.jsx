/*
|--------------------------------------------------------------------------
| PrivacyPage.jsx
|--------------------------------------------------------------------------
|
| Privacy policy page for RentIt — describes what data is collected,
| how it's used, and user rights. Content reflects actual platform
| behavior, not aspirational or legal boilerplate.
|
| Route: /privacy (public, under PublicLayout)
| Responsibilities: Render the privacy policy as readable, styled content
| Dependencies: Container from design system, React Router Link
|--------------------------------------------------------------------------
*/

import { Link } from "react-router-dom";
import { Container } from "../design";

const HEADING_CLASSES = "text-xl font-heading font-bold text-text-primary mt-10 mb-3 first:mt-0";
const SUBHEADING_CLASSES = "text-base font-heading font-semibold text-text-primary mt-6 mb-2";
const BODY_CLASSES = "text-sm text-text-secondary leading-relaxed mb-3";
const LIST_CLASSES = "text-sm text-text-secondary leading-relaxed mb-3 list-disc pl-5 space-y-1";

export default function PrivacyPage() {
  return (
    <div className="bg-background min-h-[60vh]">
      <Container className="max-w-3xl pt-14 lg:pt-24 pb-16 lg:pb-24">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-text-muted mb-8">
          Last updated: July 28, 2026
        </p>

        <p className={`${BODY_CLASSES} text-xs text-text-muted italic`}>
          Draft, not legal advice. This document reflects what RentIt actually does with data
          as of today. It has not been reviewed by a lawyer. Before treating this as a final,
          published policy, have it reviewed by a legal professional familiar with applicable
          law in your jurisdiction (in Nigeria, this may include the Nigeria Data Protection
          Act; if you have users outside Nigeria, other regional data protection laws may also
          apply). Update this document whenever RentIt&apos;s actual practices change, for example
          when payment processing is added.
        </p>

        <h2 className={HEADING_CLASSES}>What RentIt Is</h2>
        <p className={BODY_CLASSES}>
          RentIt is a peer-to-peer marketplace where people list items they own for others to
          rent, and browse and book items listed by others.
        </p>

        <h2 className={HEADING_CLASSES}>Information We Collect</h2>
        <p className={SUBHEADING_CLASSES}>Account information.</p>
        <p className={BODY_CLASSES}>
          When you create an account, we collect your email address and the profile information
          you choose to provide: full name, profile photo, location, and a short bio.
        </p>
        <p className={SUBHEADING_CLASSES}>Listing information.</p>
        <p className={BODY_CLASSES}>
          If you list an item for rent, we collect the details you provide about that item:
          title, description, category, price, location, and photos.
        </p>
        <p className={SUBHEADING_CLASSES}>Booking information.</p>
        <p className={BODY_CLASSES}>
          When you book an item, we collect the dates, price, and status of that booking, along
          with any message sent to the item&apos;s owner as part of the booking request.
        </p>
        <p className={SUBHEADING_CLASSES}>Contact form submissions.</p>
        <p className={BODY_CLASSES}>
          If you use the Contact page, we collect the name, email, and message you submit. If
          you&apos;re logged in when you submit it, we may also link the message to your account.
        </p>
        <p className={SUBHEADING_CLASSES}>Reviews.</p>
        <p className={BODY_CLASSES}>
          If you leave a review after a completed booking, we collect the rating and comment you
          write, and associate it with your account and the relevant booking.
        </p>
        <p className={BODY_CLASSES}>
          We do not currently use analytics or tracking tools on this site.
        </p>

        <h2 className={HEADING_CLASSES}>What We Do Not Currently Collect</h2>
        <p className={BODY_CLASSES}>
          We do not currently process payments, so we do not currently collect or store payment
          card information. If payment processing is added in the future, this policy will be
          updated to describe how that works and which third-party payment processor is involved
          before that feature goes live.
        </p>

        <h2 className={HEADING_CLASSES}>How We Use This Information</h2>
        <ul className={LIST_CLASSES}>
          <li>
            To operate your account and let you use the marketplace (listing items, booking
            items, messaging other users about a booking)
          </li>
          <li>
            To display your public profile information, listings, and reviews to other users,
            since a peer-to-peer marketplace depends on users being able to see who they&apos;re
            renting from or to
          </li>
          <li>To respond to messages sent through the Contact page</li>
          <li>To maintain the security and integrity of the platform</li>
        </ul>

        <h2 className={HEADING_CLASSES}>Where Your Data Is Stored</h2>
        <p className={BODY_CLASSES}>
          RentIt is built on Supabase, which provides our database, authentication, and file
          storage. Your account data, listing data, booking data, and uploaded images are stored
          on Supabase&apos;s infrastructure. Supabase acts as our data processor; review
          Supabase&apos;s own privacy and security documentation for details on their
          infrastructure.
        </p>

        <h2 className={HEADING_CLASSES}>Who Can See Your Information</h2>
        <ul className={LIST_CLASSES}>
          <li>
            Your profile name, avatar, and bio are visible to other users, since this is a
            public marketplace
          </li>
          <li>Your listings are publicly browsable</li>
          <li>Reviews you write or receive are publicly visible</li>
          <li>
            Contact form submissions and unaccepted booking messages are not publicly visible;
            they&apos;re only accessible to the RentIt team
          </li>
          <li>We do not sell your information to third parties</li>
        </ul>

        <h2 className={HEADING_CLASSES}>Your Rights</h2>
        <p className={BODY_CLASSES}>
          You can request to access, correct, or delete the personal information associated with
          your account. To do so, contact us through the{" "}
          <Link to="/contact" className="text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded">
            Contact page
          </Link>
          . We will respond and take appropriate action, including deleting your account and
          associated data where technically feasible and where retaining it isn&apos;t otherwise
          required (for example, for resolving an active dispute).
        </p>

        <h2 className={HEADING_CLASSES}>Data Retention</h2>
        <p className={BODY_CLASSES}>
          We retain your account information for as long as your account is active. If you
          delete your account, we will delete your profile information; some records tied to
          completed bookings and reviews may be retained where reasonably necessary for trust
          and safety on the platform, or where the underlying data (like a review) has
          independent value to other users and doesn&apos;t itself identify you beyond what&apos;s
          already public.
        </p>

        <h2 className={HEADING_CLASSES}>Cookies</h2>
        <p className={BODY_CLASSES}>
          RentIt uses only the minimal cookies or local storage necessary to keep you logged in
          between visits (managed via Supabase Auth). We do not use third-party advertising or
          tracking cookies.
        </p>

        <h2 className={HEADING_CLASSES}>Changes to This Policy</h2>
        <p className={BODY_CLASSES}>
          If how RentIt collects or uses information changes meaningfully, this page will be
          updated and the &quot;Last updated&quot; date above will reflect that.
        </p>

        <h2 className={HEADING_CLASSES}>Contact</h2>
        <p className={BODY_CLASSES}>
          Questions about this policy can be sent through the{" "}
          <Link to="/contact" className="text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded">
            Contact page
          </Link>
          .
        </p>
      </Container>
    </div>
  );
}
