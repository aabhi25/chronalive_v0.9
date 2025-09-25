import {
  teachers,
  subjects,
  classes,
  timetableEntries,
  substitutions,
  timetableValidityPeriods,
  classSubjectAssignments,
  timetableStructures,
  timetableVersions,
  timetableChanges,
  users,
  schools,
  teacherAttendance,
  auditLogs,
  teacherReplacements,
  weeklyTimetables,
  systemModules,
  rolePermissions,
  posts,
  students,
  parents,
  studentParents,
  classTeacherAssignments,
  studentAttendance,
  type Teacher,
  type InsertTeacher,
  type Subject,
  type InsertSubject,
  type Class,
  type InsertClass,
  type TimetableEntry,
  type InsertTimetableEntry,
  type TimetableValidityPeriod,
  type InsertTimetableValidityPeriod,
  type ClassSubjectAssignment,
  type InsertClassSubjectAssignment,
  type TimetableStructure,
  type InsertTimetableStructure,
  type TimetableVersion,
  type InsertTimetableVersion,
  type Substitution,
  type InsertSubstitution,
  type TimetableChange,
  type InsertTimetableChange,
  type User,
  type InsertUser,
  type School,
  type InsertSchool,
  type TeacherAttendance,
  type InsertTeacherAttendance,
  type BulkAttendanceData,
  type AuditLog,
  type InsertAuditLog,
  type UpdateTeacherDailyPeriods,
  manualAssignmentAudits,
  type ManualAssignmentAudit, 
  type InsertManualAssignmentAudit,
  type TeacherReplacement,
  type InsertTeacherReplacement,
  type WeeklyTimetable,
  type InsertWeeklyTimetable,
  type Post,
  type InsertPost,
  type SystemModule,
  type InsertSystemModule,
  type RolePermission,
  type InsertRolePermission,
  type ClassTeacherAssignment,
  type InsertClassTeacherAssignment,
  type StudentAttendance,
  type InsertStudentAttendance,
  type Student,
  type InsertStudent,
  type Parent,
  type InsertParent,
  type StudentParent,
  type InsertStudentParent
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, inArray, sql, ne, gte, lte, between, asc } from "drizzle-orm";
import { getCurrentDateIST, getCurrentDateTimeIST } from "@shared/utils/dateUtils";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByLoginId(loginId: string, schoolId?: string): Promise<User | undefined>;
  getUsersBySchoolId(schoolId: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  
  // Temporary password operations
  setTemporaryPassword(userId: string, hashedPassword: string, expiresAt: Date): Promise<User>;
  clearTemporaryPassword(userId: string): Promise<User>;
  validateTemporaryPassword(userId: string, password: string): Promise<{ isValid: boolean; isExpired: boolean; user?: User }>;

  // School operations
  getSchools(): Promise<School[]>;
  getSchoolsWithAdminEmails(): Promise<(School & { adminEmail?: string })[]>;
  getSchool(id: string): Promise<School | undefined>;
  createSchool(school: InsertSchool): Promise<School>;
  updateSchool(id: string, school: Partial<InsertSchool>): Promise<School>;
  deleteSchool(id: string): Promise<void>;

  // Teacher operations
  getTeachers(schoolId?: string): Promise<Teacher[]>;
  getTeacher(id: string): Promise<Teacher | undefined>;
  getTeacherCountBySchool(schoolId: string): Promise<number>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher>;
  deleteTeacher(id: string): Promise<void>;
  getAvailableTeachers(day: string, period: number, subjectId: string, schoolId: string): Promise<Teacher[]>;
  updateTeacherDailyPeriods(schoolId: string, config: UpdateTeacherDailyPeriods): Promise<{ success: boolean; message: string }>;
  getTeacherSchedule(teacherId: string, date?: string): Promise<TimetableEntry[]>;
  getTeacherWorkloadAnalytics(schoolId: string): Promise<any>;
  getTimetableEntriesByTeacher(teacherId: string): Promise<TimetableEntry[]>;
  
  // Teacher Replacement operations
  createTeacherReplacement(replacement: InsertTeacherReplacement): Promise<TeacherReplacement>;
  getAllTeacherReplacements(): Promise<TeacherReplacement[]>;
  getTeacherReplacementsBySchool(schoolId: string): Promise<TeacherReplacement[]>;

  // Subject operations
  getSubjects(schoolId?: string): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject>;
  deleteSubject(id: string): Promise<void>;
  checkSubjectCodeExists(code: string, schoolId: string, excludeId?: string): Promise<boolean>;

  // Class operations
  getClasses(schoolId?: string): Promise<Class[]>;
  getClass(id: string): Promise<Class | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, classData: Partial<InsertClass>): Promise<Class>;
  deleteClass(id: string): Promise<void>;
  checkClassExists(grade: string, section: string | null, schoolId: string, excludeId?: string): Promise<boolean>;

  // Class Teacher Assignment operations
  getClassTeacherAssignments(classId: string): Promise<(ClassTeacherAssignment & { teacherName: string; teacherEmail: string })[]>;
  getClassTeacherAssignment(classId: string, teacherId: string): Promise<ClassTeacherAssignment | undefined>;
  getPrimaryClassTeacher(classId: string): Promise<ClassTeacherAssignment | undefined>;
  createClassTeacherAssignment(assignment: InsertClassTeacherAssignment): Promise<ClassTeacherAssignment>;
  getClassTeacherAssignmentById(assignmentId: string): Promise<ClassTeacherAssignment | undefined>;
  updateClassTeacherAssignment(assignmentId: string, data: Partial<InsertClassTeacherAssignment>): Promise<ClassTeacherAssignment>;
  deleteClassTeacherAssignment(assignmentId: string): Promise<void>;
  getOtherSectionsOfGrade(grade: string, schoolId: string, excludeClassId: string): Promise<Class[]>;
  copySubjectsBetweenClasses(sourceClassId: string, targetClassIds: string[], schoolId: string): Promise<{ copiedCount: number; skippedCount: number }>;

  // Class Subject Assignment operations
  getClassSubjectAssignments(classId?: string): Promise<any[]>;
  getClassSubjectAssignment(id: string): Promise<ClassSubjectAssignment | undefined>;
  createClassSubjectAssignment(assignment: InsertClassSubjectAssignment): Promise<ClassSubjectAssignment>;
  updateClassSubjectAssignment(id: string, assignment: Partial<InsertClassSubjectAssignment>): Promise<ClassSubjectAssignment>;
  deleteClassSubjectAssignment(id: string): Promise<void>;
  getClassSubjectAssignmentByClassAndSubject(classId: string, subjectId: string): Promise<ClassSubjectAssignment | undefined>;

  // Timetable operations
  getTimetableEntries(): Promise<TimetableEntry[]>;
  getTimetableForClass(classId: string): Promise<TimetableEntry[]>;
  getTimetableForTeacher(teacherId: string): Promise<TimetableEntry[]>;
  createTimetableEntry(entry: InsertTimetableEntry): Promise<TimetableEntry>;
  updateTimetableEntry(id: string, entry: Partial<InsertTimetableEntry>): Promise<TimetableEntry>;
  deleteTimetableEntry(id: string): Promise<void>;
  clearTimetable(): Promise<void>;
  bulkCreateTimetableEntries(entries: InsertTimetableEntry[]): Promise<TimetableEntry[]>;

  // Timetable version operations
  createTimetableVersion(version: InsertTimetableVersion): Promise<TimetableVersion>;
  getTimetableVersionsForClass(classId: string, weekStart: string, weekEnd: string): Promise<TimetableVersion[]>;
  getTimetableEntriesForVersion(versionId: string): Promise<TimetableEntry[]>;
  setActiveVersion(versionId: string, classId: string): Promise<void>;
  getActiveTimetableVersion(classId: string, weekStart: string, weekEnd: string): Promise<TimetableVersion | null>;

  // Substitution operations
  getSubstitutions(): Promise<Substitution[]>;
  getSubstitution(id: string): Promise<Substitution | undefined>;
  createSubstitution(substitution: InsertSubstitution): Promise<Substitution>;
  updateSubstitution(id: string, substitution: Partial<InsertSubstitution>): Promise<Substitution>;
  deleteSubstitution(id: string): Promise<void>;
  getActiveSubstitutions(): Promise<Substitution[]>;
  
  // Timetable changes operations
  getTimetableChanges(schoolId: string, date?: string): Promise<TimetableChange[]>;
  getTimetableChangesByEntry(timetableEntryId: string): Promise<TimetableChange[]>;
  createTimetableChange(change: InsertTimetableChange): Promise<TimetableChange>;
  updateTimetableChange(id: string, change: Partial<InsertTimetableChange>): Promise<TimetableChange>;
  deleteTimetableChange(id: string): Promise<void>;
  getActiveTimetableChanges(schoolId: string, date: string): Promise<TimetableChange[]>;

  // Timetable validity period operations
  getTimetableValidityPeriods(classId?: string): Promise<TimetableValidityPeriod[]>;
  getTimetableValidityPeriod(id: string): Promise<TimetableValidityPeriod | undefined>;
  createTimetableValidityPeriod(period: InsertTimetableValidityPeriod): Promise<TimetableValidityPeriod>;
  updateTimetableValidityPeriod(id: string, period: Partial<InsertTimetableValidityPeriod>): Promise<TimetableValidityPeriod>;
  deleteTimetableValidityPeriod(id: string): Promise<void>;

  // Teacher attendance operations
  getTeacherAttendance(schoolId: string, date?: string): Promise<TeacherAttendance[]>;
  getTeacherAttendanceByTeacher(teacherId: string, startDate?: string, endDate?: string): Promise<TeacherAttendance[]>;
  markTeacherAttendance(attendance: InsertTeacherAttendance): Promise<TeacherAttendance>;
  markBulkTeacherAttendance(bulkData: BulkAttendanceData, markedBy: string): Promise<TeacherAttendance[]>;
  updateTeacherAttendance(id: string, attendance: Partial<InsertTeacherAttendance>): Promise<TeacherAttendance>;
  deleteTeacherAttendance(id: string): Promise<void>;
  isTeacherAbsent(teacherId: string, date: string): Promise<boolean>;

  // Student attendance operations
  getStudentAttendance(schoolId: string, date?: string): Promise<StudentAttendance[]>;
  getStudentAttendanceById(id: string): Promise<StudentAttendance | undefined>;
  getStudentAttendanceByStudent(studentId: string, startDate?: string, endDate?: string): Promise<StudentAttendance[]>;
  getStudentAttendanceByClass(classId: string, date: string): Promise<StudentAttendance[]>;
  markStudentAttendance(attendance: InsertStudentAttendance): Promise<StudentAttendance>;
  updateStudentAttendance(id: string, attendance: Partial<InsertStudentAttendance>): Promise<StudentAttendance>;
  deleteStudentAttendance(id: string): Promise<void>;
  isStudentAbsent(studentId: string, date: string): Promise<boolean>;

  // Student user relationship
  getStudentByUserId(userId: string): Promise<Student | undefined>;

  // Timetable Structure operations
  getTimetableStructures(schoolId?: string): Promise<TimetableStructure[]>;
  getTimetableStructure(id: string): Promise<TimetableStructure | undefined>;
  getTimetableStructureBySchool(schoolId: string): Promise<TimetableStructure | undefined>;
  createTimetableStructure(structure: InsertTimetableStructure): Promise<TimetableStructure>;
  updateTimetableStructure(id: string, structure: Partial<InsertTimetableStructure>): Promise<TimetableStructure>;
  deleteTimetableStructure(id: string): Promise<void>;

  // Analytics
  getStats(schoolId: string): Promise<{
    totalTeachers: number;
    totalClasses: number;
    totalSubjects: number;
    todaySubstitutions: number;
  }>;
  
  getAdminDashboardStats(): Promise<{
    totalSchools: number;
    activeSchools: number;
    inactiveSchools: number;
    schoolAdminLogins: Array<{
      schoolName: string;
      adminName: string;
      lastLogin: Date | null;
    }>;
    schoolTeacherCounts: Array<{
      schoolName: string;
      activeTeachers: number;
    }>;
  }>;

  // Audit log operations
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(schoolId: string, limit?: number): Promise<AuditLog[]>;

  // Enhanced substitution operations
  getAbsentTeacherAlerts(schoolId: string, date: string): Promise<any[]>;
  findSubstituteTeachers(originalTeacherId: string, timetableEntryId: string, date: string): Promise<Teacher[]>;
  autoAssignSubstitute(timetableEntryId: string, date: string, reason: string, assignedBy: string): Promise<{ success: boolean; substitution?: Substitution; message: string }>;

  // RBAC operations - System modules and role permissions
  getSystemModules(activeOnly?: boolean): Promise<SystemModule[]>;
  createSystemModule(module: InsertSystemModule): Promise<SystemModule>;
  updateSystemModule(id: string, module: Partial<InsertSystemModule>): Promise<SystemModule>;
  getRolePermissions(schoolId: string, role?: string): Promise<RolePermission[]>;
  setRolePermission(permission: InsertRolePermission): Promise<RolePermission>;
  getUserModulePermissions(userId: string, schoolId: string): Promise<{ moduleId: string; permissions: any }[]>;
  checkUserPermission(userId: string, moduleId: string, action: 'read' | 'write' | 'delete' | 'export', schoolId: string): Promise<boolean>;

  // Manual assignment operations
  getTeachersForClass(classId: string): Promise<Teacher[]>;
  createManualAssignmentAudit(audit: InsertManualAssignmentAudit): Promise<ManualAssignmentAudit>;
  getTimetableEntry(id: string): Promise<TimetableEntry | undefined>;
  updateTimetableEntry(id: string, entry: Partial<InsertTimetableEntry>): Promise<TimetableEntry>;
  createTimetableEntry(entry: InsertTimetableEntry): Promise<TimetableEntry>;
  isTeacherAvailable(teacherId: string, day: string, period: number, date?: string): Promise<boolean>;

  // Post operations for newsfeed system
  getPosts(schoolId: string, feedScope?: 'school' | 'class', classId?: string, offset?: number, limit?: number): Promise<Post[]>;
  getPostById(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, post: Partial<InsertPost>): Promise<Post>;
  deletePost(id: string): Promise<void>;
  getUserFeed(userId: string): Promise<Post[]>; // Personalized feed combining school + user's class feeds

  // Student operations
  getStudents(schoolId?: string, classId?: string): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;
  getStudentsByClass(classId: string): Promise<Student[]>;

  // Parent operations
  getParents(schoolId?: string): Promise<Parent[]>;
  getParent(id: string): Promise<Parent | undefined>;
  createParent(parent: InsertParent): Promise<Parent>;
  updateParent(id: string, parent: Partial<InsertParent>): Promise<Parent>;
  deleteParent(id: string): Promise<void>;

  // Student-Parent relationship operations
  linkStudentToParent(studentId: string, parentId: string): Promise<StudentParent>;
  unlinkStudentFromParent(studentId: string, parentId: string): Promise<void>;
  getParentChildren(parentId: string): Promise<Student[]>;
  getStudentParents(studentId: string): Promise<Parent[]>;
  getStudentParentsWithDetails(studentId: string): Promise<(StudentParent & { parent: Parent })[]>;
  getStudentCredentials(studentId: string): Promise<{ studentLogin: { loginId: string; hasTemporaryPassword: boolean; expiresAt: string | null; } | null; parentLogin: { loginId: string; hasTemporaryPassword: boolean; expiresAt: string | null; } | null; }>;
  refreshStudentCredentials(studentId: string): Promise<{ studentLogin: { loginId: string; temporaryPassword: string; }; parentLogin: { loginId: string; temporaryPassword: string; }; }>;
  getStudentByAdmissionNumber(admissionNumber: string, schoolId: string): Promise<Student | undefined>;
  linkParentToStudent(parentId: string, studentId: string): Promise<StudentParent>;
}

// Helper function to generate temporary password using crypto
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    const randomIndex = randomInt(0, chars.length);
    password += chars.charAt(randomIndex);
  }
  return password;
}

// Helper function to generate temporary password expiry
function generateTemporaryPasswordExpiry(): Date {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 48); // 48 hours from now
  return expiryDate;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByLoginId(loginId: string, schoolId?: string): Promise<User | undefined> {
    // Build conditions - combine loginId and optional schoolId properly
    const conditions = [eq(users.loginId, loginId)];
    if (schoolId) {
      conditions.push(eq(users.schoolId, schoolId));
    }
    
    const [user] = await db.select().from(users).where(and(...conditions));
    return user;
  }

  async getUsersBySchoolId(schoolId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.schoolId, schoolId));
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Temporary password operations
  async setTemporaryPassword(userId: string, hashedPassword: string, expiresAt: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        temporaryPassword: hashedPassword,
        temporaryPasswordExpiresAt: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async clearTemporaryPassword(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        temporaryPassword: null,
        temporaryPasswordExpiresAt: null,
        isFirstLogin: false,
        passwordChangedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async validateTemporaryPassword(userId: string, password: string): Promise<{ isValid: boolean; isExpired: boolean; user?: User }> {
    const user = await this.getUser(userId);
    if (!user || !user.temporaryPassword) {
      return { isValid: false, isExpired: false };
    }

    // Check if temporary password is expired
    const isExpired = !user.temporaryPasswordExpiresAt || new Date() > user.temporaryPasswordExpiresAt;
    if (isExpired) {
      return { isValid: false, isExpired: true };
    }

    // Import bcrypt to compare passwords
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.temporaryPassword);
    
    return { 
      isValid: isValidPassword, 
      isExpired: false, 
      user: isValidPassword ? user : undefined 
    };
  }

  // School operations
  async getSchools(): Promise<School[]> {
    return await db.select().from(schools);
  }

  async getSchoolsWithAdminEmails(): Promise<(School & { adminEmail?: string })[]> {
    const schoolsWithAdmins = await db
      .select({
        id: schools.id,
        name: schools.name,
        address: schools.address,
        contactPhone: schools.contactPhone,
        adminName: schools.adminName,
        isActive: schools.isActive,
        timetableFrozen: schools.timetableFrozen,
        createdAt: schools.createdAt,
        updatedAt: schools.updatedAt,
        adminEmail: users.email,
      })
      .from(schools)
      .leftJoin(users, and(eq(schools.id, users.schoolId), eq(users.role, "admin")));
    
    return schoolsWithAdmins.map(school => ({
      ...school,
      adminEmail: school.adminEmail || undefined
    }));
  }

  async getSchool(id: string): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(eq(schools.id, id));
    return school;
  }

  async createSchool(schoolData: InsertSchool): Promise<School> {
    const [school] = await db.insert(schools).values(schoolData).returning();
    return school;
  }

  async updateSchool(id: string, schoolData: Partial<InsertSchool>): Promise<School> {
    const [school] = await db
      .update(schools)
      .set({ ...schoolData, updatedAt: new Date() })
      .where(eq(schools.id, id))
      .returning();
    
    if (!school) {
      throw new Error(`School with id ${id} not found`);
    }
    
    return school;
  }

  async deleteSchool(id: string): Promise<void> {
    await db.delete(schools).where(eq(schools.id, id));
  }

  // Teacher operations
  async getTeachers(schoolId?: string): Promise<Teacher[]> {
    let result;
    if (schoolId) {
      result = await db.select().from(teachers).where(
        and(eq(teachers.isActive, true), eq(teachers.schoolId, schoolId))
      );
    } else {
      result = await db.select().from(teachers).where(eq(teachers.isActive, true));
    }
    
    // Debug logging to understand the data format
    console.log(`[STORAGE DEBUG] getTeachers returned ${result.length} teachers`);
    result.forEach(teacher => {
      console.log(`[STORAGE DEBUG] Teacher ${teacher.name} subjects:`, teacher.subjects, 'Type:', typeof teacher.subjects);
    });
    
    return result;
  }

  async getTeacher(id: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher;
  }

  async getTeacherCountBySchool(schoolId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(teachers)
      .where(and(eq(teachers.schoolId, schoolId), eq(teachers.isActive, true)));
    return result[0]?.count || 0;
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    const insertData: any = { ...teacher };
    if (teacher.subjects) {
      insertData.subjects = teacher.subjects;
    }
    const [created] = await db.insert(teachers).values(insertData).returning();
    return created;
  }

  async updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher> {
    const updateData: any = { ...teacher, updatedAt: new Date() };
    if (teacher.subjects) {
      updateData.subjects = teacher.subjects; // Keep as array, don't stringify
    }
    const [updated] = await db
      .update(teachers)
      .set(updateData)
      .where(eq(teachers.id, id))
      .returning();
    return updated;
  }

  async deleteTeacher(id: string): Promise<void> {
    await db.update(teachers).set({ isActive: false }).where(eq(teachers.id, id));
  }

  async getAvailableTeachers(day: string, period: number, subjectId: string | null, schoolId: string): Promise<Teacher[]> {
    try {
      // TEMPORARY DEBUG VERSION - Just return all active teachers for now
      const allTeachers = await db
        .select()
        .from(teachers)
        .where(eq(teachers.isActive, true));

      console.log(`[DEBUG] Total active teachers found: ${allTeachers.length}`);
      console.log(`[DEBUG] Teachers:`, allTeachers.map(t => `${t.name} (${t.schoolId})`));
      console.log(`[DEBUG] Looking for schoolId: ${schoolId}`);

      // Filter by school
      const schoolTeachers = allTeachers.filter(t => t.schoolId === schoolId);
      console.log(`[DEBUG] Teachers in school: ${schoolTeachers.length}`);

      // For debugging, let's just return all teachers in the school without any other filtering
      // This will help us confirm the basic functionality works
      return schoolTeachers;
    } catch (error) {
      console.error(`[STORAGE ERROR] getAvailableTeachers failed:`, error);
      return [];
    }
  }

  // Subject operations
  async getSubjects(schoolId?: string): Promise<Subject[]> {
    if (schoolId) {
      return await db.select().from(subjects).where(eq(subjects.schoolId, schoolId));
    }
    return await db.select().from(subjects);
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject;
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const [created] = await db.insert(subjects).values(subject).returning();
    return created;
  }

  async updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject> {
    const [updated] = await db
      .update(subjects)
      .set({ ...subject, updatedAt: new Date() })
      .where(eq(subjects.id, id))
      .returning();
    return updated;
  }

  async deleteSubject(id: string): Promise<void> {
    await db.delete(subjects).where(eq(subjects.id, id));
  }

  async checkSubjectCodeExists(code: string, schoolId: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(subjects.code, code), eq(subjects.schoolId, schoolId)];
    if (excludeId) {
      conditions.push(ne(subjects.id, excludeId));
    }
    
    const [existing] = await db.select().from(subjects).where(and(...conditions)).limit(1);
    return !!existing;
  }


  // Class operations
  async getClasses(schoolId?: string): Promise<Class[]> {
    if (schoolId) {
      return await db
        .select()
        .from(classes)
        .where(eq(classes.schoolId, schoolId))
        .orderBy(
          sql`CAST(${classes.grade} AS INTEGER)`,
          asc(classes.section)
        );
    }
    return await db
      .select()
      .from(classes)
      .orderBy(
        sql`CAST(${classes.grade} AS INTEGER)`,
        asc(classes.section)
      );
  }

  async getClass(id: string): Promise<Class | undefined> {
    const [classData] = await db.select().from(classes).where(eq(classes.id, id));
    return classData;
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [created] = await db.insert(classes).values({
      ...classData,
      requiredSubjects: JSON.stringify(classData.requiredSubjects || []) as any,
    }).returning();
    return created;
  }

  async updateClass(id: string, classData: Partial<InsertClass>): Promise<Class> {
    const updateData: any = { ...classData, updatedAt: new Date() };
    if (classData.requiredSubjects) {
      updateData.requiredSubjects = JSON.stringify(classData.requiredSubjects);
    }
    const [updated] = await db
      .update(classes)
      .set(updateData)
      .where(eq(classes.id, id))
      .returning();
    return updated;
  }

  async deleteClass(id: string): Promise<void> {
    // Use transaction to ensure all deletions succeed or none do
    await db.transaction(async (tx) => {
      // 1. Delete all posts associated with this class
      await tx.delete(posts).where(eq(posts.classId, id));
      
      // 2. Delete all class-teacher assignments (teachers assigned to this class)
      await tx.delete(classTeacherAssignments).where(eq(classTeacherAssignments.classId, id));
      
      // 3. Delete all student attendance records for this class
      await tx.delete(studentAttendance).where(eq(studentAttendance.classId, id));
      
      // 4. Delete substitutions that reference timetable entries of this class (must come before timetable entries)
      const classTimetableEntries = await tx.select({ id: timetableEntries.id })
        .from(timetableEntries)
        .where(eq(timetableEntries.classId, id));
      
      if (classTimetableEntries.length > 0) {
        const entryIds = classTimetableEntries.map(entry => entry.id);
        await tx.delete(substitutions).where(inArray(substitutions.timetableEntryId, entryIds));
      }
      
      // 5. Delete all timetable-related data for this class (now safe to delete)
      await tx.delete(timetableEntries).where(eq(timetableEntries.classId, id));
      await tx.delete(timetableVersions).where(eq(timetableVersions.classId, id));
      await tx.delete(weeklyTimetables).where(eq(weeklyTimetables.classId, id));
      await tx.delete(timetableValidityPeriods).where(eq(timetableValidityPeriods.classId, id));
      
      // 6. Delete manual assignment audits for this class
      await tx.delete(manualAssignmentAudits).where(eq(manualAssignmentAudits.classId, id));
      
      // 7. Delete all class-subject assignments that reference this class
      await tx.delete(classSubjectAssignments).where(eq(classSubjectAssignments.classId, id));
      
      // 8. Unassign students from this class and reset roll numbers (set classId to null and rollNumber to "0")
      await tx.update(students)
        .set({ classId: null, rollNumber: "0", updatedAt: new Date() })
        .where(eq(students.classId, id));
      
      // 9. Finally delete the class itself
      await tx.delete(classes).where(eq(classes.id, id));
    });
  }

  async getOtherSectionsOfGrade(grade: string, schoolId: string, excludeClassId: string): Promise<Class[]> {
    return await db
      .select()
      .from(classes)
      .where(
        and(
          eq(classes.grade, grade),
          eq(classes.schoolId, schoolId),
          ne(classes.id, excludeClassId)
        )
      )
      .orderBy(classes.section);
  }

  async copySubjectsBetweenClasses(sourceClassId: string, targetClassIds: string[], schoolId: string): Promise<{ copiedCount: number; skippedCount: number }> {
    // Get all subject assignments from source class
    const sourceAssignments = await db
      .select()
      .from(classSubjectAssignments)
      .where(eq(classSubjectAssignments.classId, sourceClassId));

    let copiedCount = 0;
    let skippedCount = 0;

    for (const targetClassId of targetClassIds) {
      // Verify target class exists and belongs to the same school
      const targetClass = await this.getClass(targetClassId);
      if (!targetClass || targetClass.schoolId !== schoolId) {
        skippedCount++;
        continue;
      }

      // Get existing assignments for target class to avoid duplicates
      const existingAssignments = await db
        .select({
          subjectId: classSubjectAssignments.subjectId
        })
        .from(classSubjectAssignments)
        .where(eq(classSubjectAssignments.classId, targetClassId));

      const existingSubjectIds = existingAssignments.map(a => a.subjectId);

      // Copy each assignment that doesn't already exist
      for (const assignment of sourceAssignments) {
        if (!existingSubjectIds.includes(assignment.subjectId)) {
          await db.insert(classSubjectAssignments).values({
            classId: targetClassId,
            subjectId: assignment.subjectId,
            weeklyFrequency: assignment.weeklyFrequency,
          });
          copiedCount++;
        } else {
          skippedCount++;
        }
      }
    }

    return { copiedCount, skippedCount };
  }

  async checkClassExists(grade: string, section: string | null, schoolId: string, excludeId?: string): Promise<boolean> {
    const conditions = [
      eq(classes.grade, grade),
      eq(classes.schoolId, schoolId),
      // Handle both empty strings and null values for empty sections
      section && section.trim() !== "" ? eq(classes.section, section) : 
        or(eq(classes.section, ""), sql`${classes.section} IS NULL`)
    ];
    
    if (excludeId) {
      conditions.push(sql`${classes.id} != ${excludeId}`);
    }
    
    const result = await db
      .select({ id: classes.id })
      .from(classes)
      .where(and(...conditions));
    
    return result.length > 0;
  }

  // Class Teacher Assignment operations
  async getClassTeacherAssignments(classId: string): Promise<(ClassTeacherAssignment & { teacherName: string; teacherEmail: string })[]> {
    const results = await db
      .select({
        id: classTeacherAssignments.id,
        classId: classTeacherAssignments.classId,
        teacherId: classTeacherAssignments.teacherId,
        role: classTeacherAssignments.role,
        isPrimary: classTeacherAssignments.isPrimary,
        privileges: classTeacherAssignments.privileges,
        assignedBy: classTeacherAssignments.assignedBy,
        schoolId: classTeacherAssignments.schoolId,
        isActive: classTeacherAssignments.isActive,
        createdAt: classTeacherAssignments.createdAt,
        updatedAt: classTeacherAssignments.updatedAt,
        teacherName: teachers.name,
        teacherEmail: teachers.email,
      })
      .from(classTeacherAssignments)
      .innerJoin(teachers, eq(classTeacherAssignments.teacherId, teachers.id))
      .where(
        and(
          eq(classTeacherAssignments.classId, classId),
          eq(classTeacherAssignments.isActive, true)
        )
      )
      .orderBy(classTeacherAssignments.isPrimary, classTeacherAssignments.createdAt);
    
    return results;
  }

  async getClassTeacherAssignment(classId: string, teacherId: string): Promise<ClassTeacherAssignment | undefined> {
    const [result] = await db
      .select()
      .from(classTeacherAssignments)
      .where(
        and(
          eq(classTeacherAssignments.classId, classId),
          eq(classTeacherAssignments.teacherId, teacherId),
          eq(classTeacherAssignments.isActive, true)
        )
      );
    return result;
  }

  async getPrimaryClassTeacher(classId: string): Promise<ClassTeacherAssignment | undefined> {
    const [result] = await db
      .select()
      .from(classTeacherAssignments)
      .where(
        and(
          eq(classTeacherAssignments.classId, classId),
          eq(classTeacherAssignments.isPrimary, true),
          eq(classTeacherAssignments.isActive, true)
        )
      );
    return result;
  }

  async createClassTeacherAssignment(assignment: InsertClassTeacherAssignment): Promise<ClassTeacherAssignment> {
    const [created] = await db.insert(classTeacherAssignments).values({
      ...assignment,
      isPrimary: assignment.role === 'primary',
      privileges: assignment.privileges || {
        attendance: true,
        classFeedPosting: true,
        parentCommunication: true,
        leaveApproval: true
      }
    }).returning();
    return created;
  }

  async getClassTeacherAssignmentById(assignmentId: string): Promise<ClassTeacherAssignment | undefined> {
    const [result] = await db
      .select()
      .from(classTeacherAssignments)
      .where(eq(classTeacherAssignments.id, assignmentId));
    return result;
  }

  async updateClassTeacherAssignment(assignmentId: string, data: Partial<InsertClassTeacherAssignment>): Promise<ClassTeacherAssignment> {
    const updateData: any = { ...data, updatedAt: new Date() };
    
    // Automatically set isPrimary based on role
    if (data.role === 'primary') {
      updateData.isPrimary = true;
    } else if (data.role === 'co_class') {
      updateData.isPrimary = false;
    }
    
    const [updated] = await db
      .update(classTeacherAssignments)
      .set(updateData)
      .where(eq(classTeacherAssignments.id, assignmentId))
      .returning();
    return updated;
  }

  async deleteClassTeacherAssignment(assignmentId: string): Promise<void> {
    await db.delete(classTeacherAssignments).where(eq(classTeacherAssignments.id, assignmentId));
  }

  // Timetable operations
  async getTimetableEntries(schoolId?: string): Promise<TimetableEntry[]> {
    if (schoolId) {
      return await db
        .select({
          id: timetableEntries.id,
          classId: timetableEntries.classId,
          teacherId: timetableEntries.teacherId,
          subjectId: timetableEntries.subjectId,
          day: timetableEntries.day,
          period: timetableEntries.period,
          startTime: timetableEntries.startTime,
          endTime: timetableEntries.endTime,
          room: timetableEntries.room,
          versionId: timetableEntries.versionId,
          isActive: timetableEntries.isActive,
          createdAt: timetableEntries.createdAt,
          updatedAt: timetableEntries.updatedAt,
        })
        .from(timetableEntries)
        .innerJoin(classes, eq(timetableEntries.classId, classes.id))
        .where(and(
          eq(timetableEntries.isActive, true),
          eq(classes.schoolId, schoolId)
        ));
    }
    return await db
      .select()
      .from(timetableEntries)
      .where(eq(timetableEntries.isActive, true));
  }

  async getTimetableForClass(classId: string): Promise<TimetableEntry[]> {
    return await db
      .select()
      .from(timetableEntries)
      .where(
        and(
          eq(timetableEntries.classId, classId),
          eq(timetableEntries.isActive, true)
        )
      );
  }

  async getTimetableForTeacher(teacherId: string): Promise<TimetableEntry[]> {
    return await db
      .select()
      .from(timetableEntries)
      .where(
        and(
          eq(timetableEntries.teacherId, teacherId),
          eq(timetableEntries.isActive, true)
        )
      );
  }

  async createTimetableEntry(entry: InsertTimetableEntry): Promise<TimetableEntry> {
    const [created] = await db.insert(timetableEntries).values(entry).returning();
    return created;
  }

  async updateTimetableEntry(id: string, entry: Partial<InsertTimetableEntry>): Promise<TimetableEntry> {
    const [updated] = await db
      .update(timetableEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(timetableEntries.id, id))
      .returning();
    return updated;
  }

  async deleteTimetableEntry(id: string): Promise<void> {
    await db.delete(timetableEntries).where(eq(timetableEntries.id, id));
  }

  async deleteTimetableEntriesForClass(classId: string): Promise<void> {
    await db.delete(timetableEntries).where(eq(timetableEntries.classId, classId));
  }

  async deleteTimetableEntriesForTeacherAndDay(teacherId: string, day: string): Promise<void> {
    await db.delete(timetableEntries).where(
      and(
        eq(timetableEntries.teacherId, teacherId),
        eq(timetableEntries.day, day as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday")
      )
    );
  }

  async clearTimetable(): Promise<void> {
    await db.delete(timetableEntries);
  }

  async bulkCreateTimetableEntries(entries: InsertTimetableEntry[]): Promise<TimetableEntry[]> {
    if (entries.length === 0) return [];
    
    // Before creating new entries, deactivate ALL old entries for these classes
    const classIds = Array.from(new Set(entries.map(e => e.classId)));
    for (let i = 0; i < classIds.length; i++) {
      const classId = classIds[i];
      // Deactivate ALL existing entries for this class to prevent duplicates
      await db
        .update(timetableEntries)
        .set({ isActive: false })
        .where(eq(timetableEntries.classId, classId));
    }
    
    return await db.insert(timetableEntries).values(entries).returning();
  }

  // Timetable version operations
  async createTimetableVersion(version: InsertTimetableVersion): Promise<TimetableVersion> {
    const [created] = await db.insert(timetableVersions).values(version).returning();
    return created;
  }

  async getTimetableVersionsForClass(classId: string, weekStart: string, weekEnd: string): Promise<TimetableVersion[]> {
    return await db
      .select()
      .from(timetableVersions)
      .where(
        and(
          eq(timetableVersions.classId, classId),
          eq(timetableVersions.weekStart, weekStart),
          eq(timetableVersions.weekEnd, weekEnd)
        )
      )
      .orderBy(timetableVersions.createdAt);
  }

  async getTimetableEntriesForVersion(versionId: string): Promise<TimetableEntry[]> {
    return await db
      .select()
      .from(timetableEntries)
      .where(eq(timetableEntries.versionId, versionId));
  }

  async setActiveVersion(versionId: string, classId: string): Promise<void> {
    // First, deactivate all versions for this class
    const version = await db
      .select()
      .from(timetableVersions)
      .where(eq(timetableVersions.id, versionId))
      .limit(1);
    
    if (version.length > 0) {
      const { weekStart, weekEnd } = version[0];
      
      // Deactivate all existing versions for this class/week
      await db
        .update(timetableVersions)
        .set({ isActive: false })
        .where(
          and(
            eq(timetableVersions.classId, classId),
            eq(timetableVersions.weekStart, weekStart),
            eq(timetableVersions.weekEnd, weekEnd)
          )
        );

      // Then activate ONLY the selected version
      await db
        .update(timetableVersions)
        .set({ isActive: true })
        .where(eq(timetableVersions.id, versionId));
      
      // Safety check: Ensure only one version is active for this class/week
      const activeCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(timetableVersions)
        .where(
          and(
            eq(timetableVersions.classId, classId),
            eq(timetableVersions.weekStart, weekStart),
            eq(timetableVersions.weekEnd, weekEnd),
            eq(timetableVersions.isActive, true)
          )
        );
      
      if (activeCount[0].count > 1) {
        console.error(`ERROR: Multiple active versions detected for class ${classId}, week ${weekStart}-${weekEnd}. Count: ${activeCount[0].count}`);
        // Force fix by deactivating all and activating only the requested version
        await db
          .update(timetableVersions)
          .set({ isActive: false })
          .where(
            and(
              eq(timetableVersions.classId, classId),
              eq(timetableVersions.weekStart, weekStart),
              eq(timetableVersions.weekEnd, weekEnd)
            )
          );
        await db
          .update(timetableVersions)
          .set({ isActive: true })
          .where(eq(timetableVersions.id, versionId));
      }
    }
  }

  async getActiveTimetableVersion(classId: string, weekStart: string, weekEnd: string): Promise<TimetableVersion | null> {
    const versions = await db
      .select()
      .from(timetableVersions)
      .where(
        and(
          eq(timetableVersions.classId, classId),
          eq(timetableVersions.weekStart, weekStart),
          eq(timetableVersions.weekEnd, weekEnd),
          eq(timetableVersions.isActive, true)
        )
      )
      .limit(1);
    
    return versions.length > 0 ? versions[0] : null;
  }

  // Substitution operations
  async getSubstitutions(schoolId?: string): Promise<Substitution[]> {
    if (schoolId) {
      return await db
        .select({
          id: substitutions.id,
          date: substitutions.date,
          originalTeacherId: substitutions.originalTeacherId,
          substituteTeacherId: substitutions.substituteTeacherId,
          timetableEntryId: substitutions.timetableEntryId,
          reason: substitutions.reason,
          status: substitutions.status,
          isAutoGenerated: substitutions.isAutoGenerated,
          createdAt: substitutions.createdAt,
          updatedAt: substitutions.updatedAt,
        })
        .from(substitutions)
        .innerJoin(teachers, eq(substitutions.originalTeacherId, teachers.id))
        .where(eq(teachers.schoolId, schoolId));
    }
    return await db.select().from(substitutions);
  }

  async getSubstitution(id: string): Promise<Substitution | undefined> {
    const [substitution] = await db.select().from(substitutions).where(eq(substitutions.id, id));
    return substitution;
  }

  async createSubstitution(substitution: InsertSubstitution): Promise<Substitution> {
    const [created] = await db.insert(substitutions).values(substitution).returning();
    return created;
  }

  async updateSubstitution(id: string, substitution: Partial<InsertSubstitution>): Promise<Substitution> {
    const [updated] = await db
      .update(substitutions)
      .set({ ...substitution, updatedAt: new Date() })
      .where(eq(substitutions.id, id))
      .returning();
    return updated;
  }

  async deleteSubstitution(id: string): Promise<void> {
    await db.delete(substitutions).where(eq(substitutions.id, id));
  }

  async getActiveSubstitutions(): Promise<Substitution[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db
      .select()
      .from(substitutions)
      .where(
        and(
          sql`${substitutions.date} >= ${today}`,
          sql`${substitutions.date} < ${tomorrow}`,
          eq(substitutions.status, "confirmed")
        )
      );
  }

  async getSubstitutionsByWeek(weekStart: Date, weekEnd: Date, schoolId?: string): Promise<Substitution[]> {
    if (schoolId) {
      return await db
        .select({
          id: substitutions.id,
          date: substitutions.date,
          originalTeacherId: substitutions.originalTeacherId,
          substituteTeacherId: substitutions.substituteTeacherId,
          timetableEntryId: substitutions.timetableEntryId,
          reason: substitutions.reason,
          status: substitutions.status,
          isAutoGenerated: substitutions.isAutoGenerated,
          createdAt: substitutions.createdAt,
          updatedAt: substitutions.updatedAt,
        })
        .from(substitutions)
        .innerJoin(teachers, eq(substitutions.originalTeacherId, teachers.id))
        .where(
          and(
            sql`${substitutions.date} >= ${weekStart}`,
            sql`${substitutions.date} <= ${weekEnd}`,
            eq(teachers.schoolId, schoolId)
          )
        );
    }

    return await db
      .select()
      .from(substitutions)
      .where(
        and(
          sql`${substitutions.date} >= ${weekStart}`,
          sql`${substitutions.date} <= ${weekEnd}`
        )
      );
  }

  // Timetable changes operations
  async getTimetableChanges(schoolId: string, date?: string): Promise<any[]> {
    const whereConditions = [
      eq(classes.schoolId, schoolId),
      eq(timetableChanges.isActive, true)
    ];

    if (date) {
      whereConditions.push(eq(timetableChanges.changeDate, date));
    }

    return await db
      .select({
        id: timetableChanges.id,
        timetableEntryId: timetableChanges.timetableEntryId,
        changeType: timetableChanges.changeType,
        changeDate: timetableChanges.changeDate,
        originalTeacherId: timetableChanges.originalTeacherId,
        newTeacherId: timetableChanges.newTeacherId,
        originalRoom: timetableChanges.originalRoom,
        newRoom: timetableChanges.newRoom,
        reason: timetableChanges.reason,
        changeSource: timetableChanges.changeSource,
        approvedBy: timetableChanges.approvedBy,
        approvedAt: timetableChanges.approvedAt,
        isActive: timetableChanges.isActive,
        createdAt: timetableChanges.createdAt,
        updatedAt: timetableChanges.updatedAt,
        // Include class information as flat fields
        affectedClassId: classes.id,
        affectedClassGrade: classes.grade,
        affectedClassSection: classes.section,
        affectedClassStudentCount: classes.studentCount,
        affectedClassRoom: classes.room,
        // Include timetable entry information as flat fields
        timetableEntryDay: timetableEntries.day,
        timetableEntryPeriod: timetableEntries.period,
        timetableEntryStartTime: timetableEntries.startTime,
        timetableEntryEndTime: timetableEntries.endTime
      })
      .from(timetableChanges)
      .innerJoin(timetableEntries, eq(timetableChanges.timetableEntryId, timetableEntries.id))
      .innerJoin(classes, eq(timetableEntries.classId, classes.id))
      .where(and(...whereConditions));
  }

  async getTimetableChangesByEntry(timetableEntryId: string): Promise<TimetableChange[]> {
    return await db
      .select()
      .from(timetableChanges)
      .where(and(
        eq(timetableChanges.timetableEntryId, timetableEntryId),
        eq(timetableChanges.isActive, true)
      ))
      .orderBy(timetableChanges.createdAt);
  }

  async createTimetableChange(change: InsertTimetableChange): Promise<TimetableChange> {
    const [created] = await db.insert(timetableChanges).values(change).returning();
    return created;
  }

  async updateTimetableChange(id: string, change: Partial<InsertTimetableChange>): Promise<TimetableChange> {
    const [updated] = await db
      .update(timetableChanges)
      .set({ ...change, updatedAt: new Date() })
      .where(eq(timetableChanges.id, id))
      .returning();
    return updated;
  }

  async deleteTimetableChange(id: string): Promise<void> {
    await db.delete(timetableChanges).where(eq(timetableChanges.id, id));
  }

  async getActiveTimetableChanges(schoolId: string, date: string): Promise<TimetableChange[]> {
    return await db
      .select({
        id: timetableChanges.id,
        timetableEntryId: timetableChanges.timetableEntryId,
        changeType: timetableChanges.changeType,
        changeDate: timetableChanges.changeDate,
        originalTeacherId: timetableChanges.originalTeacherId,
        newTeacherId: timetableChanges.newTeacherId,
        originalRoom: timetableChanges.originalRoom,
        newRoom: timetableChanges.newRoom,
        reason: timetableChanges.reason,
        changeSource: timetableChanges.changeSource,
        approvedBy: timetableChanges.approvedBy,
        approvedAt: timetableChanges.approvedAt,
        isActive: timetableChanges.isActive,
        createdAt: timetableChanges.createdAt,
        updatedAt: timetableChanges.updatedAt,
        // Include class information as flat fields
        affectedClassId: classes.id,
        affectedClassGrade: classes.grade,
        affectedClassSection: classes.section,
        affectedClassStudentCount: classes.studentCount,
        affectedClassRoom: classes.room,
        // Include timetable entry information as flat fields
        timetableEntryDay: timetableEntries.day,
        timetableEntryPeriod: timetableEntries.period,
        timetableEntryStartTime: timetableEntries.startTime,
        timetableEntryEndTime: timetableEntries.endTime
      })
      .from(timetableChanges)
      .innerJoin(timetableEntries, eq(timetableChanges.timetableEntryId, timetableEntries.id))
      .innerJoin(classes, eq(timetableEntries.classId, classes.id))
      .where(and(
        eq(classes.schoolId, schoolId),
        eq(timetableChanges.changeDate, date),
        eq(timetableChanges.isActive, true)
      ))
      .orderBy(timetableChanges.createdAt);
  }

  // Analytics
  async getStats(schoolId: string): Promise<{
    totalTeachers: number;
    totalClasses: number;
    totalSubjects: number;
    todaySubstitutions: number;
  }> {
    const [teacherCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(teachers)
      .where(and(eq(teachers.isActive, true), eq(teachers.schoolId, schoolId)));

    const [classCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(classes)
      .where(eq(classes.schoolId, schoolId));

    const [subjectCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .where(eq(subjects.schoolId, schoolId));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [substitutionCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(substitutions)
      .innerJoin(teachers, eq(substitutions.originalTeacherId, teachers.id))
      .where(
        and(
          eq(teachers.schoolId, schoolId),
          sql`${substitutions.date} >= ${today}`,
          sql`${substitutions.date} < ${tomorrow}`
        )
      );

    return {
      totalTeachers: Number(teacherCount?.count) || 0,
      totalClasses: Number(classCount?.count) || 0,
      totalSubjects: Number(subjectCount?.count) || 0,
      todaySubstitutions: Number(substitutionCount?.count) || 0,
    };
  }

  async getAdminDashboardStats(): Promise<{
    totalSchools: number;
    activeSchools: number;
    inactiveSchools: number;
    schoolAdminLogins: Array<{
      schoolName: string;
      adminName: string;
      lastLogin: Date | null;
    }>;
    schoolTeacherCounts: Array<{
      schoolName: string;
      activeTeachers: number;
    }>;
  }> {
    // Get school counts
    const [totalSchoolsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schools);

    const [activeSchoolsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schools)
      .where(eq(schools.isActive, true));

    const [inactiveSchoolsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schools)
      .where(eq(schools.isActive, false));

    // Get school admin login info
    const schoolAdminLogins = await db
      .select({
        schoolName: schools.name,
        adminName: sql<string>`CONCAT(${users.firstName}, ' ', COALESCE(${users.lastName}, ''))`,
        lastLogin: users.updatedAt, // Using updatedAt as proxy for last activity
      })
      .from(schools)
      .leftJoin(users, and(
        eq(users.schoolId, schools.id),
        eq(users.role, "admin")
      ))
      .orderBy(schools.name);

    // Get teacher counts per school
    const schoolTeacherCounts = await db
      .select({
        schoolName: schools.name,
        activeTeachers: sql<number>`COUNT(${teachers.id})`,
      })
      .from(schools)
      .leftJoin(teachers, and(
        eq(teachers.schoolId, schools.id),
        eq(teachers.isActive, true)
      ))
      .groupBy(schools.id, schools.name)
      .orderBy(schools.name);

    return {
      totalSchools: Number(totalSchoolsResult?.count) || 0,
      activeSchools: Number(activeSchoolsResult?.count) || 0,
      inactiveSchools: Number(inactiveSchoolsResult?.count) || 0,
      schoolAdminLogins: schoolAdminLogins.map(item => ({
        schoolName: item.schoolName,
        adminName: item.adminName || 'No Admin',
        lastLogin: item.lastLogin,
      })),
      schoolTeacherCounts: schoolTeacherCounts.map(item => ({
        schoolName: item.schoolName,
        activeTeachers: Number(item.activeTeachers) || 0,
      })),
    };
  }

  // Timetable validity period operations
  async getTimetableValidityPeriods(classId?: string): Promise<TimetableValidityPeriod[]> {
    if (classId) {
      return await db.select().from(timetableValidityPeriods).where(eq(timetableValidityPeriods.classId, classId));
    }
    return await db.select().from(timetableValidityPeriods);
  }

  async getTimetableValidityPeriod(id: string): Promise<TimetableValidityPeriod | undefined> {
    const [period] = await db.select().from(timetableValidityPeriods).where(eq(timetableValidityPeriods.id, id));
    return period;
  }

  async createTimetableValidityPeriod(period: InsertTimetableValidityPeriod): Promise<TimetableValidityPeriod> {
    // First, deactivate other active periods for this class
    await db
      .update(timetableValidityPeriods)
      .set({ isActive: false })
      .where(and(
        eq(timetableValidityPeriods.classId, period.classId),
        eq(timetableValidityPeriods.isActive, true)
      ));

    const [newPeriod] = await db.insert(timetableValidityPeriods).values(period).returning();
    return newPeriod;
  }

  async updateTimetableValidityPeriod(id: string, period: Partial<InsertTimetableValidityPeriod>): Promise<TimetableValidityPeriod> {
    const [updatedPeriod] = await db
      .update(timetableValidityPeriods)
      .set(period)
      .where(eq(timetableValidityPeriods.id, id))
      .returning();
    return updatedPeriod;
  }

  async deleteTimetableValidityPeriod(id: string): Promise<void> {
    await db.delete(timetableValidityPeriods).where(eq(timetableValidityPeriods.id, id));
  }

  // Class Subject Assignment operations
  async getClassSubjectAssignments(classId?: string, schoolId?: string): Promise<any[]> {
    const query = db
      .select({
        id: classSubjectAssignments.id,
        classId: classSubjectAssignments.classId,
        subjectId: classSubjectAssignments.subjectId,
        weeklyFrequency: classSubjectAssignments.weeklyFrequency,
        assignedTeacherId: classSubjectAssignments.assignedTeacherId,
        subject: {
          id: subjects.id,
          name: subjects.name,
          code: subjects.code,
          color: subjects.color,
          periodsPerWeek: subjects.periodsPerWeek,
          schoolId: subjects.schoolId,
        },
        assignedTeacher: {
          id: teachers.id,
          name: teachers.name,
          email: teachers.email,
          contactNumber: teachers.contactNumber,
          schoolIdNumber: teachers.schoolIdNumber,
          schoolId: teachers.schoolId,
          isActive: teachers.isActive,
        }
      })
      .from(classSubjectAssignments)
      .innerJoin(subjects, eq(classSubjectAssignments.subjectId, subjects.id))
      .leftJoin(teachers, eq(classSubjectAssignments.assignedTeacherId, teachers.id));

    let conditions = [];
    
    if (classId) {
      conditions.push(eq(classSubjectAssignments.classId, classId));
    }
    
    // Add school filtering by joining with classes table
    if (schoolId) {
      const queryWithClassJoin = query.innerJoin(classes, eq(classSubjectAssignments.classId, classes.id));
      conditions.push(eq(classes.schoolId, schoolId));
      
      if (conditions.length > 0) {
        return await queryWithClassJoin.where(and(...conditions));
      }
      return await queryWithClassJoin;
    }
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    return await query;
  }

  async getClassSubjectAssignment(id: string): Promise<ClassSubjectAssignment | undefined> {
    const [assignment] = await db.select().from(classSubjectAssignments).where(eq(classSubjectAssignments.id, id));
    return assignment;
  }

  async createClassSubjectAssignment(assignment: InsertClassSubjectAssignment): Promise<ClassSubjectAssignment> {
    const [newAssignment] = await db.insert(classSubjectAssignments).values(assignment).returning();
    return newAssignment;
  }

  async updateClassSubjectAssignment(id: string, assignment: Partial<InsertClassSubjectAssignment>): Promise<ClassSubjectAssignment> {
    const [updatedAssignment] = await db
      .update(classSubjectAssignments)
      .set(assignment)
      .where(eq(classSubjectAssignments.id, id))
      .returning();
    return updatedAssignment;
  }

  async deleteClassSubjectAssignment(id: string): Promise<void> {
    await db.delete(classSubjectAssignments).where(eq(classSubjectAssignments.id, id));
  }

  async getClassSubjectAssignmentByClassAndSubject(classId: string, subjectId: string): Promise<ClassSubjectAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(classSubjectAssignments)
      .where(and(
        eq(classSubjectAssignments.classId, classId),
        eq(classSubjectAssignments.subjectId, subjectId)
      ));
    return assignment;
  }

  // Timetable Structure operations
  async getTimetableStructures(schoolId?: string): Promise<TimetableStructure[]> {
    if (schoolId) {
      return await db.select().from(timetableStructures).where(eq(timetableStructures.schoolId, schoolId));
    }
    return await db.select().from(timetableStructures);
  }

  async getTimetableStructure(id: string): Promise<TimetableStructure | undefined> {
    const [structure] = await db.select().from(timetableStructures).where(eq(timetableStructures.id, id));
    return structure;
  }

  async getTimetableStructureBySchool(schoolId: string): Promise<TimetableStructure | undefined> {
    const [structure] = await db
      .select()
      .from(timetableStructures)
      .where(and(
        eq(timetableStructures.schoolId, schoolId),
        eq(timetableStructures.isActive, true)
      ));
    return structure;
  }

  async createTimetableStructure(structure: InsertTimetableStructure): Promise<TimetableStructure> {
    // First, deactivate other active structures for this school
    await db
      .update(timetableStructures)
      .set({ isActive: false })
      .where(and(
        eq(timetableStructures.schoolId, structure.schoolId),
        eq(timetableStructures.isActive, true)
      ));

    const [newStructure] = await db.insert(timetableStructures).values(structure).returning();
    return newStructure;
  }

  async updateTimetableStructure(id: string, structure: Partial<InsertTimetableStructure>): Promise<TimetableStructure> {
    const [updatedStructure] = await db
      .update(timetableStructures)
      .set(structure)
      .where(eq(timetableStructures.id, id))
      .returning();
    return updatedStructure;
  }

  async deleteTimetableStructure(id: string): Promise<void> {
    await db.delete(timetableStructures).where(eq(timetableStructures.id, id));
  }

  // Teacher attendance operations
  async getTeacherAttendance(schoolId: string, date?: string): Promise<TeacherAttendance[]> {
    const conditions = [eq(teacherAttendance.schoolId, schoolId)];
    
    if (date) {
      conditions.push(eq(teacherAttendance.attendanceDate, date));
    }
    
    return await db
      .select()
      .from(teacherAttendance)
      .where(and(...conditions))
      .orderBy(teacherAttendance.attendanceDate);
  }

  async getTeacherAttendanceByTeacher(teacherId: string, startDate?: string, endDate?: string): Promise<TeacherAttendance[]> {
    const conditions = [eq(teacherAttendance.teacherId, teacherId)];
    
    if (startDate && endDate) {
      conditions.push(between(teacherAttendance.attendanceDate, startDate, endDate));
    } else if (startDate) {
      conditions.push(gte(teacherAttendance.attendanceDate, startDate));
    } else if (endDate) {
      conditions.push(lte(teacherAttendance.attendanceDate, endDate));
    }
    
    return await db
      .select()
      .from(teacherAttendance)
      .where(and(...conditions))
      .orderBy(teacherAttendance.attendanceDate);
  }

  async markTeacherAttendance(attendance: InsertTeacherAttendance): Promise<TeacherAttendance> {
    // Check if attendance already exists for this teacher and date
    const existing = await db
      .select()
      .from(teacherAttendance)
      .where(
        and(
          eq(teacherAttendance.teacherId, attendance.teacherId),
          eq(teacherAttendance.attendanceDate, attendance.attendanceDate)
        )
      );

    let result: TeacherAttendance;
    let wasAbsentBefore = false;
    let isAbsentNow = attendance.status !== "present";

    if (existing.length > 0) {
      wasAbsentBefore = existing[0].status !== "present";
      
      // Update existing record
      const [updated] = await db
        .update(teacherAttendance)
        .set({
          status: attendance.status,
          reason: attendance.reason,
          isFullDay: attendance.isFullDay,
          markedBy: attendance.markedBy,
          markedAt: getCurrentDateTimeIST(),
        })
        .where(eq(teacherAttendance.id, existing[0].id))
        .returning();
      result = updated;
    } else {
      // Create new record
      const [created] = await db
        .insert(teacherAttendance)
        .values(attendance)
        .returning();
      result = created;
    }

    // Handle automatic absence detection and substitution
    try {
      const { AbsenceDetectionService } = await import("./services/absenceDetectionService");
      
      // If teacher is being marked as absent and wasn't absent before
      if (isAbsentNow && !wasAbsentBefore) {
        console.log(`Triggering automatic absence detection for teacher ${attendance.teacherId} on ${attendance.attendanceDate}`);
        
        await AbsenceDetectionService.handleTeacherAbsence(
          attendance.teacherId,
          attendance.attendanceDate,
          attendance.reason || "No reason provided",
          attendance.markedBy || "system"
        );
      }
      // If teacher is being marked as present and was absent before
      else if (!isAbsentNow && wasAbsentBefore) {
        console.log(`Teacher ${attendance.teacherId} returned on ${attendance.attendanceDate}, checking for automatic changes to revert`);
        
        await AbsenceDetectionService.handleTeacherReturn(
          attendance.teacherId,
          attendance.attendanceDate,
          attendance.markedBy || "system"
        );
      }
    } catch (absenceError) {
      console.error("Error in automatic absence detection:", absenceError);
      // Don't throw the error as attendance marking should still succeed
      // Log it for admin review
      try {
        await this.createAuditLog({
          action: "absence_detection_error",
          entityType: "teacher_attendance",
          entityId: attendance.teacherId,
          userId: attendance.markedBy || "system",
          description: `Failed to process automatic absence detection: ${absenceError instanceof Error ? absenceError.message : 'Unknown error'}`,
          schoolId: attendance.schoolId
        });
      } catch (auditError) {
        console.error("Failed to log absence detection error:", auditError);
      }
    }

    return result;
  }

  async markBulkTeacherAttendance(bulkData: BulkAttendanceData, markedBy: string): Promise<TeacherAttendance[]> {
    const { teacherId, status, reason, startDate, endDate, isFullDay } = bulkData;
    const records: TeacherAttendance[] = [];
    
    // Get teacher and school info
    const teacher = await this.getTeacher(teacherId);
    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Generate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split('T')[0];
      
      try {
        const attendanceRecord = await this.markTeacherAttendance({
          teacherId,
          schoolId: teacher.schoolId,
          attendanceDate: dateString,
          status,
          reason,
          leaveStartDate: startDate,
          leaveEndDate: endDate,
          isFullDay,
          markedBy,
        });
        records.push(attendanceRecord);
      } catch (error) {
        console.error(`Failed to mark attendance for ${dateString}:`, error);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return records;
  }

  async updateTeacherAttendance(id: string, attendance: Partial<InsertTeacherAttendance>): Promise<TeacherAttendance> {
    const [updated] = await db
      .update(teacherAttendance)
      .set({
        ...attendance,
        updatedAt: getCurrentDateTimeIST(),
      })
      .where(eq(teacherAttendance.id, id))
      .returning();
      
    if (!updated) {
      throw new Error("Teacher attendance record not found");
    }
    
    return updated;
  }

  async deleteTeacherAttendance(id: string): Promise<void> {
    await db.delete(teacherAttendance).where(eq(teacherAttendance.id, id));
  }

  async isTeacherAbsent(teacherId: string, date: string): Promise<boolean> {
    const attendance = await db
      .select()
      .from(teacherAttendance)
      .where(
        and(
          eq(teacherAttendance.teacherId, teacherId),
          eq(teacherAttendance.attendanceDate, date)
        )
      );
    
    if (attendance.length === 0) {
      return false; // No record means present by default
    }
    
    return attendance[0].status !== "present";
  }

  // Student attendance operations
  async getStudentAttendance(schoolId: string, date?: string): Promise<StudentAttendance[]> {
    const conditions = [eq(studentAttendance.schoolId, schoolId)];
    
    if (date) {
      conditions.push(eq(studentAttendance.attendanceDate, date));
    }
    
    return await db
      .select()
      .from(studentAttendance)
      .where(and(...conditions))
      .orderBy(studentAttendance.attendanceDate);
  }

  async getStudentAttendanceByStudent(studentId: string, startDate?: string, endDate?: string): Promise<StudentAttendance[]> {
    const conditions = [eq(studentAttendance.studentId, studentId)];
    
    if (startDate && endDate) {
      conditions.push(between(studentAttendance.attendanceDate, startDate, endDate));
    } else if (startDate) {
      conditions.push(gte(studentAttendance.attendanceDate, startDate));
    } else if (endDate) {
      conditions.push(lte(studentAttendance.attendanceDate, endDate));
    }
    
    return await db
      .select()
      .from(studentAttendance)
      .where(and(...conditions))
      .orderBy(studentAttendance.attendanceDate);
  }

  async getStudentAttendanceByClass(classId: string, date: string): Promise<StudentAttendance[]> {
    return await db
      .select()
      .from(studentAttendance)
      .where(
        and(
          eq(studentAttendance.classId, classId),
          eq(studentAttendance.attendanceDate, date)
        )
      )
      .orderBy(studentAttendance.studentId);
  }

  async markStudentAttendance(attendance: InsertStudentAttendance): Promise<StudentAttendance> {
    // Check if attendance already exists for this student and date
    const existing = await db
      .select()
      .from(studentAttendance)
      .where(
        and(
          eq(studentAttendance.studentId, attendance.studentId),
          eq(studentAttendance.attendanceDate, attendance.attendanceDate)
        )
      );

    let result: StudentAttendance;

    if (existing.length > 0) {
      // Update existing record
      const [updated] = await db
        .update(studentAttendance)
        .set({
          ...attendance,
          markedAt: getCurrentDateTimeIST(),
          updatedAt: getCurrentDateTimeIST(),
        })
        .where(eq(studentAttendance.id, existing[0].id))
        .returning();
      result = updated;
    } else {
      // Create new record
      const [created] = await db
        .insert(studentAttendance)
        .values({
          ...attendance,
          markedAt: getCurrentDateTimeIST(),
        })
        .returning();
      result = created;
    }

    return result;
  }

  async updateStudentAttendance(id: string, attendance: Partial<InsertStudentAttendance>): Promise<StudentAttendance> {
    const [updated] = await db
      .update(studentAttendance)
      .set({
        ...attendance,
        updatedAt: getCurrentDateTimeIST(),
      })
      .where(eq(studentAttendance.id, id))
      .returning();
      
    if (!updated) {
      throw new Error("Student attendance record not found");
    }
    
    return updated;
  }

  async deleteStudentAttendance(id: string): Promise<void> {
    await db.delete(studentAttendance).where(eq(studentAttendance.id, id));
  }

  async isStudentAbsent(studentId: string, date: string): Promise<boolean> {
    const attendance = await db
      .select()
      .from(studentAttendance)
      .where(
        and(
          eq(studentAttendance.studentId, studentId),
          eq(studentAttendance.attendanceDate, date)
        )
      );
    
    if (attendance.length === 0) {
      return false; // No record means present by default
    }
    
    return attendance[0].status !== "present";
  }

  async getStudentAttendanceById(id: string): Promise<StudentAttendance | undefined> {
    const attendance = await db
      .select()
      .from(studentAttendance)
      .where(eq(studentAttendance.id, id));
    
    return attendance[0];
  }

  async getStudentByUserId(userId: string): Promise<Student | undefined> {
    const student = await db
      .select()
      .from(students)
      .where(eq(students.userId, userId));
    
    return student[0];
  }

  // Audit log operations
  async createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(auditLog).returning();
    return log;
  }

  async getAuditLogs(schoolId: string, limit: number = 50): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.schoolId, schoolId))
      .orderBy(auditLogs.createdAt)
      .limit(limit);
  }

  // Enhanced teacher operations for daily periods
  async updateTeacherDailyPeriods(schoolId: string, config: UpdateTeacherDailyPeriods): Promise<{ success: boolean; message: string }> {
    try {
      if (config.applyToAll) {
        // Update all teachers in the school
        await db
          .update(teachers)
          .set({ maxDailyPeriods: config.maxDailyPeriods })
          .where(eq(teachers.schoolId, schoolId));
        
        return { 
          success: true, 
          message: `Updated daily periods limit to ${config.maxDailyPeriods} for all teachers` 
        };
      } else if (config.teacherId) {
        // Update specific teacher
        await db
          .update(teachers)
          .set({ maxDailyPeriods: config.maxDailyPeriods })
          .where(and(eq(teachers.id, config.teacherId), eq(teachers.schoolId, schoolId)));
        
        return { 
          success: true, 
          message: `Updated daily periods limit to ${config.maxDailyPeriods} for selected teacher` 
        };
      } else {
        return { success: false, message: "Teacher ID is required when not applying to all teachers" };
      }
    } catch (error) {
      console.error("Error updating teacher daily periods:", error);
      return { success: false, message: "Failed to update teacher daily periods" };
    }
  }

  async getTeacherSchedule(teacherId: string, date?: string): Promise<TimetableEntry[]> {
    let query = db
      .select()
      .from(timetableEntries)
      .where(eq(timetableEntries.teacherId, teacherId))
      .orderBy(timetableEntries.day, timetableEntries.period);

    return await query;
  }

  async getTeacherWorkloadAnalytics(schoolId: string): Promise<any> {
    // Get all teachers and their current workload
    const teachersList = await this.getTeachers(schoolId);
    const allEntries = await db
      .select()
      .from(timetableEntries)
      .innerJoin(teachers, eq(timetableEntries.teacherId, teachers.id))
      .where(eq(teachers.schoolId, schoolId));

    const workloadData = teachersList.map(teacher => {
      const teacherEntries = allEntries.filter(entry => entry.timetable_entries.teacherId === teacher.id);
      const weeklyPeriods = teacherEntries.length;
      const dailyPeriods: Record<string, number> = {};
      
      teacherEntries.forEach(entry => {
        const day = entry.timetable_entries.day;
        dailyPeriods[day] = (dailyPeriods[day] || 0) + 1;
      });

      const avgDailyPeriods = weeklyPeriods / 6; // Assuming 6 working days
      const maxDailyPeriods = Math.max(...Object.values(dailyPeriods), 0);

      return {
        teacherId: teacher.id,
        teacherName: teacher.name,
        weeklyPeriods,
        avgDailyPeriods: Math.round(avgDailyPeriods * 10) / 10,
        maxDailyPeriods,
        maxAllowedDaily: teacher.maxDailyPeriods,
        isOverloaded: maxDailyPeriods > teacher.maxDailyPeriods,
        dailyBreakdown: dailyPeriods
      };
    });

    return {
      teachers: workloadData,
      summary: {
        totalTeachers: teachersList.length,
        overloadedTeachers: workloadData.filter(t => t.isOverloaded).length,
        avgWeeklyPeriods: workloadData.reduce((sum, t) => sum + t.weeklyPeriods, 0) / teachersList.length || 0
      }
    };
  }

  async getTimetableEntriesByTeacher(teacherId: string): Promise<TimetableEntry[]> {
    return await db
      .select()
      .from(timetableEntries)
      .where(and(
        eq(timetableEntries.teacherId, teacherId),
        eq(timetableEntries.isActive, true)
      ))
      .orderBy(timetableEntries.day, timetableEntries.period);
  }

  // Teacher Replacement operations
  async createTeacherReplacement(replacement: InsertTeacherReplacement): Promise<TeacherReplacement> {
    const [newReplacement] = await db
      .insert(teacherReplacements)
      .values(replacement)
      .returning();
    return newReplacement;
  }

  async getAllTeacherReplacements(): Promise<TeacherReplacement[]> {
    return await db
      .select({
        id: teacherReplacements.id,
        originalTeacherId: teacherReplacements.originalTeacherId,
        replacementTeacherId: teacherReplacements.replacementTeacherId,
        schoolId: teacherReplacements.schoolId,
        replacementDate: teacherReplacements.replacementDate,
        reason: teacherReplacements.reason,
        affectedTimetableEntries: teacherReplacements.affectedTimetableEntries,
        conflictDetails: teacherReplacements.conflictDetails,
        status: teacherReplacements.status,
        replacedBy: teacherReplacements.replacedBy,
        completedAt: teacherReplacements.completedAt,
        createdAt: teacherReplacements.createdAt,
        updatedAt: teacherReplacements.updatedAt,
        originalTeacher: {
          id: sql`orig_teacher.id`,
          name: sql`orig_teacher.name`,
          email: sql`orig_teacher.email`
        },
        replacementTeacher: {
          id: sql`repl_teacher.id`,
          name: sql`repl_teacher.name`,
          email: sql`repl_teacher.email`
        },
        school: {
          id: sql`school.id`,
          name: sql`school.name`
        },
        replacedByUser: {
          id: sql`replaced_by_user.id`,
          email: sql`replaced_by_user.email`
        }
      })
      .from(teacherReplacements)
      .leftJoin(sql`${teachers} as orig_teacher`, sql`orig_teacher.id = ${teacherReplacements.originalTeacherId}`)
      .leftJoin(sql`${teachers} as repl_teacher`, sql`repl_teacher.id = ${teacherReplacements.replacementTeacherId}`)
      .leftJoin(schools, eq(teacherReplacements.schoolId, schools.id))
      .leftJoin(sql`${users} as replaced_by_user`, sql`replaced_by_user.id = ${teacherReplacements.replacedBy}`)
      .orderBy(sql`${teacherReplacements.createdAt} DESC`);
  }

  async getTeacherReplacementsBySchool(schoolId: string): Promise<TeacherReplacement[]> {
    return await db
      .select({
        id: teacherReplacements.id,
        originalTeacherId: teacherReplacements.originalTeacherId,
        replacementTeacherId: teacherReplacements.replacementTeacherId,
        schoolId: teacherReplacements.schoolId,
        replacementDate: teacherReplacements.replacementDate,
        reason: teacherReplacements.reason,
        affectedTimetableEntries: teacherReplacements.affectedTimetableEntries,
        conflictDetails: teacherReplacements.conflictDetails,
        status: teacherReplacements.status,
        replacedBy: teacherReplacements.replacedBy,
        completedAt: teacherReplacements.completedAt,
        createdAt: teacherReplacements.createdAt,
        updatedAt: teacherReplacements.updatedAt,
        originalTeacher: {
          id: sql`orig_teacher.id`,
          name: sql`orig_teacher.name`,
          email: sql`orig_teacher.email`
        },
        replacementTeacher: {
          id: sql`repl_teacher.id`,
          name: sql`repl_teacher.name`,
          email: sql`repl_teacher.email`
        },
        replacedByUser: {
          id: sql`replaced_by_user.id`,
          email: sql`replaced_by_user.email`
        }
      })
      .from(teacherReplacements)
      .leftJoin(sql`${teachers} as orig_teacher`, sql`orig_teacher.id = ${teacherReplacements.originalTeacherId}`)
      .leftJoin(sql`${teachers} as repl_teacher`, sql`repl_teacher.id = ${teacherReplacements.replacementTeacherId}`)
      .leftJoin(sql`${users} as replaced_by_user`, sql`replaced_by_user.id = ${teacherReplacements.replacedBy}`)
      .where(eq(teacherReplacements.schoolId, schoolId))
      .orderBy(sql`${teacherReplacements.createdAt} DESC`);
  }

  // Enhanced substitution operations
  async getAbsentTeacherAlerts(schoolId: string, date: string): Promise<any[]> {
    const absentTeachers = await db
      .select({
        teacher: teachers,
        attendance: teacherAttendance,
      })
      .from(teacherAttendance)
      .innerJoin(teachers, eq(teacherAttendance.teacherId, teachers.id))
      .where(
        and(
          eq(teachers.schoolId, schoolId),
          eq(teacherAttendance.attendanceDate, date),
          inArray(teacherAttendance.status, ['absent', 'on_leave', 'medical_leave', 'personal_leave'])
        )
      );

    const alerts = [];
    for (const absent of absentTeachers) {
      const schedule = await db
        .select()
        .from(timetableEntries)
        .where(eq(timetableEntries.teacherId, absent.teacher.id));

      // Get the day of the week for the absence date to filter affected classes
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const affectedClassesForDay = schedule.filter(entry => entry.day.toLowerCase() === dayOfWeek);

      alerts.push({
        teacher: absent.teacher,
        attendance: absent.attendance,
        affectedClasses: affectedClassesForDay.length,  // ✅ Only count classes for the specific absence day
        schedule: schedule
      });
    }

    return alerts;
  }

  async findSubstituteTeachers(originalTeacherId: string, timetableEntryId: string, date: string): Promise<Teacher[]> {
    const entry = await db
      .select()
      .from(timetableEntries)
      .where(eq(timetableEntries.id, timetableEntryId))
      .limit(1);

    if (!entry.length) return [];

    const { day, period, subjectId } = entry[0];
    
    // Get the original teacher's school
    const originalTeacher = await this.getTeacher(originalTeacherId);
    if (!originalTeacher) return [];

    // Find teachers who can teach the same subject and are available
    const sameSubjectTeachers = await db
      .select()
      .from(teachers)
      .where(
        and(
          eq(teachers.schoolId, originalTeacher.schoolId),
          eq(teachers.isActive, true),
          ne(teachers.id, originalTeacherId)
        )
      );

    // Filter for teachers who teach this subject
    const qualifiedTeachers = sameSubjectTeachers.filter(teacher => {
      const subjectsArray = Array.isArray(teacher.subjects) ? teacher.subjects : [];
      return subjectsArray.includes(subjectId);
    });

    // Check availability (not assigned to another class at same time)
    const availableTeachers = [];
    for (const teacher of qualifiedTeachers) {
      // Check if teacher is absent on this date
      const isAbsent = await this.isTeacherAbsent(teacher.id, date);
      if (isAbsent) continue;

      // Check if teacher has conflicts at this time
      const conflicts = await db
        .select()
        .from(timetableEntries)
        .where(
          and(
            eq(timetableEntries.teacherId, teacher.id),
            eq(timetableEntries.day, day),
            eq(timetableEntries.period, period)
          )
        );

      if (conflicts.length === 0) {
        // Check daily period limit
        const dailySchedule = await db
          .select()
          .from(timetableEntries)
          .where(
            and(
              eq(timetableEntries.teacherId, teacher.id),
              eq(timetableEntries.day, day)
            )
          );

        if (dailySchedule.length < teacher.maxDailyPeriods) {
          availableTeachers.push(teacher);
        }
      }
    }

    // Sort by preference: same subject first, then by current workload
    return availableTeachers.sort((a, b) => {
      const aSubjects = Array.isArray(a.subjects) ? a.subjects : [];
      const bSubjects = Array.isArray(b.subjects) ? b.subjects : [];
      
      const aCanTeach = aSubjects.includes(subjectId);
      const bCanTeach = bSubjects.includes(subjectId);
      
      if (aCanTeach && !bCanTeach) return -1;
      if (!aCanTeach && bCanTeach) return 1;
      return 0;
    });
  }

  async autoAssignSubstitute(timetableEntryId: string, date: string, reason: string, assignedBy: string): Promise<{ success: boolean; substitution?: Substitution; message: string }> {
    try {
      const entry = await db
        .select()
        .from(timetableEntries)
        .where(eq(timetableEntries.id, timetableEntryId))
        .limit(1);

      if (!entry.length) {
        return { success: false, message: "Timetable entry not found" };
      }

      const originalTeacherId = entry[0].teacherId;
      const possibleSubstitutes = await this.findSubstituteTeachers(originalTeacherId, timetableEntryId, date);

      if (possibleSubstitutes.length === 0) {
        return { success: false, message: "No available substitute teachers found" };
      }

      // Use the first available teacher (highest priority)
      const substituteTeacher = possibleSubstitutes[0];
      
      const substitution = await this.createSubstitution({
        originalTeacherId,
        substituteTeacherId: substituteTeacher.id,
        timetableEntryId,
        date: new Date(date + 'T00:00:00Z'),
        reason,
        status: 'confirmed'
      });

      // Create audit log
      const teacher = await this.getTeacher(originalTeacherId);
      await this.createAuditLog({
        schoolId: teacher?.schoolId || '',
        userId: assignedBy,
        action: 'SUBSTITUTE',
        entityType: 'SUBSTITUTION',
        entityId: substitution.id,
        description: `Auto-assigned ${substituteTeacher.name} as substitute for ${teacher?.name}`,
        newValues: { substituteTeacherId: substituteTeacher.id, reason }
      });

      return { 
        success: true, 
        substitution, 
        message: `Successfully assigned ${substituteTeacher.name} as substitute` 
      };
    } catch (error) {
      console.error("Error auto-assigning substitute:", error);
      return { success: false, message: "Failed to assign substitute teacher" };
    }
  }

  // Manual assignment operations
  async getTeachersForClass(classId: string): Promise<Teacher[]> {
    const assignments = await db
      .select()
      .from(classSubjectAssignments)
      .where(eq(classSubjectAssignments.classId, classId));

    const teacherIds = assignments
      .filter(a => a.assignedTeacherId)
      .map(a => a.assignedTeacherId as string);

    if (teacherIds.length === 0) return [];

    const classTeachersResult = await db
      .select()
      .from(teachers)
      .where(inArray(teachers.id, teacherIds));

    return classTeachersResult;
  }

  async createManualAssignmentAudit(audit: InsertManualAssignmentAudit): Promise<ManualAssignmentAudit> {
    const [created] = await db
      .insert(manualAssignmentAudits)
      .values(audit)
      .returning();
    return created;
  }

  async getTimetableEntry(id: string): Promise<TimetableEntry | undefined> {
    const [entry] = await db
      .select()
      .from(timetableEntries)
      .where(eq(timetableEntries.id, id));
    return entry;
  }



  async isTeacherAvailable(teacherId: string, day: string, period: number, date?: string): Promise<boolean> {
    // Check if teacher is absent on this date (if date provided)
    if (date) {
      const isAbsent = await this.isTeacherAbsent(teacherId, date);
      if (isAbsent) return false;
    }

    // Check existing timetable conflicts
    const conflicts = await db
      .select()
      .from(timetableEntries)
      .where(
        and(
          eq(timetableEntries.teacherId, teacherId),
          eq(timetableEntries.day, day as any),
          eq(timetableEntries.period, period),
          eq(timetableEntries.isActive, true)
        )
      );

    if (conflicts.length > 0) return false;

    // Check daily period limits
    const teacher = await this.getTeacher(teacherId);
    if (teacher) {
      const dailySchedule = await db
        .select()
        .from(timetableEntries)
        .where(
          and(
            eq(timetableEntries.teacherId, teacherId),
            eq(timetableEntries.day, day as any),
            eq(timetableEntries.isActive, true)
          )
        );

      if (dailySchedule.length >= teacher.maxDailyPeriods) {
        return false;
      }
    }

    return true;
  }

  // Global Timetable Management
  async replaceGlobalTimetableForClass(classId: string, effectiveTimetable: TimetableEntry[]): Promise<void> {
    await db.transaction(async (tx) => {
      // First, deactivate all existing entries for this class
      await tx
        .update(timetableEntries)
        .set({ isActive: false })
        .where(eq(timetableEntries.classId, classId));
      
      // Then insert the new global timetable entries
      if (effectiveTimetable.length > 0) {
        const newEntries = effectiveTimetable.map(entry => ({
          classId: entry.classId,
          teacherId: entry.teacherId,
          subjectId: entry.subjectId,
          day: entry.day,
          period: entry.period,
          startTime: entry.startTime,
          endTime: entry.endTime,
          room: entry.room,
          versionId: entry.versionId,
          isActive: true
        }));
        
        await tx.insert(timetableEntries).values(newEntries);
      }
    });
  }

  async clearWeeklyChangesForClass(classId: string, date: string): Promise<void> {
    // Calculate week start and end dates
    const selectedDate = new Date(date);
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay() + 1); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday
    
    // Find all timetable entry IDs for this class
    const classEntries = await db
      .select({ id: timetableEntries.id })
      .from(timetableEntries)
      .where(eq(timetableEntries.classId, classId));
    
    const entryIds = classEntries.map(entry => entry.id);
    
    if (entryIds.length === 0) return;
    
    // Deactivate all timetable changes for this class in the specified week
    await db
      .update(timetableChanges)
      .set({ isActive: false })
      .where(
        and(
          inArray(timetableChanges.timetableEntryId, entryIds),
          gte(timetableChanges.changeDate, weekStart.toISOString().split('T')[0]),
          lte(timetableChanges.changeDate, weekEnd.toISOString().split('T')[0])
        )
      );
  }

  // Weekly Timetable Functions
  async getWeeklyTimetable(classId: string, weekStart: Date): Promise<WeeklyTimetable | null> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday
    
    const results = await db
      .select()
      .from(weeklyTimetables)
      .where(
        and(
          eq(weeklyTimetables.classId, classId),
          eq(weeklyTimetables.weekStart, weekStart.toISOString().split('T')[0]),
          eq(weeklyTimetables.isActive, true)
        )
      )
      .limit(1);
    
    return results.length > 0 ? results[0] : null;
  }

  async createWeeklyTimetable(data: InsertWeeklyTimetable): Promise<WeeklyTimetable> {
    const results = await db
      .insert(weeklyTimetables)
      .values(data)
      .returning();
    
    return results[0];
  }

  async updateWeeklyTimetable(id: string, data: Partial<InsertWeeklyTimetable>): Promise<WeeklyTimetable> {
    const results = await db
      .update(weeklyTimetables)
      .set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(weeklyTimetables.id, id))
      .returning();
    
    return results[0];
  }

  async createOrUpdateWeeklyTimetable(
    classId: string, 
    weekStart: Date, 
    timetableData: any[],
    modifiedBy: string,
    schoolId: string
  ): Promise<WeeklyTimetable> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday
    
    // Check if a weekly timetable already exists for this class and week
    const existing = await this.getWeeklyTimetable(classId, weekStart);
    
    if (existing) {
      // Update the existing weekly timetable
      return await this.updateWeeklyTimetable(existing.id, {
        timetableData,
        modifiedBy,
        modificationCount: existing.modificationCount + 1,
      });
    } else {
      // Create a new weekly timetable
      return await this.createWeeklyTimetable({
        classId,
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        timetableData,
        modifiedBy,
        modificationCount: 1,
        basedOnGlobalVersion: 'current', // Track the global version this is based on
        schoolId,
        isActive: true,
      });
    }
  }

  async promoteWeeklyTimetableToGlobal(weeklyTimetableId: string): Promise<void> {
    // Get the weekly timetable
    const weeklyTimetable = await db
      .select()
      .from(weeklyTimetables)
      .where(eq(weeklyTimetables.id, weeklyTimetableId))
      .limit(1);
    
    if (weeklyTimetable.length === 0) {
      throw new Error('Weekly timetable not found');
    }
    
    const weekly = weeklyTimetable[0];
    
    await db.transaction(async (tx) => {
      // Deactivate current global timetable entries for this class
      await tx
        .update(timetableEntries)
        .set({ isActive: false })
        .where(eq(timetableEntries.classId, weekly.classId));
      
      // Create new global timetable entries from weekly timetable data
      if (weekly.timetableData && Array.isArray(weekly.timetableData)) {
        const newEntries = weekly.timetableData
          .filter(entry => entry.teacherId && entry.subjectId) // Only non-cancelled entries
          .map(entry => ({
            classId: weekly.classId,
            teacherId: entry.teacherId!,
            subjectId: entry.subjectId!,
            day: entry.day as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday",
            period: entry.period,
            startTime: entry.startTime,
            endTime: entry.endTime,
            room: entry.room || null,
            versionId: null, // Will need to create or reference appropriate version
            isActive: true,
          }));
        
        if (newEntries.length > 0) {
          await tx.insert(timetableEntries).values(newEntries);
        }
      }
    });
  }

  // Get all timetable entries for a specific class
  async getTimetableEntriesForClass(classId: string): Promise<any[]> {
    return await db
      .select()
      .from(timetableEntries)
      .where(
        and(
          eq(timetableEntries.classId, classId),
          eq(timetableEntries.isActive, true)
        )
      )
      .orderBy(timetableEntries.day, timetableEntries.period);
  }

  // Get detailed timetable entries with teacher and subject information
  async getTimetableEntriesWithDetails(): Promise<any[]> {
    return await db
      .select({
        id: timetableEntries.id,
        classId: timetableEntries.classId,
        teacherId: timetableEntries.teacherId,
        subjectId: timetableEntries.subjectId,
        day: timetableEntries.day,
        period: timetableEntries.period,
        startTime: timetableEntries.startTime,
        endTime: timetableEntries.endTime,
        room: timetableEntries.room,
        isActive: timetableEntries.isActive,
        createdAt: timetableEntries.createdAt,
        updatedAt: timetableEntries.updatedAt,
        teacher: {
          id: teachers.id,
          name: teachers.name,
          email: teachers.email,
          contactNumber: teachers.contactNumber,
          schoolIdNumber: teachers.schoolIdNumber,
          subjects: teachers.subjects,
          classes: teachers.classes,
          availability: teachers.availability,
          maxLoad: teachers.maxLoad,
          maxDailyPeriods: teachers.maxDailyPeriods,
          schoolId: teachers.schoolId,
          isActive: teachers.isActive,
          status: teachers.status,
          createdAt: teachers.createdAt,
          updatedAt: teachers.updatedAt
        },
        subject: {
          id: subjects.id,
          name: subjects.name,
          code: subjects.code,
          periodsPerWeek: subjects.periodsPerWeek,
          color: subjects.color,
          schoolId: subjects.schoolId,
          createdAt: subjects.createdAt,
          updatedAt: subjects.updatedAt
        },
        class: {
          id: classes.id,
          grade: classes.grade,
          section: classes.section,
          studentCount: classes.studentCount,
          requiredSubjects: classes.requiredSubjects,
          schoolId: classes.schoolId,
          room: classes.room,
          createdAt: classes.createdAt,
          updatedAt: classes.updatedAt
        }
      })
      .from(timetableEntries)
      .leftJoin(teachers, eq(timetableEntries.teacherId, teachers.id))
      .leftJoin(subjects, eq(timetableEntries.subjectId, subjects.id))
      .leftJoin(classes, eq(timetableEntries.classId, classes.id))
      .where(eq(timetableEntries.isActive, true))
      .orderBy(timetableEntries.day, timetableEntries.period);
  }

  // Deactivate all timetable entries for a specific class
  async deactivateTimetableEntriesForClass(classId: string): Promise<void> {
    await db
      .update(timetableEntries)
      .set({ 
        isActive: false,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(timetableEntries.classId, classId));
  }

  // Create multiple timetable entries at once
  async createMultipleTimetableEntries(entries: any[]): Promise<any[]> {
    if (entries.length === 0) return [];
    
    const results = await db
      .insert(timetableEntries)
      .values(entries)
      .returning();
    
    return results;
  }

  // Update or create a specific entry in weekly timetable
  async updateWeeklyTimetableEntry(
    classId: string,
    weekStart: string,
    weekEnd: string,
    day: string,
    period: number,
    entryData: {
      teacherId: string | null;
      subjectId: string | null;
      startTime?: string;
      endTime?: string;
      room?: string | null;
      isModified: boolean;
      modificationReason?: string;
    },
    modifiedBy: string
  ): Promise<{ id: string; modificationCount: number }> {
    return await db.transaction(async (tx) => {
      // First get or create the weekly timetable for this week
      let [existingWeeklyTimetable] = await tx
        .select()
        .from(weeklyTimetables)
        .where(
          and(
            eq(weeklyTimetables.classId, classId),
            eq(weeklyTimetables.weekStart, weekStart),
            eq(weeklyTimetables.isActive, true)
          )
        );

      let timetableData: any[] = [];
      let modificationCount = 1;

      if (existingWeeklyTimetable) {
        // Update existing weekly timetable
        timetableData = Array.isArray(existingWeeklyTimetable.timetableData) 
          ? [...existingWeeklyTimetable.timetableData] 
          : [];
        modificationCount = (existingWeeklyTimetable.modificationCount || 0) + 1;
      } else {
        // Create new weekly timetable based on current global timetable for this class
        const globalEntries = await tx
          .select()
          .from(timetableEntries)
          .where(
            and(
              eq(timetableEntries.classId, classId),
              eq(timetableEntries.isActive, true)
            )
          );

        // Convert global entries to weekly timetable format
        timetableData = globalEntries.map(entry => ({
          day: entry.day,
          period: entry.period,
          teacherId: entry.teacherId,
          subjectId: entry.subjectId,
          startTime: entry.startTime,
          endTime: entry.endTime,
          room: entry.room,
          isModified: false
        }));
      }

      // Find and update the specific entry, or add it if it doesn't exist
      const entryIndex = timetableData.findIndex(
        entry => entry.day.toLowerCase() === day.toLowerCase() && entry.period === period
      );

      // If both teacherId and subjectId are null, this is a deletion - remove the entry
      if (!entryData.teacherId && !entryData.subjectId) {
        if (entryIndex >= 0) {
          // Remove the entry from the timetable data
          timetableData.splice(entryIndex, 1);
        }
        // If entry doesn't exist, nothing to delete
      } else {
        // This is an assignment/update - create or update the entry
        const updatedEntry = {
          day: day.toLowerCase(),
          period,
          teacherId: entryData.teacherId,
          subjectId: entryData.subjectId,
          startTime: entryData.startTime || "08:00",
          endTime: entryData.endTime || "08:45",
          room: entryData.room || null,
          isModified: entryData.isModified,
          modificationReason: entryData.modificationReason
        };

        if (entryIndex >= 0) {
          timetableData[entryIndex] = updatedEntry;
        } else {
          timetableData.push(updatedEntry);
        }
      }

      if (existingWeeklyTimetable) {
        // Update existing record
        const [updated] = await tx
          .update(weeklyTimetables)
          .set({
            timetableData,
            modificationCount,
            modifiedBy,
            updatedAt: sql`CURRENT_TIMESTAMP`
          })
          .where(eq(weeklyTimetables.id, existingWeeklyTimetable.id))
          .returning({ id: weeklyTimetables.id, modificationCount: weeklyTimetables.modificationCount });

        return { id: updated.id, modificationCount: updated.modificationCount };
      } else {
        // Create new record
        const [created] = await tx
          .insert(weeklyTimetables)
          .values({
            classId,
            weekStart,
            weekEnd,
            timetableData,
            modifiedBy,
            modificationCount,
            schoolId: (await tx.select({ schoolId: classes.schoolId }).from(classes).where(eq(classes.id, classId)))[0].schoolId
          })
          .returning({ id: weeklyTimetables.id, modificationCount: weeklyTimetables.modificationCount });

        return { id: created.id, modificationCount: created.modificationCount };
      }
    });
  }

  // Delete global timetable and current/future weekly timetables for a specific class
  async deleteGlobalAndFutureWeeklyTimetables(classId: string): Promise<{ globalDeleted: number, weeklyDeleted: number }> {
    const result = { globalDeleted: 0, weeklyDeleted: 0 };
    
    // Calculate current week start (Monday)
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday of current week
    currentWeekStart.setHours(0, 0, 0, 0); // Start of day
    
    const currentWeekStartString = currentWeekStart.toISOString().split('T')[0];
    
    await db.transaction(async (tx) => {
      // Delete all global timetable entries for this class
      const deletedGlobal = await tx
        .delete(timetableEntries)
        .where(eq(timetableEntries.classId, classId))
        .returning({ id: timetableEntries.id });
      
      result.globalDeleted = deletedGlobal.length;
      
      // Delete only weekly timetables from current week onwards (preserve past weeks for history)
      const deletedWeekly = await tx
        .delete(weeklyTimetables)
        .where(
          and(
            eq(weeklyTimetables.classId, classId),
            gte(weeklyTimetables.weekStart, currentWeekStartString)
          )
        )
        .returning({ id: weeklyTimetables.id });
      
      result.weeklyDeleted = deletedWeekly.length;
    });
    
    return result;
  }

  // RBAC operations implementation
  async getSystemModules(activeOnly = false): Promise<any[]> {
    let query = db.select().from(systemModules);
    if (activeOnly) {
      query = query.where(eq(systemModules.isActive, true));
    }
    return await query.orderBy(systemModules.sortOrder);
  }

  async createSystemModule(module: any): Promise<any> {
    const [created] = await db.insert(systemModules).values(module).returning();
    return created;
  }

  async updateSystemModule(id: string, module: any): Promise<any> {
    const [updated] = await db
      .update(systemModules)
      .set({ ...module, updatedAt: new Date() })
      .where(eq(systemModules.id, id))
      .returning();
    return updated;
  }

  async getRolePermissions(schoolId: string, role?: string): Promise<any[]> {
    const conditions = [eq(rolePermissions.schoolId, schoolId), eq(rolePermissions.isActive, true)];
    if (role) {
      conditions.push(eq(rolePermissions.role, role));
    }
    return await db.select().from(rolePermissions).where(and(...conditions));
  }

  async setRolePermission(permission: any): Promise<any> {
    const [created] = await db.insert(rolePermissions).values(permission).returning();
    return created;
  }

  async updateRolePermission(id: string, permission: any): Promise<any> {
    const [updated] = await db
      .update(rolePermissions)
      .set({ ...permission, updatedAt: new Date() })
      .where(eq(rolePermissions.id, id))
      .returning();
    return updated;
  }

  async deleteRolePermission(id: string): Promise<void> {
    await db.delete(rolePermissions).where(eq(rolePermissions.id, id));
  }

  // Post operations for newsfeed system
  async getPosts(schoolId: string, feedScope?: 'school' | 'class', classId?: string, offset?: number, limit?: number): Promise<Post[]> {
    const conditions = [eq(posts.schoolId, schoolId), eq(posts.isActive, true)];
    
    if (feedScope) {
      conditions.push(eq(posts.feedScope, feedScope));
    }
    
    if (classId) {
      conditions.push(eq(posts.classId, classId));
    }
    
    let query = db
      .select({
        id: posts.id,
        content: posts.content,
        attachments: posts.attachments,
        postedById: posts.postedById,
        feedScope: posts.feedScope,
        classId: posts.classId,
        schoolId: posts.schoolId,
        isActive: posts.isActive,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        // Include author information
        authorName: sql<string>`CASE 
          WHEN ${users.role} = 'admin' THEN ${schools.name}
          ELSE COALESCE(${users.firstName}, '') || ' ' || COALESCE(${users.lastName}, '')
        END`.as('authorName'),
        authorRole: users.role,
      })
      .from(posts)
      .leftJoin(users, eq(posts.postedById, users.id))
      .leftJoin(schools, and(eq(users.schoolId, schools.id), eq(users.role, 'admin')))
      .where(and(...conditions))
      .orderBy(sql`${posts.createdAt} DESC`);
    
    // Add pagination if provided
    if (offset !== undefined) {
      query = query.offset(offset);
    }
    
    if (limit !== undefined) {
      query = query.limit(limit);
    }
    
    return await query;
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [created] = await db.insert(posts).values(post).returning();
    return created;
  }

  async updatePost(id: string, post: Partial<InsertPost>): Promise<Post> {
    const [updated] = await db
      .update(posts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return updated;
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async getPostsWithFileId(fileId: string): Promise<Post[]> {
    // Find posts that contain this fileId in their attachments array
    // Handle both old format (strings) and new format (objects with fileId property)
    return await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.isActive, true),
          sql`(
            ${posts.attachments} ? ${fileId} OR 
            EXISTS (
              SELECT 1 FROM jsonb_array_elements(${posts.attachments}) AS elem 
              WHERE elem->>'fileId' = ${fileId}
            )
          )`
        )
      );
  }

  // CRITICAL SECURITY: Class membership verification methods for file access control
  async isTeacherAssignedToClass(teacherId: string, classId: string): Promise<boolean> {
    try {
      const assignment = await db
        .select()
        .from(classSubjectAssignments)
        .where(
          and(
            eq(classSubjectAssignments.assignedTeacherId, teacherId),
            eq(classSubjectAssignments.classId, classId)
          )
        )
        .limit(1);
      return assignment.length > 0;
    } catch (error) {
      console.error("Error checking teacher class assignment:", error);
      return false; // Deny access on error for security
    }
  }

  async isStudentInClass(studentId: string, classId: string): Promise<boolean> {
    try {
      const student = await db
        .select()
        .from(students)
        .where(
          and(
            eq(students.id, studentId),
            eq(students.classId, classId),
            eq(students.isActive, true)
          )
        )
        .limit(1);
      return student.length > 0;
    } catch (error) {
      console.error("Error checking student class membership:", error);
      return false; // Deny access on error for security
    }
  }

  async isParentLinkedToClass(parentId: string, classId: string): Promise<boolean> {
    try {
      // Check if parent has any children in the specified class
      const parentChildren = await db
        .select()
        .from(studentParents)
        .innerJoin(students, eq(studentParents.studentId, students.id))
        .where(
          and(
            eq(studentParents.parentId, parentId),
            eq(students.classId, classId),
            eq(students.isActive, true)
          )
        )
        .limit(1);
      return parentChildren.length > 0;
    } catch (error) {
      console.error("Error checking parent class link:", error);
      return false; // Deny access on error for security
    }
  }

  async getUserFeed(userId: string): Promise<Post[]> {
    const user = await this.getUser(userId);
    if (!user || !user.schoolId) return [];

    const conditions = [eq(posts.schoolId, user.schoolId), eq(posts.isActive, true)];
    
    // Always include school-wide posts
    const schoolCondition = eq(posts.feedScope, 'school');
    
    // If user is a student, also include posts from their class
    let classCondition = null;
    if (user.role === 'student' && user.studentId) {
      // Get student's class
      const student = await db.select().from(students).where(eq(students.id, user.studentId));
      if (student[0]?.classId) {
        classCondition = and(eq(posts.feedScope, 'class'), eq(posts.classId, student[0].classId));
      }
    }
    
    // If user is a teacher, include posts from classes they teach
    if (user.role === 'teacher' && user.teacherId) {
      // Get classes where teacher is assigned
      const teacherClasses = await db
        .select({ classId: classSubjectAssignments.classId })
        .from(classSubjectAssignments)
        .where(eq(classSubjectAssignments.assignedTeacherId, user.teacherId));
      
      if (teacherClasses.length > 0) {
        const classIds = teacherClasses.map(c => c.classId).filter(Boolean);
        if (classIds.length > 0) {
          classCondition = and(eq(posts.feedScope, 'class'), inArray(posts.classId, classIds));
        }
      }
    }
    
    // If user is a parent, include posts from their children's classes
    if (user.role === 'parent' && user.parentId) {
      // Get parent's children and their classes
      const parentChildren = await db
        .select({ classId: students.classId })
        .from(studentParents)
        .innerJoin(students, eq(studentParents.studentId, students.id))
        .where(eq(studentParents.parentId, user.parentId));
      
      if (parentChildren.length > 0) {
        const classIds = parentChildren.map(c => c.classId).filter(Boolean);
        if (classIds.length > 0) {
          classCondition = and(eq(posts.feedScope, 'class'), inArray(posts.classId, classIds));
        }
      }
    }
    
    // Build final condition (school posts OR class posts)
    let finalCondition;
    if (classCondition) {
      finalCondition = and(...conditions, or(schoolCondition, classCondition));
    } else {
      finalCondition = and(...conditions, schoolCondition);
    }
    
    return await db
      .select()
      .from(posts)
      .where(finalCondition)
      .orderBy(sql`${posts.createdAt} DESC`);
  }

  async getUserModulePermissions(userId: string, schoolId?: string): Promise<{ moduleId: string; permissions: any }[]> {
    const user = await this.getUser(userId);
    if (!user) return [];

    // CRITICAL SECURITY: For non-super admins, only use their assigned schoolId
    const userSchoolId = user.role === 'super_admin' ? (schoolId || user.schoolId) : user.schoolId;
    if (!userSchoolId) return [];

    const permissions = await db
      .select({
        moduleId: rolePermissions.moduleId,
        permissions: rolePermissions.permissions,
      })
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.schoolId, userSchoolId),
          eq(rolePermissions.role, user.role),
          eq(rolePermissions.isActive, true)
        )
      );

    return permissions;
  }

  async checkUserPermission(userId: string, moduleId: string, action: 'read' | 'write' | 'delete' | 'export', schoolId?: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    // Super admins have all permissions
    if (user.role === 'super_admin') return true;

    // CRITICAL SECURITY: For non-super admins, ignore caller schoolId and use user's assigned school
    const userSchoolId = user.schoolId;
    if (!userSchoolId) return false;

    const [permission] = await db
      .select({ permissions: rolePermissions.permissions })
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.schoolId, userSchoolId),
          eq(rolePermissions.role, user.role),
          eq(rolePermissions.moduleId, moduleId),
          eq(rolePermissions.isActive, true)
        )
      );

    return permission?.permissions?.[action] || false;
  }

  // Student operations
  async getStudents(schoolId?: string, classId?: string, offset?: number, limit?: number): Promise<Student[]> {
    let query = db
      .select({
        id: students.id,
        admissionNumber: students.admissionNumber,
        firstName: students.firstName,
        lastName: students.lastName,
        email: students.email,
        contactNumber: students.contactNumber,
        dateOfBirth: students.dateOfBirth,
        gender: students.gender,
        address: students.address,
        classId: students.classId,
        schoolId: students.schoolId,
        rollNumber: students.rollNumber,
        bloodGroup: students.bloodGroup,
        guardianName: students.guardianName,
        guardianRelation: students.guardianRelation,
        guardianContact: students.guardianContact,
        emergencyContact: students.emergencyContact,
        medicalInfo: students.medicalInfo,
        profilePictureUrl: students.profilePictureUrl,
        isActive: students.isActive,
        status: students.status,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt,
        class: {
          id: classes.id,
          grade: classes.grade,
          section: classes.section,
          studentCount: classes.studentCount,
          schoolId: classes.schoolId,
          createdAt: classes.createdAt,
          updatedAt: classes.updatedAt,
        }
      })
      .from(students)
      .leftJoin(classes, eq(students.classId, classes.id));
    
    const conditions = [eq(students.isActive, true)];
    
    if (schoolId) {
      conditions.push(eq(students.schoolId, schoolId));
    }
    if (classId) {
      conditions.push(eq(students.classId, classId));
    }
    
    query = query.where(and(...conditions));
    
    if (offset !== undefined) {
      query = query.offset(offset);
    }
    if (limit !== undefined) {
      query = query.limit(limit);
    }
    
    const results = await query;
    
    // Return students with class data (null if no class assigned)
    return results.map(result => ({
      ...result,
      class: result.class && result.class.id ? result.class : null
    }));
  }

  async getStudent(id: string): Promise<any> {
    const [result] = await db
      .select({
        id: students.id,
        admissionNumber: students.admissionNumber,
        firstName: students.firstName,
        lastName: students.lastName,
        email: students.email,
        contactNumber: students.contactNumber,
        dateOfBirth: students.dateOfBirth,
        gender: students.gender,
        address: students.address,
        classId: students.classId,
        schoolId: students.schoolId,
        rollNumber: students.rollNumber,
        bloodGroup: students.bloodGroup,
        guardianName: students.guardianName,
        guardianRelation: students.guardianRelation,
        guardianContact: students.guardianContact,
        emergencyContact: students.emergencyContact,
        medicalInfo: students.medicalInfo,
        profilePictureUrl: students.profilePictureUrl,
        isActive: students.isActive,
        status: students.status,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt,
        class: {
          id: classes.id,
          grade: classes.grade,
          section: classes.section,
          studentCount: classes.studentCount,
          schoolId: classes.schoolId,
          createdAt: classes.createdAt,
          updatedAt: classes.updatedAt,
        }
      })
      .from(students)
      .leftJoin(classes, eq(students.classId, classes.id))
      .where(eq(students.id, id))
      .limit(1);
    
    if (!result) return undefined;
    
    // Return the student with class data (null if no class assigned)
    return {
      ...result,
      class: result.class && result.class.id ? result.class : null
    };
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [created] = await db.insert(students).values(student).returning();
    
    // Update student count for the class
    if (created.classId) {
      await this.updateClassStudentCount(created.classId);
    }
    
    return created;
  }

  async updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student> {
    // Get the original student data before update
    const originalStudent = await this.getStudent(id);
    
    const [updated] = await db
      .update(students)
      .set({ ...student, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    
    // Update student count for both old and new classes if class changed
    if (originalStudent?.classId && originalStudent.classId !== updated.classId) {
      await this.updateClassStudentCount(originalStudent.classId);
    }
    if (updated.classId) {
      await this.updateClassStudentCount(updated.classId);
    }
    
    return updated;
  }

  async deleteStudent(id: string): Promise<void> {
    // Get the student's class before deletion for count update
    const studentToDelete = await this.getStudent(id);
    
    await db.update(students).set({ isActive: false }).where(eq(students.id, id));
    
    // Update student count for the class
    if (studentToDelete?.classId) {
      await this.updateClassStudentCount(studentToDelete.classId);
    }
  }

  async getStudentsByClass(classId: string): Promise<Student[]> {
    return await db
      .select()
      .from(students)
      .where(and(eq(students.classId, classId), eq(students.isActive, true)));
  }

  // Helper function to recalculate and update student count for a class
  async updateClassStudentCount(classId: string): Promise<void> {
    const activeStudentCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(students)
      .where(and(eq(students.classId, classId), eq(students.isActive, true)));
    
    const count = activeStudentCount[0]?.count || 0;
    
    await db
      .update(classes)
      .set({ studentCount: count })
      .where(eq(classes.id, classId));
  }

  // Parent operations
  async getParents(schoolId?: string): Promise<Parent[]> {
    let query = db.select().from(parents);
    const conditions = [eq(parents.isActive, true)];
    
    if (schoolId) {
      conditions.push(eq(parents.schoolId, schoolId));
    }
    
    return await query.where(and(...conditions));
  }

  async getParent(id: string): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.id, id));
    return parent;
  }

  async createParent(parent: InsertParent): Promise<Parent> {
    const [created] = await db.insert(parents).values(parent).returning();
    return created;
  }

  async updateParent(id: string, parent: Partial<InsertParent>): Promise<Parent> {
    const [updated] = await db
      .update(parents)
      .set({ ...parent, updatedAt: new Date() })
      .where(eq(parents.id, id))
      .returning();
    return updated;
  }

  async deleteParent(id: string): Promise<void> {
    await db.update(parents).set({ isActive: false }).where(eq(parents.id, id));
  }

  // Student-Parent relationship operations
  async linkStudentToParent(studentId: string, parentId: string): Promise<StudentParent> {
    const [created] = await db.insert(studentParents).values({
      studentId,
      parentId
    }).returning();
    return created;
  }

  async unlinkStudentFromParent(studentId: string, parentId: string): Promise<void> {
    await db.delete(studentParents).where(
      and(
        eq(studentParents.studentId, studentId),
        eq(studentParents.parentId, parentId)
      )
    );
  }

  async getParentChildren(parentId: string): Promise<Student[]> {
    return await db
      .select({
        id: students.id,
        admissionNumber: students.admissionNumber,
        firstName: students.firstName,
        lastName: students.lastName,
        email: students.email,
        phoneNumber: students.phoneNumber,
        address: students.address,
        dateOfBirth: students.dateOfBirth,
        gender: students.gender,
        bloodGroup: students.bloodGroup,
        classId: students.classId,
        rollNumber: students.rollNumber,
        emergencyContactName: students.emergencyContactName,
        emergencyContactPhone: students.emergencyContactPhone,
        medicalInfo: students.medicalInfo,
        transportInfo: students.transportInfo,
        photo: students.photo,
        schoolId: students.schoolId,
        isActive: students.isActive,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt
      })
      .from(studentParents)
      .innerJoin(students, eq(studentParents.studentId, students.id))
      .where(and(
        eq(studentParents.parentId, parentId),
        eq(students.isActive, true)
      ));
  }

  async getStudentParents(studentId: string): Promise<Parent[]> {
    return await db
      .select({
        id: parents.id,
        firstName: parents.firstName,
        lastName: parents.lastName,
        email: parents.email,
        contactNumber: parents.contactNumber,
        alternateContact: parents.alternateContact,
        address: parents.address,
        occupation: parents.occupation,
        relationToStudent: parents.relationToStudent,
        schoolId: parents.schoolId,
        isActive: parents.isActive,
        createdAt: parents.createdAt,
        updatedAt: parents.updatedAt
      })
      .from(studentParents)
      .innerJoin(parents, eq(studentParents.parentId, parents.id))
      .where(and(
        eq(studentParents.studentId, studentId),
        eq(parents.isActive, true)
      ));
  }

  async getStudentParentsWithDetails(studentId: string): Promise<(StudentParent & { parent: Parent })[]> {
    const results = await db
      .select({
        // StudentParent fields
        id: studentParents.id,
        studentId: studentParents.studentId,
        parentId: studentParents.parentId,
        isPrimary: studentParents.isPrimary,
        spCreatedAt: studentParents.createdAt,
        // Parent fields
        parentData_id: parents.id,
        parentData_firstName: parents.firstName,
        parentData_lastName: parents.lastName,
        parentData_email: parents.email,
        parentData_contactNumber: parents.contactNumber,
        parentData_alternateContact: parents.alternateContact,
        parentData_address: parents.address,
        parentData_occupation: parents.occupation,
        parentData_relationToStudent: parents.relationToStudent,
        parentData_schoolId: parents.schoolId,
        parentData_isActive: parents.isActive,
        parentData_createdAt: parents.createdAt,
        parentData_updatedAt: parents.updatedAt
      })
      .from(studentParents)
      .innerJoin(parents, eq(studentParents.parentId, parents.id))
      .where(and(
        eq(studentParents.studentId, studentId),
        eq(parents.isActive, true)
      ));

    // Transform the flattened result into the expected structure
    return results.map(row => ({
      id: row.id,
      studentId: row.studentId,
      parentId: row.parentId,
      isPrimary: row.isPrimary,
      createdAt: row.spCreatedAt,
      parent: {
        id: row.parentData_id,
        firstName: row.parentData_firstName,
        lastName: row.parentData_lastName,
        email: row.parentData_email,
        contactNumber: row.parentData_contactNumber,
        alternateContact: row.parentData_alternateContact,
        address: row.parentData_address,
        occupation: row.parentData_occupation,
        relationToStudent: row.parentData_relationToStudent,
        schoolId: row.parentData_schoolId,
        isActive: row.parentData_isActive,
        createdAt: row.parentData_createdAt,
        updatedAt: row.parentData_updatedAt
      }
    }));
  }

  async getStudentCredentials(studentId: string): Promise<{ studentLogin: { loginId: string; temporaryPassword?: string; hasTemporaryPassword: boolean; expiresAt: string | null; } | null; parentLogin: { loginId: string; temporaryPassword?: string; hasTemporaryPassword: boolean; expiresAt: string | null; } | null; }> {
    // Get student user account
    const [studentUser] = await db
      .select({
        loginId: users.loginId,
        temporaryPassword: users.temporaryPasswordPlainText,
        hasTemporaryPassword: sql<boolean>`${users.temporaryPassword} IS NOT NULL`,
        temporaryPasswordExpiresAt: users.temporaryPasswordExpiresAt
      })
      .from(users)
      .where(and(
        eq(users.studentId, studentId),
        eq(users.role, 'student'),
        eq(users.isActive, true)
      ));

    // Get student admission number for parent login
    const [student] = await db
      .select({ admissionNumber: students.admissionNumber })
      .from(students)
      .where(eq(students.id, studentId));

    let parentUser = null;
    if (student) {
      // Parent login ID follows pattern: P + admission number
      const parentLoginId = `P${student.admissionNumber}`;
      
      const [foundParentUser] = await db
        .select({
          loginId: users.loginId,
          temporaryPassword: users.temporaryPasswordPlainText,
          hasTemporaryPassword: sql<boolean>`${users.temporaryPassword} IS NOT NULL`,
          temporaryPasswordExpiresAt: users.temporaryPasswordExpiresAt
        })
        .from(users)
        .where(and(
          eq(users.loginId, parentLoginId),
          eq(users.role, 'parent'),
          eq(users.isActive, true)
        ));
      
      parentUser = foundParentUser || null;
    }

    return {
      studentLogin: studentUser ? {
        loginId: studentUser.loginId,
        temporaryPassword: studentUser.temporaryPassword || undefined,
        hasTemporaryPassword: studentUser.hasTemporaryPassword,
        expiresAt: studentUser.temporaryPasswordExpiresAt?.toISOString() || null
      } : null,
      parentLogin: parentUser ? {
        loginId: parentUser.loginId,
        temporaryPassword: parentUser.temporaryPassword || undefined,
        hasTemporaryPassword: parentUser.hasTemporaryPassword,
        expiresAt: parentUser.temporaryPasswordExpiresAt?.toISOString() || null
      } : null
    };
  }

  async refreshStudentCredentials(studentId: string): Promise<{ studentLogin: { loginId: string; temporaryPassword: string; }; parentLogin: { loginId: string; temporaryPassword: string; }; }> {
    // Get student details
    const [student] = await db
      .select({
        id: students.id,
        admissionNumber: students.admissionNumber,
        schoolId: students.schoolId,
        firstName: students.firstName,
        lastName: students.lastName,
        email: students.email
      })
      .from(students)
      .where(eq(students.id, studentId));

    if (!student) {
      throw new Error('Student not found');
    }

    // Generate temporary passwords
    const studentTempPassword = generateTemporaryPassword();
    const parentTempPassword = generateTemporaryPassword();
    
    // Hash temporary passwords for secure storage
    const hashedStudentTempPassword = await bcrypt.hash(studentTempPassword, 12);
    const hashedParentTempPassword = await bcrypt.hash(parentTempPassword, 12);
    
    // Generate expiry dates (48 hours from now)
    const tempPasswordExpiry = generateTemporaryPasswordExpiry();

    // Create or update student user account
    const studentLoginId = student.admissionNumber;
    const [existingStudentUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(
        eq(users.loginId, studentLoginId),
        eq(users.role, 'student'),
        eq(users.schoolId, student.schoolId)
      ));

    if (existingStudentUser) {
      // Update existing student user
      await db
        .update(users)
        .set({
          temporaryPassword: hashedStudentTempPassword,
          temporaryPasswordPlainText: studentTempPassword,
          temporaryPasswordExpiresAt: tempPasswordExpiry,
          isFirstLogin: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, existingStudentUser.id));
    } else {
      // Create new student user
      await db.insert(users).values({
        email: student.email || null,
        loginId: studentLoginId,
        passwordHash: await bcrypt.hash('default-password-please-change', 12), // Default password hash
        temporaryPassword: hashedStudentTempPassword,
        temporaryPasswordPlainText: studentTempPassword,
        temporaryPasswordExpiresAt: tempPasswordExpiry,
        role: 'student',
        schoolId: student.schoolId,
        studentId: student.id,
        isFirstLogin: true,
        isActive: true
      });
    }

    // Create or update parent user account
    const parentLoginId = `P${student.admissionNumber}`;
    const [existingParentUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(
        eq(users.loginId, parentLoginId),
        eq(users.role, 'parent'),
        eq(users.schoolId, student.schoolId)
      ));

    if (existingParentUser) {
      // Update existing parent user
      await db
        .update(users)
        .set({
          temporaryPassword: hashedParentTempPassword,
          temporaryPasswordPlainText: parentTempPassword,
          temporaryPasswordExpiresAt: tempPasswordExpiry,
          isFirstLogin: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, existingParentUser.id));
    } else {
      // Create new parent user
      await db.insert(users).values({
        email: null, // Parent email can be set later through profile
        loginId: parentLoginId,
        passwordHash: await bcrypt.hash('default-password-please-change', 12), // Default password hash
        temporaryPassword: hashedParentTempPassword,
        temporaryPasswordPlainText: parentTempPassword,
        temporaryPasswordExpiresAt: tempPasswordExpiry,
        role: 'parent',
        schoolId: student.schoolId,
        isFirstLogin: true,
        isActive: true
      });
    }

    return {
      studentLogin: {
        loginId: studentLoginId,
        temporaryPassword: studentTempPassword
      },
      parentLogin: {
        loginId: parentLoginId,
        temporaryPassword: parentTempPassword
      }
    };
  }

  async getStudentByAdmissionNumber(admissionNumber: string, schoolId: string): Promise<Student | undefined> {
    const [student] = await db
      .select()
      .from(students)
      .where(and(
        eq(students.admissionNumber, admissionNumber),
        eq(students.schoolId, schoolId),
        eq(students.isActive, true)
      ));
    return student;
  }

  async linkParentToStudent(parentId: string, studentId: string): Promise<StudentParent> {
    const [created] = await db.insert(studentParents).values({
      studentId,
      parentId
    }).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();