/*
|--------------------------------------------------------------------------
| AuthLayout.jsx
|--------------------------------------------------------------------------
|
| Page layout for authentication pages (login, register, forgot/reset password,
| email confirmation). Renders a centered card with a logo in the top-left
| corner.
|
| Route: /login, /register, /forgot-password, /reset-password, /confirm.
|   These routes deliberately sit OUTSIDE the PublicLayout route group so this
|   layout is the entire page — see App.jsx.
| Responsibilities: Provide consistent, chrome-free auth page framing
| Dependencies: Logo component, IconButton, useTheme
| Notes: Minimal layout without Navbar or Footer. It carries its own theme
|        toggle because the Navbar that used to provide one is not rendered on
|        these routes.
|
|--------------------------------------------------------------------------
*/

import { Moon, Sun } from "lucide-react";
import Logo from "../components/layout/Logo";
import { IconButton } from "../design";
import { useTheme } from "../shared/contexts/ThemeContext";

export default function AuthLayout({ children }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-text-primary">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
        <Logo />
      </div>
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-10">
        <IconButton
          icon={theme === "dark" ? Sun : Moon}
          label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
        />
      </div>
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}