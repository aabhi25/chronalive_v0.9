import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CalendarIcon, Users, UserCheck, UserX, Clock, CheckCircle2, Search, BarChart3, Download, AlertTriangle, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface Teacher {
  id: string;
  employeeId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  contactNumber?: string;
  schoolIdNumber?: string;
  subjects: string[];
  classes: string[];
  availability?: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
  };
  maxLoad?: number;
  maxDailyPeriods?: number;
  isActive?: boolean;
  status: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  rollNumber?: string;
  email?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  bloodGroup?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianContact?: string;
  emergencyContact?: string;
  medicalInfo?: string;
  status: string;
  class?: {
    id: string;
    name: string;
    grade: string;
    section: string;
  };
}

interface Class {
  id: string;
  name: string;
  grade: string;
  section: string;
  studentCount: number;
}

interface Subject {
  id: string;
  name: string;
  code?: string;
}

interface TeacherAttendance {
  id: string;
  teacherId: string;
  attendanceDate: string;
  status: "present" | "absent" | "late";
  reason?: string;
  markedAt: string;
  teacher?: Teacher;
}

interface StudentAttendance {
  id: string;
  studentId: string;
  classId: string;
  attendanceDate: string;
  status: "present" | "absent" | "late";
  reason?: string;
  markedAt: string;
  student?: Student;
}

interface AttendanceOverview {
  date: string;
  summary: {
    teachers: {
      total: number;
      present: number;
      absent: number;
      attendanceRate: number;
    };
    students: {
      total: number;
      present: number;
      absent: number;
      attendanceRate: number;
    };
  };
  classWiseAttendance: {
    classId: string;
    className: string;
    grade: string;
    section: string;
    totalStudents: number;
    presentStudents: number;
    attendanceRate: number;
  }[];
  alerts: {
    teachersAbsentConsecutive: {
      teacher: Teacher;
      consecutiveDays: number;
    }[];
    studentsLowAttendance: {
      student: Student;
      attendanceRate: number;
      totalDays: number;
      presentDays: number;
    }[];
  };
}

export default function AttendancePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  // Helper function to convert class IDs to class names
  const getClassNames = (classIds: string[]): string => {
    if (!classIds || classIds.length === 0) return 'None assigned';
    
    const classNames = classIds.map(classId => {
      const classInfo = classes.find(c => c.id === classId);
      if (classInfo) {
        return `Class ${classInfo.grade}${classInfo.section ? '-' + classInfo.section : ''}`;
      }
      return classId; // fallback to ID if class not found
    });
    
    return classNames.join(', ');
  };

  // Helper function to convert subject IDs to subject names
  const getSubjectNames = (subjectIds: string[]): string => {
    if (!subjectIds || subjectIds.length === 0) return 'None assigned';
    
    const subjectNames = subjectIds.map(subjectId => {
      const subjectInfo = subjects.find(s => s.id === subjectId);
      if (subjectInfo) {
        return subjectInfo.name;
      }
      return subjectId; // fallback to ID if subject not found
    });
    
    return subjectNames.join(', ');
  };

  // Fetch teachers
  const { data: teachers = [], isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
    enabled: user?.role === "admin" || user?.role === "super_admin",
  });

  // Fetch classes
  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
    enabled: user?.role === "admin" || user?.role === "super_admin",
  });

  // Fetch subjects
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
    enabled: user?.role === "admin" || user?.role === "super_admin",
  });

  // Fetch students for selected class
  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useQuery<Student[]>({
    queryKey: ["/api/students", selectedClass],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/students?classId=${selectedClass}`, { 
        headers,
        credentials: 'include' 
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!selectedClass && (user?.role === "admin" || user?.role === "super_admin"),
  });

  // Fetch teacher attendance
  const { data: teacherAttendance = [], isLoading: teacherAttendanceLoading } = useQuery<TeacherAttendance[]>({
    queryKey: ["/api/teacher-attendance", selectedDate],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/teacher-attendance?date=${selectedDate}`, { 
        headers,
        credentials: 'include' 
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch teacher attendance: ${response.status}`);
      }
      return response.json();
    },
    enabled: user?.role === "admin" || user?.role === "super_admin",
  });

  // Fetch student attendance for selected class
  const { data: studentAttendance = [], isLoading: studentAttendanceLoading, error: studentAttendanceError } = useQuery<StudentAttendance[]>({
    queryKey: ["/api/student-attendance", selectedClass, selectedDate],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/student-attendance?classId=${selectedClass}&date=${selectedDate}`, { 
        headers,
        credentials: 'include' 
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch student attendance: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!selectedClass && (user?.role === "admin" || user?.role === "super_admin"),
  });

  // Fetch attendance overview
  const { data: attendanceOverview, isLoading: overviewLoading } = useQuery<AttendanceOverview>({
    queryKey: ["/api/attendance/overview", selectedDate],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/attendance/overview?date=${selectedDate}`, { 
        headers,
        credentials: 'include' 
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch attendance overview: ${response.status}`);
      }
      return response.json();
    },
    enabled: user?.role === "admin" || user?.role === "super_admin",
  });

  // Mark teacher attendance mutation
  const markTeacherAttendanceMutation = useMutation({
    mutationFn: async (data: { teacherId: string; status: string; reason?: string }) => {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/teacher-attendance", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          teacherId: data.teacherId,
          attendanceDate: selectedDate,
          status: data.status,
          reason: data.reason,
          // Removed schoolId - backend uses user's schoolId for security
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to mark teacher attendance");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher-attendance"] });
      toast({
        title: "Success",
        description: "Teacher attendance marked successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark teacher attendance",
        variant: "destructive",
      });
      console.error("Error marking teacher attendance:", error);
    },
  });

  // Mark student attendance mutation
  const markStudentAttendanceMutation = useMutation({
    mutationFn: async (data: { studentId: string; status: string; reason?: string }) => {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/student-attendance", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          studentId: data.studentId,
          classId: selectedClass,
          attendanceDate: selectedDate,
          status: data.status,
          reason: data.reason,
          // Removed schoolId - backend uses user's schoolId for security
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to mark student attendance");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student-attendance"] });
      toast({
        title: "Success",
        description: "Student attendance marked successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark student attendance",
        variant: "destructive",
      });
      console.error("Error marking student attendance:", error);
    },
  });

  // Bulk mark all teachers present mutation
  const markAllTeachersPresentMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/teacher-attendance/mark-all-present", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          date: selectedDate,
          // Removed schoolId - backend uses user's schoolId for security
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to mark all teachers present");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher-attendance"] });
      toast({
        title: "Success",
        description: `${data.message}. Created: ${data.createdCount}, Skipped existing: ${data.skippedExistingCount}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark all teachers present",
        variant: "destructive",
      });
      console.error("Error marking all teachers present:", error);
    },
  });

  // Bulk mark all students in class present mutation
  const markAllStudentsPresentMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/student-attendance/mark-all-present", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          date: selectedDate,
          classId: selectedClass,
          // Removed schoolId - backend uses user's schoolId for security
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to mark all students present");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/student-attendance"] });
      toast({
        title: "Success",
        description: `${data.message}. Created: ${data.createdCount}, Skipped existing: ${data.skippedExistingCount}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark all students present",
        variant: "destructive",
      });
      console.error("Error marking all students present:", error);
    },
  });

  const handleTeacherAttendance = (teacherId: string, status: "present" | "absent" | "late") => {
    markTeacherAttendanceMutation.mutate({ teacherId, status });
  };

  const handleStudentAttendance = (studentId: string, status: "present" | "absent" | "late") => {
    markStudentAttendanceMutation.mutate({ studentId, status });
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "present":
        return (
          <div className="flex items-center gap-2 px-2 py-1 bg-green-50 dark:bg-green-950 rounded-full border border-green-200 dark:border-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700 dark:text-green-300">Present</span>
          </div>
        );
      case "absent":
        return (
          <div className="flex items-center gap-2 px-2 py-1 bg-red-50 dark:bg-red-950 rounded-full border border-red-200 dark:border-red-800">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-red-700 dark:text-red-300">Absent</span>
          </div>
        );
      case "late":
        return (
          <div className="flex items-center gap-2 px-2 py-1 bg-yellow-50 dark:bg-yellow-950 rounded-full border border-yellow-200 dark:border-yellow-800">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-yellow-700 dark:text-yellow-300">Late</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 dark:bg-gray-950 rounded-full border border-gray-200 dark:border-gray-800">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Not Marked</span>
          </div>
        );
    }
  };

  const getAttendanceRecord = (personId: string, attendanceList: any[]) => {
    if (!Array.isArray(attendanceList)) {
      return undefined;
    }
    return attendanceList.find(record => 
      record.teacherId === personId || record.studentId === personId
    );
  };

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter((teacher) => {
    const searchLower = teacherSearchTerm.toLowerCase();
    const teacherName = teacher.name || `${teacher.firstName || ''} ${teacher.lastName || ''}`;
    
    // Get class names for this teacher
    const teacherClassNames = getClassNames(teacher.classes).toLowerCase();
    
    return (
      teacherName.toLowerCase().includes(searchLower) ||
      (teacher.employeeId && teacher.employeeId.toLowerCase().includes(searchLower)) ||
      (teacher.schoolIdNumber && teacher.schoolIdNumber.toLowerCase().includes(searchLower)) ||
      teacherClassNames.includes(searchLower)
    );
  });

  // Filter students based on search term
  const filteredStudents = students.filter((student) => {
    const searchLower = studentSearchTerm.toLowerCase();
    const studentName = `${student.firstName} ${student.lastName}`;
    return (
      studentName.toLowerCase().includes(searchLower) ||
      student.admissionNumber.toLowerCase().includes(searchLower) ||
      (student.rollNumber && student.rollNumber.toLowerCase().includes(searchLower))
    );
  });

  if (user?.role !== "admin" && user?.role !== "super_admin") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
          <p className="text-muted-foreground">
            Mark and manage attendance for teachers and students
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm"
              data-testid="input-attendance-date"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" data-testid="tab-overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="teachers" data-testid="tab-teachers">
            Teachers Attendance
          </TabsTrigger>
          <TabsTrigger value="students" data-testid="tab-students">
            Students Attendance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {overviewLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : attendanceOverview ? (
            <>
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Teachers</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-2xl font-bold">{attendanceOverview.summary.teachers.total}</p>
                          <Badge variant="secondary">{attendanceOverview.summary.teachers.attendanceRate}%</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Present: {attendanceOverview.summary.teachers.present}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Absent: {attendanceOverview.summary.teachers.absent}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Users className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-2xl font-bold">{attendanceOverview.summary.students.total}</p>
                          <Badge variant="secondary">{attendanceOverview.summary.students.attendanceRate}%</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Present: {attendanceOverview.summary.students.present}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Absent: {attendanceOverview.summary.students.absent}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Teacher Attendance</p>
                        <p className="text-2xl font-bold">{attendanceOverview.summary.teachers.attendanceRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Student Attendance</p>
                        <p className="text-2xl font-bold">{attendanceOverview.summary.students.attendanceRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Class-wise Attendance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Class-wise Attendance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {attendanceOverview.classWiseAttendance.map((classData) => (
                      <div key={classData.classId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                              {classData.grade}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{classData.className}</p>
                            <p className="text-sm text-muted-foreground">
                              {classData.presentStudents}/{classData.totalStudents} students present
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                classData.attendanceRate >= 90 ? 'bg-green-500' :
                                classData.attendanceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${classData.attendanceRate}%` }}
                            ></div>
                          </div>
                          <Badge 
                            variant={
                              classData.attendanceRate >= 90 ? 'default' :
                              classData.attendanceRate >= 75 ? 'secondary' : 'destructive'
                            }
                          >
                            {classData.attendanceRate}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notable Alerts */}
              {(attendanceOverview.alerts.teachersAbsentConsecutive.length > 0 || 
                attendanceOverview.alerts.studentsLowAttendance.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span>Notable Alerts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Teachers Absent Consecutively */}
                    {attendanceOverview.alerts.teachersAbsentConsecutive.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-600 mb-2 flex items-center space-x-2">
                          <UserX className="h-4 w-4" />
                          <span>Teachers Absent 3+ Consecutive Days</span>
                        </h4>
                        <div className="space-y-2">
                          {attendanceOverview.alerts.teachersAbsentConsecutive.map((alert) => (
                            <div key={alert.teacher.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                              <div>
                                <p className="font-medium">{alert.teacher.name}</p>
                                <p className="text-sm text-muted-foreground">ID: {alert.teacher.employeeId}</p>
                              </div>
                              <Badge variant="destructive">
                                {alert.consecutiveDays} consecutive days
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Students with Low Attendance */}
                    {attendanceOverview.alerts.studentsLowAttendance.length > 0 && (
                      <div>
                        <h4 className="font-medium text-orange-600 mb-2 flex items-center space-x-2">
                          <UserX className="h-4 w-4" />
                          <span>Students with Low Attendance (&lt;75%)</span>
                        </h4>
                        <div className="space-y-2">
                          {attendanceOverview.alerts.studentsLowAttendance.map((alert) => (
                            <div key={alert.student.id} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded">
                              <div>
                                <p className="font-medium">{alert.student.firstName} {alert.student.lastName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {alert.student.class?.name} • {alert.presentDays}/{alert.totalDays} days present
                                </p>
                              </div>
                              <Badge variant="destructive">
                                {alert.attendanceRate}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="h-5 w-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Export Teacher Attendance</span>
                    </Button>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Export Student Attendance</span>
                    </Button>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Generate Monthly Report</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  No attendance data available for {format(new Date(selectedDate), "MMMM d, yyyy")}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Teachers Attendance - {format(new Date(selectedDate), "MMMM d, yyyy")}</span>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={markAllTeachersPresentMutation.isPending || teachers.length === 0}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      data-testid="button-mark-all-teachers-present"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {markAllTeachersPresentMutation.isPending ? "Marking..." : "Mark All Present"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Mark All Teachers Present</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to mark all {teachers.length} teachers as present for {format(new Date(selectedDate), "MMMM d, yyyy")}? 
                        This will only mark teachers who don't already have attendance recorded for this date.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => markAllTeachersPresentMutation.mutate()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark All Present
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search input for teachers */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search teachers by name, school ID, or class taught..."
                    value={teacherSearchTerm}
                    onChange={(e) => setTeacherSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    data-testid="search-teachers"
                  />
                </div>
                {teacherSearchTerm && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Showing {filteredTeachers.length} of {teachers.length} teachers
                  </p>
                )}
              </div>
              {teachersLoading || teacherAttendanceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTeachers.map((teacher: Teacher) => {
                    const attendanceRecord = getAttendanceRecord(teacher.id, teacherAttendance);
                    
                    return (
                      <div
                        key={teacher.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`teacher-attendance-${teacher.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <h3 className="font-medium text-blue-600 cursor-pointer hover:text-blue-800 hover:underline"
                                    data-testid={`teacher-name-${teacher.id}`}>
                                  {teacher.name || `${teacher.firstName} ${teacher.lastName}`}
                                </h3>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Teacher Details - {teacher.name || `${teacher.firstName} ${teacher.lastName}`}</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Personal Information</h4>
                                    <p><strong>Name:</strong> {teacher.name || `${teacher.firstName} ${teacher.lastName}`}</p>
                                    <p><strong>School ID Number:</strong> {teacher.schoolIdNumber || 'Not assigned'}</p>
                                    <p><strong>Status:</strong> {teacher.status}</p>
                                    <p><strong>Active:</strong> {teacher.isActive ? 'Yes' : 'No'}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Contact Information</h4>
                                    <p><strong>Email:</strong> {teacher.email || 'Not provided'}</p>
                                    <p><strong>Contact Number:</strong> {teacher.contactNumber || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Teaching Assignment</h4>
                                    <p><strong>Subjects:</strong> {getSubjectNames(teacher.subjects)}</p>
                                    <p><strong>Classes:</strong> {getClassNames(teacher.classes)}</p>
                                    <p><strong>Max Load:</strong> {teacher.maxLoad || 'Not specified'} periods per week</p>
                                    <p><strong>Max Daily Periods:</strong> {teacher.maxDailyPeriods || 'Not specified'}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Availability</h4>
                                    {teacher.availability ? (
                                      <div className="text-sm">
                                        {Object.entries(teacher.availability).map(([day, periods]) => (
                                          <p key={day}>
                                            <strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</strong> {Array.isArray(periods) && periods.length > 0 ? periods.join(', ') : 'Not available'}
                                          </p>
                                        ))}
                                      </div>
                                    ) : (
                                      <p>No availability information</p>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <p className="text-sm text-muted-foreground">
                              School ID: {teacher.schoolIdNumber || 'Not assigned'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Classes: {getClassNames(teacher.classes)}
                            </p>
                            <div className="mt-2">
                              {attendanceRecord ? (
                                getStatusDisplay(attendanceRecord.status)
                              ) : (
                                getStatusDisplay("not_marked")
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Select 
                            value={attendanceRecord?.status || ""} 
                            onValueChange={(value) => handleTeacherAttendance(teacher.id, value as "present" | "absent" | "late")}
                            disabled={markTeacherAttendanceMutation.isPending}
                          >
                            <SelectTrigger className="w-40" data-testid={`select-teacher-status-${teacher.id}`}>
                              <SelectValue placeholder="Mark attendance" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">
                                <div className="flex items-center gap-2">
                                  <UserCheck className="h-4 w-4 text-green-600" />
                                  Present
                                </div>
                              </SelectItem>
                              <SelectItem value="absent">
                                <div className="flex items-center gap-2">
                                  <UserX className="h-4 w-4 text-red-600" />
                                  Absent
                                </div>
                              </SelectItem>
                              <SelectItem value="late">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-yellow-600" />
                                  Late
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredTeachers.length === 0 && teachers.length > 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No teachers found matching "{teacherSearchTerm}"
                    </div>
                  )}
                  
                  {teachers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No teachers found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Students Attendance - {format(new Date(selectedDate), "MMMM d, yyyy")}</span>
                </div>
                {selectedClass && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={markAllStudentsPresentMutation.isPending || !selectedClass || students.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        data-testid="button-mark-all-students-present"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {markAllStudentsPresentMutation.isPending ? "Marking..." : "Mark All Present"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Mark All Students Present</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to mark all {students.length} students in the selected class as present for {format(new Date(selectedDate), "MMMM d, yyyy")}? 
                          This will only mark students who don't already have attendance recorded for this date.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => markAllStudentsPresentMutation.mutate()}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark All Present
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardTitle>
              <div className="flex items-center space-x-4">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-64" data-testid="select-class">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes
                      .sort((a, b) => {
                        // Sort by grade first (numerically)
                        const gradeComparison = parseInt(a.grade) - parseInt(b.grade);
                        if (gradeComparison !== 0) return gradeComparison;
                        
                        // Then by section (alphabetically, with empty sections first)
                        if (!a.section && !b.section) return 0;
                        if (!a.section) return -1;
                        if (!b.section) return 1;
                        return a.section.localeCompare(b.section);
                      })
                      .map((cls: Class) => {
                        // Format class name - remove dash if no section
                        const displayName = cls.section 
                          ? `Grade ${cls.grade} - ${cls.section}`
                          : `Grade ${cls.grade}`;
                        
                        return (
                          <SelectItem key={cls.id} value={cls.id}>
                            {displayName}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search input for students */}
              {selectedClass && (
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search students by name, admission number, or roll number..."
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      data-testid="search-students"
                    />
                  </div>
                  {studentSearchTerm && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Showing {filteredStudents.length} of {students.length} students
                    </p>
                  )}
                </div>
              )}

              {!selectedClass ? (
                <div className="text-center py-8 text-muted-foreground">
                  Please select a class to view student attendance
                </div>
              ) : studentsLoading || studentAttendanceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : studentsError ? (
                <div className="text-center py-8 text-red-600">
                  <p>Error loading students: {studentsError?.message || 'Unable to fetch students'}</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(filteredStudents) && filteredStudents.map((student: Student) => {
                    const attendanceRecord = getAttendanceRecord(student.id, studentAttendance);
                    
                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`student-attendance-${student.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <h3 className="font-medium text-blue-600 cursor-pointer hover:text-blue-800 hover:underline"
                                    data-testid={`student-name-${student.id}`}>
                                  {student.firstName} {student.lastName}
                                </h3>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Student Details - {student.firstName} {student.lastName}</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Personal Information</h4>
                                    <p><strong>Name:</strong> {student.firstName} {student.lastName}</p>
                                    <p><strong>Admission Number:</strong> {student.admissionNumber}</p>
                                    <p><strong>Roll Number:</strong> {student.rollNumber || 'Not assigned'}</p>
                                    <p><strong>Gender:</strong> {student.gender || 'Not specified'}</p>
                                    <p><strong>Date of Birth:</strong> {student.dateOfBirth || 'Not specified'}</p>
                                    <p><strong>Blood Group:</strong> {student.bloodGroup || 'Not specified'}</p>
                                    <p><strong>Status:</strong> {student.status}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Contact Information</h4>
                                    <p><strong>Email:</strong> {student.email || 'Not provided'}</p>
                                    <p><strong>Contact Number:</strong> {student.contactNumber || 'Not provided'}</p>
                                    <p><strong>Address:</strong> {student.address || 'Not provided'}</p>
                                    <p><strong>Emergency Contact:</strong> {student.emergencyContact || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Guardian Information</h4>
                                    <p><strong>Guardian Name:</strong> {student.guardianName || 'Not provided'}</p>
                                    <p><strong>Relation:</strong> {student.guardianRelation || 'Not specified'}</p>
                                    <p><strong>Guardian Contact:</strong> {student.guardianContact || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Medical Information</h4>
                                    <p><strong>Medical Info:</strong> {student.medicalInfo || 'None specified'}</p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <p className="text-sm text-muted-foreground">
                              Admission No: {student.admissionNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Roll No: {student.rollNumber || 'Not assigned'}
                            </p>
                            <div className="mt-2">
                              {attendanceRecord ? (
                                getStatusDisplay(attendanceRecord.status)
                              ) : (
                                getStatusDisplay("not_marked")
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Select 
                            value={attendanceRecord?.status || ""} 
                            onValueChange={(value) => handleStudentAttendance(student.id, value as "present" | "absent" | "late")}
                            disabled={markStudentAttendanceMutation.isPending}
                          >
                            <SelectTrigger className="w-40" data-testid={`select-student-status-${student.id}`}>
                              <SelectValue placeholder="Mark attendance" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">
                                <div className="flex items-center gap-2">
                                  <UserCheck className="h-4 w-4 text-green-600" />
                                  Present
                                </div>
                              </SelectItem>
                              <SelectItem value="absent">
                                <div className="flex items-center gap-2">
                                  <UserX className="h-4 w-4 text-red-600" />
                                  Absent
                                </div>
                              </SelectItem>
                              <SelectItem value="late">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-yellow-600" />
                                  Late
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredStudents.length === 0 && students.length > 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No students found matching "{studentSearchTerm}"
                    </div>
                  )}
                  
                  {(!students || students.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No students found in the selected class
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}