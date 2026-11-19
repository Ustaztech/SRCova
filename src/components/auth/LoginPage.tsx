import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import loginCampus from '../../assets/login-campus.svg';
import { BrandLogo } from '../common/BrandLogo';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  X,
} from 'lucide-react';

interface LoginPageProps {
  onSuccess: (mustChangePassword: boolean) => void;
  onGoToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onGoToLanding }) => {
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAccessHelp, setShowAccessHelp] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await login(email, password);
      if (result.success) {
        showToast('success', 'Signed in', 'Welcome to the staff portal.');
        onSuccess(result.mustChangePassword === true);
      } else {
        setErrorMessage(result.error || 'We could not verify those sign-in details.');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-slate-950">
      <img
        src={loginCampus}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="pointer-events-none fixed inset-0 z-0 h-screen w-full object-cover"
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-br from-slate-950/75 via-emerald-950/70 to-slate-950/80" />

      <header className="relative z-10 mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onGoToLanding}
          aria-label="Return to SRCova home"
          className="rounded-lg bg-white/95 p-2 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <BrandLogo variant="horizontal" height={42} />
        </button>
        <button
          type="button"
          onClick={onGoToLanding}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </button>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-132px)] max-w-6xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:gap-16 lg:px-8">
        <section className="hidden lg:block">
          <div className="max-w-lg">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
              NSUK · Staff access
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-white">
              The staff portal for student representation.
            </h1>
            <p className="mt-5 text-base leading-7 text-white/75">
              Review nominations, verify records and follow each decision through a clear university process.
            </p>
            <div className="mt-9 space-y-4">
              {[
                'Access is limited to authorized university staff.',
                'Your role determines the records and actions available to you.',
                'For account help, contact your university administrator.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-white/90">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/[0.05] sm:p-8">
          <div className="mb-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-slate-950">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use your university-issued staff email and password.
            </p>
          </div>

          {errorMessage && (
            <div role="alert" className="mb-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="staff-email" className="mb-1.5 block text-sm font-medium text-slate-800">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="staff-email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="name@university.edu.ng"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm text-slate-950 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/10"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label htmlFor="staff-password" className="block text-sm font-medium text-slate-800">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowAccessHelp(true)}
                  className="text-xs font-semibold text-emerald-900 hover:underline"
                >
                  Need help signing in?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="staff-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-11 text-sm text-slate-950 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
              {!isLoading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs leading-5 text-slate-500">
              Staff accounts are created by university administrators. Public sign-up is not available.
            </p>
          </div>
        </section>
      </div>

      <footer className="relative z-10 border-t border-white/15 py-4 text-center text-xs text-white/70">
        SRCova · Nasarawa State University, Keffi
      </footer>

      {showAccessHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowAccessHelp(false);
        }}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="access-help-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-900">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 id="access-help-title" className="mt-4 text-lg font-semibold text-slate-950">Account access help</h2>
              </div>
              <button type="button" onClick={() => setShowAccessHelp(false)} aria-label="Close dialog" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Staff accounts are managed by the university. Contact your department administrator or Student Affairs to request access or reset your password.
            </p>
            <button
              type="button"
              onClick={() => setShowAccessHelp(false)}
              className="mt-6 w-full rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-950"
            >
              Close
            </button>
          </section>
        </div>
      )}
    </main>
  );
};
