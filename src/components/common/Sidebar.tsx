import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  Award,
  BarChart3,
  Settings,
  ShieldCheck,
  Building2,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Sparkles,
  History,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  const role = currentUser.role;

  // Build role-tailored navigation items
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
      roles: ['SUPER_ADMIN', 'DEPARTMENT_OFFICER', 'FACULTY_OFFICER', 'DEAN_STUDENT_AFFAIRS', 'MANAGEMENT_APPROVER'],
    },
    // Department Specific
    {
      id: 'candidate-registration',
      label: 'Register Candidate',
      icon: <Users className="w-5 h-5 shrink-0" />,
      roles: ['DEPARTMENT_OFFICER', 'SUPER_ADMIN'],
    },
    {
      id: 'nomination-management',
      label: role === 'DEPARTMENT_OFFICER' ? 'Department Nominations' : 'All Nominations',
      icon: <FileText className="w-5 h-5 shrink-0" />,
      roles: ['SUPER_ADMIN', 'DEPARTMENT_OFFICER', 'FACULTY_OFFICER'],
    },
    // Faculty Specific
    {
      id: 'faculty-verification',
      label: 'Academic Verification',
      icon: <CheckSquare className="w-5 h-5 shrink-0" />,
      roles: ['FACULTY_OFFICER', 'SUPER_ADMIN'],
    },
    // Student Affairs Specific
    {
      id: 'student-affairs-review',
      label: 'DSA Approval Panel',
      icon: <ShieldCheck className="w-5 h-5 shrink-0" />,
      roles: ['DEAN_STUDENT_AFFAIRS', 'SUPER_ADMIN'],
    },
    // Management Specific
    {
      id: 'final-selection',
      label: 'Final SRC Selection',
      icon: <Award className="w-5 h-5 shrink-0" />,
      roles: ['MANAGEMENT_APPROVER', 'DEAN_STUDENT_AFFAIRS', 'SUPER_ADMIN'],
    },
    // Academic Structure & Staff (Super Admin)
    {
      id: 'academic-structure',
      label: 'Faculties & Depts',
      icon: <Building2 className="w-5 h-5 shrink-0" />,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'staff-management',
      label: 'Staff Accounts',
      icon: <GraduationCap className="w-5 h-5 shrink-0" />,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'eligibility-config',
      label: 'Eligibility Rules',
      icon: <ClipboardList className="w-5 h-5 shrink-0" />,
      roles: ['SUPER_ADMIN', 'DEAN_STUDENT_AFFAIRS'],
    },
    // Reports & Analytics
    {
      id: 'reports',
      label: 'Reports & Exports',
      icon: <BarChart3 className="w-5 h-5 shrink-0" />,
      roles: ['SUPER_ADMIN', 'DEPARTMENT_OFFICER', 'FACULTY_OFFICER', 'DEAN_STUDENT_AFFAIRS', 'MANAGEMENT_APPROVER'],
    },
    // Audit Logs
    {
      id: 'audit-logs',
      label: 'System Audit Logs',
      icon: <History className="w-5 h-5 shrink-0" />,
      roles: ['SUPER_ADMIN'],
    },
    // Settings
    {
      id: 'settings',
      label: 'Settings & Branding',
      icon: <Settings className="w-5 h-5 shrink-0" />,
      roles: ['SUPER_ADMIN'],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 bg-[#003B2B] text-white flex flex-col justify-between border-r border-[#075B40] ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Branding Section */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#075B40]/80">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <BrandLogo variant="vector" height={36} />
              <div className="truncate">
                <span className="font-extrabold text-base tracking-tight text-white font-display block leading-tight">
                  SRCova
                </span>
                <span className="text-[10px] text-[#D5AC49] tracking-wider uppercase font-semibold block">
                  NSUK Portal
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto">
              <BrandLogo variant="vector" height={32} />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
          {visibleItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#075B40] text-white shadow-sm shadow-[#075B40]/50 border-l-4 border-l-[#D5AC49]'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                {item.icon}
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile card & logout */}
      <div className="p-3 border-t border-[#075B40]/80 bg-[#003124]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#075B40] text-[#D5AC49] flex items-center justify-center font-bold text-sm shrink-0 border border-[#D5AC49]/40">
            {currentUser.fullName.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {currentUser.fullName}
              </p>
              <p className="text-[10px] text-[#D5AC49] truncate mt-0.5">
                {currentUser.title || currentUser.role.replace(/_/g, ' ')}
              </p>
            </div>
          )}
          <button
            onClick={() => {
              logout();
              onNavigate('login');
            }}
            title="Log out"
            className="p-1.5 text-white/60 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
