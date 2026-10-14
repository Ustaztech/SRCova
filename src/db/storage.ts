import {
  User,
  Faculty,
  Department,
  Programme,
  AcademicSession,
  SRCExercise,
  SRCPosition,
  EligibilityRule,
  Student,
  Nomination,
  SupportingDocument,
  VerificationRecord,
  AdministrativeReview,
  Selection,
  AppNotification,
  AuditLog,
  SystemSettings,
  EligibilityCheck,
  NominationStatus,
} from '../types';

import {
  INITIAL_SETTINGS,
  INITIAL_SESSIONS,
  INITIAL_FACULTIES,
  INITIAL_DEPARTMENTS,
  INITIAL_PROGRAMMES,
  INITIAL_USERS,
  INITIAL_EXERCISES,
  INITIAL_POSITIONS,
  INITIAL_RULES,
  INITIAL_STUDENTS,
  INITIAL_NOMINATIONS,
  INITIAL_DOCUMENTS,
  INITIAL_VERIFICATIONS,
  INITIAL_ELIGIBILITY_CHECKS,
  INITIAL_REVIEWS,
  INITIAL_SELECTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './seedData';

const DB_PREFIX = 'srcova_prod_v3_';

// Purge legacy mock data keys on startup
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('srcova_db_v1_') ||
          key.startsWith('srcova_prod_v2_') ||
          key === 'srcova_auth_user_id')
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
} catch (e) {
  console.warn('Storage purge warning:', e);
}

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(DB_PREFIX + key);
    if (!item) {
      localStorage.setItem(DB_PREFIX + key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(DB_PREFIX + key, JSON.stringify(val));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('srcova:data_changed', { detail: { key } }));
    }
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

export class DatabaseService {
  // Settings
  static getSettings(): SystemSettings {
    return getStored<SystemSettings>('settings', INITIAL_SETTINGS);
  }

  static updateSettings(partial: Partial<SystemSettings>, currentUser?: User): SystemSettings {
    const current = this.getSettings();
    const updated = { ...current, ...partial, updatedAt: new Date().toISOString() };
    setStored('settings', updated);

    if (currentUser) {
      this.logAction({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'UPDATE_SYSTEM_SETTINGS',
        entityType: 'Settings',
        entityId: updated.id,
        details: `Updated system settings: ${Object.keys(partial).join(', ')}`,
      });
    }
    return updated;
  }

  // Users
  static getUsers(): User[] {
    return getStored<User[]>('users', INITIAL_USERS);
  }

  static getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  static getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  static createUser(user: Omit<User, 'id' | 'createdAt'>, currentUser?: User): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setStored('users', users);

    if (currentUser) {
      this.logAction({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'CREATE_STAFF_USER',
        entityType: 'Staff',
        entityId: newUser.id,
        details: `Created staff account for ${newUser.fullName} (${newUser.email}) with role ${newUser.role}`,
      });
    }
    return newUser;
  }

  static updateUser(id: string, partial: Partial<User>, currentUser?: User): User {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    users[idx] = { ...users[idx], ...partial };
    setStored('users', users);

    if (currentUser) {
      this.logAction({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'UPDATE_STAFF_USER',
        entityType: 'Staff',
        entityId: id,
        details: `Updated staff profile for ${users[idx].fullName}`,
      });
    }
    return users[idx];
  }

  // Faculties & Departments
  static getFaculties(): Faculty[] {
    return getStored<Faculty[]>('faculties', INITIAL_FACULTIES);
  }

  static getFacultyById(id: string): Faculty | undefined {
    return this.getFaculties().find((f) => f.id === id);
  }

  static createFaculty(data: Omit<Faculty, 'id' | 'createdAt'>, currentUser?: User): Faculty {
    const faculties = this.getFaculties();
    const newFac: Faculty = {
      ...data,
      id: `fac-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    faculties.push(newFac);
    setStored('faculties', faculties);
    if (currentUser) {
      this.logAction({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'CREATE_FACULTY',
        entityType: 'Settings',
        entityId: newFac.id,
        details: `Added new faculty: ${newFac.name} (${newFac.code})`,
      });
    }
    return newFac;
  }

  static getDepartments(facultyId?: string): Department[] {
    const depts = getStored<Department[]>('departments', INITIAL_DEPARTMENTS);
    if (facultyId) {
      return depts.filter((d) => d.facultyId === facultyId);
    }
    return depts;
  }

  static getDepartmentById(id: string): Department | undefined {
    return this.getDepartments().find((d) => d.id === id);
  }

  static createDepartment(data: Omit<Department, 'id' | 'createdAt'>, currentUser?: User): Department {
    const depts = this.getDepartments();
    const newDept: Department = {
      ...data,
      id: `dept-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    depts.push(newDept);
    setStored('departments', depts);
    if (currentUser) {
      this.logAction({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'CREATE_DEPARTMENT',
        entityType: 'Settings',
        entityId: newDept.id,
        details: `Added new department: ${newDept.name} (${newDept.code})`,
      });
    }
    return newDept;
  }

  static getProgrammes(departmentId?: string): Programme[] {
    const progs = getStored<Programme[]>('programmes', INITIAL_PROGRAMMES);
    if (departmentId) {
      return progs.filter((p) => p.departmentId === departmentId);
    }
    return progs;
  }

  static getSessions(): AcademicSession[] {
    return getStored<AcademicSession[]>('sessions', INITIAL_SESSIONS);
  }

  // Exercises & Positions
  static getExercises(): SRCExercise[] {
    return getStored<SRCExercise[]>('exercises', INITIAL_EXERCISES);
  }

  static getExerciseById(id: string): SRCExercise | undefined {
    return this.getExercises().find((e) => e.id === id);
  }

  static createExercise(data: Omit<SRCExercise, 'id' | 'createdAt'>, currentUser?: User): SRCExercise {
    const exercises = this.getExercises();
    const newExercise: SRCExercise = {
      ...data,
      id: `exercise-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    exercises.push(newExercise);
    setStored('exercises', exercises);
    if (currentUser) {
      this.logAction({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'CREATE_SRC_EXERCISE',
        entityType: 'Exercise',
        entityId: newExercise.id,
        details: `Created SRC Selection Exercise: ${newExercise.title}`,
      });
    }
    return newExercise;
  }

  static updateExercise(id: string, partial: Partial<SRCExercise>, currentUser?: User): SRCExercise {
    const exercises = this.getExercises();
    const idx = exercises.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Exercise not found');
    exercises[idx] = { ...exercises[idx], ...partial };
    setStored('exercises', exercises);
    if (currentUser) {
      this.logAction({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'UPDATE_SRC_EXERCISE',
        entityType: 'Exercise',
        entityId: id,
        details: `Updated selection exercise parameters`,
      });
    }
    return exercises[idx];
  }

  static getPositions(exerciseId?: string): SRCPosition[] {
    const positions = getStored<SRCPosition[]>('positions', INITIAL_POSITIONS);
    if (exerciseId) {
      return positions.filter((p) => p.exerciseId === exerciseId);
    }
    return positions;
  }

  static createPosition(data: Omit<SRCPosition, 'id'>): SRCPosition {
    const positions = this.getPositions();
    const newPos: SRCPosition = {
      ...data,
      id: `pos-${Date.now()}`,
    };
    positions.push(newPos);
    setStored('positions', positions);
    return newPos;
  }

  // Eligibility Rules
  static getRules(exerciseId?: string): EligibilityRule[] {
    const rules = getStored<EligibilityRule[]>('rules', INITIAL_RULES);
    if (exerciseId) {
      return rules.filter((r) => r.exerciseId === exerciseId);
    }
    return rules;
  }

  static createRule(data: Omit<EligibilityRule, 'id' | 'createdAt'>, currentUser?: User): EligibilityRule {
    const rules = this.getRules();
    const newRule: EligibilityRule = {
      ...data,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    rules.push(newRule);
    setStored('rules', rules);
    if (currentUser) {
      this.logAction({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'CREATE_ELIGIBILITY_RULE',
        entityType: 'Settings',
        entityId: newRule.id,
        details: `Configured new eligibility criterion: ${newRule.ruleName} (Threshold: ${newRule.thresholdValue})`,
      });
    }
    return newRule;
  }

  static updateRule(id: string, partial: Partial<EligibilityRule>, currentUser?: User): EligibilityRule {
    const rules = this.getRules();
    const idx = rules.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Rule not found');
    rules[idx] = { ...rules[idx], ...partial };
    setStored('rules', rules);
    if (currentUser) {
      this.logAction({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'UPDATE_ELIGIBILITY_RULE',
        entityType: 'Settings',
        entityId: id,
        details: `Updated eligibility rule: ${rules[idx].ruleName}`,
      });
    }
    return rules[idx];
  }

  // Students / Candidates
  static getStudents(filter?: { facultyId?: string; departmentId?: string; search?: string }): Student[] {
    let students = getStored<Student[]>('students', INITIAL_STUDENTS);
    if (filter?.facultyId) {
      students = students.filter((s) => s.facultyId === filter.facultyId);
    }
    if (filter?.departmentId) {
      students = students.filter((s) => s.departmentId === filter.departmentId);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      students = students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.matricNumber.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }
    return students;
  }

  static getStudentById(id: string): Student | undefined {
    return this.getStudents().find((s) => s.id === id);
  }

  static getStudentByMatric(matric: string): Student | undefined {
    return this.getStudents().find(
      (s) => s.matricNumber.trim().toUpperCase() === matric.trim().toUpperCase()
    );
  }

  static createStudent(data: Omit<Student, 'id' | 'createdAt'>, currentUser?: User): Student {
    // Prevent duplicate matric numbers
    const existing = this.getStudentByMatric(data.matricNumber);
    if (existing) {
      throw new Error(`Student with Matriculation Number "${data.matricNumber}" already registered.`);
    }

    const students = this.getStudents();
    const newStudent: Student = {
      ...data,
      id: `stud-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    students.push(newStudent);
    setStored('students', students);

    if (currentUser) {
      this.logAction({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'REGISTER_CANDIDATE',
        entityType: 'Candidate',
        entityId: newStudent.id,
        details: `Registered prospective candidate ${newStudent.fullName} (${newStudent.matricNumber})`,
      });
    }
    return newStudent;
  }

  static updateStudent(id: string, partial: Partial<Student>, currentUser?: User): Student {
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Student record not found');
    students[idx] = { ...students[idx], ...partial };
    setStored('students', students);

    if (currentUser) {
      this.logAction({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'UPDATE_CANDIDATE',
        entityType: 'Candidate',
        entityId: id,
        details: `Updated student record for ${students[idx].fullName}`,
      });
    }
    return students[idx];
  }

  // Nominations Workflow
  static getNominations(filter?: {
    facultyId?: string;
    departmentId?: string;
    status?: NominationStatus;
    exerciseId?: string;
    search?: string;
  }): Nomination[] {
    let list = getStored<Nomination[]>('nominations', INITIAL_NOMINATIONS);
    if (filter?.facultyId) {
      list = list.filter((n) => n.facultyId === filter.facultyId);
    }
    if (filter?.departmentId) {
      list = list.filter((n) => n.departmentId === filter.departmentId);
    }
    if (filter?.status) {
      list = list.filter((n) => n.status === filter.status);
    }
    if (filter?.exerciseId) {
      list = list.filter((n) => n.exerciseId === filter.exerciseId);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      const students = this.getStudents();
      const studentMap = new Map(students.map((s) => [s.id, s]));
      list = list.filter((n) => {
        const student = studentMap.get(n.studentId);
        return (
          n.referenceNumber.toLowerCase().includes(q) ||
          (student &&
            (student.fullName.toLowerCase().includes(q) ||
              student.matricNumber.toLowerCase().includes(q)))
        );
      });
    }
    return list;
  }

  static getNominationById(id: string): Nomination | undefined {
    return this.getNominations().find((n) => n.id === id);
  }

  static createNomination(
    data: Omit<Nomination, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt'>,
    currentUser?: User
  ): Nomination {
    // Check if duplicate nomination exists for this candidate in the same exercise
    const existing = this.getNominations().find(
      (n) => n.studentId === data.studentId && n.exerciseId === data.exerciseId
    );
    if (existing) {
      throw new Error('A nomination record already exists for this candidate in the current exercise.');
    }

    const depts = this.getDepartments();
    const dept = depts.find((d) => d.id === data.departmentId);
    const deptCode = dept ? dept.code : 'GEN';
    const randCode = Math.floor(100 + Math.random() * 900);
    const refNumber = `SRCOVA/2026/${deptCode}-${randCode}`;

    const nominations = this.getNominations();
    const newNom: Nomination = {
      ...data,
      id: `nom-${Date.now()}`,
      referenceNumber: refNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    nominations.push(newNom);
    setStored('nominations', nominations);

    if (currentUser) {
      this.logAction({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: data.status === 'Draft' ? 'SAVE_NOMINATION_DRAFT' : 'SUBMIT_NOMINATION',
        entityType: 'Nomination',
        entityId: newNom.id,
        details: `${data.status === 'Draft' ? 'Saved draft' : 'Submitted nomination'} with Reference ${refNumber}`,
      });

      // Send notification if submitted
      if (data.status === 'Submitted' || data.status === 'Awaiting Faculty Verification') {
        this.createNotification({
          recipientRole: 'FACULTY_OFFICER',
          facultyId: data.facultyId,
          title: 'New Nomination Received',
          message: `Department submitted nomination for candidate (Ref: ${refNumber}) requiring verification.`,
          type: 'info',
          linkTo: '/faculty/verification',
        });
      }
    }

    return newNom;
  }

  static updateNomination(
    id: string,
    partial: Partial<Nomination>,
    currentUser?: User
  ): Nomination {
    const nominations = this.getNominations();
    const idx = nominations.findIndex((n) => n.id === id);
    if (idx === -1) throw new Error('Nomination not found');

    const previousStatus = nominations[idx].status;
    nominations[idx] = {
      ...nominations[idx],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    setStored('nominations', nominations);

    if (currentUser) {
      const details = partial.status
        ? `Status changed from "${previousStatus}" to "${partial.status}"`
        : `Updated nomination details: ${Object.keys(partial).join(', ')}`;

      this.logAction({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'UPDATE_NOMINATION',
        entityType: 'Nomination',
        entityId: id,
        details,
      });
    }

    return nominations[idx];
  }

  // Supporting Documents
  static getDocuments(nominationId?: string): SupportingDocument[] {
    const docs = getStored<SupportingDocument[]>('documents', INITIAL_DOCUMENTS);
    if (nominationId) {
      return docs.filter((d) => d.nominationId === nominationId);
    }
    return docs;
  }

  static addDocument(data: Omit<SupportingDocument, 'id' | 'uploadedAt'>): SupportingDocument {
    const docs = this.getDocuments();
    const newDoc: SupportingDocument = {
      ...data,
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      uploadedAt: new Date().toISOString(),
    };
    docs.push(newDoc);
    setStored('documents', docs);
    return newDoc;
  }

  static verifyDocument(
    docId: string,
    status: 'Verified' | 'Flagged',
    verifiedBy: string,
    notes?: string
  ): SupportingDocument {
    const docs = this.getDocuments();
    const idx = docs.findIndex((d) => d.id === docId);
    if (idx === -1) throw new Error('Document not found');
    docs[idx] = {
      ...docs[idx],
      verificationStatus: status,
      verifiedBy,
      notes: notes || docs[idx].notes,
    };
    setStored('documents', docs);
    return docs[idx];
  }

  // Verification Records
  static getVerifications(nominationId?: string): VerificationRecord[] {
    const records = getStored<VerificationRecord[]>('verifications', INITIAL_VERIFICATIONS);
    if (nominationId) {
      return records.filter((v) => v.nominationId === nominationId);
    }
    return records;
  }

  static recordVerification(
    data: Omit<VerificationRecord, 'id' | 'createdAt'>,
    currentUser: User
  ): VerificationRecord {
    const records = this.getVerifications();
    const newRecord: VerificationRecord = {
      ...data,
      id: `ver-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    records.push(newRecord);
    setStored('verifications', records);

    // Update nomination status based on result
    const nom = this.getNominationById(data.nominationId);
    if (nom) {
      let newStatus: NominationStatus = nom.status;
      let newStage = nom.currentReviewStage;

      if (data.result === 'Verified') {
        newStatus = 'Pending Student Affairs Review';
        newStage = 'Student Affairs Review';
      } else if (data.result === 'Returned for Correction') {
        newStatus = 'Returned for Correction';
        newStage = 'Faculty Verification';
      } else if (data.result === 'Rejected') {
        newStatus = 'Faculty Rejected';
        newStage = 'Faculty Verification';
      }

      this.updateNomination(
        nom.id,
        {
          status: newStatus,
          currentReviewStage: newStage,
          facultyOfficerRemarks: data.remarks,
          correctionReason: data.result === 'Returned for Correction' ? data.remarks : undefined,
          rejectionReason: data.result === 'Rejected' ? data.remarks : undefined,
        },
        currentUser
      );

      // Trigger automatic eligibility check if verified
      if (data.result === 'Verified') {
        this.runEligibilityAssessment(nom.id, currentUser);

        // Notify Student Affairs
        this.createNotification({
          recipientRole: 'DEAN_STUDENT_AFFAIRS',
          title: 'Candidate Academic Verification Completed',
          message: `Faculty verified nomination for Ref ${nom.referenceNumber}. Ready for Student Affairs review.`,
          type: 'success',
          linkTo: '/student-affairs/review',
        });
      } else if (data.result === 'Returned for Correction') {
        // Notify Department
        this.createNotification({
          recipientRole: 'DEPARTMENT_OFFICER',
          departmentId: nom.departmentId,
          title: 'Application Returned for Correction',
          message: `Faculty returned nomination for Ref ${nom.referenceNumber}. Reason: ${data.remarks}`,
          type: 'danger',
          linkTo: '/department/nominations',
        });
      }
    }

    this.logAction({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'RECORD_ACADEMIC_VERIFICATION',
      entityType: 'Verification',
      entityId: newRecord.id,
      details: `Academic verification result: ${data.result}. CGPA: ${data.verifiedCgpa}, Remarks: ${data.remarks}`,
    });

    return newRecord;
  }

  // Eligibility Engine
  static getEligibilityChecks(nominationId?: string): EligibilityCheck[] {
    const checks = getStored<EligibilityCheck[]>('eligibility_checks', INITIAL_ELIGIBILITY_CHECKS);
    if (nominationId) {
      return checks.filter((c) => c.nominationId === nominationId);
    }
    return checks;
  }

  static runEligibilityAssessment(nominationId: string, currentUser?: User): EligibilityCheck[] {
    const nomination = this.getNominationById(nominationId);
    if (!nomination) throw new Error('Nomination not found');

    const student = this.getStudentById(nomination.studentId);
    if (!student) throw new Error('Student record not found');

    const rules = this.getRules(nomination.exerciseId).filter((r) => r.isActive);
    const existingChecks = this.getEligibilityChecks().filter((c) => c.nominationId !== nominationId);
    const newChecks: EligibilityCheck[] = [];

    // Get verified record if exists
    const verifications = this.getVerifications(nominationId);
    const lastVerification = verifications[verifications.length - 1];

    const actualCgpa = lastVerification ? lastVerification.verifiedCgpa : student.cgpa;
    const actualLevel = lastVerification ? lastVerification.verifiedLevel : student.level;
    const actualCourseRep = lastVerification ? lastVerification.verifiedCourseRep : student.isCourseRep;

    for (const rule of rules) {
      let outcome: 'Eligible' | 'Ineligible' | 'Pending Verification' | 'Requires Clarification' = 'Eligible';
      let remarks = '';
      let actualVal: string | number = '';

      switch (rule.ruleType) {
        case 'MIN_CGPA': {
          const threshold = Number(rule.thresholdValue);
          actualVal = actualCgpa;
          if (actualCgpa >= threshold) {
            outcome = 'Eligible';
            remarks = `CGPA ${actualCgpa.toFixed(2)} satisfies minimum ${threshold.toFixed(2)}`;
          } else {
            outcome = 'Ineligible';
            remarks = `CGPA ${actualCgpa.toFixed(2)} is below required minimum ${threshold.toFixed(2)}`;
          }
          break;
        }

        case 'ACADEMIC_LEVEL': {
          actualVal = actualLevel;
          const allowedLevels = String(rule.thresholdValue).split(',').map((s) => s.trim());
          if (allowedLevels.includes(actualLevel)) {
            outcome = 'Eligible';
            remarks = `Level ${actualLevel} is an approved standing`;
          } else {
            outcome = 'Ineligible';
            remarks = `Level ${actualLevel} is not within approved eligible levels (${rule.thresholdValue})`;
          }
          break;
        }

        case 'COURSE_REP_REQUIRED': {
          actualVal = actualCourseRep ? 'true' : 'false';
          if (actualCourseRep) {
            outcome = 'Eligible';
            remarks = 'Demonstrated verified course representative leadership';
          } else {
            outcome = rule.isMandatory ? 'Ineligible' : 'Requires Clarification';
            remarks = 'Candidate lacks verified course representative background';
          }
          break;
        }

        case 'NO_DISCIPLINARY_RECORD': {
          actualVal = student.hasDisciplinaryRecord ? 'has_record' : 'clean';
          if (!student.hasDisciplinaryRecord) {
            outcome = 'Eligible';
            remarks = 'Administrative clearance confirmed clean record';
          } else {
            outcome = 'Ineligible';
            remarks = 'Active or pending disciplinary flag exists';
          }
          break;
        }

        case 'REQUIRED_DOCUMENTS': {
          const docs = this.getDocuments(nominationId);
          const reqDocTypes = String(rule.thresholdValue).split(',').map((s) => s.trim());
          const uploadedTypes = docs.map((d) => d.documentType);
          const missing = reqDocTypes.filter((t) => !uploadedTypes.includes(t as any));
          actualVal = `${docs.length} uploaded`;

          if (missing.length === 0) {
            outcome = 'Eligible';
            remarks = 'All required supporting documents submitted';
          } else {
            outcome = 'Requires Clarification';
            remarks = `Missing mandatory documents: ${missing.join(', ')}`;
          }
          break;
        }

        default: {
          outcome = 'Eligible';
          remarks = 'Rule evaluated successfully';
          actualVal = 'Compliant';
        }
      }

      newChecks.push({
        id: `chk-${Date.now()}-${rule.id}`,
        nominationId,
        ruleId: rule.id,
        ruleCode: rule.ruleCode,
        outcome,
        actualValue: actualVal,
        thresholdValue: rule.thresholdValue,
        evaluatedAt: new Date().toISOString(),
        remarks,
      });
    }

    setStored('eligibility_checks', [...existingChecks, ...newChecks]);

    if (currentUser) {
      this.logAction({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'RUN_ELIGIBILITY_ENGINE',
        entityType: 'Nomination',
        entityId: nominationId,
        details: `Evaluated ${rules.length} eligibility criteria for nomination Ref ${nomination.referenceNumber}`,
      });
    }

    return newChecks;
  }

  // Administrative Reviews (Student Affairs)
  static getReviews(nominationId?: string): AdministrativeReview[] {
    const reviews = getStored<AdministrativeReview[]>('reviews', INITIAL_REVIEWS);
    if (nominationId) {
      return reviews.filter((r) => r.nominationId === nominationId);
    }
    return reviews;
  }

  static recordReview(
    data: Omit<AdministrativeReview, 'id' | 'createdAt'>,
    currentUser: User
  ): AdministrativeReview {
    const reviews = this.getReviews();
    const newRev: AdministrativeReview = {
      ...data,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    reviews.push(newRev);
    setStored('reviews', reviews);

    // Update nomination status
    const nom = this.getNominationById(data.nominationId);
    if (nom) {
      let newStatus: NominationStatus = nom.status;
      let newStage = nom.currentReviewStage;

      if (data.decision === 'Recommended for Selection') {
        const settings = this.getSettings();
        if (settings.isManagementApprovalRequired) {
          newStatus = 'Recommended for Selection';
          newStage = 'Management Approval';
        } else {
          newStatus = 'Approved';
          newStage = 'Completed';
        }
      } else if (data.decision === 'Approved') {
        newStatus = 'Approved';
        newStage = 'Management Approval';
      } else if (data.decision === 'Rejected') {
        newStatus = 'Rejected';
        newStage = 'Student Affairs Review';
      } else if (data.decision === 'Request Clarification') {
        newStatus = 'Returned for Correction';
        newStage = 'Faculty Verification';
      }

      this.updateNomination(
        nom.id,
        {
          status: newStatus,
          currentReviewStage: newStage,
          studentAffairsRemarks: data.remarks,
        },
        currentUser
      );

      // Trigger notification to Management if recommended
      if (data.decision === 'Recommended for Selection') {
        this.createNotification({
          recipientRole: 'MANAGEMENT_APPROVER',
          title: 'Candidate Recommended for Final SRC Selection',
          message: `Student Affairs recommended Ref ${nom.referenceNumber} for Council appointment. Awaiting management confirmation.`,
          type: 'warning',
          linkTo: '/management/approval',
        });
      }
    }

    this.logAction({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'RECORD_STUDENT_AFFAIRS_REVIEW',
      entityType: 'Nomination',
      entityId: newRev.id,
      details: `Student Affairs review decision: ${data.decision}. Remarks: ${data.remarks}`,
    });

    return newRev;
  }

  // Final SRC Selections
  static getSelections(exerciseId?: string): Selection[] {
    const selections = getStored<Selection[]>('selections', INITIAL_SELECTIONS);
    if (exerciseId) {
      return selections.filter((s) => s.exerciseId === exerciseId);
    }
    return selections;
  }

  static confirmSelection(
    nominationId: string,
    resolutionNumber: string,
    notes: string,
    currentUser: User
  ): Selection {
    const nom = this.getNominationById(nominationId);
    if (!nom) throw new Error('Nomination not found');

    const selections = this.getSelections();
    const existingIdx = selections.findIndex((s) => s.nominationId === nominationId);

    const now = new Date().toISOString();
    let selectionObj: Selection;

    if (existingIdx !== -1) {
      selectionObj = {
        ...selections[existingIdx],
        status: 'Confirmed',
        confirmedByOfficerId: currentUser.id,
        confirmationDate: now,
        resolutionNumber,
        notes,
      };
      selections[existingIdx] = selectionObj;
    } else {
      selectionObj = {
        id: `sel-${Date.now()}`,
        exerciseId: nom.exerciseId,
        nominationId: nom.id,
        studentId: nom.studentId,
        positionId: nom.positionId,
        positionTitle: nom.proposedPosition,
        facultyId: nom.facultyId,
        departmentId: nom.departmentId,
        status: 'Confirmed',
        selectedByOfficerId: currentUser.id,
        confirmedByOfficerId: currentUser.id,
        confirmationDate: now,
        resolutionNumber,
        notes,
        createdAt: now,
      };
      selections.push(selectionObj);
    }

    setStored('selections', selections);

    // Update nomination status
    this.updateNomination(
      nom.id,
      {
        status: 'Selected',
        currentReviewStage: 'Completed',
        managementRemarks: `Confirmed under resolution ${resolutionNumber}. Notes: ${notes}`,
      },
      currentUser
    );

    this.logAction({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CONFIRM_SRC_SELECTION',
      entityType: 'Selection',
      entityId: selectionObj.id,
      details: `Confirmed SRC council membership for candidate (Ref: ${nom.referenceNumber}) under resolution ${resolutionNumber}`,
    });

    // Notify all roles
    this.createNotification({
      recipientRole: 'ALL',
      title: 'SRC Member Formally Confirmed',
      message: `Final Selection ratified for ${nom.proposedPosition} (Resolution: ${resolutionNumber}).`,
      type: 'success',
      linkTo: '/reports',
    });

    return selectionObj;
  }

  // Notifications
  static getNotifications(role?: string, departmentId?: string, facultyId?: string): AppNotification[] {
    const list = getStored<AppNotification[]>('notifications', INITIAL_NOTIFICATIONS);
    if (!role) return list;

    return list.filter((n) => {
      if (n.recipientRole === 'ALL') return true;
      if (n.recipientRole === role) {
        if (n.facultyId && facultyId && n.facultyId !== facultyId) return false;
        if (n.departmentId && departmentId && n.departmentId !== departmentId) return false;
        return true;
      }
      return false;
    });
  }

  static createNotification(data: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): AppNotification {
    const list = getStored<AppNotification[]>('notifications', INITIAL_NOTIFICATIONS);
    const newNotif: AppNotification = {
      ...data,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newNotif);
    setStored('notifications', list);
    return newNotif;
  }

  static markNotificationRead(id: string): void {
    const list = getStored<AppNotification[]>('notifications', INITIAL_NOTIFICATIONS);
    const idx = list.findIndex((n) => n.id === id);
    if (idx !== -1) {
      list[idx].isRead = true;
      setStored('notifications', list);
    }
  }

  static markAllNotificationsRead(role?: string): void {
    const list = getStored<AppNotification[]>('notifications', INITIAL_NOTIFICATIONS);
    list.forEach((n) => {
      if (!role || n.recipientRole === role || n.recipientRole === 'ALL') {
        n.isRead = true;
      }
    });
    setStored('notifications', list);
  }

  // Audit Logs
  static getAuditLogs(filter?: { entityType?: string; userId?: string }): AuditLog[] {
    let list = getStored<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
    if (filter?.entityType) {
      list = list.filter((l) => l.entityType === filter.entityType);
    }
    if (filter?.userId) {
      list = list.filter((l) => l.userId === filter.userId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static logAction(data: {
    userId: string;
    userName: string;
    userRole: string;
    action: string;
    entityType: AuditLog['entityType'];
    entityId: string;
    details: string;
    ipAddress?: string;
  }): AuditLog {
    const logs = getStored<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
    const newLog: AuditLog = {
      ...data,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ipAddress: data.ipAddress || '127.0.0.1 (Local Session)',
      createdAt: new Date().toISOString(),
    };
    logs.unshift(newLog);
    setStored('audit_logs', logs);
    return newLog;
  }

  // Reset database for test suites
  static resetToSeedData(): void {
    localStorage.removeItem(DB_PREFIX + 'settings');
    localStorage.removeItem(DB_PREFIX + 'sessions');
    localStorage.removeItem(DB_PREFIX + 'faculties');
    localStorage.removeItem(DB_PREFIX + 'departments');
    localStorage.removeItem(DB_PREFIX + 'programmes');
    localStorage.removeItem(DB_PREFIX + 'users');
    localStorage.removeItem(DB_PREFIX + 'exercises');
    localStorage.removeItem(DB_PREFIX + 'positions');
    localStorage.removeItem(DB_PREFIX + 'rules');
    localStorage.removeItem(DB_PREFIX + 'students');
    localStorage.removeItem(DB_PREFIX + 'nominations');
    localStorage.removeItem(DB_PREFIX + 'documents');
    localStorage.removeItem(DB_PREFIX + 'verifications');
    localStorage.removeItem(DB_PREFIX + 'eligibility_checks');
    localStorage.removeItem(DB_PREFIX + 'reviews');
    localStorage.removeItem(DB_PREFIX + 'selections');
    localStorage.removeItem(DB_PREFIX + 'notifications');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('srcova:data_changed', { detail: { key: 'reset' } }));
    }
  }
}
