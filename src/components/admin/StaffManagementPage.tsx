import React, { useState, useEffect, useCallback } from 'react';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { User, UserRole } from '../../types';
import { Modal } from '../common/Modal';
import {
  UserPlus,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  KeyRound,
  Copy,
  RefreshCw,
} from 'lucide-react';
import {
  generateTemporaryPassword,
  hashPassword,
  isValidPassword,
} from '../../utils/passwordSecurity';

export const StaffManagementPage: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const { showToast } = useNotifications();

  const loadData = useCallback(() => ({
    staff: DatabaseService.getUsers(),
    faculties: DatabaseService.getFaculties(),
    departments: DatabaseService.getDepartments(),
  }), []);
  const [staffData, setStaffData] = useState(loadData);
  const { staff, faculties, departments } = staffData;
  const refreshData = useCallback(() => setStaffData(loadData()), [loadData]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [issuedCredential, setIssuedCredential] = useState<{
    fullName: string;
    email: string;
    password: string;
  } | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    title: '',
    role: 'DEPARTMENT_OFFICER' as UserRole,
    facultyId: staffData.faculties[0]?.id || '',
    departmentId: staffData.departments.find(
      (department) => department.facultyId === staffData.faculties[0]?.id
    )?.id || '',
  });

  useEffect(() => {
    if (currentUser?.role !== 'SUPER_ADMIN') return;
    window.addEventListener('srcova:data_changed', refreshData);
    return () => window.removeEventListener('srcova:data_changed', refreshData);
  }, [currentUser?.role, refreshData]);

  const handleFacultyChange = (fId: string) => {
    const depts = DatabaseService.getDepartments(fId);
    setFormData((prev) => ({
      ...prev,
      facultyId: fId,
      departmentId: depts[0]?.id || '',
    }));
  };

  const createTemporaryPassword = () => {
    try {
      return generateTemporaryPassword();
    } catch (error) {
      showToast(
        'danger',
        'Secure password unavailable',
        error instanceof Error ? error.message : 'Use a supported secure browser on HTTPS.'
      );
      return '';
    }
  };

  const handleOpenCreateStaff = () => {
    const password = createTemporaryPassword();
    if (!password) return;
    setFormData((previous) => ({
      ...previous,
      fullName: '',
      email: '',
      password,
      title: '',
    }));
    setIsModalOpen(true);
  };

  const handleGenerateFormPassword = () => {
    const password = createTemporaryPassword();
    if (password) setFormData((previous) => ({ ...previous, password }));
  };

  const handleGenerateResetPassword = () => {
    const password = createTemporaryPassword();
    if (password) setResetPassword(password);
  };

  const handleToggleStatus = (u: User) => {
    if (u.email.toLowerCase() === 'support.srcover@gmail.com') {
      showToast('warning', 'Action Prohibited', 'The primary administrator account (support.srcover@gmail.com) cannot be deactivated.');
      return;
    }
    if (u.id === currentUser?.id) {
      showToast('warning', 'Action Prohibited', 'You cannot deactivate your own active session.');
      return;
    }
    const updated = DatabaseService.updateUser(
      u.id,
      { isActive: !u.isActive },
      currentUser || undefined
    );
    showToast(
      'success',
      'Staff Status Updated',
      `${u.fullName} is now ${updated.isActive ? 'Active' : 'Deactivated'}.`
    );
    refreshData();
    refreshUser();
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== 'SUPER_ADMIN') {
      showToast('danger', 'Not authorized', 'Only a system administrator can create staff accounts.');
      return;
    }
    if (!isValidPassword(formData.password)) {
      showToast('warning', 'Password too short', 'Temporary passwords must be at least 12 characters.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const existing = DatabaseService.getUserByEmail(formData.email);
      if (existing) {
        showToast('danger', 'Duplicate Email', 'A staff account with this email already exists.');
        return;
      }

      const created = DatabaseService.createUser(
        {
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          passwordHash: await hashPassword(formData.password),
          mustChangePassword: true,
          title: formData.title.trim() || 'Institutional Selection Officer',
          role: formData.role,
          facultyId: formData.facultyId || undefined,
          departmentId: formData.departmentId || undefined,
          isActive: true,
        },
        currentUser
      );

      setIssuedCredential({
        fullName: created.fullName,
        email: created.email,
        password: formData.password,
      });
      showToast('success', 'Staff account created', 'Share the temporary password with the staff member securely.');
      setIsModalOpen(false);
      setFormData((previous) => ({ ...previous, fullName: '', email: '', password: '', title: '' }));
      refreshData();
    } catch (error) {
      showToast(
        'danger',
        'Could not create account',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (currentUser?.role !== 'SUPER_ADMIN' || !resetTarget) {
      showToast('danger', 'Not authorized', 'Only a system administrator can reset staff passwords.');
      return;
    }
    if (!isValidPassword(resetPassword)) {
      showToast('warning', 'Password too short', 'Temporary passwords must be at least 12 characters.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const passwordHash = await hashPassword(resetPassword);
      DatabaseService.setTemporaryPassword(resetTarget.id, passwordHash, currentUser);
      setIssuedCredential({
        fullName: resetTarget.fullName,
        email: resetTarget.email,
        password: resetPassword,
      });
      setResetTarget(null);
      setResetPassword('');
      showToast('success', 'Temporary password issued', 'The staff member must choose a new password at next sign-in.');
      refreshData();
      refreshUser();
    } catch (error) {
      showToast(
        'danger',
        'Could not reset password',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleCopyTemporaryPassword = async () => {
    if (!issuedCredential) return;
    try {
      await navigator.clipboard.writeText(issuedCredential.password);
      showToast('success', 'Copied', 'Temporary password copied to clipboard.');
    } catch (error) {
      showToast(
        'danger',
        'Could not copy password',
        error instanceof Error ? error.message : 'Copy it manually from this dialog.'
      );
    }
  };

  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <section role="alert" className="rounded-xl border border-rose-200 bg-white p-6 text-sm text-rose-800">
        You do not have permission to manage staff accounts.
      </section>
    );
  }

  const facMap = new Map(faculties.map((f) => [f.id, f]));
  const deptMap = new Map(departments.map((d) => [d.id, d]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-display tracking-tight">
            Institutional Staff Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
          Manage staff access and issue temporary passwords for university accounts.
          </p>
        </div>

        <button
          onClick={handleOpenCreateStaff}
          className="px-4 py-2 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff Account</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700">Staff Accounts ({staff.length})</span>
          <span className="text-[11px] text-gray-400">Password reset requires a change at next sign-in</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Officer Details</th>
                <th className="px-4 py-3">Institutional Role</th>
                <th className="px-4 py-3">Assigned Unit</th>
                <th className="px-4 py-3">Email & Contact</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3">Password</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((u) => {
                const fac = u.facultyId ? facMap.get(u.facultyId) : undefined;
                const dept = u.departmentId ? deptMap.get(u.departmentId) : undefined;
                return (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{u.fullName}</div>
                      <div className="text-[11px] text-gray-500">{u.title || 'Official'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {dept?.name ? (
                        <div>
                          <div className="font-semibold text-gray-900">{dept.name}</div>
                          <div className="text-[10px] text-gray-400">{fac?.name}</div>
                        </div>
                      ) : fac?.name ? (
                        <div className="font-semibold text-gray-900">{fac.name}</div>
                      ) : (
                        <span className="text-gray-400">Central University Scope</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 font-medium">{u.email}</div>
                      <div className="text-[10px] text-gray-400">{u.phone || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        u.mustChangePassword
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.mustChangePassword ? 'Change required' : 'Set'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {u.id !== currentUser.id && (
                          <button
                            type="button"
                            onClick={() => {
                              const password = createTemporaryPassword();
                              if (!password) return;
                              setResetTarget(u);
                              setResetPassword(password);
                            }}
                            disabled={!u.isActive}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-[10px] font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title={u.isActive ? 'Issue a temporary password' : 'Activate this account before resetting its password'}
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            Reset password
                          </button>
                        )}
                        {u.email.toLowerCase() === 'support.srcover@gmail.com' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#075B40] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Primary admin
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1 rounded transition-colors ${
                              u.isActive ? 'text-emerald-700 hover:text-emerald-900' : 'text-gray-400 hover:text-gray-600'
                            }`}
                            title={u.isActive ? 'Deactivate account' : 'Activate account'}
                            aria-label={u.isActive ? `Deactivate ${u.fullName}` : `Activate ${u.fullName}`}
                          >
                            {u.isActive ? (
                              <ToggleRight className="w-6 h-6 inline" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 inline" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create staff account"
          subtitle="Set staff access and issue a one-time temporary password."
          maxWidth="2xl"
        >
          <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. USMAN SABIU"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Staff email *</label>
                <input
                  type="email"
                  required
                  placeholder="officer@srcova.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Staff Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 bg-white"
                >
                  <option value="DEPARTMENT_OFFICER">Department officer</option>
                  <option value="FACULTY_OFFICER">Faculty officer</option>
                  <option value="DEAN_STUDENT_AFFAIRS">Student Affairs</option>
                  <option value="MANAGEMENT_APPROVER">University management</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Super Administrator authority is exclusively reserved for <strong>support.srcover@gmail.com</strong>.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Official Position Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HOD, Mathematics"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
                />
              </div>
            </div>

            {['DEPARTMENT_OFFICER', 'FACULTY_OFFICER'].includes(formData.role) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assigned Faculty *</label>
                  <select
                    value={formData.facultyId}
                    onChange={(e) => handleFacultyChange(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.code})
                      </option>
                    ))}
                  </select>
                </div>

                {formData.role === 'DEPARTMENT_OFFICER' && (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Assigned Department *</label>
                    <select
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    >
                      {departments
                        .filter((d) => d.facultyId === formData.facultyId)
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <label htmlFor="new-staff-temporary-password" className="mb-1.5 block font-semibold text-gray-800">
                Temporary password *
              </label>
              <div className="flex gap-2">
                <input
                  id="new-staff-temporary-password"
                  type="text"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  maxLength={128}
                  value={formData.password}
                  onChange={(event) => setFormData((previous) => ({ ...previous, password: event.target.value }))}
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-xs focus:border-[#075B40] focus:outline-none focus:ring-2 focus:ring-[#075B40]/20"
                />
                <button
                  type="button"
                  onClick={handleGenerateFormPassword}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Generate
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-gray-600">At least 12 characters. Staff must replace it at first sign-in. It is shown only once.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingPassword}
                className="px-5 py-2 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D5AC49]" />
                <span>{isSavingPassword ? 'Creating account…' : 'Create staff account'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {resetTarget && (
        <Modal
          isOpen
          onClose={() => {
            setResetTarget(null);
            setResetPassword('');
          }}
          title="Reset staff password"
          subtitle={`Issue a one-time password to ${resetTarget.fullName}.`}
          maxWidth="md"
        >
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm leading-6 text-gray-600">
              The current password will stop working immediately. The staff member must choose a new password at their next sign-in.
            </p>
            <div>
              <label htmlFor="reset-temporary-password" className="mb-1.5 block text-sm font-semibold text-gray-800">
                Temporary password
              </label>
              <div className="flex gap-2">
                <input
                  id="reset-temporary-password"
                  type="text"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  maxLength={128}
                  value={resetPassword}
                  onChange={(event) => setResetPassword(event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-[#075B40] focus:outline-none focus:ring-2 focus:ring-[#075B40]/20"
                />
                <button
                  type="button"
                  onClick={handleGenerateResetPassword}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Generate
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">At least 12 characters. It will be shown once after saving.</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setResetTarget(null);
                  setResetPassword('');
                }}
                className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingPassword}
                className="rounded-lg bg-[#075B40] px-4 py-2 text-xs font-semibold text-white hover:bg-[#003B2B] disabled:opacity-60"
              >
                {isSavingPassword ? 'Saving…' : 'Set temporary password'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {issuedCredential && (
        <Modal
          isOpen
          onClose={() => setIssuedCredential(null)}
          title="Temporary password ready"
          subtitle={`For ${issuedCredential.fullName} · ${issuedCredential.email}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
              This password is displayed only once. Share it directly and securely with the staff member. They must replace it at first sign-in.
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <code className="min-w-0 flex-1 break-all font-mono text-sm text-gray-900">
                {issuedCredential.password}
              </code>
              <button
                type="button"
                onClick={handleCopyTemporaryPassword}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>
            <div className="flex justify-end border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setIssuedCredential(null)}
                className="rounded-lg bg-[#075B40] px-4 py-2 text-xs font-semibold text-white hover:bg-[#003B2B]"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
