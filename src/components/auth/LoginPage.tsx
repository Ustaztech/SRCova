import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Globe,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
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

  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      showToast('success', 'Authentication Successful', 'Welcome to the SRCova Selection Portal.');
      onSuccess();
    } else {
      setErrorMessage(res.error || 'Failed to authenticate.');
      showToast('danger', 'Login Failed', res.error || 'Invalid credentials.');
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSuccess(true);
    setTimeout(() => {
      setIsResetOpen(false);
      setResetSuccess(false);
      setResetEmail('');
      showToast('info', 'Password Reset Requested', 'Contact your ICT Directorate to verify identity.');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col justify-between selection:bg-[#D5AC49]/20 selection:text-[#003B2B]">
      {/* Top Bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <BrandLogo variant="horizontal" height={42} className="cursor-pointer" />
        <button
          onClick={onGoToLanding}
          className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-[#075B40]" />
          <span>Back to Public Site</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden animate-scale-up">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#003B2B] to-[#075B40] px-6 py-6 text-white text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D5AC49] text-[11px] font-bold border border-white/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Academic Governance Portal</span>
            </div>
            <h2 className="text-xl font-bold font-display tracking-tight text-white">
              Authorized Sign In
            </h2>
            <p className="text-xs text-emerald-100 mt-1 font-medium">
              Academic Research Platform · Case Study: NSUK
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Authorized Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. support.srcover@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40] transition-all bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsResetOpen(true)}
                    className="text-[11px] text-[#075B40] hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40] transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#075B40]/20 mt-2"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                <ArrowRight className="w-4 h-4 text-[#D5AC49]" />
              </button>
            </form>

            {/* Research Governance Notice */}
            <div className="pt-4 border-t border-gray-100 text-center">
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Academic Research Prototype evaluating digital merit selection in higher education.
                Institutional credentials are provisioned by the Lead Administrator.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-gray-400">
        © 2026 SRCova Governance Platform — Academic Research Prototype (Case Study: NSUK). Authorized Access Only.
      </footer>

      {/* Password Reset Modal */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-xs space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 font-display">Staff Password Reset</h3>
            {resetSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Reset verification dispatched to university email.</span>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3">
                <p className="text-gray-500 text-[11px]">
                  Enter your registered email address to receive password reset instructions.
                </p>
                <input
                  type="email"
                  required
                  placeholder="e.g. support.srcover@gmail.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetOpen(false)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-lg"
                  >
                    Send Instructions
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
