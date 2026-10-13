import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { Nomination, Student, Department, Faculty } from '../../types';
import {
  Users,
  FileText,
  Send,
  RotateCcw,
  CheckCircle2,
  PlusCircle,
  Clock,
  Printer,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface DepartmentDashboardProps {
  onOpenRegisterCandidate: () => void;
  onOpenCreateNomination: (studentId?: string) => void;
  onOpenNominationDetail: (nomination: Nomination) => void;
  onOpenCorrectionModal: (nomination: Nomination) => void;
  onViewReceipt: (nomination: Nomination) => void;
}

export const DepartmentDashboard: React.FC<DepartmentDashboardProps> = ({
  onOpenRegisterCandidate,
  onOpenCreateNomination,
  onOpenNominationDetail,
  onOpenCorrectionModal,
  onViewReceipt,
}) => {
  const { currentUser } = useAuth();
  const deptId = currentUser?.departmentId || 'dept-cs';

  const [department, setDepartment] = useState<Department | undefined>();
  const [faculty, setFaculty] = useState<Faculty | undefined>();
  const [candidates, setCandidates] = useState<Student[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);

  const loadData = () => {
    const dept = DatabaseService.getDepartmentById(deptId);
    setDepartment(dept);
    if (dept) {
      setFaculty(DatabaseService.getFacultyById(dept.facultyId));
    }
    const cands = DatabaseService.getStudents({ departmentId: deptId });
    setCandidates(cands);
    const noms = DatabaseService.getNominations({ departmentId: deptId });
    setNominations(noms);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('srcova:data_changed', handleUpdate);
    return () => window.removeEventListener('srcova:data_changed', handleUpdate);
  }, [currentUser]);

  // Department metrics
  const registeredCount = candidates.length;
  const draftCount = nominations.filter((n) => n.status === 'Draft').length;
  const submittedCount = nominations.filter((n) =>
    ['Submitted', 'Awaiting Faculty Verification', 'Faculty Verified', 'Pending Student Affairs Review'].includes(n.status)
  ).length;
  const returnedCount = nominations.filter((n) => n.status === 'Returned for Correction').length;
  const approvedCount = nominations.filter((n) =>
    ['Approved', 'Recommended for Selection', 'Selected'].includes(n.status)
  ).length;

  const studentMap = new Map(candidates.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      {/* Department Header */}
      <div className="bg-gradient-to-r from-[#003B2B] to-[#075B40] rounded-2xl p-6 text-white shadow-brand relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D5AC49]/20 text-[#D5AC49] text-xs font-bold border border-[#D5AC49]/30 mb-2">
              <span>Departmental Administration Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-white">
              {department?.name || 'Department of Computer Science'}
            </h1>
            <p className="text-xs text-emerald-100 mt-1">
              {faculty?.name || 'Faculty of Natural & Applied Sciences'} • HOD: {department?.hodName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenRegisterCandidate}
              className="px-3.5 py-2 text-xs font-bold text-[#003B2B] bg-[#D5AC49] hover:bg-[#B88F28] rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Candidate</span>
            </button>
            <button
              onClick={() => onOpenCreateNomination()}
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] border border-white/20 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Submit Nomination</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Department Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard
          title="Registered Candidates"
          value={registeredCount}
          subtitle="Department students"
          icon={<Users className="w-5 h-5 text-[#075B40]" />}
          iconBgColor="bg-[#075B40]/10"
        />
        <StatCard
          title="Draft Nominations"
          value={draftCount}
          subtitle="Unsubmitted forms"
          icon={<FileText className="w-5 h-5 text-slate-600" />}
          iconBgColor="bg-slate-100"
        />
        <StatCard
          title="Submitted Active"
          value={submittedCount}
          subtitle="In verification queue"
          icon={<Send className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-50"
        />
        <StatCard
          title="Returned for Correction"
          value={returnedCount}
          subtitle="Needs HOD action"
          icon={<RotateCcw className="w-5 h-5 text-orange-600" />}
          iconBgColor="bg-orange-50"
          badge={returnedCount > 0 ? { text: 'Action Needed', variant: 'warning' } : undefined}
        />
        <StatCard
          title="Approved / Selected"
          value={approvedCount}
          subtitle="Cleared by Council"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
          badge={{ text: 'Successful', variant: 'success' }}
        />
      </div>

      {/* Returned Nominations Notice if any */}
      {returnedCount > 0 && (
        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-orange-950">
                Action Required: {returnedCount} Nomination Returned by Faculty Officer
              </h4>
              <p className="text-[11px] text-orange-800 mt-0.5">
                Inspect verification remarks, provide requested certified documents or corrected information, and resubmit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Department Nominations Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-display">
              Department Nominations ({nominations.length})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Tracking submission status, verification updates, and council appointments.
            </p>
          </div>
          <button
            onClick={() => onOpenCreateNomination()}
            className="text-xs font-bold text-[#075B40] hover:underline"
          >
            + New Nomination
          </button>
        </div>

        {nominations.length === 0 ? (
          <div className="py-14 text-center text-gray-400 text-xs">
            No nomination records found for this department yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Reference No</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Matriculation No</th>
                  <th className="px-4 py-3">Office Proposed</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submission Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {nominations.map((nom) => {
                  const s = studentMap.get(nom.studentId);
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
                      <td className="px-4 py-3 font-medium text-gray-800">{nom.proposedPosition}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={nom.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {nom.submittedAt ? new Date(nom.submittedAt).toLocaleDateString() : 'Draft'}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {nom.status === 'Returned for Correction' && (
                          <button
                            onClick={() => onOpenCorrectionModal(nom)}
                            className="px-2 py-1 text-[11px] font-bold bg-orange-100 text-orange-800 hover:bg-orange-200 rounded transition-colors"
                          >
                            Correct & Resubmit
                          </button>
                        )}
                        {nom.status !== 'Draft' && (
                          <button
                            onClick={() => onViewReceipt(nom)}
                            className="text-gray-500 hover:text-gray-900"
                            title="Receipt"
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

      {/* Candidate Roster */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-display">
              Registered Candidate Roster ({candidates.length})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Students cleared by the department eligible for SRC nomination
            </p>
          </div>
          <button
            onClick={onOpenRegisterCandidate}
            className="text-xs font-bold text-[#075B40] hover:underline"
          >
            + Register Student
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Matriculation No</th>
                <th className="px-4 py-3">Standing & CGPA</th>
                <th className="px-4 py-3">Course Rep</th>
                <th className="px-4 py-3">Clearance</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    <Users className="w-7 h-7 mx-auto mb-1.5 text-gray-300" />
                    <p className="font-semibold text-gray-600 text-xs">No candidate students registered yet</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Click "+ Register Student" above to enter prospective student candidates from your department.
                    </p>
                  </td>
                </tr>
              ) : (
                candidates.map((cand) => {
                  const hasNomination = nominations.some((n) => n.studentId === cand.id);
                  return (
                    <tr key={cand.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2.5">
                        <img
                          src={cand.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                          alt={cand.fullName}
                          className="w-7 h-7 rounded-lg object-cover border border-[#075B40]"
                        />
                        <span>{cand.fullName}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-600">{cand.matricNumber}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-gray-800">{cand.level}</span> •{' '}
                        <span className="text-[#075B40] font-semibold">{cand.cgpa.toFixed(2)} CGPA</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            cand.isCourseRep
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          {cand.isCourseRep ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-emerald-700 font-semibold">Cleared</td>
                      <td className="px-4 py-3 text-right">
                        {hasNomination ? (
                          <span className="text-[11px] text-gray-400 italic">Nominated</span>
                        ) : (
                          <button
                            onClick={() => onOpenCreateNomination(cand.id)}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-lg transition-colors"
                          >
                            Nominate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
