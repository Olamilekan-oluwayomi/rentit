# Features — Feature-Based Architecture

Each feature is a self-contained module with its own components, hooks, context (if needed), and logic. This keeps concerns isolated and makes features easy to add, remove, or test independently.

## Directory Structure

```
features/
├── auth/        # Authentication (login, register, password reset, routes)
├── bookings/    # Booking flow (availability, create, manage)
├── landing/     # Public landing page sections
├── listings/    # Listing CRUD, search, filters, detail
├── messages/    # Inbox, conversations, messaging
├── profile/     # User profile (view, edit, completion overlay)
└── reviews/     # Reviews and ratings
```

### Feature Anatomy

Each feature typically contains:

| Directory | Purpose |
|-----------|---------|
| `components/` | Feature-specific UI components |
| `hooks/` | Feature-specific React hooks (data fetching, state management) |
| `context/` | React context providers for cross-component state within the feature |

Example — `listings/`:
```
listings/
├── components/
│   ├── ActiveFilters.jsx
│   ├── CategoryFilter.jsx
│   ├── ImageGallery.jsx
│   ├── ListingCard.jsx
│   ├── ListingForm.jsx
│   └── ...
├── hooks/
│   ├── useListing.js
│   └── useListings.js
```

## Cross-Feature Communication

Features do **not** import directly from each other. Communication happens through:

1. **Shared contexts** — `AuthContext` (provides user state) is consumed by any feature. `ToastContext` for notifications.
2. **Props** — Parent pages pass data down to child components from different domains.
3. **Shared library** — `src/shared/lib/` for Supabase client, constants, and validations.

## Feature List

| Feature | Context | Key Components |
|---------|---------|----------------|
| `auth` | `AuthContext` | `LoginPage`, `RegisterPage`, `ProtectedRoute`, `GuestRoute`, `ForgotPasswordPage`, `ResetPasswordPage`, `EmailConfirmationPage` |
| `bookings` | — | `AvailabilityCalendar`, `StatusBadge` |
| `landing` | — | `FAQSection`, `TestimonialsSection` |
| `listings` | — | `ListingCard`, `ListingGrid`, `ListingDetailPage`, `ListingForm`, `NewListingPage`, `EditListingPage`, `ImageUpload`, `Filters` |
| `messages` | — | `MessageThread`, `MessageInput` |
| `profile` | `ProfileContext` | `ProfilePage`, `ProfileForm`, `ProfileAvatar`, `ProfileHeader`, `ProfileCompletionOverlay` |
| `reviews` | — | `ReviewsSection`, `ReviewForm`, `ReviewPrompt` |

## Best Practices

- **No cross-feature imports** — If two features need to share logic, extract it to `src/shared/`.
- **Feature hooks** — Keep data fetching hooks inside the feature folder, not in a global `src/hooks/`.
- **Feature contexts** — Only create a context if state needs to be shared across multiple components within the feature.
- **Co-locate tests** — Place test files next to the component or hook they test.
- **Keep features focused** — If a feature grows too large, consider splitting it.
