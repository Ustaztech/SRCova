import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import loginCampus from '../../assets/login-campus.svg';
import { AlertCircle, ArrowRight, KeyRound, LockKeyhole, LogOut, ShieldCheck } from 'lucide-react';

interface ChangePasswordPageProps {
  onComplete: () => void;
  onSignOut: () => void;
}

export const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({ onComplete, onSignOut }) => {
  const { currentUser, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 12 || newPassword.length > 128) {
      setErrorMessage('Choose a password between 12 and 128 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('The new passwords do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setErrorMessage('Choose a password different from your temporary password.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (!result.success) {
        setErrorMessage(result.error || 'Unable to update your password.');
        return;
      }
      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <img
        src={loginCampus}
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 h-screen w-full object-cover"
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-slate-950/75" />

      <section className="relative z-10 w-full max-w-md rounded-2xl border border-white/60 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
          {currentUser?.fullName}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-950">
          Choose a new password
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          For your security, the temporary password must be replaced before you can continue to the staff portal.
        </p>

        {errorMessage && (
          <div role="alert" className="mt-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="temporary-password" className="mb-1.5 block text-sm font-medium text-slate-800">
              Temporary password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="temporary-password"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-3 text-sm focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/10"
              />
            </div>
          </div>
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-slate-800">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/10"
            />
            <p className="mt-1 text-xs text-slate-500">Use 12 to 128 characters.</p>
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-slate-800">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/10"
            />
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Updating password…' : 'Update password'}
            {!isSaving && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-800" aria-hidden="true" />
          Your password is stored as a one-way hash.
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </section>
    </main>
  );
};
