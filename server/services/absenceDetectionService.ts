import { storage } from "../storage";
import type { InsertTimetableChange, InsertSubstitution, InsertAuditLog } from "@shared/schema";

interface AbsenceDetectionResult {
  teacherId: string;
  date: string;
  affectedClasses: Array<{
    timetableEntryId: string;
    className: string;
    subject: string;
    period: number;
    day: string;
    changeId?: string;
    substituteAssigned?: boolean;
    substituteTeacherId?: string;
  }>;
  totalChanges: number;
}

export class AbsenceDetectionService {
  /**
   * Automatically detect and handle teacher absence by creating timetable changes
   * and attempting to assign substitute teachers
   */
  static async handleTeacherAbsence(
    teacherId: string, 
    date: string, 
    reason: string,
    markedBy: string
  ): Promise<AbsenceDetectionResult> {
    console.log(`Processing automatic absence detection for teacher ${teacherId} on ${date} (WEEKLY TIMETABLE MODE)`);
    
    const result: AbsenceDetectionResult = {
      teacherId,
      date,
      affectedClasses: [],
      totalChanges: 0
    };

    try {
      // 1. Calculate week start for the absence date
      const absenceDate = new Date(date);
      const weekStart = new Date(absenceDate);
      weekStart.setDate(absenceDate.getDate() - absenceDate.getDay() + 1); // Monday
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      const dayOfWeek = absenceDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      console.log(`Processing absence for ${dayOfWeek}, week starting ${weekStartStr}`);

      // 2. Get teacher's school and find all classes they teach
      const teacher = await storage.getTeacher(teacherId);
      if (!teacher) {
        console.error(`Teacher ${teacherId} not found`);
        return result;
      }

      // Get all classes in the school
      const allClasses = await storage.getClasses(teacher.schoolId);
      
      // 3. Check each class for weekly timetable entries where this teacher is assigned
      for (const classData of allClasses) {
        try {
          // Get weekly timetable for this class and week
          const weeklyTimetable = await storage.getWeeklyTimetable(classData.id, new Date(weekStartStr));
          
          if (!weeklyTimetable) {
            // No weekly timetable exists, check global timetable
            const globalTimetable = await storage.getTimetableEntriesForClass(classData.id);
            const affectedPeriods = globalTimetable.filter(entry => 
              entry.teacherId === teacherId && 
              entry.day.toLowerCase() === dayOfWeek
            );
            
            if (affectedPeriods.length > 0) {
              // Create weekly timetable from global first
              const weeklyTimetableData = globalTimetable.map((entry: any) => ({
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
              
              // Now process the affected periods in the newly created weekly timetable
              await this.processAbsenceForClass(classData, affectedPeriods, weekStartStr, dayOfWeek, teacherId, reason, markedBy, result);
            }
          } else {
            // Weekly timetable exists, find affected periods
            const weeklyData = Array.isArray(weeklyTimetable.timetableData) 
              ? weeklyTimetable.timetableData 
              : JSON.parse(weeklyTimetable.timetableData);
              
            const affectedPeriods = weeklyData.filter((entry: any) => 
              entry.teacherId === teacherId && 
              entry.day.toLowerCase() === dayOfWeek
            );
            
            if (affectedPeriods.length > 0) {
              await this.processAbsenceForClass(classData, affectedPeriods, weekStartStr, dayOfWeek, teacherId, reason, markedBy, result);
            }
          }
        } catch (classError) {
          console.error(`Error processing class ${classData.id}:`, classError);
        }
      }

      // 5. Log the automatic detection activity
      try {
        await storage.createAuditLog({
          action: "auto_absence_detection",
          entityType: "teacher_attendance",
          entityId: teacherId,
          userId: markedBy,
          description: `Automatic absence detection: ${date}, ${reason}, ${result.affectedClasses.length} classes affected`,
          schoolId: (await storage.getTeacher(teacherId))?.schoolId || ""
        });
      } catch (auditError) {
        console.error("Error creating audit log for absence detection:", auditError);
      }

      console.log(`Absence detection completed: ${result.totalChanges} changes created, ${result.affectedClasses.filter(c => c.substituteAssigned).length} substitutes assigned`);

    } catch (error) {
      console.error("Error in automatic absence detection:", error);
      throw new Error(`Failed to process teacher absence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Process teacher absence for a specific class and update weekly timetable
   */
  private static async processAbsenceForClass(
    classData: any,
    affectedPeriods: any[],
    weekStartStr: string,
    dayOfWeek: string,
    teacherId: string,
    reason: string,
    markedBy: string,
    result: AbsenceDetectionResult
  ): Promise<void> {
    const weekEnd = new Date(weekStartStr);
    weekEnd.setDate(new Date(weekStartStr).getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    // Calculate the actual absence date (specific day, not Monday)
    const weekStartDate = new Date(weekStartStr);
    const dayMap: Record<string, number> = {
      'monday': 0, 'tuesday': 1, 'wednesday': 2,
      'thursday': 3, 'friday': 4, 'saturday': 5, 'sunday': 6
    };
    const actualAbsenceDate = new Date(weekStartDate);
    actualAbsenceDate.setDate(weekStartDate.getDate() + (dayMap[dayOfWeek.toLowerCase()] || 0));

    // Get all global timetable entries for this class to find corresponding IDs
    const globalTimetableEntries = await storage.getTimetableEntriesForClass(classData.id);

    for (const period of affectedPeriods) {
      try {
        // Find the corresponding global timetable entry ID
        const globalEntry = globalTimetableEntries.find(entry => 
          entry.day.toLowerCase() === period.day.toLowerCase() && 
          entry.period === period.period &&
          entry.subjectId === period.subjectId
        );

        if (!globalEntry) {
          console.error(`[WEEKLY ABSENCE] Could not find global timetable entry for ${classData.grade}-${classData.section} ${period.day} period ${period.period}`);
          continue;
        }

        // Find available substitute teachers for this period  
        const substitutes = await this.findAvailableSubstitutesForWeekly(
          classData.id,
          period.subjectId,
          teacherId,
          dayOfWeek,
          period.period,
          weekStartStr
        );

        let substituteAssigned = false;
        let substituteTeacherId: string | undefined;

        if (substitutes.length > 0) {
          // Create pending substitution instead of auto-assigning
          const substitute = substitutes[0];
          substituteTeacherId = substitute.id;

          // Create pending substitution record for admin approval
          await storage.createSubstitution({
            originalTeacherId: teacherId,
            substituteTeacherId: substitute.id,
            timetableEntryId: globalEntry.id,
            date: new Date(actualAbsenceDate.toISOString().split('T')[0] + 'T00:00:00Z'),
            reason: `Teacher absence: ${reason}. Suggested substitute: ${substitute.name}`,
            status: "pending", // Changed from "auto_assigned" to "pending"
            isAutoGenerated: true
          });

          substituteAssigned = false; // No longer auto-assigned, waiting for approval
          console.log(`[WEEKLY ABSENCE] Created pending substitution with ${substitute.name} for ${classData.grade}-${classData.section} period ${period.period} (awaiting approval)`);
        } else {
          // No substitute available - create pending substitution without suggested teacher
          await storage.createSubstitution({
            originalTeacherId: teacherId,
            substituteTeacherId: null, // No suggested substitute
            timetableEntryId: globalEntry.id,
            date: new Date(actualAbsenceDate.toISOString().split('T')[0] + 'T00:00:00Z'),
            reason: `Teacher absence: ${reason}. No substitute available - manual assignment required`,
            status: "pending",
            isAutoGenerated: true
          });
          
          console.log(`[WEEKLY ABSENCE] Created pending substitution (no suggested substitute) for ${classData.grade}-${classData.section} period ${period.period} - requires manual assignment`);
        }

        // Add to result
        result.affectedClasses.push({
          timetableEntryId: globalEntry.id, // Use the global timetable entry ID here too
          className: `${classData.grade}-${classData.section}`,
          subject: period.subjectId || 'Unknown Subject',
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
  private static async findAvailableSubstitutesForWeekly(
    classId: string,
    subjectId: string,
    originalTeacherId: string,
    dayOfWeek: string,
    period: number,
    weekStartStr: string
  ): Promise<Array<{ id: string; name: string; subjectCompatibility: boolean }>> {
    try {
      // Get class info to find school
      const classInfo = await storage.getClass(classId);
      if (!classInfo) return [];
      
      // Get all teachers from the same school
      const allTeachers = await storage.getTeachers(classInfo.schoolId);
      
      // Filter out the absent teacher
      const availableTeachers = allTeachers.filter(teacher => teacher.id !== originalTeacherId);

      const substitutes = [];

      for (const teacher of availableTeachers) {
        // Check if teacher is not absent on the same date
        const absenceDate = new Date(weekStartStr);
        const dayMap: Record<string, number> = {
          'monday': 0, 'tuesday': 1, 'wednesday': 2,
          'thursday': 3, 'friday': 4, 'saturday': 5, 'sunday': 6
        };
        absenceDate.setDate(absenceDate.getDate() + (dayMap[dayOfWeek.toLowerCase()] || 0));
        
        const isAbsent = await storage.isTeacherAbsent(teacher.id, absenceDate.toISOString().split('T')[0]);
        if (isAbsent) {
          continue;
        }

        // Check if teacher has conflicting periods in weekly timetables for the same week
        let hasConflict = false;
        
        try {
          // Get all classes to check for conflicts in weekly timetables
          const allSchoolClasses = await storage.getClasses(classInfo.schoolId);
          
          for (const otherClass of allSchoolClasses) {
            if (otherClass.id === classId) continue; // Skip the current class
            
            const otherWeeklyTimetable = await storage.getWeeklyTimetable(otherClass.id, new Date(weekStartStr));
            if (otherWeeklyTimetable) {
              const weeklyData = Array.isArray(otherWeeklyTimetable.timetableData) 
                ? otherWeeklyTimetable.timetableData 
                : JSON.parse(otherWeeklyTimetable.timetableData);
              
              const conflict = weeklyData.find((entry: any) => 
                entry.teacherId === teacher.id &&
                entry.day.toLowerCase() === dayOfWeek.toLowerCase() && 
                entry.period === period
              );
              
              if (conflict) {
                hasConflict = true;
                break;
              }
            } else {
              // No weekly timetable exists, check global timetable for this class
              const globalTimetable = await storage.getTimetableEntriesForClass(otherClass.id);
              const conflict = globalTimetable.find(entry => 
                entry.teacherId === teacher.id &&
                entry.day.toLowerCase() === dayOfWeek.toLowerCase() && 
                entry.period === period
              );
              
              if (conflict) {
                hasConflict = true;
                break;
              }
            }
          }
        } catch (conflictError) {
          console.error("Error checking teacher conflicts in weekly timetables:", conflictError);
          // Fallback to global timetable check
          const teacherTimetable = await storage.getTimetableForTeacher(teacher.id);
          hasConflict = teacherTimetable.some(entry => 
            entry.day.toLowerCase() === dayOfWeek.toLowerCase() && 
            entry.period === period
          );
        }

        if (hasConflict) {
          continue;
        }

        // Check subject compatibility 
        let subjectCompatibility = false;
        if (teacher.subjects) {
          let teacherSubjects: string[] = [];
          
          if (Array.isArray(teacher.subjects)) {
            teacherSubjects = teacher.subjects;
          } else if (typeof teacher.subjects === 'string') {
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

      // Sort by subject compatibility first, then by name
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
  private static async findAvailableSubstitutes(
    timetableEntryId: string,
    originalTeacherId: string,
    date: string,
    dayOfWeek: string,
    period: number
  ): Promise<Array<{ id: string; name: string; subjectCompatibility: boolean }>> {
    try {
      // Get the timetable entry details
      const timetableEntries = await storage.getTimetableEntries();
      const targetEntry = timetableEntries.find(entry => entry.id === timetableEntryId);
      
      if (!targetEntry) {
        return [];
      }

      // Get all teachers from the same school (fetch class info separately)
      const classInfo = await storage.getClass(targetEntry.classId);
      if (!classInfo) return [];
      
      const allTeachers = await storage.getTeachers(classInfo.schoolId);
      
      // Filter out the absent teacher
      const availableTeachers = allTeachers.filter(teacher => teacher.id !== originalTeacherId);

      const substitutes = [];

      for (const teacher of availableTeachers) {
        // Check if teacher is not absent on the same date
        const isAbsent = await storage.isTeacherAbsent(teacher.id, date);
        if (isAbsent) {
          continue;
        }

        // Check if teacher has conflicting periods on the same day
        const teacherTimetable = await storage.getTimetableForTeacher(teacher.id);
        const hasConflict = teacherTimetable.some(entry => 
          entry.day.toLowerCase() === dayOfWeek.toLowerCase() && 
          entry.period === period
        );

        if (hasConflict) {
          continue;
        }

        // Check subject compatibility (can the teacher teach this subject)
        const subjectCompatibility = (teacher as any).subjects?.some((subject: any) => 
          subject.id === targetEntry.subjectId
        ) || false;

        substitutes.push({
          id: teacher.id,
          name: teacher.name,
          subjectCompatibility
        });
      }

      // Sort by subject compatibility first, then by name
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
  static async handleTeacherReturn(
    teacherId: string,
    date: string,
    markedBy: string
  ): Promise<{ revertedChanges: number; message: string }> {
    console.log(`Processing teacher return for ${teacherId} on ${date}`);

    try {
      // Find all auto-generated changes for this teacher and date
      const allChanges = await storage.getTimetableChanges(
        (await storage.getTeacher(teacherId))?.schoolId || "",
        date
      );

      const autoChangesToRevert = allChanges.filter(change => 
        change.originalTeacherId === teacherId &&
        change.changeSource === "auto_absence" &&
        change.isActive &&
        !change.approvedBy // Only revert unapproved changes
      );

      let revertedCount = 0;

      for (const change of autoChangesToRevert) {
        // Deactivate the timetable change
        await storage.updateTimetableChange(change.id, {
          isActive: false,
          reason: `${change.reason} - Reverted: Teacher returned`
        });

        // If there was an auto-assigned substitution, remove it
        if (change.newTeacherId) {
          const substitutions = await storage.getSubstitutions();
          const relatedSubstitution = substitutions.find(sub => 
            sub.originalTeacherId === teacherId &&
            sub.timetableEntryId === change.timetableEntryId &&
            sub.date.toISOString().split('T')[0] === date &&
            sub.status === "auto_assigned"
          );

          if (relatedSubstitution) {
            await storage.deleteSubstitution(relatedSubstitution.id);
          }
        }

        revertedCount++;
      }

      // Log the return activity
      await storage.createAuditLog({
        action: "auto_teacher_return",
        entityType: "teacher_attendance",
        entityId: teacherId,
        userId: markedBy,
        description: `Teacher return: ${date}, ${revertedCount} changes reverted`,
        schoolId: (await storage.getTeacher(teacherId))?.schoolId || ""
      });

      const message = revertedCount > 0 
        ? `Teacher returned: ${revertedCount} automatic changes reverted`
        : "Teacher returned: No automatic changes to revert";

      console.log(message);

      return { revertedChanges: revertedCount, message };

    } catch (error) {
      console.error("Error handling teacher return:", error);
      throw new Error(`Failed to process teacher return: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}