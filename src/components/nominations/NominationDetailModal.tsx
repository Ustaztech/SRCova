import { CandidateAvatar } from '../common/CandidateAvatar';
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { WorkflowTimeline } from '../common/WorkflowTimeline';
import { Nomination, Student, Faculty, Department } from '../../types';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  User,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  Clock,
  Printer,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

interface NominationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  nomination: Nomination;
  onActionTrigger?: (action: 'verify' | 'review' | 'select' | 'correct') => void;
  onViewReceipt?: () => void;
}

export const NominationDetailModal: React.FC<NominationDetailModalProps> = ({
  isOpen,
  onClose,
  nomination,
  onActionTrigger,
  onViewReceipt,
}) => {
  const { currentUser } = useAuth();

  const student = DatabaseService.getStudentById(nomination.studentId);
  const faculty = DatabaseService.getFacultyById(nomination.facultyId);
  const department = DatabaseService.getDepartmentById(nomination.departmentId);

  const verifications = DatabaseService.getVerifications(nomination.id);
  const lastVerification = verifications[verifications.length - 1];

  const eligibilityChecks = DatabaseService.getEligibilityChecks(nomination.id);
  const documents = DatabaseService.getDocuments(nomination.id);
  const reviews = DatabaseService.getReviews(nomination.id);
  const selections = DatabaseService.getSelections().filter((s) => s.nominationId === nomination.id);

  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'eligibility' | 'history'>('overview');

  const role = currentUser?.role;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Nomination Application: ${nomination.referenceNumber}`}
      subtitle={`Office: ${nomination.proposedPosition}`}
      maxWidth="4xl"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2">
            {onViewReceipt && (
              <button
                onClick={onViewReceipt}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View Official Receipt</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Contextual Action Buttons */}
            {role === 'FACULTY_OFFICER' &&
              ['Submitted', 'Awaiting Faculty Verification'].includes(nomination.status) && (
                <button
                  onClick={() => onActionTrigger && onActionTrigger('verify')}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D5AC49]" />
                  <span>Verify Candidate</span>
                </button>
              )}

            {role === 'DEAN_STUDENT_AFFAIRS' &&
              ['Pending Student Affairs Review', 'Faculty Verified'].includes(nomination.status) && (
                <button
                  onClick={() => onActionTrigger && onActionTrigger('review')}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>DSA Review & Recommendation</span>
                </button>
              )}

            {role === 'MANAGEMENT_APPROVER' &&
              ['Recommended for Selection', 'Approved'].includes(nomination.status) && (
                <button
                  onClick={() => onActionTrigger && onActionTrigger('select')}
                  className="px-4 py-1.5 text-xs font-bold text-[#003B2B] bg-[#D5AC49] hover:bg-[#B88F28] rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm SRC Selection</span>
                </button>
              )}

            {role === 'DEPARTMENT_OFFICER' && nomination.status === 'Returned for Correction' && (
              <button
                onClick={() => onActionTrigger && onActionTrigger('correct')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Edit & Resubmit</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Top Summary Banner */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CandidateAvatar src={student?.passportPhoto} name={student?.fullName} size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 font-display">{student?.fullName}</h3>
                <StatusBadge status={nomination.status} />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {student?.matricNumber} • {department?.name} ({faculty?.name})
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
              Academic Record (Submitted vs Verified)
            </span>
            <span className="text-xs font-bold text-gray-700">
              Submitted: {student?.cgpa.toFixed(2)} CGPA ({student?.level})
            </span>
            {lastVerification && (
              <span className="text-xs font-bold text-[#075B40] block">
                Verified: {lastVerification.verifiedCgpa.toFixed(2)} CGPA by {lastVerification.officerName}
              </span>
            )}
          </div>
        </div>

        {/* Workflow Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Selection Workflow Progress
          </h4>
          <WorkflowTimeline
            nomination={nomination}
            verification={lastVerification}
            review={reviews[reviews.length - 1]}
            selection={selections[0]}
          />
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#075B40] text-[#075B40]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Overview & Statements
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-[#075B40] text-[#075B40]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Documents ({documents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('eligibility')}
            className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'eligibility'
                ? 'border-[#075B40] text-[#075B40]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Eligibility Criteria Engine</span>
            {eligibilityChecks.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#075B40]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-[#075B40] text-[#075B40]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Reviews & Audit Notes
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <h5 className="font-bold text-gray-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#075B40]" />
                  <span>Personal & Contact Info</span>
                </h5>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-400 block">Gender:</span>
                    <span className="font-semibold text-gray-800">{student?.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Email:</span>
                    <span className="font-semibold text-gray-800 truncate">{student?.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Phone:</span>
                    <span className="font-semibold text-gray-800">{student?.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Course Rep:</span>
                    <span className="font-semibold text-[#075B40]">
                      {student?.isCourseRep ? 'Yes (Verified)' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <h5 className="font-bold text-gray-800 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#075B40]" />
                  <span>Academic Information</span>
                </h5>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-400 block">Faculty:</span>
                    <span className="font-semibold text-gray-800">{faculty?.code}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Department:</span>
                    <span className="font-semibold text-gray-800">{department?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Level:</span>
                    <span className="font-semibold text-gray-800">{student?.level}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">CGPA:</span>
                    <span className="font-bold text-[#075B40]">{student?.cgpa.toFixed(2)} / 5.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <h5 className="font-bold text-gray-800 mb-1">Leadership Experience:</h5>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  {nomination.leadershipExperience || 'No specific statement provided.'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <h5 className="font-bold text-gray-800 mb-1">Candidate Willingness Statement:</h5>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  {nomination.willingnessStatement || 'No specific statement provided.'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <h5 className="font-bold text-gray-800 mb-1">
                  Departmental Committee Recommendation:
                </h5>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  {nomination.supportingStatement || 'Recommended by Departmental Board.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-3 text-xs animate-fade-in">
            {documents.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                No supporting documents uploaded for this nomination.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 bg-white flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50 text-[#075B40]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{doc.documentType}</div>
                        <div className="text-[11px] text-gray-500">
                          {doc.fileName} • {doc.fileSize} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                        {doc.notes && (
                          <div className="text-[10px] text-emerald-700 mt-0.5">{doc.notes}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                          doc.verificationStatus === 'Verified'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {doc.verificationStatus}
                      </span>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-gray-500 hover:text-[#075B40] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Inspect Document"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Eligibility Checks */}
        {activeTab === 'eligibility' && (
          <div className="space-y-3 text-xs animate-fade-in">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <h5 className="font-bold text-gray-800 mb-1">Configured Senate Eligibility Assessment</h5>
              <p className="text-[11px] text-gray-500">
                Evaluation results generated by the administrative eligibility engine based on institutional rules.
              </p>
            </div>

            {eligibilityChecks.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                Eligibility checks will be executed once Faculty Officer completes academic verification.
              </div>
            ) : (
              <div className="space-y-2">
                {eligibilityChecks.map((chk) => (
                  <div
                    key={chk.id}
                    className="p-3 bg-white rounded-xl border border-gray-200 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{chk.ruleCode}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            chk.outcome === 'Eligible'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : chk.outcome === 'Requires Clarification'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {chk.outcome}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-1">{chk.remarks}</p>
                      <div className="text-[10px] text-gray-400 mt-1">
                        Actual: <span className="font-medium text-gray-700">{String(chk.actualValue)}</span> | Required: <span className="font-medium text-gray-700">{String(chk.thresholdValue)}</span>
                      </div>
                    </div>
                    {chk.outcome === 'Eligible' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: History & Remarks */}
        {activeTab === 'history' && (
          <div className="space-y-3 text-xs animate-fade-in">
            {nomination.correctionReason && (
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
                <span className="font-bold text-orange-900 block mb-1">Correction Requested by Faculty:</span>
                <p className="text-[11px] text-orange-800">{nomination.correctionReason}</p>
              </div>
            )}

            {nomination.facultyOfficerRemarks && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="font-bold text-blue-900 block mb-1">Faculty Verification Remarks:</span>
                <p className="text-[11px] text-blue-800">{nomination.facultyOfficerRemarks}</p>
              </div>
            )}

            {nomination.studentAffairsRemarks && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <span className="font-bold text-purple-900 block mb-1">Student Affairs Review Remarks:</span>
                <p className="text-[11px] text-purple-800">{nomination.studentAffairsRemarks}</p>
              </div>
            )}

            {nomination.managementRemarks && (
              <div className="p-3 bg-amber-50 rounded-xl border border-[#D5AC49]">
                <span className="font-bold text-[#003B2B] block mb-1">Management Confirmation Remarks:</span>
                <p className="text-[11px] text-gray-800">{nomination.managementRemarks}</p>
              </div>
            )}

            {reviews.map((rev) => (
              <div key={rev.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{rev.reviewerName} ({rev.reviewerRole})</span>
                  <span className="text-[10px] text-gray-400">{new Date(rev.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">Decision: {rev.decision}</div>
                <p className="text-[11px] text-gray-600 mt-1">{rev.remarks}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
