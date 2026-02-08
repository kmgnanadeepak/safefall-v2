import ThemeToggle from '../components/ThemeToggle';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B]">
      <header className="p-4 flex justify-end">
        <ThemeToggle />
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
