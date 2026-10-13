export type UserRole =
  | 'SUPER_ADMIN'
  | 'DEPARTMENT_OFFICER'
  | 'FACULTY_OFFICER'
  | 'DEAN_STUDENT_AFFAIRS'
  | 'MANAGEMENT_APPROVER';

export interface User {
  id: string;
  email: string;
  passwordHash: string; // Fictional hashed representation
  fullName: string;
  role: UserRole;
  facultyId?: string;
  departmentId?: string;
  phone?: string;
  avatar?: string;
  title?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Faculty {
  id: string;
  code: string;
  name: string;
  deanName: string;
  officerEmail: string;
  createdAt: string;
}

export interface Department {
  id: string;
  facultyId: string;
  code: string;
  name: string;
  hodName: string;
  officerEmail: string;
  createdAt: string;
}

export interface Programme {
  id: string;
  departmentId: string;
  name: string;
  durationYears: number;
  degreeType: 'B.Sc.' | 'B.A.' | 'LL.B.' | 'B.Ed.' | 'B.Agric.';
}

export interface AcademicSession {
  id: string;
  name: string;
  isCurrent: boolean;
  startDate: string;
  endDate: string;
}

export type NominationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Awaiting Faculty Verification'
  | 'Returned for Correction'
  | 'Faculty Verified'
  | 'Faculty Rejected'
  | 'Pending Student Affairs Review'
  | 'Approved'
  | 'Rejected'
  | 'Recommended for Selection'
  | 'Pending Final Approval'
  | 'Selected'
  | 'Not Selected';

export interface Student {
  id: string;
  matricNumber: string;
  fullName: string;
  gender: 'Male' | 'Female';
  email: string;
  phone: string;
  facultyId: string;
  departmentId: string;
  programmeId: string;
  level: '100L' | '200L' | '300L' | '400L' | '500L';
  cgpa: number;
  isCourseRep: boolean;
  passportPhoto?: string;
  clearanceNotes?: string;
  hasDisciplinaryRecord: boolean;
  createdAt: string;
}

export interface SRCExercise {
  id: string;
  title: string;
  academicSessionId: string;
  startDate: string;
  nominationDeadline: string;
  status: 'Upcoming' | 'Active' | 'Verification' | 'Review' | 'Closed';
  description: string;
  totalCapacity: number;
  isManagementApprovalRequired: boolean;
  createdAt: string;
}

export interface SRCPosition {
  id: string;
  exerciseId: string;
  title: string;
  quota: number;
  description: string;
  requirements?: string;
}

export interface SupportingDocument {
  id: string;
  nominationId: string;
  studentId: string;
  documentType:
    | 'Statement of Result'
    | 'Course Rep Certificate'
    | 'Character Clearance'
    | 'Student ID Card'
    | 'Letter of Intent';
  fileName: string;
  fileUrl: string;
  fileSize: string;
  uploadedAt: string;
  verificationStatus: 'Pending' | 'Verified' | 'Flagged';
  verifiedBy?: string;
  notes?: string;
}

export interface Nomination {
  id: string;
  referenceNumber: string;
  exerciseId: string;
  studentId: string;
  positionId: string;
  facultyId: string;
  departmentId: string;
  status: NominationStatus;
  proposedPosition: string;
  leadershipExperience: string;
  willingnessStatement: string;
  supportingStatement: string;
  clearanceStatus: 'Cleared' | 'Pending' | 'Flagged';
  submittedAt?: string;
  submittedByUserId?: string;
  currentReviewStage:
    | 'Department Draft'
    | 'Faculty Verification'
    | 'Student Affairs Review'
    | 'Management Approval'
    | 'Completed';
  correctionReason?: string;
  rejectionReason?: string;
  facultyOfficerRemarks?: string;
  studentAffairsRemarks?: string;
  managementRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export type EligibilityRuleType =
  | 'MIN_CGPA'
  | 'ACADEMIC_LEVEL'
  | 'COURSE_REP_REQUIRED'
  | 'NO_DISCIPLINARY_RECORD'
  | 'REQUIRED_DOCUMENTS'
  | 'FACULTY_QUOTA';

export interface EligibilityRule {
  id: string;
  exerciseId: string;
  ruleCode: string;
  ruleName: string;
  description: string;
  ruleType: EligibilityRuleType;
  thresholdValue: string | number;
  isMandatory: boolean;
  isActive: boolean;
  createdAt: string;
}

export type EligibilityOutcome =
  | 'Eligible'
  | 'Ineligible'
  | 'Pending Verification'
  | 'Requires Clarification';

export interface EligibilityCheck {
  id: string;
  nominationId: string;
  ruleId: string;
  ruleCode: string;
  outcome: EligibilityOutcome;
  actualValue: string | number;
  thresholdValue: string | number;
  evaluatedAt: string;
  remarks: string;
}

export interface VerificationRecord {
  id: string;
  nominationId: string;
  verifyingOfficerId: string;
  officerName: string;
  officerRole: string;
  verifiedCgpa: number;
  verifiedLevel: string;
  verifiedCourseRep: boolean;
  documentsInspected: boolean;
  result: 'Verified' | 'Returned for Correction' | 'Rejected';
  remarks: string;
  verifiedFields: string[];
  createdAt: string;
}

export interface AdministrativeReview {
  id: string;
  nominationId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  decision: 'Approved' | 'Rejected' | 'Request Clarification' | 'Recommended for Selection';
  remarks: string;
  createdAt: string;
}

export interface Selection {
  id: string;
  exerciseId: string;
  nominationId: string;
  studentId: string;
  positionId: string;
  positionTitle: string;
  facultyId: string;
  departmentId: string;
  status: 'Recommended' | 'Provisional' | 'Approved' | 'Confirmed';
  selectedByOfficerId: string;
  confirmedByOfficerId?: string;
  confirmationDate?: string;
  resolutionNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  recipientUserId?: string;
  recipientRole?: UserRole | 'ALL';
  facultyId?: string;
  departmentId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  linkTo?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: 'Nomination' | 'Candidate' | 'Staff' | 'Verification' | 'Selection' | 'Exercise' | 'Settings';
  entityId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface SystemSettings {
  id: string;
  appName: string;
  institutionName: string;
  tagline: string;
  primaryLogoUrl: string;
  vectorLogoUrl: string;
  premiumLogoUrl: string;
  currentAcademicSessionId: string;
  currentExerciseId: string;
  isManagementApprovalRequired: boolean;
  maxNominationsPerDept: number;
  minCgpaRequirement: number;
  contactEmail: string;
  contactPhone: string;
  campusAddress: string;
  updatedAt: string;
}
