import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Nomination, Student, Faculty, Department } from '../../types';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface StudentAffairsReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  nomination: Nomination;
  onSuccess: () => void;
}

export const StudentAffairsReviewModal: React.FC<StudentAffairsReviewModalProps> = ({
  isOpen,
  onClose,
  nomination,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const student = DatabaseService.getStudentById(nomination.studentId);
  const faculty = DatabaseService.getFacultyById(nomination.facultyId);
  const department = DatabaseService.getDepartmentById(nomination.departmentId);
  const verifications = DatabaseService.getVerifications(nomination.id);
  const lastVerification = verifications[verifications.length - 1];
  const eligibilityChecks = DatabaseService.getEligibilityChecks(nomination.id);

  const [decision, setDecision] = useState<
    'Recommended for Selection' | 'Approved' | 'Request Clarification' | 'Rejected'
  >('Recommended for Selection');

  const [remarks, setRemarks] = useState(
    'Candidate has satisfied all institutional academic and leadership criteria. Recommended for confirmation by the Vice-Chancellor Selection Board.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!remarks.trim()) {
      showToast('danger', 'Validation Error', 'Official review remarks are mandatory.');
      return;
    }

    try {
      DatabaseService.recordReview(
        {
          nominationId: nomination.id,
          reviewerId: currentUser.id,
          reviewerName: currentUser.fullName,
          reviewerRole: currentUser.title || 'Dean of Student Affairs',
          decision,
          remarks: remarks.trim(),
        },
        currentUser
      );

      showToast(
        'success',
        'Student Affairs Decision Recorded',
        `Nomination Ref ${nomination.referenceNumber} updated with decision: ${decision}.`
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('danger', 'Review Error', err.message || 'Failed to submit review.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dean of Student Affairs Review & Recommendation"
      subtitle={`Reviewing verified nomination: ${nomination.referenceNumber} (${student?.fullName})`}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Verification & Eligibility Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1">
            <span className="font-bold text-[#003B2B] flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#075B40]" />
              <span>Faculty Verification Outcome</span>
            </span>
            <p className="text-gray-700">
              Verified by: <strong>{lastVerification?.officerName || 'Faculty Officer'}</strong>
            </p>
            <p className="text-gray-700">
              Verified CGPA: <strong className="text-[#075B40]">{lastVerification?.verifiedCgpa.toFixed(2) || student?.cgpa.toFixed(2)}</strong> (Standing: {lastVerification?.verifiedLevel || student?.level})
            </p>
            <p className="text-[11px] text-gray-500 italic mt-1">
              "{lastVerification?.remarks || 'Academic credentials confirmed.'}"
            </p>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1">
            <span className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
              <Award className="w-4 h-4 text-blue-700" />
              <span>Eligibility Rules Engine</span>
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {eligibilityChecks.map((chk) => (
                <span
                  key={chk.id}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    chk.outcome === 'Eligible'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {chk.ruleCode}: {chk.outcome}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Senate criteria evaluation completed automatically.
            </p>
          </div>
        </div>

        {/* Decision Selector */}
        <div className="space-y-2">
          <label className="block font-bold text-gray-800">
            Student Affairs Executive Recommendation *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label
              className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-colors ${
                decision === 'Recommended for Selection'
                  ? 'border-purple-600 bg-purple-50 font-semibold text-purple-900'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="dsaDecision"
                value="Recommended for Selection"
                checked={decision === 'Recommended for Selection'}
                onChange={() => {
                  setDecision('Recommended for Selection');
                  setRemarks(
                    'Candidate has satisfied all institutional academic and leadership criteria. Recommended for confirmation by the Vice-Chancellor Selection Board.'
                  );
                }}
                className="text-purple-600 focus:ring-purple-600"
              />
              <Award className="w-4 h-4 text-purple-600" />
              <div>
                <span className="block font-bold">Recommend for Selection</span>
                <span className="text-[10px] text-gray-500 font-normal">
                  Forwards to Vice Chancellor for confirmation
                </span>
              </div>
            </label>

            <label
              className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-colors ${
                decision === 'Approved'
                  ? 'border-[#075B40] bg-[#075B40]/5 font-semibold text-[#003B2B]'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="dsaDecision"
                value="Approved"
                checked={decision === 'Approved'}
                onChange={() => {
                  setDecision('Approved');
                  setRemarks('Candidate approved under DSA discretionary threshold.');
                }}
                className="text-[#075B40] focus:ring-[#075B40]"
              />
              <CheckCircle2 className="w-4 h-4 text-[#075B40]" />
              <div>
                <span className="block font-bold">Approve Provisional Seat</span>
                <span className="text-[10px] text-gray-500 font-normal">
                  Approves candidate standing for council
                </span>
              </div>
            </label>

            <label
              className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-colors ${
                decision === 'Request Clarification'
                  ? 'border-orange-500 bg-orange-50 font-semibold text-orange-900'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="dsaDecision"
                value="Request Clarification"
                checked={decision === 'Request Clarification'}
                onChange={() => {
                  setDecision('Request Clarification');
                  setRemarks('Clarification required from Faculty Officer regarding character reference.');
                }}
                className="text-orange-600 focus:ring-orange-600"
              />
              <RotateCcw className="w-4 h-4 text-orange-600" />
              <div>
                <span className="block font-bold">Request Clarification</span>
                <span className="text-[10px] text-gray-500 font-normal">
                  Returns to Faculty Officer for investigation
                </span>
              </div>
            </label>

            <label
              className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-colors ${
                decision === 'Rejected'
                  ? 'border-rose-500 bg-rose-50 font-semibold text-rose-900'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="dsaDecision"
                value="Rejected"
                checked={decision === 'Rejected'}
                onChange={() => {
                  setDecision('Rejected');
                  setRemarks('Nomination rejected due to quota constraints or administrative disqualification.');
                }}
                className="text-rose-600 focus:ring-rose-600"
              />
              <XCircle className="w-4 h-4 text-rose-600" />
              <div>
                <span className="block font-bold">Reject Application</span>
                <span className="text-[10px] text-gray-500 font-normal">
                  Disqualifies candidate from current exercise
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Student Affairs Official Minute / Remarks *
          </label>
          <textarea
            rows={3}
            required
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
            placeholder="Enter Student Affairs remarks..."
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" />
            <span>Record Student Affairs Decision</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
