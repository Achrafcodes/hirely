import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyEmail } from '../api';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center animate-fade-in-up">
        {status === 'loading' && (
          <div className="flex justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        )}
        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
            <h1 className="text-h2 text-text-primary mb-2">Email verified!</h1>
            <p className="text-body text-text-secondary mb-6">Your account is now active.</p>
            <Link
              to="/login"
              className="inline-block bg-accent hover:bg-accent-hover text-base font-medium py-2.5 px-8 rounded-md transition-all duration-150"
            >
              Sign in
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4 text-2xl">✕</div>
            <h1 className="text-h2 text-text-primary mb-2">Link expired</h1>
            <p className="text-body text-text-secondary mb-6">This verification link is invalid or has expired.</p>
            <Link
              to="/login"
              className="inline-block text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
