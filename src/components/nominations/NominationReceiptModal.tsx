import { CandidateAvatar } from '../common/CandidateAvatar';
import React from 'react';
import { Modal } from '../common/Modal';
import { Nomination, Student, Faculty, Department } from '../../types';
import { DatabaseService } from '../../db/storage';
import { BrandLogo } from '../common/BrandLogo';
import { Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';

interface NominationReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  nomination: Nomination;
}

export const NominationReceiptModal: React.FC<NominationReceiptModalProps> = ({
  isOpen,
  onClose,
  nomination,
}) => {
  const student = DatabaseService.getStudentById(nomination.studentId);
  const faculty = DatabaseService.getFacultyById(nomination.facultyId);
  const department = DatabaseService.getDepartmentById(nomination.departmentId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Nomination Submission Receipt"
      subtitle="Institutional verification document issued by Nasarawa State University, Keffi"
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-gray-500">
            Issued on {new Date().toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      }
    >
      <div className="p-6 bg-white border border-gray-200 rounded-xl relative shadow-sm print:border-none print:shadow-none">
        {/* Top Header */}
        <div className="text-center pb-4 border-b-2 border-[#075B40]">
          <div className="flex justify-center mb-2">
            <BrandLogo variant="horizontal" height={45} />
          </div>
          <h2 className="text-base font-extrabold uppercase tracking-wide text-[#003B2B] font-display">
            Nasarawa State University, Keffi
          </h2>
          <p className="text-xs text-gray-600 font-medium">
            Student Affairs Division • Student Representative Council (SRC) Directorate
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-[#D5AC49]/20 text-[#003B2B] rounded-full text-xs font-bold border border-[#D5AC49]">
            OFFICIAL NOMINATION SUBMISSION ACKNOWLEDGEMENT
          </div>
        </div>

        {/* Reference & Barcode */}
        <div className="my-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
              Nomination Reference Number
            </span>
            <span className="text-base font-mono font-bold text-[#075B40]">
              {nomination.referenceNumber}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
              Submission Timestamp
            </span>
            <span className="text-xs font-semibold text-gray-700">
              {nomination.submittedAt ? new Date(nomination.submittedAt).toLocaleString() : 'Draft Status'}
            </span>
          </div>
        </div>

        {/* Candidate Bio Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center my-4 pb-4 border-b border-gray-100">
          <div className="sm:col-span-1 flex justify-center">
            <CandidateAvatar src={student?.passportPhoto} name={student?.fullName} size="sm" />
          </div>
          <div className="sm:col-span-3 grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
            <div>
              <span className="text-gray-400 text-[11px] block">Candidate Full Name:</span>
              <span className="font-bold text-gray-900">{student?.fullName}</span>
            </div>
            <div>
              <span className="text-gray-400 text-[11px] block">Matriculation Number:</span>
              <span className="font-semibold text-gray-900 font-mono">{student?.matricNumber}</span>
            </div>
            <div>
              <span className="text-gray-400 text-[11px] block">Faculty:</span>
              <span className="font-medium text-gray-800">{faculty?.name}</span>
            </div>
            <div>
              <span className="text-gray-400 text-[11px] block">Department:</span>
              <span className="font-medium text-gray-800">{department?.name}</span>
            </div>
            <div>
              <span className="text-gray-400 text-[11px] block">Standing & CGPA:</span>
              <span className="font-bold text-[#075B40]">{student?.level} • CGPA {student?.cgpa.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400 text-[11px] block">Office Nominated:</span>
              <span className="font-bold text-gray-900">{nomination.proposedPosition}</span>
            </div>
          </div>
        </div>

        {/* Security / Verification Watermark info */}
        <div className="bg-[#075B40]/5 p-3 rounded-lg border border-[#075B40]/20 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#075B40] shrink-0 mt-0.5" />
          <div className="text-[11px] text-gray-700 leading-relaxed">
            <span className="font-bold text-[#003B2B] block">Authenticity Verification:</span>
            This document confirms registration into the SRCova administrative pipeline. This receipt does
            not guarantee election or appointment until verified by the Faculty Officer and confirmed by
            the Vice-Chancellor’s Selection Board.
          </div>
        </div>

        {/* Institutional Sign-off Mockup */}
        <div className="mt-6 pt-4 border-t border-dashed border-gray-300 grid grid-cols-2 text-center text-xs text-gray-600">
          <div>
            <div className="h-10 flex items-end justify-center font-serif italic text-gray-400">
              [ Digitally Recorded ]
            </div>
            <div className="border-t border-gray-400 w-36 mx-auto mt-1" />
            <p className="text-[11px] font-semibold text-gray-800 mt-1">Departmental Officer / HOD</p>
          </div>
          <div>
            <div className="h-10 flex items-end justify-center font-serif italic text-gray-400">
              [ Pending Verification ]
            </div>
            <div className="border-t border-gray-400 w-36 mx-auto mt-1" />
            <p className="text-[11px] font-semibold text-gray-800 mt-1">Dean / Faculty Officer</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
