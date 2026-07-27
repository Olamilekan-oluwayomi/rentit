/*
|--------------------------------------------------------------------------
| AuthLayout.jsx
|--------------------------------------------------------------------------
|
| Wrapper layout for authentication pages (login, register, forgot/reset password).
| Renders a centered card with a logo in the top-left corner.
|
| Route: /login, /register, /forgot-password, /reset-password (via GuestRoute wrappers)
| Responsibilities: Provide consistent auth page chrome
| Dependencies: Logo component
| Notes: Minimal layout without Navbar or Footer.
|
|--------------------------------------------------------------------------
*/

import Logo from "../components/layout/Logo";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
        <Logo />
      </div>
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
