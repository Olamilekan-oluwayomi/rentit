/*
|--------------------------------------------------------------------------
| ContactPage.jsx
|--------------------------------------------------------------------------
|
| Contact form for RentIt — allows anyone (logged in or out) to send a
| message to the RentIt team. Inserts into contact_messages table.
|
| Route: /contact (public, under PublicLayout)
| Responsibilities: Form validation, Supabase insert, success/error states
| Dependencies: Input, Button, Container from design system,
|               useAuth for pre-filling logged-in user data, supabase client
|--------------------------------------------------------------------------
*/

import { useState, useEffect } from "react";
import { useAuth } from "../features/auth/context/AuthContext";
import { supabase } from "../shared/lib/supabase";
import { Button, Container, Input } from "../design";
import { Send } from "lucide-react";

const MAX_MESSAGE_LENGTH = 2000;

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactPage() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  // Pre-fill from auth profile if logged in
  useEffect(() => {
    if (user) {
      Promise.resolve().then(() => {
        setName(user.user_metadata?.full_name || "");
        setEmail(user.email || "");
      });
    }
  }, [user]);

  const messageCharsRemaining = MAX_MESSAGE_LENGTH - message.length;

  function validate() {
    const next = {};

    if (!name.trim()) {
      next.name = "Name is required.";
    }

    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!validateEmail(email)) {
      next.email = "Please enter a valid email address.";
    }

    if (!message.trim()) {
      next.message = "Message is required.";
    } else if (message.length > MAX_MESSAGE_LENGTH) {
      next.message = `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);

    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      user_id: user?.id ?? null,
    });

    setSubmitting(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    setSubmitted(true);
  }

  // ── Success state ──────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="bg-background min-h-[60vh] flex items-center justify-center">
        <Container className="max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-heading font-bold text-text-primary mb-3">
            Message sent
          </h1>
          <p className="text-text-secondary leading-relaxed">
            Thanks for reaching out. We&apos;ll get back to you soon.
          </p>
        </Container>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────
  return (
    <div className="bg-background min-h-[60vh] flex items-start justify-center pt-14 lg:pt-24 pb-16">
      <Container className="max-w-lg w-full">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-3">
            Get in touch
          </h1>
          <p className="text-text-secondary leading-relaxed">
            Have a question about a listing, a booking, or RentIt in general?
            Send us a message and we&apos;ll get back to you.
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 p-4 rounded-md bg-danger/5 border border-danger/20 text-sm text-danger"
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="Your name"
            autoComplete="name"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <div className="flex flex-col gap-1.5 w-full">
            <Input
              label="Message"
              type="textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              error={errors.message}
              placeholder="How can we help?"
              rows={5}
              maxLength={MAX_MESSAGE_LENGTH}
            />
            <p
              className={`text-xs text-right ${
                messageCharsRemaining < 100
                  ? messageCharsRemaining < 0
                    ? "text-danger"
                    : "text-amber-600"
                  : "text-text-muted"
              }`}
            >
              {messageCharsRemaining} characters remaining
            </p>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={submitting}
            leftIcon={Send}
          >
            Send message
          </Button>
        </form>
      </Container>
    </div>
  );
}
