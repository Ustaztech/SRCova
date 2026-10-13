import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { BrandLogo } from './BrandLogo';
import {
  Bell,
  Search,
  Globe,
  ChevronDown,
  UserCheck,
  LogOut,
  Menu,
  Shield,
  Layers,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onNavigateView?: (view: string) => void;
  activeView?: string;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNavigateView,
  activeView,
  onSearch,
}) => {
  const { currentUser, logout, switchUser, demoUsers } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'DEPARTMENT_OFFICER':
        return { label: 'HOD / Dept Officer', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'FACULTY_OFFICER':
        return { label: 'Dean / Faculty Officer', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'DEAN_STUDENT_AFFAIRS':
        return { label: 'Dean Student Affairs', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'MANAGEMENT_APPROVER':
        return { label: 'Management Approver', bg: 'bg-amber-50 text-[#003B2B] border-[#D5AC49]' };
    }
  };

  const currentRoleMeta = currentUser ? getRoleBadge(currentUser.role) : null;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200/80 shadow-xs">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
        {/* Left: Mobile Menu & Breadcrumb branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <BrandLogo variant="horizontal" height={36} className="cursor-pointer" />
            <div className="hidden sm:block ml-2 pl-3 border-l border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                Nasarawa State University, Keffi
              </span>
              <span className="text-xs font-bold text-[#075B40] block">
                Official Selection Portal
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search (Optional for tables/candidates) */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate, matric no, ref..."
              onChange={(e) => onSearch && onSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40] transition-all"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Public Website Preview Switch */}
          <button
            onClick={() => onNavigateView && onNavigateView('public-landing')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activeView === 'public-landing'
                ? 'bg-[#075B40] text-white border-[#075B40]'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </button>

          {/* Active Institutional Role Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#075B40]/10 text-[#075B40] border border-[#075B40]/20">
            <UserCheck className="w-3.5 h-3.5 text-[#075B40]" />
            <span className="hidden sm:inline">{currentRoleMeta?.label}</span>
            <span className="sm:hidden">{currentUser?.role.split('_')[0]}</span>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowRoleDropdown(false);
                setShowProfileDropdown(false);
              }}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50 animate-scale-up">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-900">
                    Notifications ({notifications.length})
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-[11px] text-[#075B40] hover:underline font-semibold"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 py-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400">
                      No notifications at this time
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.linkTo && onNavigateView) {
                            onNavigateView(n.linkTo.replace('/', ''));
                            setShowNotifDropdown(false);
                          }
                        }}
                        className={`p-2.5 rounded-lg text-xs cursor-pointer hover:bg-gray-50 transition-colors ${
                          !n.isRead ? 'bg-emerald-50/40 font-medium' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-semibold text-gray-900">{n.title}</p>
                          <span className="text-[10px] text-gray-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-1 leading-normal">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowRoleDropdown(false);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#003B2B] text-[#D5AC49] flex items-center justify-center font-bold text-xs ring-2 ring-[#D5AC49]/30">
                {currentUser?.fullName.charAt(0) || 'U'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-scale-up">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-900">{currentUser?.fullName}</p>
                  <p className="text-[11px] text-gray-500 truncate">{currentUser?.email}</p>
                  <span
                    className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full border ${currentRoleMeta?.bg}`}
                  >
                    {currentRoleMeta?.label}
                  </span>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      if (onNavigateView) onNavigateView('settings');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-gray-500" />
                    <span>System Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileDropdown(false);
                      if (onNavigateView) onNavigateView('login');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
