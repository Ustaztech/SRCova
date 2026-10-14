import React, { useState, useEffect, useRef } from 'react';
import { CandidateAvatar } from '../common/CandidateAvatar';
import { Modal } from '../common/Modal';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Faculty, Department, Programme, Student } from '../../types';
import { User, GraduationCap, FileCheck, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Upload, Camera, Trash2, Image as ImageIcon } from 'lucide-react';

interface CandidateRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (candidate: Student) => void;
}

export const CandidateRegistrationModal: React.FC<CandidateRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    matricNumber: '',
    gender: 'Male' as 'Male' | 'Female',
    email: '',
    phone: '',
    passportPhoto: '',
    facultyId: '',
    departmentId: '',
    programmeId: '',
    level: '300L' as '100L' | '200L' | '300L' | '400L' | '500L',
    cgpa: '',
    isCourseRep: false,
    hasDisciplinaryRecord: false,
    clearanceNotes: '',
    leadershipExperience: '',
    willingnessStatement: '',
    supportingStatement: '',
  });

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (PNG, JPG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image file is too large. Please select a photo under 5MB.');
      return;
    }
    setPhotoError(null);
    setIsProcessingPhoto(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 400;
          let w = img.width;
          let h = img.height;
          if (w > h) {
            if (w > MAX_DIM) {
              h = Math.round((h * MAX_DIM) / w);
              w = MAX_DIM;
            }
          } else {
            if (h > MAX_DIM) {
              w = Math.round((w * MAX_DIM) / h);
              h = MAX_DIM;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
            setFormData((prev) => ({ ...prev, passportPhoto: dataUrl }));
          } else {
            setFormData((prev) => ({ ...prev, passportPhoto: e.target?.result as string }));
          }
        } catch {
          setFormData((prev) => ({ ...prev, passportPhoto: e.target?.result as string }));
        } finally {
          setIsProcessingPhoto(false);
        }
      };
      img.onerror = () => {
        setPhotoError('Could not process this image file.');
        setIsProcessingPhoto(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setPhotoError('Failed to read image file.');
      setIsProcessingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isOpen) {
      const allFacs = DatabaseService.getFaculties();
      setFaculties(allFacs);

      // Pre-select user's faculty and department if departmental officer
      const initialFacId = currentUser?.facultyId || allFacs[0]?.id || '';
      const initialDepts = DatabaseService.getDepartments(initialFacId);
      setDepartments(initialDepts);

      const initialDeptId = currentUser?.departmentId || initialDepts[0]?.id || '';
      const initialProgs = DatabaseService.getProgrammes(initialDeptId);
      setProgrammes(initialProgs);

      setFormData((prev) => ({
        ...prev,
        facultyId: initialFacId,
        departmentId: initialDeptId,
        programmeId: initialProgs[0]?.id || '',
      }));
      setStep(1);
      setErrors({});
    }
  }, [isOpen, currentUser]);

  const handleFacultyChange = (fId: string) => {
    const depts = DatabaseService.getDepartments(fId);
    setDepartments(depts);
    const firstDept = depts[0]?.id || '';
    const progs = DatabaseService.getProgrammes(firstDept);
    setProgrammes(progs);

    setFormData((prev) => ({
      ...prev,
      facultyId: fId,
      departmentId: firstDept,
      programmeId: progs[0]?.id || '',
    }));
  };

  const handleDepartmentChange = (dId: string) => {
    const progs = DatabaseService.getProgrammes(dId);
    setProgrammes(progs);
    setFormData((prev) => ({
      ...prev,
      departmentId: dId,
      programmeId: progs[0]?.id || '',
    }));
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required.';
    if (!formData.matricNumber.trim()) {
      errs.matricNumber = 'Matriculation Number is required.';
    } else {
      const existing = DatabaseService.getStudentByMatric(formData.matricNumber);
      if (existing) {
        errs.matricNumber = 'Matriculation number already exists in system records.';
      }
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = 'Valid institutional email is required.';
    }
    if (!formData.phone.trim()) errs.phone = 'Contact phone number is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.facultyId) errs.facultyId = 'Please select a faculty.';
    if (!formData.departmentId) errs.departmentId = 'Please select a department.';
    if (!formData.programmeId) errs.programmeId = 'Please select an academic programme.';

    const cgpaNum = parseFloat(formData.cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0.0 || cgpaNum > 5.0) {
      errs.cgpa = 'CGPA must be a valid number between 0.00 and 5.00.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const student = DatabaseService.createStudent(
        {
          fullName: formData.fullName.trim(),
          matricNumber: formData.matricNumber.trim().toUpperCase(),
          gender: formData.gender,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          facultyId: formData.facultyId,
          departmentId: formData.departmentId,
          programmeId: formData.programmeId,
          level: formData.level,
          cgpa: parseFloat(formData.cgpa),
          isCourseRep: formData.isCourseRep,
          passportPhoto: formData.passportPhoto,
          clearanceNotes: formData.clearanceNotes,
          hasDisciplinaryRecord: formData.hasDisciplinaryRecord,
        },
        currentUser || undefined
      );

      showToast(
        'success',
        'Candidate Registered Successfully',
        `${student.fullName} (${student.matricNumber}) is now enrolled in the candidate roster.`
      );
      onSuccess(student);
      onClose();
    } catch (err: any) {
      showToast('danger', 'Registration Error', err.message || 'Failed to register candidate.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Prospective SRC Candidate"
      subtitle="Complete candidate profile with verified personal, academic and clearance data"
      maxWidth="3xl"
    >
      {/* Stepper Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-[#075B40] text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            1
          </div>
          <span className={`text-xs font-semibold ${step >= 1 ? 'text-[#075B40]' : 'text-gray-400'}`}>
            Personal Details
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
            Academic Standing
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
            Clearance & Statements
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name (Surname First, e.g. USMAN SABIU) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. USMAN SABIU"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40]"
                />
                {errors.fullName && <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Matriculation Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NSUK/NAS/CSC/22/0142"
                  value={formData.matricNumber}
                  onChange={(e) => setFormData({ ...formData, matricNumber: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40] uppercase"
                />
                {errors.matricNumber && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.matricNumber}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Institutional Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="candidate@srcova.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40]"
                />
                {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+234 814 000 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40]"
                />
                {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Real Passport Photograph Upload */}
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-800">
                  Passport Photograph (Direct File Upload)
                </label>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[11px] text-[#075B40] hover:underline font-semibold"
                >
                  {showUrlInput ? 'Hide URL input' : 'Or paste image URL'}
                </button>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    processImageFile(e.target.files[0]);
                  }
                }}
              />

              {formData.passportPhoto ? (
                <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-emerald-200 shadow-xs">
                  <CandidateAvatar
                    src={formData.passportPhoto}
                    name={formData.fullName || 'Candidate'}
                    size="xl"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Photo Ready
                      </span>
                      <span className="text-[10px] text-gray-400">Attached to profile</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      High-resolution candidate portrait ready for submission.
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-[#075B40] hover:text-[#003B2B] flex items-center gap-1"
                      >
                        <Camera className="w-3 h-3" />
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, passportPhoto: '' })}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) {
                      processImageFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-[#075B40] bg-emerald-50/60'
                      : 'border-gray-300 hover:border-[#075B40] bg-white hover:bg-gray-50/50'
                  }`}
                >
                  <div className="mx-auto w-10 h-10 rounded-full bg-[#075B40]/10 flex items-center justify-center text-[#075B40] mb-2">
                    {isProcessingPhoto ? (
                      <span className="animate-spin text-xs">â³</span>
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-800">
                    {isProcessingPhoto ? 'Processing photo...' : 'Click to upload passport photo, or drag and drop'}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    PNG, JPG, or WebP up to 5MB. Automatically optimized for secure storage.
                  </p>
                </div>
              )}

              {photoError && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {photoError}
                </p>
              )}

              {showUrlInput && (
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Direct Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.passportPhoto}
                    onChange={(e) => setFormData({ ...formData, passportPhoto: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Academic Standing */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Faculty *</label>
                <select
                  value={formData.facultyId}
                  disabled={currentUser?.role === 'DEPARTMENT_OFFICER'}
                  onChange={(e) => handleFacultyChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40] bg-white"
                >
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department *</label>
                <select
                  value={formData.departmentId}
                  disabled={currentUser?.role === 'DEPARTMENT_OFFICER'}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40] bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Programme *</label>
                <select
                  value={formData.programmeId}
                  onChange={(e) => setFormData({ ...formData, programmeId: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40] bg-white"
                >
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Academic Level *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40] bg-white"
                >
                  <option value="100L">100 Level (Fresher)</option>
                  <option value="200L">200 Level</option>
                  <option value="300L">300 Level (Recommended)</option>
                  <option value="400L">400 Level (Recommended)</option>
                  <option value="500L">500 Level (Law/Agric)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Current Cumulative GPA (CGPA) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.00"
                  max="5.00"
                  required
                  placeholder="e.g. 4.25"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 focus:border-[#075B40] font-bold text-[#075B40]"
                />
                {errors.cgpa && <p className="text-[11px] text-red-600 mt-1">{errors.cgpa}</p>}
                <p className="text-[10px] text-gray-500 mt-1">Minimum requirement is 3.50/5.00</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCourseRep}
                  onChange={(e) => setFormData({ ...formData, isCourseRep: e.target.checked })}
                  className="w-4 h-4 text-[#075B40] rounded focus:ring-[#075B40]"
                />
                <span className="text-xs font-semibold text-[#003B2B]">
                  Confirmed Course Representative / Class Leader
                </span>
              </label>
              <p className="text-[11px] text-gray-600 mt-1 ml-6">
                Check this if candidate holds or held an official Course Representative office.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Clearance & Statements */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!formData.hasDisciplinaryRecord}
                  onChange={(e) =>
                    setFormData({ ...formData, hasDisciplinaryRecord: !e.target.checked })
                  }
                  className="w-4 h-4 text-[#075B40] rounded focus:ring-[#075B40]"
                />
                <span className="text-xs font-semibold text-gray-800">
                  Clean Disciplinary & Administrative Record
                </span>
              </label>
              <p className="text-[11px] text-gray-500 mt-1 ml-6">
                Attest that candidate has no active penalties from the University Disciplinary Committee.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Departmental Board Clearance Remarks
              </label>
              <textarea
                rows={2}
                value={formData.clearanceNotes}
                onChange={(e) => setFormData({ ...formData, clearanceNotes: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
                placeholder="Enter board clearance notes..."
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-900 leading-relaxed">
                <strong>Administrative Verification Note:</strong> Candidate registration does not
                confer automatic eligibility. The Faculty Officer will verify academic transcripts
                and examination ledgers before Student Affairs review.
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
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

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-lg flex items-center gap-1.5 transition-colors shadow-md shadow-[#075B40]/20"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D5AC49]" />
              <span>Register Candidate</span>
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};
