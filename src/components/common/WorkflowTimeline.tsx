import React from 'react';
import { Nomination, VerificationRecord, AdministrativeReview, Selection } from '../../types';
import { Check, Clock, AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface WorkflowTimelineProps {
  nomination: Nomination;
  verification?: VerificationRecord;
  review?: AdministrativeReview;
  selection?: Selection;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  nomination,
  verification,
  review,
  selection,
}) => {
  const stages = [
    {
      id: 1,
      title: 'Departmental Nomination',
      subtitle: nomination.submittedAt
        ? `Submitted ${new Date(nomination.submittedAt).toLocaleDateString()}`
        : 'Draft Created',
      status: nomination.status === 'Draft' ? 'current' : 'completed',
      details: `Ref: ${nomination.referenceNumber}`,
    },
    {
      id: 2,
      title: 'Faculty Verification',
      subtitle: verification
        ? `Verified by ${verification.officerName}`
        : nomination.status === 'Returned for Correction'
        ? 'Returned for Correction'
        : nomination.status === 'Faculty Rejected'
        ? 'Rejected by Faculty'
        : nomination.status === 'Awaiting Faculty Verification'
        ? 'Awaiting Verification'
        : 'Pending',
      status:
        nomination.status === 'Returned for Correction'
          ? 'warning'
          : nomination.status === 'Faculty Rejected'
          ? 'failed'
          : verification ||
            ['Faculty Verified', 'Pending Student Affairs Review', 'Recommended for Selection', 'Approved', 'Selected'].includes(
              nomination.status
            )
          ? 'completed'
          : nomination.status === 'Awaiting Faculty Verification'
          ? 'current'
          : 'upcoming',
      details: verification ? `CGPA: ${verification.verifiedCgpa} • Result: ${verification.result}` : nomination.correctionReason,
    },
    {
      id: 3,
      title: 'Eligibility Assessment',
      subtitle: ['Pending Student Affairs Review', 'Recommended for Selection', 'Approved', 'Selected'].includes(nomination.status)
        ? 'Evaluated by Engine'
        : 'Pending Verification',
      status: ['Pending Student Affairs Review', 'Recommended for Selection', 'Approved', 'Selected'].includes(nomination.status)
        ? 'completed'
        : 'upcoming',
      details: 'Evaluated against official Senate criteria',
    },
    {
      id: 4,
      title: 'Student Affairs Review',
      subtitle: review
        ? `Reviewed by ${review.reviewerName}`
        : nomination.status === 'Pending Student Affairs Review'
        ? 'Under DSA Review'
        : nomination.status === 'Rejected'
        ? 'Rejected by DSA'
        : 'Pending',
      status:
        nomination.status === 'Rejected'
          ? 'failed'
          : review || ['Recommended for Selection', 'Approved', 'Selected'].includes(nomination.status)
          ? 'completed'
          : nomination.status === 'Pending Student Affairs Review'
          ? 'current'
          : 'upcoming',
      details: review ? `Decision: ${review.decision}` : nomination.studentAffairsRemarks,
    },
    {
      id: 5,
      title: 'Management Approval',
      subtitle: nomination.status === 'Selected'
        ? 'Ratified by Council'
        : nomination.status === 'Recommended for Selection'
        ? 'Awaiting Executive Confirmation'
        : 'Pending',
      status:
        nomination.status === 'Selected'
          ? 'completed'
          : nomination.status === 'Recommended for Selection'
          ? 'current'
          : 'upcoming',
      details: nomination.managementRemarks || 'Executive confirmation stage',
    },
    {
      id: 6,
      title: 'Final SRC Selection',
      subtitle: nomination.status === 'Selected'
        ? `Confirmed Seat (${selection?.resolutionNumber || 'Resolution Recorded'})`
        : 'Not Finalized',
      status: nomination.status === 'Selected' ? 'completed' : 'upcoming',
      details: nomination.status === 'Selected' ? `Seat: ${nomination.proposedPosition}` : undefined,
    },
  ];

  return (
    <div className="w-full py-4">
      <div className="relative">
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0" />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative z-10">
          {stages.map((stage, idx) => {
            let circleBg = 'bg-white border-2 border-gray-300 text-gray-400';
            let icon = <span className="text-xs font-bold">{stage.id}</span>;

            if (stage.status === 'completed') {
              circleBg = 'bg-[#075B40] border-2 border-[#075B40] text-white shadow-md shadow-[#075B40]/20';
              icon = <Check className="w-4 h-4 stroke-[3]" />;
            } else if (stage.status === 'current') {
              circleBg = 'bg-[#D5AC49] border-2 border-[#B88F28] text-[#003B2B] animate-pulse';
              icon = <Clock className="w-4 h-4 stroke-[2.5]" />;
            } else if (stage.status === 'warning') {
              circleBg = 'bg-amber-500 border-2 border-amber-600 text-white';
              icon = <AlertTriangle className="w-4 h-4 stroke-[2.5]" />;
            } else if (stage.status === 'failed') {
              circleBg = 'bg-rose-600 border-2 border-rose-700 text-white';
              icon = <X className="w-4 h-4 stroke-[3]" />;
            }

            return (
              <div key={idx} className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center gap-3 md:gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${circleBg}`}>
                  {icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">{stage.title}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">{stage.subtitle}</p>
                  {stage.details && (
                    <p className="text-[10px] text-[#075B40] font-medium mt-1 bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-100 line-clamp-2">
                      {stage.details}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
