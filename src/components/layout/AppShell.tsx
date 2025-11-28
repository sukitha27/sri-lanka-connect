// src/components/layout/AppShell.tsx
import { Header } from './Header';
import { Footer } from './Footer';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
};