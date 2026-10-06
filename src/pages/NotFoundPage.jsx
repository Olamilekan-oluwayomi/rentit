/*
|--------------------------------------------------------------------------
| NotFoundPage.jsx
|--------------------------------------------------------------------------
|
| Catch-all route for unknown URLs. Without this, React Router renders a
| blank <main> for any path that does not match a route, which reads as a
| broken page rather than a wrong address.
|
| Route: * (matched last, after every other route in App.jsx)
| Responsibilities: Explain the 404 and offer routes back into the app
| Dependencies: Button, Container from design system, React Router Link
| Notes: Renders the path that was missed so a typo is easy to spot. The
|   path is rendered as text, never interpolated into markup.
|--------------------------------------------------------------------------
*/

import { Link, useLocation } from "react-router-dom";
import { Button, Container } from "../design";

export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <div className="bg-background min-h-[60vh] flex items-center justify-center">
      <Container className="max-w-lg text-center">
        <p className="font-mono text-sm text-text-muted mb-2">404</p>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-4">
          Page not found
        </h1>
        <p className="text-text-secondary leading-relaxed mb-2">
          There&apos;s nothing at this address.
        </p>
        <p className="font-mono text-sm text-text-muted break-all mb-8">{pathname}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button size="lg">Browse Listings</Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
