import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';

// Public & Auth
import { LandingPage } from './components/public/LandingPage';
import { LoginPage } from './components/auth/LoginPage';

// Dashboards
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { DepartmentDashboard } from './components/dashboards/DepartmentDashboard';
import { FacultyDashboard } from './components/dashboards/FacultyDashboard';
import { StudentAffairsDashboard } from './components/dashboards/StudentAffairsDashboard';
import { ManagementDashboard } from './components/dashboards/ManagementDashboard';

// Modules
import { NominationManagementPage } from './components/nominations/NominationManagementPage';
import { FinalSelectionManagement } from './components/selection/FinalSelectionManagement';
import { ReportsPage } from './components/reports/ReportsPage';
import { StaffManagementPage } from './components/admin/StaffManagementPage';
import { AcademicStructurePage } from './components/admin/AcademicStructurePage';
import { EligibilityConfigPage } from './components/admin/EligibilityConfigPage';
import { AuditLogsPage } from './components/admin/AuditLogsPage';
import { AdminSettingsPage } from './components/settings/AdminSettingsPage';

// Modals
import { CandidateRegistrationModal } from './components/candidates/CandidateRegistrationModal';
import { NominationCreateModal } from './components/nominations/NominationCreateModal';
import { NominationDetailModal } from './components/nominations/NominationDetailModal';
import { NominationReceiptModal } from './components/nominations/NominationReceiptModal';
import { FacultyVerificationModal } from './components/verification/FacultyVerificationModal';
import { StudentAffairsReviewModal } from './components/selection/StudentAffairsReviewModal';
import { CorrectionModal } from './components/nominations/CorrectionModal';

import { Nomination } from './types';
import { DatabaseService } from './db/storage';

const AppContent: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { showToast } = useNotifications();

  // Navigation State (defaults to home page for visitors, dashboard for active staff sessions)
  const [currentView, setCurrentView] = useState<string>(() => {
    try {
      return localStorage.getItem('srcova_auth_user_id') ? 'dashboard' : 'public-landing';
    } catch {
      return 'public-landing';
    }
  });
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

  // Handle Public Landing Page (Home Page)
  if (currentView === 'public-landing') {
    return (
      <>
        <LandingPage
          onGoToLogin={() => setCurrentView('login')}
          onEnterPortal={() => setCurrentView(isAuthenticated ? 'dashboard' : 'login')}
        />
        <ToastContainer />
      </>
    );
  }

  // Handle Login Page
  if (currentView === 'login' || !isAuthenticated) {
    return (
      <>
        <LoginPage
          onSuccess={() => setCurrentView('dashboard')}
          onGoToLanding={() => setCurrentView('public-landing')}
        />
        <ToastContainer />
      </>
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
    <div className="min-h-screen bg-[#F7F9F8] text-[#202B28] flex flex-col">
      {/* Toast notifications container */}
      <ToastContainer />

      {/* Main portal layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Content area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          }`}
        >
          {/* Top Header */}
          <Header
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onNavigateView={(view) => setCurrentView(view)}
            activeView={currentView}
          />

          {/* View Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {renderViewContent()}
          </main>

          {/* Institutional Footer */}
          <footer className="py-4 px-6 border-t border-gray-200/80 bg-white text-center text-xs text-gray-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
              <span>
                SRCova — Academic Research Project (Case Study: NSUK) • Digital Merit Selection Framework
              </span>
              <span className="font-semibold text-[#075B40]">
                Academic Research Prototype • Institutional Pilot
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
