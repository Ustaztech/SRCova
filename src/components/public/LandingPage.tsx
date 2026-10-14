import React, { useState } from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { WelcomeModal } from './WelcomeModal';
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  GraduationCap,
  Award,
  Lock,
  ArrowRight,
  FileText,
  ChevronDown,
  Building2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface LandingPageProps {
  onGoToLogin: () => void;
  onEnterPortal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin, onEnterPortal }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(true);

  const faqs = [
    {
      q: 'What is SRCova?',
      a: 'SRCova is an academic research project evaluating digital merit selection, academic verification, and governance in higher education, using Nasarawa State University, Keffi (NSUK) as an institutional case study. It transitions traditional paper-based processes into a transparent, merit-driven online workflow.',
    },
    {
      q: 'Does SRCova conduct electronic voting?',
      a: 'No. In alignment with collegiate selection statutes evaluated in this study, the Student Representative Council selection is conducted through rigorous academic verification, faculty screening, departmental representation quotas, and Student Affairs recommendation—not open popular elections.',
    },
    {
      q: 'Who can register and submit candidate nominations?',
      a: 'Only authorized Departmental Officers and Heads of Departments (HODs) can register prospective student candidates and submit official nominations to the Faculty Screening Board.',
    },
    {
      q: 'What are the minimum eligibility criteria?',
      a: 'A candidate must possess a verified CGPA of at least 3.50, hold 200L to 400L standing (no fresh 100L students), have demonstrated course representative or class leadership experience, and maintain a clean university disciplinary record.',
    },
    {
      q: 'How does the faculty verify candidate transcripts?',
      a: 'The Faculty Officer directly audits submitted statements of results against official examination broadsheets before signing off on academic eligibility in the portal.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9F8] text-[#202B28] font-sans">
      {/* Top University Announcement Bar */}
      <div className="bg-[#002D20] text-white py-2.5 px-4 text-xs border-b border-[#075B40]/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-[#D5AC49] animate-pulse shrink-0" />
            <span className="font-bold text-[#D5AC49]">University Notice:</span>
            <span className="hidden sm:inline text-emerald-100 truncate">
              2025/2026 Student Representative Council (SRC) Digital Merit Selection Exercise is officially live.
            </span>
          </div>
          <button
            onClick={() => setIsWelcomeModalOpen(true)}
            className="text-[11px] font-bold text-[#D5AC49] hover:underline flex items-center gap-1.5 shrink-0"
          >
            <span>Read Welcome Message</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="horizontal" height={44} />
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-700">
            <a href="#about" className="hover:text-[#075B40] transition-colors">
              About SRCova
            </a>
            <a href="#why" className="hover:text-[#075B40] transition-colors">
              Why SRCova?
            </a>
            <a href="#features" className="hover:text-[#075B40] transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-[#075B40] transition-colors">
              How It Works
            </a>
            <a href="#eligibility" className="hover:text-[#075B40] transition-colors">
              Eligibility
            </a>
            <a href="#faq" className="hover:text-[#075B40] transition-colors">
              FAQ
            </a>
            <a href="#contact" className="hover:text-[#075B40] transition-colors">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnterPortal}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#003B2B] bg-[#D5AC49] hover:bg-[#B88F28] rounded-xl transition-colors shadow-sm"
            >
              <span>Explore Portal</span>
            </button>
            <button
              onClick={onGoToLogin}
              className="px-4 py-2 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-[#D5AC49]" />
              <span>Staff Login</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-[#F7F9F8] to-[#EEF3F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#075B40]/10 border border-[#075B40]/20 text-[#075B40] text-xs font-bold">
                <Sparkles className="w-4 h-4 text-[#D5AC49]" />
                <span>Higher Education Research Project · Case Study: NSUK</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#003B2B] tracking-tight font-display leading-[1.1]">
                Welcome to <span className="text-[#075B40]">SRCova</span>
              </h1>

              <p className="text-xl sm:text-2xl font-bold text-[#D5AC49] font-display">
                Digital Student Representative Selection Platform
              </p>

              <p className="text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
                An academic research project evaluating digital merit selection and governance in higher education institutions, using Nasarawa State University, Keffi (NSUK) as an empirical case study.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={onEnterPortal}
                  className="px-6 py-3.5 text-xs sm:text-sm font-bold text-[#003B2B] bg-[#D5AC49] hover:bg-[#B88F28] rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#D5AC49]/25 hover:scale-[1.02]"
                >
                  <span>Explore SRCova</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onGoToLogin}
                  className="px-6 py-3.5 text-xs sm:text-sm font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#075B40]/20 hover:scale-[1.02]"
                >
                  <Lock className="w-4 h-4 text-[#D5AC49]" />
                  <span>Staff Login</span>
                </button>
              </div>

              {/* Tagline & Stat Preview */}
              <div className="pt-6 border-t border-gray-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-xs text-gray-500">
                <div>
                  <span className="font-extrabold text-lg text-[#075B40] block">7 Faculties</span>
                  <span>Unified Representation</span>
                </div>
                <div>
                  <span className="font-extrabold text-lg text-[#075B40] block">100% Verified</span>
                  <span>Senate CGPA Audit</span>
                </div>
                <div>
                  <span className="font-extrabold text-lg text-[#075B40] block">Zero Voting</span>
                  <span>Merit-Based Selection</span>
                </div>
              </div>
            </div>

            {/* Right: Official Premium Logo Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative">
                <div className="w-72 sm:w-96 p-6 rounded-3xl bg-white border border-gray-200 shadow-2xl relative z-10 transition-transform duration-300 hover:scale-[1.02]">
                  <BrandLogo variant="premium" className="w-full justify-center" />
                  <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#075B40] block">
                      Smart Selection. Strong Representation.
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      Academic Research Prototype · Case Study: NSUK
                    </span>
                  </div>
                </div>
                {/* Decorative background glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#075B40]/20 to-[#D5AC49]/20 rounded-3xl blur-2xl z-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: About SRCova */}
      <section id="about" className="py-16 bg-white border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold text-[#075B40] uppercase tracking-wider">
              Institutional Overview
            </span>
            <h2 className="text-3xl font-extrabold text-[#003B2B] font-display">
              About the SRCova System
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Evaluating digital governance frameworks in higher education, SRCova bridges the gap
              between departmental leadership and institutional governance, replacing manual
              paper files with authenticated, auditable selection workflows (Case Study: NSUK).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F7F9F8] border border-gray-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#075B40]/10 flex items-center justify-center text-[#075B40]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 font-display">
                Academic Ledger Integrity
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Prevents falsification of academic records by requiring authorized Faculty Officers
                to verify CGPA standing against departmental broadsheets before forwarding.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F9F8] border border-gray-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#D5AC49]/20 flex items-center justify-center text-[#003B2B]">
                <Sparkles className="w-6 h-6 text-[#D5AC49]" />
              </div>
              <h3 className="text-base font-bold text-gray-900 font-display">
                Automated Senate Rules Engine
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Evaluates candidate dossiers against Senate-configured rules: 3.50 CGPA baseline,
                course rep credentials, and administrative clearance records.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F9F8] border border-gray-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 font-display">
                Equitable Faculty Quotas
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Guarantees balanced representation across all 7 NSUK faculties, eliminating
                disproportionate dominance and upholding statutory collegiate balance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Why SRCova? */}
      <section id="why" className="py-16 bg-[#EEF3F0]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold text-[#075B40] uppercase tracking-wider">
              Institutional Impact
            </span>
            <h2 className="text-3xl font-extrabold text-[#003B2B] font-display">
              Why Digital Selection? (Case Study: NSUK)
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Modernizing student representative selection with transparency, accountability, and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-xs">
              <div className="text-2xl font-black text-[#075B40] font-display mb-1">01</div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">Eliminates Paper Friction</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Eliminates lost transcripts, misplaced physical clearance forms, and manual endorsement queues.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-xs">
              <div className="text-2xl font-black text-[#075B40] font-display mb-1">02</div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">Prevents Electoral Discord</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Avoids political volatility, vote rigging controversies, and student unrest by enforcing academic meritocracy.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-xs">
              <div className="text-2xl font-black text-[#075B40] font-display mb-1">03</div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">Instant Audit Tracking</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Every verification remark, recommendation, and resolution is permanently timestamped in the audit log.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-xs">
              <div className="text-2xl font-black text-[#075B40] font-display mb-1">04</div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">Verifiable Credentials</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Issues authenticated PDF submission receipts and gazetted council appointment lists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section id="workflow" className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold text-[#075B40] uppercase tracking-wider">
              Complete End-to-End Pipeline
            </span>
            <h2 className="text-3xl font-extrabold text-[#003B2B] font-display">
              How the Selection Process Works
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              A 6-stage structured administrative journey from departmental nomination to final Council confirmation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-center">
            {[
              {
                step: '1',
                title: 'Dept Nomination',
                desc: 'HOD registers candidate, attaches statement of result, and submits.',
              },
              {
                step: '2',
                title: 'Faculty Audit',
                desc: 'Faculty Officer verifies CGPA and level against examination ledger.',
              },
              {
                step: '3',
                title: 'Eligibility Engine',
                desc: 'Automated evaluation checks 3.50 CGPA, course rep, and clearance.',
              },
              {
                step: '4',
                title: 'DSA Review',
                desc: 'Dean of Student Affairs evaluates dossier and recommends seat.',
              },
              {
                step: '5',
                title: 'Management Ratification',
                desc: 'Vice-Chancellor Selection Board confirms council resolution.',
              },
              {
                step: '6',
                title: 'Official Gazette',
                desc: 'SRC Council list published with official PDF export and seals.',
              },
            ].map((st, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-[#075B40] transition-colors relative"
              >
                <div className="w-8 h-8 rounded-full bg-[#075B40] text-white font-extrabold text-xs flex items-center justify-center mx-auto mb-2 shadow-xs">
                  {st.step}
                </div>
                <h4 className="text-xs font-bold text-gray-900 mb-1">{st.title}</h4>
                <p className="text-[11px] text-gray-500 leading-normal">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Eligibility Criteria */}
      <section id="eligibility" className="py-16 bg-[#F7F9F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold text-[#075B40] uppercase tracking-wider">
              Senate Standards
            </span>
            <h2 className="text-3xl font-extrabold text-[#003B2B] font-display">
              Minimum Institutional Eligibility Criteria
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Only candidates who satisfy all baseline criteria are cleared by the selection engine.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-[#075B40] shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-[#003B2B] block">Minimum Cumulative GPA (CGPA) of 3.50:</strong>
                <p className="text-[11px] text-gray-600">
                  Candidate must be in at least Second Class Upper (2:1) standing verified from official faculty ledgers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-[#075B40] shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-[#003B2B] block">Academic Standing (200L to 400L/500L):</strong>
                <p className="text-[11px] text-gray-600">
                  Must have completed at least one full academic year at NSUK. Fresh 100L students are not eligible.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-[#075B40] shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-[#003B2B] block">Course Representation Track Record:</strong>
                <p className="text-[11px] text-gray-600">
                  Active or prior leadership as Course Representative, Assistant Course Rep, or Student Academic Leader.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-[#075B40] shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-[#003B2B] block">Disciplinary & Administrative Clearance:</strong>
                <p className="text-[11px] text-gray-600">
                  No pending disciplinary sanctions, examination malpractice flags, or university security queries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: FAQ */}
      <section id="faq" className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-3 mb-8">
            <span className="text-xs font-bold text-[#075B40] uppercase tracking-wider">
              Answers & Guidance
            </span>
            <h2 className="text-3xl font-extrabold text-[#003B2B] font-display">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-200 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 bg-gray-50/70 hover:bg-gray-100/70 flex items-center justify-between text-xs font-bold text-gray-900"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-4 bg-white text-xs text-gray-600 leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: Contact */}
      <section id="contact" className="py-16 bg-[#003B2B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#D5AC49] uppercase tracking-wider">
                Institutional Directorate
              </span>
              <h2 className="text-3xl font-extrabold font-display">
                Contact SRCova Administrative Office
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                For administrative enquiries, user provisioning, or eligibility verification clarifications,
                please contact the Student Affairs Division.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-3 text-emerald-100">
                  <MapPin className="w-4 h-4 text-[#D5AC49]" />
                  <span>Student Affairs Division, Senate Building, Main Campus, Keffi, Nasarawa State</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-100">
                  <Mail className="w-4 h-4 text-[#D5AC49]" />
                  <span>support.srcover@gmail.com</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-100">
                  <Phone className="w-4 h-4 text-[#D5AC49]" />
                  <span>+234 803 123 4567</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <h4 className="text-sm font-bold text-white font-display">
                Institutional System Status
              </h4>
              <p className="text-xs text-emerald-200 leading-relaxed">
                This deployment represents the SRCova academic research prototype. Fully operational with real-time persistent data, secure role isolation, and comprehensive audit logging.
              </p>
              <div className="pt-2 flex gap-3">
                <button
                  onClick={onGoToLogin}
                  className="w-full py-2.5 text-xs font-bold bg-[#D5AC49] text-[#003B2B] rounded-xl hover:bg-[#B88F28] transition-colors"
                >
                  Authorized Staff Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#00271c] text-white border-t border-emerald-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/80">
          <div className="flex items-center gap-3">
            <BrandLogo variant="horizontal" height={32} />
            <span>• Academic Research Study · Case Study: NSUK</span>
          </div>

          <div className="text-center sm:text-right">
            <p>© 2026 SRCova Research Project. All rights reserved.</p>
            <p className="text-[10px] text-emerald-400/60 mt-0.5">
              Academic Research Prototype — Higher Education Governance Framework (Case Study: NSUK).
            </p>
          </div>
        </div>
      </footer>

      {/* Welcome Pop-up Modal */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onGoToLogin={onGoToLogin}
        onExploreWorkflow={() => {
          const el = document.getElementById('workflow');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
};
