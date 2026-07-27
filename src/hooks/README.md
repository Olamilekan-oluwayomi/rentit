# Hooks — Custom Hooks Pattern

There is no global `src/hooks/` directory. Custom hooks live **next to the code they serve**.

## Where Hooks Live

| Location | Purpose | Examples |
|----------|---------|----------|
| `src/features/<feature>/hooks/` | Feature-specific data fetching and state management | `useListings`, `useBookings`, `useMessages`, `useProfile` |
| `src/shared/hooks/` | Shared logic used across multiple features | `useCurrentLocation` |

## Pattern

```
src/
├── features/
│   ├── listings/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   ├── useListings.js      # Fetch/search listings
│   │   │   └── useListing.js       # Fetch single listing
│   │   └── ...
│   ├── bookings/
│   │   ├── hooks/
│   │   │   ├── useBookings.js
│   │   │   ├── useAvailability.js
│   │   │   ├── useCreateBooking.js
│   │   │   └── useListingBookingStats.js
│   │   └── ...
│   ├── messages/
│   │   ├── hooks/
│   │   │   ├── useConversations.js
│   │   │   ├── useMessages.js
│   │   │   ├── useSendMessage.js
│   │   │   ├── useContactOwner.js
│   │   │   └── useUnreadCount.js
│   │   └── ...
│   ├── profile/
│   │   ├── hooks/
│   │   │   ├── useProfile.js
│   │   │   └── useRequireCompleteProfile.js
│   │   └── ...
│   ├── reviews/
│   │   ├── hooks/
│   │   │   └── useReviewEligibility.js
│   │   └── ...
│   └── landing/
│       ├── hooks/
│       │   ├── useCategoryCounts.js
│       │   └── useLandingStats.js
│       └── ...
└── shared/
    └── hooks/
        └── useCurrentLocation.js   # Shared hook used across features
```

## Rules

1. **Feature hooks stay in the feature** — If a hook is only used by one feature, put it in that feature's `hooks/` folder.
2. **Move to shared when reused** — If a second feature needs the same hook, extract it to `src/shared/hooks/`.
3. **Hooks are composable** — Feature hooks often call shared hooks or lib functions internally.
4. **No barrel exports** — Import hooks directly from their file path (e.g. `import { useListings } from "./hooks/useListings"`).
