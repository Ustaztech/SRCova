import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Nomination, Student, Faculty, Department } from '../../types';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

interface FacultyVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  nomination: Nomination;
  onSuccess: () => void;
}

export const FacultyVerificationModal: React.FC<FacultyVerificationModalProps> = ({
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
  const documents = DatabaseService.getDocuments(nomination.id);

  // Form State for Verification
  const [verifiedCgpa, setVerifiedCgpa] = useState<string>(student?.cgpa.toString() || '4.00');
  const [verifiedLevel, setVerifiedLevel] = useState<string>(student?.level || '300L');
  const [verifiedCourseRep, setVerifiedCourseRep] = useState<boolean>(student?.isCourseRep ?? true);
  const [documentsInspected, setDocumentsInspected] = useState<boolean>(true);
  const [decision, setDecision] = useState<'Verified' | 'Returned for Correction' | 'Rejected'>('Verified');
  const [remarks, setRemarks] = useState<string>('Academic records verified against faculty examination ledger. Candidate meets Senate eligibility.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    if (!remarks.trim()) {
      showToast('danger', 'Validation Error', 'Verification remarks are mandatory.');
      return;
    }

    try {
      const cgpaNum = parseFloat(verifiedCgpa);
      if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 5.0) {
        showToast('danger', 'Validation Error', 'Verified CGPA must be between 0.00 and 5.00.');
        return;
      }

      DatabaseService.recordVerification(
        {
          nominationId: nomination.id,
          verifyingOfficerId: currentUser.id,
          officerName: currentUser.fullName,
          officerRole: currentUser.title || 'Dean / Faculty Officer',
          verifiedCgpa: cgpaNum,
          verifiedLevel,
          verifiedCourseRep,
          documentsInspected,
          result: decision,
          remarks: remarks.trim(),
          verifiedFields: ['CGPA', 'Academic Level', 'Course Rep Status', 'Official Documents'],
        },
        currentUser
      );

      // Also mark documents as inspected/verified if verified
      if (decision === 'Verified') {
        documents.forEach((d) => {
          DatabaseService.verifyDocument(d.id, 'Verified', currentUser.fullName, 'Verified by Faculty Board');
        });
      }

      showToast(
        'success',
        'Academic Verification Recorded',
        decision === 'Verified'
          ? `Nomination Ref ${nomination.referenceNumber} verified and forwarded to Student Affairs.`
          : decision === 'Returned for Correction'
          ? `Nomination Ref ${nomination.referenceNumber} returned to department for correction.`
          : `Nomination Ref ${nomination.referenceNumber} rejected.`
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('danger', 'Verification Error', err.message || 'Failed to record verification.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Academic Verification & Audit"
      subtitle={`Faculty Board Review for ${student?.fullName} (${student?.matricNumber})`}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Candidate Summary */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="text-gray-400 text-[11px] block">Candidate:</span>
            <span className="font-bold text-gray-900">{student?.fullName}</span>
          </div>
          <div>
            <span className="text-gray-400 text-[11px] block">Matric No:</span>
            <span className="font-mono font-semibold text-gray-900">{student?.matricNumber}</span>
          </div>
          <div>
            <span className="text-gray-400 text-[11px] block">Department:</span>
            <span className="font-semibold text-gray-900">{department?.name}</span>
          </div>
          <div>
            <span className="text-gray-400 text-[11px] block">Submitted CGPA:</span>
            <span className="font-bold text-[#075B40]">{student?.cgpa.toFixed(2)}</span>
          </div>
        </div>

        {/* Verification Inputs */}
        <div className="p-4 bg-white rounded-xl border-2 border-[#075B40]/30 space-y-3">
          <h4 className="font-bold text-[#003B2B] flex items-center gap-1.5 uppercase tracking-wide text-xs">
            <ShieldCheck className="w-4 h-4 text-[#075B40]" />
            <span>Faculty Ledger Validation (Official Record Audit)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Verified Cumulative GPA (CGPA) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.00"
                max="5.00"
                required
                value={verifiedCgpa}
                onChange={(e) => setVerifiedCgpa(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 font-bold text-[#075B40]"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 block">
                As reflected on official faculty broadsheet
              </span>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Verified Academic Level *
              </label>
              <select
                value={verifiedLevel}
                onChange={(e) => setVerifiedLevel(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 bg-white"
              >
                <option value="100L">100 Level</option>
                <option value="200L">200 Level</option>
                <option value="300L">300 Level</option>
                <option value="400L">400 Level</option>
                <option value="500L">500 Level</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={verifiedCourseRep}
                  onChange={(e) => setVerifiedCourseRep(e.target.checked)}
                  className="w-4 h-4 text-[#075B40] rounded focus:ring-[#075B40]"
                />
                <span className="font-semibold text-gray-800">
                  Course Rep Status Confirmed
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Uploaded Documents Inspection Checklist */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-gray-800">Submitted Documents Inspection</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#075B40] font-semibold">
              <input
                type="checkbox"
                checked={documentsInspected}
                onChange={(e) => setDocumentsInspected(e.target.checked)}
                className="w-3.5 h-3.5 text-[#075B40] rounded"
              />
              <span>All documents inspected against physical or certified e-records</span>
            </label>
          </div>

          <div className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <div key={doc.id} className="py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#075B40]" />
                  <span className="font-medium text-gray-800">{doc.documentType}:</span>
                  <span className="text-gray-500">{doc.fileName}</span>
                </div>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#075B40] hover:underline flex items-center gap-1"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Decision */}
        <div className="space-y-2">
          <label className="block font-bold text-gray-800">
            Faculty Board Verification Decision *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <label
              className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-colors ${
                decision === 'Verified'
                  ? 'border-[#075B40] bg-[#075B40]/5 font-semibold text-[#003B2B]'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="verificationDecision"
                value="Verified"
                checked={decision === 'Verified'}
                onChange={() => {
                  setDecision('Verified');
                  setRemarks('Academic records verified against faculty examination ledger. Candidate meets Senate eligibility.');
                }}
                className="text-[#075B40] focus:ring-[#075B40]"
              />
              <CheckCircle2 className="w-4 h-4 text-[#075B40]" />
              <span>Verify & Forward</span>
            </label>

            <label
              className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-colors ${
                decision === 'Returned for Correction'
                  ? 'border-orange-500 bg-orange-50 font-semibold text-orange-900'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="verificationDecision"
                value="Returned for Correction"
                checked={decision === 'Returned for Correction'}
                onChange={() => {
                  setDecision('Returned for Correction');
                  setRemarks('Correction required: Transcript / Result requires official HOD seal and signed course registration slip.');
                }}
                className="text-orange-600 focus:ring-orange-600"
              />
              <RotateCcw className="w-4 h-4 text-orange-600" />
              <span>Request Correction</span>
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
                name="verificationDecision"
                value="Rejected"
                checked={decision === 'Rejected'}
                onChange={() => {
                  setDecision('Rejected');
                  setRemarks('Nomination rejected: Academic ledger discrepancy or ineligibility threshold failure.');
                }}
                className="text-rose-600 focus:ring-rose-600"
              />
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Reject Nomination</span>
            </label>
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Faculty Board Verification Remarks / Findings *
          </label>
          <textarea
            rows={3}
            required
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
            placeholder="Document verification findings, ledger serial numbers, or reasons for return/rejection..."
          />
        </div>

        {/* Action Buttons */}
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
            className="px-5 py-2 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-[#D5AC49]" />
            <span>Submit Verification Decision</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
