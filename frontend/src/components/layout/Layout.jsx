import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';
import { resendVerification } from '../../api';

function VerificationBanner() {
  const { user } = useAuth();
  if (!user || user.isVerified) return null;

  const handleResend = async () => {
    try {
      await resendVerification();
      toast.success('Verification email sent!');
    } catch {
      toast.error('Failed to send email. Try again.');
    }
  };

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 text-center text-sm text-yellow-600 dark:text-yellow-400">
      Please verify your email address.{' '}
      <button onClick={handleResend} className="underline font-medium hover:no-underline">
        Resend verification email
      </button>
    </div>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-base flex flex-col">
      <VerificationBanner />
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
