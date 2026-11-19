import React, { lazy, Suspense, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Nomination } from './types';
import { DatabaseService } from './db/storage';

const LandingPage = lazy(() =>
  import('./components/public/LandingPage').then((module) => ({ default: module.LandingPage }))
);
const LoginPage = lazy(() =>
  import('./components/auth/LoginPage').then((module) => ({ default: module.LoginPage }))
);
const ChangePasswordPage = lazy(() =>
  import('./components/auth/ChangePasswordPage').then((module) => ({ default: module.ChangePasswordPage }))
);
const Header = lazy(() =>
  import('./components/common/Header').then((module) => ({ default: module.Header }))
);
const Sidebar = lazy(() =>
  import('./components/common/Sidebar').then((module) => ({ default: module.Sidebar }))
);
const ToastContainer = lazy(() =>
  import('./components/common/ToastContainer').then((module) => ({ default: module.ToastContainer }))
);
const SuperAdminDashboard = lazy(() =>
  import('./components/dashboards/SuperAdminDashboard').then((module) => ({ default: module.SuperAdminDashboard }))
);
const DepartmentDashboard = lazy(() =>
  import('./components/dashboards/DepartmentDashboard').then((module) => ({ default: module.DepartmentDashboard }))
);
const FacultyDashboard = lazy(() =>
  import('./components/dashboards/FacultyDashboard').then((module) => ({ default: module.FacultyDashboard }))
);
const StudentAffairsDashboard = lazy(() =>
  import('./components/dashboards/StudentAffairsDashboard').then((module) => ({ default: module.StudentAffairsDashboard }))
);
const ManagementDashboard = lazy(() =>
  import('./components/dashboards/ManagementDashboard').then((module) => ({ default: module.ManagementDashboard }))
);
const NominationManagementPage = lazy(() =>
  import('./components/nominations/NominationManagementPage').then((module) => ({ default: module.NominationManagementPage }))
);
const FinalSelectionManagement = lazy(() =>
  import('./components/selection/FinalSelectionManagement').then((module) => ({ default: module.FinalSelectionManagement }))
);
const ReportsPage = lazy(() =>
  import('./components/reports/ReportsPage').then((module) => ({ default: module.ReportsPage }))
);
const StaffManagementPage = lazy(() =>
  import('./components/admin/StaffManagementPage').then((module) => ({ default: module.StaffManagementPage }))
);
const AcademicStructurePage = lazy(() =>
  import('./components/admin/AcademicStructurePage').then((module) => ({ default: module.AcademicStructurePage }))
);
const EligibilityConfigPage = lazy(() =>
  import('./components/admin/EligibilityConfigPage').then((module) => ({ default: module.EligibilityConfigPage }))
);
const AuditLogsPage = lazy(() =>
  import('./components/admin/AuditLogsPage').then((module) => ({ default: module.AuditLogsPage }))
);
const AdminSettingsPage = lazy(() =>
  import('./components/settings/AdminSettingsPage').then((module) => ({ default: module.AdminSettingsPage }))
);
const CandidateRegistrationModal = lazy(() =>
  import('./components/candidates/CandidateRegistrationModal').then((module) => ({ default: module.CandidateRegistrationModal }))
);
const NominationCreateModal = lazy(() =>
  import('./components/nominations/NominationCreateModal').then((module) => ({ default: module.NominationCreateModal }))
);
const NominationDetailModal = lazy(() =>
  import('./components/nominations/NominationDetailModal').then((module) => ({ default: module.NominationDetailModal }))
);
const NominationReceiptModal = lazy(() =>
  import('./components/nominations/NominationReceiptModal').then((module) => ({ default: module.NominationReceiptModal }))
);
const FacultyVerificationModal = lazy(() =>
  import('./components/verification/FacultyVerificationModal').then((module) => ({ default: module.FacultyVerificationModal }))
);
const StudentAffairsReviewModal = lazy(() =>
  import('./components/selection/StudentAffairsReviewModal').then((module) => ({ default: module.StudentAffairsReviewModal }))
);
const CorrectionModal = lazy(() =>
  import('./components/nominations/CorrectionModal').then((module) => ({ default: module.CorrectionModal }))
);

const viewPaths: Record<string, string> = {
  'public-landing': '/',
  'public-about': '/about',
  'public-process': '/process',
  'public-eligibility': '/eligibility',
  login: '/login',
  'change-password': '/change-password',
  dashboard: '/portal',
  'candidate-registration': '/portal/candidates',
  'nomination-management': '/portal/nominations',
  'faculty-verification': '/portal/verification',
  'student-affairs-review': '/portal/review',
  'final-selection': '/portal/selection',
  'academic-structure': '/portal/academic-structure',
  'staff-management': '/portal/staff',
  'eligibility-config': '/portal/eligibility',
  reports: '/portal/reports',
  'audit-logs': '/portal/audit',
  settings: '/portal/settings',
};

const pathViews = Object.fromEntries(
  Object.entries(viewPaths).map(([view, path]) => [path, view])
);

const viewTitles: Record<string, string> = {
  'public-landing': 'SRCova | Student Representative Council Portal',
  'public-about': 'About SRCova | Student Representative Council Portal',
  'public-process': 'Selection process | Student Representative Council Portal',
  'public-eligibility': 'Eligibility | Student Representative Council Portal',
  login: 'Staff sign in | Student Representative Council Portal',
  'change-password': 'Set a new password | SRCova Staff Portal',
  dashboard: 'Dashboard | SRCova Staff Portal',
  'nomination-management': 'Nominations | SRCova Staff Portal',
  'final-selection': 'Final selection | SRCova Staff Portal',
  reports: 'Reports | SRCova Staff Portal',
};

const initialView = () => {
  const routeView = pathViews[window.location.pathname];
  if (routeView) return routeView;
  let view = 'public-landing';
  try {
    view = localStorage.getItem('srcova_auth_user_id') ? 'dashboard' : 'public-landing';
  } catch {
    view = 'public-landing';
  }
  window.history.replaceState({ view }, '', viewPaths[view]);
  return view;
};

const isPublicPage = (
  view: string
): view is import('./components/public/LandingPage').PublicPage =>
  view === 'public-landing' ||
  view === 'public-about' ||
  view === 'public-process' ||
  view === 'public-eligibility';

const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading page">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-900/20 border-t-emerald-900" />
  </div>
);

const AppContent: React.FC = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();

  const [currentView, setCurrentViewState] = useState<string>(initialView);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const setCurrentView = (view: string) => {
    setCurrentViewState(view);
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
    const path = viewPaths[view];
    if (path && window.location.pathname !== path) {
      window.history.pushState({ view }, '', path);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentViewState(pathViews[window.location.pathname] || 'public-landing');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = viewTitles[currentView] || 'SRCova Staff Portal';
  }, [currentView]);

  useEffect(() => {
    if (isAuthenticated && currentUser?.mustChangePassword) {
      setCurrentViewState('change-password');
      if (window.location.pathname !== viewPaths['change-password']) {
        window.history.replaceState({ view: 'change-password' }, '', viewPaths['change-password']);
      }
    } else if (currentView === 'change-password') {
      const fallbackView = isAuthenticated ? 'dashboard' : 'login';
      setCurrentViewState(fallbackView);
      window.history.replaceState({ view: fallbackView }, '', viewPaths[fallbackView]);
    }
  }, [currentUser?.mustChangePassword, isAuthenticated, currentView]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modal States
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isNominationModalOpen, setIsNominationModalOpen] = useState(false);
  const [preSelectedStudentId, setPreSelectedStudentId] = useState<string | undefined>();

  const [activeNomination, setActiveNomination] = useState<Nomination | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);

  if (isAuthenticated && currentUser?.mustChangePassword) {
    return (
      <Suspense fallback={<PageLoader />}>
        <ChangePasswordPage
          onComplete={() => setCurrentView('dashboard')}
          onSignOut={() => {
            logout();
            setCurrentView('login');
          }}
        />
        <ToastContainer />
      </Suspense>
    );
  }

  if (isPublicPage(currentView)) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LandingPage
          page={currentView}
          onNavigatePage={setCurrentView}
          onGoToLogin={() => setCurrentView('login')}
          onEnterPortal={() => setCurrentView(isAuthenticated ? 'dashboard' : 'login')}
        />
        <ToastContainer />
      </Suspense>
    );
  }

  // Handle Login Page
  if (currentView === 'login' || !isAuthenticated) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage
          onSuccess={(mustChangePassword) =>
            setCurrentView(mustChangePassword ? 'change-password' : 'dashboard')
          }
          onGoToLanding={() => setCurrentView('public-landing')}
        />
        <ToastContainer />
      </Suspense>
    );
  }

  // Active Role Helper
  const role = currentUser?.role || 'SUPER_ADMIN';

  // Navigation handlers
  const handleOpenDetail = (nom: Nomination) => {
    setActiveNomination(nom);
    setIsDetailModalOpen(true);
  };

  const handleOpenReceipt = (nom: Nomination) => {
    setActiveNomination(nom);
    setIsReceiptModalOpen(true);
  };

  const handleOpenVerification = (nom: Nomination) => {
    setActiveNomination(nom);
    setIsVerificationModalOpen(true);
  };

  const handleOpenReview = (nom: Nomination) => {
    setActiveNomination(nom);
    setIsReviewModalOpen(true);
  };

  const handleOpenCorrection = (nom: Nomination) => {
    setActiveNomination(nom);
    setIsCorrectionModalOpen(true);
  };

  // Render role-specific Dashboard
  const renderDashboard = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <SuperAdminDashboard
            onNavigate={(view) => setCurrentView(view)}
            onOpenNomination={handleOpenDetail}
          />
        );
      case 'DEPARTMENT_OFFICER':
        return (
          <DepartmentDashboard
            onOpenRegisterCandidate={() => setIsCandidateModalOpen(true)}
            onOpenCreateNomination={(sId) => {
              setPreSelectedStudentId(sId);
              setIsNominationModalOpen(true);
            }}
            onOpenNominationDetail={handleOpenDetail}
            onOpenCorrectionModal={handleOpenCorrection}
            onViewReceipt={handleOpenReceipt}
          />
        );
      case 'FACULTY_OFFICER':
        return (
          <FacultyDashboard
            onOpenVerificationModal={handleOpenVerification}
            onOpenNominationDetail={handleOpenDetail}
          />
        );
      case 'DEAN_STUDENT_AFFAIRS':
        return (
          <StudentAffairsDashboard
            onOpenReviewModal={handleOpenReview}
            onOpenNominationDetail={handleOpenDetail}
            onNavigateToSelection={() => setCurrentView('final-selection')}
          />
        );
      case 'MANAGEMENT_APPROVER':
        return (
          <ManagementDashboard
            onNavigateToReports={() => setCurrentView('reports')}
            onOpenNominationDetail={handleOpenDetail}
          />
        );
      default:
        return (
          <SuperAdminDashboard
            onNavigate={(view) => setCurrentView(view)}
            onOpenNomination={handleOpenDetail}
          />
        );
    }
  };

  // Render active portal view
  const renderViewContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();

      case 'candidate-registration':
        return (
          <DepartmentDashboard
            onOpenRegisterCandidate={() => setIsCandidateModalOpen(true)}
            onOpenCreateNomination={(sId) => {
              setPreSelectedStudentId(sId);
              setIsNominationModalOpen(true);
            }}
            onOpenNominationDetail={handleOpenDetail}
            onOpenCorrectionModal={handleOpenCorrection}
            onViewReceipt={handleOpenReceipt}
          />
        );

      case 'nomination-management':
        return (
          <NominationManagementPage
            onOpenCreateNomination={() => {
              setPreSelectedStudentId(undefined);
              setIsNominationModalOpen(true);
            }}
            onOpenNominationDetail={handleOpenDetail}
            onOpenVerificationModal={handleOpenVerification}
            onOpenCorrectionModal={handleOpenCorrection}
            onViewReceipt={handleOpenReceipt}
          />
        );

      case 'faculty-verification':
        return (
          <FacultyDashboard
            onOpenVerificationModal={handleOpenVerification}
            onOpenNominationDetail={handleOpenDetail}
          />
        );

      case 'student-affairs-review':
        return (
          <StudentAffairsDashboard
            onOpenReviewModal={handleOpenReview}
            onOpenNominationDetail={handleOpenDetail}
            onNavigateToSelection={() => setCurrentView('final-selection')}
          />
        );

      case 'final-selection':
        return (
          <FinalSelectionManagement
            onNavigateToReports={() => setCurrentView('reports')}
            onOpenDetail={handleOpenDetail}
          />
        );

      case 'academic-structure':
        return <AcademicStructurePage />;

      case 'staff-management':
        return <StaffManagementPage />;

      case 'eligibility-config':
        return <EligibilityConfigPage />;

      case 'reports':
        return <ReportsPage />;

      case 'audit-logs':
        return <AuditLogsPage />;

      case 'settings':
        return <AdminSettingsPage />;

      default:
        return renderDashboard();
    }
  };

  return (
    <Suspense fallback={<PageLoader />}>
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      {/* Toast notifications container */}
      <ToastContainer />

      {/* Main portal layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          isCollapsed={isSidebarCollapsed}
          isOpen={isSidebarOpen}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        {isSidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-slate-950/40 lg:hidden"
            aria-label="Close navigation"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Content area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          }`}
        >
          {/* Top Header */}
          <Header
            onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
            onNavigateView={(view) => setCurrentView(view)}
            activeView={currentView}
          />

          {/* View Body */}
          <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
            {renderViewContent()}
          </main>

          {/* Institutional Footer */}
          <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
              <span>
                SRCova · Student Representative Council
              </span>
              <span className="font-semibold text-emerald-900">
                Nasarawa State University, Keffi
              </span>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Modals */}
      {isCandidateModalOpen && (
        <CandidateRegistrationModal
          isOpen={isCandidateModalOpen}
          onClose={() => setIsCandidateModalOpen(false)}
          onSuccess={(candidate) => {
            // Can immediately prompt to nominate
            setPreSelectedStudentId(candidate.id);
            setIsNominationModalOpen(true);
          }}
        />
      )}

      {isNominationModalOpen && (
        <NominationCreateModal
          isOpen={isNominationModalOpen}
          onClose={() => setIsNominationModalOpen(false)}
          onSuccess={(nomination, isSubmitted) => {
            if (isSubmitted) {
              setActiveNomination(nomination);
              setIsReceiptModalOpen(true);
            }
          }}
          preSelectedStudentId={preSelectedStudentId}
        />
      )}

      {isDetailModalOpen && activeNomination && (
        <NominationDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setActiveNomination(null);
          }}
          nomination={activeNomination}
          onActionTrigger={(action) => {
            setIsDetailModalOpen(false);
            if (action === 'verify') setIsVerificationModalOpen(true);
            if (action === 'review') setIsReviewModalOpen(true);
            if (action === 'correct') setIsCorrectionModalOpen(true);
            if (action === 'select') setCurrentView('final-selection');
          }}
          onViewReceipt={() => {
            setIsDetailModalOpen(false);
            setIsReceiptModalOpen(true);
          }}
        />
      )}

      {isReceiptModalOpen && activeNomination && (
        <NominationReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setActiveNomination(null);
          }}
          nomination={activeNomination}
        />
      )}

      {isVerificationModalOpen && activeNomination && (
        <FacultyVerificationModal
          isOpen={isVerificationModalOpen}
          onClose={() => {
            setIsVerificationModalOpen(false);
            setActiveNomination(null);
          }}
          nomination={activeNomination}
          onSuccess={() => {
            // refresh data
            const refreshed = DatabaseService.getNominationById(activeNomination.id);
            if (refreshed) setActiveNomination(refreshed);
          }}
        />
      )}

      {isReviewModalOpen && activeNomination && (
        <StudentAffairsReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setActiveNomination(null);
          }}
          nomination={activeNomination}
          onSuccess={() => {
            const refreshed = DatabaseService.getNominationById(activeNomination.id);
            if (refreshed) setActiveNomination(refreshed);
          }}
        />
      )}

      {isCorrectionModalOpen && activeNomination && (
        <CorrectionModal
          isOpen={isCorrectionModalOpen}
          onClose={() => {
            setIsCorrectionModalOpen(false);
            setActiveNomination(null);
          }}
          nomination={activeNomination}
          onSuccess={() => {
            const refreshed = DatabaseService.getNominationById(activeNomination.id);
            if (refreshed) setActiveNomination(refreshed);
          }}
        />
      )}
    </div>
    </Suspense>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
