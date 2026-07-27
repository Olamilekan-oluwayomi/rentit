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
