import React from 'react';
import { BrandLogo } from '../common/BrandLogo';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

export type PublicPage = 'public-landing' | 'public-about' | 'public-process' | 'public-eligibility';

interface LandingPageProps {
  page: PublicPage;
  onNavigatePage: (page: PublicPage) => void;
  onGoToLogin: () => void;
  onEnterPortal: () => void;
}

const navigation: { id: PublicPage; label: string }[] = [
  { id: 'public-landing', label: 'Home' },
  { id: 'public-about', label: 'About' },
  { id: 'public-process', label: 'Selection process' },
  { id: 'public-eligibility', label: 'Eligibility' },
];

const processSteps = [
  {
    number: '01',
    title: 'Department nomination',
    description: 'Department officers register a student and submit the required records.',
  },
  {
    number: '02',
    title: 'Faculty verification',
    description: 'Faculty staff review academic details against official university records.',
  },
  {
    number: '03',
    title: 'Student Affairs review',
    description: 'Student Affairs reviews the verified nomination and records its recommendation.',
  },
  {
    number: '04',
    title: 'Final approval',
    description: 'University management reviews and confirms the final selection.',
  },
  {
    number: '05',
    title: 'Results published',
    description: 'The confirmed list is prepared for publication and official reporting.',
  },
];

const eligibilityCriteria = [
  {
    title: 'Academic standing',
    description: 'Meet the current CGPA and study-level requirements set by the university.',
  },
  {
    title: 'Student leadership',
    description: 'Show relevant experience representing or supporting fellow students.',
  },
  {
    title: 'University clearance',
    description: 'Meet applicable disciplinary and administrative clearance requirements.',
  },
  {
    title: 'Verified records',
    description: 'Provide complete academic information for review by authorized university staff.',
  },
];

const pageMeta: Record<PublicPage, { eyebrow: string; title: string; description: string }> = {
  'public-landing': {
    eyebrow: 'Nasarawa State University, Keffi',
    title: 'Student representation, selected with care.',
    description:
      'A clear, accountable process for reviewing student representatives—from department nomination through university approval.',
  },
  'public-about': {
    eyebrow: 'About the service',
    title: 'A better way to manage student representation.',
    description:
      'SRCova brings nomination records and review steps together in one place, helping authorized university teams work with clarity and consistency.',
  },
  'public-process': {
    eyebrow: 'Selection process',
    title: 'Every nomination follows a clear path.',
    description:
      'University staff can see who is responsible at each stage, what has been reviewed, and what still needs attention.',
  },
  'public-eligibility': {
    eyebrow: 'Candidate eligibility',
    title: 'Know what is required before applying.',
    description:
      'Candidates are considered against the university’s current requirements. Final decisions are made through the established review process.',
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({
  page,
  onNavigatePage,
  onGoToLogin,
  onEnterPortal,
}) => {
  const meta = pageMeta[page];

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="shrink-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800"
            onClick={() => onNavigatePage('public-landing')}
            aria-label="SRCova home"
          >
            <BrandLogo variant="horizontal" height={42} />
          </button>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigatePage(item.id)}
                aria-current={page === item.id ? 'page' : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  page === item.id
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onGoToLogin}
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 sm:inline-flex"
            >
              Staff sign in
            </button>
            <button
              type="button"
              onClick={onEnterPortal}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
            >
              Open staff portal
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <nav aria-label="Mobile navigation" className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigatePage(item.id)}
              aria-current={page === item.id ? 'page' : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium ${
                page === item.id ? 'bg-emerald-50 text-emerald-900' : 'text-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-emerald-950/10 bg-[#f4f7f5]">
          <div className="absolute -right-28 -top-32 h-[440px] w-[440px] rounded-full border-[70px] border-emerald-900/[0.035]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                {meta.eyebrow}
              </p>
              <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-[3.5rem]">
                {meta.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                {meta.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onEnterPortal}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-950"
                >
                  Go to staff portal
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                {page !== 'public-process' && (
                  <button
                    type="button"
                    onClick={() => onNavigatePage('public-process')}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
                  >
                    See how it works
                  </button>
                )}
              </div>
              <div className="mt-9 flex items-center gap-3 border-t border-slate-200 pt-5 text-sm text-slate-600">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-800" aria-hidden="true" />
                <span>For authorized university staff. Candidate accounts are not required.</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-5 rounded-3xl bg-emerald-900/10 blur-2xl" />
              <div className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/[0.07] sm:p-9">
                <BrandLogo variant="premium" className="mx-auto flex justify-center" />
                <div className="mt-7 border-t border-slate-100 pt-6">
                  <p className="text-sm font-semibold text-slate-900">A transparent review process</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Nomination, verification, review and approval—organized in one secure staff portal.
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      ['Clear steps', ClipboardCheck],
                      ['Verified records', FileCheck2],
                    ].map(([label, Icon]) => {
                      const FeatureIcon = Icon as typeof ClipboardCheck;
                      return (
                        <div key={label as string} className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-xs font-medium text-slate-700">
                          <FeatureIcon className="h-4 w-4 shrink-0 text-emerald-800" aria-hidden="true" />
                          {label as string}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {page === 'public-landing' && (
          <>
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">One shared workspace</p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  The right people, reviewing the right information.
                </h2>
                <p className="mt-4 leading-7 text-slate-600">
                  SRCova helps university teams coordinate student nominations, confirm records, and keep a clear history of decisions.
                </p>
              </div>
              <div className="mt-9 grid gap-4 md:grid-cols-3">
                {[
                  { icon: UsersRound, title: 'One connected process', copy: 'Each authorized team handles its part without losing track of the nomination.' },
                  { icon: FileCheck2, title: 'Records in context', copy: 'Review supporting information alongside each decision and status update.' },
                  { icon: GraduationCap, title: 'University-led decisions', copy: 'Final outcomes remain with the designated university reviewers.' },
                ].map(({ icon: Icon, title, copy }) => (
                  <article key={title} className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-slate-900/[0.04]">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-900">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-base font-semibold text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
                  </article>
                ))}
              </div>
            </section>
            <section className="border-y border-slate-200 bg-slate-50">
              <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center lg:px-8">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-slate-950">Questions about the process?</h2>
                  <p className="mt-2 text-sm text-slate-600">Read the process and eligibility guidance before contacting your department.</p>
                </div>
                <button type="button" onClick={() => onNavigatePage('public-eligibility')} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:text-emerald-700">
                  View eligibility guidance <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </section>
          </>
        )}

        {page === 'public-about' && (
          <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Built for university teams</p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-slate-950">A consistent record from start to finish.</h2>
            </div>
            <div className="space-y-5 text-sm leading-7 text-slate-600">
              <p>
                SRCova supports the administration of Student Representative Council nominations at Nasarawa State University, Keffi. It gives authorized staff a shared view of candidate records and review progress.
              </p>
              <p>
                The service is designed to make responsibilities clear, reduce repeated paperwork, and keep decisions traceable. It does not replace university policy or the staff members responsible for each review.
              </p>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-5 text-slate-700">
                <p className="font-semibold text-emerald-950">Access is managed by the university</p>
                <p className="mt-1">Staff accounts are issued by authorized administrators. There is no public candidate sign-up.</p>
              </div>
            </div>
          </section>
        )}

        {page === 'public-process' && (
          <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Five review stages</p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-slate-950">A clear hand-off at every stage.</h2>
            </div>
            <ol className="space-y-3">
              {processSteps.map((step) => (
                <li key={step.number} className="flex gap-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-xs font-bold text-white">{step.number}</span>
                  <div>
                    <h3 className="font-semibold text-slate-950">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {page === 'public-eligibility' && (
          <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Before a nomination</p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-slate-950">Requirements are checked by university staff.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Exact criteria may change under university policy. Confirm the current requirements with your department or Student Affairs.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {eligibilityCriteria.map((criterion) => (
                <article key={criterion.title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-slate-950">{criterion.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{criterion.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-9 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <BrandLogo variant="horizontal" height={34} />
            <span className="border-l border-slate-700 pl-3 text-xs">Nasarawa State University, Keffi</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <button type="button" onClick={() => onNavigatePage('public-about')} className="hover:text-white">About</button>
            <button type="button" onClick={() => onNavigatePage('public-process')} className="hover:text-white">Process</button>
            <button type="button" onClick={() => onNavigatePage('public-eligibility')} className="hover:text-white">Eligibility</button>
            <button type="button" onClick={onGoToLogin} className="inline-flex items-center gap-1 font-semibold text-white hover:text-emerald-200">
              Staff sign in <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
