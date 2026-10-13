import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { Nomination, Student, Faculty, Department, NominationStatus } from '../../types';
import {
  FileText,
  Search,
  PlusCircle,
  Filter,
  Printer,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface NominationManagementPageProps {
  onOpenCreateNomination: () => void;
  onOpenNominationDetail: (nomination: Nomination) => void;
  onOpenVerificationModal: (nomination: Nomination) => void;
  onOpenCorrectionModal: (nomination: Nomination) => void;
  onViewReceipt: (nomination: Nomination) => void;
}

export const NominationManagementPage: React.FC<NominationManagementPageProps> = ({
  onOpenCreateNomination,
  onOpenNominationDetail,
  onOpenVerificationModal,
  onOpenCorrectionModal,
  onViewReceipt,
}) => {
  const { currentUser } = useAuth();

  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const loadData = () => {
    let filter: any = {};
    if (currentUser?.role === 'DEPARTMENT_OFFICER' && currentUser.departmentId) {
      filter.departmentId = currentUser.departmentId;
    } else if (currentUser?.role === 'FACULTY_OFFICER' && currentUser.facultyId) {
      filter.facultyId = currentUser.facultyId;
    }

    const noms = DatabaseService.getNominations(filter);
    setNominations(noms);
    setFaculties(DatabaseService.getFaculties());
    setDepartments(DatabaseService.getDepartments());

    const studs = DatabaseService.getStudents();
    const map: Record<string, Student> = {};
    studs.forEach((s) => {
      map[s.id] = s;
    });
    setStudents(map);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const filteredNominations = nominations.filter((nom) => {
    if (statusFilter && nom.status !== statusFilter) return false;
    if (facultyFilter && nom.facultyId !== facultyFilter) return false;
    if (departmentFilter && nom.departmentId !== departmentFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const s = students[nom.studentId];
      const matchRef = nom.referenceNumber.toLowerCase().includes(q);
      const matchName = s?.fullName.toLowerCase().includes(q) ?? false;
      const matchMatric = s?.matricNumber.toLowerCase().includes(q) ?? false;
      if (!matchRef && !matchName && !matchMatric) return false;
    }
    return true;
  });

  const facMap = new Map(faculties.map((f) => [f.id, f]));
  const deptMap = new Map(departments.map((d) => [d.id, d]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-display tracking-tight">
            Nomination Applications Registry
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Tracking departmental candidate submissions, verification queues, and selection approvals.
          </p>
        </div>

        {currentUser?.role === 'DEPARTMENT_OFFICER' && (
          <button
            onClick={onOpenCreateNomination}
            className="px-4 py-2 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Nomination</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Workflow Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">-- All Statuses --</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Awaiting Faculty Verification">Awaiting Faculty Verification</option>
            <option value="Faculty Verified">Faculty Verified</option>
            <option value="Returned for Correction">Returned for Correction</option>
            <option value="Pending Student Affairs Review">Pending Student Affairs Review</option>
            <option value="Recommended for Selection">Recommended for Selection</option>
            <option value="Selected">Selected</option>
            <option value="Faculty Rejected">Faculty Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Faculty
          </label>
          <select
            value={facultyFilter}
            disabled={currentUser?.role === 'FACULTY_OFFICER' || currentUser?.role === 'DEPARTMENT_OFFICER'}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">-- All Faculties --</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Department
          </label>
          <select
            value={departmentFilter}
            disabled={currentUser?.role === 'DEPARTMENT_OFFICER'}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">-- All Departments --</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Search Candidate / Ref
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Candidate name, matric, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
            />
          </div>
        </div>
      </div>

      {/* Nominations List Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700">
            Registered Applications ({filteredNominations.length})
          </span>
          <span className="text-[11px] text-[#075B40] font-semibold">
            Institutional Ledger Synchronized
          </span>
        </div>

        {filteredNominations.length === 0 ? (
          <div className="py-14 text-center text-gray-400 text-xs">
            No nomination applications match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#075B40] text-white uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Reference No</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Matric No</th>
                  <th className="px-4 py-3">Faculty / Dept</th>
                  <th className="px-4 py-3">Standing & CGPA</th>
                  <th className="px-4 py-3">Office Proposed</th>
                  <th className="px-4 py-3">Workflow Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredNominations.map((nom) => {
                  const s = students[nom.studentId];
                  const f = facMap.get(nom.facultyId);
                  const d = deptMap.get(nom.departmentId);
                  return (
                    <tr key={nom.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#075B40]">
                        {nom.referenceNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2">
                        <img
                          src={s?.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                          alt={s?.fullName}
                          className="w-7 h-7 rounded-lg object-cover border border-[#075B40]"
                        />
                        <span>{s?.fullName}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-600">{s?.matricNumber}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {f?.code} • {d?.code}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-gray-800">{s?.level}</span> •{' '}
                        <span className="text-[#075B40] font-semibold">{s?.cgpa.toFixed(2)} CGPA</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{nom.proposedPosition}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={nom.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {currentUser?.role === 'FACULTY_OFFICER' &&
                          ['Submitted', 'Awaiting Faculty Verification'].includes(nom.status) && (
                            <button
                              onClick={() => onOpenVerificationModal(nom)}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-lg transition-colors shadow-xs"
                            >
                              Verify
                            </button>
                          )}
                        {currentUser?.role === 'DEPARTMENT_OFFICER' &&
                          nom.status === 'Returned for Correction' && (
                            <button
                              onClick={() => onOpenCorrectionModal(nom)}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs"
                            >
                              Correct
                            </button>
                          )}
                        {nom.status !== 'Draft' && (
                          <button
                            onClick={() => onViewReceipt(nom)}
                            className="text-gray-400 hover:text-gray-800 p-1"
                            title="Print Submission Receipt"
                          >
                            <Printer className="w-3.5 h-3.5 inline" />
                          </button>
                        )}
                        <button
                          onClick={() => onOpenNominationDetail(nom)}
                          className="text-[#075B40] hover:underline font-semibold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
