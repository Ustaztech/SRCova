import React from 'react';
import { BrandLogo } from '../common/BrandLogo';
import {
  X,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Award,
  CheckCircle2,
  ArrowRight,
  Lock,
  Building2,
  FileCheck2,
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToLogin: () => void;
  onExploreWorkflow: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onGoToLogin,
  onExploreWorkflow,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Header Banner */}
        <div className="relative bg-gradient-to-br from-[#003B2B] via-[#075B40] to-[#00281D] px-6 sm:px-8 pt-8 pb-7 text-white overflow-hidden">
          {/* Subtle Background Pattern & Gold Accents */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#D5AC49]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-[#138A63]/20 rounded-full blur-xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-emerald-200/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close welcome notice"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D5AC49]/20 border border-[#D5AC49]/40 text-[#D5AC49] text-[11px] font-bold tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D5AC49]" />
            <span>Official University Notice • 2025/2026 Session</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shrink-0 hidden sm:block">
              <BrandLogo variant="vector" height={42} />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white leading-tight">
                Welcome to <span className="text-[#D5AC49]">SRCova</span>
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-emerald-200 mt-1">
                Nasarawa State University, Keffi — Student Representative Selection System
              </p>
              <p className="text-[12px] text-[#D5AC49] font-medium italic mt-0.5">
                "Smart Selection. Strong Representation."
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 bg-white">
          {/* Introductory Message */}
          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-2">
            <p>
              We welcome university officers, faculty deans, heads of departments, and student representatives to the official <strong>SRCova Digital Portal</strong>.
            </p>
            <p className="text-gray-600">
              In accordance with NSUK University Statutes, SRCova digitizes the entire lifecycle of the Student Representative Council selection—transitioning from traditional paper applications to an auditable, merit-driven workflow.
            </p>
          </div>

          {/* Institutional Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-3.5 rounded-2xl bg-[#F7F9F8] border border-gray-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-[#075B40] shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">100% Merit & Verification</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                  Nominations are verified against official examination broadsheets before screening.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F9F8] border border-gray-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-800 shrink-0 mt-0.5">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Minimum 3.50 CGPA</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                  Strict academic standing from 200L–400L with leadership experience.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F9F8] border border-gray-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-800 shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Faculty Representation</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                  Balanced departmental and faculty quotas ensure equitable governance across campus.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F9F8] border border-gray-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-800 shrink-0 mt-0.5">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Real-Time Auditing</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                  Every submission, review timestamp, and decision is recorded in persistent institutional logs.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
            <button
              onClick={() => {
                onClose();
                onExploreWorkflow();
              }}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-center"
            >
              Learn Selection Guidelines
            </button>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-center"
              >
                Continue to Site
              </button>
              <button
                onClick={() => {
                  onClose();
                  onGoToLogin();
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#075B40]/20"
              >
                <Lock className="w-3.5 h-3.5 text-[#D5AC49]" />
                <span>Staff Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
