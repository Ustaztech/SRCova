import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { User, UserRole, Faculty, Department } from '../../types';
import { Modal } from '../common/Modal';
import {
  Users,
  UserPlus,
  Shield,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  GraduationCap,
} from 'lucide-react';

export const StaffManagementPage: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const { showToast } = useNotifications();

  const [staff, setStaff] = useState<User[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: 'Staff@SRCova2026',
    title: '',
    role: 'DEPARTMENT_OFFICER' as UserRole,
    facultyId: '',
    departmentId: '',
    phone: '+234 803 000 0000',
  });

  const loadData = () => {
    setStaff(DatabaseService.getUsers());
    const facs = DatabaseService.getFaculties();
    setFaculties(facs);
    const depts = DatabaseService.getDepartments();
    setDepartments(depts);
    if (facs.length > 0 && !formData.facultyId) {
      setFormData((prev) => ({
        ...prev,
        facultyId: facs[0].id,
        departmentId: depts.filter((d) => d.facultyId === facs[0].id)[0]?.id || '',
      }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFacultyChange = (fId: string) => {
    const depts = DatabaseService.getDepartments(fId);
    setFormData((prev) => ({
      ...prev,
      facultyId: fId,
      departmentId: depts[0]?.id || '',
    }));
  };

  const handleToggleStatus = (u: User) => {
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
    loadData();
    refreshUser();
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const existing = DatabaseService.getUserByEmail(formData.email);
      if (existing) {
        showToast('danger', 'Duplicate Email', 'A staff account with this email already exists.');
        return;
      }

      DatabaseService.createUser(
        {
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          passwordHash: formData.password,
          title: formData.title.trim() || 'Institutional Selection Officer',
          role: formData.role,
          facultyId: formData.facultyId || undefined,
          departmentId: formData.departmentId || undefined,
          phone: formData.phone.trim(),
          isActive: true,
        },
        currentUser || undefined
      );

      showToast(
        'success',
        'Staff Account Created',
        `Account for ${formData.fullName} (${formData.email}) created successfully.`
      );
      setIsModalOpen(false);
      loadData();
      refreshUser();
    } catch (err: any) {
      showToast('danger', 'Error', err.message || 'Failed to create staff account.');
    }
  };

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
            Authorize and manage role-based officer accounts across faculties and departments.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
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
          <span className="text-[11px] text-gray-400">Strict Institutional RBAC Enforced</span>
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
                <th className="px-4 py-3 text-right">Toggle Active</th>
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
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1 rounded transition-colors ${
                          u.isActive ? 'text-emerald-700 hover:text-emerald-900' : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {u.isActive ? (
                          <ToggleRight className="w-6 h-6 inline" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 inline" />
                        )}
                      </button>
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
          title="Create Authorized Staff Account"
          subtitle="Provision role-based portal access for faculty, department or administrative personnel"
          maxWidth="2xl"
        >
          <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name (e.g. USMAN SABIU) *</label>
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
                <label className="block font-semibold text-gray-700 mb-1">Institutional Email *</label>
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
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 bg-white"
                >
                  <option value="DEPARTMENT_OFFICER">Departmental Officer / HOD</option>
                  <option value="FACULTY_OFFICER">Faculty Officer / Dean</option>
                  <option value="DEAN_STUDENT_AFFAIRS">Dean of Student Affairs</option>
                  <option value="MANAGEMENT_APPROVER">Management Approving Officer</option>
                  <option value="SUPER_ADMIN">System Administrator</option>
                </select>
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
                className="px-5 py-2 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D5AC49]" />
                <span>Create Staff Account</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
