import toast from 'react-hot-toast';
import { resendVerification } from '../api';
import { useAuth } from '../context/AuthContext';

export default function useVerificationGate() {
  const { user } = useAuth();

  const check = () => {
    if (!user || user.isVerified) return true;

    toast((t) => (
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Verify your email first</p>
        <p className="text-xs text-text-secondary">Check your inbox for the verification link.</p>
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              await resendVerification();
              toast.success('Verification email resent!');
            } catch {
              toast.error('Could not resend. Try again.');
            }
          }}
          className="mt-1 text-xs text-accent hover:text-accent-hover transition-colors text-left"
        >
          Resend email →
        </button>
      </div>
    ), { duration: 6000 });

    return false;
  };

  return check;
}
