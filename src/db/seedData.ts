import {
  Faculty,
  Department,
  Programme,
  AcademicSession,
  SRCExercise,
  SRCPosition,
  EligibilityRule,
  User,
  Student,
  Nomination,
  SupportingDocument,
  VerificationRecord,
  AdministrativeReview,
  Selection,
  AppNotification,
  AuditLog,
  SystemSettings,
  EligibilityCheck
} from '../types';

export const INITIAL_SETTINGS: SystemSettings = {
  id: 'setting-1',
  appName: 'SRCova',
  institutionName: 'Academic Research Project (Case Study: NSUK)',
  tagline: 'Smart Selection. Strong Representation.',
  primaryLogoUrl: '/assets/branding/logo-horizontal.png',
  vectorLogoUrl: '/assets/branding/logo-vector.png',
  premiumLogoUrl: '/assets/branding/logo-premium.png',
  currentAcademicSessionId: 'session-2025-2026',
  currentExerciseId: 'exercise-2026-main',
  isManagementApprovalRequired: true,
  maxNominationsPerDept: 3,
  minCgpaRequirement: 3.50,
  contactEmail: 'support.srcover@gmail.com',
  contactPhone: '',
  campusAddress: 'Student Affairs Division, Senate Building, Main Campus, Keffi, Nasarawa State, Nigeria',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_SESSIONS: AcademicSession[] = [
  {
    id: 'session-2025-2026',
    name: '2025/2026 Academic Session',
    isCurrent: true,
    startDate: '2025-10-01',
    endDate: '2026-09-30',
  },
  {
    id: 'session-2024-2025',
    name: '2024/2025 Academic Session',
    isCurrent: false,
    startDate: '2024-10-01',
    endDate: '2025-09-30',
  },
];

export const INITIAL_FACULTIES: Faculty[] = [
  {
    id: 'fac-nas',
    code: 'FNAS',
    name: 'Faculty of Natural & Applied Sciences',
    deanName: '',
    officerEmail: '',
    createdAt: '2025-09-15T08:00:00Z',
  },
  {
    id: 'fac-admin',
    code: 'FADM',
    name: 'Faculty of Administration',
    deanName: '',
    officerEmail: '',
    createdAt: '2025-09-15T08:00:00Z',
  },
  {
    id: 'fac-soc',
    code: 'FSOC',
    name: 'Faculty of Social Sciences',
    deanName: '',
    officerEmail: '',
    createdAt: '2025-09-15T08:00:00Z',
  },
  {
    id: 'fac-law',
    code: 'FLAW',
    name: 'Faculty of Law',
    deanName: '',
    officerEmail: '',
    createdAt: '2025-09-15T08:00:00Z',
  },
  {
    id: 'fac-arts',
    code: 'FART',
    name: 'Faculty of Arts',
    deanName: '',
    officerEmail: '',
    createdAt: '2025-09-15T08:00:00Z',
  },
  {
    id: 'fac-edu',
    code: 'FEDU',
    name: 'Faculty of Education',
    deanName: '',
    officerEmail: '',
    createdAt: '2025-09-15T08:00:00Z',
  },
  {
    id: 'fac-agric',
    code: 'FAGR',
    name: 'Faculty of Agriculture',
    deanName: '',
    officerEmail: '',
    createdAt: '2025-09-15T08:00:00Z',
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  // FNAS
  {
    id: 'dept-cs',
    facultyId: 'fac-nas',
    code: 'CSC',
    name: 'Department of Computer Science',
    hodName: '',
    officerEmail: '',
    createdAt: '2025-09-15T08:00:00Z',
  },
  {
    id: 'dept-maths',
    facultyId: 'fac-nas',
    code: 'MTH',
    name: 'Department of Mathematics',
    hodName: '',
    officerEmail: '',
    createdAt: '2025-09-15T08:00:00Z',
  },
  {
    id: 'dept-bch',
    facultyId: 'fac-nas',
    code: 'BCH',
    name: 'Department of Biochemistry',
    hodName: '',
    officerEmail: '',
    createdAt: '2025-09-15T08:00:00Z',
  },
  // FADM
  {
    id: 'dept-acc',
    facultyId: 'fac-admin',
    code: 'ACC',
    name: 'Department of Accounting',
    hodName: '',
    officerEmail: '',
    createdAt: '2025-09-15T08:00:00Z',
  },
  {
    id: 'dept-bus',
    facultyId: 'fac-admin',
    code: 'BUS',
    name: 'Department of Business Administration',
    hodName: '',
    officerEmail: '',
    createdAt: '2025-09-15T08:00:00Z',
  },
  // FSOC
  {
    id: 'dept-pol',
    facultyId: 'fac-soc',
    code: 'POL',
    name: 'Department of Political Science',
    hodName: '',
    officerEmail: '',
    createdAt: '2025-09-15T08:00:00Z',
  },
  {
    id: 'dept-mcm',
    facultyId: 'fac-soc',
    code: 'MCM',
    name: 'Department of Mass Communication',
    hodName: '',
    officerEmail: '',
    createdAt: '2025-09-15T08:00:00Z',
  },
  // FLAW
  {
    id: 'dept-law-pub',
    facultyId: 'fac-law',
    code: 'PLW',
    name: 'Department of Public & International Law',
    hodName: '',
    officerEmail: '',
    createdAt: '2025-09-15T08:00:00Z',
  },
];

export const INITIAL_PROGRAMMES: Programme[] = [
  { id: 'prog-cs', departmentId: 'dept-cs', name: 'B.Sc. Computer Science', durationYears: 4, degreeType: 'B.Sc.' },
  { id: 'prog-maths', departmentId: 'dept-maths', name: 'B.Sc. Mathematics', durationYears: 4, degreeType: 'B.Sc.' },
  { id: 'prog-bch', departmentId: 'dept-bch', name: 'B.Sc. Biochemistry', durationYears: 4, degreeType: 'B.Sc.' },
  { id: 'prog-acc', departmentId: 'dept-acc', name: 'B.Sc. Accounting', durationYears: 4, degreeType: 'B.Sc.' },
  { id: 'prog-bus', departmentId: 'dept-bus', name: 'B.Sc. Business Administration', durationYears: 4, degreeType: 'B.Sc.' },
  { id: 'prog-pol', departmentId: 'dept-pol', name: 'B.Sc. Political Science', durationYears: 4, degreeType: 'B.Sc.' },
  { id: 'prog-mcm', departmentId: 'dept-mcm', name: 'B.Sc. Mass Communication', durationYears: 4, degreeType: 'B.Sc.' },
  { id: 'prog-law', departmentId: 'dept-law-pub', name: 'LL.B. Common & Islamic Law', durationYears: 5, degreeType: 'LL.B.' },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-root',
    email: 'support.srcover@gmail.com',
    passwordHash: 'Admin@SRCova2026',
    fullName: 'System Administrator',
    title: 'Lead System Administrator',
    role: 'SUPER_ADMIN',
    phone: '',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
];

export const INITIAL_EXERCISES: SRCExercise[] = [
  {
    id: 'exercise-2026-main',
    title: '2025/2026 SRC General Representative Selection Exercise',
    academicSessionId: 'session-2025-2026',
    startDate: '2026-10-01',
    nominationDeadline: '2026-10-31',
    status: 'Active',
    description: 'Academic research prototype evaluating merit-based nomination, faculty verification, and representative selection framework (Case Study: Nasarawa State University, Keffi).',
    totalCapacity: 40,
    isManagementApprovalRequired: true,
    createdAt: '2026-09-20T10:00:00Z',
  },
];

export const INITIAL_POSITIONS: SRCPosition[] = [
  {
    id: 'pos-fnas-rep',
    exerciseId: 'exercise-2026-main',
    title: 'Faculty Representative — Natural & Applied Sciences',
    quota: 5,
    description: 'Represents the collective student body of FNAS at the central legislative chamber of the SRC.',
    requirements: 'Minimum 3.50 CGPA, 300L/400L standing, active leadership record.',
  },
  {
    id: 'pos-fadm-rep',
    exerciseId: 'exercise-2026-main',
    title: 'Faculty Representative — Administration',
    quota: 5,
    description: 'Represents students of Faculty of Administration.',
    requirements: 'Minimum 3.50 CGPA, 300L/400L standing.',
  },
  {
    id: 'pos-fsoc-rep',
    exerciseId: 'exercise-2026-main',
    title: 'Faculty Representative — Social Sciences',
    quota: 5,
    description: 'Represents students of Faculty of Social Sciences.',
    requirements: 'Minimum 3.50 CGPA, 300L/400L standing.',
  },
  {
    id: 'pos-flaw-rep',
    exerciseId: 'exercise-2026-main',
    title: 'Faculty Representative — Law',
    quota: 3,
    description: 'Represents Faculty of Law in legislative drafting and legal review committees.',
    requirements: 'Minimum 3.50 CGPA, 300L/400L/500L standing.',
  },
  {
    id: 'pos-dept-del',
    exerciseId: 'exercise-2026-main',
    title: 'Departmental Collegiate Delegate',
    quota: 10,
    description: 'Collegiate floor member liaising between departments and the council.',
    requirements: 'Minimum 3.50 CGPA, course rep experience.',
  },
];

export const INITIAL_RULES: EligibilityRule[] = [
  {
    id: 'rule-cgpa',
    exerciseId: 'exercise-2026-main',
    ruleCode: 'MIN_CGPA',
    ruleName: 'Minimum Cumulative Grade Point Average (CGPA)',
    description: 'Candidates must possess a verified CGPA of at least 3.50 on a 5.00 point scale.',
    ruleType: 'MIN_CGPA',
    thresholdValue: 3.50,
    isMandatory: true,
    isActive: true,
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 'rule-level',
    exerciseId: 'exercise-2026-main',
    ruleCode: 'ACADEMIC_LEVEL',
    ruleName: 'Appropriate Academic Standing & Level',
    description: 'Candidate must have completed at least one full academic session (minimum 200L or 300L). Fresh 100L students are not eligible.',
    ruleType: 'ACADEMIC_LEVEL',
    thresholdValue: '200L,300L,400L',
    isMandatory: true,
    isActive: true,
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 'rule-rep',
    exerciseId: 'exercise-2026-main',
    ruleCode: 'COURSE_REP_REQUIRED',
    ruleName: 'Demonstrated Class / Course Representation',
    description: 'Prior or active service as Course Representative or Class Leader is strongly required.',
    ruleType: 'COURSE_REP_REQUIRED',
    thresholdValue: 'true',
    isMandatory: true,
    isActive: true,
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 'rule-discipline',
    exerciseId: 'exercise-2026-main',
    ruleCode: 'NO_DISCIPLINARY_RECORD',
    ruleName: 'Clean Disciplinary Record & Administrative Clearance',
    description: 'Candidate must have no pending or historical university disciplinary sanctions.',
    ruleType: 'NO_DISCIPLINARY_RECORD',
    thresholdValue: 'true',
    isMandatory: true,
    isActive: true,
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 'rule-docs',
    exerciseId: 'exercise-2026-main',
    ruleCode: 'REQUIRED_DOCUMENTS',
    ruleName: 'Mandatory Supporting Documents',
    description: 'Candidate must submit verified Statement of Results, Valid ID Card, and Clearance Letter.',
    ruleType: 'REQUIRED_DOCUMENTS',
    thresholdValue: 'Statement of Result,Student ID Card',
    isMandatory: true,
    isActive: true,
    createdAt: '2026-09-20T10:00:00Z',
  },
];
export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_NOMINATIONS: Nomination[] = [];
export const INITIAL_DOCUMENTS: SupportingDocument[] = [];
export const INITIAL_VERIFICATIONS: VerificationRecord[] = [];
export const INITIAL_ELIGIBILITY_CHECKS: EligibilityCheck[] = [];
export const INITIAL_REVIEWS: AdministrativeReview[] = [];
export const INITIAL_SELECTIONS: Selection[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];