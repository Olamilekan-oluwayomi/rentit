/*
 * InboxPage — regression test for conversation-row navigation.
 *
 * Covers the fix for: after adding profile navigation to the avatar/name,
 * clicks on the row must still open the conversation. Avatar + name should
 * navigate to the counterparty's profile; everything else on the row
 * (title, preview, whitespace) opens the message thread.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

vi.mock("../../features/messages/hooks/useConversations", () => ({
  useConversations: () => ({
    conversations: [
      {
        bookingId: "booking-1",
        listing: { title: "Professional Camera" },
        counterparty: { id: "user-9", full_name: "Alex Owner", avatar_url: null },
        isRenter: false,
        lastMessage: "Is it still available?",
        lastMessageAt: new Date().toISOString(),
        lastSenderIsMe: false,
        unreadCount: 1,
        status: "pending",
      },
    ],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("../../features/messages/hooks/useDeleteConversation", () => ({
  useDeleteConversation: () => ({ deleteConversation: vi.fn(), deleting: false }),
}));

vi.mock("../../utils/storage", () => ({
  getAvatarUrl: () => null,
}));

vi.mock("../../shared/components/AnimatedList", () => ({
  default: ({ children }) => <div>{children}</div>,
  AnimatedListItem: ({ children }) => <div>{children}</div>,
}));

import InboxPage from "../../pages/InboxPage";

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
}

function renderInbox() {
  return render(
    <MemoryRouter initialEntries={["/inbox"]}>
      <LocationProbe />
      <Routes>
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/booking/:id" element={<div />} />
        <Route path="/users/:id" element={<div />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function waitForLocation(expected) {
  await waitFor(() => {
    expect(screen.getByTestId("current-location")).toHaveTextContent(expected);
  });
}

describe("Inbox conversation row navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the row as a keyboard-focusable link that opens the conversation", async () => {
    const user = userEvent.setup();
    renderInbox();

    const row = await screen.findByText("Professional Camera").then((el) => el.closest('[role="link"]'));
    expect(row).toHaveAttribute("role", "link");
    expect(row).toHaveAttribute("tabindex", "0");

    await user.click(row);
    await waitForLocation("/booking/booking-1");

    // keyboard activation (Enter) on the row opens the conversation
    await user.tab();
    await user.keyboard("{Enter}");
    await waitForLocation("/booking/booking-1");
  });

  it("clicking the avatar navigates to the counterparty profile", async () => {
    const user = userEvent.setup();
    renderInbox();

    const avatar = await screen.findByRole("button", { name: /view alex owner's profile/i });
    await user.click(avatar);
    await waitForLocation("/users/user-9");
  });

  it("clicking the counterparty name navigates to their profile", async () => {
    const user = userEvent.setup();
    renderInbox();

    const name = await screen.findByRole("button", { name: /alex owner · renter/i });
    await user.click(name);
    await waitForLocation("/users/user-9");
  });

  it("clicking the listing title opens the conversation", async () => {
    const user = userEvent.setup();
    renderInbox();

    const title = await screen.findByText("Professional Camera");
    await user.click(title);
    await waitForLocation("/booking/booking-1");
  });

  it("clicking the last-message preview opens the conversation", async () => {
    const user = userEvent.setup();
    renderInbox();

    const preview = await screen.findByText(/is it still available/i);
    await user.click(preview);
    await waitForLocation("/booking/booking-1");
  });

  it("clicking the row whitespace opens the conversation", async () => {
    const user = userEvent.setup();
    renderInbox();

    const row = await screen.findByText("Professional Camera").then((el) => el.closest('[role="link"]'));
    await user.click(row, { position: { x: 5, y: 5 } });
    await waitForLocation("/booking/booking-1");
  });
});
