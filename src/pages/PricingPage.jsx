/*
|--------------------------------------------------------------------------
| PricingPage.jsx
|--------------------------------------------------------------------------
|
| Placeholder pricing page for RentIt — informs visitors that pricing
| details are not yet available. No fabricated tiers or fees.
|
| Route: /pricing (public, under PublicLayout)
| Responsibilities: Honest "coming soon" message with CTA back to browse
| Dependencies: Button, Container from design system, React Router Link
|--------------------------------------------------------------------------
*/

import { Link } from "react-router-dom";
import { Button, Container } from "../design";

export default function PricingPage() {
  return (
    <div className="bg-background min-h-[60vh] flex items-center justify-center">
      <Container className="max-w-lg text-center">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-4">
          Pricing is coming soon
        </h1>
        <p className="text-text-secondary leading-relaxed mb-8">
          RentIt is currently free to use while the platform is being built out.
          Pricing details will be shared here once they&apos;re finalized.
        </p>
        <Link to="/">
          <Button size="lg">Browse Listings</Button>
        </Link>
      </Container>
    </div>
  );
}
