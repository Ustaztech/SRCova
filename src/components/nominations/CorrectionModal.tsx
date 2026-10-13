import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Nomination, Student } from '../../types';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { RotateCcw, AlertTriangle, Send, FileText } from 'lucide-react';

interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  nomination: Nomination;
  onSuccess: () => void;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  isOpen,
  onClose,
  nomination,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();
  const student = DatabaseService.getStudentById(nomination.studentId);

  const [leadershipExperience, setLeadershipExperience] = useState(nomination.leadershipExperience || '');
  const [willingnessStatement, setWillingnessStatement] = useState(nomination.willingnessStatement || '');
  const [supportingStatement, setSupportingStatement] = useState(nomination.supportingStatement || '');
  const [correctionResponse, setCorrectionResponse] = useState('');

  const handleResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      DatabaseService.updateNomination(
        nomination.id,
        {
          status: 'Awaiting Faculty Verification',
          currentReviewStage: 'Faculty Verification',
          leadershipExperience,
          willingnessStatement,
          supportingStatement: `${supportingStatement}\n\n[Correction Note]: ${correctionResponse}`,
          correctionReason: undefined, // Cleared on resubmission
        },
        currentUser
      );

      // Create notification for Faculty Officer
      DatabaseService.createNotification({
        recipientRole: 'FACULTY_OFFICER',
        facultyId: nomination.facultyId,
        title: 'Corrected Nomination Resubmitted',
        message: `Department resubmitted corrected nomination for ${student?.fullName} (Ref: ${nomination.referenceNumber}).`,
        type: 'info',
        linkTo: '/faculty/verification',
      });

      showToast(
        'success',
        'Nomination Resubmitted',
        `Corrected application Ref ${nomination.referenceNumber} returned to Faculty Officer.`
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('danger', 'Error', err.message || 'Failed to resubmit application.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Correct and Resubmit Nomination"
      subtitle={`Application Ref: ${nomination.referenceNumber} (${student?.fullName})`}
      maxWidth="2xl"
    >
      <form onSubmit={handleResubmit} className="space-y-4 text-xs">
        {/* Returned Reason Callout */}
        <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="text-orange-950">
            <span className="font-bold block">Reason for Return (Faculty Review):</span>
            <p className="mt-0.5 leading-relaxed text-[11px]">
              {nomination.correctionReason || 'Please inspect attached academic records and resubmit.'}
            </p>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Departmental Correction Action Taken *
          </label>
          <textarea
            rows={2}
            required
            value={correctionResponse}
            onChange={(e) => setCorrectionResponse(e.target.value)}
            placeholder="Explain corrections made (e.g. Uploaded certified transcript signed by HOD)..."
            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Updated Leadership Experience & Merits
          </label>
          <textarea
            rows={3}
            value={leadershipExperience}
            onChange={(e) => setLeadershipExperience(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Resubmit Corrected Application</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
