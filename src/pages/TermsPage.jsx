/*
|--------------------------------------------------------------------------
| TermsPage.jsx
|--------------------------------------------------------------------------
|
| Terms of Service page for RentIt — the rental agreement framework
| between users. Content is rendered verbatim from the provided draft.
|
| Route: /terms (public, under PublicLayout)
| Responsibilities: Render the terms of service as readable, styled content
| Dependencies: Container from design system, React Router Link
|--------------------------------------------------------------------------
*/

import { Link } from "react-router-dom";
import { Container } from "../design";

const HEADING_CLASSES = "text-xl font-heading font-bold text-text-primary mt-10 mb-3 first:mt-0";
const BODY_CLASSES = "text-sm text-text-secondary leading-relaxed mb-3";
const LIST_CLASSES = "text-sm text-text-secondary leading-relaxed mb-3 list-disc pl-5 space-y-1";

export default function TermsPage() {
  return (
    <div className="bg-background min-h-[60vh]">
      <Container className="max-w-3xl pt-14 lg:pt-24 pb-16 lg:pb-24">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-2">
          Terms of Service
        </h1>
        <p className="text-xs text-text-muted mb-8">
          Last updated: July 28, 2026
        </p>

        <p className={`${BODY_CLASSES} text-xs text-text-muted italic`}>
          Draft, not legal advice. This document has not been reviewed by a lawyer. Before
          treating this as final, have it reviewed by a legal professional, particularly the
          age/minor provisions below and anything related to payments once payment processing is
          added. Update this document whenever RentIt&apos;s actual features or practices change.
        </p>

        <h2 className={HEADING_CLASSES}>What RentIt Is</h2>
        <p className={BODY_CLASSES}>
          RentIt is a peer-to-peer marketplace where users list items they own for other users to
          rent, and browse and book items listed by others. RentIt provides the platform that
          connects renters and owners. RentIt is not a party to the rental agreement formed
          between a renter and an owner when a booking is made.
        </p>

        <h2 className={HEADING_CLASSES}>Eligibility</h2>
        <p className={BODY_CLASSES}>
          You must be at least 13 years old to create an account. If you are under 18, you may
          only use RentIt with the involvement and consent of a parent or legal guardian, who
          accepts responsibility for your use of the platform, including any listings you create,
          bookings you make, and interactions with other users. RentIt does not currently verify
          guardian consent or age beyond what you self-report at signup.
        </p>

        <h2 className={HEADING_CLASSES}>Your Account</h2>
        <p className={BODY_CLASSES}>
          You are responsible for the accuracy of the information on your profile, and for
          keeping your login credentials secure. You are responsible for activity that happens
          under your account.
        </p>

        <h2 className={HEADING_CLASSES}>Listings</h2>
        <p className={BODY_CLASSES}>
          If you list an item for rent, you are responsible for:
        </p>
        <ul className={LIST_CLASSES}>
          <li>The accuracy of your listing (description, condition, price, availability, photos)</li>
          <li>Only listing items you own or are otherwise authorized to rent out</li>
          <li>Not listing anything illegal, dangerous, stolen, or prohibited under applicable law</li>
          <li>Honoring bookings you accept</li>
        </ul>
        <p className={BODY_CLASSES}>
          RentIt does not inspect, verify, or take ownership of listed items, and does not
          guarantee the condition, safety, or legality of any listed item.
        </p>

        <h2 className={HEADING_CLASSES}>Bookings</h2>
        <p className={BODY_CLASSES}>
          When you book an item, you&apos;re entering into a rental agreement directly with the
          item&apos;s owner, not with RentIt. You&apos;re responsible for:
        </p>
        <ul className={LIST_CLASSES}>
          <li>
            Using the item only as intended and returning it in the condition you received it,
            barring normal wear
          </li>
          <li>Paying the agreed price for the rental</li>
          <li>Communicating honestly with the owner about the booking</li>
        </ul>

        <h2 className={HEADING_CLASSES}>Payments</h2>
        <p className={BODY_CLASSES}>
          RentIt does not currently process payments directly through the platform. Payment
          arrangements between a renter and an owner are handled outside the platform for now.
          This section will be updated, and a separate payments-specific section added, before
          any in-platform payment processing goes live.
        </p>

        <h2 className={HEADING_CLASSES}>Reviews</h2>
        <p className={BODY_CLASSES}>
          Reviews must reflect your genuine experience with a specific completed booking. Do not
          post a review for a booking that did not happen, or write a review on behalf of someone
          else. RentIt may remove reviews that clearly violate this or that are abusive, but does
          not proactively fact-check every review submitted.
        </p>

        <h2 className={HEADING_CLASSES}>Prohibited Conduct</h2>
        <p className={BODY_CLASSES}>
          You may not use RentIt to:
        </p>
        <ul className={LIST_CLASSES}>
          <li>List or attempt to rent anything illegal</li>
          <li>Harass, threaten, or abuse another user</li>
          <li>Misrepresent your identity, an item, or a booking</li>
          <li>Attempt to circumvent, disrupt, or abuse the platform&apos;s technical systems</li>
        </ul>

        <h2 className={HEADING_CLASSES}>Disputes Between Users</h2>
        <p className={BODY_CLASSES}>
          RentIt is not responsible for resolving disputes between a renter and an owner over an
          item&apos;s condition, a missed handoff, damage, or non-payment. Users are encouraged to
          resolve disputes directly. RentIt may, at its discretion, suspend or remove an account
          involved in a clear violation of these terms, but does not act as an arbitrator or
          guarantee any outcome in a dispute between users.
        </p>

        <h2 className={HEADING_CLASSES}>Limitation of Liability</h2>
        <p className={BODY_CLASSES}>
          RentIt provides the platform &quot;as is.&quot; To the extent permitted by applicable
          law, RentIt is not liable for damages, losses, or disputes arising from a rental
          transaction between users, the condition of a listed item, or the conduct of any user.
          This section is intentionally general and should be reviewed and made specific by a
          lawyer before this policy is treated as final, particularly regarding what liability
          protections are actually enforceable under Nigerian law.
        </p>

        <h2 className={HEADING_CLASSES}>Account Termination</h2>
        <p className={BODY_CLASSES}>
          RentIt may suspend or terminate an account that violates these terms. You may delete
          your own account at any time; see the Privacy Policy for what happens to your data
          when you do.
        </p>

        <h2 className={HEADING_CLASSES}>Governing Law</h2>
        <p className={BODY_CLASSES}>
          These terms are governed by the laws of Nigeria. Any dispute arising from these terms
          or use of RentIt will be handled under Nigerian law, subject to further specification
          (venue, arbitration vs court, etc) by a lawyer before this policy is finalized.
        </p>

        <h2 className={HEADING_CLASSES}>Changes to These Terms</h2>
        <p className={BODY_CLASSES}>
          If these terms change meaningfully, this page will be updated and the &quot;Last
          updated&quot; date above will reflect that.
        </p>

        <h2 className={HEADING_CLASSES}>Contact</h2>
        <p className={BODY_CLASSES}>
          Questions about these terms can be sent through the{" "}
          <Link to="/contact" className="text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded">
            Contact page
          </Link>
          .
        </p>
      </Container>
    </div>
  );
}
