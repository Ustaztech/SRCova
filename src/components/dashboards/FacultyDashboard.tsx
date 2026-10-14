import { CandidateAvatar } from '../common/CandidateAvatar';
import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { Nomination, Student, Faculty, Department } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  FileText,
  Send,
  Building2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface FacultyDashboardProps {
  onOpenVerificationModal: (nomination: Nomination) => void;
  onOpenNominationDetail: (nomination: Nomination) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  onOpenVerificationModal,
  onOpenNominationDetail,
}) => {
  const { currentUser } = useAuth();
  const facId = currentUser?.facultyId || 'fac-nas';

  const [faculty, setFaculty] = useState<Faculty | undefined>();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});

  const loadData = () => {
    const fac = DatabaseService.getFacultyById(facId);
    setFaculty(fac);
    setDepartments(DatabaseService.getDepartments(facId));
    const noms = DatabaseService.getNominations({ facultyId: facId });
    setNominations(noms);

    const studs = DatabaseService.getStudents({ facultyId: facId });
    const map: Record<string, Student> = {};
    studs.forEach((s) => {
      map[s.id] = s;
    });
    setStudents(map);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('srcova:data_changed', handleUpdate);
    return () => window.removeEventListener('srcova:data_changed', handleUpdate);
  }, [currentUser]);

  // Metrics
  const awaitingVerification = nominations.filter((n) =>
    ['Submitted', 'Awaiting Faculty Verification'].includes(n.status)
  ).length;

  const verifiedCount = nominations.filter((n) =>
    ['Faculty Verified', 'Pending Student Affairs Review', 'Recommended for Selection', 'Approved', 'Selected'].includes(
      n.status
    )
  ).length;

  const returnedCount = nominations.filter((n) => n.status === 'Returned for Correction').length;
  const rejectedCount = nominations.filter((n) => n.status === 'Faculty Rejected').length;
  const forwardedCount = nominations.filter((n) =>
    ['Pending Student Affairs Review', 'Recommended for Selection', 'Approved', 'Selected'].includes(n.status)
  ).length;

  const deptMap = new Map(departments.map((d) => [d.id, d]));

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#003B2B] to-[#075B40] rounded-2xl p-6 text-white shadow-brand relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D5AC49]/20 text-[#D5AC49] text-xs font-bold border border-[#D5AC49]/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Faculty Academic Verification Authority</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-white">
              {faculty?.name || 'Faculty of Natural & Applied Sciences'}
            </h1>
            <p className="text-xs text-emerald-100 mt-1">
              Dean: {faculty?.deanName} • Overseeing {departments.length} Academic Departments
            </p>
          </div>

          <div className="bg-white/10 rounded-xl px-4 py-3 border border-white/20 text-center">
            <span className="text-[10px] uppercase font-bold text-[#D5AC49] tracking-wider block">
              Verification Queue Status
            </span>
            <span className="text-lg font-extrabold text-white">
              {awaitingVerification} Pending Review
            </span>
          </div>
        </div>
      </div>

      {/* 5 Faculty Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard
          title="Awaiting Verification"
          value={awaitingVerification}
          subtitle="In Faculty Ledger Queue"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-50"
          badge={awaitingVerification > 0 ? { text: 'Needs Audit', variant: 'warning' } : undefined}
        />
        <StatCard
          title="Verified Records"
          value={verifiedCount}
          subtitle="Validated & compliant"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
          badge={{ text: 'Validated', variant: 'success' }}
        />
        <StatCard
          title="Forwarded to DSA"
          value={forwardedCount}
          subtitle="Ready for DSA review"
          icon={<Send className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-50"
        />
        <StatCard
          title="Returned for Correction"
          value={returnedCount}
          subtitle="Awaiting Dept HOD"
          icon={<RotateCcw className="w-5 h-5 text-orange-600" />}
          iconBgColor="bg-orange-50"
        />
        <StatCard
          title="Faculty Rejected"
          value={rejectedCount}
          subtitle="Ineligible or flagged"
          icon={<XCircle className="w-5 h-5 text-rose-600" />}
          iconBgColor="bg-rose-50"
        />
      </div>

      {/* Verification Action Queue Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-display">
              Nominations Awaiting Academic Verification ({awaitingVerification})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Inspect submitted statement of results, verify CGPA standing, and forward to Student Affairs.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-50 text-amber-800 border border-amber-200">
            Action Priority
          </span>
        </div>

        {nominations.filter((n) => ['Submitted', 'Awaiting Faculty Verification'].includes(n.status)).length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            All submitted nominations in this faculty have been verified.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Reference No</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Matriculation No</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Submitted CGPA</th>
                  <th className="px-4 py-3">Proposed Office</th>
                  <th className="px-4 py-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {nominations
                  .filter((n) => ['Submitted', 'Awaiting Faculty Verification'].includes(n.status))
                  .map((nom) => {
                    const s = students[nom.studentId];
                    const d = deptMap.get(nom.departmentId);
                    return (
                      <tr key={nom.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#075B40]">
                          {nom.referenceNumber}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2">
                          <CandidateAvatar src={s?.passportPhoto} name={s?.fullName} size="sm" />
                          <span>{s?.fullName}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-600">{s?.matricNumber}</td>
                        <td className="px-4 py-3 text-gray-700">{d?.name}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-[#075B40]">{s?.cgpa.toFixed(2)}</span>{' '}
                          <span className="text-gray-400">({s?.level})</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">{nom.proposedPosition}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => onOpenNominationDetail(nom)}
                            className="text-gray-600 hover:text-gray-900 font-semibold"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => onOpenVerificationModal(nom)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-lg transition-colors shadow-sm"
                          >
                            Verify Candidate
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

      {/* All Faculty Nominations Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-display">
              All Faculty Nominations Ledger ({nominations.length})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Historical and active records across all departments in {faculty?.code}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Reference No</th>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Matric No</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {nominations.map((nom) => {
                const s = students[nom.studentId];
                const d = deptMap.get(nom.departmentId);
                return (
                  <tr key={nom.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[#075B40]">
                      {nom.referenceNumber}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{s?.fullName}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{s?.matricNumber}</td>
                    <td className="px-4 py-3 text-gray-700">{d?.code}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={nom.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onOpenNominationDetail(nom)}
                        className="text-[#075B40] hover:underline font-semibold"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
