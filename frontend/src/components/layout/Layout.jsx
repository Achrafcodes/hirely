import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';

export default function Layout() {
  return (
    <div className="min-h-screen bg-base flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="mx-auto max-w-6xl w-full px-4 py-8 sm:px-6 flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#141415',
            color: '#F4F4F5',
            border: '1px solid #27272A',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#16A34A', secondary: '#F4F4F5' } },
          error:   { iconTheme: { primary: '#B91C1C', secondary: '#F4F4F5' } },
        }}
      />
    </div>
  );
}
