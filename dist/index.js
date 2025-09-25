var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  auditLogs: () => auditLogs,
  auditLogsRelations: () => auditLogsRelations,
  bulkAttendanceSchema: () => bulkAttendanceSchema,
  classSubjectAssignments: () => classSubjectAssignments,
  classSubjectAssignmentsRelations: () => classSubjectAssignmentsRelations,
  classTeacherAssignments: () => classTeacherAssignments,
  classTeacherAssignmentsRelations: () => classTeacherAssignmentsRelations,
  classes: () => classes,
  classesRelations: () => classesRelations,
  createAndAssignSubjectSchema: () => createAndAssignSubjectSchema,
  insertAuditLogSchema: () => insertAuditLogSchema,
  insertClassSchema: () => insertClassSchema,
  insertClassSubjectAssignmentSchema: () => insertClassSubjectAssignmentSchema,
  insertClassTeacherAssignmentSchema: () => insertClassTeacherAssignmentSchema,
  insertManualAssignmentAuditSchema: () => insertManualAssignmentAuditSchema,
  insertParentSchema: () => insertParentSchema,
  insertPostSchema: () => insertPostSchema,
  insertRolePermissionSchema: () => insertRolePermissionSchema,
  insertSchoolSchema: () => insertSchoolSchema,
  insertStudentAttendanceSchema: () => insertStudentAttendanceSchema,
  insertStudentParentSchema: () => insertStudentParentSchema,
  insertStudentSchema: () => insertStudentSchema,
  insertSubjectSchema: () => insertSubjectSchema,
  insertSubstitutionSchema: () => insertSubstitutionSchema,
  insertSystemModuleSchema: () => insertSystemModuleSchema,
  insertTeacherAttendanceSchema: () => insertTeacherAttendanceSchema,
  insertTeacherReplacementSchema: () => insertTeacherReplacementSchema,
  insertTeacherSchema: () => insertTeacherSchema,
  insertTimetableChangeSchema: () => insertTimetableChangeSchema,
  insertTimetableEntrySchema: () => insertTimetableEntrySchema,
  insertTimetableStructureSchema: () => insertTimetableStructureSchema,
  insertTimetableValidityPeriodSchema: () => insertTimetableValidityPeriodSchema,
  insertTimetableVersionSchema: () => insertTimetableVersionSchema,
  insertUserSchema: () => insertUserSchema,
  insertWeeklyTimetableSchema: () => insertWeeklyTimetableSchema,
  loginSchema: () => loginSchema,
  manualAssignmentAudits: () => manualAssignmentAudits,
  parents: () => parents,
  parentsRelations: () => parentsRelations,
  posts: () => posts,
  rolePermissions: () => rolePermissions,
  rolePermissionsRelations: () => rolePermissionsRelations,
  schools: () => schools,
  schoolsRelations: () => schoolsRelations,
  studentAttendance: () => studentAttendance,
  studentAttendanceRelations: () => studentAttendanceRelations,
  studentParents: () => studentParents,
  studentParentsRelations: () => studentParentsRelations,
  students: () => students,
  studentsRelations: () => studentsRelations,
  subjects: () => subjects,
  subjectsRelations: () => subjectsRelations,
  substitutions: () => substitutions,
  substitutionsRelations: () => substitutionsRelations,
  systemModules: () => systemModules,
  systemModulesRelations: () => systemModulesRelations,
  teacherAttendance: () => teacherAttendance,
  teacherAttendanceRelations: () => teacherAttendanceRelations,
  teacherReplacements: () => teacherReplacements,
  teacherReplacementsRelations: () => teacherReplacementsRelations,
  teachers: () => teachers,
  teachersRelations: () => teachersRelations,
  timetableChanges: () => timetableChanges,
  timetableChangesRelations: () => timetableChangesRelations,
  timetableEntries: () => timetableEntries,
  timetableEntriesRelations: () => timetableEntriesRelations,
  timetableStructures: () => timetableStructures,
  timetableStructuresRelations: () => timetableStructuresRelations,
  timetableValidityPeriods: () => timetableValidityPeriods,
  timetableValidityPeriodsRelations: () => timetableValidityPeriodsRelations,
  timetableVersions: () => timetableVersions,
  timetableVersionsRelations: () => timetableVersionsRelations,
  updateClassSchema: () => updateClassSchema,
  updatePostSchema: () => updatePostSchema,
  updateTeacherDailyPeriodsSchema: () => updateTeacherDailyPeriodsSchema,
  users: () => users,
  usersRelations: () => usersRelations,
  weeklyTimetables: () => weeklyTimetables,
  weeklyTimetablesRelations: () => weeklyTimetablesRelations
});
import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  jsonb,
  boolean,
  uuid,
  index,
  date
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var schools, users, students, parents, studentParents, systemModules, rolePermissions, teachers, subjects, classes, classSubjectAssignments, timetableVersions, timetableEntries, timetableValidityPeriods, substitutions, timetableChanges, timetableStructures, weeklyTimetables, classTeacherAssignments, teacherAttendance, studentAttendance, auditLogs, schoolsRelations, usersRelations, studentsRelations, parentsRelations, studentParentsRelations, systemModulesRelations, rolePermissionsRelations, teachersRelations, subjectsRelations, classesRelations, classSubjectAssignmentsRelations, timetableVersionsRelations, timetableEntriesRelations, substitutionsRelations, timetableChangesRelations, timetableValidityPeriodsRelations, timetableStructuresRelations, teacherAttendanceRelations, studentAttendanceRelations, classTeacherAssignmentsRelations, auditLogsRelations, weeklyTimetablesRelations, insertSchoolSchema, insertUserSchema, loginSchema, insertTeacherSchema, insertStudentSchema, insertParentSchema, insertStudentParentSchema, insertSystemModuleSchema, insertRolePermissionSchema, insertSubjectSchema, createAndAssignSubjectSchema, insertClassSchema, updateClassSchema, insertTimetableEntrySchema, insertWeeklyTimetableSchema, insertSubstitutionSchema, insertTimetableChangeSchema, insertTimetableValidityPeriodSchema, insertClassSubjectAssignmentSchema, insertTimetableStructureSchema, insertTimetableVersionSchema, insertClassTeacherAssignmentSchema, manualAssignmentAudits, teacherReplacements, teacherReplacementsRelations, insertManualAssignmentAuditSchema, insertTeacherReplacementSchema, insertTeacherAttendanceSchema, insertStudentAttendanceSchema, insertAuditLogSchema, updateTeacherDailyPeriodsSchema, bulkAttendanceSchema, posts, insertPostSchema, updatePostSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    schools = pgTable("schools", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name", { length: 255 }).notNull(),
      address: text("address"),
      contactPhone: varchar("contact_phone", { length: 15 }),
      adminName: varchar("admin_name", { length: 255 }),
      isActive: boolean("is_active").notNull().default(true),
      timetableFrozen: boolean("timetable_frozen").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      email: varchar("email", { length: 255 }),
      loginId: varchar("login_id", { length: 255 }).notNull().unique(),
      // Employee ID, Admission Number, or P+AdmissionNumber
      passwordHash: varchar("password_hash", { length: 255 }).notNull(),
      temporaryPassword: varchar("temporary_password", { length: 255 }),
      // Hashed temporary password
      temporaryPasswordPlainText: varchar("temporary_password_plain_text", { length: 255 }),
      // Plain text for admin sharing (cleared on first login)
      temporaryPasswordExpiresAt: timestamp("temporary_password_expires_at"),
      // Expiry timestamp for temporary password
      role: varchar("role", { enum: ["super_admin", "admin", "teacher", "student", "parent"] }).notNull().default("teacher"),
      isFirstLogin: boolean("is_first_login").notNull().default(true),
      // Force password change on first login
      schoolId: uuid("school_id").references(() => schools.id, { onDelete: "cascade" }),
      teacherId: uuid("teacher_id").references(() => teachers.id, { onDelete: "set null" }),
      studentId: uuid("student_id").references(() => students.id, { onDelete: "set null" }),
      parentId: uuid("parent_id").references(() => parents.id, { onDelete: "set null" }),
      firstName: varchar("first_name", { length: 255 }),
      lastName: varchar("last_name", { length: 255 }),
      passwordChangedAt: timestamp("password_changed_at"),
      lastLoginAt: timestamp("last_login_at"),
      isActive: boolean("is_active").notNull().default(true),
      createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
      // Self-reference to user who created this user
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    students = pgTable("students", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      admissionNumber: varchar("admission_number", { length: 50 }).notNull().unique(),
      firstName: varchar("first_name", { length: 255 }).notNull(),
      lastName: varchar("last_name", { length: 255 }).notNull(),
      email: varchar("email", { length: 255 }),
      contactNumber: varchar("contact_number", { length: 15 }),
      dateOfBirth: date("date_of_birth"),
      gender: varchar("gender", { enum: ["male", "female", "other"] }),
      address: text("address"),
      classId: uuid("class_id").references(() => classes.id, { onDelete: "set null" }),
      schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
      rollNumber: varchar("roll_number", { length: 20 }),
      bloodGroup: varchar("blood_group", { length: 5 }),
      guardianName: varchar("guardian_name", { length: 255 }),
      guardianRelation: varchar("guardian_relation", { length: 50 }),
      guardianContact: varchar("guardian_contact", { length: 15 }),
      emergencyContact: varchar("emergency_contact", { length: 15 }),
      medicalInfo: text("medical_info"),
      isActive: boolean("is_active").notNull().default(true),
      status: varchar("status", { enum: ["active", "inactive", "graduated", "transferred"] }).notNull().default("active"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    parents = pgTable("parents", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      firstName: varchar("first_name", { length: 255 }).notNull(),
      lastName: varchar("last_name", { length: 255 }).notNull(),
      email: varchar("email", { length: 255 }),
      contactNumber: varchar("contact_number", { length: 15 }).notNull(),
      alternateContact: varchar("alternate_contact", { length: 15 }),
      address: text("address").notNull(),
      occupation: varchar("occupation", { length: 255 }),
      relationToStudent: varchar("relation_to_student", { enum: ["father", "mother", "guardian", "other"] }).notNull(),
      schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    studentParents = pgTable("student_parents", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
      parentId: uuid("parent_id").notNull().references(() => parents.id, { onDelete: "cascade" }),
      isPrimary: boolean("is_primary").notNull().default(false),
      // Primary contact parent
      createdAt: timestamp("created_at").defaultNow()
    });
    systemModules = pgTable("system_modules", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name", { length: 255 }).notNull().unique(),
      displayName: varchar("display_name", { length: 255 }).notNull(),
      description: text("description"),
      routePath: varchar("route_path", { length: 500 }),
      // Frontend route path
      category: varchar("category", { length: 100 }),
      // Group modules by category
      icon: varchar("icon", { length: 100 }),
      // Icon name for UI
      isActive: boolean("is_active").notNull().default(true),
      sortOrder: integer("sort_order").default(0),
      // For ordering in UI
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    rolePermissions = pgTable("role_permissions", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
      role: varchar("role", { enum: ["admin", "teacher", "student", "parent"] }).notNull(),
      moduleId: uuid("module_id").notNull().references(() => systemModules.id, { onDelete: "cascade" }),
      permissions: jsonb("permissions").$type().notNull().default(sql`'{"read": true, "write": false, "delete": false, "export": false}'::jsonb`),
      isActive: boolean("is_active").notNull().default(true),
      assignedBy: varchar("assigned_by").notNull().references(() => users.id, { onDelete: "cascade" }),
      // Super admin who assigned
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    teachers = pgTable("teachers", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      employeeId: varchar("employee_id", { length: 50 }).notNull().unique(),
      // Used for login
      name: varchar("name", { length: 255 }).notNull(),
      email: varchar("email", { length: 255 }),
      contactNumber: varchar("contact_number", { length: 15 }),
      schoolIdNumber: varchar("school_id_number", { length: 50 }),
      // New fields from the redesign
      aadhar: varchar("aadhar", { length: 12 }),
      // Aadhar number
      gender: varchar("gender", { enum: ["male", "female", "other"] }),
      bloodGroup: varchar("blood_group", { length: 5 }),
      // A+, B-, O+, etc.
      designation: varchar("designation", { length: 100 }),
      // Teacher designation/position
      dateOfBirth: date("date_of_birth"),
      fatherHusbandName: varchar("father_husband_name", { length: 255 }),
      address: text("address"),
      category: varchar("category", { length: 50 }),
      // general, obc, sc, st, etc.
      religion: varchar("religion", { length: 50 }),
      profilePictureUrl: varchar("profile_picture_url", { length: 500 }),
      // Path to profile picture
      subjects: jsonb("subjects").$type().notNull().default(sql`'[]'::jsonb`),
      classes: jsonb("classes").$type().notNull().default(sql`'[]'::jsonb`),
      availability: jsonb("availability").$type().notNull().default(sql`'{"monday":[],"tuesday":[],"wednesday":[],"thursday":[],"friday":[],"saturday":[]}'::jsonb`),
      maxLoad: integer("max_load").notNull().default(30),
      maxDailyPeriods: integer("max_daily_periods").notNull().default(6),
      // Maximum periods per day
      schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
      isActive: boolean("is_active").notNull().default(true),
      status: varchar("status", { enum: ["active", "inactive", "left_school"] }).notNull().default("active"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    subjects = pgTable("subjects", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name", { length: 255 }).notNull(),
      code: varchar("code", { length: 10 }).notNull(),
      periodsPerWeek: integer("periods_per_week").notNull(),
      color: varchar("color", { length: 7 }).notNull().default("#3B82F6"),
      schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    classes = pgTable("classes", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      grade: varchar("grade", { length: 50 }).notNull(),
      section: varchar("section", { length: 10 }).notNull(),
      studentCount: integer("student_count").notNull().default(0),
      requiredSubjects: jsonb("required_subjects").$type().notNull().default(sql`'[]'::jsonb`),
      schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
      room: varchar("room", { length: 100 }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    classSubjectAssignments = pgTable("class_subject_assignments", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
      subjectId: uuid("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
      weeklyFrequency: integer("weekly_frequency").notNull(),
      // How many periods per week
      assignedTeacherId: uuid("assigned_teacher_id").references(() => teachers.id, { onDelete: "set null" }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    timetableVersions = pgTable("timetable_versions", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
      version: varchar("version", { length: 10 }).notNull(),
      // v0.1, v0.2, etc.
      weekStart: date("week_start").notNull(),
      weekEnd: date("week_end").notNull(),
      isActive: boolean("is_active").notNull().default(false),
      // Only one version can be active per class per week
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    timetableEntries = pgTable("timetable_entries", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
      teacherId: uuid("teacher_id").notNull().references(() => teachers.id, { onDelete: "cascade" }),
      subjectId: uuid("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
      day: varchar("day", { enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] }).notNull(),
      period: integer("period").notNull(),
      // 1-8 for different time slots
      startTime: varchar("start_time", { length: 5 }).notNull(),
      // "09:00"
      endTime: varchar("end_time", { length: 5 }).notNull(),
      // "09:45"
      room: varchar("room", { length: 100 }),
      versionId: uuid("version_id").references(() => timetableVersions.id, { onDelete: "cascade" }),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    timetableValidityPeriods = pgTable("timetable_validity_periods", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
      validFrom: date("valid_from").notNull(),
      validTo: date("valid_to").notNull(),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    substitutions = pgTable("substitutions", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      originalTeacherId: uuid("original_teacher_id").notNull().references(() => teachers.id),
      substituteTeacherId: uuid("substitute_teacher_id").references(() => teachers.id),
      timetableEntryId: uuid("timetable_entry_id").notNull().references(() => timetableEntries.id, { onDelete: "cascade" }),
      date: timestamp("date").notNull(),
      reason: text("reason"),
      status: varchar("status", { enum: ["pending", "confirmed", "rejected", "auto_assigned"] }).notNull().default("pending"),
      isAutoGenerated: boolean("is_auto_generated").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    timetableChanges = pgTable("timetable_changes", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      timetableEntryId: uuid("timetable_entry_id").notNull().references(() => timetableEntries.id, { onDelete: "cascade" }),
      changeType: varchar("change_type", { enum: ["substitution", "cancellation", "room_change", "time_change"] }).notNull(),
      changeDate: date("change_date").notNull(),
      originalTeacherId: uuid("original_teacher_id").references(() => teachers.id),
      newTeacherId: uuid("new_teacher_id").references(() => teachers.id),
      originalRoom: varchar("original_room", { length: 100 }),
      newRoom: varchar("new_room", { length: 100 }),
      reason: text("reason").notNull(),
      changeSource: varchar("change_source", { enum: ["manual", "auto_absence", "auto_substitution"] }).notNull(),
      approvedBy: varchar("approved_by").references(() => users.id),
      approvedAt: timestamp("approved_at"),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    timetableStructures = pgTable("timetable_structures", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
      periodsPerDay: integer("periods_per_day").notNull().default(8),
      workingDays: jsonb("working_days").$type().notNull().default(sql`'["monday","tuesday","wednesday","thursday","friday","saturday"]'::jsonb`),
      timeSlots: jsonb("time_slots").$type().notNull().default(sql`'[{"period":1,"startTime":"07:30","endTime":"08:15"},{"period":2,"startTime":"08:15","endTime":"09:00"},{"period":3,"startTime":"09:00","endTime":"09:45"},{"period":4,"startTime":"09:45","endTime":"10:15"},{"period":5,"startTime":"10:15","endTime":"11:00","isBreak":true},{"period":6,"startTime":"11:00","endTime":"11:45"},{"period":7,"startTime":"11:45","endTime":"12:30"},{"period":8,"startTime":"12:30","endTime":"13:15"}]'::jsonb`),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    weeklyTimetables = pgTable("weekly_timetables", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
      weekStart: date("week_start").notNull(),
      // Monday of the week
      weekEnd: date("week_end").notNull(),
      // Sunday of the week  
      timetableData: jsonb("timetable_data").$type().notNull().default(sql`'[]'::jsonb`),
      modifiedBy: varchar("modified_by").notNull().references(() => users.id, { onDelete: "cascade" }),
      modificationCount: integer("modification_count").notNull().default(1),
      // Track number of changes made
      basedOnGlobalVersion: varchar("based_on_global_version"),
      // Track which global version this was based on
      schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => ({
      // Ensure only one active weekly timetable per class per week
      classWeekIdx: index("class_week_idx").on(table.classId, table.weekStart)
    }));
    classTeacherAssignments = pgTable("class_teacher_assignments", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
      teacherId: uuid("teacher_id").notNull().references(() => teachers.id, { onDelete: "cascade" }),
      role: varchar("role", { enum: ["primary", "co_class"] }).notNull(),
      // primary = Primary Class Teacher, co_class = Co-Class Teacher
      isPrimary: boolean("is_primary").notNull().default(false),
      // Only one primary teacher per class
      privileges: jsonb("privileges").$type().notNull().default(sql`'{"attendance": true, "classFeedPosting": true, "parentCommunication": true, "leaveApproval": true}'::jsonb`),
      assignedBy: varchar("assigned_by").notNull().references(() => users.id, { onDelete: "cascade" }),
      // School admin who assigned
      schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    teacherAttendance = pgTable("teacher_attendance", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      teacherId: uuid("teacher_id").notNull().references(() => teachers.id, { onDelete: "cascade" }),
      schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
      attendanceDate: date("attendance_date").notNull(),
      status: varchar("status", { enum: ["present", "absent", "late", "on_leave", "medical_leave", "personal_leave"] }).notNull().default("present"),
      reason: text("reason"),
      // Reason for absence or leave
      leaveStartDate: date("leave_start_date"),
      // For multi-day leave tracking
      leaveEndDate: date("leave_end_date"),
      // For multi-day leave tracking
      isFullDay: boolean("is_full_day").notNull().default(true),
      // For half-day leaves
      markedBy: varchar("marked_by").references(() => users.id),
      // Who marked the attendance
      markedAt: timestamp("marked_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    studentAttendance = pgTable("student_attendance", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
      schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
      classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
      attendanceDate: date("attendance_date").notNull(),
      status: varchar("status", { enum: ["present", "absent", "late", "excused"] }).notNull().default("present"),
      reason: text("reason"),
      // Reason for absence
      markedBy: varchar("marked_by").references(() => users.id),
      // Who marked the attendance
      markedAt: timestamp("marked_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    auditLogs = pgTable("audit_logs", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      action: varchar("action", { length: 100 }).notNull(),
      // CREATE, UPDATE, DELETE, SUBSTITUTE
      entityType: varchar("entity_type", { length: 50 }).notNull(),
      // TEACHER, TIMETABLE_ENTRY, SUBSTITUTION
      entityId: varchar("entity_id", { length: 36 }).notNull(),
      previousValues: jsonb("previous_values"),
      newValues: jsonb("new_values"),
      description: text("description"),
      createdAt: timestamp("created_at").defaultNow()
    });
    schoolsRelations = relations(schools, ({ many }) => ({
      users: many(users),
      teachers: many(teachers),
      students: many(students),
      parents: many(parents),
      subjects: many(subjects),
      classes: many(classes),
      timetableStructures: many(timetableStructures),
      weeklyTimetables: many(weeklyTimetables),
      rolePermissions: many(rolePermissions)
    }));
    usersRelations = relations(users, ({ one }) => ({
      school: one(schools, {
        fields: [users.schoolId],
        references: [schools.id]
      }),
      teacher: one(teachers, {
        fields: [users.teacherId],
        references: [teachers.id]
      }),
      student: one(students, {
        fields: [users.studentId],
        references: [students.id]
      }),
      parent: one(parents, {
        fields: [users.parentId],
        references: [parents.id]
      }),
      createdByUser: one(users, {
        fields: [users.createdBy],
        references: [users.id]
      })
    }));
    studentsRelations = relations(students, ({ one, many }) => ({
      school: one(schools, {
        fields: [students.schoolId],
        references: [schools.id]
      }),
      class: one(classes, {
        fields: [students.classId],
        references: [classes.id]
      }),
      user: one(users),
      studentParents: many(studentParents),
      attendanceRecords: many(studentAttendance)
    }));
    parentsRelations = relations(parents, ({ one, many }) => ({
      school: one(schools, {
        fields: [parents.schoolId],
        references: [schools.id]
      }),
      user: one(users),
      studentParents: many(studentParents)
    }));
    studentParentsRelations = relations(studentParents, ({ one }) => ({
      student: one(students, {
        fields: [studentParents.studentId],
        references: [students.id]
      }),
      parent: one(parents, {
        fields: [studentParents.parentId],
        references: [parents.id]
      })
    }));
    systemModulesRelations = relations(systemModules, ({ many }) => ({
      rolePermissions: many(rolePermissions)
    }));
    rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
      school: one(schools, {
        fields: [rolePermissions.schoolId],
        references: [schools.id]
      }),
      module: one(systemModules, {
        fields: [rolePermissions.moduleId],
        references: [systemModules.id]
      }),
      assignedByUser: one(users, {
        fields: [rolePermissions.assignedBy],
        references: [users.id]
      })
    }));
    teachersRelations = relations(teachers, ({ one, many }) => ({
      school: one(schools, {
        fields: [teachers.schoolId],
        references: [schools.id]
      }),
      user: one(users),
      timetableEntries: many(timetableEntries),
      originalSubstitutions: many(substitutions, { relationName: "originalTeacher" }),
      substituteSubstitutions: many(substitutions, { relationName: "substituteTeacher" }),
      attendanceRecords: many(teacherAttendance),
      classTeacherAssignments: many(classTeacherAssignments)
    }));
    subjectsRelations = relations(subjects, ({ one, many }) => ({
      school: one(schools, {
        fields: [subjects.schoolId],
        references: [schools.id]
      }),
      timetableEntries: many(timetableEntries)
    }));
    classesRelations = relations(classes, ({ one, many }) => ({
      school: one(schools, {
        fields: [classes.schoolId],
        references: [schools.id]
      }),
      students: many(students),
      timetableEntries: many(timetableEntries),
      timetableValidityPeriods: many(timetableValidityPeriods),
      classSubjectAssignments: many(classSubjectAssignments),
      timetableVersions: many(timetableVersions),
      weeklyTimetables: many(weeklyTimetables),
      classTeacherAssignments: many(classTeacherAssignments),
      studentAttendanceRecords: many(studentAttendance)
    }));
    classSubjectAssignmentsRelations = relations(classSubjectAssignments, ({ one }) => ({
      class: one(classes, {
        fields: [classSubjectAssignments.classId],
        references: [classes.id]
      }),
      subject: one(subjects, {
        fields: [classSubjectAssignments.subjectId],
        references: [subjects.id]
      }),
      assignedTeacher: one(teachers, {
        fields: [classSubjectAssignments.assignedTeacherId],
        references: [teachers.id]
      })
    }));
    timetableVersionsRelations = relations(timetableVersions, ({ one, many }) => ({
      class: one(classes, {
        fields: [timetableVersions.classId],
        references: [classes.id]
      }),
      timetableEntries: many(timetableEntries)
    }));
    timetableEntriesRelations = relations(timetableEntries, ({ one, many }) => ({
      class: one(classes, {
        fields: [timetableEntries.classId],
        references: [classes.id]
      }),
      teacher: one(teachers, {
        fields: [timetableEntries.teacherId],
        references: [teachers.id]
      }),
      subject: one(subjects, {
        fields: [timetableEntries.subjectId],
        references: [subjects.id]
      }),
      version: one(timetableVersions, {
        fields: [timetableEntries.versionId],
        references: [timetableVersions.id]
      }),
      substitutions: many(substitutions)
    }));
    substitutionsRelations = relations(substitutions, ({ one }) => ({
      originalTeacher: one(teachers, {
        fields: [substitutions.originalTeacherId],
        references: [teachers.id],
        relationName: "originalTeacher"
      }),
      substituteTeacher: one(teachers, {
        fields: [substitutions.substituteTeacherId],
        references: [teachers.id],
        relationName: "substituteTeacher"
      }),
      timetableEntry: one(timetableEntries, {
        fields: [substitutions.timetableEntryId],
        references: [timetableEntries.id]
      })
    }));
    timetableChangesRelations = relations(timetableChanges, ({ one }) => ({
      timetableEntry: one(timetableEntries, {
        fields: [timetableChanges.timetableEntryId],
        references: [timetableEntries.id]
      }),
      originalTeacher: one(teachers, {
        fields: [timetableChanges.originalTeacherId],
        references: [teachers.id],
        relationName: "originalTeacher"
      }),
      newTeacher: one(teachers, {
        fields: [timetableChanges.newTeacherId],
        references: [teachers.id],
        relationName: "newTeacher"
      }),
      approver: one(users, {
        fields: [timetableChanges.approvedBy],
        references: [users.id]
      })
    }));
    timetableValidityPeriodsRelations = relations(timetableValidityPeriods, ({ one }) => ({
      class: one(classes, {
        fields: [timetableValidityPeriods.classId],
        references: [classes.id]
      })
    }));
    timetableStructuresRelations = relations(timetableStructures, ({ one }) => ({
      school: one(schools, {
        fields: [timetableStructures.schoolId],
        references: [schools.id]
      })
    }));
    teacherAttendanceRelations = relations(teacherAttendance, ({ one }) => ({
      teacher: one(teachers, {
        fields: [teacherAttendance.teacherId],
        references: [teachers.id]
      }),
      school: one(schools, {
        fields: [teacherAttendance.schoolId],
        references: [schools.id]
      }),
      markedByUser: one(users, {
        fields: [teacherAttendance.markedBy],
        references: [users.id]
      })
    }));
    studentAttendanceRelations = relations(studentAttendance, ({ one }) => ({
      student: one(students, {
        fields: [studentAttendance.studentId],
        references: [students.id]
      }),
      school: one(schools, {
        fields: [studentAttendance.schoolId],
        references: [schools.id]
      }),
      class: one(classes, {
        fields: [studentAttendance.classId],
        references: [classes.id]
      }),
      markedByUser: one(users, {
        fields: [studentAttendance.markedBy],
        references: [users.id]
      })
    }));
    classTeacherAssignmentsRelations = relations(classTeacherAssignments, ({ one }) => ({
      class: one(classes, {
        fields: [classTeacherAssignments.classId],
        references: [classes.id]
      }),
      teacher: one(teachers, {
        fields: [classTeacherAssignments.teacherId],
        references: [teachers.id]
      }),
      school: one(schools, {
        fields: [classTeacherAssignments.schoolId],
        references: [schools.id]
      }),
      assignedByUser: one(users, {
        fields: [classTeacherAssignments.assignedBy],
        references: [users.id]
      })
    }));
    auditLogsRelations = relations(auditLogs, ({ one }) => ({
      school: one(schools, {
        fields: [auditLogs.schoolId],
        references: [schools.id]
      }),
      user: one(users, {
        fields: [auditLogs.userId],
        references: [users.id]
      })
    }));
    weeklyTimetablesRelations = relations(weeklyTimetables, ({ one }) => ({
      class: one(classes, {
        fields: [weeklyTimetables.classId],
        references: [classes.id]
      }),
      school: one(schools, {
        fields: [weeklyTimetables.schoolId],
        references: [schools.id]
      }),
      modifiedByUser: one(users, {
        fields: [weeklyTimetables.modifiedBy],
        references: [users.id]
      })
    }));
    insertSchoolSchema = createInsertSchema(schools).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    loginSchema = z.object({
      email: z.string().min(1, "Email or Login ID is required"),
      // Can be email or loginId (Employee ID, Admission Number, P+AdmissionNumber)
      password: z.string().min(6)
    });
    insertTeacherSchema = createInsertSchema(teachers).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertStudentSchema = createInsertSchema(students).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertParentSchema = createInsertSchema(parents).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertStudentParentSchema = createInsertSchema(studentParents).omit({
      id: true,
      createdAt: true
    });
    insertSystemModuleSchema = createInsertSchema(systemModules).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertSubjectSchema = createInsertSchema(subjects).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    createAndAssignSubjectSchema = z.object({
      name: z.string().min(1, "Subject name is required").max(255, "Subject name too long"),
      color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").default("#3B82F6"),
      classId: z.string().uuid("Invalid class ID"),
      weeklyFrequency: z.number().min(1, "Weekly frequency must be at least 1").max(8, "Weekly frequency cannot exceed 8 periods")
    });
    insertClassSchema = createInsertSchema(classes).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).refine(
      (data) => !data.section || !data.section.includes(","),
      "Section cannot contain commas. Each class-section combination must be separate."
    );
    updateClassSchema = createInsertSchema(classes).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).partial().refine(
      (data) => !data.section || !data.section.includes(","),
      "Section cannot contain commas. Each class-section combination must be separate."
    );
    insertTimetableEntrySchema = createInsertSchema(timetableEntries).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertWeeklyTimetableSchema = createInsertSchema(weeklyTimetables).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertSubstitutionSchema = createInsertSchema(substitutions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertTimetableChangeSchema = createInsertSchema(timetableChanges).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertTimetableValidityPeriodSchema = createInsertSchema(timetableValidityPeriods).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertClassSubjectAssignmentSchema = createInsertSchema(classSubjectAssignments).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertTimetableStructureSchema = createInsertSchema(timetableStructures).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertTimetableVersionSchema = createInsertSchema(timetableVersions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertClassTeacherAssignmentSchema = createInsertSchema(classTeacherAssignments).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    manualAssignmentAudits = pgTable("manual_assignment_audits", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      timetableEntryId: uuid("timetable_entry_id").notNull(),
      // Remove foreign key constraint to allow audit logs of deleted entries
      classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
      day: varchar("day", { enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] }).notNull(),
      period: integer("period").notNull(),
      oldTeacherId: uuid("old_teacher_id").references(() => teachers.id),
      newTeacherId: uuid("new_teacher_id").references(() => teachers.id, { onDelete: "cascade" }),
      subjectId: uuid("subject_id").references(() => subjects.id),
      changeReason: text("change_reason").default("Manual assignment by admin"),
      assignedBy: varchar("assigned_by").notNull().references(() => users.id),
      assignedAt: timestamp("assigned_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    teacherReplacements = pgTable("teacher_replacements", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      originalTeacherId: uuid("original_teacher_id").notNull().references(() => teachers.id),
      replacementTeacherId: uuid("replacement_teacher_id").notNull().references(() => teachers.id),
      schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
      replacementDate: timestamp("replacement_date").notNull(),
      reason: text("reason").notNull(),
      affectedTimetableEntries: integer("affected_timetable_entries").notNull().default(0),
      conflictDetails: jsonb("conflict_details").$type().notNull().default(sql`'{"hasConflicts": false}'::jsonb`),
      status: varchar("status", { enum: ["pending", "completed", "failed"] }).notNull().default("pending"),
      replacedBy: varchar("replaced_by").notNull().references(() => users.id),
      completedAt: timestamp("completed_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    teacherReplacementsRelations = relations(teacherReplacements, ({ one }) => ({
      originalTeacher: one(teachers, {
        fields: [teacherReplacements.originalTeacherId],
        references: [teachers.id],
        relationName: "originalTeacher"
      }),
      replacementTeacher: one(teachers, {
        fields: [teacherReplacements.replacementTeacherId],
        references: [teachers.id],
        relationName: "replacementTeacher"
      }),
      school: one(schools, {
        fields: [teacherReplacements.schoolId],
        references: [schools.id]
      }),
      replacedByUser: one(users, {
        fields: [teacherReplacements.replacedBy],
        references: [users.id]
      })
    }));
    insertManualAssignmentAuditSchema = createInsertSchema(manualAssignmentAudits).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertTeacherReplacementSchema = createInsertSchema(teacherReplacements).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertTeacherAttendanceSchema = createInsertSchema(teacherAttendance).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      markedAt: true
    });
    insertStudentAttendanceSchema = createInsertSchema(studentAttendance).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      markedAt: true
    });
    insertAuditLogSchema = createInsertSchema(auditLogs).omit({
      id: true,
      createdAt: true
    });
    updateTeacherDailyPeriodsSchema = z.object({
      teacherId: z.string().uuid().optional(),
      maxDailyPeriods: z.number().min(1).max(10),
      applyToAll: z.boolean().default(false)
      // If true, apply to all teachers in school
    });
    bulkAttendanceSchema = z.object({
      teacherId: z.string().uuid(),
      status: z.enum(["absent", "on_leave", "medical_leave", "personal_leave"]),
      reason: z.string().optional(),
      startDate: z.string(),
      // ISO date string
      endDate: z.string(),
      // ISO date string
      isFullDay: z.boolean().default(true)
    });
    posts = pgTable("posts", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      content: text("content").notNull(),
      attachments: jsonb("attachments").$type().notNull().default(sql`'[]'::jsonb`),
      // Array of attachment objects
      postedById: varchar("posted_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      feedScope: varchar("feed_scope", { enum: ["school", "class"] }).notNull(),
      classId: uuid("class_id").references(() => classes.id, { onDelete: "cascade" }),
      // Required for class feeds
      schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertPostSchema = createInsertSchema(posts).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    updatePostSchema = createInsertSchema(posts).partial().omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    if (process.env.NODE_ENV === "development") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// shared/utils/dateUtils.ts
function getCurrentDateTimeIST() {
  return new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
}
var IST_TIMEZONE;
var init_dateUtils = __esm({
  "shared/utils/dateUtils.ts"() {
    "use strict";
    IST_TIMEZONE = "Asia/Kolkata";
  }
});

// server/services/absenceDetectionService.ts
var absenceDetectionService_exports = {};
__export(absenceDetectionService_exports, {
  AbsenceDetectionService: () => AbsenceDetectionService
});
var AbsenceDetectionService;
var init_absenceDetectionService = __esm({
  "server/services/absenceDetectionService.ts"() {
    "use strict";
    init_storage();
    AbsenceDetectionService = class {
      /**
       * Automatically detect and handle teacher absence by creating timetable changes
       * and attempting to assign substitute teachers
       */
      static async handleTeacherAbsence(teacherId, date2, reason, markedBy) {
        console.log(`Processing automatic absence detection for teacher ${teacherId} on ${date2} (WEEKLY TIMETABLE MODE)`);
        const result = {
          teacherId,
          date: date2,
          affectedClasses: [],
          totalChanges: 0
        };
        try {
          const absenceDate = new Date(date2);
          const weekStart = new Date(absenceDate);
          weekStart.setDate(absenceDate.getDate() - absenceDate.getDay() + 1);
          const weekStartStr = weekStart.toISOString().split("T")[0];
          const dayOfWeek = absenceDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
          console.log(`Processing absence for ${dayOfWeek}, week starting ${weekStartStr}`);
          const teacher = await storage.getTeacher(teacherId);
          if (!teacher) {
            console.error(`Teacher ${teacherId} not found`);
            return result;
          }
          const allClasses = await storage.getClasses(teacher.schoolId);
          for (const classData of allClasses) {
            try {
              const weeklyTimetable = await storage.getWeeklyTimetable(classData.id, new Date(weekStartStr));
              if (!weeklyTimetable) {
                const globalTimetable = await storage.getTimetableEntriesForClass(classData.id);
                const affectedPeriods = globalTimetable.filter(
                  (entry) => entry.teacherId === teacherId && entry.day.toLowerCase() === dayOfWeek
                );
                if (affectedPeriods.length > 0) {
                  const weeklyTimetableData = globalTimetable.map((entry) => ({
                    day: entry.day,
                    period: entry.period,
                    teacherId: entry.teacherId,
                    subjectId: entry.subjectId,
                    startTime: entry.startTime,
                    endTime: entry.endTime,
                    room: entry.room,
                    isModified: false
                  }));
                  await storage.createOrUpdateWeeklyTimetable(
                    classData.id,
                    new Date(weekStartStr),
                    weeklyTimetableData,
                    markedBy,
                    teacher.schoolId
                  );
                  await this.processAbsenceForClass(classData, affectedPeriods, weekStartStr, dayOfWeek, teacherId, reason, markedBy, result);
                }
              } else {
                const weeklyData = Array.isArray(weeklyTimetable.timetableData) ? weeklyTimetable.timetableData : JSON.parse(weeklyTimetable.timetableData);
                const affectedPeriods = weeklyData.filter(
                  (entry) => entry.teacherId === teacherId && entry.day.toLowerCase() === dayOfWeek
                );
                if (affectedPeriods.length > 0) {
                  await this.processAbsenceForClass(classData, affectedPeriods, weekStartStr, dayOfWeek, teacherId, reason, markedBy, result);
                }
              }
            } catch (classError) {
              console.error(`Error processing class ${classData.id}:`, classError);
            }
          }
          try {
            await storage.createAuditLog({
              action: "auto_absence_detection",
              entityType: "teacher_attendance",
              entityId: teacherId,
              userId: markedBy,
              description: `Automatic absence detection: ${date2}, ${reason}, ${result.affectedClasses.length} classes affected`,
              schoolId: (await storage.getTeacher(teacherId))?.schoolId || ""
            });
          } catch (auditError) {
            console.error("Error creating audit log for absence detection:", auditError);
          }
          console.log(`Absence detection completed: ${result.totalChanges} changes created, ${result.affectedClasses.filter((c) => c.substituteAssigned).length} substitutes assigned`);
        } catch (error) {
          console.error("Error in automatic absence detection:", error);
          throw new Error(`Failed to process teacher absence: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        return result;
      }
      /**
       * Process teacher absence for a specific class and update weekly timetable
       */
      static async processAbsenceForClass(classData, affectedPeriods, weekStartStr, dayOfWeek, teacherId, reason, markedBy, result) {
        const weekEnd = new Date(weekStartStr);
        weekEnd.setDate(new Date(weekStartStr).getDate() + 6);
        const weekEndStr = weekEnd.toISOString().split("T")[0];
        const weekStartDate = new Date(weekStartStr);
        const dayMap = {
          "monday": 0,
          "tuesday": 1,
          "wednesday": 2,
          "thursday": 3,
          "friday": 4,
          "saturday": 5,
          "sunday": 6
        };
        const actualAbsenceDate = new Date(weekStartDate);
        actualAbsenceDate.setDate(weekStartDate.getDate() + (dayMap[dayOfWeek.toLowerCase()] || 0));
        const globalTimetableEntries = await storage.getTimetableEntriesForClass(classData.id);
        for (const period of affectedPeriods) {
          try {
            const globalEntry = globalTimetableEntries.find(
              (entry) => entry.day.toLowerCase() === period.day.toLowerCase() && entry.period === period.period && entry.subjectId === period.subjectId
            );
            if (!globalEntry) {
              console.error(`[WEEKLY ABSENCE] Could not find global timetable entry for ${classData.grade}-${classData.section} ${period.day} period ${period.period}`);
              continue;
            }
            const substitutes = await this.findAvailableSubstitutesForWeekly(
              classData.id,
              period.subjectId,
              teacherId,
              dayOfWeek,
              period.period,
              weekStartStr
            );
            let substituteAssigned = false;
            let substituteTeacherId;
            if (substitutes.length > 0) {
              const substitute = substitutes[0];
              substituteTeacherId = substitute.id;
              await storage.createSubstitution({
                originalTeacherId: teacherId,
                substituteTeacherId: substitute.id,
                timetableEntryId: globalEntry.id,
                date: /* @__PURE__ */ new Date(actualAbsenceDate.toISOString().split("T")[0] + "T00:00:00Z"),
                reason: `Teacher absence: ${reason}. Suggested substitute: ${substitute.name}`,
                status: "pending",
                // Changed from "auto_assigned" to "pending"
                isAutoGenerated: true
              });
              substituteAssigned = false;
              console.log(`[WEEKLY ABSENCE] Created pending substitution with ${substitute.name} for ${classData.grade}-${classData.section} period ${period.period} (awaiting approval)`);
            } else {
              await storage.createSubstitution({
                originalTeacherId: teacherId,
                substituteTeacherId: null,
                // No suggested substitute
                timetableEntryId: globalEntry.id,
                date: /* @__PURE__ */ new Date(actualAbsenceDate.toISOString().split("T")[0] + "T00:00:00Z"),
                reason: `Teacher absence: ${reason}. No substitute available - manual assignment required`,
                status: "pending",
                isAutoGenerated: true
              });
              console.log(`[WEEKLY ABSENCE] Created pending substitution (no suggested substitute) for ${classData.grade}-${classData.section} period ${period.period} - requires manual assignment`);
            }
            result.affectedClasses.push({
              timetableEntryId: globalEntry.id,
              // Use the global timetable entry ID here too
              className: `${classData.grade}-${classData.section}`,
              subject: period.subjectId || "Unknown Subject",
              period: period.period,
              day: period.day,
              changeId: `weekly-change-${Date.now()}`,
              substituteAssigned,
              substituteTeacherId
            });
            result.totalChanges++;
          } catch (periodError) {
            console.error(`Error processing period ${period.period} for class ${classData.id}:`, periodError);
          }
        }
      }
      /**
       * Find available substitute teachers for weekly timetable
       */
      static async findAvailableSubstitutesForWeekly(classId, subjectId, originalTeacherId, dayOfWeek, period, weekStartStr) {
        try {
          const classInfo = await storage.getClass(classId);
          if (!classInfo) return [];
          const allTeachers = await storage.getTeachers(classInfo.schoolId);
          const availableTeachers = allTeachers.filter((teacher) => teacher.id !== originalTeacherId);
          const substitutes = [];
          for (const teacher of availableTeachers) {
            const absenceDate = new Date(weekStartStr);
            const dayMap = {
              "monday": 0,
              "tuesday": 1,
              "wednesday": 2,
              "thursday": 3,
              "friday": 4,
              "saturday": 5,
              "sunday": 6
            };
            absenceDate.setDate(absenceDate.getDate() + (dayMap[dayOfWeek.toLowerCase()] || 0));
            const isAbsent = await storage.isTeacherAbsent(teacher.id, absenceDate.toISOString().split("T")[0]);
            if (isAbsent) {
              continue;
            }
            let hasConflict = false;
            try {
              const allSchoolClasses = await storage.getClasses(classInfo.schoolId);
              for (const otherClass of allSchoolClasses) {
                if (otherClass.id === classId) continue;
                const otherWeeklyTimetable = await storage.getWeeklyTimetable(otherClass.id, new Date(weekStartStr));
                if (otherWeeklyTimetable) {
                  const weeklyData = Array.isArray(otherWeeklyTimetable.timetableData) ? otherWeeklyTimetable.timetableData : JSON.parse(otherWeeklyTimetable.timetableData);
                  const conflict = weeklyData.find(
                    (entry) => entry.teacherId === teacher.id && entry.day.toLowerCase() === dayOfWeek.toLowerCase() && entry.period === period
                  );
                  if (conflict) {
                    hasConflict = true;
                    break;
                  }
                } else {
                  const globalTimetable = await storage.getTimetableEntriesForClass(otherClass.id);
                  const conflict = globalTimetable.find(
                    (entry) => entry.teacherId === teacher.id && entry.day.toLowerCase() === dayOfWeek.toLowerCase() && entry.period === period
                  );
                  if (conflict) {
                    hasConflict = true;
                    break;
                  }
                }
              }
            } catch (conflictError) {
              console.error("Error checking teacher conflicts in weekly timetables:", conflictError);
              const teacherTimetable = await storage.getTimetableForTeacher(teacher.id);
              hasConflict = teacherTimetable.some(
                (entry) => entry.day.toLowerCase() === dayOfWeek.toLowerCase() && entry.period === period
              );
            }
            if (hasConflict) {
              continue;
            }
            let subjectCompatibility = false;
            if (teacher.subjects) {
              let teacherSubjects = [];
              if (Array.isArray(teacher.subjects)) {
                teacherSubjects = teacher.subjects;
              } else if (typeof teacher.subjects === "string") {
                try {
                  teacherSubjects = JSON.parse(teacher.subjects);
                } catch (e) {
                  teacherSubjects = [];
                }
              }
              subjectCompatibility = teacherSubjects.includes(subjectId);
            }
            substitutes.push({
              id: teacher.id,
              name: teacher.name,
              subjectCompatibility
            });
          }
          substitutes.sort((a, b) => {
            if (a.subjectCompatibility && !b.subjectCompatibility) return -1;
            if (!a.subjectCompatibility && b.subjectCompatibility) return 1;
            return a.name.localeCompare(b.name);
          });
          console.log(`[WEEKLY SUBSTITUTES] Found ${substitutes.length} potential substitutes for ${dayOfWeek} period ${period}`);
          return substitutes;
        } catch (error) {
          console.error("Error finding available weekly substitutes:", error);
          return [];
        }
      }
      /**
       * Find available substitute teachers for a specific time slot
       */
      static async findAvailableSubstitutes(timetableEntryId, originalTeacherId, date2, dayOfWeek, period) {
        try {
          const timetableEntries2 = await storage.getTimetableEntries();
          const targetEntry = timetableEntries2.find((entry) => entry.id === timetableEntryId);
          if (!targetEntry) {
            return [];
          }
          const classInfo = await storage.getClass(targetEntry.classId);
          if (!classInfo) return [];
          const allTeachers = await storage.getTeachers(classInfo.schoolId);
          const availableTeachers = allTeachers.filter((teacher) => teacher.id !== originalTeacherId);
          const substitutes = [];
          for (const teacher of availableTeachers) {
            const isAbsent = await storage.isTeacherAbsent(teacher.id, date2);
            if (isAbsent) {
              continue;
            }
            const teacherTimetable = await storage.getTimetableForTeacher(teacher.id);
            const hasConflict = teacherTimetable.some(
              (entry) => entry.day.toLowerCase() === dayOfWeek.toLowerCase() && entry.period === period
            );
            if (hasConflict) {
              continue;
            }
            const subjectCompatibility = teacher.subjects?.some(
              (subject) => subject.id === targetEntry.subjectId
            ) || false;
            substitutes.push({
              id: teacher.id,
              name: teacher.name,
              subjectCompatibility
            });
          }
          substitutes.sort((a, b) => {
            if (a.subjectCompatibility && !b.subjectCompatibility) return -1;
            if (!a.subjectCompatibility && b.subjectCompatibility) return 1;
            return a.name.localeCompare(b.name);
          });
          console.log(`Found ${substitutes.length} potential substitutes for ${dayOfWeek} period ${period}`);
          return substitutes;
        } catch (error) {
          console.error("Error finding available substitutes:", error);
          return [];
        }
      }
      /**
       * Check if a teacher becoming present again requires reverting automatic changes
       */
      static async handleTeacherReturn(teacherId, date2, markedBy) {
        console.log(`Processing teacher return for ${teacherId} on ${date2}`);
        try {
          const allChanges = await storage.getTimetableChanges(
            (await storage.getTeacher(teacherId))?.schoolId || "",
            date2
          );
          const autoChangesToRevert = allChanges.filter(
            (change) => change.originalTeacherId === teacherId && change.changeSource === "auto_absence" && change.isActive && !change.approvedBy
            // Only revert unapproved changes
          );
          let revertedCount = 0;
          for (const change of autoChangesToRevert) {
            await storage.updateTimetableChange(change.id, {
              isActive: false,
              reason: `${change.reason} - Reverted: Teacher returned`
            });
            if (change.newTeacherId) {
              const substitutions2 = await storage.getSubstitutions();
              const relatedSubstitution = substitutions2.find(
                (sub) => sub.originalTeacherId === teacherId && sub.timetableEntryId === change.timetableEntryId && sub.date.toISOString().split("T")[0] === date2 && sub.status === "auto_assigned"
              );
              if (relatedSubstitution) {
                await storage.deleteSubstitution(relatedSubstitution.id);
              }
            }
            revertedCount++;
          }
          await storage.createAuditLog({
            action: "auto_teacher_return",
            entityType: "teacher_attendance",
            entityId: teacherId,
            userId: markedBy,
            description: `Teacher return: ${date2}, ${revertedCount} changes reverted`,
            schoolId: (await storage.getTeacher(teacherId))?.schoolId || ""
          });
          const message = revertedCount > 0 ? `Teacher returned: ${revertedCount} automatic changes reverted` : "Teacher returned: No automatic changes to revert";
          console.log(message);
          return { revertedChanges: revertedCount, message };
        } catch (error) {
          console.error("Error handling teacher return:", error);
          throw new Error(`Failed to process teacher return: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
    };
  }
});

// server/storage.ts
import { eq, and, or, inArray, sql as sql2, ne, gte, lte, between, asc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
function generateTemporaryPassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    const randomIndex = randomInt(0, chars.length);
    password += chars.charAt(randomIndex);
  }
  return password;
}
function generateTemporaryPasswordExpiry() {
  const expiryDate = /* @__PURE__ */ new Date();
  expiryDate.setHours(expiryDate.getHours() + 48);
  return expiryDate;
}
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_dateUtils();
    DatabaseStorage = class {
      // User operations
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      }
      async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user;
      }
      async getUserByLoginId(loginId, schoolId) {
        const conditions = [eq(users.loginId, loginId)];
        if (schoolId) {
          conditions.push(eq(users.schoolId, schoolId));
        }
        const [user] = await db.select().from(users).where(and(...conditions));
        return user;
      }
      async getUsersBySchoolId(schoolId) {
        return await db.select().from(users).where(eq(users.schoolId, schoolId));
      }
      async createUser(userData) {
        const [user] = await db.insert(users).values(userData).returning();
        return user;
      }
      async updateUser(id, userData) {
        const [user] = await db.update(users).set({ ...userData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
        return user;
      }
      // Temporary password operations
      async setTemporaryPassword(userId, hashedPassword, expiresAt) {
        const [user] = await db.update(users).set({
          temporaryPassword: hashedPassword,
          temporaryPasswordExpiresAt: expiresAt,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, userId)).returning();
        return user;
      }
      async clearTemporaryPassword(userId) {
        const [user] = await db.update(users).set({
          temporaryPassword: null,
          temporaryPasswordExpiresAt: null,
          isFirstLogin: false,
          passwordChangedAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, userId)).returning();
        return user;
      }
      async validateTemporaryPassword(userId, password) {
        const user = await this.getUser(userId);
        if (!user || !user.temporaryPassword) {
          return { isValid: false, isExpired: false };
        }
        const isExpired = !user.temporaryPasswordExpiresAt || /* @__PURE__ */ new Date() > user.temporaryPasswordExpiresAt;
        if (isExpired) {
          return { isValid: false, isExpired: true };
        }
        const bcrypt3 = __require("bcryptjs");
        const isValidPassword = await bcrypt3.compare(password, user.temporaryPassword);
        return {
          isValid: isValidPassword,
          isExpired: false,
          user: isValidPassword ? user : void 0
        };
      }
      // School operations
      async getSchools() {
        return await db.select().from(schools);
      }
      async getSchoolsWithAdminEmails() {
        const schoolsWithAdmins = await db.select({
          id: schools.id,
          name: schools.name,
          address: schools.address,
          contactPhone: schools.contactPhone,
          adminName: schools.adminName,
          isActive: schools.isActive,
          timetableFrozen: schools.timetableFrozen,
          createdAt: schools.createdAt,
          updatedAt: schools.updatedAt,
          adminEmail: users.email
        }).from(schools).leftJoin(users, and(eq(schools.id, users.schoolId), eq(users.role, "admin")));
        return schoolsWithAdmins.map((school) => ({
          ...school,
          adminEmail: school.adminEmail || void 0
        }));
      }
      async getSchool(id) {
        const [school] = await db.select().from(schools).where(eq(schools.id, id));
        return school;
      }
      async createSchool(schoolData) {
        const [school] = await db.insert(schools).values(schoolData).returning();
        return school;
      }
      async updateSchool(id, schoolData) {
        const [school] = await db.update(schools).set({ ...schoolData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(schools.id, id)).returning();
        if (!school) {
          throw new Error(`School with id ${id} not found`);
        }
        return school;
      }
      async deleteSchool(id) {
        await db.delete(schools).where(eq(schools.id, id));
      }
      // Teacher operations
      async getTeachers(schoolId) {
        let result;
        if (schoolId) {
          result = await db.select().from(teachers).where(
            and(eq(teachers.isActive, true), eq(teachers.schoolId, schoolId))
          );
        } else {
          result = await db.select().from(teachers).where(eq(teachers.isActive, true));
        }
        console.log(`[STORAGE DEBUG] getTeachers returned ${result.length} teachers`);
        result.forEach((teacher) => {
          console.log(`[STORAGE DEBUG] Teacher ${teacher.name} subjects:`, teacher.subjects, "Type:", typeof teacher.subjects);
        });
        return result;
      }
      async getTeacher(id) {
        const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
        return teacher;
      }
      async getTeacherCountBySchool(schoolId) {
        const result = await db.select({ count: sql2`count(*)` }).from(teachers).where(and(eq(teachers.schoolId, schoolId), eq(teachers.isActive, true)));
        return result[0]?.count || 0;
      }
      async createTeacher(teacher) {
        const insertData = { ...teacher };
        if (teacher.subjects) {
          insertData.subjects = teacher.subjects;
        }
        const [created] = await db.insert(teachers).values(insertData).returning();
        return created;
      }
      async updateTeacher(id, teacher) {
        const updateData = { ...teacher, updatedAt: /* @__PURE__ */ new Date() };
        if (teacher.subjects) {
          updateData.subjects = teacher.subjects;
        }
        const [updated] = await db.update(teachers).set(updateData).where(eq(teachers.id, id)).returning();
        return updated;
      }
      async deleteTeacher(id) {
        await db.update(teachers).set({ isActive: false }).where(eq(teachers.id, id));
      }
      async getAvailableTeachers(day, period, subjectId, schoolId) {
        try {
          const allTeachers = await db.select().from(teachers).where(eq(teachers.isActive, true));
          console.log(`[DEBUG] Total active teachers found: ${allTeachers.length}`);
          console.log(`[DEBUG] Teachers:`, allTeachers.map((t) => `${t.name} (${t.schoolId})`));
          console.log(`[DEBUG] Looking for schoolId: ${schoolId}`);
          const schoolTeachers = allTeachers.filter((t) => t.schoolId === schoolId);
          console.log(`[DEBUG] Teachers in school: ${schoolTeachers.length}`);
          return schoolTeachers;
        } catch (error) {
          console.error(`[STORAGE ERROR] getAvailableTeachers failed:`, error);
          return [];
        }
      }
      // Subject operations
      async getSubjects(schoolId) {
        if (schoolId) {
          return await db.select().from(subjects).where(eq(subjects.schoolId, schoolId));
        }
        return await db.select().from(subjects);
      }
      async getSubject(id) {
        const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
        return subject;
      }
      async createSubject(subject) {
        const [created] = await db.insert(subjects).values(subject).returning();
        return created;
      }
      async updateSubject(id, subject) {
        const [updated] = await db.update(subjects).set({ ...subject, updatedAt: /* @__PURE__ */ new Date() }).where(eq(subjects.id, id)).returning();
        return updated;
      }
      async deleteSubject(id) {
        await db.delete(subjects).where(eq(subjects.id, id));
      }
      async checkSubjectCodeExists(code, schoolId, excludeId) {
        const conditions = [eq(subjects.code, code), eq(subjects.schoolId, schoolId)];
        if (excludeId) {
          conditions.push(ne(subjects.id, excludeId));
        }
        const [existing] = await db.select().from(subjects).where(and(...conditions)).limit(1);
        return !!existing;
      }
      // Class operations
      async getClasses(schoolId) {
        if (schoolId) {
          return await db.select().from(classes).where(eq(classes.schoolId, schoolId)).orderBy(
            sql2`CAST(${classes.grade} AS INTEGER)`,
            asc(classes.section)
          );
        }
        return await db.select().from(classes).orderBy(
          sql2`CAST(${classes.grade} AS INTEGER)`,
          asc(classes.section)
        );
      }
      async getClass(id) {
        const [classData] = await db.select().from(classes).where(eq(classes.id, id));
        return classData;
      }
      async createClass(classData) {
        const [created] = await db.insert(classes).values({
          ...classData,
          requiredSubjects: JSON.stringify(classData.requiredSubjects || [])
        }).returning();
        return created;
      }
      async updateClass(id, classData) {
        const updateData = { ...classData, updatedAt: /* @__PURE__ */ new Date() };
        if (classData.requiredSubjects) {
          updateData.requiredSubjects = JSON.stringify(classData.requiredSubjects);
        }
        const [updated] = await db.update(classes).set(updateData).where(eq(classes.id, id)).returning();
        return updated;
      }
      async deleteClass(id) {
        await db.delete(classes).where(eq(classes.id, id));
      }
      async getOtherSectionsOfGrade(grade, schoolId, excludeClassId) {
        return await db.select().from(classes).where(
          and(
            eq(classes.grade, grade),
            eq(classes.schoolId, schoolId),
            ne(classes.id, excludeClassId)
          )
        ).orderBy(classes.section);
      }
      async copySubjectsBetweenClasses(sourceClassId, targetClassIds, schoolId) {
        const sourceAssignments = await db.select().from(classSubjectAssignments).where(eq(classSubjectAssignments.classId, sourceClassId));
        let copiedCount = 0;
        let skippedCount = 0;
        for (const targetClassId of targetClassIds) {
          const targetClass = await this.getClass(targetClassId);
          if (!targetClass || targetClass.schoolId !== schoolId) {
            skippedCount++;
            continue;
          }
          const existingAssignments = await db.select({
            subjectId: classSubjectAssignments.subjectId
          }).from(classSubjectAssignments).where(eq(classSubjectAssignments.classId, targetClassId));
          const existingSubjectIds = existingAssignments.map((a) => a.subjectId);
          for (const assignment of sourceAssignments) {
            if (!existingSubjectIds.includes(assignment.subjectId)) {
              await db.insert(classSubjectAssignments).values({
                classId: targetClassId,
                subjectId: assignment.subjectId,
                weeklyFrequency: assignment.weeklyFrequency
              });
              copiedCount++;
            } else {
              skippedCount++;
            }
          }
        }
        return { copiedCount, skippedCount };
      }
      async checkClassExists(grade, section, schoolId, excludeId) {
        const conditions = [
          eq(classes.grade, grade),
          eq(classes.schoolId, schoolId),
          // Handle both empty strings and null values for empty sections
          section && section.trim() !== "" ? eq(classes.section, section) : or(eq(classes.section, ""), sql2`${classes.section} IS NULL`)
        ];
        if (excludeId) {
          conditions.push(sql2`${classes.id} != ${excludeId}`);
        }
        const result = await db.select({ id: classes.id }).from(classes).where(and(...conditions));
        return result.length > 0;
      }
      // Class Teacher Assignment operations
      async getClassTeacherAssignments(classId) {
        const results = await db.select({
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
          teacherEmail: teachers.email
        }).from(classTeacherAssignments).innerJoin(teachers, eq(classTeacherAssignments.teacherId, teachers.id)).where(
          and(
            eq(classTeacherAssignments.classId, classId),
            eq(classTeacherAssignments.isActive, true)
          )
        ).orderBy(classTeacherAssignments.isPrimary, classTeacherAssignments.createdAt);
        return results;
      }
      async getClassTeacherAssignment(classId, teacherId) {
        const [result] = await db.select().from(classTeacherAssignments).where(
          and(
            eq(classTeacherAssignments.classId, classId),
            eq(classTeacherAssignments.teacherId, teacherId),
            eq(classTeacherAssignments.isActive, true)
          )
        );
        return result;
      }
      async getPrimaryClassTeacher(classId) {
        const [result] = await db.select().from(classTeacherAssignments).where(
          and(
            eq(classTeacherAssignments.classId, classId),
            eq(classTeacherAssignments.isPrimary, true),
            eq(classTeacherAssignments.isActive, true)
          )
        );
        return result;
      }
      async createClassTeacherAssignment(assignment) {
        const [created] = await db.insert(classTeacherAssignments).values({
          ...assignment,
          isPrimary: assignment.role === "primary",
          privileges: assignment.privileges || {
            attendance: true,
            classFeedPosting: true,
            parentCommunication: true,
            leaveApproval: true
          }
        }).returning();
        return created;
      }
      async getClassTeacherAssignmentById(assignmentId) {
        const [result] = await db.select().from(classTeacherAssignments).where(eq(classTeacherAssignments.id, assignmentId));
        return result;
      }
      async updateClassTeacherAssignment(assignmentId, data) {
        const updateData = { ...data, updatedAt: /* @__PURE__ */ new Date() };
        if (data.role === "primary") {
          updateData.isPrimary = true;
        } else if (data.role === "co_class") {
          updateData.isPrimary = false;
        }
        const [updated] = await db.update(classTeacherAssignments).set(updateData).where(eq(classTeacherAssignments.id, assignmentId)).returning();
        return updated;
      }
      async deleteClassTeacherAssignment(assignmentId) {
        await db.delete(classTeacherAssignments).where(eq(classTeacherAssignments.id, assignmentId));
      }
      // Timetable operations
      async getTimetableEntries(schoolId) {
        if (schoolId) {
          return await db.select({
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
            updatedAt: timetableEntries.updatedAt
          }).from(timetableEntries).innerJoin(classes, eq(timetableEntries.classId, classes.id)).where(and(
            eq(timetableEntries.isActive, true),
            eq(classes.schoolId, schoolId)
          ));
        }
        return await db.select().from(timetableEntries).where(eq(timetableEntries.isActive, true));
      }
      async getTimetableForClass(classId) {
        return await db.select().from(timetableEntries).where(
          and(
            eq(timetableEntries.classId, classId),
            eq(timetableEntries.isActive, true)
          )
        );
      }
      async getTimetableForTeacher(teacherId) {
        return await db.select().from(timetableEntries).where(
          and(
            eq(timetableEntries.teacherId, teacherId),
            eq(timetableEntries.isActive, true)
          )
        );
      }
      async createTimetableEntry(entry) {
        const [created] = await db.insert(timetableEntries).values(entry).returning();
        return created;
      }
      async updateTimetableEntry(id, entry) {
        const [updated] = await db.update(timetableEntries).set({ ...entry, updatedAt: /* @__PURE__ */ new Date() }).where(eq(timetableEntries.id, id)).returning();
        return updated;
      }
      async deleteTimetableEntry(id) {
        await db.delete(timetableEntries).where(eq(timetableEntries.id, id));
      }
      async deleteTimetableEntriesForClass(classId) {
        await db.delete(timetableEntries).where(eq(timetableEntries.classId, classId));
      }
      async deleteTimetableEntriesForTeacherAndDay(teacherId, day) {
        await db.delete(timetableEntries).where(
          and(
            eq(timetableEntries.teacherId, teacherId),
            eq(timetableEntries.day, day)
          )
        );
      }
      async clearTimetable() {
        await db.delete(timetableEntries);
      }
      async bulkCreateTimetableEntries(entries) {
        if (entries.length === 0) return [];
        const classIds = Array.from(new Set(entries.map((e) => e.classId)));
        for (let i = 0; i < classIds.length; i++) {
          const classId = classIds[i];
          await db.update(timetableEntries).set({ isActive: false }).where(eq(timetableEntries.classId, classId));
        }
        return await db.insert(timetableEntries).values(entries).returning();
      }
      // Timetable version operations
      async createTimetableVersion(version) {
        const [created] = await db.insert(timetableVersions).values(version).returning();
        return created;
      }
      async getTimetableVersionsForClass(classId, weekStart, weekEnd) {
        return await db.select().from(timetableVersions).where(
          and(
            eq(timetableVersions.classId, classId),
            eq(timetableVersions.weekStart, weekStart),
            eq(timetableVersions.weekEnd, weekEnd)
          )
        ).orderBy(timetableVersions.createdAt);
      }
      async getTimetableEntriesForVersion(versionId) {
        return await db.select().from(timetableEntries).where(eq(timetableEntries.versionId, versionId));
      }
      async setActiveVersion(versionId, classId) {
        const version = await db.select().from(timetableVersions).where(eq(timetableVersions.id, versionId)).limit(1);
        if (version.length > 0) {
          const { weekStart, weekEnd } = version[0];
          await db.update(timetableVersions).set({ isActive: false }).where(
            and(
              eq(timetableVersions.classId, classId),
              eq(timetableVersions.weekStart, weekStart),
              eq(timetableVersions.weekEnd, weekEnd)
            )
          );
          await db.update(timetableVersions).set({ isActive: true }).where(eq(timetableVersions.id, versionId));
          const activeCount = await db.select({ count: sql2`count(*)` }).from(timetableVersions).where(
            and(
              eq(timetableVersions.classId, classId),
              eq(timetableVersions.weekStart, weekStart),
              eq(timetableVersions.weekEnd, weekEnd),
              eq(timetableVersions.isActive, true)
            )
          );
          if (activeCount[0].count > 1) {
            console.error(`ERROR: Multiple active versions detected for class ${classId}, week ${weekStart}-${weekEnd}. Count: ${activeCount[0].count}`);
            await db.update(timetableVersions).set({ isActive: false }).where(
              and(
                eq(timetableVersions.classId, classId),
                eq(timetableVersions.weekStart, weekStart),
                eq(timetableVersions.weekEnd, weekEnd)
              )
            );
            await db.update(timetableVersions).set({ isActive: true }).where(eq(timetableVersions.id, versionId));
          }
        }
      }
      async getActiveTimetableVersion(classId, weekStart, weekEnd) {
        const versions = await db.select().from(timetableVersions).where(
          and(
            eq(timetableVersions.classId, classId),
            eq(timetableVersions.weekStart, weekStart),
            eq(timetableVersions.weekEnd, weekEnd),
            eq(timetableVersions.isActive, true)
          )
        ).limit(1);
        return versions.length > 0 ? versions[0] : null;
      }
      // Substitution operations
      async getSubstitutions(schoolId) {
        if (schoolId) {
          return await db.select({
            id: substitutions.id,
            date: substitutions.date,
            originalTeacherId: substitutions.originalTeacherId,
            substituteTeacherId: substitutions.substituteTeacherId,
            timetableEntryId: substitutions.timetableEntryId,
            reason: substitutions.reason,
            status: substitutions.status,
            isAutoGenerated: substitutions.isAutoGenerated,
            createdAt: substitutions.createdAt,
            updatedAt: substitutions.updatedAt
          }).from(substitutions).innerJoin(teachers, eq(substitutions.originalTeacherId, teachers.id)).where(eq(teachers.schoolId, schoolId));
        }
        return await db.select().from(substitutions);
      }
      async getSubstitution(id) {
        const [substitution] = await db.select().from(substitutions).where(eq(substitutions.id, id));
        return substitution;
      }
      async createSubstitution(substitution) {
        const [created] = await db.insert(substitutions).values(substitution).returning();
        return created;
      }
      async updateSubstitution(id, substitution) {
        const [updated] = await db.update(substitutions).set({ ...substitution, updatedAt: /* @__PURE__ */ new Date() }).where(eq(substitutions.id, id)).returning();
        return updated;
      }
      async deleteSubstitution(id) {
        await db.delete(substitutions).where(eq(substitutions.id, id));
      }
      async getActiveSubstitutions() {
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return await db.select().from(substitutions).where(
          and(
            sql2`${substitutions.date} >= ${today}`,
            sql2`${substitutions.date} < ${tomorrow}`,
            eq(substitutions.status, "confirmed")
          )
        );
      }
      async getSubstitutionsByWeek(weekStart, weekEnd, schoolId) {
        if (schoolId) {
          return await db.select({
            id: substitutions.id,
            date: substitutions.date,
            originalTeacherId: substitutions.originalTeacherId,
            substituteTeacherId: substitutions.substituteTeacherId,
            timetableEntryId: substitutions.timetableEntryId,
            reason: substitutions.reason,
            status: substitutions.status,
            isAutoGenerated: substitutions.isAutoGenerated,
            createdAt: substitutions.createdAt,
            updatedAt: substitutions.updatedAt
          }).from(substitutions).innerJoin(teachers, eq(substitutions.originalTeacherId, teachers.id)).where(
            and(
              sql2`${substitutions.date} >= ${weekStart}`,
              sql2`${substitutions.date} <= ${weekEnd}`,
              eq(teachers.schoolId, schoolId)
            )
          );
        }
        return await db.select().from(substitutions).where(
          and(
            sql2`${substitutions.date} >= ${weekStart}`,
            sql2`${substitutions.date} <= ${weekEnd}`
          )
        );
      }
      // Timetable changes operations
      async getTimetableChanges(schoolId, date2) {
        const whereConditions = [
          eq(classes.schoolId, schoolId),
          eq(timetableChanges.isActive, true)
        ];
        if (date2) {
          whereConditions.push(eq(timetableChanges.changeDate, date2));
        }
        return await db.select({
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
        }).from(timetableChanges).innerJoin(timetableEntries, eq(timetableChanges.timetableEntryId, timetableEntries.id)).innerJoin(classes, eq(timetableEntries.classId, classes.id)).where(and(...whereConditions));
      }
      async getTimetableChangesByEntry(timetableEntryId) {
        return await db.select().from(timetableChanges).where(and(
          eq(timetableChanges.timetableEntryId, timetableEntryId),
          eq(timetableChanges.isActive, true)
        )).orderBy(timetableChanges.createdAt);
      }
      async createTimetableChange(change) {
        const [created] = await db.insert(timetableChanges).values(change).returning();
        return created;
      }
      async updateTimetableChange(id, change) {
        const [updated] = await db.update(timetableChanges).set({ ...change, updatedAt: /* @__PURE__ */ new Date() }).where(eq(timetableChanges.id, id)).returning();
        return updated;
      }
      async deleteTimetableChange(id) {
        await db.delete(timetableChanges).where(eq(timetableChanges.id, id));
      }
      async getActiveTimetableChanges(schoolId, date2) {
        return await db.select({
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
        }).from(timetableChanges).innerJoin(timetableEntries, eq(timetableChanges.timetableEntryId, timetableEntries.id)).innerJoin(classes, eq(timetableEntries.classId, classes.id)).where(and(
          eq(classes.schoolId, schoolId),
          eq(timetableChanges.changeDate, date2),
          eq(timetableChanges.isActive, true)
        )).orderBy(timetableChanges.createdAt);
      }
      // Analytics
      async getStats(schoolId) {
        const [teacherCount] = await db.select({ count: sql2`count(*)` }).from(teachers).where(and(eq(teachers.isActive, true), eq(teachers.schoolId, schoolId)));
        const [classCount] = await db.select({ count: sql2`count(*)` }).from(classes).where(eq(classes.schoolId, schoolId));
        const [subjectCount] = await db.select({ count: sql2`count(*)` }).from(subjects).where(eq(subjects.schoolId, schoolId));
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [substitutionCount] = await db.select({ count: sql2`count(*)` }).from(substitutions).innerJoin(teachers, eq(substitutions.originalTeacherId, teachers.id)).where(
          and(
            eq(teachers.schoolId, schoolId),
            sql2`${substitutions.date} >= ${today}`,
            sql2`${substitutions.date} < ${tomorrow}`
          )
        );
        return {
          totalTeachers: Number(teacherCount?.count) || 0,
          totalClasses: Number(classCount?.count) || 0,
          totalSubjects: Number(subjectCount?.count) || 0,
          todaySubstitutions: Number(substitutionCount?.count) || 0
        };
      }
      async getAdminDashboardStats() {
        const [totalSchoolsResult] = await db.select({ count: sql2`count(*)` }).from(schools);
        const [activeSchoolsResult] = await db.select({ count: sql2`count(*)` }).from(schools).where(eq(schools.isActive, true));
        const [inactiveSchoolsResult] = await db.select({ count: sql2`count(*)` }).from(schools).where(eq(schools.isActive, false));
        const schoolAdminLogins = await db.select({
          schoolName: schools.name,
          adminName: sql2`CONCAT(${users.firstName}, ' ', COALESCE(${users.lastName}, ''))`,
          lastLogin: users.updatedAt
          // Using updatedAt as proxy for last activity
        }).from(schools).leftJoin(users, and(
          eq(users.schoolId, schools.id),
          eq(users.role, "admin")
        )).orderBy(schools.name);
        const schoolTeacherCounts = await db.select({
          schoolName: schools.name,
          activeTeachers: sql2`COUNT(${teachers.id})`
        }).from(schools).leftJoin(teachers, and(
          eq(teachers.schoolId, schools.id),
          eq(teachers.isActive, true)
        )).groupBy(schools.id, schools.name).orderBy(schools.name);
        return {
          totalSchools: Number(totalSchoolsResult?.count) || 0,
          activeSchools: Number(activeSchoolsResult?.count) || 0,
          inactiveSchools: Number(inactiveSchoolsResult?.count) || 0,
          schoolAdminLogins: schoolAdminLogins.map((item) => ({
            schoolName: item.schoolName,
            adminName: item.adminName || "No Admin",
            lastLogin: item.lastLogin
          })),
          schoolTeacherCounts: schoolTeacherCounts.map((item) => ({
            schoolName: item.schoolName,
            activeTeachers: Number(item.activeTeachers) || 0
          }))
        };
      }
      // Timetable validity period operations
      async getTimetableValidityPeriods(classId) {
        if (classId) {
          return await db.select().from(timetableValidityPeriods).where(eq(timetableValidityPeriods.classId, classId));
        }
        return await db.select().from(timetableValidityPeriods);
      }
      async getTimetableValidityPeriod(id) {
        const [period] = await db.select().from(timetableValidityPeriods).where(eq(timetableValidityPeriods.id, id));
        return period;
      }
      async createTimetableValidityPeriod(period) {
        await db.update(timetableValidityPeriods).set({ isActive: false }).where(and(
          eq(timetableValidityPeriods.classId, period.classId),
          eq(timetableValidityPeriods.isActive, true)
        ));
        const [newPeriod] = await db.insert(timetableValidityPeriods).values(period).returning();
        return newPeriod;
      }
      async updateTimetableValidityPeriod(id, period) {
        const [updatedPeriod] = await db.update(timetableValidityPeriods).set(period).where(eq(timetableValidityPeriods.id, id)).returning();
        return updatedPeriod;
      }
      async deleteTimetableValidityPeriod(id) {
        await db.delete(timetableValidityPeriods).where(eq(timetableValidityPeriods.id, id));
      }
      // Class Subject Assignment operations
      async getClassSubjectAssignments(classId, schoolId) {
        const query = db.select({
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
            schoolId: subjects.schoolId
          },
          assignedTeacher: {
            id: teachers.id,
            name: teachers.name,
            email: teachers.email,
            contactNumber: teachers.contactNumber,
            schoolIdNumber: teachers.schoolIdNumber,
            schoolId: teachers.schoolId,
            isActive: teachers.isActive
          }
        }).from(classSubjectAssignments).innerJoin(subjects, eq(classSubjectAssignments.subjectId, subjects.id)).leftJoin(teachers, eq(classSubjectAssignments.assignedTeacherId, teachers.id));
        let conditions = [];
        if (classId) {
          conditions.push(eq(classSubjectAssignments.classId, classId));
        }
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
      async getClassSubjectAssignment(id) {
        const [assignment] = await db.select().from(classSubjectAssignments).where(eq(classSubjectAssignments.id, id));
        return assignment;
      }
      async createClassSubjectAssignment(assignment) {
        const [newAssignment] = await db.insert(classSubjectAssignments).values(assignment).returning();
        return newAssignment;
      }
      async updateClassSubjectAssignment(id, assignment) {
        const [updatedAssignment] = await db.update(classSubjectAssignments).set(assignment).where(eq(classSubjectAssignments.id, id)).returning();
        return updatedAssignment;
      }
      async deleteClassSubjectAssignment(id) {
        await db.delete(classSubjectAssignments).where(eq(classSubjectAssignments.id, id));
      }
      async getClassSubjectAssignmentByClassAndSubject(classId, subjectId) {
        const [assignment] = await db.select().from(classSubjectAssignments).where(and(
          eq(classSubjectAssignments.classId, classId),
          eq(classSubjectAssignments.subjectId, subjectId)
        ));
        return assignment;
      }
      // Timetable Structure operations
      async getTimetableStructures(schoolId) {
        if (schoolId) {
          return await db.select().from(timetableStructures).where(eq(timetableStructures.schoolId, schoolId));
        }
        return await db.select().from(timetableStructures);
      }
      async getTimetableStructure(id) {
        const [structure] = await db.select().from(timetableStructures).where(eq(timetableStructures.id, id));
        return structure;
      }
      async getTimetableStructureBySchool(schoolId) {
        const [structure] = await db.select().from(timetableStructures).where(and(
          eq(timetableStructures.schoolId, schoolId),
          eq(timetableStructures.isActive, true)
        ));
        return structure;
      }
      async createTimetableStructure(structure) {
        await db.update(timetableStructures).set({ isActive: false }).where(and(
          eq(timetableStructures.schoolId, structure.schoolId),
          eq(timetableStructures.isActive, true)
        ));
        const [newStructure] = await db.insert(timetableStructures).values(structure).returning();
        return newStructure;
      }
      async updateTimetableStructure(id, structure) {
        const [updatedStructure] = await db.update(timetableStructures).set(structure).where(eq(timetableStructures.id, id)).returning();
        return updatedStructure;
      }
      async deleteTimetableStructure(id) {
        await db.delete(timetableStructures).where(eq(timetableStructures.id, id));
      }
      // Teacher attendance operations
      async getTeacherAttendance(schoolId, date2) {
        const conditions = [eq(teacherAttendance.schoolId, schoolId)];
        if (date2) {
          conditions.push(eq(teacherAttendance.attendanceDate, date2));
        }
        return await db.select().from(teacherAttendance).where(and(...conditions)).orderBy(teacherAttendance.attendanceDate);
      }
      async getTeacherAttendanceByTeacher(teacherId, startDate, endDate) {
        const conditions = [eq(teacherAttendance.teacherId, teacherId)];
        if (startDate && endDate) {
          conditions.push(between(teacherAttendance.attendanceDate, startDate, endDate));
        } else if (startDate) {
          conditions.push(gte(teacherAttendance.attendanceDate, startDate));
        } else if (endDate) {
          conditions.push(lte(teacherAttendance.attendanceDate, endDate));
        }
        return await db.select().from(teacherAttendance).where(and(...conditions)).orderBy(teacherAttendance.attendanceDate);
      }
      async markTeacherAttendance(attendance) {
        const existing = await db.select().from(teacherAttendance).where(
          and(
            eq(teacherAttendance.teacherId, attendance.teacherId),
            eq(teacherAttendance.attendanceDate, attendance.attendanceDate)
          )
        );
        let result;
        let wasAbsentBefore = false;
        let isAbsentNow = attendance.status !== "present";
        if (existing.length > 0) {
          wasAbsentBefore = existing[0].status !== "present";
          const [updated] = await db.update(teacherAttendance).set({
            status: attendance.status,
            reason: attendance.reason,
            isFullDay: attendance.isFullDay,
            markedBy: attendance.markedBy,
            markedAt: getCurrentDateTimeIST()
          }).where(eq(teacherAttendance.id, existing[0].id)).returning();
          result = updated;
        } else {
          const [created] = await db.insert(teacherAttendance).values(attendance).returning();
          result = created;
        }
        try {
          const { AbsenceDetectionService: AbsenceDetectionService2 } = await Promise.resolve().then(() => (init_absenceDetectionService(), absenceDetectionService_exports));
          if (isAbsentNow && !wasAbsentBefore) {
            console.log(`Triggering automatic absence detection for teacher ${attendance.teacherId} on ${attendance.attendanceDate}`);
            await AbsenceDetectionService2.handleTeacherAbsence(
              attendance.teacherId,
              attendance.attendanceDate,
              attendance.reason || "No reason provided",
              attendance.markedBy || "system"
            );
          } else if (!isAbsentNow && wasAbsentBefore) {
            console.log(`Teacher ${attendance.teacherId} returned on ${attendance.attendanceDate}, checking for automatic changes to revert`);
            await AbsenceDetectionService2.handleTeacherReturn(
              attendance.teacherId,
              attendance.attendanceDate,
              attendance.markedBy || "system"
            );
          }
        } catch (absenceError) {
          console.error("Error in automatic absence detection:", absenceError);
          try {
            await this.createAuditLog({
              action: "absence_detection_error",
              entityType: "teacher_attendance",
              entityId: attendance.teacherId,
              userId: attendance.markedBy || "system",
              description: `Failed to process automatic absence detection: ${absenceError instanceof Error ? absenceError.message : "Unknown error"}`,
              schoolId: attendance.schoolId
            });
          } catch (auditError) {
            console.error("Failed to log absence detection error:", auditError);
          }
        }
        return result;
      }
      async markBulkTeacherAttendance(bulkData, markedBy) {
        const { teacherId, status, reason, startDate, endDate, isFullDay } = bulkData;
        const records = [];
        const teacher = await this.getTeacher(teacherId);
        if (!teacher) {
          throw new Error("Teacher not found");
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        const currentDate = new Date(start);
        while (currentDate <= end) {
          const dateString = currentDate.toISOString().split("T")[0];
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
              markedBy
            });
            records.push(attendanceRecord);
          } catch (error) {
            console.error(`Failed to mark attendance for ${dateString}:`, error);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return records;
      }
      async updateTeacherAttendance(id, attendance) {
        const [updated] = await db.update(teacherAttendance).set({
          ...attendance,
          updatedAt: getCurrentDateTimeIST()
        }).where(eq(teacherAttendance.id, id)).returning();
        if (!updated) {
          throw new Error("Teacher attendance record not found");
        }
        return updated;
      }
      async deleteTeacherAttendance(id) {
        await db.delete(teacherAttendance).where(eq(teacherAttendance.id, id));
      }
      async isTeacherAbsent(teacherId, date2) {
        const attendance = await db.select().from(teacherAttendance).where(
          and(
            eq(teacherAttendance.teacherId, teacherId),
            eq(teacherAttendance.attendanceDate, date2)
          )
        );
        if (attendance.length === 0) {
          return false;
        }
        return attendance[0].status !== "present";
      }
      // Student attendance operations
      async getStudentAttendance(schoolId, date2) {
        const conditions = [eq(studentAttendance.schoolId, schoolId)];
        if (date2) {
          conditions.push(eq(studentAttendance.attendanceDate, date2));
        }
        return await db.select().from(studentAttendance).where(and(...conditions)).orderBy(studentAttendance.attendanceDate);
      }
      async getStudentAttendanceByStudent(studentId, startDate, endDate) {
        const conditions = [eq(studentAttendance.studentId, studentId)];
        if (startDate && endDate) {
          conditions.push(between(studentAttendance.attendanceDate, startDate, endDate));
        } else if (startDate) {
          conditions.push(gte(studentAttendance.attendanceDate, startDate));
        } else if (endDate) {
          conditions.push(lte(studentAttendance.attendanceDate, endDate));
        }
        return await db.select().from(studentAttendance).where(and(...conditions)).orderBy(studentAttendance.attendanceDate);
      }
      async getStudentAttendanceByClass(classId, date2) {
        return await db.select().from(studentAttendance).where(
          and(
            eq(studentAttendance.classId, classId),
            eq(studentAttendance.attendanceDate, date2)
          )
        ).orderBy(studentAttendance.studentId);
      }
      async markStudentAttendance(attendance) {
        const existing = await db.select().from(studentAttendance).where(
          and(
            eq(studentAttendance.studentId, attendance.studentId),
            eq(studentAttendance.attendanceDate, attendance.attendanceDate)
          )
        );
        let result;
        if (existing.length > 0) {
          const [updated] = await db.update(studentAttendance).set({
            ...attendance,
            markedAt: getCurrentDateTimeIST(),
            updatedAt: getCurrentDateTimeIST()
          }).where(eq(studentAttendance.id, existing[0].id)).returning();
          result = updated;
        } else {
          const [created] = await db.insert(studentAttendance).values({
            ...attendance,
            markedAt: getCurrentDateTimeIST()
          }).returning();
          result = created;
        }
        return result;
      }
      async updateStudentAttendance(id, attendance) {
        const [updated] = await db.update(studentAttendance).set({
          ...attendance,
          updatedAt: getCurrentDateTimeIST()
        }).where(eq(studentAttendance.id, id)).returning();
        if (!updated) {
          throw new Error("Student attendance record not found");
        }
        return updated;
      }
      async deleteStudentAttendance(id) {
        await db.delete(studentAttendance).where(eq(studentAttendance.id, id));
      }
      async isStudentAbsent(studentId, date2) {
        const attendance = await db.select().from(studentAttendance).where(
          and(
            eq(studentAttendance.studentId, studentId),
            eq(studentAttendance.attendanceDate, date2)
          )
        );
        if (attendance.length === 0) {
          return false;
        }
        return attendance[0].status !== "present";
      }
      async getStudentAttendanceById(id) {
        const attendance = await db.select().from(studentAttendance).where(eq(studentAttendance.id, id));
        return attendance[0];
      }
      async getStudentByUserId(userId) {
        const student = await db.select().from(students).where(eq(students.userId, userId));
        return student[0];
      }
      // Audit log operations
      async createAuditLog(auditLog) {
        const [log2] = await db.insert(auditLogs).values(auditLog).returning();
        return log2;
      }
      async getAuditLogs(schoolId, limit = 50) {
        return await db.select().from(auditLogs).where(eq(auditLogs.schoolId, schoolId)).orderBy(auditLogs.createdAt).limit(limit);
      }
      // Enhanced teacher operations for daily periods
      async updateTeacherDailyPeriods(schoolId, config) {
        try {
          if (config.applyToAll) {
            await db.update(teachers).set({ maxDailyPeriods: config.maxDailyPeriods }).where(eq(teachers.schoolId, schoolId));
            return {
              success: true,
              message: `Updated daily periods limit to ${config.maxDailyPeriods} for all teachers`
            };
          } else if (config.teacherId) {
            await db.update(teachers).set({ maxDailyPeriods: config.maxDailyPeriods }).where(and(eq(teachers.id, config.teacherId), eq(teachers.schoolId, schoolId)));
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
      async getTeacherSchedule(teacherId, date2) {
        let query = db.select().from(timetableEntries).where(eq(timetableEntries.teacherId, teacherId)).orderBy(timetableEntries.day, timetableEntries.period);
        return await query;
      }
      async getTeacherWorkloadAnalytics(schoolId) {
        const teachersList = await this.getTeachers(schoolId);
        const allEntries = await db.select().from(timetableEntries).innerJoin(teachers, eq(timetableEntries.teacherId, teachers.id)).where(eq(teachers.schoolId, schoolId));
        const workloadData = teachersList.map((teacher) => {
          const teacherEntries = allEntries.filter((entry) => entry.timetable_entries.teacherId === teacher.id);
          const weeklyPeriods = teacherEntries.length;
          const dailyPeriods = {};
          teacherEntries.forEach((entry) => {
            const day = entry.timetable_entries.day;
            dailyPeriods[day] = (dailyPeriods[day] || 0) + 1;
          });
          const avgDailyPeriods = weeklyPeriods / 6;
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
            overloadedTeachers: workloadData.filter((t) => t.isOverloaded).length,
            avgWeeklyPeriods: workloadData.reduce((sum, t) => sum + t.weeklyPeriods, 0) / teachersList.length || 0
          }
        };
      }
      async getTimetableEntriesByTeacher(teacherId) {
        return await db.select().from(timetableEntries).where(and(
          eq(timetableEntries.teacherId, teacherId),
          eq(timetableEntries.isActive, true)
        )).orderBy(timetableEntries.day, timetableEntries.period);
      }
      // Teacher Replacement operations
      async createTeacherReplacement(replacement) {
        const [newReplacement] = await db.insert(teacherReplacements).values(replacement).returning();
        return newReplacement;
      }
      async getAllTeacherReplacements() {
        return await db.select({
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
            id: sql2`orig_teacher.id`,
            name: sql2`orig_teacher.name`,
            email: sql2`orig_teacher.email`
          },
          replacementTeacher: {
            id: sql2`repl_teacher.id`,
            name: sql2`repl_teacher.name`,
            email: sql2`repl_teacher.email`
          },
          school: {
            id: sql2`school.id`,
            name: sql2`school.name`
          },
          replacedByUser: {
            id: sql2`replaced_by_user.id`,
            email: sql2`replaced_by_user.email`
          }
        }).from(teacherReplacements).leftJoin(sql2`${teachers} as orig_teacher`, sql2`orig_teacher.id = ${teacherReplacements.originalTeacherId}`).leftJoin(sql2`${teachers} as repl_teacher`, sql2`repl_teacher.id = ${teacherReplacements.replacementTeacherId}`).leftJoin(schools, eq(teacherReplacements.schoolId, schools.id)).leftJoin(sql2`${users} as replaced_by_user`, sql2`replaced_by_user.id = ${teacherReplacements.replacedBy}`).orderBy(sql2`${teacherReplacements.createdAt} DESC`);
      }
      async getTeacherReplacementsBySchool(schoolId) {
        return await db.select({
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
            id: sql2`orig_teacher.id`,
            name: sql2`orig_teacher.name`,
            email: sql2`orig_teacher.email`
          },
          replacementTeacher: {
            id: sql2`repl_teacher.id`,
            name: sql2`repl_teacher.name`,
            email: sql2`repl_teacher.email`
          },
          replacedByUser: {
            id: sql2`replaced_by_user.id`,
            email: sql2`replaced_by_user.email`
          }
        }).from(teacherReplacements).leftJoin(sql2`${teachers} as orig_teacher`, sql2`orig_teacher.id = ${teacherReplacements.originalTeacherId}`).leftJoin(sql2`${teachers} as repl_teacher`, sql2`repl_teacher.id = ${teacherReplacements.replacementTeacherId}`).leftJoin(sql2`${users} as replaced_by_user`, sql2`replaced_by_user.id = ${teacherReplacements.replacedBy}`).where(eq(teacherReplacements.schoolId, schoolId)).orderBy(sql2`${teacherReplacements.createdAt} DESC`);
      }
      // Enhanced substitution operations
      async getAbsentTeacherAlerts(schoolId, date2) {
        const absentTeachers = await db.select({
          teacher: teachers,
          attendance: teacherAttendance
        }).from(teacherAttendance).innerJoin(teachers, eq(teacherAttendance.teacherId, teachers.id)).where(
          and(
            eq(teachers.schoolId, schoolId),
            eq(teacherAttendance.attendanceDate, date2),
            inArray(teacherAttendance.status, ["absent", "on_leave", "medical_leave", "personal_leave"])
          )
        );
        const alerts = [];
        for (const absent of absentTeachers) {
          const schedule = await db.select().from(timetableEntries).where(eq(timetableEntries.teacherId, absent.teacher.id));
          const dayOfWeek = new Date(date2).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
          const affectedClassesForDay = schedule.filter((entry) => entry.day.toLowerCase() === dayOfWeek);
          alerts.push({
            teacher: absent.teacher,
            attendance: absent.attendance,
            affectedClasses: affectedClassesForDay.length,
            // ✅ Only count classes for the specific absence day
            schedule
          });
        }
        return alerts;
      }
      async findSubstituteTeachers(originalTeacherId, timetableEntryId, date2) {
        const entry = await db.select().from(timetableEntries).where(eq(timetableEntries.id, timetableEntryId)).limit(1);
        if (!entry.length) return [];
        const { day, period, subjectId } = entry[0];
        const originalTeacher = await this.getTeacher(originalTeacherId);
        if (!originalTeacher) return [];
        const sameSubjectTeachers = await db.select().from(teachers).where(
          and(
            eq(teachers.schoolId, originalTeacher.schoolId),
            eq(teachers.isActive, true),
            ne(teachers.id, originalTeacherId)
          )
        );
        const qualifiedTeachers = sameSubjectTeachers.filter((teacher) => {
          const subjectsArray = Array.isArray(teacher.subjects) ? teacher.subjects : [];
          return subjectsArray.includes(subjectId);
        });
        const availableTeachers = [];
        for (const teacher of qualifiedTeachers) {
          const isAbsent = await this.isTeacherAbsent(teacher.id, date2);
          if (isAbsent) continue;
          const conflicts = await db.select().from(timetableEntries).where(
            and(
              eq(timetableEntries.teacherId, teacher.id),
              eq(timetableEntries.day, day),
              eq(timetableEntries.period, period)
            )
          );
          if (conflicts.length === 0) {
            const dailySchedule = await db.select().from(timetableEntries).where(
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
      async autoAssignSubstitute(timetableEntryId, date2, reason, assignedBy) {
        try {
          const entry = await db.select().from(timetableEntries).where(eq(timetableEntries.id, timetableEntryId)).limit(1);
          if (!entry.length) {
            return { success: false, message: "Timetable entry not found" };
          }
          const originalTeacherId = entry[0].teacherId;
          const possibleSubstitutes = await this.findSubstituteTeachers(originalTeacherId, timetableEntryId, date2);
          if (possibleSubstitutes.length === 0) {
            return { success: false, message: "No available substitute teachers found" };
          }
          const substituteTeacher = possibleSubstitutes[0];
          const substitution = await this.createSubstitution({
            originalTeacherId,
            substituteTeacherId: substituteTeacher.id,
            timetableEntryId,
            date: /* @__PURE__ */ new Date(date2 + "T00:00:00Z"),
            reason,
            status: "confirmed"
          });
          const teacher = await this.getTeacher(originalTeacherId);
          await this.createAuditLog({
            schoolId: teacher?.schoolId || "",
            userId: assignedBy,
            action: "SUBSTITUTE",
            entityType: "SUBSTITUTION",
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
      async getTeachersForClass(classId) {
        const assignments = await db.select().from(classSubjectAssignments).where(eq(classSubjectAssignments.classId, classId));
        const teacherIds = assignments.filter((a) => a.assignedTeacherId).map((a) => a.assignedTeacherId);
        if (teacherIds.length === 0) return [];
        const classTeachersResult = await db.select().from(teachers).where(inArray(teachers.id, teacherIds));
        return classTeachersResult;
      }
      async createManualAssignmentAudit(audit) {
        const [created] = await db.insert(manualAssignmentAudits).values(audit).returning();
        return created;
      }
      async getTimetableEntry(id) {
        const [entry] = await db.select().from(timetableEntries).where(eq(timetableEntries.id, id));
        return entry;
      }
      async isTeacherAvailable(teacherId, day, period, date2) {
        if (date2) {
          const isAbsent = await this.isTeacherAbsent(teacherId, date2);
          if (isAbsent) return false;
        }
        const conflicts = await db.select().from(timetableEntries).where(
          and(
            eq(timetableEntries.teacherId, teacherId),
            eq(timetableEntries.day, day),
            eq(timetableEntries.period, period),
            eq(timetableEntries.isActive, true)
          )
        );
        if (conflicts.length > 0) return false;
        const teacher = await this.getTeacher(teacherId);
        if (teacher) {
          const dailySchedule = await db.select().from(timetableEntries).where(
            and(
              eq(timetableEntries.teacherId, teacherId),
              eq(timetableEntries.day, day),
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
      async replaceGlobalTimetableForClass(classId, effectiveTimetable) {
        await db.transaction(async (tx) => {
          await tx.update(timetableEntries).set({ isActive: false }).where(eq(timetableEntries.classId, classId));
          if (effectiveTimetable.length > 0) {
            const newEntries = effectiveTimetable.map((entry) => ({
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
      async clearWeeklyChangesForClass(classId, date2) {
        const selectedDate = new Date(date2);
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const classEntries = await db.select({ id: timetableEntries.id }).from(timetableEntries).where(eq(timetableEntries.classId, classId));
        const entryIds = classEntries.map((entry) => entry.id);
        if (entryIds.length === 0) return;
        await db.update(timetableChanges).set({ isActive: false }).where(
          and(
            inArray(timetableChanges.timetableEntryId, entryIds),
            gte(timetableChanges.changeDate, weekStart.toISOString().split("T")[0]),
            lte(timetableChanges.changeDate, weekEnd.toISOString().split("T")[0])
          )
        );
      }
      // Weekly Timetable Functions
      async getWeeklyTimetable(classId, weekStart) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const results = await db.select().from(weeklyTimetables).where(
          and(
            eq(weeklyTimetables.classId, classId),
            eq(weeklyTimetables.weekStart, weekStart.toISOString().split("T")[0]),
            eq(weeklyTimetables.isActive, true)
          )
        ).limit(1);
        return results.length > 0 ? results[0] : null;
      }
      async createWeeklyTimetable(data) {
        const results = await db.insert(weeklyTimetables).values(data).returning();
        return results[0];
      }
      async updateWeeklyTimetable(id, data) {
        const results = await db.update(weeklyTimetables).set({ ...data, updatedAt: sql2`CURRENT_TIMESTAMP` }).where(eq(weeklyTimetables.id, id)).returning();
        return results[0];
      }
      async createOrUpdateWeeklyTimetable(classId, weekStart, timetableData, modifiedBy, schoolId) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const existing = await this.getWeeklyTimetable(classId, weekStart);
        if (existing) {
          return await this.updateWeeklyTimetable(existing.id, {
            timetableData,
            modifiedBy,
            modificationCount: existing.modificationCount + 1
          });
        } else {
          return await this.createWeeklyTimetable({
            classId,
            weekStart: weekStart.toISOString().split("T")[0],
            weekEnd: weekEnd.toISOString().split("T")[0],
            timetableData,
            modifiedBy,
            modificationCount: 1,
            basedOnGlobalVersion: "current",
            // Track the global version this is based on
            schoolId,
            isActive: true
          });
        }
      }
      async promoteWeeklyTimetableToGlobal(weeklyTimetableId) {
        const weeklyTimetable = await db.select().from(weeklyTimetables).where(eq(weeklyTimetables.id, weeklyTimetableId)).limit(1);
        if (weeklyTimetable.length === 0) {
          throw new Error("Weekly timetable not found");
        }
        const weekly = weeklyTimetable[0];
        await db.transaction(async (tx) => {
          await tx.update(timetableEntries).set({ isActive: false }).where(eq(timetableEntries.classId, weekly.classId));
          if (weekly.timetableData && Array.isArray(weekly.timetableData)) {
            const newEntries = weekly.timetableData.filter((entry) => entry.teacherId && entry.subjectId).map((entry) => ({
              classId: weekly.classId,
              teacherId: entry.teacherId,
              subjectId: entry.subjectId,
              day: entry.day,
              period: entry.period,
              startTime: entry.startTime,
              endTime: entry.endTime,
              room: entry.room || null,
              versionId: null,
              // Will need to create or reference appropriate version
              isActive: true
            }));
            if (newEntries.length > 0) {
              await tx.insert(timetableEntries).values(newEntries);
            }
          }
        });
      }
      // Get all timetable entries for a specific class
      async getTimetableEntriesForClass(classId) {
        return await db.select().from(timetableEntries).where(
          and(
            eq(timetableEntries.classId, classId),
            eq(timetableEntries.isActive, true)
          )
        ).orderBy(timetableEntries.day, timetableEntries.period);
      }
      // Get detailed timetable entries with teacher and subject information
      async getTimetableEntriesWithDetails() {
        return await db.select({
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
        }).from(timetableEntries).leftJoin(teachers, eq(timetableEntries.teacherId, teachers.id)).leftJoin(subjects, eq(timetableEntries.subjectId, subjects.id)).leftJoin(classes, eq(timetableEntries.classId, classes.id)).where(eq(timetableEntries.isActive, true)).orderBy(timetableEntries.day, timetableEntries.period);
      }
      // Deactivate all timetable entries for a specific class
      async deactivateTimetableEntriesForClass(classId) {
        await db.update(timetableEntries).set({
          isActive: false,
          updatedAt: sql2`CURRENT_TIMESTAMP`
        }).where(eq(timetableEntries.classId, classId));
      }
      // Create multiple timetable entries at once
      async createMultipleTimetableEntries(entries) {
        if (entries.length === 0) return [];
        const results = await db.insert(timetableEntries).values(entries).returning();
        return results;
      }
      // Update or create a specific entry in weekly timetable
      async updateWeeklyTimetableEntry(classId, weekStart, weekEnd, day, period, entryData, modifiedBy) {
        return await db.transaction(async (tx) => {
          let [existingWeeklyTimetable] = await tx.select().from(weeklyTimetables).where(
            and(
              eq(weeklyTimetables.classId, classId),
              eq(weeklyTimetables.weekStart, weekStart),
              eq(weeklyTimetables.isActive, true)
            )
          );
          let timetableData = [];
          let modificationCount = 1;
          if (existingWeeklyTimetable) {
            timetableData = Array.isArray(existingWeeklyTimetable.timetableData) ? [...existingWeeklyTimetable.timetableData] : [];
            modificationCount = (existingWeeklyTimetable.modificationCount || 0) + 1;
          } else {
            const globalEntries = await tx.select().from(timetableEntries).where(
              and(
                eq(timetableEntries.classId, classId),
                eq(timetableEntries.isActive, true)
              )
            );
            timetableData = globalEntries.map((entry) => ({
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
          const entryIndex = timetableData.findIndex(
            (entry) => entry.day.toLowerCase() === day.toLowerCase() && entry.period === period
          );
          if (!entryData.teacherId && !entryData.subjectId) {
            if (entryIndex >= 0) {
              timetableData.splice(entryIndex, 1);
            }
          } else {
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
            const [updated] = await tx.update(weeklyTimetables).set({
              timetableData,
              modificationCount,
              modifiedBy,
              updatedAt: sql2`CURRENT_TIMESTAMP`
            }).where(eq(weeklyTimetables.id, existingWeeklyTimetable.id)).returning({ id: weeklyTimetables.id, modificationCount: weeklyTimetables.modificationCount });
            return { id: updated.id, modificationCount: updated.modificationCount };
          } else {
            const [created] = await tx.insert(weeklyTimetables).values({
              classId,
              weekStart,
              weekEnd,
              timetableData,
              modifiedBy,
              modificationCount,
              schoolId: (await tx.select({ schoolId: classes.schoolId }).from(classes).where(eq(classes.id, classId)))[0].schoolId
            }).returning({ id: weeklyTimetables.id, modificationCount: weeklyTimetables.modificationCount });
            return { id: created.id, modificationCount: created.modificationCount };
          }
        });
      }
      // Delete global timetable and current/future weekly timetables for a specific class
      async deleteGlobalAndFutureWeeklyTimetables(classId) {
        const result = { globalDeleted: 0, weeklyDeleted: 0 };
        const now = /* @__PURE__ */ new Date();
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - now.getDay() + 1);
        currentWeekStart.setHours(0, 0, 0, 0);
        const currentWeekStartString = currentWeekStart.toISOString().split("T")[0];
        await db.transaction(async (tx) => {
          const deletedGlobal = await tx.delete(timetableEntries).where(eq(timetableEntries.classId, classId)).returning({ id: timetableEntries.id });
          result.globalDeleted = deletedGlobal.length;
          const deletedWeekly = await tx.delete(weeklyTimetables).where(
            and(
              eq(weeklyTimetables.classId, classId),
              gte(weeklyTimetables.weekStart, currentWeekStartString)
            )
          ).returning({ id: weeklyTimetables.id });
          result.weeklyDeleted = deletedWeekly.length;
        });
        return result;
      }
      // RBAC operations implementation
      async getSystemModules(activeOnly = false) {
        let query = db.select().from(systemModules);
        if (activeOnly) {
          query = query.where(eq(systemModules.isActive, true));
        }
        return await query.orderBy(systemModules.sortOrder);
      }
      async createSystemModule(module) {
        const [created] = await db.insert(systemModules).values(module).returning();
        return created;
      }
      async updateSystemModule(id, module) {
        const [updated] = await db.update(systemModules).set({ ...module, updatedAt: /* @__PURE__ */ new Date() }).where(eq(systemModules.id, id)).returning();
        return updated;
      }
      async getRolePermissions(schoolId, role) {
        const conditions = [eq(rolePermissions.schoolId, schoolId), eq(rolePermissions.isActive, true)];
        if (role) {
          conditions.push(eq(rolePermissions.role, role));
        }
        return await db.select().from(rolePermissions).where(and(...conditions));
      }
      async setRolePermission(permission) {
        const [created] = await db.insert(rolePermissions).values(permission).returning();
        return created;
      }
      async updateRolePermission(id, permission) {
        const [updated] = await db.update(rolePermissions).set({ ...permission, updatedAt: /* @__PURE__ */ new Date() }).where(eq(rolePermissions.id, id)).returning();
        return updated;
      }
      async deleteRolePermission(id) {
        await db.delete(rolePermissions).where(eq(rolePermissions.id, id));
      }
      // Post operations for newsfeed system
      async getPosts(schoolId, feedScope, classId, offset, limit) {
        const conditions = [eq(posts.schoolId, schoolId), eq(posts.isActive, true)];
        if (feedScope) {
          conditions.push(eq(posts.feedScope, feedScope));
        }
        if (classId) {
          conditions.push(eq(posts.classId, classId));
        }
        let query = db.select({
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
          authorName: sql2`CASE 
          WHEN ${users.role} = 'admin' THEN ${schools.name}
          ELSE COALESCE(${users.firstName}, '') || ' ' || COALESCE(${users.lastName}, '')
        END`.as("authorName"),
          authorRole: users.role
        }).from(posts).leftJoin(users, eq(posts.postedById, users.id)).leftJoin(schools, and(eq(users.schoolId, schools.id), eq(users.role, "admin"))).where(and(...conditions)).orderBy(sql2`${posts.createdAt} DESC`);
        if (offset !== void 0) {
          query = query.offset(offset);
        }
        if (limit !== void 0) {
          query = query.limit(limit);
        }
        return await query;
      }
      async getPostById(id) {
        const [post] = await db.select().from(posts).where(eq(posts.id, id));
        return post;
      }
      async createPost(post) {
        const [created] = await db.insert(posts).values(post).returning();
        return created;
      }
      async updatePost(id, post) {
        const [updated] = await db.update(posts).set({ ...post, updatedAt: /* @__PURE__ */ new Date() }).where(eq(posts.id, id)).returning();
        return updated;
      }
      async deletePost(id) {
        await db.delete(posts).where(eq(posts.id, id));
      }
      async getPostsWithFileId(fileId) {
        return await db.select().from(posts).where(
          and(
            eq(posts.isActive, true),
            sql2`(
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
      async isTeacherAssignedToClass(teacherId, classId) {
        try {
          const assignment = await db.select().from(classSubjectAssignments).where(
            and(
              eq(classSubjectAssignments.assignedTeacherId, teacherId),
              eq(classSubjectAssignments.classId, classId)
            )
          ).limit(1);
          return assignment.length > 0;
        } catch (error) {
          console.error("Error checking teacher class assignment:", error);
          return false;
        }
      }
      async isStudentInClass(studentId, classId) {
        try {
          const student = await db.select().from(students).where(
            and(
              eq(students.id, studentId),
              eq(students.classId, classId),
              eq(students.isActive, true)
            )
          ).limit(1);
          return student.length > 0;
        } catch (error) {
          console.error("Error checking student class membership:", error);
          return false;
        }
      }
      async isParentLinkedToClass(parentId, classId) {
        try {
          const parentChildren = await db.select().from(studentParents).innerJoin(students, eq(studentParents.studentId, students.id)).where(
            and(
              eq(studentParents.parentId, parentId),
              eq(students.classId, classId),
              eq(students.isActive, true)
            )
          ).limit(1);
          return parentChildren.length > 0;
        } catch (error) {
          console.error("Error checking parent class link:", error);
          return false;
        }
      }
      async getUserFeed(userId) {
        const user = await this.getUser(userId);
        if (!user || !user.schoolId) return [];
        const conditions = [eq(posts.schoolId, user.schoolId), eq(posts.isActive, true)];
        const schoolCondition = eq(posts.feedScope, "school");
        let classCondition = null;
        if (user.role === "student" && user.studentId) {
          const student = await db.select().from(students).where(eq(students.id, user.studentId));
          if (student[0]?.classId) {
            classCondition = and(eq(posts.feedScope, "class"), eq(posts.classId, student[0].classId));
          }
        }
        if (user.role === "teacher" && user.teacherId) {
          const teacherClasses = await db.select({ classId: classSubjectAssignments.classId }).from(classSubjectAssignments).where(eq(classSubjectAssignments.assignedTeacherId, user.teacherId));
          if (teacherClasses.length > 0) {
            const classIds = teacherClasses.map((c) => c.classId).filter(Boolean);
            if (classIds.length > 0) {
              classCondition = and(eq(posts.feedScope, "class"), inArray(posts.classId, classIds));
            }
          }
        }
        if (user.role === "parent" && user.parentId) {
          const parentChildren = await db.select({ classId: students.classId }).from(studentParents).innerJoin(students, eq(studentParents.studentId, students.id)).where(eq(studentParents.parentId, user.parentId));
          if (parentChildren.length > 0) {
            const classIds = parentChildren.map((c) => c.classId).filter(Boolean);
            if (classIds.length > 0) {
              classCondition = and(eq(posts.feedScope, "class"), inArray(posts.classId, classIds));
            }
          }
        }
        let finalCondition;
        if (classCondition) {
          finalCondition = and(...conditions, or(schoolCondition, classCondition));
        } else {
          finalCondition = and(...conditions, schoolCondition);
        }
        return await db.select().from(posts).where(finalCondition).orderBy(sql2`${posts.createdAt} DESC`);
      }
      async getUserModulePermissions(userId, schoolId) {
        const user = await this.getUser(userId);
        if (!user) return [];
        const userSchoolId = user.role === "super_admin" ? schoolId || user.schoolId : user.schoolId;
        if (!userSchoolId) return [];
        const permissions = await db.select({
          moduleId: rolePermissions.moduleId,
          permissions: rolePermissions.permissions
        }).from(rolePermissions).where(
          and(
            eq(rolePermissions.schoolId, userSchoolId),
            eq(rolePermissions.role, user.role),
            eq(rolePermissions.isActive, true)
          )
        );
        return permissions;
      }
      async checkUserPermission(userId, moduleId, action, schoolId) {
        const user = await this.getUser(userId);
        if (!user) return false;
        if (user.role === "super_admin") return true;
        const userSchoolId = user.schoolId;
        if (!userSchoolId) return false;
        const [permission] = await db.select({ permissions: rolePermissions.permissions }).from(rolePermissions).where(
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
      async getStudents(schoolId, classId, offset, limit) {
        let query = db.select({
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
            updatedAt: classes.updatedAt
          }
        }).from(students).leftJoin(classes, eq(students.classId, classes.id));
        const conditions = [eq(students.isActive, true)];
        if (schoolId) {
          conditions.push(eq(students.schoolId, schoolId));
        }
        if (classId) {
          conditions.push(eq(students.classId, classId));
        }
        query = query.where(and(...conditions));
        if (offset !== void 0) {
          query = query.offset(offset);
        }
        if (limit !== void 0) {
          query = query.limit(limit);
        }
        const results = await query;
        return results.map((result) => ({
          ...result,
          class: result.class.id ? result.class : null
        }));
      }
      async getStudent(id) {
        const [result] = await db.select({
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
            updatedAt: classes.updatedAt
          }
        }).from(students).leftJoin(classes, eq(students.classId, classes.id)).where(eq(students.id, id)).limit(1);
        if (!result) return void 0;
        return {
          ...result,
          class: result.class.id ? result.class : null
        };
      }
      async createStudent(student) {
        const [created] = await db.insert(students).values(student).returning();
        if (created.classId) {
          await this.updateClassStudentCount(created.classId);
        }
        return created;
      }
      async updateStudent(id, student) {
        const originalStudent = await this.getStudent(id);
        const [updated] = await db.update(students).set({ ...student, updatedAt: /* @__PURE__ */ new Date() }).where(eq(students.id, id)).returning();
        if (originalStudent?.classId && originalStudent.classId !== updated.classId) {
          await this.updateClassStudentCount(originalStudent.classId);
        }
        if (updated.classId) {
          await this.updateClassStudentCount(updated.classId);
        }
        return updated;
      }
      async deleteStudent(id) {
        const studentToDelete = await this.getStudent(id);
        await db.update(students).set({ isActive: false }).where(eq(students.id, id));
        if (studentToDelete?.classId) {
          await this.updateClassStudentCount(studentToDelete.classId);
        }
      }
      async getStudentsByClass(classId) {
        return await db.select().from(students).where(and(eq(students.classId, classId), eq(students.isActive, true)));
      }
      // Helper function to recalculate and update student count for a class
      async updateClassStudentCount(classId) {
        const activeStudentCount = await db.select({ count: sql2`count(*)` }).from(students).where(and(eq(students.classId, classId), eq(students.isActive, true)));
        const count = activeStudentCount[0]?.count || 0;
        await db.update(classes).set({ studentCount: count }).where(eq(classes.id, classId));
      }
      // Parent operations
      async getParents(schoolId) {
        let query = db.select().from(parents);
        const conditions = [eq(parents.isActive, true)];
        if (schoolId) {
          conditions.push(eq(parents.schoolId, schoolId));
        }
        return await query.where(and(...conditions));
      }
      async getParent(id) {
        const [parent] = await db.select().from(parents).where(eq(parents.id, id));
        return parent;
      }
      async createParent(parent) {
        const [created] = await db.insert(parents).values(parent).returning();
        return created;
      }
      async updateParent(id, parent) {
        const [updated] = await db.update(parents).set({ ...parent, updatedAt: /* @__PURE__ */ new Date() }).where(eq(parents.id, id)).returning();
        return updated;
      }
      async deleteParent(id) {
        await db.update(parents).set({ isActive: false }).where(eq(parents.id, id));
      }
      // Student-Parent relationship operations
      async linkStudentToParent(studentId, parentId) {
        const [created] = await db.insert(studentParents).values({
          studentId,
          parentId
        }).returning();
        return created;
      }
      async unlinkStudentFromParent(studentId, parentId) {
        await db.delete(studentParents).where(
          and(
            eq(studentParents.studentId, studentId),
            eq(studentParents.parentId, parentId)
          )
        );
      }
      async getParentChildren(parentId) {
        return await db.select({
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
        }).from(studentParents).innerJoin(students, eq(studentParents.studentId, students.id)).where(and(
          eq(studentParents.parentId, parentId),
          eq(students.isActive, true)
        ));
      }
      async getStudentParents(studentId) {
        return await db.select({
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
        }).from(studentParents).innerJoin(parents, eq(studentParents.parentId, parents.id)).where(and(
          eq(studentParents.studentId, studentId),
          eq(parents.isActive, true)
        ));
      }
      async getStudentParentsWithDetails(studentId) {
        const results = await db.select({
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
        }).from(studentParents).innerJoin(parents, eq(studentParents.parentId, parents.id)).where(and(
          eq(studentParents.studentId, studentId),
          eq(parents.isActive, true)
        ));
        return results.map((row) => ({
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
      async getStudentCredentials(studentId) {
        const [studentUser] = await db.select({
          loginId: users.loginId,
          temporaryPassword: users.temporaryPasswordPlainText,
          hasTemporaryPassword: sql2`${users.temporaryPassword} IS NOT NULL`,
          temporaryPasswordExpiresAt: users.temporaryPasswordExpiresAt
        }).from(users).where(and(
          eq(users.studentId, studentId),
          eq(users.role, "student"),
          eq(users.isActive, true)
        ));
        const [student] = await db.select({ admissionNumber: students.admissionNumber }).from(students).where(eq(students.id, studentId));
        let parentUser = null;
        if (student) {
          const parentLoginId = `P${student.admissionNumber}`;
          const [foundParentUser] = await db.select({
            loginId: users.loginId,
            temporaryPassword: users.temporaryPasswordPlainText,
            hasTemporaryPassword: sql2`${users.temporaryPassword} IS NOT NULL`,
            temporaryPasswordExpiresAt: users.temporaryPasswordExpiresAt
          }).from(users).where(and(
            eq(users.loginId, parentLoginId),
            eq(users.role, "parent"),
            eq(users.isActive, true)
          ));
          parentUser = foundParentUser || null;
        }
        return {
          studentLogin: studentUser ? {
            loginId: studentUser.loginId,
            temporaryPassword: studentUser.temporaryPassword || void 0,
            hasTemporaryPassword: studentUser.hasTemporaryPassword,
            expiresAt: studentUser.temporaryPasswordExpiresAt?.toISOString() || null
          } : null,
          parentLogin: parentUser ? {
            loginId: parentUser.loginId,
            temporaryPassword: parentUser.temporaryPassword || void 0,
            hasTemporaryPassword: parentUser.hasTemporaryPassword,
            expiresAt: parentUser.temporaryPasswordExpiresAt?.toISOString() || null
          } : null
        };
      }
      async refreshStudentCredentials(studentId) {
        const [student] = await db.select({
          id: students.id,
          admissionNumber: students.admissionNumber,
          schoolId: students.schoolId,
          firstName: students.firstName,
          lastName: students.lastName,
          email: students.email
        }).from(students).where(eq(students.id, studentId));
        if (!student) {
          throw new Error("Student not found");
        }
        const studentTempPassword = generateTemporaryPassword();
        const parentTempPassword = generateTemporaryPassword();
        const hashedStudentTempPassword = await bcrypt.hash(studentTempPassword, 12);
        const hashedParentTempPassword = await bcrypt.hash(parentTempPassword, 12);
        const tempPasswordExpiry = generateTemporaryPasswordExpiry();
        const studentLoginId = student.admissionNumber;
        const [existingStudentUser] = await db.select({ id: users.id }).from(users).where(and(
          eq(users.loginId, studentLoginId),
          eq(users.role, "student"),
          eq(users.schoolId, student.schoolId)
        ));
        if (existingStudentUser) {
          await db.update(users).set({
            temporaryPassword: hashedStudentTempPassword,
            temporaryPasswordPlainText: studentTempPassword,
            temporaryPasswordExpiresAt: tempPasswordExpiry,
            isFirstLogin: true,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(users.id, existingStudentUser.id));
        } else {
          await db.insert(users).values({
            email: student.email || null,
            loginId: studentLoginId,
            passwordHash: await bcrypt.hash("default-password-please-change", 12),
            // Default password hash
            temporaryPassword: hashedStudentTempPassword,
            temporaryPasswordPlainText: studentTempPassword,
            temporaryPasswordExpiresAt: tempPasswordExpiry,
            role: "student",
            schoolId: student.schoolId,
            studentId: student.id,
            isFirstLogin: true,
            isActive: true
          });
        }
        const parentLoginId = `P${student.admissionNumber}`;
        const [existingParentUser] = await db.select({ id: users.id }).from(users).where(and(
          eq(users.loginId, parentLoginId),
          eq(users.role, "parent"),
          eq(users.schoolId, student.schoolId)
        ));
        if (existingParentUser) {
          await db.update(users).set({
            temporaryPassword: hashedParentTempPassword,
            temporaryPasswordPlainText: parentTempPassword,
            temporaryPasswordExpiresAt: tempPasswordExpiry,
            isFirstLogin: true,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(users.id, existingParentUser.id));
        } else {
          await db.insert(users).values({
            email: null,
            // Parent email can be set later through profile
            loginId: parentLoginId,
            passwordHash: await bcrypt.hash("default-password-please-change", 12),
            // Default password hash
            temporaryPassword: hashedParentTempPassword,
            temporaryPasswordPlainText: parentTempPassword,
            temporaryPasswordExpiresAt: tempPasswordExpiry,
            role: "parent",
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
      async getStudentByAdmissionNumber(admissionNumber, schoolId) {
        const [student] = await db.select().from(students).where(and(
          eq(students.admissionNumber, admissionNumber),
          eq(students.schoolId, schoolId),
          eq(students.isActive, true)
        ));
        return student;
      }
      async linkParentToStudent(parentId, studentId) {
        const [created] = await db.insert(studentParents).values({
          studentId,
          parentId
        }).returning();
        return created;
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/auth.ts
import bcrypt2 from "bcryptjs";
import jwt from "jsonwebtoken";
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt2.hash(password, saltRounds);
}
async function comparePasswords(password, hashedPassword) {
  return await bcrypt2.compare(password, hashedPassword);
}
async function hashTemporaryPassword(password) {
  const saltRounds = 12;
  return await bcrypt2.hash(password, saltRounds);
}
async function compareTemporaryPassword(password, hashedPassword) {
  return await bcrypt2.compare(password, hashedPassword);
}
function generateTemporaryPasswordExpiry2(hoursFromNow = 48) {
  const expiryDate = /* @__PURE__ */ new Date();
  expiryDate.setHours(expiryDate.getHours() + hoursFromNow);
  return expiryDate;
}
function isTemporaryPasswordExpired(expiresAt) {
  if (!expiresAt) return true;
  return /* @__PURE__ */ new Date() > expiresAt;
}
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  try {
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
}
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}
async function login(req, res) {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;
    let user = await storage.getUserByEmail(email);
    if (!user) {
      user = await storage.getUserByLoginId(email);
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const authUser = user;
    let isValidPassword = false;
    let usingTemporaryPassword = false;
    if (authUser.temporaryPassword) {
      if (isTemporaryPasswordExpired(authUser.temporaryPasswordExpiresAt)) {
        return res.status(401).json({
          message: "Temporary password has expired. Please contact your administrator.",
          temporaryPasswordExpired: true
        });
      }
      const tempPasswordValid = await compareTemporaryPassword(password, authUser.temporaryPassword);
      if (tempPasswordValid) {
        isValidPassword = true;
        usingTemporaryPassword = true;
      }
    }
    if (!isValidPassword) {
      isValidPassword = await comparePasswords(password, authUser.passwordHash);
    }
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (authUser.role !== "super_admin" && authUser.schoolId) {
      const school = await storage.getSchool(authUser.schoolId);
      if (!school || !school.isActive) {
        return res.status(403).json({
          message: "Account access is currently unavailable. Please contact support."
        });
      }
    }
    await storage.updateUser(authUser.id, { lastLoginAt: /* @__PURE__ */ new Date() });
    const token = generateToken(authUser);
    const safeUser = {
      id: authUser.id,
      email: authUser.email,
      loginId: authUser.loginId,
      role: authUser.role,
      isFirstLogin: authUser.isFirstLogin,
      schoolId: authUser.schoolId,
      teacherId: authUser.teacherId,
      studentId: authUser.studentId,
      parentId: authUser.parentId,
      firstName: authUser.firstName,
      lastName: authUser.lastName,
      passwordChangedAt: authUser.passwordChangedAt,
      lastLoginAt: authUser.lastLoginAt,
      isActive: authUser.isActive,
      createdBy: authUser.createdBy,
      createdAt: authUser.createdAt,
      updatedAt: authUser.updatedAt
    };
    res.json({
      token,
      user: safeUser,
      requiresPasswordChange: authUser.isFirstLogin || usingTemporaryPassword,
      usingTemporaryPassword
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
}
async function changePassword(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }
    const authUser = req.user;
    let isCurrentPasswordValid = false;
    if (authUser.temporaryPassword) {
      if (!isTemporaryPasswordExpired(authUser.temporaryPasswordExpiresAt)) {
        const tempPasswordValid = await compareTemporaryPassword(currentPassword, authUser.temporaryPassword);
        if (tempPasswordValid) {
          isCurrentPasswordValid = true;
        }
      }
    }
    if (!isCurrentPasswordValid) {
      isCurrentPasswordValid = await comparePasswords(currentPassword, authUser.passwordHash);
    }
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    const hashedNewPassword = await hashPassword(newPassword);
    await storage.updateUser(authUser.id, {
      passwordHash: hashedNewPassword,
      passwordChangedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    if (authUser.temporaryPassword) {
      await storage.clearTemporaryPassword(authUser.id);
    }
    if (authUser.isFirstLogin) {
      await storage.updateUser(authUser.id, {
        isFirstLogin: false,
        passwordChangedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
    res.json({
      message: "Password changed successfully",
      passwordChanged: true
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ message: "Password change failed" });
  }
}
async function firstLoginPasswordChange(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }
    const authUser = req.user;
    if (!authUser.isFirstLogin && !authUser.temporaryPassword) {
      return res.status(403).json({ message: "This endpoint is only for first-time login password changes" });
    }
    const hashedNewPassword = await hashPassword(newPassword);
    await storage.updateUser(authUser.id, {
      passwordHash: hashedNewPassword,
      passwordChangedAt: /* @__PURE__ */ new Date(),
      isFirstLogin: false,
      updatedAt: /* @__PURE__ */ new Date()
    });
    if (authUser.temporaryPassword) {
      await storage.clearTemporaryPassword(authUser.id);
    }
    res.json({
      message: "Password changed successfully",
      passwordChanged: true
    });
  } catch (error) {
    console.error("First login password change error:", error);
    res.status(500).json({ message: "Password change failed" });
  }
}
function generateLoginId(type, admissionNumber) {
  if (type === "teacher") {
    const empNumber = Math.floor(1e5 + Math.random() * 9e5);
    return `EMP${empNumber}`;
  } else if (type === "student") {
    return admissionNumber || `ADM${Math.floor(1e5 + Math.random() * 9e5)}`;
  } else if (type === "parent") {
    if (!admissionNumber) {
      throw new Error("Admission number required for parent login ID");
    }
    return `P${admissionNumber}`;
  }
  throw new Error("Invalid user type");
}
function generateTemporaryPasswordString() {
  const crypto2 = __require("crypto");
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    const randomIndex = crypto2.randomInt(0, chars.length);
    result += chars.charAt(randomIndex);
  }
  return result;
}
async function setTemporaryPassword(req, res) {
  try {
    if (!req.user || !["super_admin", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    const { userId, temporaryPassword, expiryHours = 48 } = req.body;
    if (!userId || !temporaryPassword) {
      return res.status(400).json({ message: "User ID and temporary password are required" });
    }
    if (temporaryPassword.length < 6) {
      return res.status(400).json({ message: "Temporary password must be at least 6 characters long" });
    }
    const targetUser = await storage.getUser(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (req.user.role === "admin" && targetUser.schoolId !== req.user.schoolId) {
      return res.status(403).json({ message: "Access denied. User belongs to different school." });
    }
    const hashedTempPassword = await hashTemporaryPassword(temporaryPassword);
    const expiresAt = generateTemporaryPasswordExpiry2(expiryHours);
    await storage.setTemporaryPassword(userId, hashedTempPassword, expiresAt);
    await storage.updateUser(userId, { isFirstLogin: true });
    res.json({
      message: "Temporary password set successfully",
      expiresAt: expiresAt.toISOString(),
      temporaryPasswordSet: true
    });
  } catch (error) {
    console.error("Set temporary password error:", error);
    res.status(500).json({ message: "Setting temporary password failed" });
  }
}
async function registerSchoolAdmin(req, res) {
  try {
    if (!req.user || req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied. Super Admin required." });
    }
    const { email, password, firstName, lastName, schoolId } = req.body;
    if (!email || !password || !schoolId) {
      return res.status(400).json({ message: "Email, password, and school ID are required" });
    }
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    const hashedPassword = await hashPassword(password);
    const newUser = await storage.createUser({
      email,
      passwordHash: hashedPassword,
      role: "admin",
      schoolId,
      firstName: firstName || null,
      lastName: lastName || null,
      teacherId: null
    });
    const safeUser = {
      id: newUser.id,
      email: newUser.email,
      loginId: newUser.loginId,
      role: newUser.role,
      isFirstLogin: newUser.isFirstLogin,
      schoolId: newUser.schoolId,
      teacherId: newUser.teacherId,
      studentId: newUser.studentId,
      parentId: newUser.parentId,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      passwordChangedAt: newUser.passwordChangedAt,
      lastLoginAt: newUser.lastLoginAt,
      isActive: newUser.isActive,
      createdBy: newUser.createdBy,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };
    res.status(201).json({
      message: "School admin account created successfully",
      user: safeUser
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
}
async function createTeacher(req, res) {
  try {
    const { email, firstName, lastName, schoolId, subjectIds } = req.body;
    if (!firstName || !lastName || !schoolId) {
      return res.status(400).json({ message: "First name, last name, and school ID are required" });
    }
    if (req.user.role === "admin" && req.user.schoolId !== schoolId) {
      return res.status(403).json({ message: "Access denied to this school" });
    }
    const loginId = generateLoginId("teacher");
    const tempPassword = generateTemporaryPasswordString();
    const hashedTempPassword = await hashTemporaryPassword(tempPassword);
    const tempPasswordExpiry = generateTemporaryPasswordExpiry2(48);
    let teacherId = null;
    if (subjectIds && subjectIds.length > 0) {
      const newTeacher = await storage.createTeacher({
        firstName,
        lastName,
        email: email || null,
        contactNumber: null,
        subjectIds,
        schoolId,
        isActive: true
      });
      teacherId = newTeacher.id;
    }
    const newUser = await storage.createUser({
      email: email || null,
      loginId,
      passwordHash: await hashPassword(generateTemporaryPasswordString()),
      // Random secure default
      temporaryPassword: hashedTempPassword,
      temporaryPasswordExpiresAt: tempPasswordExpiry,
      role: "teacher",
      isFirstLogin: true,
      schoolId,
      teacherId,
      firstName,
      lastName,
      isActive: true,
      createdBy: req.user.id
    });
    res.status(201).json({
      message: "Teacher account created successfully",
      user: {
        id: newUser.id,
        loginId: newUser.loginId,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        schoolId: newUser.schoolId,
        teacherId: newUser.teacherId
      },
      credentials: {
        loginId,
        temporaryPassword: tempPassword,
        expiresAt: tempPasswordExpiry.toISOString()
      }
    });
  } catch (error) {
    console.error("Create teacher error:", error);
    res.status(500).json({ message: "Teacher creation failed" });
  }
}
async function createStudent(req, res) {
  try {
    const { firstName, lastName, schoolId, admissionNumber, classId, email, parentInfo } = req.body;
    if (!firstName || !lastName || !schoolId) {
      return res.status(400).json({ message: "First name, last name, and school ID are required" });
    }
    if (req.user.role === "admin" && req.user.schoolId !== schoolId) {
      return res.status(403).json({ message: "Access denied to this school" });
    }
    const finalAdmissionNumber = admissionNumber || `ADM${Math.floor(1e5 + Math.random() * 9e5)}`;
    const loginId = generateLoginId("student", finalAdmissionNumber);
    const tempPassword = generateTemporaryPasswordString();
    const hashedTempPassword = await hashTemporaryPassword(tempPassword);
    const tempPasswordExpiry = generateTemporaryPasswordExpiry2(48);
    const newStudent = await storage.createStudent({
      admissionNumber: finalAdmissionNumber,
      firstName,
      lastName,
      email: email || null,
      schoolId,
      classId: classId || null,
      isActive: true,
      status: "active"
    });
    const newUser = await storage.createUser({
      email: email || null,
      loginId,
      passwordHash: await hashPassword(generateTemporaryPasswordString()),
      // Random secure default
      temporaryPassword: hashedTempPassword,
      temporaryPasswordExpiresAt: tempPasswordExpiry,
      role: "student",
      isFirstLogin: true,
      schoolId,
      studentId: newStudent.id,
      firstName,
      lastName,
      isActive: true,
      createdBy: req.user.id
    });
    res.status(201).json({
      message: "Student account created successfully",
      user: {
        id: newUser.id,
        loginId: newUser.loginId,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        schoolId: newUser.schoolId,
        studentId: newUser.studentId,
        admissionNumber: finalAdmissionNumber
      },
      credentials: {
        loginId,
        temporaryPassword: tempPassword,
        expiresAt: tempPasswordExpiry.toISOString()
      }
    });
  } catch (error) {
    console.error("Create student error:", error);
    res.status(500).json({ message: "Student creation failed" });
  }
}
async function createParent(req, res) {
  try {
    const { firstName, lastName, schoolId, studentAdmissionNumber, email, contactNumber, relation } = req.body;
    if (!firstName || !lastName || !schoolId || !studentAdmissionNumber) {
      return res.status(400).json({ message: "First name, last name, school ID, and student admission number are required" });
    }
    if (req.user.role === "admin" && req.user.schoolId !== schoolId) {
      return res.status(403).json({ message: "Access denied to this school" });
    }
    const student = await storage.getStudentByAdmissionNumber(studentAdmissionNumber, schoolId);
    if (!student) {
      return res.status(404).json({ message: "Student not found with this admission number" });
    }
    const loginId = generateLoginId("parent", studentAdmissionNumber);
    const tempPassword = generateTemporaryPasswordString();
    const hashedTempPassword = await hashTemporaryPassword(tempPassword);
    const tempPasswordExpiry = generateTemporaryPasswordExpiry2(48);
    const newParent = await storage.createParent({
      firstName,
      lastName,
      email: email || null,
      contactNumber: contactNumber || null,
      schoolId,
      relation: relation || "parent"
    });
    await storage.linkParentToStudent(newParent.id, student.id);
    const newUser = await storage.createUser({
      email: email || null,
      loginId,
      passwordHash: await hashPassword(generateTemporaryPasswordString()),
      // Random secure default
      temporaryPassword: hashedTempPassword,
      temporaryPasswordExpiresAt: tempPasswordExpiry,
      role: "parent",
      isFirstLogin: true,
      schoolId,
      parentId: newParent.id,
      firstName,
      lastName,
      isActive: true,
      createdBy: req.user.id
    });
    res.status(201).json({
      message: "Parent account created successfully",
      user: {
        id: newUser.id,
        loginId: newUser.loginId,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        schoolId: newUser.schoolId,
        parentId: newUser.parentId
      },
      credentials: {
        loginId,
        temporaryPassword: tempPassword,
        expiresAt: tempPasswordExpiry.toISOString()
      },
      linkedStudent: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber
      }
    });
  } catch (error) {
    console.error("Create parent error:", error);
    res.status(500).json({ message: "Parent creation failed" });
  }
}
function setupCustomAuth(app2) {
  app2.post("/api/auth/login", login);
  app2.post("/api/auth/register-school-admin", authenticateToken, registerSchoolAdmin);
  app2.post("/api/auth/change-password", authenticateToken, changePassword);
  app2.post("/api/auth/first-login-password-change", authenticateToken, firstLoginPasswordChange);
  app2.post("/api/auth/set-temporary-password", authenticateToken, setTemporaryPassword);
  app2.post("/api/auth/create-teacher", authenticateToken, requireRole("super_admin", "admin"), createTeacher);
  app2.post("/api/auth/create-student", authenticateToken, requireRole("super_admin", "admin"), createStudent);
  app2.post("/api/auth/create-parent", authenticateToken, requireRole("super_admin", "admin"), createParent);
}
var JWT_SECRET;
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    init_storage();
    init_schema();
    JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "development" ? "dev-jwt-secret-change-in-production" : (() => {
      console.error("FATAL: JWT_SECRET environment variable is required for secure token signing");
      process.exit(1);
    })());
  }
});

// server/seedSampleData.ts
var seedSampleData_exports = {};
__export(seedSampleData_exports, {
  generateSampleStudentsAndParents: () => generateSampleStudentsAndParents,
  generateTempPassword: () => generateTempPassword
});
async function generateSampleStudentsAndParents() {
  console.log("\u{1F331} Starting sample data generation for Students & Parents...");
  try {
    const schools2 = await storage.getSchools();
    const school = schools2.find((s) => s.name.includes("Wonder")) || schools2[0];
    if (!school) {
      console.error("\u274C No school found");
      return;
    }
    console.log(`\u{1F4DA} Using school: ${school.name} (ID: ${school.id})`);
    const classes2 = await storage.getClasses(school.id);
    const class5A = classes2.find((c) => c.grade === "5" && c.section === "A");
    const class6B = classes2.find((c) => c.grade === "6" && c.section === "B");
    console.log(`\u{1F4DA} Available classes: ${classes2.map((c) => `Grade ${c.grade} Section ${c.section || "N/A"}`).join(", ")}`);
    if (!class5A) {
      console.log("\u26A0\uFE0F Grade 5 Section A not found, will need to create it");
    }
    if (!class6B) {
      console.log("\u26A0\uFE0F Grade 6 Section B not found, will need to create it");
    }
    let actualClass5A = class5A;
    let actualClass6B = class6B;
    if (!actualClass5A) {
      console.log("\u{1F3D7}\uFE0F Creating Grade 5 Section A...");
      actualClass5A = await storage.createClass({
        grade: "5",
        section: "A",
        studentCount: 30,
        schoolId: school.id
      });
      console.log(`\u2705 Created Grade 5 Section A (ID: ${actualClass5A.id})`);
    }
    if (!actualClass6B) {
      console.log("\u{1F3D7}\uFE0F Creating Grade 6 Section B...");
      actualClass6B = await storage.createClass({
        grade: "6",
        section: "B",
        studentCount: 25,
        schoolId: school.id
      });
      console.log(`\u2705 Created Grade 6 Section B (ID: ${actualClass6B.id})`);
    }
    const studentsData = [
      {
        firstName: "Riya",
        lastName: "Sharma",
        admissionNumber: "S001",
        email: "riya.sharma@example.com",
        contactNumber: "9876543210",
        dateOfBirth: "2013-03-12",
        // 12-03-2013
        gender: "female",
        address: "123 MG Road, Bangalore",
        guardianName: "Anil Sharma",
        guardianRelation: "Father",
        guardianContact: "9876543200",
        emergencyContact: "9876543201",
        targetClass: { grade: "5", section: "A" }
      },
      {
        firstName: "Arjun",
        lastName: "Verma",
        admissionNumber: "S002",
        email: "arjun.verma@example.com",
        contactNumber: "9876543211",
        dateOfBirth: "2013-08-20",
        // 20-08-2013
        gender: "male",
        address: "456 Brigade Road, Bangalore",
        guardianName: "Sunita Verma",
        guardianRelation: "Mother",
        guardianContact: "9876543202",
        emergencyContact: "9876543203",
        targetClass: { grade: "5", section: "A" }
      },
      {
        firstName: "Meera",
        lastName: "Khan",
        admissionNumber: "S003",
        email: "meera.khan@example.com",
        contactNumber: "9876543212",
        dateOfBirth: "2012-11-10",
        // 10-11-2012
        gender: "female",
        address: "789 Koramangala, Bangalore",
        guardianName: "Imran Khan",
        guardianRelation: "Father",
        guardianContact: "9876543204",
        emergencyContact: "9876543205",
        targetClass: { grade: "6", section: "B" }
      }
    ];
    const parentsData = [
      {
        firstName: "Anil",
        lastName: "Sharma",
        email: "anil.sharma@gmail.com",
        contactNumber: "9876543200",
        relationToStudent: "father",
        occupation: "Software Engineer",
        address: "123 MG Road, Bangalore",
        studentAdmissionNumber: "S001"
      },
      {
        firstName: "Sunita",
        lastName: "Verma",
        email: "sunita.verma@gmail.com",
        contactNumber: "9876543202",
        relationToStudent: "mother",
        occupation: "Teacher",
        address: "456 Brigade Road, Bangalore",
        studentAdmissionNumber: "S002"
      },
      {
        firstName: "Imran",
        lastName: "Khan",
        email: "imran.khan@gmail.com",
        contactNumber: "9876543204",
        relationToStudent: "father",
        occupation: "Business Owner",
        address: "789 Koramangala, Bangalore",
        studentAdmissionNumber: "S003"
      }
    ];
    const createdStudents = [];
    const createdParents = [];
    console.log("\u{1F468}\u200D\u{1F393} Creating students...");
    for (const studentData of studentsData) {
      try {
        let targetClassId;
        if (studentData.targetClass.grade === "5" && studentData.targetClass.section === "A") {
          targetClassId = actualClass5A.id;
        } else if (studentData.targetClass.grade === "6" && studentData.targetClass.section === "B") {
          targetClassId = actualClass6B.id;
        } else {
          throw new Error(`No class found for Grade ${studentData.targetClass.grade} Section ${studentData.targetClass.section}`);
        }
        const { targetClass, ...studentCreateData } = studentData;
        const student = await storage.createStudent({
          ...studentCreateData,
          classId: targetClassId,
          schoolId: school.id,
          status: "active",
          isActive: true
        });
        console.log(`\u2705 Created student: ${student.firstName} ${student.lastName} (${student.admissionNumber})`);
        createdStudents.push(student);
        const tempPassword = generateTempPassword();
        const hashedTempPassword = await hashTemporaryPassword(tempPassword);
        const tempPasswordExpiry = generateTemporaryPasswordExpiry2(72);
        const studentUser = await storage.createUser({
          email: student.email,
          loginId: student.admissionNumber,
          // Students login with admission number
          passwordHash: "",
          // No regular password initially
          temporaryPassword: hashedTempPassword,
          temporaryPasswordExpiresAt: tempPasswordExpiry,
          role: "student",
          isFirstLogin: true,
          schoolId: school.id,
          studentId: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          isActive: true,
          createdAt: /* @__PURE__ */ new Date()
        });
        console.log(`\u{1F511} Created student login: ${student.admissionNumber} / ${tempPassword}`);
      } catch (error) {
        console.error(`\u274C Error creating student ${studentData.firstName}:`, error);
      }
    }
    console.log("\u{1F46A} Creating parents...");
    for (const parentData of parentsData) {
      try {
        const parent = await storage.createParent({
          firstName: parentData.firstName,
          lastName: parentData.lastName,
          email: parentData.email,
          contactNumber: parentData.contactNumber,
          relationToStudent: parentData.relationToStudent,
          occupation: parentData.occupation,
          address: parentData.address,
          schoolId: school.id,
          isActive: true
        });
        console.log(`\u2705 Created parent: ${parent.firstName} ${parent.lastName} (${parent.email})`);
        createdParents.push(parent);
        const student = createdStudents.find((s) => s.admissionNumber === parentData.studentAdmissionNumber);
        if (student) {
          await storage.linkParentToStudent(parent.id, student.id);
          console.log(`\u{1F517} Linked parent ${parent.firstName} to student ${student.firstName}`);
        }
        const tempPassword = generateTempPassword();
        const hashedTempPassword = await hashTemporaryPassword(tempPassword);
        const tempPasswordExpiry = generateTemporaryPasswordExpiry2(72);
        const parentUser = await storage.createUser({
          email: parent.email,
          loginId: parent.email,
          // Parents login with email
          passwordHash: "",
          // No regular password initially
          temporaryPassword: hashedTempPassword,
          temporaryPasswordExpiresAt: tempPasswordExpiry,
          role: "parent",
          isFirstLogin: true,
          schoolId: school.id,
          parentId: parent.id,
          firstName: parent.firstName,
          lastName: parent.lastName,
          isActive: true,
          createdAt: /* @__PURE__ */ new Date()
        });
        console.log(`\u{1F511} Created parent login: ${parent.email} / ${tempPassword}`);
      } catch (error) {
        console.error(`\u274C Error creating parent ${parentData.firstName}:`, error);
      }
    }
    console.log("\u{1F389} Sample data generation completed successfully!");
    console.log("\n\u{1F4CB} Summary:");
    console.log(`\u2705 Created ${createdStudents.length} students`);
    console.log(`\u2705 Created ${createdParents.length} parents`);
    console.log(`\u2705 Generated login credentials with temporary passwords`);
    console.log("\n\u{1F510} Test Login Credentials:");
    console.log("STUDENTS (Login with Admission Number):");
    studentsData.forEach((student, index2) => {
      console.log(`  ${student.admissionNumber} - Use temporary password shown above`);
    });
    console.log("\nPARENTS (Login with Email):");
    parentsData.forEach((parent, index2) => {
      console.log(`  ${parent.email} - Use temporary password shown above`);
    });
    return {
      students: createdStudents,
      parents: createdParents,
      school,
      classes: {
        class5A: actualClass5A,
        class6B: actualClass6B
      }
    };
  } catch (error) {
    console.error("\u274C Error generating sample data:", error);
    throw error;
  }
}
function generateTempPassword() {
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
var init_seedSampleData = __esm({
  "server/seedSampleData.ts"() {
    "use strict";
    init_storage();
    init_auth();
  }
});

// server/index.ts
import express3 from "express";

// server/routes.ts
init_storage();
import { createServer } from "http";

// server/services/scheduler.ts
init_storage();
var TimetableScheduler = class {
  timeSlots = [];
  constructor() {
    this.initializeTimeSlots();
  }
  async initializeFromStructure(schoolId) {
    try {
      let structure;
      if (schoolId) {
        structure = await storage.getTimetableStructureBySchool(schoolId);
      }
      if (structure) {
        this.timeSlots = [];
        const workingDays = structure.workingDays || ["monday", "tuesday", "wednesday", "thursday", "friday"];
        const timeSlots = structure.timeSlots || [
          { period: 1, startTime: "08:00", endTime: "08:45" },
          { period: 2, startTime: "08:45", endTime: "09:30" },
          { period: 3, startTime: "09:30", endTime: "10:15" },
          { period: 4, startTime: "10:15", endTime: "11:00" },
          { period: 5, startTime: "11:15", endTime: "12:00" },
          { period: 6, startTime: "12:00", endTime: "12:45" },
          { period: 7, startTime: "12:45", endTime: "13:30" },
          { period: 8, startTime: "13:30", endTime: "14:15" }
        ];
        for (const day of workingDays) {
          for (const slot of timeSlots) {
            if (!slot.isBreak) {
              this.timeSlots.push({
                day,
                period: slot.period,
                startTime: slot.startTime,
                endTime: slot.endTime
              });
            }
          }
        }
      }
    } catch (error) {
      console.warn("Could not load timetable structure, using defaults:", error);
      this.initializeTimeSlots();
    }
  }
  initializeTimeSlots() {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    const periodTimes = [
      { period: 1, startTime: "08:00", endTime: "08:45" },
      { period: 2, startTime: "08:45", endTime: "09:30" },
      { period: 3, startTime: "09:30", endTime: "10:15" },
      { period: 4, startTime: "10:15", endTime: "11:00" },
      { period: 5, startTime: "11:15", endTime: "12:00" },
      { period: 6, startTime: "12:00", endTime: "12:45" },
      { period: 7, startTime: "12:45", endTime: "13:30" },
      { period: 8, startTime: "13:30", endTime: "14:15" }
    ];
    for (const day of days) {
      for (const time of periodTimes) {
        this.timeSlots.push({
          day,
          period: time.period,
          startTime: time.startTime,
          endTime: time.endTime
        });
      }
    }
  }
  async generateTimetable(classId, userSchoolId) {
    try {
      let classes2;
      if (classId) {
        const singleClass = await storage.getClass(classId);
        if (!singleClass) {
          return {
            success: false,
            message: "Class not found."
          };
        }
        classes2 = [singleClass];
      } else {
        classes2 = await storage.getClasses();
        if (userSchoolId) {
          classes2 = classes2.filter((cls) => cls.schoolId === userSchoolId);
        } else {
          return {
            success: false,
            message: "Please generate timetable for specific classes."
          };
        }
      }
      const schoolId = classes2[0]?.schoolId;
      if (!schoolId) {
        return {
          success: false,
          message: "Classes must be associated with a school."
        };
      }
      const [subjects2, teachers2] = await Promise.all([
        storage.getSubjects(),
        storage.getTeachers(schoolId)
        // Only get teachers from the same school
      ]);
      if (classes2.length === 0 || subjects2.length === 0 || teachers2.length === 0) {
        return {
          success: false,
          message: "Please ensure you have added classes, subjects, and teachers before generating timetable."
        };
      }
      await this.initializeFromStructure(schoolId);
      const now = /* @__PURE__ */ new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 5);
      const weekStart = startOfWeek.toISOString().split("T")[0];
      const weekEnd = endOfWeek.toISOString().split("T")[0];
      let versionsCreated = [];
      for (const classData of classes2) {
        await storage.deleteTimetableEntriesForClass(classData.id);
      }
      for (const classData of classes2) {
        const existingVersions = await storage.getTimetableVersionsForClass(classData.id, weekStart, weekEnd);
        const newVersionNumber = existingVersions.length + 1;
        const versionString2 = `v0.${newVersionNumber}`;
        const newVersion = await storage.createTimetableVersion({
          classId: classData.id,
          version: versionString2,
          weekStart,
          weekEnd,
          isActive: true
          // New version becomes active
        });
        await storage.setActiveVersion(newVersion.id, classData.id);
        versionsCreated.push({
          classId: classData.id,
          version: versionString2,
          versionId: newVersion.id
        });
      }
      const constraints = await this.buildConstraints(classes2);
      const schedule = await this.solveSchedule(constraints, teachers2, subjects2);
      if (schedule.length === 0) {
        return {
          success: false,
          message: "Unable to generate a valid timetable with current constraints. Please check teacher availability and subject requirements."
        };
      }
      const scheduleWithVersions = schedule.map((entry) => {
        const classVersion = versionsCreated.find((v) => v.classId === entry.classId);
        if (classVersion) {
          return {
            ...entry,
            versionId: classVersion.versionId
          };
        }
        return entry;
      });
      await storage.bulkCreateTimetableEntries(scheduleWithVersions);
      const versionString = versionsCreated.length > 0 ? versionsCreated[0].version : "v0.1";
      return {
        success: true,
        message: `Timetable generated successfully with ${schedule.length} entries.`,
        entriesCreated: schedule.length,
        version: versionString
      };
    } catch (error) {
      console.error("Error generating timetable:", error);
      return {
        success: false,
        message: "An error occurred while generating the timetable. Please try again."
      };
    }
  }
  async buildConstraints(classes2) {
    const constraints = [];
    for (const classData of classes2) {
      const assignments = await storage.getClassSubjectAssignments(classData.id);
      for (const assignment of assignments) {
        const assignedTeachers = assignment.assignedTeacherId ? [assignment.assignedTeacherId] : [];
        constraints.push({
          classId: classData.id,
          subjectId: assignment.subjectId,
          periodsNeeded: assignment.weeklyFrequency,
          preferredTeachers: assignedTeachers
        });
      }
    }
    return constraints;
  }
  async solveSchedule(constraints, teachers2, subjects2) {
    const schedule = [];
    const assignments = /* @__PURE__ */ new Map();
    const dailySubjectCount = /* @__PURE__ */ new Map();
    const getDailySubjectCount = (classId, day, subjectId) => {
      const dayKey = `${classId}-${day}`;
      return dailySubjectCount.get(dayKey)?.get(subjectId) || 0;
    };
    const incrementDailySubjectCount = (classId, day, subjectId) => {
      const dayKey = `${classId}-${day}`;
      if (!dailySubjectCount.has(dayKey)) {
        dailySubjectCount.set(dayKey, /* @__PURE__ */ new Map());
      }
      const dayMap = dailySubjectCount.get(dayKey);
      const currentCount = dayMap.get(subjectId) || 0;
      dayMap.set(subjectId, currentCount + 1);
    };
    const getSubjectPeriodsOnDay = (classId, day, subjectId) => {
      return schedule.filter(
        (entry) => entry.classId === classId && entry.day === day && entry.subjectId === subjectId
      ).map((entry) => entry.period).sort((a, b) => a - b);
    };
    const findConsecutiveSlot = (classId, day, subjectId, timeSlots) => {
      const existingPeriods = getSubjectPeriodsOnDay(classId, day, subjectId);
      if (existingPeriods.length === 0) return null;
      for (const existingPeriod of existingPeriods) {
        const nextPeriod = existingPeriod + 1;
        const consecutiveSlot = timeSlots.find(
          (slot) => slot.day === day && slot.period === nextPeriod
        );
        if (consecutiveSlot) {
          const slotKey = `${classId}-${day}-${nextPeriod}`;
          if (!assignments.has(slotKey)) {
            return consecutiveSlot;
          }
        }
      }
      return null;
    };
    const shuffledConstraints = [...constraints].sort(() => Math.random() - 0.5);
    for (const constraint of shuffledConstraints) {
      const subject = subjects2.find((s) => s.id === constraint.subjectId);
      if (!subject) continue;
      let eligibleTeachers = teachers2.filter((t) => {
        const subjectsArray = Array.isArray(t.subjects) ? t.subjects : [];
        return subjectsArray.includes(constraint.subjectId) && t.isActive;
      });
      if (constraint.preferredTeachers.length > 0) {
        const assignedTeachers = eligibleTeachers.filter(
          (t) => constraint.preferredTeachers.includes(t.id)
        );
        if (assignedTeachers.length > 0) {
          eligibleTeachers = assignedTeachers;
        }
      }
      if (eligibleTeachers.length === 0) {
        const assignedTeacherText = constraint.preferredTeachers.length > 0 ? ` (assigned teacher not available or not qualified)` : "";
        console.warn(`No teachers available for subject ${subject.name}${assignedTeacherText}`);
        continue;
      }
      let periodsScheduled = 0;
      const prioritizedTimeSlots = [...this.timeSlots].sort((a, b) => {
        const aCount = getDailySubjectCount(constraint.classId, a.day, constraint.subjectId);
        const bCount = getDailySubjectCount(constraint.classId, b.day, constraint.subjectId);
        const aConsecutive = findConsecutiveSlot(constraint.classId, a.day, constraint.subjectId, this.timeSlots);
        const bConsecutive = findConsecutiveSlot(constraint.classId, b.day, constraint.subjectId, this.timeSlots);
        if (aConsecutive && a.day === aConsecutive.day && a.period === aConsecutive.period) {
          return -1;
        }
        if (bConsecutive && b.day === bConsecutive.day && b.period === bConsecutive.period) {
          return 1;
        }
        if (aCount !== bCount) {
          return aCount - bCount;
        }
        return Math.random() - 0.5;
      });
      for (const timeSlot of prioritizedTimeSlots) {
        if (periodsScheduled >= constraint.periodsNeeded) break;
        const slotKey = `${constraint.classId}-${timeSlot.day}-${timeSlot.period}`;
        if (assignments.has(slotKey)) continue;
        const currentDailyCount = getDailySubjectCount(constraint.classId, timeSlot.day, constraint.subjectId);
        if (currentDailyCount >= 2) continue;
        if (currentDailyCount === 1) {
          const existingPeriods = getSubjectPeriodsOnDay(constraint.classId, timeSlot.day, constraint.subjectId);
          const isConsecutive = existingPeriods.some(
            (period) => Math.abs(period - timeSlot.period) === 1
          );
          if (!isConsecutive) continue;
        }
        const availableTeacher = eligibleTeachers.find((teacher) => {
          const teacherAvailability = teacher.availability[timeSlot.day];
          if (!teacherAvailability || teacherAvailability.length === 0) {
            return true;
          }
          if (!teacherAvailability.includes(`${timeSlot.startTime}-${timeSlot.endTime}`)) {
            return false;
          }
          const assignmentKeys = Array.from(assignments.keys());
          for (const slotKey2 of assignmentKeys) {
            const [, assignedDay, assignedPeriod] = slotKey2.split("-");
            if (assignedDay === timeSlot.day && parseInt(assignedPeriod) === timeSlot.period) {
              const assignedTeachers = assignments.get(slotKey2);
              if (assignedTeachers && assignedTeachers.has(teacher.id)) {
                return false;
              }
            }
          }
          const teacherDailyHours = this.getTeacherDailyHours(teacher.id, timeSlot.day, schedule);
          if (teacherDailyHours >= teacher.maxDailyPeriods) {
            return false;
          }
          return true;
        });
        if (availableTeacher) {
          const assignmentSet = /* @__PURE__ */ new Set();
          assignmentSet.add(availableTeacher.id);
          assignments.set(slotKey, assignmentSet);
          incrementDailySubjectCount(constraint.classId, timeSlot.day, constraint.subjectId);
          schedule.push({
            classId: constraint.classId,
            teacherId: availableTeacher.id,
            subjectId: constraint.subjectId,
            day: timeSlot.day,
            period: timeSlot.period,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            room: null,
            isActive: true
          });
          periodsScheduled++;
        }
      }
      if (periodsScheduled < constraint.periodsNeeded) {
        console.warn(
          `Could only schedule ${periodsScheduled}/${constraint.periodsNeeded} periods for ${subject.name}`
        );
      }
    }
    return schedule;
  }
  // Helper method to count teacher's daily hours
  getTeacherDailyHours(teacherId, day, schedule) {
    return schedule.filter(
      (entry) => entry.teacherId === teacherId && entry.day === day
    ).length;
  }
  // Enhanced conflict detection with daily period limits
  async hasConflictEnhanced(teacherId, classId, day, period, schedule, teachers2) {
    const timeConflict = schedule.some(
      (entry) => (entry.teacherId === teacherId || entry.classId === classId) && entry.day === day && entry.period === period
    );
    if (timeConflict) return true;
    const teacher = teachers2.find((t) => t.id === teacherId);
    if (teacher) {
      const dailyPeriods = this.getTeacherDailyHours(teacherId, day, schedule);
      if (dailyPeriods >= teacher.maxDailyPeriods) {
        return true;
      }
    }
    return false;
  }
  // Enhanced availability check for substitute assignment
  async isTeacherAvailableForSubstitute(teacherId, day, period, date2, excludeEntryId) {
    try {
      const isAbsent = await storage.isTeacherAbsent(teacherId, date2);
      if (isAbsent) return false;
      const schedule = await storage.getTimetableForTeacher(teacherId);
      const hasConflict = schedule.some(
        (entry) => entry.id !== excludeEntryId && entry.day === day && entry.period === period
      );
      if (hasConflict) return false;
      const teacher = await storage.getTeacher(teacherId);
      if (teacher) {
        const dailySchedule = schedule.filter((entry) => entry.day === day);
        if (dailySchedule.length >= teacher.maxDailyPeriods) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error checking teacher availability:", error);
      return false;
    }
  }
  // Workload balancing method for enhanced scheduling
  async optimizeTeacherWorkload(schoolId) {
    try {
      const analytics = await storage.getTeacherWorkloadAnalytics(schoolId);
      const overloadedTeachers = analytics.teachers.filter((t) => t.isOverloaded);
      if (overloadedTeachers.length === 0) {
        return {
          success: true,
          message: "All teachers are within their daily period limits",
          analytics
        };
      }
      for (const teacher of overloadedTeachers) {
        console.log(`Attempting to rebalance workload for teacher: ${teacher.teacherName}`);
      }
      return {
        success: true,
        message: `Found ${overloadedTeachers.length} overloaded teachers. Manual review recommended.`,
        analytics
      };
    } catch (error) {
      console.error("Error optimizing teacher workload:", error);
      return {
        success: false,
        message: "Failed to optimize teacher workload"
      };
    }
  }
  async validateTimetable() {
    const conflicts = [];
    try {
      const timetableEntries2 = await storage.getTimetableEntries();
      const teacherSchedule = /* @__PURE__ */ new Map();
      for (const entry of timetableEntries2) {
        const slotKey = `${entry.day}-${entry.period}`;
        if (!teacherSchedule.has(entry.teacherId)) {
          teacherSchedule.set(entry.teacherId, /* @__PURE__ */ new Set());
        }
        const teacherSlots = teacherSchedule.get(entry.teacherId);
        if (teacherSlots.has(slotKey)) {
          const conflictEntry = timetableEntries2.find(
            (e) => e.teacherId === entry.teacherId && e.day === entry.day && e.period === entry.period && e.classId !== entry.classId
          );
          if (conflictEntry) {
            conflicts.push(
              `Teacher conflict: Teacher ${entry.teacherId} is scheduled for both Class ${entry.classId} and Class ${conflictEntry.classId} on ${entry.day} period ${entry.period}`
            );
          }
        } else {
          teacherSlots.add(slotKey);
        }
      }
      const roomSchedule = /* @__PURE__ */ new Map();
      for (const entry of timetableEntries2) {
        if (!entry.room) continue;
        const slotKey = `${entry.day}-${entry.period}`;
        if (!roomSchedule.has(entry.room)) {
          roomSchedule.set(entry.room, /* @__PURE__ */ new Set());
        }
        const roomSlots = roomSchedule.get(entry.room);
        if (roomSlots.has(slotKey)) {
          conflicts.push(
            `Room conflict: Room ${entry.room} is double-booked on ${entry.day} period ${entry.period}`
          );
        } else {
          roomSlots.add(slotKey);
        }
      }
      const classSubjectCount = /* @__PURE__ */ new Map();
      for (const entry of timetableEntries2) {
        if (!classSubjectCount.has(entry.classId)) {
          classSubjectCount.set(entry.classId, /* @__PURE__ */ new Map());
        }
        const subjectCount = classSubjectCount.get(entry.classId);
        const currentCount = subjectCount.get(entry.subjectId) || 0;
        subjectCount.set(entry.subjectId, currentCount + 1);
      }
      const classes2 = await storage.getClasses();
      for (const classData of classes2) {
        const assignments = await storage.getClassSubjectAssignments(classData.id);
        const actualCounts = classSubjectCount.get(classData.id) || /* @__PURE__ */ new Map();
        for (const assignment of assignments) {
          const actualCount = actualCounts.get(assignment.subjectId) || 0;
          if (actualCount < assignment.weeklyFrequency) {
            conflicts.push(
              `Insufficient periods: Class ${classData.grade}-${classData.section} needs ${assignment.weeklyFrequency} periods of ${assignment.subject?.name || "Unknown Subject"} but only has ${actualCount}`
            );
          }
          if (actualCount > assignment.weeklyFrequency) {
            conflicts.push(
              `Excess periods: Class ${classData.grade}-${classData.section} has ${actualCount} periods of ${assignment.subject?.name || "Unknown Subject"} but only needs ${assignment.weeklyFrequency}`
            );
          }
        }
      }
    } catch (error) {
      console.error("Error validating timetable:", error);
      conflicts.push("Unable to validate timetable due to system error");
    }
    return {
      isValid: conflicts.length === 0,
      conflicts
    };
  }
  async suggestOptimizations() {
    const suggestions = [];
    try {
      const [timetableEntries2, teachers2] = await Promise.all([
        storage.getTimetableEntries(),
        storage.getTeachers()
      ]);
      const teacherWorkload = /* @__PURE__ */ new Map();
      for (const entry of timetableEntries2) {
        const current = teacherWorkload.get(entry.teacherId) || 0;
        teacherWorkload.set(entry.teacherId, current + 1);
      }
      const workloads = Array.from(teacherWorkload.values());
      const avgWorkload = workloads.reduce((a, b) => a + b, 0) / workloads.length;
      const maxWorkload = Math.max(...workloads);
      const minWorkload = Math.min(...workloads);
      if (maxWorkload - minWorkload > avgWorkload * 0.3) {
        suggestions.push("Consider redistributing teacher workload for better balance.");
      }
      const morningPeriods = timetableEntries2.filter((e) => e.period <= 4).length;
      const afternoonPeriods = timetableEntries2.filter((e) => e.period >= 5).length;
      if (afternoonPeriods > morningPeriods * 1.5) {
        suggestions.push("Consider moving some subjects to morning hours for better student engagement.");
      }
      const dailySchedules = /* @__PURE__ */ new Map();
      for (const entry of timetableEntries2) {
        if (!dailySchedules.has(entry.classId)) {
          dailySchedules.set(entry.classId, /* @__PURE__ */ new Map());
        }
        const classSchedule = dailySchedules.get(entry.classId);
        if (!classSchedule.has(entry.day)) {
          classSchedule.set(entry.day, []);
        }
        classSchedule.get(entry.day).push(entry.subjectId);
      }
      let hasConsecutiveSameSubjects = false;
      dailySchedules.forEach((schedule, classId) => {
        schedule.forEach((subjects2, day) => {
          for (let i = 0; i < subjects2.length - 1; i++) {
            if (subjects2[i] === subjects2[i + 1]) {
              hasConsecutiveSameSubjects = true;
              return;
            }
          }
        });
      });
      if (hasConsecutiveSameSubjects) {
        suggestions.push("Avoid scheduling the same subject in consecutive periods for better learning outcomes.");
      }
      if (suggestions.length === 0) {
        suggestions.push("Current timetable appears well-optimized. No major issues detected.");
      }
    } catch (error) {
      console.error("Error generating optimization suggestions:", error);
      suggestions.push("Unable to analyze timetable for optimization opportunities.");
    }
    return suggestions;
  }
};
var scheduler = new TimetableScheduler();

// server/services/csvProcessor.ts
var CSVProcessor = class {
  static parseCSV(csvContent) {
    const lines = csvContent.split("\n").filter((line) => line.trim());
    return lines.map((line) => {
      const values = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  }
  static processTeachersCSV(csvContent) {
    const errors = [];
    const teachers2 = [];
    try {
      const rows = this.parseCSV(csvContent);
      if (rows.length === 0) {
        return { success: false, data: [], errors: ["CSV file is empty"] };
      }
      const headers = rows[0].map((h) => h.toLowerCase().trim());
      const expectedHeaders = ["name", "email", "subjects", "max_load", "availability"];
      const missingHeaders = expectedHeaders.filter((h) => !headers.includes(h));
      if (missingHeaders.length > 0) {
        errors.push(`Missing required headers: ${missingHeaders.join(", ")}`);
        return { success: false, data: [], errors };
      }
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < expectedHeaders.length) {
          errors.push(`Row ${i + 1}: Insufficient columns`);
          continue;
        }
        try {
          const name = row[headers.indexOf("name")]?.trim();
          const email = row[headers.indexOf("email")]?.trim();
          const subjectsStr = row[headers.indexOf("subjects")]?.trim();
          const maxLoadStr = row[headers.indexOf("max_load")]?.trim();
          const availabilityStr = row[headers.indexOf("availability")]?.trim();
          if (!name || !email) {
            errors.push(`Row ${i + 1}: Name and email are required`);
            continue;
          }
          const subjects2 = subjectsStr ? subjectsStr.split(";").map((s) => s.trim()).filter(Boolean) : [];
          const maxLoad = maxLoadStr ? parseInt(maxLoadStr) : 30;
          let availability = {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: []
          };
          if (availabilityStr) {
            try {
              availability = JSON.parse(availabilityStr);
            } catch {
              availability = {
                monday: ["09:00-09:45", "09:45-10:30", "11:00-11:45", "11:45-12:30", "13:30-14:15", "14:15-15:00"],
                tuesday: ["09:00-09:45", "09:45-10:30", "11:00-11:45", "11:45-12:30", "13:30-14:15", "14:15-15:00"],
                wednesday: ["09:00-09:45", "09:45-10:30", "11:00-11:45", "11:45-12:30", "13:30-14:15", "14:15-15:00"],
                thursday: ["09:00-09:45", "09:45-10:30", "11:00-11:45", "11:45-12:30", "13:30-14:15", "14:15-15:00"],
                friday: ["09:00-09:45", "09:45-10:30", "11:00-11:45", "11:45-12:30", "13:30-14:15", "14:15-15:00"]
              };
            }
          }
          teachers2.push({
            name,
            email,
            subjects: subjects2,
            maxLoad,
            availability,
            isActive: true
          });
        } catch (error) {
          errors.push(`Row ${i + 1}: Error processing data - ${error}`);
        }
      }
      return {
        success: errors.length === 0,
        data: teachers2,
        errors
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [`Failed to process CSV: ${error}`]
      };
    }
  }
  static processSubjectsCSV(csvContent) {
    const errors = [];
    const subjects2 = [];
    try {
      const rows = this.parseCSV(csvContent);
      if (rows.length === 0) {
        return { success: false, data: [], errors: ["CSV file is empty"] };
      }
      const headers = rows[0].map((h) => h.toLowerCase().trim());
      const expectedHeaders = ["name", "code", "periods_per_week", "color"];
      const missingHeaders = expectedHeaders.filter((h) => !headers.includes(h));
      if (missingHeaders.length > 0) {
        errors.push(`Missing required headers: ${missingHeaders.join(", ")}`);
        return { success: false, data: [], errors };
      }
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < expectedHeaders.length) {
          errors.push(`Row ${i + 1}: Insufficient columns`);
          continue;
        }
        try {
          const name = row[headers.indexOf("name")]?.trim();
          const code = row[headers.indexOf("code")]?.trim();
          const periodsPerWeekStr = row[headers.indexOf("periods_per_week")]?.trim();
          const color = row[headers.indexOf("color")]?.trim() || "#3B82F6";
          if (!name || !code || !periodsPerWeekStr) {
            errors.push(`Row ${i + 1}: Name, code, and periods_per_week are required`);
            continue;
          }
          const periodsPerWeek = parseInt(periodsPerWeekStr);
          if (isNaN(periodsPerWeek) || periodsPerWeek <= 0) {
            errors.push(`Row ${i + 1}: periods_per_week must be a positive number`);
            continue;
          }
          subjects2.push({
            name,
            code,
            periodsPerWeek,
            color: color.startsWith("#") ? color : `#${color}`
          });
        } catch (error) {
          errors.push(`Row ${i + 1}: Error processing data - ${error}`);
        }
      }
      return {
        success: errors.length === 0,
        data: subjects2,
        errors
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [`Failed to process CSV: ${error}`]
      };
    }
  }
  static processClassesCSV(csvContent) {
    const errors = [];
    const classes2 = [];
    try {
      const rows = this.parseCSV(csvContent);
      if (rows.length === 0) {
        return { success: false, data: [], errors: ["CSV file is empty"] };
      }
      const headers = rows[0].map((h) => h.toLowerCase().trim());
      const expectedHeaders = ["grade", "section", "student_count", "required_subjects", "room"];
      const missingHeaders = expectedHeaders.filter((h) => !headers.includes(h));
      if (missingHeaders.length > 0) {
        errors.push(`Missing required headers: ${missingHeaders.join(", ")}`);
        return { success: false, data: [], errors };
      }
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < expectedHeaders.length) {
          errors.push(`Row ${i + 1}: Insufficient columns`);
          continue;
        }
        try {
          const grade = row[headers.indexOf("grade")]?.trim();
          const section = row[headers.indexOf("section")]?.trim();
          const studentCountStr = row[headers.indexOf("student_count")]?.trim();
          const requiredSubjectsStr = row[headers.indexOf("required_subjects")]?.trim();
          const room = row[headers.indexOf("room")]?.trim();
          if (!grade) {
            errors.push(`Row ${i + 1}: Grade is required`);
            continue;
          }
          const finalSection = section || "";
          const studentCount = studentCountStr ? parseInt(studentCountStr) : 0;
          const requiredSubjects = requiredSubjectsStr ? requiredSubjectsStr.split(";").map((s) => s.trim()).filter(Boolean) : [];
          classes2.push({
            grade,
            section: finalSection,
            studentCount,
            requiredSubjects,
            room
          });
        } catch (error) {
          errors.push(`Row ${i + 1}: Error processing data - ${error}`);
        }
      }
      return {
        success: errors.length === 0,
        data: classes2,
        errors
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [`Failed to process CSV: ${error}`]
      };
    }
  }
};

// server/routes.ts
init_schema();
init_auth();
import { z as z5 } from "zod";
import multer from "multer";
import * as XLSX3 from "xlsx";

// server/chatService.ts
init_storage();
import { z as z3 } from "zod";

// server/llamaService.ts
import axios from "axios";
var LlamaService = class {
  groqApiKey;
  baseURL = "https://api.groq.com/openai/v1";
  isConnected = false;
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || "";
    if (!this.groqApiKey) {
      console.log("\u274C GROQ_API_KEY not found in environment variables");
      return;
    }
  }
  /**
   * Test connection to Groq API with LLAMA model
   */
  async testConnection() {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: "Hello, are you working?"
            }
          ],
          max_tokens: 10,
          temperature: 0.1
        },
        {
          headers: {
            "Authorization": `Bearer ${this.groqApiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 1e4
        }
      );
      this.isConnected = response.status === 200;
      if (this.isConnected) {
        console.log("\u2705 Connected to LLAMA via Groq API");
      } else {
        console.log("\u274C LLAMA connection failed - Invalid response");
      }
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      console.log("\u274C LLAMA connection failed:", error.response?.data?.error || error.message);
      return false;
    }
  }
  /**
   * Parse user query using LLAMA to extract intent and entities
   */
  async parseIntent(userQuery) {
    return this.parseIntentWithContext(userQuery, "");
  }
  /**
   * Parse user query using LLAMA with conversation context to extract intent and entities
   */
  async parseIntentWithContext(userQuery, conversationContext) {
    if (!this.isConnected) {
      throw new Error("LLAMA is not connected");
    }
    const systemPrompt = `You are an intelligent intent parser for a school management system called Chrona. 

Your task is to analyze user queries and extract:
1. Intent: The main action the user wants to perform
2. Entities: Key information needed to execute the action
3. Confidence: How confident you are in your parsing (0.0-1.0)

Available intents:
- MARK_ATTENDANCE: Mark student/teacher absent, present, or late
- CREATE_CLASS: Create/register a new class or section (phrases: "create class", "register class", "add class", "new class")
- VIEW_TIMETABLE: Show timetable for class, teacher, or subject
- MANAGE_FEES: Handle fee-related queries
- SCHEDULE_EXAM: Create or manage exams
- SEND_COMMUNICATION: Send messages, notifications, or announcements
- VIEW_REPORTS: Generate attendance, performance, or other reports
- CREATE_STUDENT: Create/register a new student record (phrases: "create student", "register student", "add student", "new student", "enroll student")
- VIEW_STUDENTS: Show list of students in school or specific class
- UPDATE_STUDENT: Modify student information
- CREATE_TEACHER: Create/register a new teacher record (phrases: "create teacher", "register teacher", "add teacher", "new teacher", "hire teacher")
- VIEW_TEACHERS: Show list of teachers in school or by subject
- UPDATE_TEACHER: Modify teacher information
- CREATE_SUBJECT: Create a new subject
- VIEW_SUBJECTS: Show list of subjects
- FIND_SUBSTITUTE: Find substitute teachers for absent teachers
- AUTO_ASSIGN_SUBSTITUTE: Automatically assign substitute teachers
- GENERATE_TIMETABLE: Generate AI-powered school timetable
- MODIFY_TIMETABLE: Make manual timetable adjustments
- TEACHER_WORKLOAD: View teacher workload analytics
- CHANGE_THEME: Change application theme/appearance (phrases: "change theme", "dark mode", "light mode", "switch to dark", "change to black")
- OPEN_SETTINGS: Open settings page
- DOWNLOAD_STUDENT_LIST: Download student list in Excel format (phrases: "download student list", "export students", "download students excel", "get student data")
- DOWNLOAD_TEACHER_LIST: Download teacher list in Excel format (phrases: "download teacher list", "export teachers", "download teachers excel", "get teacher data")
- ANALYTICS_QUERY: Execute analytics and data queries with natural language (phrases: "analytics", "show analytics", "view analytics", "open analytics", "show stats", "show attendance", "check attendance", "view attendance", "attendance today", "attendance of all teachers", "show me attendance", "teacher attendance", "student attendance", "attendance status", "attendance for students", "attendance for teachers", "top teachers absent", "class with highest absenteeism", "attendance report", "show me data", "which class", "who are the", "teachers who were absent", "find teachers", "attendance statistics", "analytics dashboard", "performance analytics")
- EXPORT_ANALYTICS: Export analytics results to Excel/CSV (phrases: "export this", "download this report", "export as excel", "export as csv", "save this data")
- UNKNOWN: When the intent doesn't match any of the above

Entity types to extract:
- person_name: Name of student/teacher
- person_type: Type of person ("students", "teachers", "student", "teacher") - VERY IMPORTANT for attendance queries
- class_name: Class or section (e.g., "8A", "7B", "Class 10")
- subject: Subject name
- date: Date mentioned (today, tomorrow, specific date)
- status: attendance status (present, absent, late)
- action_type: specific action within the intent
- theme_name: Theme preference (dark, light, black, white, system)
- mode: Mode preference (dark, light, system)
- time_period: Time range for analytics (e.g., "last month", "September", "last week", "this year")
- export_format: Export format preference ("excel", "csv", "xlsx")
- analytics_type: Type of analytics query ("absence", "attendance", "performance", "top N")
- number: Numeric value (e.g., "3" in "top 3 teachers")
- metric: What to measure/analyze ("absenteeism", "attendance rate", "performance")

IMPORTANT: Use the conversation context below to resolve references like "him", "her", "that teacher", "the class we discussed", etc.

${conversationContext}

Return ONLY a JSON object in this exact format:
{
  "intent": "INTENT_NAME",
  "entities": {
    "key": "value"
  },
  "confidence": 0.95
}

User Query: "${userQuery}"`;
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userQuery
            }
          ],
          max_tokens: 200,
          temperature: 0.1
        },
        {
          headers: {
            "Authorization": `Bearer ${this.groqApiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 15e3
        }
      );
      const content = response.data.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error("Empty response from LLAMA");
      }
      try {
        let jsonContent = content;
        const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          jsonContent = codeBlockMatch[1];
        }
        const firstBrace = jsonContent.indexOf("{");
        if (firstBrace !== -1) {
          let braceCount = 0;
          let endIndex = firstBrace;
          for (let i = firstBrace; i < jsonContent.length; i++) {
            if (jsonContent[i] === "{") braceCount++;
            if (jsonContent[i] === "}") braceCount--;
            if (braceCount === 0) {
              endIndex = i;
              break;
            }
          }
          jsonContent = jsonContent.substring(firstBrace, endIndex + 1);
        }
        console.log("\u{1F50D} Attempting to parse JSON:", jsonContent.trim());
        const parsed = JSON.parse(jsonContent.trim());
        console.log("\u2705 JSON parsed successfully:", parsed);
        if (!parsed.intent) {
          console.log("\u274C Missing intent field");
          throw new Error("Missing intent field in LLAMA response");
        }
        if (!parsed.entities) {
          console.log("\u274C Missing entities field");
          throw new Error("Missing entities field in LLAMA response");
        }
        if (typeof parsed.confidence !== "number") {
          console.log("\u274C Invalid confidence type:", typeof parsed.confidence, parsed.confidence);
          throw new Error("Invalid confidence type in LLAMA response");
        }
        console.log("\u2705 All validation passed for intent:", parsed.intent);
        return {
          intent: parsed.intent,
          entities: parsed.entities,
          confidence: Math.max(0, Math.min(1, parsed.confidence))
          // Clamp between 0-1
        };
      } catch (jsonError) {
        console.log("\u274C Failed to parse LLAMA JSON response (first 200 chars):", content.substring(0, 200) + "...");
        console.log("\u274C JSON parsing error details:", jsonError instanceof Error ? jsonError.message : String(jsonError));
        return {
          intent: "UNKNOWN",
          entities: {},
          confidence: 0
        };
      }
    } catch (error) {
      console.log("\u274C LLAMA intent parsing failed:", error.response?.data?.error || error.message);
      throw error;
    }
  }
  /**
   * Classify if user query is conversational or school management task
   */
  async classifyQueryType(userQuery) {
    if (!this.isConnected) {
      throw new Error("LLAMA is not connected");
    }
    const systemPrompt = `You are a query classifier for a school management system. 

Your task is to determine if the user query is:
1. "conversation" - Casual conversation, general questions, greetings, asking about date/time, weather, how are you, etc.
2. "school_management" - Tasks related to school operations like attendance, timetables, students, teachers, classes, etc.

Examples of CONVERSATION:
- "Hi", "Hello", "How are you?"
- "What's the date today?", "What time is it?"
- "Good morning", "How's your day?"
- "What's the weather like?"
- "Tell me a joke"
- "How are things going?"

Examples of SCHOOL_MANAGEMENT:
- "Mark John absent today"
- "Show me class 8A timetable"
- "Create a new student"
- "Who are the teachers for Math?"
- "Generate attendance report"
- "Change theme to dark", "Switch to light mode"
- "Change to black theme", "Set theme to dark"
- "Open settings", "Show settings"

Respond with ONLY one word: "conversation" or "school_management"

User Query: "${userQuery}"`;
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userQuery
            }
          ],
          max_tokens: 10,
          temperature: 0.1
        },
        {
          headers: {
            "Authorization": `Bearer ${this.groqApiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 1e4
        }
      );
      let content = response.data.choices[0]?.message?.content?.trim() || "";
      content = content.replace(/['".,!?]/g, "").toLowerCase();
      if (content.includes("conversation")) {
        return "conversation";
      } else if (content.includes("school_management") || content.includes("school management")) {
        return "school_management";
      } else {
        console.log("\u26A0\uFE0F Unclear classification response:", content, "defaulting to conversation for better UX");
        return "conversation";
      }
    } catch (error) {
      console.log("\u274C LLAMA query classification failed:", error.response?.data?.error || error.message);
      return "school_management";
    }
  }
  /**
   * Generate natural conversational response for UNKNOWN intents
   */
  async generateConversationalResponse(message, userRole, schoolId, conversationContext) {
    try {
      const currentDateTime = (/* @__PURE__ */ new Date()).toISOString();
      const currentDateFormatted = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      const currentTimeFormatted = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
      const systemPrompt = `You are Chroney, a friendly and intelligent AI assistant for school management. You can help with:

\u{1F3EB} **School Management Tasks:**
- Managing attendance (mark teachers/students present/absent)
- Creating and managing classes 
- Viewing timetables and schedules
- School administration tasks

\u{1F44B} **Conversational Guidelines:**
- Be warm, helpful, and friendly
- Use natural language like ChatGPT
- Ask follow-up questions when appropriate
- Offer specific examples of what you can help with
- Keep responses concise but personable
- Remember previous conversation context to provide coherent responses
- For date/time questions, use the current information provided below

\u{1F4C5} **Current Date & Time Information:**
- Current date: ${currentDateFormatted}
- Current time: ${currentTimeFormatted}
- ISO timestamp: ${currentDateTime}

Current user role: ${userRole}

${conversationContext || ""}

Respond naturally to: "${message}"`;
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: message
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        },
        {
          headers: {
            "Authorization": `Bearer ${this.groqApiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 1e4
        }
      );
      const content = response.data.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error("Empty response from LLAMA");
      }
      return content;
    } catch (error) {
      console.log("\u274C LLAMA conversational response failed:", error.response?.data?.error || error.message);
      throw error;
    }
  }
  /**
   * Get connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }
  /**
   * Initialize the service and test connection
   */
  async initialize() {
    if (!this.groqApiKey) {
      console.log("\u274C Cannot initialize LLAMA service: GROQ_API_KEY not found");
      return false;
    }
    console.log("\u{1F504} Initializing LLAMA service...");
    return await this.testConnection();
  }
};
var llamaService = new LlamaService();
llamaService.initialize().catch((error) => {
  console.log("\u274C Failed to initialize LLAMA service:", error.message);
});
var llamaService_default = llamaService;

// server/intentMapping.ts
init_storage();

// server/services/analyticsService.ts
init_db();
import { sql as sql3 } from "drizzle-orm";
import * as XLSX from "xlsx";
import axios2 from "axios";
import { z as z2 } from "zod";
import { parse as parseSQL } from "sql-parser-cst";
var DATABASE_SCHEMA_CONTEXT = `
Database Schema for School Management System:

1. teacher_attendance table:
   - teacher_id (UUID): References teachers.id
   - school_id (UUID): References schools.id 
   - attendance_date (DATE): Date of attendance
   - status (ENUM): 'present', 'absent', 'late', 'on_leave', 'medical_leave', 'personal_leave'
   - reason (TEXT): Reason for absence/leave
   - leave_start_date (DATE): For multi-day leave tracking
   - leave_end_date (DATE): For multi-day leave tracking
   - marked_by (UUID): Who marked the attendance
   - marked_at (TIMESTAMP): When marked

2. teachers table:
   - id (UUID): Primary key
   - employee_id (VARCHAR): Employee ID number
   - name (VARCHAR): Teacher name
   - email (VARCHAR): Email address
   - contact_number (VARCHAR): Phone number
   - school_id (UUID): References schools.id
   - subjects (JSONB): Array of subject IDs
   - classes (JSONB): Array of class IDs
   - is_active (BOOLEAN): Whether teacher is active
   - status (ENUM): 'active', 'inactive', 'left_school'

3. student_attendance table:
   - student_id (UUID): References students.id
   - school_id (UUID): References schools.id
   - class_id (UUID): References classes.id
   - attendance_date (DATE): Date of attendance
   - status (ENUM): 'present', 'absent', 'late', 'excused'
   - reason (TEXT): Reason for absence
   - marked_by (UUID): Who marked the attendance
   - marked_at (TIMESTAMP): When marked

4. students table:
   - id (UUID): Primary key
   - admission_number (VARCHAR): Student admission number
   - first_name (VARCHAR): Student first name
   - last_name (VARCHAR): Student last name
   - class_id (UUID): References classes.id
   - school_id (UUID): References schools.id
   - roll_number (VARCHAR): Student roll number
   - is_active (BOOLEAN): Whether student is active
   - status (ENUM): 'active', 'inactive', 'graduated', 'transferred'

5. classes table:
   - id (UUID): Primary key
   - grade (VARCHAR): Grade/Standard (e.g., '8', '10')
   - section (VARCHAR): Section (e.g., 'A', 'B')
   - school_id (UUID): References schools.id
   - student_count (INTEGER): Number of students

Note: Multi-tenant isolation is automatically enforced by database Row-Level Security policies.
Always use proper table aliases and JOIN operations.
`;
var analyticsRequestSchema = z2.object({
  query: z2.string().min(1, "Query cannot be empty"),
  export_format: z2.enum(["none", "csv", "xlsx"]).optional().default("none")
});
var APPROVED_TABLES = [
  "teacher_attendance",
  "teachers",
  "student_attendance",
  "students",
  "classes",
  "subjects",
  "timetable_entries",
  "substitutions"
];
var DANGEROUS_SQL_PATTERNS = [
  /DROP\s+/i,
  /DELETE\s+/i,
  /UPDATE\s+/i,
  /INSERT\s+/i,
  /CREATE\s+/i,
  /ALTER\s+/i,
  /TRUNCATE\s+/i,
  /GRANT\s+/i,
  /REVOKE\s+/i,
  /EXEC\s+/i,
  /EXECUTE\s+/i,
  /xp_/i,
  /sp_/i,
  /--/,
  /\/\*/,
  /\*\//,
  /;.*DROP/i,
  /;.*DELETE/i,
  /;.*UPDATE/i,
  // Dangerous functions that can cause DoS or info disclosure
  /pg_sleep\s*\(/i,
  /pg_read_file\s*\(/i,
  /pg_read_binary_file\s*\(/i,
  /dblink\s*\(/i,
  /copy\s+/i,
  /\binto\s+outfile/i,
  /\binto\s+dumpfile/i,
  /load_file\s*\(/i,
  /select\s+.*\binto\s+/i
  // UNION/CTE/WITH are now allowed since RLS protects them
];
var AnalyticsService = class {
  groqApiKey;
  baseURL = "https://api.groq.com/openai/v1";
  rlsVerified = false;
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || "";
    if (!this.groqApiKey) {
      console.log("\u274C GROQ_API_KEY not found for analytics service");
    }
  }
  /**
   * Verify RLS is enabled and policies exist for all analytics tables (CRITICAL)
   */
  async verifyRLSPolicies() {
    if (this.rlsVerified) return;
    try {
      const rlsStatus = await db.execute(sql3.raw(`
        SELECT tablename, rowsecurity 
        FROM pg_tables 
        WHERE tablename IN ('teachers', 'students', 'classes', 'subjects', 'teacher_attendance', 'student_attendance', 'timetable_entries', 'substitutions')
        AND schemaname = 'public'
      `));
      const tables = rlsStatus.rows || rlsStatus;
      const disabledTables = tables.filter((row) => row.rowsecurity === false || row.rowsecurity === "f");
      if (disabledTables.length > 0) {
        throw new Error(`RLS not enabled on tables: ${disabledTables.map((t) => t.tablename).join(", ")}`);
      }
      const policyStatus = await db.execute(sql3.raw(`
        SELECT COUNT(*) as policy_count
        FROM pg_policies 
        WHERE tablename IN ('teachers', 'students', 'classes', 'subjects', 'teacher_attendance', 'student_attendance', 'timetable_entries', 'substitutions')
        AND schemaname = 'public'
      `));
      const policyCount = parseInt((policyStatus.rows?.[0] || policyStatus[0])?.policy_count || "0");
      if (policyCount < 8) {
        throw new Error(`Insufficient RLS policies found: ${policyCount}/8 required`);
      }
      this.rlsVerified = true;
      console.log("\u2705 RLS verification passed: All analytics tables have proper tenant isolation");
    } catch (error) {
      console.error("\u{1F4A5} RLS verification FAILED:", error);
      throw new Error(`Analytics security not ready: ${error instanceof Error ? error.message : "RLS check failed"}`);
    }
  }
  /**
   * Validate SQL query for security using AST parsing (prevent SQL injection and enforce constraints)
   */
  validateSQLSecurity(sqlQuery, schoolId) {
    try {
      for (const pattern of DANGEROUS_SQL_PATTERNS) {
        if (pattern.test(sqlQuery)) {
          return {
            isValid: false,
            error: `Security violation: Query contains dangerous DML/DDL operations.`
          };
        }
      }
      let parsedSQL;
      try {
        parsedSQL = parseSQL(sqlQuery, { dialect: "postgresql" });
      } catch (parseError) {
        return {
          isValid: false,
          error: `Invalid SQL syntax: ${parseError instanceof Error ? parseError.message : "Parse failed"}`
        };
      }
      if (!parsedSQL || parsedSQL.type !== "program" && parsedSQL.type !== "statement_list" || parsedSQL.statements.length !== 1) {
        return {
          isValid: false,
          error: "Only single SELECT statements are allowed"
        };
      }
      const statement = parsedSQL.statements[0];
      if (statement.type !== "select_stmt") {
        return {
          isValid: false,
          error: "Only SELECT queries are allowed for analytics"
        };
      }
      const tableNames = this.extractTableNames(statement);
      const unapprovedTables = tableNames.filter((table) => !APPROVED_TABLES.includes(table.toLowerCase()));
      if (unapprovedTables.length > 0) {
        return {
          isValid: false,
          error: `Access denied to tables: ${unapprovedTables.join(", ")}. Only analytics tables are allowed.`
        };
      }
      const safeSql = this.enforceSchoolIdConstraint(sqlQuery, schoolId, tableNames);
      return {
        isValid: true,
        safeSql
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Security validation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
  /**
   * Extract base table names from SQL AST (ignoring CTEs and derived tables)
   */
  extractTableNames(node, cteNames = /* @__PURE__ */ new Set()) {
    const tables = [];
    if (!node) return tables;
    if (node.type === "select_stmt" && node.with_clause) {
      for (const cte of node.with_clause.ctes || []) {
        if (cte.alias?.name) {
          cteNames.add(cte.alias.name.toLowerCase());
        }
      }
    }
    if (node.type === "table_ref" && node.table?.name) {
      const tableName = node.table.name.toLowerCase();
      if (!cteNames.has(tableName)) {
        tables.push(node.table.name);
      }
    }
    if (node.from && Array.isArray(node.from)) {
      for (const fromItem of node.from) {
        tables.push(...this.extractTableNames(fromItem, cteNames));
      }
    }
    if (node.joins && Array.isArray(node.joins)) {
      for (const join of node.joins) {
        tables.push(...this.extractTableNames(join, cteNames));
      }
    }
    for (const key in node) {
      if (key !== "with_clause" && typeof node[key] === "object") {
        if (Array.isArray(node[key])) {
          for (const item of node[key]) {
            tables.push(...this.extractTableNames(item, cteNames));
          }
        } else {
          tables.push(...this.extractTableNames(node[key], cteNames));
        }
      }
    }
    return Array.from(new Set(tables));
  }
  /**
   * BULLETPROOF tenant isolation using Database-level Row-Level Security (RLS)
   */
  enforceSchoolIdConstraint(originalSql, schoolId, tableNames) {
    return originalSql;
  }
  /**
   * Generate SQL query from natural language using LLAMA
   */
  async generateSQLFromNaturalLanguage(naturalLanguageQuery, schoolId) {
    try {
      const systemPrompt = `You are an expert SQL generator for a school management system. 
Generate a PostgreSQL query based on the natural language request.

${DATABASE_SCHEMA_CONTEXT}

CRITICAL REQUIREMENTS:
1. Data isolation is automatically enforced by database Row-Level Security policies
2. Use proper table aliases (ta for teacher_attendance, t for teachers, etc.) 
3. Use PostgreSQL syntax and functions
4. Return only SELECT queries (no INSERT/UPDATE/DELETE)
5. For date ranges, use PostgreSQL date functions like DATE_TRUNC, INTERVAL
6. For JSON fields (subjects, classes), use proper JSONB operators
7. You can use JOINs, UNIONs, and CTEs freely - all are security-protected

Return ONLY a JSON object with this exact format:
{
  "sql": "SELECT ... FROM ... WHERE ...",
  "explanation": "This query finds..."
}

Example queries:
- "Top 3 teachers absent most last month" \u2192 COUNT absent days by teacher, ORDER BY count DESC, LIMIT 3
- "Class 8A attendance September" \u2192 Filter by class grade='8' AND section='A' AND month
- "Which class has highest absenteeism" \u2192 GROUP BY class, calculate absence percentage

Natural Language Query: "${naturalLanguageQuery}"`;
      const response = await axios2.post(
        `${this.baseURL}/chat/completions`,
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: naturalLanguageQuery
            }
          ],
          max_tokens: 1500,
          temperature: 0.1
        },
        {
          headers: {
            "Authorization": `Bearer ${this.groqApiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 15e3
        }
      );
      const content = response.data.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error("Empty response from LLAMA");
      }
      let parsedResponse;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (e) {
        throw new Error(`Failed to parse LLAMA response as JSON: ${content}`);
      }
      if (!parsedResponse.sql || !parsedResponse.explanation) {
        throw new Error("Invalid response format from LLAMA");
      }
      console.log(`[ANALYTICS] Generated SQL: ${parsedResponse.sql}`);
      console.log(`[ANALYTICS] Explanation: ${parsedResponse.explanation}`);
      return {
        sql: parsedResponse.sql,
        explanation: parsedResponse.explanation
      };
    } catch (error) {
      console.error("[ANALYTICS] Failed to generate SQL:", error.message);
      return {
        sql: "",
        explanation: "",
        error: error.message || "Failed to generate SQL query"
      };
    }
  }
  /**
   * Execute analytics SQL query with BULLETPROOF Row-Level Security (RLS) in Transaction
   */
  async executeAnalyticsQuery(sqlQuery, schoolId) {
    try {
      await this.verifyRLSPolicies();
      const validation = this.validateSQLSecurity(sqlQuery, schoolId);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }
      const secureSql = sqlQuery;
      console.log(`[ANALYTICS] Executing RLS-secured SQL for school ${schoolId}:`);
      console.log(`[ANALYTICS] Query: ${secureSql}`);
      const result = await db.transaction(async (tx) => {
        await tx.execute(sql3`SELECT set_config('app.current_school_id', ${schoolId}, true)`);
        const queryResult = await tx.execute(sql3.raw(secureSql));
        return queryResult;
      });
      const rows = result.rows || result;
      const dataArray = Array.isArray(rows) ? rows : [rows];
      console.log(`[ANALYTICS] RLS-secured query executed successfully, returned ${dataArray.length} rows`);
      return {
        success: true,
        data: dataArray,
        rowCount: dataArray.length
      };
    } catch (error) {
      console.error("[ANALYTICS] SQL execution error:", error);
      return {
        success: false,
        error: `Database error: ${error.message}`
      };
    }
  }
  /**
   * Format analytics results into human-friendly message
   */
  formatAnalyticsResults(data, explanation, naturalLanguageQuery) {
    if (!data || data.length === 0) {
      return `\u{1F4CA} No data found for your query.

This could mean:
\u2022 No records match your criteria
\u2022 The time period specified has no data
\u2022 All values for the requested metric are zero`;
    }
    const columns = Object.keys(data[0]);
    let tableMarkdown = `\u{1F4CA} **Results** (${data.length} record${data.length !== 1 ? "s" : ""})

`;
    tableMarkdown += `| ${columns.join(" | ")} |
`;
    tableMarkdown += `|${columns.map(() => " --- ").join("|")}|
`;
    const displayData = data.length > 50 ? data.slice(0, 50) : data;
    displayData.forEach((row) => {
      const values = columns.map((col) => {
        const value = row[col];
        if (value === null || value === void 0) return "-";
        if (typeof value === "number") return value.toString();
        return value.toString();
      });
      tableMarkdown += `| ${values.join(" | ")} |
`;
    });
    if (data.length > 50) {
      tableMarkdown += `
*Showing first 50 of ${data.length} total records*
`;
    }
    tableMarkdown += `
\u{1F4A1} *Need to export this data? Ask me to "export this as Excel" or "export as CSV"*`;
    return tableMarkdown;
  }
  /**
   * Export analytics data to Excel
   */
  async exportToExcel(data, filename) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    const columnWidths = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const cellLength = cell.v.toString().length;
          if (cellLength > maxWidth) {
            maxWidth = cellLength;
          }
        }
      }
      columnWidths.push({ width: Math.min(maxWidth + 2, 50) });
    }
    worksheet["!cols"] = columnWidths;
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analytics Report");
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx"
    });
    return excelBuffer;
  }
  /**
   * Export analytics data to CSV
   */
  async exportToCSV(data) {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(","));
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      });
      csvRows.push(values.join(","));
    }
    return csvRows.join("\n");
  }
  /**
   * Check if user has analytics access (admin/super_admin only)
   */
  checkAnalyticsAccess(userRole) {
    return userRole === "admin" || userRole === "super_admin";
  }
};
var analyticsService = new AnalyticsService();

// server/intentMapping.ts
var IntentMappingService = class {
  intentHandlers = /* @__PURE__ */ new Map();
  constructor() {
    this.registerDefaultHandlers();
  }
  /**
   * Register all default intent handlers for Chrona modules
   */
  registerDefaultHandlers() {
    this.registerHandler("MARK_ATTENDANCE", {
      handler: this.handleMarkAttendance.bind(this),
      requiredEntities: ["person_name", "status"],
      allowedRoles: ["admin", "super_admin", "teacher"]
    });
    this.registerHandler("CREATE_CLASS", {
      handler: this.handleCreateClass.bind(this),
      requiredEntities: [],
      // No required entities - dialog will collect all info
      allowedRoles: ["admin", "super_admin"]
    });
    this.registerHandler("VIEW_TIMETABLE", {
      handler: this.handleViewTimetable.bind(this),
      requiredEntities: [],
      allowedRoles: ["admin", "super_admin", "teacher", "student", "parent"]
    });
    this.registerHandler("MANAGE_FEES", {
      handler: this.handleManageFees.bind(this),
      requiredEntities: ["action_type"],
      allowedRoles: ["admin", "super_admin"]
    });
    this.registerHandler("SCHEDULE_EXAM", {
      handler: this.handleScheduleExam.bind(this),
      requiredEntities: ["subject", "date"],
      allowedRoles: ["admin", "super_admin", "teacher"]
    });
    this.registerHandler("SEND_COMMUNICATION", {
      handler: this.handleSendCommunication.bind(this),
      requiredEntities: ["message_type"],
      allowedRoles: ["admin", "super_admin", "teacher"]
    });
    this.registerHandler("VIEW_REPORTS", {
      handler: this.handleViewReports.bind(this),
      requiredEntities: ["report_type"],
      allowedRoles: ["admin", "super_admin"]
    });
    this.registerHandler("CREATE_STUDENT", {
      handler: this.handleCreateStudent.bind(this),
      requiredEntities: [],
      // No required entities - dialog will collect all info
      allowedRoles: ["admin", "super_admin"]
    });
    this.registerHandler("VIEW_STUDENTS", {
      handler: this.handleViewStudents.bind(this),
      requiredEntities: [],
      allowedRoles: ["admin", "super_admin", "teacher"]
    });
    this.registerHandler("UPDATE_STUDENT", {
      handler: this.handleUpdateStudent.bind(this),
      requiredEntities: ["student_id"],
      allowedRoles: ["admin", "super_admin"]
    });
    this.registerHandler("CREATE_TEACHER", {
      handler: this.handleCreateTeacher.bind(this),
      requiredEntities: [],
      // No required entities - dialog will collect all info
      allowedRoles: ["admin", "super_admin"]
    });
    this.registerHandler("VIEW_TEACHERS", {
      handler: this.handleViewTeachers.bind(this),
      requiredEntities: [],
      allowedRoles: ["admin", "super_admin", "teacher"]
    });
    this.registerHandler("UPDATE_TEACHER", {
      handler: this.handleUpdateTeacher.bind(this),
      requiredEntities: ["teacher_id"],
      allowedRoles: ["admin", "super_admin"]
    });
    this.registerHandler("DOWNLOAD_STUDENT_LIST", {
      handler: this.handleDownloadStudentList.bind(this),
      requiredEntities: [],
      allowedRoles: ["admin", "super_admin", "teacher"]
    });
    this.registerHandler("DOWNLOAD_TEACHER_LIST", {
      handler: this.handleDownloadTeacherList.bind(this),
      requiredEntities: [],
      allowedRoles: ["admin", "super_admin"]
    });
    this.registerHandler("CREATE_SUBJECT", {
      handler: this.handleCreateSubject.bind(this),
      requiredEntities: ["subject_name"],
      allowedRoles: ["admin", "super_admin"]
    });
    this.registerHandler("VIEW_SUBJECTS", {
      handler: this.handleViewSubjects.bind(this),
      requiredEntities: [],
      allowedRoles: ["admin", "super_admin", "teacher", "student", "parent"]
    });
    this.registerHandler("FIND_SUBSTITUTE", {
      handler: this.handleFindSubstitute.bind(this),
      requiredEntities: ["absent_teacher", "date"],
      allowedRoles: ["admin", "super_admin"]
    });
    this.registerHandler("AUTO_ASSIGN_SUBSTITUTE", {
      handler: this.handleAutoAssignSubstitute.bind(this),
      requiredEntities: ["absent_teacher", "date"],
      allowedRoles: ["admin", "super_admin"]
    });
    this.registerHandler("GENERATE_TIMETABLE", {
      handler: this.handleGenerateTimetable.bind(this),
      requiredEntities: [],
      allowedRoles: ["admin", "super_admin"]
    });
    this.registerHandler("MODIFY_TIMETABLE", {
      handler: this.handleModifyTimetable.bind(this),
      requiredEntities: ["class_id", "period", "day"],
      allowedRoles: ["admin", "super_admin"]
    });
    this.registerHandler("TEACHER_WORKLOAD", {
      handler: this.handleTeacherWorkload.bind(this),
      requiredEntities: [],
      allowedRoles: ["admin", "super_admin"]
    });
    this.registerHandler("ANALYTICS_QUERY", {
      handler: this.handleAnalyticsQuery.bind(this),
      requiredEntities: [],
      allowedRoles: ["admin", "super_admin"]
    });
    this.registerHandler("EXPORT_ANALYTICS", {
      handler: this.handleExportAnalytics.bind(this),
      requiredEntities: ["export_format"],
      allowedRoles: ["admin", "super_admin"]
    });
    this.registerHandler("CHANGE_THEME", {
      handler: this.handleChangeTheme.bind(this),
      requiredEntities: [],
      allowedRoles: ["admin", "super_admin", "teacher", "student", "parent"]
    });
    this.registerHandler("OPEN_SETTINGS", {
      handler: this.handleOpenSettings.bind(this),
      requiredEntities: [],
      allowedRoles: ["admin", "super_admin", "teacher", "student", "parent"]
    });
  }
  /**
   * Register a new intent handler (for extensibility)
   */
  registerHandler(intent, handler) {
    this.intentHandlers.set(intent, handler);
  }
  /**
   * Execute intent by mapping to appropriate API
   */
  async executeIntent(intent, entities, schoolId, userRole, originalMessage, conversationContext) {
    if (intent === "ANALYTICS_QUERY" && originalMessage) {
      entities.original_query = originalMessage;
    }
    if (intent === "UNKNOWN") {
      return {
        success: true,
        message: "\u{1F914} I don't have specific information about that in your school database right now. I can help you with:\n\n\u{1F4CB} **Attendance**: Mark teachers/students present/absent\n\u{1F465} **People**: View teachers, students, create new records\n\u{1F4C5} **Timetables**: View class/teacher schedules\n\u{1F3EB} **Classes**: View and manage school classes\n\nWhat would you like me to help you with?"
      };
    }
    const handler = this.intentHandlers.get(intent);
    if (!handler) {
      return {
        success: false,
        message: `\u{1F914} I don't know how to handle "${intent}" yet. Try asking about attendance, classes, or timetables!`
      };
    }
    if (!handler.allowedRoles.includes(userRole)) {
      return {
        success: false,
        message: `\u{1F6AB} Sorry, you don't have permission to perform this action. This requires: ${handler.allowedRoles.join(", ")} role.`
      };
    }
    const missingEntities = handler.requiredEntities.filter((entity) => !entities[entity]);
    if (missingEntities.length > 0) {
      return {
        success: false,
        message: `\u2753 I need more information: ${missingEntities.join(", ")}. Please provide these details.`
      };
    }
    try {
      return await handler.handler(entities, schoolId, userRole);
    } catch (error) {
      console.error(`Error executing intent ${intent}:`, error);
      return {
        success: false,
        message: `\u26A0\uFE0F Something went wrong while processing your request. Please try again.`
      };
    }
  }
  // ===== INTENT HANDLERS =====
  /**
   * Handle attendance marking (students and teachers)
   */
  async handleMarkAttendance(entities, schoolId, userRole) {
    const { person_name, status, class_name } = entities;
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    try {
      const teachers2 = await storage.getTeachers(schoolId);
      const teacher = teachers2.find(
        (t) => t.name.toLowerCase().includes(person_name.toLowerCase()) || person_name.toLowerCase().includes(t.name.toLowerCase())
      );
      if (teacher) {
        await storage.markTeacherAttendance({
          teacherId: teacher.id,
          schoolId,
          attendanceDate: today,
          status: status.toLowerCase(),
          reason: `Marked ${status} via AI assistant`
        });
        return {
          success: true,
          message: `\u2705 Marked ${teacher.name} as ${status} for today. Teacher attendance updated successfully!`,
          action: "refresh_attendance",
          actionData: { type: "teacher", teacherId: teacher.id }
        };
      }
      let students2 = await storage.getStudents(schoolId);
      if (class_name) {
        const classes2 = await storage.getClasses(schoolId);
        const targetClass = classes2.find((c) => {
          const className = `${c.grade}${c.section}`;
          return className.toLowerCase().includes(class_name.toLowerCase()) || class_name.toLowerCase().includes(className.toLowerCase());
        });
        if (targetClass) {
          students2 = students2.filter((s) => s.classId === targetClass.id);
        }
      }
      const student = students2.find((s) => {
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        return fullName.includes(person_name.toLowerCase()) || person_name.toLowerCase().includes(fullName);
      });
      if (student) {
        await storage.markStudentAttendance({
          studentId: student.id,
          schoolId,
          classId: student.classId,
          attendanceDate: today,
          status: status.toLowerCase(),
          reason: `Marked ${status} via AI assistant`
        });
        const studentName = `${student.firstName} ${student.lastName}`;
        return {
          success: true,
          message: `\u2705 Marked ${studentName} as ${status} for today. Student attendance updated successfully!`,
          action: "refresh_attendance",
          actionData: { type: "student", studentId: student.id }
        };
      }
      return {
        success: false,
        message: `\u{1F50D} I couldn't find "${person_name}" in your school. Please check the spelling or try the full name.`
      };
    } catch (error) {
      console.error("Mark attendance error:", error);
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to mark attendance: ${error.message}`
      };
    }
  }
  /**
   * Handle class creation - opens create class dialog
   */
  async handleCreateClass(entities, schoolId, userRole) {
    const { class_name, subject, teacher_name } = entities;
    try {
      return {
        success: true,
        message: `\u{1F3EB} I'll help you create a new class. Opening the class creation form...`,
        action: "open_create_class_dialog",
        actionData: { className: class_name, subject, teacherName: teacher_name }
      };
    } catch (error) {
      console.error("Create class error:", error);
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to create class: ${error.message}`
      };
    }
  }
  /**
   * Handle timetable viewing - fetch and display class timetable
   */
  async handleViewTimetable(entities, schoolId, userRole) {
    const { class_name, teacher_name, subject } = entities;
    try {
      if (class_name) {
        const classes2 = await storage.getClasses(schoolId);
        const foundClass = classes2.find((c) => {
          const className2 = `${c.grade}${c.section}`;
          return className2.toLowerCase().includes(class_name.toLowerCase()) || class_name.toLowerCase().includes(className2.toLowerCase());
        });
        if (!foundClass) {
          return {
            success: false,
            message: `\u{1F50D} Class "${class_name}" not found. Please check the class name.`
          };
        }
        const allTimetableEntries = await storage.getTimetableEntriesWithDetails();
        const timetableEntries2 = allTimetableEntries.filter((entry) => entry.classId === foundClass.id);
        if (!timetableEntries2 || timetableEntries2.length === 0) {
          return {
            success: false,
            message: `\u{1F4C5} No timetable found for Class ${foundClass.grade}${foundClass.section}. Please generate a timetable first.`
          };
        }
        const structure = await storage.getTimetableStructureBySchool(schoolId);
        const workingDays = structure?.workingDays || ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const timeSlots = structure?.timeSlots || [
          { period: 1, startTime: "07:30", endTime: "08:15", isBreak: false },
          { period: 2, startTime: "08:15", endTime: "09:00", isBreak: false },
          { period: 3, startTime: "09:00", endTime: "09:45", isBreak: false },
          { period: 4, startTime: "09:45", endTime: "10:15", isBreak: false },
          { period: 5, startTime: "11:00", endTime: "11:45", isBreak: false },
          { period: 6, startTime: "11:45", endTime: "12:30", isBreak: false },
          { period: 7, startTime: "12:30", endTime: "13:15", isBreak: false }
        ];
        const className = `${foundClass.grade}${foundClass.section}`;
        return {
          success: true,
          message: `\u{1F4C5} Showing timetable for Class ${className}`,
          action: "display-timetable",
          actionData: {
            classId: foundClass.id,
            className,
            timetableEntries: timetableEntries2,
            workingDays,
            timeSlots,
            userRole
          }
        };
      } else {
        const classes2 = await storage.getClasses(schoolId);
        if (classes2.length === 0) {
          return {
            success: false,
            message: "\u{1F4C5} No classes found in your school. Please create classes first before viewing timetables."
          };
        }
        const sortedClasses = classes2.sort((a, b) => {
          const gradeA = parseInt(a.grade) || 0;
          const gradeB = parseInt(b.grade) || 0;
          if (gradeA !== gradeB) {
            return gradeA - gradeB;
          }
          const sectionA = a.section || "";
          const sectionB = b.section || "";
          return sectionA.localeCompare(sectionB);
        });
        const classList = sortedClasses.map((c) => {
          const className = `${c.grade}${c.section}`;
          return `\u2022 Class ${className}`;
        }).join("\n");
        return {
          success: true,
          message: `\u{1F4C5} Which class timetable would you like to see? Here are the available classes:

${classList}

Just say "show timetable for class [number]" or simply "class [number]".`
        };
      }
    } catch (error) {
      console.error("View timetable error:", error);
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to load timetable: ${error.message}`
      };
    }
  }
  // ===== EXTENSIBLE PLACEHOLDER HANDLERS =====
  async handleManageFees(entities, schoolId, userRole) {
    return {
      success: false,
      message: "\u{1F4B0} Fee management feature is coming soon! For now, please use the main navigation to access fee-related functions."
    };
  }
  async handleScheduleExam(entities, schoolId, userRole) {
    return {
      success: false,
      message: "\u{1F4DD} Exam scheduling feature is coming soon! For now, please use the main navigation to schedule exams."
    };
  }
  async handleSendCommunication(entities, schoolId, userRole) {
    return {
      success: false,
      message: "\u{1F4E2} Communication features are coming soon! For now, please use the main navigation for announcements."
    };
  }
  async handleViewReports(entities, schoolId, userRole) {
    return {
      success: false,
      message: "\u{1F4CA} Advanced reporting features are coming soon! For now, check the analytics section in the main navigation."
    };
  }
  // ===== STUDENT MANAGEMENT HANDLERS =====
  async handleCreateStudent(entities, schoolId, userRole) {
    const { student_name, class_name, roll_number } = entities;
    try {
      return {
        success: true,
        message: `\u{1F4DA} I'll help you create a new student. Opening the student creation form...`,
        action: "open_create_student_dialog",
        actionData: { studentName: student_name, className: class_name, rollNumber: roll_number }
      };
    } catch (error) {
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to create student: ${error.message}`
      };
    }
  }
  async handleViewStudents(entities, schoolId, userRole) {
    const { class_name, grade } = entities;
    try {
      const students2 = await storage.getStudents(schoolId);
      if (students2.length === 0) {
        return {
          success: true,
          message: "\u{1F4CB} No students found in your school database. You can add students using the Students section in the main navigation."
        };
      }
      const classes2 = await storage.getClasses(schoolId);
      const classMap = new Map(classes2.map((c) => [c.id, `Class ${c.grade}${c.section}`]));
      let filteredStudents = students2;
      if (class_name || grade) {
        const filterText2 = (class_name || grade).toLowerCase();
        if (filterText2 === "all" || filterText2 === "all students") {
          filteredStudents = students2;
        } else {
          filteredStudents = students2.filter((student) => {
            const className = classMap.get(student.classId) || "";
            const normalizedClassName = className.toLowerCase();
            const normalizedFilter = filterText2.toLowerCase();
            const filterNumber = normalizedFilter.replace(/^(class|grade)\s*/i, "").trim();
            return normalizedClassName.includes(normalizedFilter) || // "class 1" matches "class 1"
            normalizedClassName.includes(filterNumber) || // "class 1" matches "1"
            normalizedClassName.includes(`class ${filterNumber}`) || // flexible matching
            `${student.firstName} ${student.lastName}`.toLowerCase().includes(normalizedFilter);
          });
        }
      }
      if (filteredStudents.length === 0) {
        return {
          success: true,
          message: `\u{1F4CB} No students found for "${class_name || grade}" in your school database.`
        };
      }
      const results = filteredStudents.map((student) => {
        const className = classMap.get(student.classId) || "No class assigned";
        return {
          Name: `${student.firstName} ${student.lastName}`,
          "Admission No.": student.admissionNumber || "N/A",
          Class: className,
          "Roll Number": student.rollNumber || "N/A"
        };
      });
      const filterText = class_name || grade;
      const message = filterText ? `\u{1F468}\u200D\u{1F393} Students for ${filterText} (${filteredStudents.length} found)` : `\u{1F468}\u200D\u{1F393} All students in your school (${filteredStudents.length} total)`;
      return {
        success: true,
        message,
        action: "analytics_results",
        actionData: {
          query: filterText ? `Students for ${filterText}` : "All students",
          data: results,
          rowCount: results.length
        }
      };
    } catch (error) {
      console.error("View students error:", error);
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to load students from your school database: ${error.message}`
      };
    }
  }
  async handleUpdateStudent(entities, schoolId, userRole) {
    const { student_id, student_name } = entities;
    try {
      return {
        success: true,
        message: `\u{1F4DD} Opening student update form for ${student_name || "selected student"}...`,
        action: "open_update_student_dialog",
        actionData: { studentId: student_id, studentName: student_name }
      };
    } catch (error) {
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to update student: ${error.message}`
      };
    }
  }
  // ===== TEACHER MANAGEMENT HANDLERS =====
  async handleCreateTeacher(entities, schoolId, userRole) {
    const { teacher_name, subject, email } = entities;
    try {
      return {
        success: true,
        message: `\u{1F468}\u200D\u{1F3EB} I'll help you create a new teacher. Opening the teacher creation form...`,
        action: "open_create_teacher_dialog",
        actionData: { teacherName: teacher_name, subject, email }
      };
    } catch (error) {
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to create teacher: ${error.message}`
      };
    }
  }
  async handleViewTeachers(entities, schoolId, userRole) {
    const { subject, department } = entities;
    try {
      const teachers2 = await storage.getTeachers(schoolId);
      if (teachers2.length === 0) {
        return {
          success: true,
          message: "\u{1F4CB} No teachers found in your school database. You can add teachers using the Teachers section in the main navigation."
        };
      }
      const subjects2 = await storage.getSubjects(schoolId);
      const subjectMap = new Map(subjects2.map((s) => [s.id, s.name]));
      let filteredTeachers = teachers2;
      if (subject || department) {
        const filterText2 = (subject || department).toLowerCase();
        filteredTeachers = teachers2.filter((teacher) => {
          const teacherSubjects = teacher.subjects.map((sId) => subjectMap.get(sId) || "").join(", ").toLowerCase();
          return teacherSubjects.includes(filterText2) || teacher.name.toLowerCase().includes(filterText2);
        });
      }
      if (filteredTeachers.length === 0) {
        return {
          success: true,
          message: `\u{1F4CB} No teachers found for "${subject || department}" in your school database.`
        };
      }
      const teacherList = filteredTeachers.map((teacher, index2) => {
        const teacherSubjects = teacher.subjects.map((sId) => subjectMap.get(sId)).filter(Boolean).join(", ");
        return `${index2 + 1}. **${teacher.name}** - ${teacherSubjects || "No subjects assigned"}`;
      }).join("\n");
      const filterText = subject || department;
      const message = filterText ? `\u{1F468}\u200D\u{1F3EB} Here are the teachers for ${filterText} (${filteredTeachers.length} found):

${teacherList}` : `\u{1F468}\u200D\u{1F3EB} We have a total of ${filteredTeachers.length} teachers in your school:

${teacherList}`;
      return {
        success: true,
        message
      };
    } catch (error) {
      console.error("View teachers error:", error);
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to load teachers from your school database: ${error.message}`
      };
    }
  }
  async handleUpdateTeacher(entities, schoolId, userRole) {
    const { teacher_id, teacher_name } = entities;
    try {
      return {
        success: true,
        message: `\u{1F4DD} Opening teacher update form for ${teacher_name || "selected teacher"}...`,
        action: "open_update_teacher_dialog",
        actionData: { teacherId: teacher_id, teacherName: teacher_name }
      };
    } catch (error) {
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to update teacher: ${error.message}`
      };
    }
  }
  // ===== SUBJECT MANAGEMENT HANDLERS =====
  async handleCreateSubject(entities, schoolId, userRole) {
    const { subject_name, subject_code, periods_per_week } = entities;
    try {
      if (!subject_name) {
        return {
          success: false,
          message: "\u2753 Please provide the subject name to create a new subject."
        };
      }
      return {
        success: true,
        message: `\u{1F4D6} I'll help you create a new subject "${subject_name}". Opening the subject creation form...`,
        action: "open_create_subject_dialog",
        actionData: { subjectName: subject_name, subjectCode: subject_code, periodsPerWeek: periods_per_week }
      };
    } catch (error) {
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to create subject: ${error.message}`
      };
    }
  }
  async handleViewSubjects(entities, schoolId, userRole) {
    try {
      return {
        success: true,
        message: "\u{1F4D6} Here are all the subjects in your school:",
        action: "open_subjects_page"
      };
    } catch (error) {
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to load subjects: ${error.message}`
      };
    }
  }
  // ===== SUBSTITUTION MANAGEMENT HANDLERS =====
  async handleFindSubstitute(entities, schoolId, userRole) {
    const { absent_teacher, date: date2, period } = entities;
    try {
      if (!absent_teacher) {
        return {
          success: false,
          message: "\u2753 Please specify which teacher needs a substitute."
        };
      }
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const targetDate = date2 || today;
      return {
        success: true,
        message: `\u{1F50D} Finding available substitute teachers for ${absent_teacher} on ${targetDate}...`,
        action: "open_substitution_finder",
        actionData: { absentTeacher: absent_teacher, date: targetDate, period }
      };
    } catch (error) {
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to find substitute: ${error.message}`
      };
    }
  }
  async handleAutoAssignSubstitute(entities, schoolId, userRole) {
    const { absent_teacher, date: date2 } = entities;
    try {
      if (!absent_teacher) {
        return {
          success: false,
          message: "\u2753 Please specify which teacher needs a substitute."
        };
      }
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const targetDate = date2 || today;
      return {
        success: true,
        message: `\u{1F916} Automatically assigning substitute for ${absent_teacher} on ${targetDate}...`,
        action: "auto_assign_substitute",
        actionData: { absentTeacher: absent_teacher, date: targetDate }
      };
    } catch (error) {
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to auto-assign substitute: ${error.message}`
      };
    }
  }
  // ===== TIMETABLE ADVANCED HANDLERS =====
  async handleGenerateTimetable(entities, schoolId, userRole) {
    try {
      return {
        success: false,
        message: "\u{1F6A7} Automatic timetable generation is not available yet. For now, please use the manual timetable editor in the main navigation to create and manage your school timetables."
      };
    } catch (error) {
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to generate timetable: ${error.message}`
      };
    }
  }
  async handleModifyTimetable(entities, schoolId, userRole) {
    const { class_id, period, day, teacher_name, subject } = entities;
    try {
      return {
        success: true,
        message: `\u{1F4DD} Opening timetable editor for ${day || "selected"} period ${period || "selected"}...`,
        action: "open_timetable_editor",
        actionData: { classId: class_id, period, day, teacherName: teacher_name, subject }
      };
    } catch (error) {
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to modify timetable: ${error.message}`
      };
    }
  }
  // ===== ANALYTICS HANDLERS =====
  async handleTeacherWorkload(entities, schoolId, userRole) {
    try {
      const teachers2 = await storage.getTeachers(schoolId);
      return {
        success: true,
        message: `\u{1F4C8} Analyzing workload for ${teachers2.length} teachers. Opening workload analytics...`,
        action: "open_teacher_workload_analytics",
        actionData: { teacherCount: teachers2.length }
      };
    } catch (error) {
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to load teacher workload: ${error.message}`
      };
    }
  }
  // ===== ADVANCED ANALYTICS HANDLERS =====
  async handleAnalyticsQuery(entities, schoolId, userRole) {
    try {
      if (!analyticsService.checkAnalyticsAccess(userRole)) {
        return {
          success: false,
          message: "\u{1F6AB} Sorry, advanced analytics are only available to school administrators."
        };
      }
      const naturalLanguageQuery = entities.original_query || entities.query || "Show analytics data";
      console.log(`[ANALYTICS] Processing query: "${naturalLanguageQuery}" for school ${schoolId}`);
      const sqlResult = await analyticsService.generateSQLFromNaturalLanguage(naturalLanguageQuery, schoolId);
      if (sqlResult.error) {
        return {
          success: false,
          message: `\u26A0\uFE0F ${sqlResult.error}`
        };
      }
      const queryResult = await analyticsService.executeAnalyticsQuery(sqlResult.sql, schoolId);
      if (!queryResult.success) {
        return {
          success: false,
          message: `\u26A0\uFE0F Database error: ${queryResult.error}`
        };
      }
      const simpleMessage = `\u{1F4CA} Here are your analytics results:`;
      return {
        success: true,
        message: simpleMessage,
        action: "analytics_results",
        actionData: {
          query: naturalLanguageQuery,
          sql: sqlResult.sql,
          explanation: sqlResult.explanation,
          data: queryResult.data,
          rowCount: queryResult.rowCount
        }
      };
    } catch (error) {
      console.error("[ANALYTICS] Handler error:", error);
      if (error.message?.includes("LLAMA") || error.message?.includes("network") || error.message?.includes("timeout")) {
        return {
          success: false,
          message: "\u26A0\uFE0F My brain is not functioning right now, try again later."
        };
      }
      return {
        success: false,
        message: `\u26A0\uFE0F Something went wrong while processing your analytics query. Please try again.`
      };
    }
  }
  async handleExportAnalytics(entities, schoolId, userRole) {
    try {
      if (!analyticsService.checkAnalyticsAccess(userRole)) {
        return {
          success: false,
          message: "\u{1F6AB} Sorry, analytics exports are only available to school administrators."
        };
      }
      const { export_format, data, filename } = entities;
      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          success: false,
          message: "\u{1F4CA} No analytics data available to export. Please run an analytics query first."
        };
      }
      const exportFormat = export_format?.toLowerCase() || "xlsx";
      const exportFilename = filename || `analytics_report_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}`;
      if (exportFormat === "xlsx" || exportFormat === "excel") {
        const excelBuffer = await analyticsService.exportToExcel(data, exportFilename);
        return {
          success: true,
          message: `\u{1F4CA} Excel report generated successfully! Download starting...`,
          action: "download_analytics_excel",
          actionData: {
            buffer: excelBuffer,
            filename: `${exportFilename}.xlsx`,
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          }
        };
      } else if (exportFormat === "csv") {
        const csvData = await analyticsService.exportToCSV(data);
        return {
          success: true,
          message: `\u{1F4CA} CSV report generated successfully! Download starting...`,
          action: "download_analytics_csv",
          actionData: {
            data: csvData,
            filename: `${exportFilename}.csv`,
            mimeType: "text/csv"
          }
        };
      } else {
        return {
          success: false,
          message: `\u26A0\uFE0F Unsupported export format: ${export_format}. Please use 'excel' or 'csv'.`
        };
      }
    } catch (error) {
      console.error("[ANALYTICS] Export error:", error);
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to export analytics data: ${error.message}`
      };
    }
  }
  // ===== DOWNLOAD/EXPORT HANDLERS =====
  async handleDownloadStudentList(entities, schoolId, userRole) {
    try {
      const students2 = await storage.getStudents(schoolId);
      if (students2.length === 0) {
        return {
          success: false,
          message: "\u{1F4CB} No students found to download. Add students first from the Students section in main navigation."
        };
      }
      return {
        success: true,
        message: `\u{1F4CA} Ready to download ${students2.length} student records! Please select the fields you want to include in your Excel file.`,
        action: "show_field_selection",
        actionData: {
          type: "students",
          count: students2.length,
          availableFields: [
            { id: "admissionNumber", label: "Admission Number", category: "basic" },
            { id: "firstName", label: "First Name", category: "basic" },
            { id: "lastName", label: "Last Name", category: "basic" },
            { id: "rollNumber", label: "Roll Number", category: "basic" },
            { id: "className", label: "Class", category: "basic" },
            { id: "email", label: "Email", category: "contact" },
            { id: "contactNumber", label: "Contact Number", category: "contact" },
            { id: "dateOfBirth", label: "Date of Birth", category: "personal" },
            { id: "gender", label: "Gender", category: "personal" },
            { id: "bloodGroup", label: "Blood Group", category: "personal" },
            { id: "address", label: "Address", category: "personal" },
            { id: "guardianName", label: "Guardian Name", category: "guardian" },
            { id: "guardianRelation", label: "Guardian Relation", category: "guardian" },
            { id: "guardianContact", label: "Guardian Contact", category: "guardian" },
            { id: "emergencyContact", label: "Emergency Contact", category: "guardian" },
            { id: "medicalInfo", label: "Medical Information", category: "medical" },
            { id: "status", label: "Status", category: "system" }
          ]
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to prepare student download: ${error.message}`
      };
    }
  }
  async handleDownloadTeacherList(entities, schoolId, userRole) {
    try {
      const teachers2 = await storage.getTeachers(schoolId);
      if (teachers2.length === 0) {
        return {
          success: false,
          message: "\u{1F4CB} No teachers found to download. Add teachers first from the Teachers section in main navigation."
        };
      }
      return {
        success: true,
        message: `\u{1F4CA} Ready to download ${teachers2.length} teacher records! Please select the fields you want to include in your Excel file.`,
        action: "show_field_selection",
        actionData: {
          type: "teachers",
          count: teachers2.length,
          availableFields: [
            { id: "employeeId", label: "Employee ID", category: "basic" },
            { id: "name", label: "Name", category: "basic" },
            { id: "email", label: "Email", category: "contact" },
            { id: "contactNumber", label: "Contact Number", category: "contact" },
            { id: "schoolIdNumber", label: "School ID Number", category: "basic" },
            { id: "subjects", label: "Subjects Taught", category: "academic" },
            { id: "classes", label: "Classes Assigned", category: "academic" },
            { id: "maxLoad", label: "Maximum Load", category: "workload" },
            { id: "maxDailyPeriods", label: "Max Daily Periods", category: "workload" },
            { id: "availability", label: "Availability Schedule", category: "schedule" },
            { id: "status", label: "Status", category: "system" }
          ]
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to prepare teacher download: ${error.message}`
      };
    }
  }
  // ===== THEME AND SETTINGS HANDLERS =====
  async handleChangeTheme(entities, schoolId, userRole) {
    const { theme_name, mode } = entities;
    let targetTheme = "dark";
    const themeMention = theme_name || mode;
    if (themeMention) {
      const themeText = themeMention.toLowerCase();
      if (themeText.includes("light") || themeText.includes("white")) {
        targetTheme = "light";
      } else if (themeText.includes("dark") || themeText.includes("black")) {
        targetTheme = "dark";
      } else if (themeText.includes("system")) {
        targetTheme = "system";
      }
    }
    try {
      return {
        success: true,
        message: `\u{1F3A8} Switching to ${targetTheme} theme now...`,
        action: "change_theme",
        actionData: { theme: targetTheme }
      };
    } catch (error) {
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to change theme: ${error.message}`
      };
    }
  }
  async handleOpenSettings(entities, schoolId, userRole) {
    const { section } = entities;
    try {
      return {
        success: true,
        message: "\u2699\uFE0F Opening settings page...",
        action: "open_settings",
        actionData: { section: section || "general" }
      };
    } catch (error) {
      return {
        success: false,
        message: `\u26A0\uFE0F Failed to open settings: ${error.message}`
      };
    }
  }
};
var intentMappingService = new IntentMappingService();
var intentMapping_default = intentMappingService;

// server/conversationMemory.ts
var ConversationMemoryService = class {
  conversations = /* @__PURE__ */ new Map();
  RETENTION_MINUTES = 15;
  cleanupInterval;
  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldConversations();
    }, 5 * 60 * 1e3);
  }
  /**
   * Store a conversation message for a user
   */
  storeConversation(userId, userMessage, aiResponse, intent, entities) {
    const conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userMessage,
      aiResponse,
      timestamp: /* @__PURE__ */ new Date(),
      intent,
      entities
    };
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, []);
    }
    const userConversations = this.conversations.get(userId);
    userConversations.push(conversation);
    this.cleanupUserConversations(userId);
    console.log(`[CONVERSATION] Stored conversation for user ${userId} (${userMessage.length} chars)`);
  }
  /**
   * Get conversation history for a user from the last 15 minutes
   */
  getConversationHistory(userId) {
    const userConversations = this.conversations.get(userId) || [];
    const cutoffTime = new Date(Date.now() - this.RETENTION_MINUTES * 60 * 1e3);
    const recentConversations = userConversations.filter(
      (conv) => conv.timestamp > cutoffTime
    );
    console.log(`[CONVERSATION] Retrieved ${recentConversations.length} recent conversations for user ${userId}`);
    return recentConversations;
  }
  /**
   * Format conversation history for LLAMA context
   */
  formatConversationContext(userId) {
    const history = this.getConversationHistory(userId);
    if (history.length === 0) {
      return "";
    }
    const contextLines = history.map((conv) => {
      const timeAgo = Math.round((Date.now() - conv.timestamp.getTime()) / 6e4);
      return `[${timeAgo}m ago]
User: ${conv.userMessage}
Chroney: ${conv.aiResponse}`;
    });
    return `

**Recent Conversation Context (last ${this.RETENTION_MINUTES} minutes):**
${contextLines.join("\n\n")}

**Current conversation:**`;
  }
  /**
   * Get conversation statistics for a user
   */
  getConversationStats(userId) {
    const history = this.getConversationHistory(userId);
    if (history.length === 0) {
      return {
        totalMessages: 0,
        timespan: "No recent conversations"
      };
    }
    const oldestMessage = history[0].timestamp;
    const newestMessage = history[history.length - 1].timestamp;
    const timespanMinutes = Math.round((newestMessage.getTime() - oldestMessage.getTime()) / 6e4);
    return {
      totalMessages: history.length,
      timespan: timespanMinutes > 0 ? `${timespanMinutes} minutes` : "Less than a minute",
      oldestMessage,
      newestMessage
    };
  }
  /**
   * Clean up conversations older than retention period for a specific user
   */
  cleanupUserConversations(userId) {
    const userConversations = this.conversations.get(userId);
    if (!userConversations) return;
    const cutoffTime = new Date(Date.now() - this.RETENTION_MINUTES * 60 * 1e3);
    const recentConversations = userConversations.filter(
      (conv) => conv.timestamp > cutoffTime
    );
    this.conversations.set(userId, recentConversations);
  }
  /**
   * Clean up old conversations for all users
   */
  cleanupOldConversations() {
    const cutoffTime = new Date(Date.now() - this.RETENTION_MINUTES * 60 * 1e3);
    let totalCleaned = 0;
    for (const [userId, conversations] of Array.from(this.conversations.entries())) {
      const beforeCount = conversations.length;
      const recentConversations = conversations.filter(
        (conv) => conv.timestamp > cutoffTime
      );
      if (recentConversations.length === 0) {
        this.conversations.delete(userId);
      } else {
        this.conversations.set(userId, recentConversations);
      }
      totalCleaned += beforeCount - recentConversations.length;
    }
    if (totalCleaned > 0) {
      console.log(`[CONVERSATION] Cleaned up ${totalCleaned} old conversation messages`);
    }
  }
  /**
   * Clear all conversations for a user (for testing or privacy)
   */
  clearUserConversations(userId) {
    this.conversations.delete(userId);
    console.log(`[CONVERSATION] Cleared all conversations for user ${userId}`);
  }
  /**
   * Get current memory usage statistics
   */
  getMemoryStats() {
    const totalUsers = this.conversations.size;
    let totalConversations = 0;
    for (const conversations of Array.from(this.conversations.values())) {
      totalConversations += conversations.length;
    }
    const estimatedMemoryKB = totalConversations * 1;
    const memoryUsage = estimatedMemoryKB > 1024 ? `${(estimatedMemoryKB / 1024).toFixed(2)} MB` : `${estimatedMemoryKB} KB`;
    return {
      totalUsers,
      totalConversations,
      memoryUsage
    };
  }
  /**
   * Cleanup resources when shutting down
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.conversations.clear();
  }
};
var conversationMemory = new ConversationMemoryService();
process.on("SIGTERM", () => {
  conversationMemory.destroy();
});
process.on("SIGINT", () => {
  conversationMemory.destroy();
});
var conversationMemory_default = conversationMemory;

// server/chatService.ts
var chatRequestSchema = z3.object({
  message: z3.string().min(1, "Message cannot be empty")
});
function tryLocalPatternMatching(message) {
  const lowerMessage = message.toLowerCase().trim();
  if (/create\s+(a\s+)?(new\s+)?class/i.test(lowerMessage) || /add\s+(a\s+)?(new\s+)?class/i.test(lowerMessage) || /make\s+(a\s+)?(new\s+)?class/i.test(lowerMessage)) {
    return {
      intent: "CREATE_CLASS",
      entities: {
        action_type: "create"
      },
      confidence: 0.9
    };
  }
  if (/create\s+(a\s+)?(new\s+)?teacher/i.test(lowerMessage) || /add\s+(a\s+)?(new\s+)?teacher/i.test(lowerMessage) || /register\s+(a\s+)?(new\s+)?teacher/i.test(lowerMessage) || /hire\s+(a\s+)?(new\s+)?teacher/i.test(lowerMessage)) {
    return {
      intent: "CREATE_TEACHER",
      entities: {
        action_type: "create"
      },
      confidence: 0.9
    };
  }
  if (/show\s+(me\s+)?(the\s+)?timetable/i.test(lowerMessage) || /view\s+(the\s+)?timetable/i.test(lowerMessage) || /display\s+(the\s+)?timetable/i.test(lowerMessage)) {
    return {
      intent: "SHOW_TIMETABLE",
      entities: {
        action_type: "view"
      },
      confidence: 0.9
    };
  }
  return null;
}
async function processChatMessage(req, res) {
  try {
    const { message } = chatRequestSchema.parse(req.body);
    const user = req.user;
    if (!user || !user.schoolId) {
      return res.status(401).json({
        reply: "You must be logged in to a school to use the chat assistant."
      });
    }
    const userId = user.id;
    const userRole = user.role;
    const schoolId = user.schoolId;
    if (!llamaService_default.getConnectionStatus()) {
      console.log("\u274C LLAMA not connected, attempting to reconnect...");
      const connected = await llamaService_default.initialize();
      if (!connected) {
        console.log("\u{1F504} LLAMA unavailable, attempting local pattern matching...");
        const fallbackIntent = tryLocalPatternMatching(message);
        if (fallbackIntent) {
          console.log(`\u2705 Local pattern matched (LLAMA offline): ${fallbackIntent.intent}`);
          const result2 = await intentMapping_default.executeIntent(
            fallbackIntent.intent,
            fallbackIntent.entities,
            schoolId,
            userRole,
            message,
            ""
            // No conversation context available
          );
          conversationMemory_default.storeConversation(
            userId,
            message,
            result2.message,
            fallbackIntent.intent,
            fallbackIntent.entities
          );
          return res.json({
            reply: result2.message,
            action: result2.action,
            actionData: result2.actionData
          });
        } else {
          const errorReply = "\u26A0\uFE0F Oops! My brain is not functioning right now\u2026 maybe try again later.";
          conversationMemory_default.storeConversation(userId, message, errorReply);
          return res.json({
            reply: errorReply
          });
        }
      }
    }
    const conversationContext = conversationMemory_default.formatConversationContext(userId);
    console.log(`[CHAT] Processing message with ${conversationMemory_default.getConversationHistory(userId).length} previous conversations`);
    let queryType;
    let parsedIntent = null;
    try {
      queryType = await llamaService_default.classifyQueryType(message);
      console.log(`\u2705 LLAMA classified query as: ${queryType}`);
    } catch (error) {
      console.log("\u274C LLAMA classification failed:", error.message);
      console.log("\u{1F504} Attempting local pattern matching fallback for classification...");
      const fallbackIntent = tryLocalPatternMatching(message);
      if (fallbackIntent) {
        console.log(`\u2705 Local pattern matched during classification: ${fallbackIntent.intent}`);
        queryType = "school_management";
        parsedIntent = fallbackIntent;
      } else {
        const errorReply = "\u26A0\uFE0F Oops! My brain is not functioning right now\u2026 maybe try again later.";
        conversationMemory_default.storeConversation(userId, message, errorReply);
        return res.json({
          reply: errorReply
        });
      }
    }
    let result;
    if (queryType === "conversation") {
      try {
        const conversationalResponse = await llamaService_default.generateConversationalResponse(message, userRole, schoolId, conversationContext);
        result = {
          success: true,
          message: conversationalResponse
        };
        console.log(`\u2705 Generated conversational response`);
      } catch (error) {
        console.log("\u274C LLAMA conversational response failed:", error.message);
        result = {
          success: true,
          message: "Hi there! \u{1F44B} I'm Chroney, your school management assistant. I'm here to help you with attendance, timetables, classes, and more. What can I do for you today?"
        };
      }
    } else {
      try {
        parsedIntent = await llamaService_default.parseIntentWithContext(message, conversationContext);
        console.log(`\u2705 LLAMA parsed intent: ${parsedIntent.intent} (confidence: ${parsedIntent.confidence})`);
      } catch (error) {
        console.log("\u274C LLAMA intent parsing failed:", error.message);
        console.log("\u{1F504} Attempting local pattern matching fallback...");
        const fallbackIntent = tryLocalPatternMatching(message);
        if (fallbackIntent) {
          console.log(`\u2705 Local pattern matched: ${fallbackIntent.intent}`);
          parsedIntent = fallbackIntent;
        } else {
          const errorReply = "\u26A0\uFE0F Oops! My brain is not functioning right now\u2026 maybe try again later.";
          conversationMemory_default.storeConversation(userId, message, errorReply);
          return res.json({
            reply: errorReply
          });
        }
      }
      result = await intentMapping_default.executeIntent(
        parsedIntent.intent,
        parsedIntent.entities,
        schoolId,
        userRole,
        message,
        // Pass original message for natural conversation
        conversationContext
        // Pass conversation context for better responses
      );
    }
    if (queryType === "conversation") {
      conversationMemory_default.storeConversation(
        userId,
        message,
        result.message
      );
    } else {
      conversationMemory_default.storeConversation(
        userId,
        message,
        result.message,
        parsedIntent.intent,
        parsedIntent.entities
      );
    }
    return res.json({
      reply: result.message,
      action: result.action,
      actionData: result.actionData
    });
  } catch (error) {
    console.error("Chat processing error:", error);
    const errorReply = error instanceof z3.ZodError ? "I need a valid message to process. Please try again with your request." : "\u26A0\uFE0F Something went wrong while processing your request. Please try again.";
    const user = req.user;
    if (user?.id) {
      const { message } = req.body;
      conversationMemory_default.storeConversation(user.id, message || "Invalid request", errorReply);
    }
    if (error instanceof z3.ZodError) {
      return res.status(400).json({ reply: errorReply });
    }
    res.status(500).json({ reply: errorReply });
  }
}

// server/services/exportService.ts
init_storage();
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { v4 as uuidv4 } from "uuid";
var ExportService = class {
  jobs = /* @__PURE__ */ new Map();
  EXPORT_DIR = "/tmp/exports";
  MAX_CHUNK_SIZE = 5e3;
  // Sensitive fields to redact in 'safe' privacy level
  SENSITIVE_FIELDS = {
    users: ["passwordHash", "temporaryPassword", "temporaryPasswordPlainText", "email", "loginId"],
    students: ["medicalInfo", "guardianContact", "email"],
    teachers: ["personalContact", "emergencyContact", "email"],
    parents: ["email", "contactNumber", "address"]
  };
  constructor() {
    if (!fs.existsSync(this.EXPORT_DIR)) {
      fs.mkdirSync(this.EXPORT_DIR, { recursive: true });
    }
    setInterval(() => this.cleanupOldExports(), 60 * 60 * 1e3);
  }
  /**
   * Start a new export job
   */
  async startExport(options) {
    const jobId = uuidv4();
    const availableTables = this.getAvailableTables(options.userRole, options.schoolId);
    const tablesToExport = options.tables || availableTables;
    const unauthorizedTables = tablesToExport.filter((table) => !availableTables.includes(table));
    if (unauthorizedTables.length > 0) {
      throw new Error(`Access denied to tables: ${unauthorizedTables.join(", ")}`);
    }
    const job = {
      id: jobId,
      status: "pending",
      progress: 0,
      createdAt: /* @__PURE__ */ new Date(),
      metadata: {
        schoolId: options.schoolId,
        format: options.format,
        privacyLevel: options.privacyLevel,
        requestedBy: options.requestedBy,
        userRole: options.userRole,
        totalTables: tablesToExport.length,
        processedTables: 0
      }
    };
    this.jobs.set(jobId, job);
    this.processExport(jobId, options, tablesToExport).catch((error) => {
      console.error("Export failed:", error);
      const failedJob = this.jobs.get(jobId);
      if (failedJob) {
        failedJob.status = "failed";
        failedJob.error = error.message;
      }
    });
    return jobId;
  }
  /**
   * Get export job status
   */
  getJobStatus(jobId) {
    return this.jobs.get(jobId) || null;
  }
  /**
   * Get available tables based on user role (strict allowlist to prevent unauthorized access)
   */
  getAvailableTables(userRole, schoolId) {
    if (userRole === "super_admin") {
      return [
        "schools",
        "users",
        "students",
        "teachers",
        "parents",
        "studentParents",
        "classes",
        "subjects",
        "timetableEntries",
        "timetableStructure",
        "teacherAttendance",
        "studentAttendance",
        "substitutions",
        "classSubjectAssignments",
        "classTeacherAssignments",
        "teacherReplacements",
        "timetableChanges",
        "auditLogs"
      ];
    } else if (userRole === "admin" && schoolId) {
      return [
        "students",
        "teachers",
        "parents",
        "studentParents",
        "classes",
        "subjects",
        "timetableEntries",
        "timetableStructure",
        "teacherAttendance",
        "studentAttendance",
        "substitutions",
        "classSubjectAssignments",
        "classTeacherAssignments",
        "teacherReplacements",
        "timetableChanges"
      ];
    } else if (userRole === "teacher" && schoolId) {
      return [
        "students",
        "classes",
        "subjects",
        "timetableEntries",
        "timetableStructure",
        "teacherAttendance",
        "studentAttendance"
      ];
    }
    return [];
  }
  /**
   * Process the export job
   */
  async processExport(jobId, options, tables) {
    const job = this.jobs.get(jobId);
    job.status = "processing";
    const exportPath = path.join(this.EXPORT_DIR, `export_${jobId}`);
    fs.mkdirSync(exportPath, { recursive: true });
    const manifest = {
      exportId: jobId,
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      schoolId: options.schoolId || "all",
      format: options.format,
      privacyLevel: options.privacyLevel,
      requestedBy: options.requestedBy,
      userRole: options.userRole,
      tables: {}
    };
    try {
      await this.exportSchema(exportPath);
      for (let i = 0; i < tables.length; i++) {
        const tableName = tables[i];
        console.log(`Exporting table: ${tableName}`);
        const tableInfo = await this.exportTable(tableName, exportPath, options);
        manifest.tables[tableName] = tableInfo;
        job.metadata.processedTables = i + 1;
        job.progress = Math.round((i + 1) / tables.length * 100);
      }
      fs.writeFileSync(
        path.join(exportPath, "manifest.json"),
        JSON.stringify(manifest, null, 2)
      );
      const zipPath = await this.createZipArchive(exportPath, jobId);
      job.status = "completed";
      job.filePath = zipPath;
      job.completedAt = /* @__PURE__ */ new Date();
      job.progress = 100;
      fs.rmSync(exportPath, { recursive: true, force: true });
      console.log(`Export ${jobId} completed successfully`);
    } catch (error) {
      console.error(`Export ${jobId} failed:`, error);
      job.status = "failed";
      job.error = error instanceof Error ? error.message : "Unknown error";
      if (fs.existsSync(exportPath)) {
        fs.rmSync(exportPath, { recursive: true, force: true });
      }
    }
  }
  /**
   * Export database schema
   */
  async exportSchema(exportPath) {
    const schemaContent = fs.readFileSync(path.join(process.cwd(), "shared/schema.ts"), "utf8");
    fs.writeFileSync(path.join(exportPath, "schema.ts"), schemaContent);
  }
  /**
   * Export a single table using storage interface (CRITICAL: prevents data leakage)
   */
  async exportTable(tableName, exportPath, options) {
    let data = [];
    try {
      switch (tableName) {
        case "schools":
          data = options.userRole === "super_admin" ? await storage.getSchools() : [];
          break;
        case "students":
          data = options.schoolId ? await storage.getStudents(options.schoolId) : [];
          break;
        case "teachers":
          data = options.schoolId ? await storage.getTeachers(options.schoolId) : [];
          break;
        case "classes":
          data = options.schoolId ? await storage.getClasses(options.schoolId) : [];
          break;
        case "subjects":
          data = options.schoolId ? await storage.getSubjects(options.schoolId) : [];
          break;
        default:
          console.warn(`Table ${tableName} not supported for export - skipping for security`);
          data = [];
      }
    } catch (error) {
      console.error(`Error exporting table ${tableName}:`, error);
      data = [];
    }
    const cleanedData = this.cleanSensitiveData(data, tableName, options.privacyLevel);
    const formats = [];
    if (options.format === "json" || options.format === "both") {
      const jsonPath = path.join(exportPath, `${tableName}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(cleanedData, null, 2));
      formats.push("json");
    }
    if (options.format === "csv" || options.format === "both") {
      const csvPath = path.join(exportPath, `${tableName}.csv`);
      this.writeCSV(cleanedData, csvPath);
      formats.push("csv");
    }
    return {
      count: cleanedData.length,
      format: formats
    };
  }
  /**
   * Check if table is school-scoped (must be comprehensive to prevent data leakage)
   */
  isSchoolScoped(tableName) {
    const schoolScopedTables = [
      "users",
      "students",
      "teachers",
      "parents",
      "studentParents",
      "classes",
      "subjects",
      "timetableEntries",
      "timetableStructure",
      "teacherAttendance",
      "studentAttendance",
      "substitutions",
      "classSubjectAssignments",
      "classTeacherAssignments",
      "teacherReplacements",
      "timetableChanges",
      "auditLogs"
    ];
    return schoolScopedTables.includes(tableName);
  }
  /**
   * Clean sensitive data based on privacy level
   */
  cleanSensitiveData(data, tableName, privacyLevel) {
    if (privacyLevel === "full") {
      return data;
    }
    const sensitiveFields = this.SENSITIVE_FIELDS[tableName] || [];
    return data.map((row) => {
      const cleanedRow = { ...row };
      sensitiveFields.forEach((field) => {
        if (field in cleanedRow) {
          cleanedRow[field] = "[REDACTED]";
        }
      });
      return cleanedRow;
    });
  }
  /**
   * Write data to CSV format
   */
  writeCSV(data, filePath) {
    if (data.length === 0) {
      fs.writeFileSync(filePath, "");
      return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(
        (row) => headers.map((header) => {
          const value = row[header];
          const stringValue = typeof value === "object" && value !== null ? JSON.stringify(value).replace(/"/g, '""') : String(value || "").replace(/"/g, '""');
          return `"${stringValue}"`;
        }).join(",")
      )
    ].join("\n");
    fs.writeFileSync(filePath, csvContent);
  }
  /**
   * Create ZIP archive
   */
  async createZipArchive(sourcePath, jobId) {
    const zipPath = path.join(this.EXPORT_DIR, `school_export_${jobId}.zip`);
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });
      output.on("close", () => resolve(zipPath));
      archive.on("error", reject);
      archive.pipe(output);
      archive.directory(sourcePath, false);
      archive.finalize();
    });
  }
  /**
   * Cleanup old export files
   */
  cleanupOldExports() {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1e3;
    for (const [jobId, job] of Array.from(this.jobs.entries())) {
      if (job.createdAt.getTime() < cutoffTime) {
        if (job.filePath && fs.existsSync(job.filePath)) {
          fs.unlinkSync(job.filePath);
        }
        this.jobs.delete(jobId);
      }
    }
  }
  /**
   * Log audit event for compliance
   */
  async logAuditEvent(options, action, details) {
    try {
      await storage.createAuditLog({
        userId: options.requestedBy,
        schoolId: options.schoolId || "all",
        action: `database_${action}`,
        details: JSON.stringify({
          format: options.format,
          privacyLevel: options.privacyLevel,
          userRole: options.userRole,
          ...details
        }),
        ipAddress: "127.0.0.1",
        // Server-side export
        userAgent: "Export Service"
      });
    } catch (error) {
      console.error("Failed to log audit event:", error);
    }
  }
  /**
   * Get export file for download
   */
  getExportFile(jobId) {
    const job = this.jobs.get(jobId);
    if (job && job.status === "completed" && job.filePath && fs.existsSync(job.filePath)) {
      return job.filePath;
    }
    return null;
  }
};
var exportService = new ExportService();

// server/routes/downloadExcel.ts
import express from "express";
import { z as z4 } from "zod";

// server/services/excelService.ts
init_storage();
import * as XLSX2 from "xlsx";
var ExcelService = class {
  /**
   * Generate Excel file for students or teachers with selected fields
   */
  async generateExcel(request, schoolId) {
    const { type, fields } = request;
    let data = [];
    if (type === "students") {
      data = await this.fetchStudentData(schoolId, fields);
    } else if (type === "teachers") {
      data = await this.fetchTeacherData(schoolId, fields);
    }
    const workbook = XLSX2.utils.book_new();
    const worksheet = XLSX2.utils.json_to_sheet(data);
    const columnWidths = this.calculateColumnWidths(data);
    worksheet["!cols"] = columnWidths;
    XLSX2.utils.book_append_sheet(workbook, worksheet, type === "students" ? "Students" : "Teachers");
    const excelBuffer = XLSX2.write(workbook, { type: "buffer", bookType: "xlsx" });
    return excelBuffer;
  }
  /**
   * Fetch student data with selected fields
   */
  async fetchStudentData(schoolId, fields) {
    const students2 = await storage.getStudents(schoolId);
    const classes2 = await storage.getClasses(schoolId);
    const classMap = new Map(classes2.map((c) => [c.id, `${c.grade}${c.section}`]));
    return students2.map((student) => {
      const formattedStudent = {};
      fields.forEach((field) => {
        switch (field) {
          case "admissionNumber":
            formattedStudent["Admission Number"] = student.admissionNumber;
            break;
          case "firstName":
            formattedStudent["First Name"] = student.firstName;
            break;
          case "lastName":
            formattedStudent["Last Name"] = student.lastName;
            break;
          case "rollNumber":
            formattedStudent["Roll Number"] = student.rollNumber || "";
            break;
          case "className":
            formattedStudent["Class"] = classMap.get(student.classId) || "Not Assigned";
            break;
          case "email":
            formattedStudent["Email"] = student.email || "";
            break;
          case "contactNumber":
            formattedStudent["Contact Number"] = student.contactNumber || "";
            break;
          case "dateOfBirth":
            formattedStudent["Date of Birth"] = student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : "";
            break;
          case "gender":
            formattedStudent["Gender"] = student.gender || "";
            break;
          case "bloodGroup":
            formattedStudent["Blood Group"] = student.bloodGroup || "";
            break;
          case "address":
            formattedStudent["Address"] = student.address || "";
            break;
          case "guardianName":
            formattedStudent["Guardian Name"] = student.guardianName || "";
            break;
          case "guardianRelation":
            formattedStudent["Guardian Relation"] = student.guardianRelation || "";
            break;
          case "guardianContact":
            formattedStudent["Guardian Contact"] = student.guardianContact || "";
            break;
          case "emergencyContact":
            formattedStudent["Emergency Contact"] = student.emergencyContact || "";
            break;
          case "medicalInfo":
            formattedStudent["Medical Information"] = student.medicalInfo || "";
            break;
          case "status":
            formattedStudent["Status"] = student.status;
            break;
        }
      });
      return formattedStudent;
    });
  }
  /**
   * Fetch teacher data with selected fields
   */
  async fetchTeacherData(schoolId, fields) {
    const teachers2 = await storage.getTeachers(schoolId);
    const subjects2 = await storage.getSubjects(schoolId);
    const classes2 = await storage.getClasses(schoolId);
    const subjectMap = new Map(subjects2.map((s) => [s.id, s.name]));
    const classMap = new Map(classes2.map((c) => [c.id, `${c.grade}${c.section}`]));
    return teachers2.map((teacher) => {
      const formattedTeacher = {};
      fields.forEach((field) => {
        switch (field) {
          case "employeeId":
            formattedTeacher["Employee ID"] = teacher.employeeId;
            break;
          case "name":
            formattedTeacher["Name"] = teacher.name;
            break;
          case "email":
            formattedTeacher["Email"] = teacher.email || "";
            break;
          case "contactNumber":
            formattedTeacher["Contact Number"] = teacher.contactNumber || "";
            break;
          case "schoolIdNumber":
            formattedTeacher["School ID Number"] = teacher.schoolIdNumber || "";
            break;
          case "subjects":
            const teacherSubjects = Array.isArray(teacher.subjects) ? teacher.subjects.map((subjectId) => subjectMap.get(subjectId) || subjectId).join(", ") : "";
            formattedTeacher["Subjects Taught"] = teacherSubjects;
            break;
          case "classes":
            const teacherClasses = Array.isArray(teacher.classes) ? teacher.classes.map((classId) => classMap.get(classId) || classId).join(", ") : "";
            formattedTeacher["Classes Assigned"] = teacherClasses;
            break;
          case "maxLoad":
            formattedTeacher["Maximum Load"] = teacher.maxLoad || 0;
            break;
          case "maxDailyPeriods":
            formattedTeacher["Max Daily Periods"] = teacher.maxDailyPeriods || 0;
            break;
          case "availability":
            const availability = teacher.availability && typeof teacher.availability === "object" ? this.formatAvailability(teacher.availability) : "";
            formattedTeacher["Availability Schedule"] = availability;
            break;
          case "status":
            formattedTeacher["Status"] = teacher.status;
            break;
        }
      });
      return formattedTeacher;
    });
  }
  /**
   * Format teacher availability schedule for Excel
   */
  formatAvailability(availability) {
    if (!availability || typeof availability !== "object") return "";
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const schedule = days.map((day) => {
      const periods = availability[day];
      if (Array.isArray(periods) && periods.length > 0) {
        return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${periods.join(", ")}`;
      }
      return null;
    }).filter(Boolean).join(" | ");
    return schedule;
  }
  /**
   * Calculate optimal column widths for the worksheet
   */
  calculateColumnWidths(data) {
    if (data.length === 0) return [];
    const headers = Object.keys(data[0]);
    const columnWidths = headers.map((header) => {
      const maxLength = Math.max(
        header.length,
        ...data.map((row) => String(row[header] || "").length)
      );
      return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
    });
    return columnWidths;
  }
};
var excelService = new ExcelService();

// server/routes/downloadExcel.ts
var router = express.Router();
var downloadExcelSchema = z4.object({
  type: z4.enum(["students", "teachers"]),
  fields: z4.array(z4.string()).min(1, "At least one field must be selected")
});
var FIELD_PERMISSIONS = {
  students: {
    teacher: ["admissionNumber", "firstName", "lastName", "rollNumber", "className", "status"],
    // Basic info only
    admin: ["admissionNumber", "firstName", "lastName", "rollNumber", "className", "email", "contactNumber", "dateOfBirth", "gender", "bloodGroup", "address", "guardianName", "guardianRelation", "guardianContact", "emergencyContact", "medicalInfo", "status"],
    // All fields
    super_admin: ["admissionNumber", "firstName", "lastName", "rollNumber", "className", "email", "contactNumber", "dateOfBirth", "gender", "bloodGroup", "address", "guardianName", "guardianRelation", "guardianContact", "emergencyContact", "medicalInfo", "status"]
    // All fields
  },
  teachers: {
    admin: ["employeeId", "name", "email", "contactNumber", "schoolIdNumber", "subjects", "classes", "maxLoad", "maxDailyPeriods", "availability", "status"],
    // All fields
    super_admin: ["employeeId", "name", "email", "contactNumber", "schoolIdNumber", "subjects", "classes", "maxLoad", "maxDailyPeriods", "availability", "status"]
    // All fields
  }
};
router.post("/download-excel", async (req, res) => {
  try {
    const validatedData = downloadExcelSchema.parse(req.body);
    const user = req.user;
    if (!user || !user.schoolId) {
      return res.status(401).json({
        error: "You must be logged in to a school to download data."
      });
    }
    const { type, fields } = validatedData;
    const { schoolId, role } = user;
    if (type === "teachers" && role !== "admin" && role !== "super_admin") {
      return res.status(403).json({
        error: "Only administrators can download teacher data."
      });
    }
    if (type === "students" && role !== "admin" && role !== "super_admin" && role !== "teacher") {
      return res.status(403).json({
        error: "You do not have permission to download student data."
      });
    }
    const allowedFields = FIELD_PERMISSIONS[type]?.[role] || [];
    const unauthorizedFields = fields.filter((field) => !allowedFields.includes(field));
    if (unauthorizedFields.length > 0) {
      return res.status(403).json({
        error: `Access denied to fields: ${unauthorizedFields.join(", ")}. Your role (${role}) does not have permission to export these fields.`
      });
    }
    console.log(`[EXCEL DOWNLOAD] User ${user.id} (${role}) downloading ${type} data with fields:`, fields);
    const excelBuffer = await excelService.generateExcel({ type, fields }, schoolId);
    const filename = `${type}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", excelBuffer.length.toString());
    res.send(excelBuffer);
    console.log(`[EXCEL DOWNLOAD] Successfully generated ${filename} (${excelBuffer.length} bytes)`);
  } catch (error) {
    console.error("[EXCEL DOWNLOAD] Error:", error);
    if (error instanceof z4.ZodError) {
      return res.status(400).json({
        error: "Invalid request data",
        details: error.errors
      });
    }
    res.status(500).json({
      error: "Failed to generate Excel file. Please try again."
    });
  }
});
var downloadExcel_default = router;

// shared/utils.ts
function parseDateOnly(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}
function isFutureDate(dateString) {
  const targetDate = parseDateOnly(dateString);
  const today = /* @__PURE__ */ new Date();
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return targetDate > today;
}

// server/routes.ts
import crypto from "crypto";
import fs2 from "fs";
import path2 from "path";
var upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
  // 5MB limit
});
function generateColorForSubjectCode(subjectCode) {
  const colors = [
    "#3B82F6",
    // Blue
    "#EF4444",
    // Red  
    "#10B981",
    // Green
    "#F59E0B",
    // Amber
    "#8B5CF6",
    // Violet
    "#06B6D4",
    // Cyan
    "#F97316",
    // Orange
    "#84CC16",
    // Lime
    "#EC4899",
    // Pink
    "#6366F1",
    // Indigo
    "#14B8A6",
    // Teal
    "#DC2626",
    // Red-600
    "#7C3AED",
    // Purple
    "#059669",
    // Emerald
    "#D97706",
    // Orange-600
    "#2563EB",
    // Blue-600
    "#BE123C",
    // Rose
    "#0891B2",
    // Sky
    "#CA8A04",
    // Yellow-600
    "#9333EA"
    // Purple-600
  ];
  let hash = 0;
  for (let i = 0; i < subjectCode.length; i++) {
    const char = subjectCode.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
}
async function generateGradeSpecificSubjectCode(subjectName, grade, schoolId) {
  const baseCode = subjectName.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 3);
  let code = `${baseCode}${grade}`;
  let counter = 1;
  while (await storage.checkSubjectCodeExists(code, schoolId)) {
    code = `${baseCode}${grade}_${counter}`;
    counter++;
  }
  return code;
}
async function registerRoutes(app2) {
  setupCustomAuth(app2);
  app2.get("/api/auth/user", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { passwordHash, ...userWithoutPassword } = user;
      if (user.role === "student" && user.studentId) {
        const student = await storage.getStudent(user.studentId);
        if (student) {
          userWithoutPassword.firstName = student.firstName;
          userWithoutPassword.lastName = student.lastName;
        }
      } else if (user.role === "parent" && user.parentId) {
        const parent = await storage.getParent(user.parentId);
        if (parent) {
          userWithoutPassword.firstName = parent.firstName;
          userWithoutPassword.lastName = parent.lastName;
        }
      }
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.put("/api/auth/profile", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email } = req.body;
      if (!firstName?.trim()) {
        return res.status(400).json({ message: "First name is required" });
      }
      if (!email?.trim()) {
        return res.status(400).json({ message: "Email is required" });
      }
      if (email !== req.user.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Email is already in use" });
        }
      }
      const updatedUser = await storage.updateUser(userId, {
        firstName: firstName.trim(),
        lastName: lastName?.trim() || null,
        email: email.trim()
      });
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.put("/api/auth/password", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      const bcrypt3 = await import("bcryptjs");
      const isCurrentPasswordValid = await bcrypt3.default.compare(currentPassword, req.user.passwordHash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      const hashedNewPassword = await bcrypt3.default.hash(newPassword, 12);
      await storage.updateUser(userId, {
        passwordHash: hashedNewPassword,
        passwordChangedAt: /* @__PURE__ */ new Date()
      });
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
  app2.get("/api/school-info", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "student" && user.role !== "parent") {
        return res.status(403).json({ message: "Access denied" });
      }
      if (!user.schoolId) {
        return res.status(400).json({ message: "User is not associated with a school" });
      }
      const school = await storage.getSchool(user.schoolId);
      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }
      const teacherCount = await storage.getTeacherCountBySchool(user.schoolId);
      res.json({
        ...school,
        totalTeachers: teacherCount
      });
    } catch (error) {
      console.error("Error fetching school info:", error);
      res.status(500).json({ message: "Failed to fetch school information" });
    }
  });
  app2.get("/api/schools", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      const schools2 = await storage.getSchoolsWithAdminEmails();
      res.json(schools2);
    } catch (error) {
      console.error("Error fetching schools:", error);
      res.status(500).json({ message: "Failed to fetch schools" });
    }
  });
  app2.post("/api/schools", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      const { adminEmail, adminPassword, adminName, ...schoolData } = req.body;
      const validatedSchoolData = insertSchoolSchema.parse({
        ...schoolData,
        adminName
      });
      const school = await storage.createSchool(validatedSchoolData);
      if (adminEmail && adminPassword) {
        const bcrypt3 = await import("bcryptjs");
        const hashedPassword = await bcrypt3.default.hash(adminPassword, 12);
        await storage.createUser({
          email: adminEmail,
          loginId: adminEmail,
          // Use email as loginId for admin users
          passwordHash: hashedPassword,
          role: "admin",
          schoolId: school.id,
          firstName: adminName,
          lastName: null,
          teacherId: null,
          studentId: null,
          parentId: null
        });
      }
      res.status(201).json(school);
    } catch (error) {
      console.error("Error creating school:", error);
      res.status(400).json({ message: "Invalid school data" });
    }
  });
  app2.put("/api/schools/:id", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      const { adminEmail, adminPassword, adminName, ...schoolData } = req.body;
      const validatedSchoolData = insertSchoolSchema.partial().parse({
        ...schoolData,
        adminName
      });
      const school = await storage.updateSchool(req.params.id, validatedSchoolData);
      if (adminEmail && adminPassword) {
        const bcrypt3 = await import("bcryptjs");
        const hashedPassword = await bcrypt3.default.hash(adminPassword, 12);
        try {
          const existingUsers = await storage.getUsersBySchoolId(req.params.id);
          const existingAdmin = existingUsers.find((user) => user.role === "admin");
          if (existingAdmin) {
            await storage.updateUser(existingAdmin.id, {
              email: adminEmail,
              passwordHash: hashedPassword,
              firstName: adminName
            });
          } else {
            await storage.createUser({
              email: adminEmail,
              loginId: adminEmail,
              // Use email as loginId for admin users
              passwordHash: hashedPassword,
              role: "admin",
              schoolId: school.id,
              firstName: adminName,
              lastName: null,
              teacherId: null,
              studentId: null,
              parentId: null
            });
          }
        } catch (error) {
          console.error("Error managing admin account:", error);
        }
      }
      res.json(school);
    } catch (error) {
      console.error("Error updating school:", error);
      res.status(400).json({ message: "Invalid school data" });
    }
  });
  app2.patch("/api/schools/:id/status", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      const { id } = req.params;
      const { isActive } = req.body;
      console.log(`Updating school ${id} status to ${isActive}`);
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "isActive must be a boolean value" });
      }
      const updatedSchool = await storage.updateSchool(id, { isActive });
      console.log("Updated school:", updatedSchool);
      res.json(updatedSchool);
    } catch (error) {
      console.error("Error updating school status:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to update school status", error: errorMessage });
    }
  });
  app2.get("/api/stats", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const stats = await storage.getStats(user.schoolId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app2.get("/api/admin/dashboard-stats", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch admin dashboard stats" });
    }
  });
  app2.get("/api/system-modules", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      const activeOnly = req.query.activeOnly === "true";
      const modules = await storage.getSystemModules(activeOnly);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching system modules:", error);
      res.status(500).json({ message: "Failed to fetch system modules" });
    }
  });
  app2.post("/api/system-modules", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      const module = await storage.createSystemModule(req.body);
      res.status(201).json(module);
    } catch (error) {
      console.error("Error creating system module:", error);
      res.status(400).json({ message: "Failed to create system module" });
    }
  });
  app2.put("/api/system-modules/:id", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      const module = await storage.updateSystemModule(req.params.id, req.body);
      res.json(module);
    } catch (error) {
      console.error("Error updating system module:", error);
      res.status(400).json({ message: "Failed to update system module" });
    }
  });
  app2.delete("/api/system-modules/:id", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      await storage.updateSystemModule(req.params.id, { isActive: false });
      res.json({ message: "System module deactivated successfully" });
    } catch (error) {
      console.error("Error deleting system module:", error);
      res.status(500).json({ message: "Failed to delete system module" });
    }
  });
  app2.get("/api/role-permissions", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      const { schoolId, role } = req.query;
      const permissions = await storage.getRolePermissions(schoolId, role);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });
  app2.post("/api/role-permissions", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      const permissionData = {
        ...req.body,
        assignedBy: req.user?.id
      };
      const permission = await storage.setRolePermission(permissionData);
      res.status(201).json(permission);
    } catch (error) {
      console.error("Error creating role permission:", error);
      res.status(400).json({ message: "Failed to create role permission" });
    }
  });
  app2.put("/api/role-permissions/:id", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      const permissionData = {
        ...req.body,
        assignedBy: req.user?.id
      };
      const permission = await storage.updateRolePermission(req.params.id, permissionData);
      res.json(permission);
    } catch (error) {
      console.error("Error updating role permission:", error);
      res.status(400).json({ message: "Failed to update role permission" });
    }
  });
  app2.delete("/api/role-permissions/:id", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      await storage.deleteRolePermission(req.params.id);
      res.json({ message: "Role permission deleted successfully" });
    } catch (error) {
      console.error("Error deleting role permission:", error);
      res.status(500).json({ message: "Failed to delete role permission" });
    }
  });
  app2.get("/api/posts", authenticateToken, async (req, res) => {
    try {
      if (!req.user?.schoolId) {
        return res.status(400).json({ message: "User not associated with a school" });
      }
      const { feedScope, classId, offset, limit } = req.query;
      const parsedOffset = offset ? parseInt(offset, 10) : void 0;
      const parsedLimit = limit ? parseInt(limit, 10) : void 0;
      if (parsedOffset !== void 0 && (isNaN(parsedOffset) || parsedOffset < 0)) {
        return res.status(400).json({ message: "Invalid offset parameter" });
      }
      if (parsedLimit !== void 0 && (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50)) {
        return res.status(400).json({ message: "Invalid limit parameter (must be between 1 and 50)" });
      }
      const posts2 = await storage.getPosts(
        req.user.schoolId,
        feedScope,
        classId,
        parsedOffset,
        parsedLimit
      );
      res.json(posts2);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });
  app2.post("/api/posts", authenticateToken, async (req, res) => {
    try {
      const { content, feedScope, classId, attachments = [] } = req.body;
      if (req.user?.role === "student" || req.user?.role === "parent") {
        return res.status(403).json({ message: "Students and parents cannot create posts" });
      }
      if (!req.user?.schoolId) {
        return res.status(400).json({ message: "User not associated with a school" });
      }
      if (feedScope === "class") {
        if (!classId) {
          return res.status(400).json({ message: "Class ID required for class posts" });
        }
        if (req.user.role === "teacher") {
        }
      }
      const post = await storage.createPost({
        content,
        feedScope: feedScope || "school",
        classId: feedScope === "class" ? classId : null,
        attachments,
        postedById: req.user.id,
        schoolId: req.user.schoolId,
        isActive: true
      });
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });
  app2.get("/api/posts/my-feed", authenticateToken, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const feed = await storage.getUserFeed(req.user.id);
      res.json(feed);
    } catch (error) {
      console.error("Error fetching user feed:", error);
      res.status(500).json({ message: "Failed to fetch user feed" });
    }
  });
  app2.put("/api/posts/:id", authenticateToken, async (req, res) => {
    try {
      const { content, attachments } = req.body;
      const postId = req.params.id;
      const originalPost = await storage.getPostById(postId);
      if (!originalPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      if (originalPost.postedById !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "You can only edit your own posts" });
      }
      const updatedPost = await storage.updatePost(postId, {
        content,
        attachments
      });
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });
  app2.delete("/api/posts/:id", authenticateToken, async (req, res) => {
    try {
      const postId = req.params.id;
      const originalPost = await storage.getPostById(postId);
      if (!originalPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      if (originalPost.postedById !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "You can only delete your own posts" });
      }
      await storage.deletePost(postId);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });
  app2.post("/api/posts/upload-attachment", authenticateToken, upload.single("attachment"), async (req, res) => {
    try {
      console.log("[UPLOAD DEBUG] Upload request received");
      console.log("[UPLOAD DEBUG] User role:", req.user?.role);
      console.log("[UPLOAD DEBUG] File present:", !!req.file);
      if (!req.file) {
        console.log("[UPLOAD DEBUG] No file in request");
        return res.status(400).json({ message: "No file uploaded" });
      }
      console.log("[UPLOAD DEBUG] File details:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
      if (req.user?.role === "student" || req.user?.role === "parent") {
        console.log("[UPLOAD DEBUG] User role not allowed:", req.user?.role);
        return res.status(403).json({ message: "Students and parents cannot upload attachments" });
      }
      console.log("[UPLOAD DEBUG] Simplified validation - checking basic file types");
      const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "text/plain"
      ];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        console.log("[UPLOAD DEBUG] MIME type not allowed:", req.file.mimetype);
        return res.status(400).json({
          message: `File type ${req.file.mimetype} not allowed. Only images, PDFs, and text files are supported.`
        });
      }
      if (req.file.size > 5 * 1024 * 1024) {
        console.log("[UPLOAD DEBUG] File too large:", req.file.size);
        return res.status(400).json({
          message: "File too large. Maximum size is 5MB"
        });
      }
      const fileId = crypto.randomUUID();
      const fileExtension = path2.extname(req.file.originalname) || ".tmp";
      const secureFilename = `${fileId}${fileExtension}`;
      console.log("[UPLOAD DEBUG] Generated filename:", secureFilename);
      const uploadsDir = path2.join(process.cwd(), "attached_assets", "secure_uploads");
      if (!fs2.existsSync(uploadsDir)) {
        fs2.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path2.join(uploadsDir, secureFilename);
      fs2.writeFileSync(filePath, req.file.buffer);
      const fileMetadata = {
        id: fileId,
        originalName: req.file.originalname,
        filename: secureFilename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.user.id,
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
        schoolId: req.user.schoolId
      };
      console.log("[UPLOAD DEBUG] Upload successful, returning response");
      res.json({
        fileId,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (error) {
      console.error("Error uploading attachment:", error);
      res.status(500).json({ message: "Failed to upload attachment" });
    }
  });
  const simpleFileAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.split(" ")[1];
    if (!token && req.query.token) {
      token = req.query.token;
    }
    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    try {
      const user = await storage.getUser(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error("Authentication error:", error);
      return res.status(500).json({ message: "Authentication failed" });
    }
  };
  app2.get("/api/files/:fileId", simpleFileAuth, async (req, res) => {
    try {
      const { fileId } = req.params;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }
      const uploadsDir = path2.join(process.cwd(), "attached_assets", "secure_uploads");
      const files = fs2.readdirSync(uploadsDir);
      const targetFile = files.find((file) => file.startsWith(fileId));
      if (!targetFile) {
        return res.status(404).json({ message: "File not found" });
      }
      const filePath = path2.join(uploadsDir, targetFile);
      if (!fs2.existsSync(filePath) || !path2.resolve(filePath).startsWith(path2.resolve(uploadsDir))) {
        return res.status(404).json({ message: "File not found" });
      }
      const posts2 = await storage.getPostsWithFileId(fileId);
      if (posts2.length === 0) {
        return res.status(404).json({ message: "File not found" });
      }
      let hasAccess = false;
      for (const post of posts2) {
        if (post.feedScope === "school") {
          if (req.user?.schoolId === post.schoolId) {
            hasAccess = true;
            break;
          }
        } else if (post.feedScope === "class") {
          if (!post.classId) continue;
          if (req.user?.role === "admin" && req.user?.schoolId === post.schoolId) {
            hasAccess = true;
            break;
          } else if (req.user?.role === "teacher" && req.user?.schoolId === post.schoolId && req.user?.teacherId) {
            const teacherClassAccess = await storage.isTeacherAssignedToClass(req.user.teacherId, post.classId);
            if (teacherClassAccess) {
              hasAccess = true;
              break;
            }
          } else if (req.user?.role === "student" && req.user?.schoolId === post.schoolId && req.user?.studentId) {
            const studentClassAccess = await storage.isStudentInClass(req.user.studentId, post.classId);
            if (studentClassAccess) {
              hasAccess = true;
              break;
            }
          } else if (req.user?.role === "parent" && req.user?.schoolId === post.schoolId && req.user?.parentId) {
            const parentClassAccess = await storage.isParentLinkedToClass(req.user.parentId, post.classId);
            if (parentClassAccess) {
              hasAccess = true;
              break;
            }
          }
        }
      }
      if (!hasAccess) {
        return res.status(404).json({ message: "File not found" });
      }
      const stats = fs2.statSync(filePath);
      const fileExtension = path2.extname(targetFile);
      const mimeTypes = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".pdf": "application/pdf",
        ".txt": "text/plain"
      };
      const contentType = mimeTypes[fileExtension] || "application/octet-stream";
      res.set({
        "Content-Type": contentType,
        "Content-Length": stats.size,
        "Content-Disposition": `inline; filename="${fileId}${fileExtension}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=3600"
      });
      const fileStream = fs2.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ message: "Failed to serve file" });
    }
  });
  app2.get("/api/teachers", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      let teachers2;
      if (user?.role === "super_admin") {
        teachers2 = await storage.getTeachers();
      } else if (user?.schoolId) {
        teachers2 = await storage.getTeachers(user.schoolId);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(teachers2);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });
  app2.get("/api/teachers/:id", async (req, res) => {
    try {
      const teacher = await storage.getTeacher(req.params.id);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      res.json(teacher);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      res.status(500).json({ message: "Failed to fetch teacher" });
    }
  });
  app2.post("/api/teachers", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const requestBody = { ...req.body };
      if (user.role === "admin") {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        requestBody.schoolId = user.schoolId;
      } else if (user.role === "super_admin") {
        if (!requestBody.schoolId) {
          return res.status(400).json({ message: "School ID is required for super admin" });
        }
      }
      const generateEmployeeId = () => {
        const timestamp2 = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `EMP${timestamp2}${random}`;
      };
      const cleanedRequestBody = { ...requestBody };
      const optionalFields = [
        "email",
        "contactNumber",
        "schoolIdNumber",
        "aadhar",
        "gender",
        "bloodGroup",
        "designation",
        "dateOfBirth",
        "fatherHusbandName",
        "address",
        "category",
        "religion",
        "profilePictureUrl"
      ];
      optionalFields.forEach((field) => {
        if (cleanedRequestBody[field] === "") {
          cleanedRequestBody[field] = null;
        }
      });
      const schemaWithoutEmployeeId = insertTeacherSchema.omit({ employeeId: true });
      const validatedDataWithoutEmployeeId = schemaWithoutEmployeeId.parse(cleanedRequestBody);
      const validatedData = {
        ...validatedDataWithoutEmployeeId,
        employeeId: generateEmployeeId()
      };
      const teacher = await storage.createTeacher(validatedData);
      res.status(201).json(teacher);
    } catch (error) {
      console.error("Error creating teacher:", error);
      if (error && typeof error === "object" && "code" in error && "constraint" in error) {
        if (error.code === "23505" && error.constraint === "teachers_email_unique") {
          return res.status(400).json({ message: "A teacher with this email already exists" });
        }
      }
      res.status(400).json({ message: "Invalid teacher data" });
    }
  });
  app2.put("/api/teachers/daily-periods", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const validatedData = updateTeacherDailyPeriodsSchema.parse(req.body);
      const result = await storage.updateTeacherDailyPeriods(user.schoolId, validatedData);
      await storage.createAuditLog({
        schoolId: user.schoolId,
        userId: user.id,
        action: "UPDATE",
        entityType: "TEACHER",
        entityId: validatedData.teacherId || "ALL",
        description: `Updated daily periods limit to ${validatedData.maxDailyPeriods}`,
        newValues: { maxDailyPeriods: validatedData.maxDailyPeriods, applyToAll: validatedData.applyToAll }
      });
      res.json(result);
    } catch (error) {
      console.error("Error updating teacher daily periods:", error);
      res.status(500).json({ message: "Failed to update teacher daily periods" });
    }
  });
  app2.put("/api/teachers/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const teacherId = req.params.id;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const existingTeacher = await storage.getTeacher(teacherId);
      if (!existingTeacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      if (user.role === "admin" && user.schoolId && existingTeacher.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - teacher not in your school" });
      }
      const cleanedRequestBody = { ...req.body };
      const optionalFields = [
        "email",
        "contactNumber",
        "schoolIdNumber",
        "aadhar",
        "gender",
        "bloodGroup",
        "designation",
        "dateOfBirth",
        "fatherHusbandName",
        "address",
        "category",
        "religion",
        "profilePictureUrl"
      ];
      optionalFields.forEach((field) => {
        if (cleanedRequestBody[field] === "") {
          cleanedRequestBody[field] = null;
        }
      });
      const validatedData = insertTeacherSchema.partial().parse(cleanedRequestBody);
      if (user.role === "admin") {
        delete validatedData.schoolId;
      }
      const teacher = await storage.updateTeacher(teacherId, validatedData);
      res.json(teacher);
    } catch (error) {
      console.error("Error updating teacher:", error);
      res.status(400).json({ message: "Failed to update teacher" });
    }
  });
  app2.delete("/api/teachers/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const teacherId = req.params.id;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const existingTeacher = await storage.getTeacher(teacherId);
      if (!existingTeacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      if (user.role === "admin" && user.schoolId && existingTeacher.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - teacher not in your school" });
      }
      await storage.deleteTeacher(teacherId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      res.status(500).json({ message: "Failed to delete teacher" });
    }
  });
  app2.post("/api/teachers/:id/upload-profile-picture", authenticateToken, upload.single("profilePicture"), async (req, res) => {
    try {
      const user = req.user;
      const teacherId = req.params.id;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No profile picture uploaded" });
      }
      const existingTeacher = await storage.getTeacher(teacherId);
      if (!existingTeacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      if (user.role === "admin" && user.schoolId && existingTeacher.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - teacher not in your school" });
      }
      const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          message: `File type ${req.file.mimetype} not allowed. Only images are supported.`
        });
      }
      if (req.file.size > 2 * 1024 * 1024) {
        return res.status(400).json({
          message: "File too large. Maximum size is 2MB"
        });
      }
      const fileId = crypto.randomUUID();
      const fileExtension = path2.extname(req.file.originalname) || ".jpg";
      const secureFilename = `${fileId}${fileExtension}`;
      const profilePicturesDir = path2.join(process.cwd(), "Teachers Assets", "Profile Picture");
      if (!fs2.existsSync(profilePicturesDir)) {
        fs2.mkdirSync(profilePicturesDir, { recursive: true });
      }
      const filePath = path2.join(profilePicturesDir, secureFilename);
      fs2.writeFileSync(filePath, req.file.buffer);
      const profilePictureUrl = `/api/teachers/${teacherId}/profile-picture/${fileId}${fileExtension}`;
      const updatedTeacher = await storage.updateTeacher(teacherId, {
        profilePictureUrl
      });
      res.json({
        message: "Profile picture uploaded successfully",
        profilePictureUrl,
        teacher: updatedTeacher
      });
    } catch (error) {
      console.error("Error uploading teacher profile picture:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });
  app2.get("/api/teachers/:id/profile-picture/:filename", async (req, res) => {
    try {
      const { id: teacherId, filename } = req.params;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|jpeg|png|gif|webp)$/i;
      if (!uuidRegex.test(filename)) {
        return res.status(400).json({ message: "Invalid filename format" });
      }
      const teacher = await storage.getTeacher(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      const profilePicturesDir = path2.join(process.cwd(), "Teachers Assets", "Profile Picture");
      const filePath = path2.join(profilePicturesDir, filename);
      if (!fs2.existsSync(filePath) || !path2.resolve(filePath).startsWith(path2.resolve(profilePicturesDir))) {
        return res.status(404).json({ message: "Profile picture not found" });
      }
      const stats = fs2.statSync(filePath);
      const fileExtension = path2.extname(filename).toLowerCase();
      const mimeTypes = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp"
      };
      const contentType = mimeTypes[fileExtension] || "image/jpeg";
      res.set({
        "Content-Type": contentType,
        "Content-Length": stats.size,
        "Cache-Control": "public, max-age=86400",
        // Cache for 1 day
        "X-Content-Type-Options": "nosniff"
      });
      const fileStream = fs2.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error serving teacher profile picture:", error);
      res.status(500).json({ message: "Failed to serve profile picture" });
    }
  });
  app2.get("/api/teachers/:id/replacement-conflicts", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const originalTeacherId = req.params.id;
      const { replacementTeacherId } = req.query;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      if (!replacementTeacherId) {
        return res.status(400).json({ message: "Replacement teacher ID is required" });
      }
      const originalTeacherEntries = await storage.getTimetableEntriesByTeacher(originalTeacherId);
      const replacementTeacherEntries = await storage.getTimetableEntriesByTeacher(replacementTeacherId);
      const conflicts = [];
      for (const originalEntry of originalTeacherEntries) {
        const conflict = replacementTeacherEntries.find(
          (replacementEntry) => replacementEntry.day === originalEntry.day && replacementEntry.period === originalEntry.period && replacementEntry.isActive
        );
        if (conflict) {
          const originalClass = await storage.getClass(originalEntry.classId);
          const conflictingClass = await storage.getClass(conflict.classId);
          conflicts.push({
            day: originalEntry.day,
            period: originalEntry.period,
            existingClass: conflictingClass ? `${conflictingClass.grade}-${conflictingClass.section}` : "Unknown",
            conflictingClass: originalClass ? `${originalClass.grade}-${originalClass.section}` : "Unknown",
            startTime: originalEntry.startTime,
            endTime: originalEntry.endTime
          });
        }
      }
      res.json({
        hasConflicts: conflicts.length > 0,
        conflictCount: conflicts.length,
        totalEntries: originalTeacherEntries.length,
        conflicts
      });
    } catch (error) {
      console.error("Error checking replacement conflicts:", error);
      res.status(500).json({ message: "Failed to check replacement conflicts" });
    }
  });
  app2.post("/api/teachers/:id/replace", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const originalTeacherId = req.params.id;
      const { replacementTeacherId, reason } = req.body;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      if (!replacementTeacherId || !reason) {
        return res.status(400).json({ message: "Replacement teacher ID and reason are required" });
      }
      const originalTeacher = await storage.getTeacher(originalTeacherId);
      const replacementTeacher = await storage.getTeacher(replacementTeacherId);
      if (!originalTeacher || !replacementTeacher) {
        return res.status(404).json({ message: "One or both teachers not found" });
      }
      if (user.role === "admin" && user.schoolId) {
        if (originalTeacher.schoolId !== user.schoolId || replacementTeacher.schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Access denied - teachers not in your school" });
        }
      }
      const originalTeacherEntries = await storage.getTimetableEntriesByTeacher(originalTeacherId);
      const replacementTeacherEntries = await storage.getTimetableEntriesByTeacher(replacementTeacherId);
      const conflicts = [];
      for (const originalEntry of originalTeacherEntries) {
        const conflict = replacementTeacherEntries.find(
          (replacementEntry) => replacementEntry.day === originalEntry.day && replacementEntry.period === originalEntry.period && replacementEntry.isActive
        );
        if (conflict) {
          const originalClass = await storage.getClass(originalEntry.classId);
          const conflictingClass = await storage.getClass(conflict.classId);
          conflicts.push({
            day: originalEntry.day,
            period: originalEntry.period,
            existingClass: conflictingClass ? `${conflictingClass.grade}-${conflictingClass.section}` : "Unknown",
            conflictingClass: originalClass ? `${originalClass.grade}-${originalClass.section}` : "Unknown"
          });
        }
      }
      if (conflicts.length > 0) {
        return res.status(409).json({
          message: "Teacher replacement conflicts detected",
          conflicts,
          hasConflicts: true
        });
      }
      let replacedEntries = 0;
      for (const entry of originalTeacherEntries) {
        await storage.updateTimetableEntry(entry.id, {
          teacherId: replacementTeacherId
        });
        replacedEntries++;
      }
      const today = /* @__PURE__ */ new Date();
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay() + 1);
      const affectedClasses = Array.from(new Set(originalTeacherEntries.map((entry) => entry.classId)));
      for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
        const weekStart = new Date(currentWeekStart);
        weekStart.setDate(currentWeekStart.getDate() + weekOffset * 7);
        for (const classId of affectedClasses) {
          try {
            let weeklyTimetable = await storage.getWeeklyTimetable(classId, weekStart);
            if (!weeklyTimetable) {
              const globalTimetable = await storage.getTimetableEntriesForClass(classId);
              const weeklyTimetableData = globalTimetable.map((entry) => ({
                day: entry.day,
                period: entry.period,
                teacherId: entry.teacherId,
                subjectId: entry.subjectId,
                startTime: entry.startTime,
                endTime: entry.endTime,
                room: entry.room,
                isModified: false
              }));
              weeklyTimetable = await storage.createOrUpdateWeeklyTimetable(
                classId,
                weekStart,
                weeklyTimetableData,
                user.id,
                originalTeacher.schoolId
              );
            }
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            const originalTeacherPeriods = originalTeacherEntries.filter((entry) => entry.classId === classId);
            for (const period of originalTeacherPeriods) {
              await storage.updateWeeklyTimetableEntry(
                classId,
                weekStart.toISOString().split("T")[0],
                weekEnd.toISOString().split("T")[0],
                period.day,
                period.period,
                {
                  teacherId: replacementTeacherId,
                  subjectId: period.subjectId,
                  isModified: true,
                  modificationReason: `Teacher replacement: ${originalTeacher.name} \u2192 ${replacementTeacher.name}`
                },
                user.id
              );
            }
          } catch (weeklyError) {
            console.error(`Error updating weekly timetable for class ${classId}, week ${weekStart.toISOString().split("T")[0]}:`, weeklyError);
          }
        }
      }
      await storage.updateTeacher(originalTeacherId, {
        status: "left_school",
        isActive: false
      });
      const replacementRecord = await storage.createTeacherReplacement({
        originalTeacherId,
        replacementTeacherId,
        schoolId: originalTeacher.schoolId,
        replacementDate: /* @__PURE__ */ new Date(),
        reason,
        affectedTimetableEntries: replacedEntries,
        conflictDetails: { hasConflicts: false },
        status: "completed",
        replacedBy: user.id,
        completedAt: /* @__PURE__ */ new Date()
      });
      res.json({
        message: "Teacher replacement completed successfully",
        replacement: replacementRecord,
        affectedEntries: replacedEntries,
        originalTeacher: {
          id: originalTeacher.id,
          name: originalTeacher.name,
          status: "left_school"
        },
        replacementTeacher: {
          id: replacementTeacher.id,
          name: replacementTeacher.name
        }
      });
    } catch (error) {
      console.error("Error replacing teacher:", error);
      res.status(500).json({ message: "Failed to replace teacher" });
    }
  });
  app2.get("/api/teacher-replacements", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      let replacements;
      if (user.role === "super_admin") {
        replacements = await storage.getAllTeacherReplacements();
      } else if (user.schoolId) {
        replacements = await storage.getTeacherReplacementsBySchool(user.schoolId);
      } else {
        return res.status(400).json({ message: "School ID is required" });
      }
      res.json(replacements);
    } catch (error) {
      console.error("Error fetching teacher replacements:", error);
      res.status(500).json({ message: "Failed to fetch teacher replacement history" });
    }
  });
  app2.get("/api/teacher-attendance", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { date: date2, teacherId, startDate, endDate } = req.query;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      let attendance;
      if (teacherId) {
        attendance = await storage.getTeacherAttendanceByTeacher(teacherId, startDate, endDate);
      } else if (user.schoolId) {
        attendance = await storage.getTeacherAttendance(user.schoolId, date2);
      } else {
        return res.status(400).json({ message: "School ID is required" });
      }
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching teacher attendance:", error);
      res.status(500).json({ message: "Failed to fetch teacher attendance" });
    }
  });
  app2.post("/api/teacher-attendance", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const schoolId = user.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "User is not associated with a school" });
      }
      const requestBody = { ...req.body };
      if (requestBody.attendanceDate) {
        if (isFutureDate(requestBody.attendanceDate)) {
          return res.status(400).json({ message: "Attendance cannot be recorded for upcoming dates" });
        }
      }
      const teacher = await storage.getTeacher(requestBody.teacherId);
      if (!teacher || teacher.schoolId !== schoolId) {
        return res.status(403).json({ message: "Teacher not found or not in your school" });
      }
      requestBody.markedBy = user.id;
      requestBody.schoolId = schoolId;
      const validatedData = insertTeacherAttendanceSchema.parse(requestBody);
      const attendance = await storage.markTeacherAttendance(validatedData);
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Error marking teacher attendance:", error);
      res.status(500).json({ message: "Failed to mark teacher attendance" });
    }
  });
  app2.post("/api/teacher-attendance/bulk", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const validatedData = bulkAttendanceSchema.parse(req.body);
      if (user.role === "admin") {
        const teacher = await storage.getTeacher(validatedData.teacherId);
        if (!teacher || teacher.schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Teacher not found or not in your school" });
        }
      }
      const attendanceRecords = await storage.markBulkTeacherAttendance(validatedData, user.id);
      res.status(201).json(attendanceRecords);
    } catch (error) {
      console.error("Error marking bulk teacher attendance:", error);
      res.status(500).json({ message: "Failed to mark bulk teacher attendance" });
    }
  });
  app2.put("/api/teacher-attendance/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const attendanceId = req.params.id;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const requestBody = { ...req.body };
      requestBody.markedBy = user.id;
      const validatedData = insertTeacherAttendanceSchema.partial().parse(requestBody);
      const attendance = await storage.updateTeacherAttendance(attendanceId, validatedData);
      res.json(attendance);
    } catch (error) {
      console.error("Error updating teacher attendance:", error);
      res.status(500).json({ message: "Failed to update teacher attendance" });
    }
  });
  app2.delete("/api/teacher-attendance/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const attendanceId = req.params.id;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteTeacherAttendance(attendanceId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting teacher attendance:", error);
      res.status(500).json({ message: "Failed to delete teacher attendance" });
    }
  });
  app2.get("/api/teacher-attendance/check/:teacherId/:date", authenticateToken, async (req, res) => {
    try {
      const { teacherId, date: date2 } = req.params;
      const isAbsent = await storage.isTeacherAbsent(teacherId, date2);
      res.json({ isAbsent });
    } catch (error) {
      console.error("Error checking teacher absence:", error);
      res.status(500).json({ message: "Failed to check teacher absence" });
    }
  });
  app2.get("/api/student-attendance", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { date: date2, studentId, classId, startDate, endDate } = req.query;
      const querySchema = z5.object({
        date: z5.string().optional(),
        studentId: z5.string().uuid().optional(),
        classId: z5.string().uuid().optional(),
        startDate: z5.string().optional(),
        endDate: z5.string().optional()
      });
      let validatedQuery;
      try {
        validatedQuery = querySchema.parse({ date: date2, studentId, classId, startDate, endDate });
      } catch (error) {
        return res.status(400).json({ message: "Invalid query parameters" });
      }
      let attendance;
      if (user.role === "student") {
        const userStudent = await storage.getStudentByUserId(user.id);
        if (!userStudent) {
          return res.status(403).json({ message: "Student profile not found" });
        }
        if (validatedQuery.studentId && validatedQuery.studentId !== userStudent.id) {
          return res.status(403).json({ message: "Access denied: Can only view your own attendance" });
        }
        attendance = await storage.getStudentAttendanceByStudent(userStudent.id, validatedQuery.startDate, validatedQuery.endDate);
      } else if (user.role === "teacher") {
        if (validatedQuery.studentId) {
          const student = await storage.getStudent(validatedQuery.studentId);
          if (!student || student.schoolId !== user.schoolId) {
            return res.status(403).json({ message: "Access denied: Student not in your school" });
          }
          const teacherAssignment = await storage.getClassTeacherAssignment(student.classId, user.id);
          if (!teacherAssignment) {
            return res.status(403).json({ message: "Access denied: You are not assigned to this student's class" });
          }
          attendance = await storage.getStudentAttendanceByStudent(validatedQuery.studentId, validatedQuery.startDate, validatedQuery.endDate);
        } else if (validatedQuery.classId && validatedQuery.date) {
          const classInfo = await storage.getClass(validatedQuery.classId);
          if (!classInfo || classInfo.schoolId !== user.schoolId) {
            return res.status(403).json({ message: "Access denied: Class not in your school" });
          }
          const teacherAssignment = await storage.getClassTeacherAssignment(validatedQuery.classId, user.id);
          if (!teacherAssignment) {
            return res.status(403).json({ message: "Access denied: You are not assigned to this class" });
          }
          attendance = await storage.getStudentAttendanceByClass(validatedQuery.classId, validatedQuery.date);
        } else {
          return res.status(400).json({ message: "Teachers must specify either studentId or classId with date" });
        }
      } else if (user.role === "admin" || user.role === "super_admin") {
        if (validatedQuery.studentId) {
          if (user.role === "admin") {
            const student = await storage.getStudent(validatedQuery.studentId);
            if (!student || student.schoolId !== user.schoolId) {
              return res.status(403).json({ message: "Access denied: Student not in your school" });
            }
          }
          attendance = await storage.getStudentAttendanceByStudent(validatedQuery.studentId, validatedQuery.startDate, validatedQuery.endDate);
        } else if (validatedQuery.classId && validatedQuery.date) {
          if (user.role === "admin") {
            const classInfo = await storage.getClass(validatedQuery.classId);
            if (!classInfo || classInfo.schoolId !== user.schoolId) {
              return res.status(403).json({ message: "Access denied: Class not in your school" });
            }
          }
          attendance = await storage.getStudentAttendanceByClass(validatedQuery.classId, validatedQuery.date);
        } else if (user.schoolId) {
          attendance = await storage.getStudentAttendance(user.schoolId, validatedQuery.date);
        } else {
          return res.status(400).json({ message: "Missing required parameters" });
        }
      } else if (user.role === "parent") {
        return res.status(403).json({ message: "Access denied: Parent access not implemented yet" });
      } else {
        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      res.status(500).json({ message: "Failed to fetch student attendance" });
    }
  });
  app2.post("/api/student-attendance", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "teacher") {
        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }
      const requestBody = { ...req.body };
      if (requestBody.attendanceDate) {
        if (isFutureDate(requestBody.attendanceDate)) {
          return res.status(400).json({ message: "Attendance cannot be recorded for upcoming dates" });
        }
      }
      if (user.role === "admin" || user.role === "teacher") {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        requestBody.schoolId = user.schoolId;
      } else if (user.role === "super_admin") {
        if (!requestBody.studentId) {
          return res.status(400).json({ message: "Student ID is required" });
        }
        const student = await storage.getStudent(requestBody.studentId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }
        requestBody.schoolId = student.schoolId;
      }
      requestBody.markedBy = user.id;
      const validatedData = insertStudentAttendanceSchema.parse(requestBody);
      if (user.role === "admin" || user.role === "teacher") {
        const student = await storage.getStudent(validatedData.studentId);
        if (!student || student.schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Access denied: Student not in your school" });
        }
        if (validatedData.classId) {
          const classInfo = await storage.getClass(validatedData.classId);
          if (!classInfo || classInfo.schoolId !== user.schoolId) {
            return res.status(403).json({ message: "Access denied: Class not in your school" });
          }
        }
      } else if (user.role === "super_admin") {
        if (validatedData.classId) {
          const classInfo = await storage.getClass(validatedData.classId);
          if (!classInfo) {
            return res.status(404).json({ message: "Class not found" });
          }
          if (validatedData.schoolId !== classInfo.schoolId) {
            return res.status(400).json({ message: "Student and class must belong to the same school" });
          }
        }
      }
      const attendance = await storage.markStudentAttendance(validatedData);
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Error marking student attendance:", error);
      res.status(500).json({ message: "Failed to mark student attendance" });
    }
  });
  app2.put("/api/student-attendance/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const attendanceId = req.params.id;
      if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "teacher") {
        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }
      const validatedData = insertStudentAttendanceSchema.partial().parse(req.body);
      const existingRecord = await storage.getStudentAttendanceById(attendanceId);
      if (!existingRecord) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      if (user.role === "admin" || user.role === "teacher") {
        if (existingRecord.schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Access denied: Record not in your school" });
        }
      }
      validatedData.markedBy = user.id;
      const attendance = await storage.updateStudentAttendance(attendanceId, validatedData);
      res.json(attendance);
    } catch (error) {
      console.error("Error updating student attendance:", error);
      res.status(500).json({ message: "Failed to update student attendance" });
    }
  });
  app2.delete("/api/student-attendance/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const attendanceId = req.params.id;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }
      const existingRecord = await storage.getStudentAttendanceById(attendanceId);
      if (!existingRecord) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      if (user.role === "admin") {
        if (existingRecord.schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Access denied: Record not in your school" });
        }
      }
      await storage.deleteStudentAttendance(attendanceId);
      res.json({ message: "Student attendance deleted successfully" });
    } catch (error) {
      console.error("Error deleting student attendance:", error);
      res.status(500).json({ message: "Failed to delete student attendance" });
    }
  });
  app2.get("/api/student-attendance/check/:studentId/:date", authenticateToken, async (req, res) => {
    try {
      const { studentId, date: date2 } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "teacher") {
        if (user.role === "student" && user.id !== studentId) {
          return res.status(403).json({ message: "Access denied: Can only check your own attendance" });
        } else if (user.role === "parent") {
          return res.status(403).json({ message: "Access denied: Parent access not implemented yet" });
        }
      }
      const isAbsent = await storage.isStudentAbsent(studentId, date2);
      res.json({ isAbsent });
    } catch (error) {
      console.error("Error checking student absence:", error);
      res.status(500).json({ message: "Failed to check student absence" });
    }
  });
  app2.post("/api/teacher-attendance/mark-all-present", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { date: date2 } = req.body;
      if (!date2) {
        return res.status(400).json({ message: "Date is required" });
      }
      if (isFutureDate(date2)) {
        return res.status(400).json({ message: "Attendance cannot be marked for future dates" });
      }
      const schoolId = user.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "User is not associated with a school" });
      }
      const teachers2 = await storage.getTeachers(schoolId);
      let createdCount = 0;
      let skippedExistingCount = 0;
      const attendanceRecords = [];
      for (const teacher of teachers2) {
        try {
          const existingAttendance = await storage.getTeacherAttendanceByTeacher(teacher.id, date2, date2);
          if (existingAttendance && existingAttendance.length > 0) {
            skippedExistingCount++;
            continue;
          }
          const attendanceData = {
            teacherId: teacher.id,
            schoolId,
            attendanceDate: date2,
            status: "present",
            markedBy: user.id
          };
          const attendance = await storage.markTeacherAttendance(attendanceData);
          attendanceRecords.push(attendance);
          createdCount++;
        } catch (error) {
          console.log(`Error marking teacher ${teacher.id} present:`, error);
          skippedExistingCount++;
        }
      }
      res.status(201).json({
        message: `Successfully marked ${createdCount} teachers as present`,
        createdCount,
        skippedExistingCount,
        totalTeachers: teachers2.length,
        records: attendanceRecords
      });
    } catch (error) {
      console.error("Error marking all teachers present:", error);
      res.status(500).json({ message: "Failed to mark all teachers present" });
    }
  });
  app2.post("/api/student-attendance/mark-all-present", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { date: date2, classId } = req.body;
      if (!date2 || !classId) {
        return res.status(400).json({ message: "Date and classId are required" });
      }
      if (isFutureDate(date2)) {
        return res.status(400).json({ message: "Attendance cannot be marked for future dates" });
      }
      const schoolId = user.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "User is not associated with a school" });
      }
      const classInfo = await storage.getClass(classId);
      if (!classInfo || classInfo.schoolId !== schoolId) {
        return res.status(403).json({ message: "Class not found or not in your school" });
      }
      const students2 = await storage.getStudents(schoolId, classId);
      let createdCount = 0;
      let skippedExistingCount = 0;
      const attendanceRecords = [];
      for (const student of students2) {
        try {
          const existingAttendance = await storage.getStudentAttendanceByStudent(student.id, date2, date2);
          if (existingAttendance && existingAttendance.length > 0) {
            skippedExistingCount++;
            continue;
          }
          const attendanceData = {
            studentId: student.id,
            classId,
            schoolId,
            attendanceDate: date2,
            status: "present",
            markedBy: user.id
          };
          const attendance = await storage.markStudentAttendance(attendanceData);
          attendanceRecords.push(attendance);
          createdCount++;
        } catch (error) {
          console.log(`Error marking student ${student.id} present:`, error);
          skippedExistingCount++;
        }
      }
      res.status(201).json({
        message: `Successfully marked ${createdCount} students as present`,
        createdCount,
        skippedExistingCount,
        totalStudents: students2.length,
        records: attendanceRecords
      });
    } catch (error) {
      console.error("Error marking all students present:", error);
      res.status(500).json({ message: "Failed to mark all students present" });
    }
  });
  app2.get("/api/students", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const schoolId = req.query.schoolId;
      const classId = req.query.classId;
      const offset = parseInt(req.query.offset) || 0;
      const limit = parseInt(req.query.limit) || void 0;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      let targetSchoolId;
      if (user.role === "admin") {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        targetSchoolId = user.schoolId;
      } else if (user.role === "super_admin") {
        targetSchoolId = schoolId;
      }
      const students2 = await storage.getStudents(targetSchoolId, classId, offset, limit);
      res.json(students2);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });
  app2.get("/api/students/template", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const classes2 = await storage.getClasses(user.role === "super_admin" ? void 0 : user.schoolId);
      const workbook = XLSX3.utils.book_new();
      const sampleData = [
        // Headers
        ["First Name*", "Last Name*", "Admission Number*", "Class*", "Roll Number", "Email", "Contact Number", "Date of Birth (YYYY-MM-DD)", "Gender", "Blood Group", "Address", "Emergency Contact"],
        // Sample row
        ["John", "Doe", "ADM001", "1 A", "1", "john.doe@example.com", "9876543210", "2010-05-15", "male", "A+", "123 Main Street, City", "9876543210"]
      ];
      if (classes2.length > 0) {
        sampleData.push([]);
        sampleData.push(["Available Classes:"]);
        classes2.forEach((cls) => {
          sampleData.push([`${cls.grade} ${cls.section}`]);
        });
      }
      const worksheet = XLSX3.utils.aoa_to_sheet(sampleData);
      const columnWidths = [
        { wch: 15 },
        // First Name
        { wch: 15 },
        // Last Name
        { wch: 15 },
        // Admission Number
        { wch: 10 },
        // Class
        { wch: 10 },
        // Roll Number
        { wch: 25 },
        // Email
        { wch: 15 },
        // Contact Number
        { wch: 15 },
        // Date of Birth
        { wch: 10 },
        // Gender
        { wch: 10 },
        // Blood Group
        { wch: 30 },
        // Address
        { wch: 15 }
        // Emergency Contact
      ];
      worksheet["!cols"] = columnWidths;
      XLSX3.utils.book_append_sheet(workbook, worksheet, "Students");
      const buffer = XLSX3.write(workbook, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="student_import_template.xlsx"');
      res.send(buffer);
    } catch (error) {
      console.error("Error generating template:", error);
      res.status(500).json({ message: "Failed to generate template" });
    }
  });
  app2.get("/api/students/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const requestedStudentId = req.params.id;
      const isAuthorized = user.role === "admin" || user.role === "super_admin" || user.role === "student" && user.studentId === requestedStudentId;
      if (!isAuthorized) {
        return res.status(403).json({ message: "Access denied" });
      }
      const student = await storage.getStudent(requestedStudentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      if (user.role === "admin" && student.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied. You can only access students from your school." });
      }
      if (user.role === "student" && user.studentId !== requestedStudentId) {
        return res.status(403).json({ message: "Access denied. You can only access your own profile." });
      }
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });
  app2.patch("/api/students/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Only administrators can update student information." });
      }
      const studentId = req.params.id;
      const existingStudent = await storage.getStudent(studentId);
      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found" });
      }
      if (user.role === "admin") {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        if (existingStudent.schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Access denied. You can only update students from your school." });
        }
      }
      if (user.role === "super_admin" && existingStudent.schoolId) {
        const school = await storage.getSchool(existingStudent.schoolId);
        if (!school) {
          return res.status(400).json({ message: "Invalid school association" });
        }
      }
      const updateSchema = insertStudentSchema.omit({ schoolId: true }).partial();
      const validation = updateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid student data",
          errors: validation.error.errors
        });
      }
      const updateData = validation.data;
      if (updateData.classId && updateData.classId !== existingStudent.classId) {
        const classData = await storage.getClass(updateData.classId);
        if (!classData) {
          return res.status(400).json({ message: "Invalid class ID" });
        }
        if (classData.schoolId !== existingStudent.schoolId) {
          return res.status(400).json({ message: "Class must belong to the same school as the student" });
        }
      }
      const isAdmissionNumberChanging = updateData.admissionNumber && updateData.admissionNumber !== existingStudent.admissionNumber;
      if (isAdmissionNumberChanging) {
        const duplicateCheck = await storage.getStudentByAdmissionNumber(updateData.admissionNumber);
        if (duplicateCheck && duplicateCheck.id !== studentId) {
          return res.status(400).json({ message: "Admission number already exists" });
        }
      }
      const finalUpdateData = {
        ...updateData,
        schoolId: existingStudent.schoolId
      };
      const updatedStudent = await storage.updateStudent(studentId, finalUpdateData);
      if (isAdmissionNumberChanging) {
        console.log(`ADMIN ACTION: Student ${studentId} admission number changed from ${existingStudent.admissionNumber} to ${updateData.admissionNumber} by user ${user.id}`);
      }
      res.json(updatedStudent);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
  });
  app2.post("/api/students", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const requestBody = { ...req.body };
      if (user.role === "admin") {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        requestBody.schoolId = user.schoolId;
      } else if (user.role === "super_admin") {
        if (!requestBody.schoolId) {
          return res.status(400).json({ message: "School ID is required" });
        }
      }
      if (requestBody.classId) {
        const classData = await storage.getClass(requestBody.classId);
        if (!classData) {
          return res.status(400).json({ message: "Invalid class ID" });
        }
        if (classData.schoolId !== requestBody.schoolId) {
          return res.status(400).json({ message: "Class must belong to the same school as the student" });
        }
      }
      const validatedData = insertStudentSchema.parse(requestBody);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input data", errors: error.issues });
      }
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Failed to create student" });
    }
  });
  app2.put("/api/students/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const existingStudent = await storage.getStudent(req.params.id);
      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found" });
      }
      if (user.role === "admin" && existingStudent.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const requestBody = { ...req.body };
      delete requestBody.id;
      delete requestBody.schoolId;
      if (requestBody.classId) {
        const classData = await storage.getClass(requestBody.classId);
        if (!classData) {
          return res.status(400).json({ message: "Invalid class ID" });
        }
        if (classData.schoolId !== existingStudent.schoolId) {
          return res.status(400).json({ message: "Class must belong to the same school as the student" });
        }
      }
      const student = await storage.updateStudent(req.params.id, requestBody);
      res.json(student);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input data", errors: error.issues });
      }
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
  });
  app2.delete("/api/students/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const existingStudent = await storage.getStudent(req.params.id);
      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found" });
      }
      if (user.role === "admin" && existingStudent.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });
  app2.get("/api/parents", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const schoolId = req.query.schoolId;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      let targetSchoolId;
      if (user.role === "admin") {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        targetSchoolId = user.schoolId;
      } else if (user.role === "super_admin") {
        targetSchoolId = schoolId;
      }
      const parents2 = await storage.getParents(targetSchoolId);
      res.json(parents2);
    } catch (error) {
      console.error("Error fetching parents:", error);
      res.status(500).json({ message: "Failed to fetch parents" });
    }
  });
  app2.get("/api/parents/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const parent = await storage.getParent(req.params.id);
      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }
      if (user.role === "admin" && parent.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(parent);
    } catch (error) {
      console.error("Error fetching parent:", error);
      res.status(500).json({ message: "Failed to fetch parent" });
    }
  });
  app2.post("/api/parents", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const requestBody = { ...req.body };
      const studentId = requestBody.studentId;
      delete requestBody.studentId;
      if (user.role === "admin") {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        requestBody.schoolId = user.schoolId;
      } else if (user.role === "super_admin") {
        if (!requestBody.schoolId) {
          return res.status(400).json({ message: "School ID is required" });
        }
      }
      const validatedData = insertParentSchema.parse(requestBody);
      const parent = await storage.createParent(validatedData);
      if (studentId) {
        await storage.linkParentToStudent(parent.id, studentId);
      }
      res.status(201).json(parent);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input data", errors: error.issues });
      }
      console.error("Error creating parent:", error);
      res.status(500).json({ message: "Failed to create parent" });
    }
  });
  app2.put("/api/parents/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const existingParent = await storage.getParent(req.params.id);
      if (!existingParent) {
        return res.status(404).json({ message: "Parent not found" });
      }
      if (user.role === "admin" && existingParent.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const requestBody = { ...req.body };
      delete requestBody.id;
      delete requestBody.schoolId;
      const parent = await storage.updateParent(req.params.id, requestBody);
      res.json(parent);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input data", errors: error.issues });
      }
      console.error("Error updating parent:", error);
      res.status(500).json({ message: "Failed to update parent" });
    }
  });
  app2.delete("/api/parents/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const existingParent = await storage.getParent(req.params.id);
      if (!existingParent) {
        return res.status(404).json({ message: "Parent not found" });
      }
      if (user.role === "admin" && existingParent.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteParent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting parent:", error);
      res.status(500).json({ message: "Failed to delete parent" });
    }
  });
  app2.post("/api/students/bulk-import", authenticateToken, upload.single("file"), async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const allowedMimeTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        // .xlsx
        "application/vnd.ms-excel"
        // .xls
      ];
      if (!allowedMimeTypes.includes(req.file.mimetype) && !req.file.originalname.match(/\.(xlsx|xls)$/i)) {
        return res.status(400).json({ message: "Please upload a valid Excel file (.xlsx or .xls)" });
      }
      const workbook = XLSX3.read(req.file.buffer, { type: "buffer" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX3.utils.sheet_to_json(worksheet, { header: 1 });
      if (data.length < 2) {
        return res.status(400).json({ message: "File must contain at least a header row and one data row" });
      }
      const MAX_ROWS = 1e3;
      if (data.length > MAX_ROWS + 1) {
        return res.status(400).json({
          message: `File contains too many rows. Maximum allowed: ${MAX_ROWS} students per import`
        });
      }
      const headers = data[0];
      const requiredHeaders = ["First Name*", "Last Name*", "Admission Number*", "Class*"];
      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.some((h) => h?.toLowerCase().includes(header.toLowerCase().replace("*", "")))
      );
      if (missingHeaders.length > 0) {
        return res.status(400).json({
          message: `Missing required columns: ${missingHeaders.join(", ")}`
        });
      }
      const targetSchoolId = user.role === "super_admin" ? req.body.schoolId || user.schoolId : user.schoolId;
      const classes2 = await storage.getClasses(targetSchoolId);
      const classMap = /* @__PURE__ */ new Map();
      classes2.forEach((cls) => {
        classMap.set(`${cls.grade} ${cls.section}`.toLowerCase(), cls.id);
        classMap.set(`${cls.grade}${cls.section}`.toLowerCase(), cls.id);
      });
      const results = {
        success: 0,
        errors: [],
        students: []
      };
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const rowErrors = [];
        try {
          const studentData = {
            firstName: row[0]?.toString().trim(),
            lastName: row[1]?.toString().trim(),
            admissionNumber: row[2]?.toString().trim(),
            classId: "",
            rollNumber: row[4]?.toString().trim() || "",
            email: row[5]?.toString().trim() || "",
            contactNumber: row[6]?.toString().trim() || "",
            dateOfBirth: row[7]?.toString().trim() || "",
            gender: row[8]?.toString().trim().toLowerCase() || "",
            bloodGroup: row[9]?.toString().trim() || "",
            address: row[10]?.toString().trim() || "",
            emergencyContact: row[11]?.toString().trim() || "",
            schoolId: targetSchoolId
          };
          if (!studentData.firstName) rowErrors.push("First Name is required");
          if (!studentData.lastName) rowErrors.push("Last Name is required");
          if (!studentData.admissionNumber) rowErrors.push("Admission Number is required");
          const className = row[3]?.toString().trim().toLowerCase();
          if (!className) {
            rowErrors.push("Class is required");
          } else {
            const classId = classMap.get(className);
            if (!classId) {
              rowErrors.push(`Class "${row[3]}" not found. Available classes: ${Array.from(classMap.keys()).join(", ")}`);
            } else {
              studentData.classId = classId;
            }
          }
          if (studentData.gender && !["male", "female", "other"].includes(studentData.gender)) {
            rowErrors.push("Gender must be 'male', 'female', or 'other'");
          }
          if (studentData.dateOfBirth) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(studentData.dateOfBirth)) {
              rowErrors.push("Date of Birth must be in YYYY-MM-DD format");
            }
          }
          if (rowErrors.length > 0) {
            results.errors.push({ row: i + 1, errors: rowErrors });
            continue;
          }
          const validatedData = insertStudentSchema.parse(studentData);
          const existingStudent = await storage.getStudentByAdmissionNumber(validatedData.admissionNumber, targetSchoolId);
          if (existingStudent) {
            results.errors.push({
              row: i + 1,
              errors: [`Admission number "${validatedData.admissionNumber}" already exists`]
            });
            continue;
          }
          const newStudent = await storage.createStudent(validatedData);
          results.students.push(newStudent);
          results.success++;
        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error);
          if (error?.name === "ZodError") {
            const zodErrors = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
            results.errors.push({ row: i + 1, errors: zodErrors });
          } else {
            results.errors.push({ row: i + 1, errors: [error?.message || "Unknown error"] });
          }
        }
      }
      res.json({
        message: `Import completed. ${results.success} students imported successfully.`,
        studentsCreated: results.success,
        errors: results.errors,
        students: results.students
      });
    } catch (error) {
      console.error("Error during bulk import:", error);
      res.status(500).json({ message: "Failed to process bulk import" });
    }
  });
  app2.post("/api/students/:studentId/parents/:parentId", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { studentId, parentId } = req.params;
      const student = await storage.getStudent(studentId);
      const parent = await storage.getParent(parentId);
      if (!student || !parent) {
        return res.status(404).json({ message: "Student or parent not found" });
      }
      if (student.schoolId !== parent.schoolId) {
        return res.status(400).json({ message: "Student and parent must belong to the same school" });
      }
      if (user.role === "admin") {
        if (student.schoolId !== user.schoolId || parent.schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Access denied - can only link students and parents from your school" });
        }
      }
      if (user.role === "super_admin") {
        const school = await storage.getSchool(student.schoolId);
        if (!school) {
          return res.status(400).json({ message: "Invalid school for student and parent" });
        }
      }
      const relationship = await storage.linkStudentToParent(studentId, parentId);
      res.status(201).json(relationship);
    } catch (error) {
      console.error("Error linking student to parent:", error);
      res.status(500).json({ message: "Failed to link student to parent" });
    }
  });
  app2.delete("/api/students/:studentId/parents/:parentId", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { studentId, parentId } = req.params;
      const student = await storage.getStudent(studentId);
      const parent = await storage.getParent(parentId);
      if (!student || !parent) {
        return res.status(404).json({ message: "Student or parent not found" });
      }
      if (student.schoolId !== parent.schoolId) {
        return res.status(400).json({ message: "Student and parent must belong to the same school" });
      }
      if (user.role === "admin") {
        if (student.schoolId !== user.schoolId || parent.schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Access denied - can only unlink students and parents from your school" });
        }
      }
      await storage.unlinkStudentFromParent(studentId, parentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error unlinking student from parent:", error);
      res.status(500).json({ message: "Failed to unlink student from parent" });
    }
  });
  app2.get("/api/parents/:parentId/children", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const parent = await storage.getParent(req.params.parentId);
      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }
      if (user.role === "admin" && parent.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const children = await storage.getParentChildren(req.params.parentId);
      res.json(children);
    } catch (error) {
      console.error("Error fetching parent children:", error);
      res.status(500).json({ message: "Failed to fetch parent children" });
    }
  });
  app2.get("/api/students/:studentId/parents", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const student = await storage.getStudent(req.params.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      if (user.role === "admin" && student.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const studentParents2 = await storage.getStudentParentsWithDetails(req.params.studentId);
      res.json(studentParents2);
    } catch (error) {
      console.error("Error fetching student parents:", error);
      res.status(500).json({ message: "Failed to fetch student parents" });
    }
  });
  app2.get("/api/students/:studentId/credentials", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const student = await storage.getStudent(req.params.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      if (user.role === "admin" && student.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const credentials = await storage.getStudentCredentials(req.params.studentId);
      res.json(credentials);
    } catch (error) {
      console.error("Error fetching student credentials:", error);
      res.status(500).json({ message: "Failed to fetch student credentials" });
    }
  });
  app2.post("/api/students/:studentId/credentials/refresh", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const student = await storage.getStudent(req.params.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      if (user.role === "admin" && student.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const credentials = await storage.refreshStudentCredentials(req.params.studentId);
      res.json(credentials);
    } catch (error) {
      console.error("Error refreshing student credentials:", error);
      res.status(500).json({ message: "Failed to refresh student credentials" });
    }
  });
  app2.get("/api/subjects", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const schoolId = req.query.schoolId;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      let targetSchoolId;
      if (user.role === "admin") {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        targetSchoolId = user.schoolId;
      } else if (user.role === "super_admin") {
        targetSchoolId = schoolId;
      }
      const subjects2 = await storage.getSubjects(targetSchoolId);
      res.json(subjects2);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });
  app2.post("/api/subjects", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const requestBody = { ...req.body };
      if (user.role === "admin") {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        requestBody.schoolId = user.schoolId;
      } else if (user.role === "super_admin") {
        if (!requestBody.schoolId) {
          return res.status(400).json({ message: "School ID is required for super admin" });
        }
      }
      let baseCode = requestBody.code || requestBody.name.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 8);
      let finalCode = baseCode;
      let counter = 1;
      while (await storage.checkSubjectCodeExists(finalCode, requestBody.schoolId)) {
        finalCode = baseCode + counter;
        if (finalCode.length > 10) {
          baseCode = baseCode.substring(0, 6);
          finalCode = baseCode + counter;
        }
        counter++;
      }
      requestBody.code = finalCode;
      requestBody.color = generateColorForSubjectCode(finalCode);
      const validatedData = insertSubjectSchema.parse(requestBody);
      const subject = await storage.createSubject(validatedData);
      res.status(201).json(subject);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(400).json({ message: "Invalid subject data" });
    }
  });
  app2.put("/api/subjects/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const subjectId = req.params.id;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const existingSubject = await storage.getSubject(subjectId);
      if (!existingSubject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      if (user.role === "admin" && user.schoolId && existingSubject.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - subject not in your school" });
      }
      const requestBody = { ...req.body };
      if (requestBody.code || requestBody.name) {
        let baseCode = requestBody.code || requestBody.name.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 8);
        let finalCode = baseCode;
        let counter = 1;
        while (await storage.checkSubjectCodeExists(finalCode, existingSubject.schoolId, subjectId)) {
          finalCode = baseCode + counter;
          if (finalCode.length > 10) {
            baseCode = baseCode.substring(0, 6);
            finalCode = baseCode + counter;
          }
          counter++;
        }
        requestBody.code = finalCode;
      }
      const validatedData = insertSubjectSchema.partial().parse(requestBody);
      if (user.role === "admin") {
        delete validatedData.schoolId;
      }
      const updatedSubject = await storage.updateSubject(subjectId, validatedData);
      res.json(updatedSubject);
    } catch (error) {
      console.error("Error updating subject:", error);
      res.status(400).json({ message: "Failed to update subject" });
    }
  });
  app2.delete("/api/subjects/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const subjectId = req.params.id;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const existingSubject = await storage.getSubject(subjectId);
      if (!existingSubject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      if (user.role === "admin" && user.schoolId && existingSubject.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - subject not in your school" });
      }
      await storage.deleteSubject(subjectId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting subject:", error);
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });
  app2.get("/api/classes/:classId/other-sections", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const classId = req.params.classId;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const currentClass = await storage.getClass(classId);
      if (!currentClass) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && currentClass.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      const otherSections = await storage.getOtherSectionsOfGrade(currentClass.grade, currentClass.schoolId, classId);
      res.json(otherSections);
    } catch (error) {
      console.error("Error fetching other sections:", error);
      res.status(500).json({ message: "Failed to fetch other sections" });
    }
  });
  app2.post("/api/classes/:classId/copy-subjects", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const classId = req.params.classId;
      const { targetClassIds } = req.body;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      if (!targetClassIds || !Array.isArray(targetClassIds) || targetClassIds.length === 0) {
        return res.status(400).json({ message: "Target class IDs are required" });
      }
      const sourceClass = await storage.getClass(classId);
      if (!sourceClass) {
        return res.status(404).json({ message: "Source class not found" });
      }
      if (user.role === "admin" && user.schoolId && sourceClass.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      const result = await storage.copySubjectsBetweenClasses(classId, targetClassIds, sourceClass.schoolId);
      res.json({
        success: true,
        message: `Successfully copied subjects to ${result.copiedCount} sections`,
        copiedCount: result.copiedCount,
        skippedCount: result.skippedCount
      });
    } catch (error) {
      console.error("Error copying subjects:", error);
      res.status(500).json({ message: "Failed to copy subjects" });
    }
  });
  app2.post("/api/classes/:classId/create-assign-subject", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const classId = req.params.classId;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      const requestBody = { ...req.body, classId };
      let schoolId;
      if (user.role === "admin") {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        schoolId = user.schoolId;
      } else if (user.role === "super_admin") {
        schoolId = classData.schoolId;
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
      const validatedData = createAndAssignSubjectSchema.parse(requestBody);
      let baseCode = validatedData.name.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 8);
      let finalCode = baseCode;
      let counter = 1;
      while (await storage.checkSubjectCodeExists(finalCode, schoolId)) {
        finalCode = baseCode + counter;
        if (finalCode.length > 10) {
          baseCode = baseCode.substring(0, 6);
          finalCode = baseCode + counter;
        }
        counter++;
      }
      const subjectData = {
        name: validatedData.name,
        code: finalCode,
        color: generateColorForSubjectCode(finalCode),
        // Generate unique color based on code
        periodsPerWeek: validatedData.weeklyFrequency,
        // Use weekly frequency as default periods per week
        schoolId
      };
      const subject = await storage.createSubject(subjectData);
      const assignmentData = {
        classId: validatedData.classId,
        subjectId: subject.id,
        weeklyFrequency: validatedData.weeklyFrequency
      };
      const assignment = await storage.createClassSubjectAssignment(assignmentData);
      res.status(201).json({
        success: true,
        subject,
        assignment,
        message: `Subject "${subject.name}" created and assigned to class successfully`
      });
    } catch (error) {
      console.error("Error creating and assigning subject:", error);
      if (error instanceof Error && error.message.includes("validation")) {
        res.status(400).json({ message: "Invalid data provided" });
      } else {
        res.status(500).json({ message: "Failed to create and assign subject" });
      }
    }
  });
  app2.get("/api/classes", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      let schoolId;
      if (user.role === "admin" && user.schoolId) {
        schoolId = user.schoolId;
      }
      const classes2 = await storage.getClasses(schoolId);
      res.json(classes2);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });
  app2.get("/api/classes/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const classId = req.params.id;
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      res.json(classData);
    } catch (error) {
      console.error("Error fetching class:", error);
      res.status(500).json({ message: "Failed to fetch class" });
    }
  });
  app2.post("/api/classes", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      console.log("User creating class:", {
        role: user.role,
        schoolId: user.schoolId,
        userId: user.id
      });
      console.log("Request body:", req.body);
      const requestBody = { ...req.body };
      if (user.role === "admin") {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        requestBody.schoolId = user.schoolId;
      } else if (user.role === "super_admin") {
        if (!requestBody.schoolId) {
          return res.status(400).json({ message: "School ID is required for super admin" });
        }
      }
      console.log("Final request body before validation:", requestBody);
      const validatedData = insertClassSchema.parse(requestBody);
      const classData = await storage.createClass(validatedData);
      res.status(201).json(classData);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(400).json({ message: "Invalid class data" });
    }
  });
  app2.put("/api/classes/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const classId = req.params.id;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const existingClass = await storage.getClass(classId);
      if (!existingClass) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && existingClass.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      const validatedData = updateClassSchema.parse(req.body);
      if (user.role === "admin") {
        delete validatedData.schoolId;
      }
      const schoolId = existingClass.schoolId;
      const isDuplicate = await storage.checkClassExists(
        validatedData.grade || existingClass.grade,
        validatedData.section !== void 0 ? validatedData.section : existingClass.section,
        schoolId,
        classId
      );
      if (isDuplicate) {
        const sectionText = validatedData.section !== void 0 ? validatedData.section : existingClass.section;
        const displayName = sectionText ? `Class ${validatedData.grade || existingClass.grade}${sectionText}` : `Class ${validatedData.grade || existingClass.grade}`;
        return res.status(400).json({ message: `${displayName} already exists in this school` });
      }
      const updatedClass = await storage.updateClass(classId, validatedData);
      res.json(updatedClass);
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(400).json({ message: "Invalid class data" });
    }
  });
  app2.delete("/api/classes/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const classId = req.params.id;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const existingClass = await storage.getClass(classId);
      if (!existingClass) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && existingClass.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      await storage.deleteClass(classId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ message: "Failed to delete class" });
    }
  });
  app2.get("/api/classes/:classId/teachers", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const classId = req.params.classId;
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      const classTeachers = await storage.getClassTeacherAssignments(classId);
      res.json(classTeachers);
    } catch (error) {
      console.error("Error fetching class teachers:", error);
      res.status(500).json({ message: "Failed to fetch class teachers" });
    }
  });
  app2.post("/api/classes/:classId/teachers", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const classId = req.params.classId;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      const assignmentData = {
        ...req.body,
        classId,
        assignedBy: user.id,
        schoolId: classData.schoolId
      };
      const validatedData = insertClassTeacherAssignmentSchema.parse(assignmentData);
      const existingAssignment = await storage.getClassTeacherAssignment(classId, validatedData.teacherId);
      if (existingAssignment) {
        return res.status(400).json({ message: "Teacher is already assigned to this class" });
      }
      if (validatedData.role === "primary" || validatedData.isPrimary) {
        const existingPrimary = await storage.getPrimaryClassTeacher(classId);
        if (existingPrimary) {
          return res.status(400).json({ message: "This class already has a primary class teacher. Please remove the existing primary teacher first or assign as co-class teacher." });
        }
      }
      const assignment = await storage.createClassTeacherAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error assigning class teacher:", error);
      res.status(400).json({ message: "Invalid assignment data" });
    }
  });
  app2.put("/api/class-teachers/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const assignmentId = req.params.id;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const existingAssignment = await storage.getClassTeacherAssignmentById(assignmentId);
      if (!existingAssignment) {
        return res.status(404).json({ message: "Class teacher assignment not found" });
      }
      if (user.role === "admin" && user.schoolId && existingAssignment.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - assignment not in your school" });
      }
      if ((req.body.role === "primary" || req.body.isPrimary) && !existingAssignment.isPrimary) {
        const existingPrimary = await storage.getPrimaryClassTeacher(existingAssignment.classId);
        if (existingPrimary && existingPrimary.id !== assignmentId) {
          return res.status(400).json({ message: "This class already has a primary class teacher. Please remove the existing primary teacher first." });
        }
      }
      const updatedAssignment = await storage.updateClassTeacherAssignment(assignmentId, req.body);
      res.json(updatedAssignment);
    } catch (error) {
      console.error("Error updating class teacher assignment:", error);
      res.status(400).json({ message: "Invalid update data" });
    }
  });
  app2.delete("/api/class-teachers/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const assignmentId = req.params.id;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const existingAssignment = await storage.getClassTeacherAssignmentById(assignmentId);
      if (!existingAssignment) {
        return res.status(404).json({ message: "Class teacher assignment not found" });
      }
      if (user.role === "admin" && user.schoolId && existingAssignment.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - assignment not in your school" });
      }
      const classTeachers = await storage.getClassTeacherAssignments(existingAssignment.classId);
      if (classTeachers.length <= 1) {
        return res.status(400).json({ message: "Cannot remove the last class teacher. Each class must have at least one class teacher." });
      }
      await storage.deleteClassTeacherAssignment(assignmentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing class teacher:", error);
      res.status(500).json({ message: "Failed to remove class teacher" });
    }
  });
  app2.get("/api/classes/:classId/students", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const classId = req.params.classId;
      if (user.role !== "student") {
        return res.status(403).json({ message: "Access denied" });
      }
      const student = await storage.getStudent(user.studentId);
      if (!student || student.classId !== classId) {
        return res.status(403).json({ message: "Access denied - you are not a member of this class" });
      }
      const students2 = await storage.getStudents(user.schoolId, classId);
      const sanitizedStudents = students2.map((s) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        rollNumber: s.rollNumber,
        admissionNumber: s.admissionNumber,
        status: s.status
      }));
      res.json(sanitizedStudents);
    } catch (error) {
      console.error("Error fetching class students:", error);
      res.status(500).json({ message: "Failed to fetch class students" });
    }
  });
  app2.get("/api/timetable", authenticateToken, async (req, res) => {
    try {
      const { classId, teacherId } = req.query;
      let timetable;
      if (classId) {
        timetable = await storage.getTimetableForClass(classId);
      } else if (teacherId) {
        timetable = await storage.getTimetableForTeacher(teacherId);
      } else {
        timetable = await storage.getTimetableEntries();
      }
      res.json(timetable);
    } catch (error) {
      console.error("Error fetching timetable:", error);
      res.status(500).json({ message: "Failed to fetch timetable" });
    }
  });
  app2.get("/api/timetable/detailed", authenticateToken, async (req, res) => {
    try {
      const { classId, teacherId, versionId, date: date2 } = req.query;
      let timetable;
      if (versionId) {
        timetable = await storage.getTimetableEntriesForVersion(versionId);
      } else {
        const user2 = req.user;
        let schoolId2;
        if (user2.role !== "superadmin" && user2.schoolId) {
          schoolId2 = user2.schoolId;
        }
        timetable = await getMergedTimetableData(classId, teacherId, schoolId2);
      }
      try {
        const user2 = req.user;
        const schoolId2 = user2.role === "admin" ? user2.schoolId : void 0;
        if (schoolId2) {
          const targetDate = date2 || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          const changes = await storage.getActiveTimetableChanges(schoolId2, targetDate);
          const approvedChanges = changes.filter((change) => change.approvedBy && change.isActive);
          for (const change of approvedChanges) {
            if (change.changeType === "substitution" && change.newTeacherId) {
              const entryIndex = timetable.findIndex((entry) => entry.id === change.timetableEntryId);
              if (entryIndex !== -1) {
                timetable[entryIndex] = {
                  ...timetable[entryIndex],
                  teacherId: change.newTeacherId,
                  // Add substitute info as additional properties
                  originalTeacherId: change.originalTeacherId
                };
              }
            } else if (change.changeType === "cancellation") {
              timetable = timetable.filter((entry) => entry.id !== change.timetableEntryId);
            }
          }
        }
      } catch (changeError) {
        console.error("Error applying timetable changes:", changeError);
      }
      if (date2 && typeof date2 === "string") {
        const selectedDate = new Date(date2);
        const dayOfWeek = selectedDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
        timetable = timetable.filter((entry) => entry.day.toLowerCase() === dayOfWeek);
      }
      const user = req.user;
      let schoolId;
      if (user.role === "admin" && user.schoolId) {
        schoolId = user.schoolId;
      }
      const [teachers2, subjects2, classes2] = await Promise.all([
        storage.getTeachers(schoolId),
        storage.getSubjects(schoolId),
        storage.getClasses(schoolId)
      ]);
      const detailedTimetable = timetable.map((entry) => {
        const teacher = teachers2.find((t) => t.id === entry.teacherId);
        const subject = subjects2.find((s) => s.id === entry.subjectId);
        const classData = classes2.find((c) => c.id === entry.classId);
        return {
          ...entry,
          teacher,
          subject,
          class: classData
        };
      });
      res.json(detailedTimetable);
    } catch (error) {
      console.error("Error fetching detailed timetable:", error);
      res.status(500).json({ message: "Failed to fetch detailed timetable" });
    }
  });
  async function getMergedTimetableData(classId, teacherId, schoolId) {
    let globalTimetable;
    if (classId) {
      globalTimetable = await storage.getTimetableForClass(classId);
    } else if (teacherId) {
      globalTimetable = await storage.getTimetableForTeacher(teacherId);
    } else {
      globalTimetable = await storage.getTimetableEntries(schoolId);
    }
    if (classId) {
      const currentDate = /* @__PURE__ */ new Date();
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);
      const weekStartStr = weekStart.toISOString().split("T")[0];
      try {
        const weeklyTimetable = await storage.getWeeklyTimetable(classId, weekStart);
        if (weeklyTimetable && weeklyTimetable.timetableData) {
          const globalMap = /* @__PURE__ */ new Map();
          globalTimetable.forEach((entry) => {
            const key = `${entry.day.toLowerCase()}-${entry.period}`;
            globalMap.set(key, entry);
          });
          const weeklyData = Array.isArray(weeklyTimetable.timetableData) ? weeklyTimetable.timetableData : [];
          weeklyData.forEach((weeklyEntry) => {
            const key = `${weeklyEntry.day.toLowerCase()}-${weeklyEntry.period}`;
            if (weeklyEntry.isModified) {
              if (weeklyEntry.teacherId === null && weeklyEntry.subjectId === null) {
                console.log(`[TIMETABLE MERGE] Deleting entry: ${key}`);
                globalMap.delete(key);
              } else if (weeklyEntry.teacherId && weeklyEntry.subjectId) {
                console.log(`[TIMETABLE MERGE] Updating entry: ${key}`);
                globalMap.set(key, {
                  id: `weekly-${key}`,
                  classId,
                  teacherId: weeklyEntry.teacherId,
                  subjectId: weeklyEntry.subjectId,
                  day: weeklyEntry.day,
                  period: weeklyEntry.period,
                  startTime: weeklyEntry.startTime,
                  endTime: weeklyEntry.endTime,
                  room: weeklyEntry.room,
                  versionId: null,
                  isActive: true,
                  createdAt: /* @__PURE__ */ new Date(),
                  updatedAt: /* @__PURE__ */ new Date()
                });
              }
            }
          });
          return Array.from(globalMap.values());
        }
      } catch (error) {
        console.error("[TIMETABLE MERGE] Error getting weekly timetable:", error);
      }
    }
    return globalTimetable;
  }
  app2.get("/api/timetable/global", authenticateToken, async (req, res) => {
    try {
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      const { classId, teacherId } = req.query;
      console.log("[GLOBAL API] Request params:", { classId, teacherId });
      const user = req.user;
      let schoolId;
      if (user.role !== "superadmin" && user.schoolId) {
        schoolId = user.schoolId;
      }
      const timetable = await getMergedTimetableData(classId, teacherId, schoolId);
      console.log("[GLOBAL API] Raw timetable data:", timetable?.length || 0, "entries");
      console.log("[GLOBAL API] First few entries:", timetable?.slice(0, 2) || "No entries");
      const [teachers2, subjects2, classes2] = await Promise.all([
        storage.getTeachers(schoolId),
        storage.getSubjects(schoolId),
        storage.getClasses(schoolId)
      ]);
      console.log("[GLOBAL API] Related data counts:", {
        teachers: teachers2?.length || 0,
        subjects: subjects2?.length || 0,
        classes: classes2?.length || 0
      });
      const detailedTimetable = timetable.map((entry) => {
        const teacher = teachers2.find((t) => t.id === entry.teacherId);
        const subject = subjects2.find((s) => s.id === entry.subjectId);
        const classData = classes2.find((c) => c.id === entry.classId);
        return {
          ...entry,
          teacher,
          subject,
          class: classData
        };
      });
      console.log("[GLOBAL API] Final detailed timetable length:", detailedTimetable?.length || 0);
      console.log("[GLOBAL API] Sample detailed entry:", detailedTimetable?.[0] || "No entries");
      res.json(detailedTimetable);
    } catch (error) {
      console.error("Error fetching global timetable:", error);
      res.status(500).json({ message: "Failed to fetch global timetable" });
    }
  });
  app2.get("/api/timetable-versions", authenticateToken, async (req, res) => {
    try {
      const { classId, weekStart, weekEnd } = req.query;
      if (!classId || !weekStart || !weekEnd) {
        return res.status(400).json({ message: "classId, weekStart, and weekEnd are required" });
      }
      const versions = await storage.getTimetableVersionsForClass(
        classId,
        weekStart,
        weekEnd
      );
      res.json(versions);
    } catch (error) {
      console.error("Error fetching timetable versions:", error);
      res.status(500).json({ message: "Failed to fetch timetable versions" });
    }
  });
  app2.post("/api/timetable-versions/:id/activate", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { id } = req.params;
      const { classId } = req.body;
      if (!classId) {
        return res.status(400).json({ message: "classId is required" });
      }
      await storage.setActiveVersion(id, classId);
      res.json({ success: true, message: "Version activated successfully" });
    } catch (error) {
      console.error("Error activating version:", error);
      res.status(500).json({ message: "Failed to activate version" });
    }
  });
  app2.get("/api/timetable/optimize", async (req, res) => {
    try {
      const suggestions = await scheduler.suggestOptimizations();
      res.json({ suggestions });
    } catch (error) {
      console.error("Error getting optimization suggestions:", error);
      res.status(500).json({ message: "Failed to get optimization suggestions" });
    }
  });
  app2.post("/api/classes/:classId/assign-teacher-multiple", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { classId } = req.params;
      const { teacherId, subjectIds } = req.body;
      if (!teacherId || !Array.isArray(subjectIds) || subjectIds.length === 0) {
        return res.status(400).json({ message: "teacherId and subjectIds (array) are required" });
      }
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      const teacher = await storage.getTeacher(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      const results = [];
      const errors = [];
      for (const subjectId of subjectIds) {
        try {
          const subject = await storage.getSubject(subjectId);
          if (!subject) {
            errors.push(`Subject ${subjectId} not found`);
            continue;
          }
          const existingAssignment = await storage.getClassSubjectAssignmentByClassAndSubject(classId, subjectId);
          if (!existingAssignment) {
            errors.push(`Subject ${subject.name} must be assigned to class first before assigning a teacher`);
            continue;
          }
          if (existingAssignment.assignedTeacherId && existingAssignment.assignedTeacherId === teacherId) {
            errors.push(`Teacher is already assigned to teach ${subject.name} for this class`);
            continue;
          }
          const updatedAssignment = await storage.updateClassSubjectAssignment(existingAssignment.id, {
            assignedTeacherId: teacherId
          });
          results.push({
            subjectId,
            subjectName: subject.name,
            assignment: updatedAssignment
          });
        } catch (error) {
          console.error(`Error assigning teacher to subject ${subjectId}:`, error);
          errors.push(`Failed to assign teacher to subject ${subjectId}`);
        }
      }
      res.status(200).json({
        message: `Successfully assigned teacher to ${results.length} subjects`,
        results,
        errors: errors.length > 0 ? errors : void 0
      });
    } catch (error) {
      console.error("Error assigning teacher to multiple subjects:", error);
      res.status(500).json({ message: "Failed to assign teacher to subjects" });
    }
  });
  app2.post("/api/classes/:classId/assign-teacher", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { classId } = req.params;
      const { teacherId, subjectId } = req.body;
      if (!teacherId || !subjectId) {
        return res.status(400).json({ message: "teacherId and subjectId are required" });
      }
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      const teacher = await storage.getTeacher(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      const subject = await storage.getSubject(subjectId);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      const existingAssignment = await storage.getClassSubjectAssignmentByClassAndSubject(classId, subjectId);
      if (!existingAssignment) {
        return res.status(404).json({ message: "Subject must be assigned to class first before assigning a teacher" });
      }
      if (existingAssignment.assignedTeacherId && existingAssignment.assignedTeacherId === teacherId) {
        return res.status(409).json({ message: "This teacher is already assigned to teach this subject for this class" });
      }
      const updatedAssignment = await storage.updateClassSubjectAssignment(existingAssignment.id, {
        assignedTeacherId: teacherId
      });
      res.status(200).json(updatedAssignment);
    } catch (error) {
      console.error("Error assigning teacher to class:", error);
      res.status(500).json({ message: "Failed to assign teacher to class" });
    }
  });
  app2.post("/api/classes/:classId/assign-subject", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { classId } = req.params;
      const { subjectId } = req.body;
      if (!subjectId) {
        return res.status(400).json({ message: "subjectId is required" });
      }
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      const subject = await storage.getSubject(subjectId);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      const requiredSubjects = classData.requiredSubjects || [];
      if (!requiredSubjects.includes(subjectId)) {
        requiredSubjects.push(subjectId);
        await storage.updateClass(classId, {
          requiredSubjects
        });
      }
      res.json({ message: "Subject assigned to class successfully" });
    } catch (error) {
      console.error("Error assigning subject to class:", error);
      res.status(500).json({ message: "Failed to assign subject to class" });
    }
  });
  app2.delete("/api/classes/:classId/unassign-teacher/:assignmentId", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { classId, assignmentId } = req.params;
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      await storage.updateClassSubjectAssignment(assignmentId, {
        assignedTeacherId: null
      });
      res.status(200).json({ message: "Teacher unassigned successfully" });
    } catch (error) {
      console.error("Error unassigning teacher from class:", error);
      res.status(500).json({ message: "Failed to unassign teacher from class" });
    }
  });
  app2.delete("/api/classes/:classId/unassign-subject/:subjectId", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { classId, subjectId } = req.params;
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      const requiredSubjects = (classData.requiredSubjects || []).filter((id) => id !== subjectId);
      await storage.updateClass(classId, {
        requiredSubjects
      });
      res.status(204).send();
    } catch (error) {
      console.error("Error unassigning subject from class:", error);
      res.status(500).json({ message: "Failed to unassign subject from class" });
    }
  });
  app2.get("/api/substitutions", async (req, res) => {
    try {
      const { weekStart, weekEnd } = req.query;
      if (weekStart && weekEnd) {
        const startDate = new Date(weekStart);
        const endDate = new Date(weekEnd);
        const substitutions2 = await storage.getSubstitutionsByWeek(startDate, endDate);
        res.json(substitutions2);
      } else {
        const substitutions2 = await storage.getSubstitutions();
        res.json(substitutions2);
      }
    } catch (error) {
      console.error("Error fetching substitutions:", error);
      res.status(500).json({ message: "Failed to fetch substitutions" });
    }
  });
  app2.get("/api/substitutions/active", async (req, res) => {
    try {
      const substitutions2 = await storage.getActiveSubstitutions();
      res.json(substitutions2);
    } catch (error) {
      console.error("Error fetching active substitutions:", error);
      res.status(500).json({ message: "Failed to fetch active substitutions" });
    }
  });
  app2.post("/api/substitutions", async (req, res) => {
    try {
      const validatedData = insertSubstitutionSchema.parse(req.body);
      const substitution = await storage.createSubstitution(validatedData);
      res.status(201).json(substitution);
    } catch (error) {
      console.error("Error creating substitution:", error);
      res.status(400).json({ message: "Invalid substitution data" });
    }
  });
  app2.put("/api/substitutions/:id", async (req, res) => {
    try {
      const validatedData = insertSubstitutionSchema.partial().parse(req.body);
      const substitution = await storage.updateSubstitution(req.params.id, validatedData);
      res.json(substitution);
    } catch (error) {
      console.error("Error updating substitution:", error);
      res.status(400).json({ message: "Invalid substitution data" });
    }
  });
  app2.get("/api/substitutions/pending", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { date: date2, weekStart, weekEnd } = req.query;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      const schoolId = user.role === "super_admin" ? req.query.schoolId : user.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "School ID is required" });
      }
      const allSubstitutions = await storage.getSubstitutions();
      let pendingSubstitutions = allSubstitutions.filter((sub) => {
        return sub.status === "pending" && sub.isAutoGenerated;
      });
      if (date2) {
        const targetDate = new Date(date2).toISOString().split("T")[0];
        pendingSubstitutions = pendingSubstitutions.filter((sub) => {
          const subDate = new Date(sub.date).toISOString().split("T")[0];
          return subDate === targetDate;
        });
      } else if (weekStart && weekEnd) {
        const startDate = new Date(weekStart);
        const endDate = new Date(weekEnd);
        pendingSubstitutions = pendingSubstitutions.filter((sub) => {
          const subDate = new Date(sub.date);
          return subDate >= startDate && subDate <= endDate;
        });
      }
      const enrichedSubstitutions = [];
      for (const sub of pendingSubstitutions) {
        try {
          const originalTeacher = await storage.getTeacher(sub.originalTeacherId);
          const substituteTeacher = sub.substituteTeacherId ? await storage.getTeacher(sub.substituteTeacherId) : null;
          const timetableEntry = await storage.getTimetableEntry(sub.timetableEntryId);
          if (originalTeacher && timetableEntry && originalTeacher.schoolId === schoolId) {
            const classData = await storage.getClass(timetableEntry.classId);
            const subjectData = await storage.getSubject(timetableEntry.subjectId);
            enrichedSubstitutions.push({
              ...sub,
              originalTeacherName: originalTeacher.name,
              substituteTeacherName: substituteTeacher?.name || null,
              className: classData ? `${classData.grade}${classData.section ? `-${classData.section}` : ""}` : "Unknown",
              subjectName: subjectData?.name || "Unknown",
              day: timetableEntry.day,
              period: timetableEntry.period,
              startTime: timetableEntry.startTime,
              endTime: timetableEntry.endTime
            });
          }
        } catch (error) {
          console.error(`Error enriching substitution ${sub.id}:`, error);
        }
      }
      res.json(enrichedSubstitutions);
    } catch (error) {
      console.error("Error fetching pending substitutions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/substitutions/:id/approve", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      const substitutionId = req.params.id;
      const substitution = await storage.getSubstitution(substitutionId);
      if (!substitution) {
        return res.status(404).json({ message: "Substitution not found" });
      }
      if (substitution.status !== "pending") {
        return res.status(400).json({ message: "Substitution is not pending approval" });
      }
      await storage.updateSubstitution(substitutionId, {
        status: "confirmed"
      });
      const timetableEntry = await storage.getTimetableEntry(substitution.timetableEntryId);
      if (timetableEntry && substitution.substituteTeacherId) {
        const absenceDate = new Date(substitution.date);
        const weekStart = new Date(absenceDate);
        weekStart.setDate(absenceDate.getDate() - absenceDate.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const weekStartStr = weekStart.toISOString().split("T")[0];
        const weekEndStr = weekEnd.toISOString().split("T")[0];
        const substituteTeacher = await storage.getTeacher(substitution.substituteTeacherId);
        const substituteName = substituteTeacher?.name || "Unknown";
        await storage.updateWeeklyTimetableEntry(
          timetableEntry.classId,
          weekStartStr,
          weekEndStr,
          timetableEntry.day,
          timetableEntry.period,
          {
            teacherId: substitution.substituteTeacherId,
            subjectId: timetableEntry.subjectId,
            isModified: true,
            modificationReason: `Approved substitution: ${substitution.reason}. Substitute: ${substituteName}`
          },
          user.id
        );
        console.log(`[SUBSTITUTION APPROVED] Updated weekly timetable for ${timetableEntry.classId} ${timetableEntry.day} period ${timetableEntry.period} with substitute ${substituteName}`);
      }
      res.json({ message: "Substitution approved successfully", substitution });
    } catch (error) {
      console.error("Error approving substitution:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/substitutions/:id/reject", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      const substitutionId = req.params.id;
      const substitution = await storage.getSubstitution(substitutionId);
      if (!substitution) {
        return res.status(404).json({ message: "Substitution not found" });
      }
      if (substitution.status !== "pending") {
        return res.status(400).json({ message: "Substitution is not pending approval" });
      }
      await storage.updateSubstitution(substitutionId, {
        status: "rejected"
      });
      res.json({ message: "Substitution rejected successfully", substitution });
    } catch (error) {
      console.error("Error rejecting substitution:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/substitutions/rejected", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { date: date2, weekStart, weekEnd } = req.query;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      const schoolId = user.role === "super_admin" ? req.query.schoolId : user.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "School ID is required" });
      }
      const allSubstitutions = await storage.getSubstitutions();
      let rejectedSubstitutions = allSubstitutions.filter((sub) => {
        return sub.status === "rejected" && sub.isAutoGenerated;
      });
      if (date2) {
        const targetDate = new Date(date2).toISOString().split("T")[0];
        rejectedSubstitutions = rejectedSubstitutions.filter((sub) => {
          const subDate = new Date(sub.date).toISOString().split("T")[0];
          return subDate === targetDate;
        });
      } else if (weekStart && weekEnd) {
        const startDate = new Date(weekStart);
        const endDate = new Date(weekEnd);
        rejectedSubstitutions = rejectedSubstitutions.filter((sub) => {
          const subDate = new Date(sub.date);
          return subDate >= startDate && subDate <= endDate;
        });
      }
      const enrichedSubstitutions = [];
      for (const sub of rejectedSubstitutions) {
        try {
          const originalTeacher = await storage.getTeacher(sub.originalTeacherId);
          const substituteTeacher = sub.substituteTeacherId ? await storage.getTeacher(sub.substituteTeacherId) : null;
          const timetableEntry = await storage.getTimetableEntry(sub.timetableEntryId);
          if (originalTeacher && timetableEntry && originalTeacher.schoolId === schoolId) {
            const classData = await storage.getClass(timetableEntry.classId);
            const subjectData = await storage.getSubject(timetableEntry.subjectId);
            enrichedSubstitutions.push({
              ...sub,
              originalTeacherName: originalTeacher.name,
              substituteTeacherName: substituteTeacher?.name || null,
              className: classData ? `${classData.grade}${classData.section ? `-${classData.section}` : ""}` : "Unknown",
              subjectName: subjectData?.name || "Unknown",
              day: timetableEntry.day,
              period: timetableEntry.period,
              startTime: timetableEntry.startTime,
              endTime: timetableEntry.endTime,
              classId: timetableEntry.classId
            });
          }
        } catch (error) {
          console.error(`Error enriching rejected substitution ${sub.id}:`, error);
        }
      }
      res.json(enrichedSubstitutions);
    } catch (error) {
      console.error("Error fetching rejected substitutions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/timetable-changes", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { date: date2 } = req.query;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      const schoolId = user.role === "super_admin" ? req.query.schoolId : user.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "School ID is required" });
      }
      const changes = await storage.getTimetableChanges(schoolId, date2);
      res.json(changes);
    } catch (error) {
      console.error("Error fetching timetable changes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/timetable-changes/active", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { date: date2 } = req.query;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      const schoolId = user.role === "super_admin" ? req.query.schoolId : user.schoolId;
      const changeDate = date2 || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      if (!schoolId) {
        return res.status(400).json({ message: "School ID is required" });
      }
      const changes = await storage.getActiveTimetableChanges(schoolId, changeDate);
      res.json(changes);
    } catch (error) {
      console.error("Error fetching active timetable changes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/timetable-changes/entry/:timetableEntryId", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      const changes = await storage.getTimetableChangesByEntry(req.params.timetableEntryId);
      res.json(changes);
    } catch (error) {
      console.error("Error fetching timetable changes for entry:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/timetable-changes", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      const validatedData = insertTimetableChangeSchema.parse(req.body);
      const change = await storage.createTimetableChange(validatedData);
      res.status(201).json(change);
    } catch (error) {
      console.error("Error creating timetable change:", error);
      res.status(400).json({ message: "Invalid timetable change data" });
    }
  });
  app2.put("/api/timetable-changes/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      const validatedData = insertTimetableChangeSchema.partial().parse(req.body);
      const change = await storage.updateTimetableChange(req.params.id, validatedData);
      res.json(change);
    } catch (error) {
      console.error("Error updating timetable change:", error);
      res.status(400).json({ message: "Invalid timetable change data" });
    }
  });
  app2.delete("/api/timetable-changes/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      const changes = await storage.getTimetableChanges(user.schoolId || "", void 0);
      const changeToDelete = changes.find((c) => c.id === req.params.id);
      if (!changeToDelete) {
        return res.status(404).json({ message: "Timetable change not found" });
      }
      if (changeToDelete.approvedBy) {
        await storage.updateTimetableChange(req.params.id, {
          isActive: false
          // Hide from UI but keep the substitution record intact
        });
        console.log(`Dismissed approved change notification ${req.params.id} - substitution remains active`);
      } else {
        await storage.deleteTimetableChange(req.params.id);
        console.log(`Permanently deleted unapproved change ${req.params.id}`);
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting timetable change:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/timetable-changes/:id/approve", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      const changeId = req.params.id;
      const changes = await storage.getTimetableChanges(user.schoolId || "", void 0);
      const changeToApprove = changes.find((c) => c.id === changeId);
      if (!changeToApprove) {
        return res.status(404).json({ message: "Timetable change not found" });
      }
      if (changeToApprove.newTeacherId) {
        const substitutions2 = await storage.getSubstitutions();
        const relatedSubstitution = substitutions2.find(
          (sub) => sub.timetableEntryId === changeToApprove.timetableEntryId && sub.originalTeacherId === changeToApprove.originalTeacherId && sub.substituteTeacherId === changeToApprove.newTeacherId && sub.status === "auto_assigned"
        );
        if (relatedSubstitution) {
          await storage.updateSubstitution(relatedSubstitution.id, {
            status: "confirmed"
          });
        }
      }
      await storage.createAuditLog({
        action: "approve_timetable_change",
        entityType: "timetable_changes",
        entityId: changeId,
        userId: user.id,
        description: `Approved and processed timetable change: ${changeToApprove.changeType} for ${changeToApprove.changeDate}`,
        schoolId: user.schoolId || ""
      });
      await storage.deleteTimetableChange(changeId);
      res.json({
        message: "Timetable change approved and notification cleared"
      });
    } catch (error) {
      console.error("Error approving timetable change:", error);
      res.status(500).json({ message: "Failed to approve timetable change" });
    }
  });
  app2.post("/api/timetable-changes/:id/reject", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      const changeId = req.params.id;
      const { reason } = req.body;
      const changes = await storage.getTimetableChanges(user.schoolId || "", void 0);
      const changeToReject = changes.find((c) => c.id === changeId);
      if (!changeToReject) {
        return res.status(404).json({ message: "Timetable change not found" });
      }
      await storage.deleteTimetableChange(changeId);
      await storage.createAuditLog({
        action: "reject_timetable_change",
        entityType: "timetable_changes",
        entityId: changeId,
        userId: user.id,
        description: `Rejected and permanently deleted timetable change: ${changeToReject.changeType} for ${changeToReject.changeDate}. Reason: ${reason || "No reason provided"}`,
        schoolId: user.schoolId || ""
      });
      res.json({
        message: "Timetable change rejected successfully"
      });
    } catch (error) {
      console.error("Error rejecting timetable change:", error);
      res.status(500).json({ message: "Failed to reject timetable change" });
    }
  });
  app2.get("/api/timetable-validity", authenticateToken, async (req, res) => {
    try {
      const classId = req.query.classId;
      const periods = await storage.getTimetableValidityPeriods(classId);
      res.json(periods);
    } catch (error) {
      console.error("Error fetching timetable validity periods:", error);
      res.status(500).json({ message: "Failed to fetch validity periods" });
    }
  });
  app2.get("/api/timetable-validity/:id", authenticateToken, async (req, res) => {
    try {
      const period = await storage.getTimetableValidityPeriod(req.params.id);
      if (!period) {
        return res.status(404).json({ message: "Validity period not found" });
      }
      res.json(period);
    } catch (error) {
      console.error("Error fetching validity period:", error);
      res.status(500).json({ message: "Failed to fetch validity period" });
    }
  });
  app2.post("/api/timetable-validity", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { insertTimetableValidityPeriodSchema: insertTimetableValidityPeriodSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const validatedData = insertTimetableValidityPeriodSchema2.parse(req.body);
      const period = await storage.createTimetableValidityPeriod(validatedData);
      res.status(201).json(period);
    } catch (error) {
      console.error("Error creating validity period:", error);
      res.status(400).json({ message: "Invalid validity period data" });
    }
  });
  app2.put("/api/timetable-validity/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { insertTimetableValidityPeriodSchema: insertTimetableValidityPeriodSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const validatedData = insertTimetableValidityPeriodSchema2.partial().parse(req.body);
      const period = await storage.updateTimetableValidityPeriod(req.params.id, validatedData);
      res.json(period);
    } catch (error) {
      console.error("Error updating validity period:", error);
      res.status(400).json({ message: "Failed to update validity period" });
    }
  });
  app2.delete("/api/timetable-validity/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteTimetableValidityPeriod(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting validity period:", error);
      res.status(500).json({ message: "Failed to delete validity period" });
    }
  });
  app2.post("/api/upload/teachers", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const csvContent = req.file.buffer.toString("utf-8");
      const result = CSVProcessor.processTeachersCSV(csvContent);
      if (!result.success) {
        return res.status(400).json({
          message: "Failed to process CSV",
          errors: result.errors
        });
      }
      const createdTeachers = [];
      const creationErrors = [];
      for (const teacherData of result.data) {
        try {
          const teacher = await storage.createTeacher(teacherData);
          createdTeachers.push(teacher);
        } catch (error) {
          console.error("Error creating teacher:", error);
          if (error && typeof error === "object" && "code" in error && "constraint" in error) {
            if (error.code === "23505" && error.constraint === "teachers_email_unique") {
              creationErrors.push(`Teacher with email ${teacherData.email} already exists`);
            } else {
              creationErrors.push(`Failed to create teacher: ${teacherData.name}`);
            }
          } else {
            creationErrors.push(`Failed to create teacher: ${teacherData.name}`);
          }
        }
      }
      const allErrors = [...result.errors, ...creationErrors];
      res.json({
        message: `Successfully processed ${createdTeachers.length} teachers${creationErrors.length > 0 ? ` with ${creationErrors.length} errors` : ""}`,
        teachers: createdTeachers,
        errors: allErrors
      });
    } catch (error) {
      console.error("Error uploading teachers:", error);
      res.status(500).json({ message: "Failed to upload teachers" });
    }
  });
  app2.post("/api/upload/subjects", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const csvContent = req.file.buffer.toString("utf-8");
      const result = CSVProcessor.processSubjectsCSV(csvContent);
      if (!result.success) {
        return res.status(400).json({
          message: "Failed to process CSV",
          errors: result.errors
        });
      }
      const createdSubjects = [];
      for (const subjectData of result.data) {
        try {
          if (subjectData.code && !subjectData.color) {
            subjectData.color = generateColorForSubjectCode(subjectData.code);
          }
          const subject = await storage.createSubject(subjectData);
          createdSubjects.push(subject);
        } catch (error) {
          console.error("Error creating subject:", error);
        }
      }
      res.json({
        message: `Successfully processed ${createdSubjects.length} subjects`,
        subjects: createdSubjects,
        errors: result.errors
      });
    } catch (error) {
      console.error("Error uploading subjects:", error);
      res.status(500).json({ message: "Failed to upload subjects" });
    }
  });
  app2.post("/api/upload/classes", authenticateToken, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const csvContent = req.file.buffer.toString("utf-8");
      const result = CSVProcessor.processClassesCSV(csvContent);
      if (!result.success) {
        return res.status(400).json({
          message: "Failed to process CSV",
          errors: result.errors
        });
      }
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      let schoolId;
      if (user.role === "admin" && user.schoolId) {
        schoolId = user.schoolId;
      } else if (user.role === "super_admin") {
        schoolId = req.body.schoolId || req.query.schoolId;
        if (!schoolId) {
          return res.status(400).json({ message: "schoolId is required for super admin" });
        }
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
      const createdClasses = [];
      const errors = [];
      for (let i = 0; i < result.data.length; i++) {
        const classData = result.data[i];
        try {
          const classWithSchool = {
            ...classData,
            schoolId
          };
          const classEntity = await storage.createClass(classWithSchool);
          createdClasses.push(classEntity);
        } catch (error) {
          console.error(`Error processing row ${i + 2}:`, error);
          errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      res.json({
        message: `Successfully processed ${createdClasses.length} classes`,
        classes: createdClasses,
        errors: result.errors
      });
    } catch (error) {
      console.error("Error uploading classes:", error);
      res.status(500).json({ message: "Failed to upload classes" });
    }
  });
  app2.get("/api/substitutions/suggest/:timetableEntryId", async (req, res) => {
    try {
      const { timetableEntryId } = req.params;
      const timetableEntries2 = await storage.getTimetableEntries();
      const entry = timetableEntries2.find((e) => e.id === timetableEntryId);
      if (!entry) {
        return res.status(404).json({ message: "Timetable entry not found" });
      }
      const classes2 = await storage.getClasses();
      const classData = classes2.find((c) => c.id === entry.classId);
      const schoolId = classData?.schoolId || "";
      const availableTeachers = await storage.getAvailableTeachers(
        entry.day,
        entry.period,
        entry.subjectId,
        schoolId
      );
      res.json(availableTeachers);
    } catch (error) {
      console.error("Error suggesting substitute teachers:", error);
      res.status(500).json({ message: "Failed to suggest substitute teachers" });
    }
  });
  app2.get("/api/class-subject-assignments", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { classId } = req.query;
      let schoolId;
      if (user.role === "admin" && user.schoolId) {
        schoolId = user.schoolId;
      }
      const assignments = await storage.getClassSubjectAssignments(classId, schoolId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching class subject assignments:", error);
      res.status(500).json({ message: "Failed to fetch class subject assignments" });
    }
  });
  app2.post("/api/class-subject-assignments", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const validatedData = insertClassSubjectAssignmentSchema.parse(req.body);
      const existing = await storage.getClassSubjectAssignmentByClassAndSubject(
        validatedData.classId,
        validatedData.subjectId
      );
      if (existing) {
        return res.status(400).json({ message: "Assignment already exists for this class and subject" });
      }
      const assignment = await storage.createClassSubjectAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating class subject assignment:", error);
      res.status(400).json({ message: "Invalid assignment data" });
    }
  });
  app2.put("/api/class-subject-assignments/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const assignmentId = req.params.id;
      const updateData = req.body;
      const assignment = await storage.updateClassSubjectAssignment(assignmentId, updateData);
      res.json(assignment);
    } catch (error) {
      console.error("Error updating class subject assignment:", error);
      res.status(400).json({ message: "Invalid assignment data" });
    }
  });
  app2.delete("/api/class-subject-assignments/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const assignmentId = req.params.id;
      await storage.deleteClassSubjectAssignment(assignmentId);
      res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
      console.error("Error deleting class subject assignment:", error);
      res.status(500).json({ message: "Failed to delete assignment" });
    }
  });
  app2.get("/api/timetable-structure", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      let structure;
      if (user.role === "super_admin") {
        const { schoolId } = req.query;
        structure = schoolId ? await storage.getTimetableStructureBySchool(schoolId) : await storage.getTimetableStructures();
      } else if (user.schoolId) {
        structure = await storage.getTimetableStructureBySchool(user.schoolId);
      }
      res.json(structure);
    } catch (error) {
      console.error("Error fetching timetable structure:", error);
      res.status(500).json({ message: "Failed to fetch timetable structure" });
    }
  });
  app2.post("/api/timetable-structure", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const validatedData = insertTimetableStructureSchema.parse(req.body);
      if (user.role === "admin" && user.schoolId) {
        validatedData.schoolId = user.schoolId;
      }
      const existingStructure = await storage.getTimetableStructureBySchool(validatedData.schoolId);
      let structure;
      if (existingStructure) {
        structure = await storage.updateTimetableStructure(existingStructure.id, validatedData);
      } else {
        structure = await storage.createTimetableStructure(validatedData);
      }
      res.status(201).json(structure);
    } catch (error) {
      console.error("Error creating/updating timetable structure:", error);
      res.status(400).json({ message: "Invalid structure data" });
    }
  });
  app2.put("/api/timetable-structure/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const structureId = req.params.id;
      const updateData = req.body;
      const existingStructure = await storage.getTimetableStructure(structureId);
      if (!existingStructure) {
        return res.status(404).json({ message: "Timetable structure not found" });
      }
      if (user.role === "admin" && user.schoolId && existingStructure.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - structure not in your school" });
      }
      const structure = await storage.updateTimetableStructure(structureId, updateData);
      res.json(structure);
    } catch (error) {
      console.error("Error updating timetable structure:", error);
      res.status(400).json({ message: "Invalid structure data" });
    }
  });
  app2.delete("/api/timetable-structure/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const structureId = req.params.id;
      const existingStructure = await storage.getTimetableStructure(structureId);
      if (!existingStructure) {
        return res.status(404).json({ message: "Timetable structure not found" });
      }
      if (user.role === "admin" && user.schoolId && existingStructure.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - structure not in your school" });
      }
      await storage.deleteTimetableStructure(structureId);
      res.json({ message: "Timetable structure deleted successfully" });
    } catch (error) {
      console.error("Error deleting timetable structure:", error);
      res.status(500).json({ message: "Failed to delete timetable structure" });
    }
  });
  app2.post("/api/timetable/generate", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { classId } = req.body;
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      const result = await scheduler.generateTimetable(classId, user.schoolId);
      res.json(result);
    } catch (error) {
      console.error("Error generating timetable:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate timetable"
      });
    }
  });
  app2.post("/api/timetable/set-as-global", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { classId, date: date2 } = req.body;
      if (!classId || !date2) {
        return res.status(400).json({ message: "classId and date are required" });
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date2)) {
        return res.status(400).json({
          message: "Invalid date format. Expected YYYY-MM-DD format"
        });
      }
      const parsedDate = new Date(date2);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date provided" });
      }
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const d = /* @__PURE__ */ new Date(date2 + "T00:00:00Z");
      const dow = d.getUTCDay();
      const offset = (dow + 6) % 7;
      const weekStart = new Date(Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate() - offset
      ));
      weekStart.setUTCHours(0, 0, 0, 0);
      let weeklyTimetable;
      try {
        weeklyTimetable = await storage.getWeeklyTimetable(classId, weekStart);
      } catch (error) {
        console.error("Error retrieving weekly timetable:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to retrieve weekly timetable from database"
        });
      }
      if (!weeklyTimetable) {
        console.log(`No weekly timetable found for class ${classId} and week starting ${weekStart.toISOString().split("T")[0]}`);
        return res.status(400).json({
          success: false,
          message: "No weekly timetable found for this class and week. There are no modifications to promote to global schedule."
        });
      }
      if (!weeklyTimetable.timetableData || !Array.isArray(weeklyTimetable.timetableData) || weeklyTimetable.timetableData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Weekly timetable exists but contains no timetable data to promote"
        });
      }
      const validEntries = weeklyTimetable.timetableData.filter(
        (entry) => entry.teacherId && entry.subjectId
      );
      if (validEntries.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Weekly timetable contains no valid entries to promote to global schedule"
        });
      }
      console.log(`Promoting weekly timetable ${weeklyTimetable.id} with ${validEntries.length} valid entries to global`);
      try {
        await storage.promoteWeeklyTimetableToGlobal(weeklyTimetable.id);
        console.log(`Successfully promoted weekly timetable ${weeklyTimetable.id} to global`);
      } catch (error) {
        console.error("Error promoting weekly timetable to global:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to promote weekly timetable to global schedule: " + (error instanceof Error ? error.message : "Unknown error")
        });
      }
      try {
        await storage.updateWeeklyTimetable(weeklyTimetable.id, { isActive: false });
        console.log(`Successfully deactivated weekly timetable ${weeklyTimetable.id}`);
      } catch (error) {
        console.error("Error deactivating weekly timetable:", error);
        console.warn("Weekly timetable promotion succeeded but failed to deactivate the weekly record");
      }
      const entriesCount = validEntries.length;
      console.log(`Set as Global operation completed successfully for class ${classId}, promoted ${entriesCount} entries`);
      res.json({
        success: true,
        message: "Weekly timetable has been promoted to Global Timetable successfully",
        entriesUpdated: entriesCount,
        weekStartDate: weekStart.toISOString().split("T")[0]
      });
    } catch (error) {
      console.error("Error setting as global timetable:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update global timetable"
      });
    }
  });
  app2.post("/api/timetable/copy-from-global", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { classId, date: date2 } = req.body;
      if (!classId || !date2) {
        return res.status(400).json({ message: "classId and date are required" });
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date2)) {
        return res.status(400).json({ message: "Invalid date format. Expected YYYY-MM-DD" });
      }
      try {
        /* @__PURE__ */ new Date(date2 + "T00:00:00Z");
      } catch (error) {
        return res.status(400).json({ message: "Invalid date provided" });
      }
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const d = /* @__PURE__ */ new Date(date2 + "T00:00:00Z");
      const dow = d.getUTCDay();
      const offset = (dow + 6) % 7;
      const weekStart = new Date(Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate() - offset
      ));
      weekStart.setUTCHours(0, 0, 0, 0);
      let globalTimetable;
      try {
        globalTimetable = await storage.getTimetableForClass(classId);
      } catch (error) {
        console.error("Error retrieving global timetable:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to retrieve global timetable from database"
        });
      }
      if (!globalTimetable || globalTimetable.length === 0) {
        console.log(`No global timetable found for class ${classId}`);
        return res.status(400).json({
          success: false,
          message: "No global timetable found for this class. Generate a timetable first."
        });
      }
      const validEntries = globalTimetable.filter(
        (entry) => entry.teacherId && entry.subjectId
      );
      if (validEntries.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Global timetable contains no valid entries to copy"
        });
      }
      console.log(`Copying global timetable for class ${classId} (${validEntries.length} entries) to week starting ${weekStart.toISOString().split("T")[0]}`);
      try {
        const existingWeeklyTimetable = await storage.getWeeklyTimetable(classId, weekStart);
        const weeklyTimetableData = globalTimetable.map((entry) => ({
          day: entry.day,
          period: entry.period,
          startTime: entry.startTime,
          endTime: entry.endTime,
          teacherId: entry.teacherId,
          subjectId: entry.subjectId,
          room: entry.room,
          isModified: false
          // These are fresh copies from global
        }));
        if (existingWeeklyTimetable) {
          await storage.updateWeeklyTimetable(existingWeeklyTimetable.id, {
            timetableData: weeklyTimetableData,
            basedOnGlobalVersion: "1",
            // Mark as fresh copy from global
            modificationCount: 0,
            isActive: true
          });
          console.log(`Successfully updated existing weekly timetable ${existingWeeklyTimetable.id} with global data for class ${classId}, week ${weekStart.toISOString().split("T")[0]}`);
        } else {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          await storage.createWeeklyTimetable({
            classId,
            weekStart: weekStart.toISOString().split("T")[0],
            weekEnd: weekEnd.toISOString().split("T")[0],
            timetableData: weeklyTimetableData,
            modifiedBy: user.id,
            modificationCount: 0,
            basedOnGlobalVersion: "1",
            schoolId: user.schoolId || classData.schoolId,
            isActive: true
          });
          console.log(`Successfully created new weekly timetable from global data for class ${classId}, week ${weekStart.toISOString().split("T")[0]}`);
        }
      } catch (error) {
        console.error("Error copying global timetable to weekly:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to copy global timetable to weekly schedule: " + (error instanceof Error ? error.message : "Unknown error")
        });
      }
      const entriesCount = validEntries.length;
      console.log(`Copy from Global operation completed successfully for class ${classId}, copied ${entriesCount} entries`);
      res.json({
        success: true,
        message: "Global timetable has been copied to weekly schedule successfully",
        entriesCopied: entriesCount,
        weekStartDate: weekStart.toISOString().split("T")[0]
      });
    } catch (error) {
      console.error("Error copying from global timetable:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to copy from global timetable"
      });
    }
  });
  app2.get("/api/timetable/validate", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const validation = await scheduler.validateTimetable();
      res.json(validation);
    } catch (error) {
      console.error("Error validating timetable:", error);
      res.status(500).json({
        isValid: false,
        conflicts: ["Unable to validate timetable due to system error"]
      });
    }
  });
  app2.get("/api/timetable/suggestions", authenticateToken, async (req, res) => {
    try {
      const suggestions = await scheduler.suggestOptimizations();
      res.json({ suggestions });
    } catch (error) {
      console.error("Error getting timetable suggestions:", error);
      res.status(500).json({ message: "Failed to get suggestions" });
    }
  });
  app2.get("/api/teachers/:teacherId/schedule", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { teacherId } = req.params;
      const { date: date2 } = req.query;
      const teacher = await storage.getTeacher(teacherId);
      if (!teacher || user.role !== "super_admin" && teacher.schoolId !== user.schoolId) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      const schedule = await storage.getTeacherSchedule(teacherId, date2);
      let schoolId;
      if (user.role === "admin" && user.schoolId) {
        schoolId = user.schoolId;
      }
      const teacherSchoolId = teacher.schoolId;
      const [subjects2, classes2] = await Promise.all([
        storage.getSubjects(teacherSchoolId),
        storage.getClasses(teacherSchoolId)
      ]);
      const detailedSchedule = schedule.map((entry) => {
        const subject = subjects2.find((s) => s.id === entry.subjectId);
        const classData = classes2.find((c) => c.id === entry.classId);
        return {
          ...entry,
          subject: subject ? {
            id: subject.id,
            name: subject.name,
            code: subject.code,
            color: subject.color
          } : null,
          class: classData ? {
            id: classData.id,
            grade: classData.grade,
            section: classData.section
          } : null
        };
      });
      res.json(detailedSchedule);
    } catch (error) {
      console.error("Error getting teacher schedule:", error);
      res.status(500).json({ message: "Failed to get teacher schedule" });
    }
  });
  app2.get("/api/analytics/teacher-workload", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const analytics = await storage.getTeacherWorkloadAnalytics(user.schoolId);
      res.json(analytics);
    } catch (error) {
      console.error("Error getting teacher workload analytics:", error);
      res.status(500).json({ message: "Failed to get teacher workload analytics" });
    }
  });
  app2.post("/api/analytics/optimize-workload", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const result = await scheduler.optimizeTeacherWorkload(user.schoolId);
      res.json(result);
    } catch (error) {
      console.error("Error optimizing teacher workload:", error);
      res.status(500).json({ message: "Failed to optimize teacher workload" });
    }
  });
  app2.get("/api/substitutions/alerts", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { date: date2 } = req.query;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const currentDate = date2 || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const alerts = await storage.getAbsentTeacherAlerts(user.schoolId, currentDate);
      res.json(alerts);
    } catch (error) {
      console.error("Error getting absent teacher alerts:", error);
      res.status(500).json({ message: "Failed to get absent teacher alerts" });
    }
  });
  app2.get("/api/substitutions/find-substitutes", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { originalTeacherId, timetableEntryId, date: date2 } = req.query;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      if (!originalTeacherId || !timetableEntryId || !date2) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      const substitutes = await storage.findSubstituteTeachers(
        originalTeacherId,
        timetableEntryId,
        date2
      );
      res.json(substitutes);
    } catch (error) {
      console.error("Error finding substitute teachers:", error);
      res.status(500).json({ message: "Failed to find substitute teachers" });
    }
  });
  app2.post("/api/substitutions/auto-assign", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { timetableEntryId, date: date2, reason } = req.body;
      if (!timetableEntryId || !date2 || !reason) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const result = await storage.autoAssignSubstitute(
        timetableEntryId,
        date2,
        reason,
        user.id
      );
      res.json(result);
    } catch (error) {
      console.error("Error auto-assigning substitute:", error);
      res.status(500).json({ message: "Failed to auto-assign substitute" });
    }
  });
  app2.get("/api/timetable/available-teachers", authenticateToken, async (req, res) => {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.set("ETag", `debug-${Date.now()}`);
    try {
      const user = req.user;
      const { classId, day, period, date: date2, subjectId } = req.query;
      console.log(`[TEACHER API] Request: classId=${classId}, day=${day}, period=${period}, date=${date2}, subjectId=${subjectId}`);
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      if (!classId || !day || !period) {
        return res.status(400).json({ message: "classId, day, and period are required" });
      }
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      console.log(`[TEACHER API] Class found: ${classData.grade}, schoolId: ${classData.schoolId}`);
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      console.log(`[TEACHER API] Getting teachers for schoolId: ${classData.schoolId}, subjectId: ${subjectId}`);
      let availableTeachers = [];
      if (subjectId) {
        const allTeachers = await storage.getTeachers(classData.schoolId);
        console.log(`[TEACHER API DEBUG] Found ${allTeachers.length} total teachers in school`);
        const qualifiedTeachers = allTeachers.filter((teacher) => {
          console.log(`[TEACHER API DEBUG] Checking teacher ${teacher.name} (ID: ${teacher.id})`);
          console.log(`[TEACHER API DEBUG] Raw subjects data:`, teacher.subjects, `(type: ${typeof teacher.subjects})`);
          let teacherSubjects = [];
          if (Array.isArray(teacher.subjects)) {
            teacherSubjects = teacher.subjects;
            console.log(`[TEACHER API DEBUG] Parsed as array:`, teacherSubjects);
          } else if (typeof teacher.subjects === "string") {
            try {
              teacherSubjects = JSON.parse(teacher.subjects);
              console.log(`[TEACHER API DEBUG] Parsed from JSON string:`, teacherSubjects);
            } catch (e) {
              console.log(`[TEACHER API DEBUG] First JSON parse failed, trying to fix double-escaped quotes`);
              try {
                const fixedJsonString = teacher.subjects.replace(/""/g, '"');
                teacherSubjects = JSON.parse(fixedJsonString);
                console.log(`[TEACHER API DEBUG] Fixed double-escaped quotes and parsed:`, teacherSubjects);
              } catch (e2) {
                console.log(`[TEACHER API DEBUG] Both JSON parse attempts failed:`, e2.message);
                teacherSubjects = [];
              }
            }
          } else if (teacher.subjects && typeof teacher.subjects === "object") {
            teacherSubjects = Object.values(teacher.subjects);
            console.log(`[TEACHER API DEBUG] Extracted from object:`, teacherSubjects);
          } else {
            console.log(`[TEACHER API DEBUG] No subjects data or unknown format`);
          }
          console.log(`[TEACHER API DEBUG] Teacher ${teacher.name} final subjects:`, teacherSubjects, `Looking for: ${subjectId}`);
          const isQualified = teacherSubjects.includes(subjectId);
          console.log(`[TEACHER API DEBUG] Teacher ${teacher.name} qualified: ${isQualified}`);
          return isQualified;
        });
        console.log(`[TEACHER API] Found ${qualifiedTeachers.length} teachers qualified for subject:`, qualifiedTeachers.map((t) => t.name));
        const busyTeachers = await storage.getTimetableEntries();
        const conflictingEntries = busyTeachers.filter((entry) => {
          const dayMatch = entry.day.toLowerCase() === day.toLowerCase();
          const periodMatch = entry.period === parseInt(period);
          const differentClass = entry.classId !== classId;
          return dayMatch && periodMatch && differentClass;
        });
        const busyTeacherIds = new Set(conflictingEntries.map((entry) => entry.teacherId));
        console.log(`[TEACHER API] Found ${conflictingEntries.length} busy teachers during ${day} period ${period}`);
        availableTeachers = qualifiedTeachers.filter((teacher) => !busyTeacherIds.has(teacher.id));
      } else {
        const allTeachers = await storage.getTeachers(classData.schoolId);
        const busyTeachers = await storage.getTimetableEntries();
        const busyTeacherIds = new Set(
          busyTeachers.filter(
            (entry) => entry.day === day && entry.period === parseInt(period) && entry.classId !== classId
          ).map((entry) => entry.teacherId)
        );
        availableTeachers = allTeachers.filter((teacher) => !busyTeacherIds.has(teacher.id));
      }
      if (date2 && typeof date2 === "string") {
        console.log(`[TEACHER API] Filtering out absent teachers for date: ${date2}`);
        const presentTeachers = [];
        for (const teacher of availableTeachers) {
          const isAbsent = await storage.isTeacherAbsent(teacher.id, date2);
          if (!isAbsent) {
            presentTeachers.push(teacher);
          } else {
            console.log(`[TEACHER API] Filtering out absent teacher: ${teacher.name} (ID: ${teacher.id}) for date: ${date2}`);
          }
        }
        availableTeachers = presentTeachers;
        console.log(`[TEACHER API] After filtering absent teachers: ${availableTeachers.length} teachers remain`);
      }
      const classTeachers = await storage.getTeachersForClass(classId);
      const classTeacherIds = new Set(classTeachers.map((t) => t.id));
      const result = availableTeachers.map((teacher) => ({
        ...teacher,
        priority: classTeacherIds.has(teacher.id) ? 1 : 2,
        teachingThisClass: classTeacherIds.has(teacher.id)
      })).sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
      console.log(`[TEACHER API] SUCCESS - Returning ${result.length} available teachers:`, result.map((t) => t.name));
      res.json(result);
    } catch (error) {
      console.error("[TEACHER API] ERROR:", error);
      res.status(500).json({ message: "Failed to get available teachers" });
    }
  });
  app2.post("/api/timetable/manual-assign", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const {
        newTeacherId,
        classId,
        subjectId,
        day,
        period,
        startTime,
        endTime,
        room,
        reason,
        weekStart
        // Required for weekly timetable operations
      } = req.body;
      if (!newTeacherId || !classId || !day || period === void 0 || !weekStart) {
        return res.status(400).json({ message: "newTeacherId, classId, day, period, and weekStart are required" });
      }
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const dayMap = {
        "monday": 0,
        "tuesday": 1,
        "wednesday": 2,
        "thursday": 3,
        "friday": 4,
        "saturday": 5,
        "sunday": 6
      };
      const editWeekStart = new Date(weekStart);
      const dayOffset = dayMap[day.toLowerCase()] || 0;
      const editDate = new Date(editWeekStart);
      editDate.setDate(editWeekStart.getDate() + dayOffset);
      editDate.setHours(0, 0, 0, 0);
      if (editDate < today) {
        return res.status(400).json({
          message: "Cannot assign teachers for past dates. You can only assign teachers for today or future dates."
        });
      }
      const teacher = await storage.getTeacher(newTeacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      if (teacher.schoolId !== classData.schoolId) {
        return res.status(403).json({ message: "Teacher does not belong to the same school as the class" });
      }
      console.log(`[WEEKLY ASSIGNMENT] Checking availability for teacher ${newTeacherId} on ${day} period ${period}`);
      const allTimetableEntries = await storage.getTimetableEntries();
      const conflictingEntry = allTimetableEntries.find((entry) => {
        const dayMatch = entry.day.toLowerCase() === day.toLowerCase();
        const periodMatch = entry.period === period;
        const sameTeacher = entry.teacherId === newTeacherId;
        const differentClass = entry.classId !== classId;
        return dayMatch && periodMatch && sameTeacher && differentClass;
      });
      if (conflictingEntry) {
        const conflictClass = await storage.getClass(conflictingEntry.classId);
        console.log(`[WEEKLY ASSIGNMENT] CONFLICT: Teacher ${newTeacherId} is teaching class ${conflictingEntry.classId} during ${day} period ${period}`);
        return res.status(409).json({
          message: `Teacher ${teacher.name} is already assigned to ${conflictClass?.grade}-${conflictClass?.section} at this time slot`,
          hasConflicts: true
        });
      }
      console.log(`[WEEKLY ASSIGNMENT] Teacher ${newTeacherId} is available for ${day} period ${period}`);
      const weekEnd = new Date(editWeekStart);
      weekEnd.setDate(editWeekStart.getDate() + 6);
      const result = await storage.updateWeeklyTimetableEntry(
        classId,
        weekStart,
        weekEnd.toISOString().split("T")[0],
        day,
        period,
        {
          teacherId: newTeacherId,
          subjectId: subjectId || null,
          startTime: startTime || null,
          endTime: endTime || null,
          room: room || null,
          isModified: true,
          modificationReason: reason || "Manual teacher assignment"
        },
        user.id
      );
      await storage.createAuditLog({
        action: "weekly_teacher_assignment",
        entityType: "weekly_timetables",
        entityId: result.id || `${classId}-${weekStart}-${day}-${period}`,
        userId: user.id,
        description: `Assigned teacher ${teacher.name} to ${classData.grade}-${classData.section} for ${day} period ${period}, week ${weekStart}`,
        schoolId: classData.schoolId
      });
      res.json({
        success: true,
        message: "Teacher assigned to weekly timetable successfully",
        weeklyEntry: result
      });
    } catch (error) {
      console.error("Error manually assigning teacher to weekly timetable:", error);
      res.status(500).json({ message: "Failed to assign teacher to weekly timetable" });
    }
  });
  app2.post("/api/timetable/weekly-edit", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const {
        classId,
        weekStart,
        day,
        period,
        teacherId,
        // null to delete assignment
        subjectId,
        // null to delete assignment
        startTime,
        endTime,
        room,
        reason = "Manual admin edit"
      } = req.body;
      if (!classId || !weekStart || !day || period === void 0) {
        return res.status(400).json({ message: "classId, weekStart, day, and period are required" });
      }
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const dayMap = {
        "monday": 0,
        "tuesday": 1,
        "wednesday": 2,
        "thursday": 3,
        "friday": 4,
        "saturday": 5,
        "sunday": 6
      };
      const editWeekStart = new Date(weekStart);
      const dayOffset = dayMap[day.toLowerCase()] || 0;
      const editDate = new Date(editWeekStart);
      editDate.setDate(editWeekStart.getDate() + dayOffset);
      editDate.setHours(0, 0, 0, 0);
      console.log(`[DATE VALIDATION] Today: ${today.toISOString()}`);
      console.log(`[DATE VALIDATION] Edit date (${day}): ${editDate.toISOString()}`);
      if (editDate < today) {
        return res.status(400).json({
          message: "Cannot edit timetable entries for past dates. You can only edit entries for today or future dates."
        });
      }
      const weekEnd = new Date(editWeekStart);
      weekEnd.setDate(editWeekStart.getDate() + 6);
      if (teacherId) {
        const teacher = await storage.getTeacher(teacherId);
        if (!teacher) {
          return res.status(404).json({ message: "Teacher not found" });
        }
        if (teacher.schoolId !== classData.schoolId) {
          return res.status(403).json({ message: "Teacher does not belong to the same school as the class" });
        }
        const globalTimetableEntries = await storage.getTimetableEntries();
        const conflictingEntry = globalTimetableEntries.find((entry) => {
          const dayMatch = entry.day.toLowerCase() === day.toLowerCase();
          const periodMatch = entry.period === period;
          const sameTeacher = entry.teacherId === teacherId;
          const differentClass = entry.classId !== classId;
          return dayMatch && periodMatch && sameTeacher && differentClass;
        });
        if (conflictingEntry) {
          const conflictClass = await storage.getClass(conflictingEntry.classId);
          return res.status(409).json({
            message: `Teacher ${teacher.name} is already assigned to ${conflictClass?.grade}-${conflictClass?.section} at this time slot`,
            hasConflicts: true
          });
        }
      }
      const result = await storage.updateWeeklyTimetableEntry(
        classId,
        weekStart,
        weekEnd.toISOString().split("T")[0],
        day,
        period,
        {
          teacherId,
          subjectId,
          startTime,
          endTime,
          room,
          isModified: true,
          modificationReason: reason
        },
        user.id
      );
      await storage.createAuditLog({
        action: "weekly_timetable_edit",
        entityType: "weekly_timetables",
        entityId: result.id,
        userId: user.id,
        description: `Manual weekly edit: ${teacherId ? "Assigned" : "Removed"} teacher for ${day} period ${period} in week ${weekStart}. Reason: ${reason}`,
        schoolId: user.schoolId || classData.schoolId
      });
      res.json({
        success: true,
        message: "Weekly timetable updated successfully (no approval required)",
        weeklyTimetableId: result.id,
        modificationCount: result.modificationCount
      });
    } catch (error) {
      console.error("Error updating weekly timetable:", error);
      res.status(500).json({ message: "Failed to update weekly timetable" });
    }
  });
  app2.post("/api/timetable/copy-global-to-weekly", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { classId, weekStart, weekEnd } = req.body;
      if (!classId || !weekStart || !weekEnd) {
        return res.status(400).json({ message: "classId, weekStart, and weekEnd are required" });
      }
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }
      const globalEntries = await storage.getTimetableEntries();
      const classGlobalEntries = globalEntries.filter(
        (entry) => entry.classId === classId && entry.isActive
      );
      if (classGlobalEntries.length === 0) {
        return res.status(404).json({
          message: "No global timetable found for this class. Please generate a global timetable first."
        });
      }
      const weeklyTimetableData = classGlobalEntries.map((entry) => ({
        day: entry.day,
        period: entry.period,
        teacherId: entry.teacherId,
        subjectId: entry.subjectId,
        startTime: entry.startTime,
        endTime: entry.endTime,
        room: entry.room,
        isModified: false
        // Initially not modified since it's copied from global
      }));
      const result = await storage.createOrUpdateWeeklyTimetable(
        classId,
        new Date(weekStart),
        weeklyTimetableData,
        user.id,
        classData.schoolId
      );
      await storage.createAuditLog({
        action: "copy_global_to_weekly",
        entityType: "weekly_timetables",
        entityId: result.id,
        userId: user.id,
        description: `Copied global timetable to weekly timetable for class ${classData.grade}-${classData.section} for week ${weekStart}`,
        schoolId: user.schoolId || classData.schoolId
      });
      console.log(`[COPY GLOBAL TO WEEKLY] Successfully copied global timetable to weekly for class ${classId}, week ${weekStart}`);
      res.json({
        success: true,
        message: "Global timetable copied to weekly successfully",
        weeklyTimetableId: result.id,
        entriesCopied: weeklyTimetableData.length
      });
    } catch (error) {
      console.error("Error copying global timetable to weekly:", error);
      res.status(500).json({ message: "Failed to copy global timetable to weekly" });
    }
  });
  app2.delete("/api/timetable/entry/:entryId", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { entryId } = req.params;
      const { date: date2, permanent } = req.query;
      const entry = await storage.getTimetableEntry(entryId);
      if (!entry) {
        return res.status(404).json({ message: "Timetable entry not found" });
      }
      const classData = await storage.getClass(entry.classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - entry not in your school" });
      }
      if (permanent === "true") {
        await storage.deleteTimetableEntry(entryId);
        await storage.createAuditLog({
          action: "delete_global_entry",
          entityType: "timetable_entries",
          entityId: entryId,
          userId: user.id,
          description: `Permanently deleted global timetable entry: ${entry.day} period ${entry.period} for class ${entry.classId}`,
          schoolId: user.schoolId || classData.schoolId
        });
        return res.json({
          success: true,
          message: "Timetable entry permanently deleted from global schedule",
          type: "permanent_deletion"
        });
      }
      const cancellationDate = date2 ? new Date(date2) : /* @__PURE__ */ new Date();
      const cancellationChange = await storage.createTimetableChange({
        timetableEntryId: entryId,
        changeType: "cancellation",
        changeDate: cancellationDate.toISOString().split("T")[0],
        originalTeacherId: entry.teacherId,
        newTeacherId: null,
        reason: "Period cancelled by admin",
        changeSource: "manual",
        approvedBy: null,
        // Don't auto-approve to prevent dismissal
        approvedAt: null,
        isActive: true
      });
      await storage.createManualAssignmentAudit({
        timetableEntryId: entryId,
        classId: entry.classId,
        day: entry.day,
        period: entry.period,
        oldTeacherId: entry.teacherId,
        newTeacherId: null,
        // null indicates cancellation
        subjectId: entry.subjectId || null,
        changeReason: "Period cancelled by admin for specific week",
        assignedBy: user.id
      });
      try {
        const currentWeek = new Date(cancellationDate);
        const weekStart = new Date(currentWeek);
        weekStart.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
        const globalTimetable = await storage.getTimetableEntriesForClass(entry.classId);
        const weeklyTimetableData = globalTimetable.map((globalEntry) => {
          if (globalEntry.id === entryId) {
            return {
              day: globalEntry.day,
              period: globalEntry.period,
              teacherId: null,
              // Cancelled - no teacher assigned
              subjectId: null,
              // Cancelled - no subject
              startTime: globalEntry.startTime,
              endTime: globalEntry.endTime,
              room: null,
              isModified: true,
              modificationReason: "Period cancelled by admin"
            };
          } else {
            return {
              day: globalEntry.day,
              period: globalEntry.period,
              teacherId: globalEntry.teacherId,
              subjectId: globalEntry.subjectId,
              startTime: globalEntry.startTime,
              endTime: globalEntry.endTime,
              room: globalEntry.room,
              isModified: false
            };
          }
        });
        await storage.createOrUpdateWeeklyTimetable(
          entry.classId,
          weekStart,
          weeklyTimetableData,
          user.id,
          classData.schoolId
        );
        console.log(`[WEEKLY TIMETABLE] Created/updated weekly timetable for class ${entry.classId}, week ${weekStart.toISOString().split("T")[0]} with cancellation`);
      } catch (weeklyError) {
        console.error("[WEEKLY TIMETABLE] Error creating weekly timetable:", weeklyError);
      }
      res.json({
        success: true,
        message: "Period cancelled for this week successfully",
        changeId: cancellationChange.id
      });
    } catch (error) {
      console.error("Error deleting timetable entry:", error);
      res.status(500).json({ message: "Failed to delete timetable entry" });
    }
  });
  app2.get("/api/audit-logs", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { limit } = req.query;
      const logs = await storage.getAuditLogs(user.schoolId, limit ? parseInt(limit) : 50);
      res.json(logs);
    } catch (error) {
      console.error("Error getting audit logs:", error);
      res.status(500).json({ message: "Failed to get audit logs" });
    }
  });
  app2.post("/api/audit-logs", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const auditData = {
        ...req.body,
        schoolId: user.schoolId,
        userId: user.id
      };
      const validatedData = insertAuditLogSchema.parse(auditData);
      const log2 = await storage.createAuditLog(validatedData);
      res.json(log2);
    } catch (error) {
      console.error("Error creating audit log:", error);
      res.status(500).json({ message: "Failed to create audit log" });
    }
  });
  app2.get("/api/teachers/:teacherId/availability", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { teacherId } = req.params;
      const { day, period, date: date2 } = req.query;
      const teacher = await storage.getTeacher(teacherId);
      if (!teacher || user.role !== "super_admin" && teacher.schoolId !== user.schoolId) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      if (!day || !period || !date2) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      const isAvailable = await scheduler.isTeacherAvailableForSubstitute(
        teacherId,
        day,
        parseInt(period),
        date2
      );
      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Error checking teacher availability:", error);
      res.status(500).json({ message: "Failed to check teacher availability" });
    }
  });
  app2.get("/api/bulk-import/template", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const sampleData = [
        {
          "Grade": "10",
          "Section": "A",
          "Subject Names": "Mathematics,English,Science,History,Geography"
        },
        {
          "Grade": "10",
          "Section": "B",
          "Subject Names": "Mathematics,English,Science,History,Geography"
        },
        {
          "Grade": "11",
          "Section": "NA",
          "Subject Names": "Mathematics,English,Physics,Chemistry,Biology"
        },
        {
          "Grade": "12",
          "Section": "NA",
          "Subject Names": "Mathematics,English,Physics,Chemistry,Biology"
        }
      ];
      const workbook = XLSX3.utils.book_new();
      const worksheet = XLSX3.utils.json_to_sheet(sampleData);
      XLSX3.utils.book_append_sheet(workbook, worksheet, "Classes");
      const buffer = XLSX3.write(workbook, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Disposition", 'attachment; filename="class_subjects_template.xlsx"');
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.send(buffer);
    } catch (error) {
      console.error("Error generating template:", error);
      res.status(500).json({ message: "Failed to generate template" });
    }
  });
  app2.post("/api/bulk-import/excel", authenticateToken, upload.single("file"), async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      if (!req.file.originalname.match(/\.(xlsx|xls)$/i)) {
        return res.status(400).json({ error: "Please upload a valid Excel file (.xlsx or .xls)" });
      }
      const workbook = XLSX3.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX3.utils.sheet_to_json(worksheet);
      if (!data || data.length === 0) {
        return res.status(400).json({ error: "Excel file is empty or invalid" });
      }
      let classesCreated = 0;
      let subjectsCreated = 0;
      let assignmentsCreated = 0;
      const errors = [];
      const existingSubjects = await storage.getSubjects(user.schoolId);
      const gradeSubjectMap = /* @__PURE__ */ new Map();
      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i];
          const rowNum = i + 2;
          if (!row.Grade) {
            errors.push(`Row ${rowNum}: Grade is required`);
            continue;
          }
          const grade = row.Grade.toString();
          const section = row.Section && row.Section.toString().toUpperCase() === "NA" ? "" : (row.Section || "").toString();
          const existingClass = await storage.checkClassExists(grade, section, user.schoolId);
          if (existingClass) {
            errors.push(`Row ${rowNum}: Class ${grade}${section ? `-${section}` : ""} already exists`);
            continue;
          }
          const classData = {
            grade,
            section,
            studentCount: 0,
            // Default value, not imported
            room: null,
            // Not imported
            schoolId: user.schoolId,
            requiredSubjects: []
          };
          const newClass = await storage.createClass(classData);
          classesCreated++;
          if (row["Subject Names"]) {
            const subjectNames = row["Subject Names"].toString().split(",").map((name) => name.trim());
            if (!gradeSubjectMap.has(grade)) {
              gradeSubjectMap.set(grade, /* @__PURE__ */ new Map());
            }
            const gradeSubjects = gradeSubjectMap.get(grade);
            for (const subjectName of subjectNames) {
              if (!subjectName) continue;
              const normalizedName = subjectName.toLowerCase();
              let subjectId;
              let subjectCode;
              if (gradeSubjects.has(normalizedName)) {
                const gradeSubject = gradeSubjects.get(normalizedName);
                subjectId = gradeSubject.id;
                subjectCode = gradeSubject.code;
              } else {
                const existingSubjectForGrade = existingSubjects.find(
                  (s) => s.name.toLowerCase() === normalizedName && s.code.includes(grade)
                );
                if (existingSubjectForGrade) {
                  subjectId = existingSubjectForGrade.id;
                  subjectCode = existingSubjectForGrade.code;
                  gradeSubjects.set(normalizedName, { id: subjectId, code: subjectCode });
                } else {
                  subjectCode = await generateGradeSpecificSubjectCode(subjectName, grade, user.schoolId);
                  const uniqueColor = generateColorForSubjectCode(subjectCode);
                  const newSubject = await storage.createSubject({
                    name: subjectName,
                    code: subjectCode,
                    schoolId: user.schoolId,
                    periodsPerWeek: 5,
                    // Default value
                    color: uniqueColor
                  });
                  subjectId = newSubject.id;
                  subjectsCreated++;
                  gradeSubjects.set(normalizedName, { id: subjectId, code: subjectCode });
                }
              }
              await storage.createClassSubjectAssignment({
                classId: newClass.id,
                subjectId,
                weeklyFrequency: 5,
                // Default value
                assignedTeacherId: null
              });
              assignmentsCreated++;
            }
          }
        } catch (error) {
          errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }
      res.json({
        classesCreated,
        subjectsCreated,
        assignmentsCreated,
        errors: errors.length > 0 ? errors : void 0,
        message: `Successfully imported ${classesCreated} classes, ${subjectsCreated} subjects, and ${assignmentsCreated} subject assignments`
      });
    } catch (error) {
      console.error("Error processing Excel file:", error);
      res.status(500).json({ error: "Failed to process Excel file" });
    }
  });
  app2.get("/api/subjects/default-periods", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const subjects2 = await storage.getSubjects(user.schoolId);
      const subjectsWithDefaults = subjects2.map((subject) => ({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        periodsPerWeek: subject.periodsPerWeek,
        color: subject.color
      }));
      res.json(subjectsWithDefaults);
    } catch (error) {
      console.error("Error fetching subjects with default periods:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });
  app2.put("/api/subjects/default-periods", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const updates = req.body.updates;
      if (!Array.isArray(updates)) {
        return res.status(400).json({ message: "Updates must be an array" });
      }
      for (const update of updates) {
        if (!update.id || typeof update.periodsPerWeek !== "number" || update.periodsPerWeek < 1 || update.periodsPerWeek > 20) {
          return res.status(400).json({ message: "Invalid update data. Periods per week must be between 1 and 20." });
        }
      }
      const results = [];
      for (const update of updates) {
        try {
          const updatedSubject = await storage.updateSubject(update.id, {
            periodsPerWeek: update.periodsPerWeek
          });
          results.push(updatedSubject);
        } catch (error) {
          console.error(`Error updating subject ${update.id}:`, error);
          throw error;
        }
      }
      res.json({
        message: `Successfully updated ${results.length} subjects`,
        updatedSubjects: results
      });
    } catch (error) {
      console.error("Error updating default periods:", error);
      res.status(500).json({ message: "Failed to update default periods" });
    }
  });
  app2.put("/api/settings/global-default-periods", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { defaultPeriods, updateExisting } = req.body;
      if (typeof defaultPeriods !== "number" || defaultPeriods < 1 || defaultPeriods > 20) {
        return res.status(400).json({ message: "Default periods must be between 1 and 20" });
      }
      const subjects2 = await storage.getSubjects(user.schoolId);
      if (subjects2.length === 0) {
        return res.status(404).json({ message: "No subjects found for this school" });
      }
      const subjectUpdatePromises = subjects2.map(
        (subject) => storage.updateSubject(subject.id, { periodsPerWeek: defaultPeriods })
      );
      await Promise.all(subjectUpdatePromises);
      let assignmentsUpdated = 0;
      if (updateExisting) {
        try {
          const allAssignments = await storage.getClassSubjectAssignments();
          const subjectIds = new Set(subjects2.map((s) => s.id));
          const schoolAssignments = allAssignments.filter(
            (assignment) => subjectIds.has(assignment.subjectId)
          );
          const assignmentUpdatePromises = schoolAssignments.map(
            (assignment) => storage.updateClassSubjectAssignment(assignment.id, { weeklyFrequency: defaultPeriods })
          );
          await Promise.all(assignmentUpdatePromises);
          assignmentsUpdated = schoolAssignments.length;
        } catch (error) {
          console.error("Error updating existing assignments:", error);
        }
      }
      res.json({
        message: `Successfully updated ${subjects2.length} subjects to ${defaultPeriods} periods per week` + (updateExisting ? ` and ${assignmentsUpdated} existing class assignments` : ""),
        subjectsUpdated: subjects2.length,
        assignmentsUpdated: updateExisting ? assignmentsUpdated : 0,
        newDefaultPeriods: defaultPeriods
      });
    } catch (error) {
      console.error("Error updating global default periods:", error);
      res.status(500).json({ message: "Failed to update global default periods" });
    }
  });
  app2.get("/api/settings/timetable-freeze-status", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const school = await storage.getSchool(user.schoolId);
      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }
      res.json({
        timetableFrozen: school.timetableFrozen || false
      });
    } catch (error) {
      console.error("Error getting timetable freeze status:", error);
      res.status(500).json({ message: "Failed to get timetable freeze status" });
    }
  });
  app2.put("/api/settings/freeze-timetable", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.updateSchool(user.schoolId, { timetableFrozen: true });
      res.json({
        message: "Timetable changes have been frozen successfully",
        timetableFrozen: true
      });
    } catch (error) {
      console.error("Error freezing timetable:", error);
      res.status(500).json({ message: "Failed to freeze timetable changes" });
    }
  });
  app2.put("/api/settings/unfreeze-timetable", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.updateSchool(user.schoolId, { timetableFrozen: false });
      res.json({
        message: "Timetable changes have been unfrozen successfully",
        timetableFrozen: false
      });
    } catch (error) {
      console.error("Error unfreezing timetable:", error);
      res.status(500).json({ message: "Failed to unfreeze timetable changes" });
    }
  });
  app2.get("/api/availability/free-teachers", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { date: date2 } = req.query;
      const selectedDate = date2 || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const dateObj = new Date(selectedDate);
      const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const teachers2 = await storage.getTeachers(user.schoolId);
      const timetableStructure = await storage.getTimetableStructure(user.schoolId);
      if (!timetableStructure || !timetableStructure.timeSlots) {
        return res.status(404).json({ message: "Timetable structure not found" });
      }
      const regularPeriods = timetableStructure.timeSlots.filter((slot) => !slot.isBreak);
      const freeTeachersByPeriod = [];
      for (const timeSlot of regularPeriods) {
        const freeTeachers = [];
        for (const teacher of teachers2) {
          if (!teacher.isActive) continue;
          const isAvailable = await storage.isTeacherAvailable(
            teacher.id,
            dayOfWeek,
            timeSlot.period,
            selectedDate
          );
          if (isAvailable) {
            freeTeachers.push({
              id: teacher.id,
              name: teacher.name,
              email: teacher.email,
              subjects: teacher.subjects || []
            });
          }
        }
        freeTeachersByPeriod.push({
          period: timeSlot.period,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          freeTeachers: freeTeachers.sort((a, b) => a.name.localeCompare(b.name))
        });
      }
      res.json({
        date: selectedDate,
        dayOfWeek,
        periods: freeTeachersByPeriod
      });
    } catch (error) {
      console.error("Error fetching free teachers:", error);
      res.status(500).json({ message: "Failed to fetch free teachers for today" });
    }
  });
  app2.get("/api/timetable/weekly/:classId", authenticateToken, async (req, res) => {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    try {
      const user = req.user;
      const { classId } = req.params;
      const { date: date2 } = req.query;
      console.log(`[WEEKLY API] Request for classId: ${classId}, date: ${date2}`);
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const targetDate = date2 ? new Date(date2) : /* @__PURE__ */ new Date();
      const weekStart = new Date(targetDate);
      weekStart.setDate(targetDate.getDate() - targetDate.getDay() + 1);
      let weeklyTimetable = await storage.getWeeklyTimetable(classId, weekStart);
      if (weeklyTimetable) {
        res.json({
          type: "weekly",
          classId,
          weekStart: weekStart.toISOString().split("T")[0],
          data: weeklyTimetable,
          hasWeeklyOverrides: true
        });
      } else {
        console.log(`[AUTO-CREATE WEEKLY] Creating weekly timetable for class ${classId}, week ${weekStart.toISOString().split("T")[0]} from global schedule`);
        const globalTimetable = await storage.getTimetableEntriesForClass(classId);
        if (globalTimetable && globalTimetable.length > 0) {
          const weeklyTimetableData = globalTimetable.map((entry) => ({
            day: entry.day,
            period: entry.period,
            startTime: entry.startTime,
            endTime: entry.endTime,
            teacherId: entry.teacherId,
            subjectId: entry.subjectId,
            room: entry.room,
            isModified: false
            // Mark as unmodified since it's copied from global
          }));
          weeklyTimetable = await storage.createOrUpdateWeeklyTimetable(
            classId,
            weekStart,
            weeklyTimetableData,
            user.id,
            classData.schoolId
          );
          console.log(`[AUTO-CREATE WEEKLY] Successfully created weekly timetable with ${weeklyTimetableData.length} entries`);
          res.json({
            type: "weekly",
            classId,
            weekStart: weekStart.toISOString().split("T")[0],
            data: weeklyTimetable,
            hasWeeklyOverrides: true,
            autoCreated: true
            // Flag to indicate it was auto-created
          });
        } else {
          console.log(`[AUTO-CREATE WEEKLY] No global timetable found for class ${classId}, returning empty weekly structure`);
          res.json({
            type: "weekly",
            classId,
            weekStart: weekStart.toISOString().split("T")[0],
            data: null,
            hasWeeklyOverrides: false,
            isEmpty: true
          });
        }
      }
    } catch (error) {
      console.error("Error fetching/creating weekly timetable:", error);
      res.status(500).json({ message: "Failed to fetch or create weekly timetable" });
    }
  });
  app2.post("/api/timetable/weekly/:weeklyTimetableId/promote", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { weeklyTimetableId } = req.params;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const weeklyTimetable = await storage.getWeeklyTimetable("", /* @__PURE__ */ new Date());
      await storage.promoteWeeklyTimetableToGlobal(weeklyTimetableId);
      res.json({
        success: true,
        message: "Weekly timetable promoted to global timetable successfully"
      });
    } catch (error) {
      console.error("Error promoting weekly timetable:", error);
      res.status(500).json({ message: "Failed to promote weekly timetable" });
    }
  });
  app2.get("/api/timetable/enhanced/:classId", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { classId } = req.params;
      const { date: date2 } = req.query;
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const targetDate = date2 ? new Date(date2) : /* @__PURE__ */ new Date();
      const weekStart = new Date(targetDate);
      weekStart.setDate(targetDate.getDate() - targetDate.getDay() + 1);
      const weeklyTimetable = await storage.getWeeklyTimetable(classId, weekStart);
      if (weeklyTimetable) {
        const formattedEntries = weeklyTimetable.timetableData.map((entry) => ({
          id: `weekly-${entry.day}-${entry.period}`,
          // Generate temporary ID
          classId,
          teacherId: entry.teacherId,
          subjectId: entry.subjectId,
          day: entry.day,
          period: entry.period,
          startTime: entry.startTime,
          endTime: entry.endTime,
          room: entry.room,
          isActive: true,
          isWeeklyOverride: true,
          isModified: entry.isModified || false,
          modificationReason: entry.modificationReason,
          createdAt: weeklyTimetable.createdAt,
          updatedAt: weeklyTimetable.updatedAt
        }));
        res.json({
          entries: formattedEntries,
          source: "weekly",
          weekStart: weekStart.toISOString().split("T")[0],
          modifiedBy: weeklyTimetable.modifiedBy,
          modificationCount: weeklyTimetable.modificationCount
        });
      } else {
        const globalEntries = await storage.getTimetableEntriesWithDetails();
        const classEntries = globalEntries.filter((entry) => entry.classId === classId);
        res.json({
          entries: classEntries.map((entry) => ({
            ...entry,
            isWeeklyOverride: false,
            isModified: false
          })),
          source: "global",
          weekStart: weekStart.toISOString().split("T")[0],
          modifiedBy: null,
          modificationCount: 0
        });
      }
    } catch (error) {
      console.error("Error fetching enhanced timetable:", error);
      res.status(500).json({ message: "Failed to fetch enhanced timetable" });
    }
  });
  app2.post("/api/timetable/refresh-global/:classId", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { classId } = req.params;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }
      console.log(`[REFRESH GLOBAL] Starting global timetable refresh for class ${classId}`);
      const deletionResult = await storage.deleteGlobalAndFutureWeeklyTimetables(classId);
      console.log(`[REFRESH GLOBAL] Deleted ${deletionResult.globalDeleted} global entries and ${deletionResult.weeklyDeleted} current/future weekly timetables`);
      const classAssignments = await storage.getClassSubjectAssignments(classId);
      const timetableStructure = await storage.getTimetableStructure(classData.schoolId);
      if (!timetableStructure) {
        return res.status(400).json({ message: "No timetable structure found for school" });
      }
      const newTimetableEntries = [];
      const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
      for (const assignment of classAssignments) {
        if (!assignment.assignedTeacherId) continue;
        const subject = assignment.subject;
        const periodsNeeded = assignment.weeklyFrequency;
        let periodsAssigned = 0;
        for (let dayIndex = 0; dayIndex < days.length && periodsAssigned < periodsNeeded; dayIndex++) {
          const day = days[dayIndex];
          const dailyPeriods = periodsNeeded <= 5 ? 1 : Math.ceil(periodsNeeded / 5);
          for (let p = 0; p < dailyPeriods && periodsAssigned < periodsNeeded; p++) {
            const period = (dayIndex * dailyPeriods + p + 1) % timetableStructure.periodsPerDay + 1;
            const timeSlot = timetableStructure.timeSlots.find((slot) => slot.period === period);
            if (timeSlot) {
              newTimetableEntries.push({
                classId,
                teacherId: assignment.assignedTeacherId,
                subjectId: subject.id,
                day,
                period,
                startTime: timeSlot.startTime,
                endTime: timeSlot.endTime,
                room: null,
                isActive: true
              });
              periodsAssigned++;
            }
          }
        }
      }
      if (newTimetableEntries.length > 0) {
        await storage.createMultipleTimetableEntries(newTimetableEntries);
      }
      console.log(`[REFRESH GLOBAL] Created ${newTimetableEntries.length} new global timetable entries`);
      const currentWeek = /* @__PURE__ */ new Date();
      const weekStart = new Date(currentWeek);
      weekStart.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
      const weeklyTimetableData = newTimetableEntries.map((entry) => ({
        day: entry.day,
        period: entry.period,
        teacherId: entry.teacherId,
        subjectId: entry.subjectId,
        startTime: entry.startTime,
        endTime: entry.endTime,
        room: entry.room,
        isModified: false,
        modificationReason: "Global timetable refresh"
      }));
      const existingWeekly = await storage.getWeeklyTimetable(classId, weekStart);
      if (existingWeekly) {
        await storage.updateWeeklyTimetable(existingWeekly.id, {
          timetableData: weeklyTimetableData,
          modifiedBy: user.id,
          modificationCount: 1,
          basedOnGlobalVersion: "latest-refresh"
        });
      } else {
        await storage.createWeeklyTimetable({
          classId,
          weekStart: weekStart.toISOString().split("T")[0],
          weekEnd: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
          timetableData: weeklyTimetableData,
          modifiedBy: user.id,
          modificationCount: 1,
          basedOnGlobalVersion: "latest-refresh",
          schoolId: classData.schoolId,
          isActive: true
        });
      }
      console.log(`[REFRESH GLOBAL] Copied global timetable to weekly for week ${weekStart.toISOString().split("T")[0]}`);
      res.json({
        success: true,
        message: "Global timetable refreshed and current/future weekly timetables updated successfully (past weeks preserved for history)",
        entriesCreated: newTimetableEntries.length,
        globalDeleted: deletionResult.globalDeleted,
        weeklyDeleted: deletionResult.weeklyDeleted,
        weekStart: weekStart.toISOString().split("T")[0]
      });
    } catch (error) {
      console.error("Error refreshing global timetable:", error);
      res.status(500).json({ message: "Failed to refresh global timetable" });
    }
  });
  app2.post("/api/timetable/set-weekly-as-global/:classId", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { classId } = req.params;
      const { date: date2 } = req.body;
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      if (user.role === "admin" && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const targetDate = date2 ? new Date(date2) : /* @__PURE__ */ new Date();
      const weekStart = new Date(targetDate);
      weekStart.setDate(targetDate.getDate() - targetDate.getDay() + 1);
      const weeklyTimetable = await storage.getWeeklyTimetable(classId, weekStart);
      if (!weeklyTimetable) {
        return res.status(404).json({ message: "No weekly timetable found for this week to promote" });
      }
      console.log(`[SET WEEKLY AS GLOBAL] Promoting weekly timetable for class ${classId}, week ${weekStart.toISOString().split("T")[0]} to global`);
      await storage.deactivateTimetableEntriesForClass(classId);
      if (weeklyTimetable.timetableData && Array.isArray(weeklyTimetable.timetableData)) {
        const newGlobalEntries = weeklyTimetable.timetableData.filter((entry) => entry.teacherId && entry.subjectId).map((entry) => ({
          classId,
          teacherId: entry.teacherId,
          subjectId: entry.subjectId,
          day: entry.day,
          period: entry.period,
          startTime: entry.startTime,
          endTime: entry.endTime,
          room: entry.room || null,
          isActive: true
        }));
        if (newGlobalEntries.length > 0) {
          await storage.createMultipleTimetableEntries(newGlobalEntries);
        }
        console.log(`[SET WEEKLY AS GLOBAL] Created ${newGlobalEntries.length} new global entries from weekly timetable`);
        await storage.updateWeeklyTimetable(weeklyTimetable.id, {
          basedOnGlobalVersion: "promoted-to-global",
          modificationCount: weeklyTimetable.modificationCount + 1
        });
        res.json({
          success: true,
          message: "Weekly timetable successfully promoted to global timetable",
          entriesPromoted: newGlobalEntries.length,
          weekStart: weekStart.toISOString().split("T")[0]
        });
      } else {
        res.status(400).json({ message: "Weekly timetable has no valid data to promote" });
      }
    } catch (error) {
      console.error("Error setting weekly as global:", error);
      res.status(500).json({ message: "Failed to set weekly timetable as global" });
    }
  });
  app2.post("/api/generate-sample-data", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (!user || user.role !== "super_admin" && user.role !== "admin") {
        return res.status(403).json({ error: "Insufficient permissions. Only admins can generate sample data." });
      }
      console.log(`\u{1F331} Sample data generation requested by: ${user.firstName} ${user.lastName} (${user.role})`);
      const { generateSampleStudentsAndParents: generateSampleStudentsAndParents2 } = await Promise.resolve().then(() => (init_seedSampleData(), seedSampleData_exports));
      const result = await generateSampleStudentsAndParents2();
      res.json({
        success: true,
        message: "Sample data generated successfully! Check console for login credentials.",
        data: {
          studentsCreated: result.students.length,
          parentsCreated: result.parents.length,
          school: result.school.name,
          classes: [
            `Grade ${result.classes.class5A.grade} Section ${result.classes.class5A.section}`,
            `Grade ${result.classes.class6B.grade} Section ${result.classes.class6B.section}`
          ]
        }
      });
    } catch (error) {
      console.error("\u274C Error generating sample data:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate sample data",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/chat/process", authenticateToken, processChatMessage);
  app2.use("/api", authenticateToken, downloadExcel_default);
  app2.post("/api/process-intent", authenticateToken, async (req, res) => {
    try {
      const intentRequestSchema = z5.object({
        intent: z5.string().min(1, "Intent cannot be empty"),
        entities: z5.record(z5.any()).default({})
      });
      const { intent, entities } = intentRequestSchema.parse(req.body);
      const user = req.user;
      if (!user || !user.schoolId) {
        return res.status(401).json({
          success: false,
          message: "You must be logged in to a school to use this service.",
          error: "UNAUTHORIZED"
        });
      }
      const userRole = user.role;
      const schoolId = user.schoolId;
      console.log(`[PROCESS-INTENT] Processing intent: ${intent} for user role: ${userRole}`);
      console.log(`[PROCESS-INTENT] Entities:`, entities);
      const result = await intentMapping_default.executeIntent(
        intent,
        entities,
        schoolId,
        userRole
      );
      return res.json({
        success: result.success,
        message: result.message,
        data: result.data,
        action: result.action,
        actionData: result.actionData
      });
    } catch (error) {
      console.error("[PROCESS-INTENT] Error processing intent:", error);
      if (error instanceof z5.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid request format. Please provide 'intent' as string and 'entities' as object.",
          error: "VALIDATION_ERROR",
          details: error.issues
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error while processing intent",
        error: "SERVER_ERROR"
      });
    }
  });
  app2.post("/api/exports", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const exportRequestSchema = z5.object({
        format: z5.enum(["json", "csv", "both"]).default("json"),
        privacyLevel: z5.enum(["safe", "full"]).default("safe"),
        tables: z5.array(z5.string()).optional(),
        schoolId: z5.string().optional()
      });
      const { format, privacyLevel, tables, schoolId } = exportRequestSchema.parse(req.body);
      if (user.role === "super_admin") {
        if (privacyLevel === "full" && !schoolId) {
          const confirmed = req.body.confirmed;
          if (!confirmed) {
            return res.status(400).json({
              message: "Full export of all schools requires confirmation. Add 'confirmed: true' to proceed.",
              warning: "This will include sensitive data from all schools."
            });
          }
        }
      } else if (["admin", "teacher"].includes(user.role)) {
        if (!user.schoolId) {
          return res.status(403).json({ message: "No school associated with your account" });
        }
        if (schoolId && schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Access denied: Can only export your own school data" });
        }
        if (privacyLevel === "full") {
          return res.status(403).json({ message: "Full privacy level requires super admin access" });
        }
      } else {
        return res.status(403).json({ message: "Export access denied for your role" });
      }
      const options = {
        schoolId: schoolId || user.schoolId,
        format,
        privacyLevel,
        tables,
        requestedBy: user.id,
        userRole: user.role
      };
      const jobId = await exportService.startExport(options);
      res.json({
        success: true,
        message: "Export job started successfully",
        jobId,
        status: "pending"
      });
    } catch (error) {
      console.error("Export start error:", error);
      if (error instanceof z5.ZodError) {
        return res.status(400).json({
          message: "Invalid export parameters",
          errors: error.issues
        });
      }
      res.status(500).json({
        message: "Failed to start export",
        error: error.message
      });
    }
  });
  app2.get("/api/exports/:jobId", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const jobId = req.params.jobId;
      const job = exportService.getJobStatus(jobId);
      if (!job) {
        return res.status(404).json({ message: "Export job not found" });
      }
      if (job.metadata.requestedBy !== user.id && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied to this export job" });
      }
      res.json({
        success: true,
        job: {
          id: job.id,
          status: job.status,
          progress: job.progress,
          createdAt: job.createdAt,
          completedAt: job.completedAt,
          error: job.error,
          metadata: {
            format: job.metadata.format,
            privacyLevel: job.metadata.privacyLevel,
            totalTables: job.metadata.totalTables,
            processedTables: job.metadata.processedTables,
            schoolId: job.metadata.schoolId
          }
        }
      });
    } catch (error) {
      console.error("Export status error:", error);
      res.status(500).json({
        message: "Failed to get export status",
        error: error.message
      });
    }
  });
  app2.get("/api/exports/:jobId/download", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const jobId = req.params.jobId;
      const job = exportService.getJobStatus(jobId);
      if (!job) {
        return res.status(404).json({ message: "Export job not found" });
      }
      if (job.status !== "completed") {
        return res.status(400).json({
          message: `Export not ready for download. Status: ${job.status}`,
          progress: job.progress
        });
      }
      if (job.metadata.requestedBy !== user.id && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied to this export job" });
      }
      const filePath = exportService.getExportFile(jobId);
      if (!filePath) {
        return res.status(404).json({ message: "Export file not found or expired" });
      }
      const schoolName = job.metadata.schoolId || "all_schools";
      const timestamp2 = job.createdAt.toISOString().split("T")[0];
      const filename = `chrona_export_${schoolName}_${timestamp2}.zip`;
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/zip");
      const fs4 = await import("fs");
      const fileStream = fs4.default.createReadStream(filePath);
      fileStream.on("error", (error) => {
        console.error("File stream error:", error);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error reading export file" });
        }
      });
      fileStream.pipe(res);
    } catch (error) {
      console.error("Export download error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          message: "Failed to download export",
          error: error.message
        });
      }
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 5e3,
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/api/")) {
      return next();
    }
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/bootstrap.ts
init_storage();
init_auth();
async function createSuperAdmin() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
  if (!superAdminEmail || !superAdminPassword) {
    console.log("\u26A0\uFE0F  Super Admin credentials not provided in environment variables");
    console.log("   Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD to create initial admin");
    return;
  }
  try {
    const existingAdmin = await storage.getUserByEmail(superAdminEmail);
    if (existingAdmin) {
      console.log("\u2705 Super Admin already exists");
      return;
    }
    const hashedPassword = await hashPassword(superAdminPassword);
    const superAdmin = await storage.createUser({
      email: superAdminEmail,
      loginId: superAdminEmail,
      // Use email as loginId for super admin
      passwordHash: hashedPassword,
      role: "super_admin",
      firstName: "Super",
      lastName: "Admin",
      schoolId: null,
      // Super admins don't belong to a specific school
      teacherId: null,
      studentId: null,
      parentId: null
    });
    console.log("\u{1F389} Super Admin created successfully!");
    console.log(`   Email: ${superAdmin.email}`);
    console.log("   You can now login with these credentials");
  } catch (error) {
    console.error("\u274C Failed to create Super Admin:", error);
  }
}

// server/index.ts
process.env.TZ = "Asia/Kolkata";
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await createSuperAdmin();
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
