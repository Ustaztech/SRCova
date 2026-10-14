import { CandidateAvatar } from '../common/CandidateAvatar';
import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { Nomination, Student, Faculty, Department } from '../../types';
import {
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Building2,
  ShieldCheck,
  FileCheck,
  ExternalLink,
} from 'lucide-react';

interface StudentAffairsDashboardProps {
  onOpenReviewModal: (nomination: Nomination) => void;
  onOpenNominationDetail: (nomination: Nomination) => void;
  onNavigateToSelection: () => void;
}

export const StudentAffairsDashboard: React.FC<StudentAffairsDashboardProps> = ({
  onOpenReviewModal,
  onOpenNominationDetail,
  onNavigateToSelection,
}) => {
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});

  const loadData = () => {
    const noms = DatabaseService.getNominations();
    setNominations(noms);
    setFaculties(DatabaseService.getFaculties());

    const studs = DatabaseService.getStudents();
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
  }, []);

  // Metrics
  const awaitingReview = nominations.filter((n) =>
    ['Faculty Verified', 'Pending Student Affairs Review'].includes(n.status)
  ).length;

  const approvedCandidates = nominations.filter((n) =>
    ['Approved', 'Recommended for Selection', 'Selected'].includes(n.status)
  ).length;

  const rejectedCandidates = nominations.filter((n) => n.status === 'Rejected').length;

  const recommendedCandidates = nominations.filter((n) =>
    ['Recommended for Selection', 'Selected'].includes(n.status)
  ).length;

  const finalizedSelections = nominations.filter((n) => n.status === 'Selected').length;

  const pendingList = nominations.filter((n) =>
    ['Faculty Verified', 'Pending Student Affairs Review'].includes(n.status)
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#003B2B] via-[#075B40] to-purple-900 rounded-2xl p-6 text-white shadow-brand relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D5AC49]/20 text-[#D5AC49] text-xs font-bold border border-[#D5AC49]/30 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Dean of Student Affairs Administrative Chamber</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-white">
              Central Student Representative Selection Board
            </h1>
            <p className="text-xs text-purple-100 mt-1 max-w-2xl leading-relaxed">
              Evaluating verified departmental nominations, enforcing statutory quotas across all 7 faculties, and recommending merit-based candidates for Council appointment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToSelection}
              className="px-4 py-2 text-xs font-bold text-[#003B2B] bg-[#D5AC49] hover:bg-[#B88F28] rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Manage Council Seats</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 DSA Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard
          title="Awaiting DSA Review"
          value={awaitingReview}
          subtitle="Verified by Dean"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-50"
          badge={awaitingReview > 0 ? { text: 'Queue Active', variant: 'warning' } : undefined}
        />
        <StatCard
          title="Approved Candidates"
          value={approvedCandidates}
          subtitle="Cleared for Council"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
        />
        <StatCard
          title="Rejected Applications"
          value={rejectedCandidates}
          subtitle="Ineligible or disqualified"
          icon={<XCircle className="w-5 h-5 text-rose-600" />}
          iconBgColor="bg-rose-50"
        />
        <StatCard
          title="Recommended Seats"
          value={recommendedCandidates}
          subtitle="Forwarded to VC"
          icon={<Award className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-50"
        />
        <StatCard
          title="Confirmed SRC Members"
          value={finalizedSelections}
          subtitle="Statutory Members"
          icon={<Sparkles className="w-5 h-5 text-[#D5AC49]" />}
          iconBgColor="bg-[#D5AC49]/15"
          badge={{ text: 'Council Confirmed', variant: 'gold' }}
        />
      </div>

      {/* Verified Nominations Awaiting DSA Approval Queue */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-display">
              Verified Nominations Requiring DSA Decision ({pendingList.length})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Academically audited by faculty officers. Ready for review and Council seat recommendation.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-50 text-purple-700 border border-purple-200">
            DSA Approval Queue
          </span>
        </div>

        {pendingList.length === 0 ? (
          <div className="py-14 text-center text-gray-400 text-xs">
            No verified nominations currently waiting for Student Affairs decision.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Reference No</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Matriculation No</th>
                  <th className="px-4 py-3">Faculty / Dept</th>
                  <th className="px-4 py-3">Verified CGPA</th>
                  <th className="px-4 py-3">Proposed Position</th>
                  <th className="px-4 py-3 text-right">DSA Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingList.map((nom) => {
                  const s = students[nom.studentId];
                  const f = faculties.find((fac) => fac.id === nom.facultyId);
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
                      <td className="px-4 py-3 text-gray-600">{f?.code}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-[#075B40]">{s?.cgpa.toFixed(2)} CGPA</span>{' '}
                        <span className="text-gray-400">({s?.level})</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-purple-900">{nom.proposedPosition}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => onOpenNominationDetail(nom)}
                          className="text-gray-600 hover:text-gray-900 font-semibold"
                        >
                          Inspect Dossier
                        </button>
                        <button
                          onClick={() => onOpenReviewModal(nom)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors shadow-sm"
                        >
                          Review & Recommend
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

      {/* Provisional Council Allocation Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#075B40]" />
            <span>Faculty Representation Balance</span>
          </h3>
          <button
            onClick={onNavigateToSelection}
            className="text-xs font-semibold text-[#075B40] hover:underline"
          >
            Manage Council Selections →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {faculties.map((fac) => {
            const facRecommended = nominations.filter(
              (n) => n.facultyId === fac.id && ['Recommended for Selection', 'Selected'].includes(n.status)
            ).length;
            return (
              <div key={fac.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase block truncate">
                  {fac.code}
                </span>
                <span className="text-lg font-extrabold text-purple-900 block mt-0.5">
                  {facRecommended}
                </span>
                <span className="text-[10px] text-gray-500 block">Allocated Seats</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
