import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Student, SRCExercise, SRCPosition, Nomination } from '../../types';
import { FileText, Send, Save, AlertCircle, CheckCircle2, User, Upload, ArrowRight, ArrowLeft } from 'lucide-react';

interface NominationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (nomination: Nomination, isSubmitted: boolean) => void;
  preSelectedStudentId?: string;
}

export const NominationCreateModal: React.FC<NominationCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preSelectedStudentId,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Lists
  const [candidates, setCandidates] = useState<Student[]>([]);
  const [exercises, setExercises] = useState<SRCExercise[]>([]);
  const [positions, setPositions] = useState<SRCPosition[]>([]);

  // Selected Data
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [selectedPositionId, setSelectedPositionId] = useState('');

  // Statements
  const [proposedPosition, setProposedPosition] = useState('');
  const [leadershipExperience, setLeadershipExperience] = useState('');
  const [willingnessStatement, setWillingnessStatement] = useState('');
  const [supportingStatement, setSupportingStatement] = useState('');

  // Mock Uploaded Documents
  const [uploadedDocs, setUploadedDocs] = useState<
    Array<{ type: string; name: string; size: string }>
  >([
    { type: 'Statement of Result', name: 'Official_Academic_Transcript.pdf', size: '480 KB' },
    { type: 'Student ID Card', name: 'NSUK_Student_ID_Card.png', size: '210 KB' },
  ]);

  const [docTypeInput, setDocTypeInput] = useState('Statement of Result');
  const [docNameInput, setDocNameInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      const activeExercises = DatabaseService.getExercises();
      setExercises(activeExercises);

      const defaultExercise = activeExercises.find((e) => e.status === 'Active') || activeExercises[0];
      const exId = defaultExercise?.id || '';
      setSelectedExerciseId(exId);

      const availPositions = DatabaseService.getPositions(exId);
      setPositions(availPositions);
      if (availPositions.length > 0) {
        setSelectedPositionId(availPositions[0].id);
        setProposedPosition(availPositions[0].title);
      }

      // Department candidates list
      let candList = DatabaseService.getStudents();
      if (currentUser?.role === 'DEPARTMENT_OFFICER' && currentUser.departmentId) {
        candList = candList.filter((s) => s.departmentId === currentUser.departmentId);
      }
      setCandidates(candList);

      if (preSelectedStudentId) {
        setSelectedStudentId(preSelectedStudentId);
      } else if (candList.length > 0) {
        setSelectedStudentId(candList[0].id);
      }

      setStep(1);
    }
  }, [isOpen, preSelectedStudentId, currentUser]);

  const handlePositionChange = (posId: string) => {
    setSelectedPositionId(posId);
    const pos = positions.find((p) => p.id === posId);
    if (pos) setProposedPosition(pos.title);
  };

  const handleAddDocument = () => {
    if (!docNameInput.trim()) return;
    setUploadedDocs((prev) => [
      ...prev,
      { type: docTypeInput, name: docNameInput.trim(), size: '320 KB' },
    ]);
    setDocNameInput('');
  };

  const handleRemoveDoc = (idx: number) => {
    setUploadedDocs((prev) => prev.filter((_, i) => i !== idx));
  };

  const selectedStudent = candidates.find((c) => c.id === selectedStudentId);

  const handleSaveOrSubmit = (status: 'Draft' | 'Submitted') => {
    if (!selectedStudent) {
      showToast('danger', 'Validation Error', 'Please select a candidate to nominate.');
      return;
    }

    try {
      const isSubmitting = status === 'Submitted';
      const initialStatus = isSubmitting ? 'Awaiting Faculty Verification' : 'Draft';
      const initialStage = isSubmitting ? 'Faculty Verification' : 'Department Draft';

      const nomination = DatabaseService.createNomination(
        {
          exerciseId: selectedExerciseId,
          studentId: selectedStudent.id,
          positionId: selectedPositionId,
          facultyId: selectedStudent.facultyId,
          departmentId: selectedStudent.departmentId,
          status: initialStatus,
          proposedPosition: proposedPosition || 'Faculty Representative',
          leadershipExperience: leadershipExperience || 'Active student representative and leadership record.',
          willingnessStatement:
            willingnessStatement ||
            'Solemnly committed to representing fellow students with integrity and diligence.',
          supportingStatement:
            supportingStatement || 'Recommended by Departmental Board for high academic standing.',
          clearanceStatus: 'Cleared',
          submittedAt: isSubmitting ? new Date().toISOString() : undefined,
          submittedByUserId: currentUser?.id,
          currentReviewStage: initialStage,
        },
        currentUser || undefined
      );

      // Save documents attached
      for (const d of uploadedDocs) {
        DatabaseService.addDocument({
          nominationId: nomination.id,
          studentId: selectedStudent.id,
          documentType: d.type as any,
          fileName: d.name,
          fileUrl: `https://nsuk.edu.ng/vault/${d.name}`,
          fileSize: d.size,
          verificationStatus: 'Pending',
        });
      }

      showToast(
        'success',
        isSubmitting ? 'Nomination Submitted Successfully' : 'Draft Saved Successfully',
        `Nomination Reference: ${nomination.referenceNumber}. ${
          isSubmitting ? 'Forwarded to Faculty Officer for verification.' : 'Saved in department drafts.'
        }`
      );

      onSuccess(nomination, isSubmitting);
      onClose();
    } catch (err: any) {
      showToast('danger', 'Submission Error', err.message || 'Could not complete nomination.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create SRC Candidate Nomination"
      subtitle="Formal departmental nomination submission for Student Representative Council"
      maxWidth="3xl"
    >
      {/* Stepper Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-[#075B40] text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            1
          </div>
          <span className={`text-xs font-semibold ${step >= 1 ? 'text-[#075B40]' : 'text-gray-400'}`}>
            Candidate & Office
          </span>
        </div>
        <div className="h-0.5 w-12 bg-gray-200" />
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-[#075B40] text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            2
          </div>
          <span className={`text-xs font-semibold ${step >= 2 ? 'text-[#075B40]' : 'text-gray-400'}`}>
            Statements & Merit
          </span>
        </div>
        <div className="h-0.5 w-12 bg-gray-200" />
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 3 ? 'bg-[#075B40] text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            3
          </div>
          <span className={`text-xs font-semibold ${step === 3 ? 'text-[#075B40]' : 'text-gray-400'}`}>
            Documents & Review
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Registered Candidate *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40] bg-white font-medium"
                >
                  <option value="">-- Choose Candidate --</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.matricNumber}) — CGPA {c.cgpa.toFixed(2)}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Only registered students from your department appear here.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  SRC Selection Exercise *
                </label>
                <select
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40] bg-white"
                >
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title} ({ex.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedStudent && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-4">
                <img
                  src={selectedStudent.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt={selectedStudent.fullName}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-[#075B40]"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs">
                  <div>
                    <span className="text-gray-500 text-[11px] block">Full Name:</span>
                    <span className="font-bold text-gray-900">{selectedStudent.fullName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px] block">Matric No:</span>
                    <span className="font-semibold text-gray-900">{selectedStudent.matricNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px] block">Level:</span>
                    <span className="font-semibold text-gray-900">{selectedStudent.level}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px] block">CGPA Standing:</span>
                    <span className="font-bold text-[#075B40]">{selectedStudent.cgpa.toFixed(2)} / 5.00</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px] block">Course Rep:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedStudent.isCourseRep ? 'Yes (Verified)' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px] block">Disciplinary Check:</span>
                    <span className="font-semibold text-emerald-700">Clear</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Proposed SRC Position *
              </label>
              <select
                value={selectedPositionId}
                onChange={(e) => handlePositionChange(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40] bg-white font-medium"
              >
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.title} (Quota: {pos.quota} Seats)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-3.5 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Leadership Experience & Campus Involvement *
              </label>
              <textarea
                rows={3}
                required
                value={leadershipExperience}
                onChange={(e) => setLeadershipExperience(e.target.value)}
                placeholder="Detail prior executive, course representation, departmental association or student senate roles..."
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Candidate Willingness to Serve Statement *
              </label>
              <textarea
                rows={2}
                required
                value={willingnessStatement}
                onChange={(e) => setWillingnessStatement(e.target.value)}
                placeholder="Candidate's statement of commitment to student welfare and council responsibilities..."
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                HOD / Departmental Recommendation Endorsement *
              </label>
              <textarea
                rows={2}
                required
                value={supportingStatement}
                onChange={(e) => setSupportingStatement(e.target.value)}
                placeholder="Official recommendation remarks from the Departmental Selection Committee..."
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40]"
              />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            {/* Supporting Documents Upload & List */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Attached Supporting Documents
              </label>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={docTypeInput}
                    onChange={(e) => setDocTypeInput(e.target.value)}
                    className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Statement of Result">Statement of Result</option>
                    <option value="Course Rep Certificate">Course Rep Certificate</option>
                    <option value="Character Clearance">Character Clearance</option>
                    <option value="Student ID Card">Student ID Card</option>
                    <option value="Letter of Intent">Letter of Intent</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Enter document file name e.g. Result_Transcript.pdf"
                    value={docNameInput}
                    onChange={(e) => setDocNameInput(e.target.value)}
                    className="flex-1 text-xs px-3 py-1.5 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#075B40] text-white rounded-lg hover:bg-[#003B2B]"
                  >
                    Add Document
                  </button>
                </div>

                <div className="divide-y divide-gray-200 pt-2">
                  {uploadedDocs.map((doc, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#075B40]" />
                        <span className="font-semibold text-gray-800">{doc.type}:</span>
                        <span className="text-gray-600">{doc.name}</span>
                        <span className="text-[10px] text-gray-400">({doc.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(idx)}
                        className="text-red-500 hover:text-red-700 text-xs px-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submission confirmation notice */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#075B40] shrink-0 mt-0.5" />
              <div className="text-xs text-[#003B2B]">
                <strong className="block font-semibold">Ready for Academic Verification:</strong>
                Submitting this nomination issues an official reference number and places the record
                into the Faculty Officer's verification portal.
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev + 1) as any)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSaveOrSubmit('Draft')}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5 text-gray-600" />
                  <span>Save as Draft</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveOrSubmit('Submitted')}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-lg flex items-center gap-1.5 transition-colors shadow-md shadow-[#075B40]/20"
                >
                  <Send className="w-3.5 h-3.5 text-[#D5AC49]" />
                  <span>Submit Nomination</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
