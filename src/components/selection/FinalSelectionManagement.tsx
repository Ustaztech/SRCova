import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Nomination, Student, Faculty, Selection, SRCPosition } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  FileCheck,
  Building2,
  Printer,
  Sparkles,
  Download,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface FinalSelectionManagementProps {
  onNavigateToReports?: () => void;
  onOpenDetail?: (nomination: Nomination) => void;
}

export const FinalSelectionManagement: React.FC<FinalSelectionManagementProps> = ({
  onNavigateToReports,
  onOpenDetail,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});

  // Confirmation Modal
  const [selectedNomination, setSelectedNomination] = useState<Nomination | null>(null);
  const [resolutionNumber, setResolutionNumber] = useState('');
  const [executiveNotes, setExecutiveNotes] = useState('Ratified under Senate statutory authority.');

  const loadData = () => {
    const noms = DatabaseService.getNominations();
    setNominations(noms);
    setSelections(DatabaseService.getSelections());
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

  // Filter candidates recommended for selection or already selected
  const recommendedList = nominations.filter((n) =>
    ['Recommended for Selection', 'Approved'].includes(n.status)
  );

  const confirmedList = nominations.filter((n) => n.status === 'Selected');

  const handleOpenConfirm = (nom: Nomination) => {
    setSelectedNomination(nom);
    const randNum = Math.floor(10 + Math.random() * 90);
    setResolutionNumber(`NSUK/SRC/RES/2026/0${randNum}`);
    setExecutiveNotes('Ratified by Vice-Chancellor selection panel.');
  };

  const handleConfirmSelection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNomination || !currentUser) return;

    try {
      DatabaseService.confirmSelection(
        selectedNomination.id,
        resolutionNumber,
        executiveNotes,
        currentUser
      );

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#075B40', '#D5AC49', '#138A63'],
      });

      showToast(
        'success',
        'SRC Selection Formally Confirmed',
        `Confirmed council seat for ${selectedNomination.proposedPosition} under resolution ${resolutionNumber}.`
      );

      setSelectedNomination(null);
      loadData();
    } catch (err: any) {
      showToast('danger', 'Error', err.message || 'Failed to confirm selection.');
    }
  };

  const handleBulkConfirm = () => {
    if (!currentUser) return;
    if (recommendedList.length === 0) {
      showToast('info', 'No Candidates', 'No candidates currently awaiting confirmation.');
      return;
    }

    try {
      recommendedList.forEach((nom, idx) => {
        const resNo = `NSUK/SRC/RES/2026/0${20 + idx}`;
        DatabaseService.confirmSelection(
          nom.id,
          resNo,
          'Ratified during plenary selection board session.',
          currentUser
        );
      });

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#075B40', '#D5AC49', '#003B2B'],
      });

      showToast(
        'success',
        'All Recommended Candidates Confirmed',
        `Successfully ratified ${recommendedList.length} SRC council members.`
      );

      loadData();
    } catch (err: any) {
      showToast('danger', 'Error', err.message || 'Bulk confirmation failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-display tracking-tight">
            Final SRC Selection Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review recommendations from Student Affairs, enforce faculty quotas, and confirm statutory Council seats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.role === 'MANAGEMENT_APPROVER' && recommendedList.length > 0 && (
            <button
              onClick={handleBulkConfirm}
              className="px-4 py-2 text-xs font-bold text-[#003B2B] bg-[#D5AC49] hover:bg-[#B88F28] rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-[#D5AC49]/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirm All ({recommendedList.length})</span>
            </button>
          )}

          {onNavigateToReports && (
            <button
              onClick={onNavigateToReports}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#075B40]" />
              <span>Generate Official SRC Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Representation Quota Summary Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#075B40]" />
            <span>Faculty Representation & Capacity Quotas</span>
          </h3>
          <span className="text-xs font-semibold text-[#075B40]">
            Total Confirmed Members: {confirmedList.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {faculties.map((fac) => {
            const facConfirmed = confirmedList.filter((n) => n.facultyId === fac.id).length;
            const facRecommended = recommendedList.filter((n) => n.facultyId === fac.id).length;
            return (
              <div
                key={fac.id}
                className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 text-center"
              >
                <span className="text-[10px] font-bold text-gray-400 uppercase block truncate">
                  {fac.code}
                </span>
                <span className="text-base font-extrabold text-gray-900 block mt-0.5">
                  {facConfirmed}
                </span>
                <span className="text-[10px] text-gray-500 block">
                  {facRecommended > 0 ? `+${facRecommended} pending` : 'Quota active'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Candidates Awaiting Confirmation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-display">
              Recommended Candidates Awaiting Ratification ({recommendedList.length})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified by Faculty Officers and recommended by the Dean of Student Affairs.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-50 text-purple-700 border border-purple-200">
            Awaiting Confirmation
          </span>
        </div>

        {recommendedList.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            No candidate recommendations currently awaiting management confirmation.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recommendedList.map((nom) => {
              const student = students[nom.studentId];
              const fac = faculties.find((f) => f.id === nom.facultyId);
              return (
                <div
                  key={nom.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={student?.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                      alt={student?.fullName}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-[#075B40] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{student?.fullName}</span>
                        <StatusBadge status={nom.status} size="sm" />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {student?.matricNumber} • {fac?.code} • Level {student?.level} • CGPA{' '}
                        <strong className="text-[#075B40]">{student?.cgpa.toFixed(2)}</strong>
                      </p>
                      <p className="text-xs text-purple-800 font-semibold mt-1">
                        Proposed Seat: {nom.proposedPosition}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenDetail && (
                      <button
                        onClick={() => onOpenDetail(nom)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Inspect Dossier
                      </button>
                    )}

                    {currentUser?.role === 'MANAGEMENT_APPROVER' ? (
                      <button
                        onClick={() => handleOpenConfirm(nom)}
                        className="px-4 py-1.5 text-xs font-bold text-[#003B2B] bg-[#D5AC49] hover:bg-[#B88F28] rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Selection</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">
                        Requires Approver Authorization
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmed SRC Members List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-display">
              Officially Confirmed SRC Council Roster ({confirmedList.length})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Statutory council representatives ratified under university resolution.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-[#075B40] border border-emerald-200">
            Council Members
          </span>
        </div>

        {confirmedList.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            No confirmed SRC members recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Council Representative</th>
                  <th className="px-4 py-3">Matric No</th>
                  <th className="px-4 py-3">Faculty / Dept</th>
                  <th className="px-4 py-3">Position Assigned</th>
                  <th className="px-4 py-3">Resolution Ref</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {confirmedList.map((nom) => {
                  const student = students[nom.studentId];
                  const fac = faculties.find((f) => f.id === nom.facultyId);
                  const sel = selections.find((s) => s.nominationId === nom.id);
                  return (
                    <tr key={nom.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2.5">
                        <img
                          src={student?.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                          alt={student?.fullName}
                          className="w-8 h-8 rounded-lg object-cover border border-[#075B40]"
                        />
                        <span>{student?.fullName}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-600">{student?.matricNumber}</td>
                      <td className="px-4 py-3 text-gray-600">{fac?.code}</td>
                      <td className="px-4 py-3 font-semibold text-[#003B2B]">
                        {nom.proposedPosition}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-emerald-800">
                        {sel?.resolutionNumber || 'NSUK/SRC/RES/2026/014'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status="Selected" size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {onOpenDetail && (
                          <button
                            onClick={() => onOpenDetail(nom)}
                            className="text-[#075B40] hover:underline font-semibold"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedNomination && (
        <Modal
          isOpen={!!selectedNomination}
          onClose={() => setSelectedNomination(null)}
          title="Ratify Final SRC Council Selection"
          subtitle={`Candidate: ${students[selectedNomination.studentId]?.fullName} (${selectedNomination.referenceNumber})`}
          maxWidth="lg"
        >
          <form onSubmit={handleConfirmSelection} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-[#D5AC49]/40 flex items-start gap-2.5">
              <Award className="w-5 h-5 text-[#B88F28] shrink-0 mt-0.5" />
              <div className="text-[11px] text-[#003B2B] leading-relaxed">
                <strong>Executive Council Ratification:</strong> This decision formally records
                the candidate as an official Student Representative Council member for the
                2025/2026 academic session.
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Council Resolution Number *
              </label>
              <input
                type="text"
                required
                value={resolutionNumber}
                onChange={(e) => setResolutionNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Assigned SRC Council Seat
              </label>
              <input
                type="text"
                disabled
                value={selectedNomination.proposedPosition}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Executive Ratification Notes *
              </label>
              <textarea
                rows={2}
                required
                value={executiveNotes}
                onChange={(e) => setExecutiveNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedNomination(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-[#003B2B] bg-[#D5AC49] hover:bg-[#B88F28] rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Selection</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
