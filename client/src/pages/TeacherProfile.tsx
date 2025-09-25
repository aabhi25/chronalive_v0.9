import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ImageLightbox } from "@/components/ImageLightbox";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, User, Mail, Phone, IdCard, Calendar as CalendarIcon,
  BookOpen, Users, CheckCircle, XCircle, CalendarDays, Clock,
  FileText, TrendingUp, Activity, UserX, AlertTriangle,
  MapPin, Heart, UserCheck, CreditCard, ChevronLeft, ChevronRight
} from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";
import { getCurrentDateIST, formatDateIST } from "@shared/utils/dateUtils";

interface Teacher {
  id: string;
  name: string;
  email: string;
  contactNumber?: string;
  schoolIdNumber?: string;
  profilePictureUrl?: string;
  isActive: boolean;
  status?: 'active' | 'left_school' | 'on_leave';
  subjects: string[];
  classes: string[];
  maxDailyPeriods: number;
  // Additional personal information fields
  designation?: string;
  gender?: string;
  dateOfBirth?: string;
  fatherHusbandName?: string;
  address?: string;
  aadhar?: string;
  bloodGroup?: string;
  category?: string;
  religion?: string;
}

interface TeacherAttendance {
  id: string;
  teacherId: string;
  attendanceDate: string; // Fixed: API returns attendanceDate, not date
  status: "present" | "absent" | "sick_leave" | "personal_leave" | "medical_leave" | "late";
  reason?: string;
  leaveStartDate?: string;
  leaveEndDate?: string;
}

interface TimetableEntry {
  id: string;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  classId: string;
  subject?: { name: string; code: string };
  class?: { grade: string; section: string };
}

interface ClassData {
  id: string;
  grade: string;
  section: string;
  studentCount: number;
}

interface SubjectData {
  id: string;
  name: string;
  code: string;
}

export default function TeacherProfile() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/teacher/:id");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [selectedReplacement, setSelectedReplacement] = useState<string>('');
  const [replacingTeacher, setReplacingTeacher] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string>('');
  const teacherId = params?.id;

  if (!match || !teacherId) {
    setLocation("/teachers");
    return null;
  }

  // Fetch teacher details
  const { data: teacher, isLoading: teacherLoading } = useQuery<Teacher>({
    queryKey: ["/api/teachers", teacherId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/teachers/${teacherId}`);
      return response.json() as Promise<Teacher>;
    },
  });

  // Fetch all classes to map teacher's classes
  const { data: allClasses = [] } = useQuery<ClassData[]>({
    queryKey: ["/api/classes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/classes");
      return response.json() as Promise<ClassData[]>;
    },
  });

  // Fetch all subjects to map teacher's subjects
  const { data: allSubjects = [] } = useQuery<SubjectData[]>({
    queryKey: ["/api/subjects"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/subjects");
      return response.json() as Promise<SubjectData[]>;
    },
  });

  // Fetch teacher's schedule
  const { data: schedule = [] } = useQuery<TimetableEntry[]>({
    queryKey: ["/api/teachers", teacherId, "schedule"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/teachers/${teacherId}/schedule`);
      return response.json() as Promise<TimetableEntry[]>;
    },
    enabled: !!teacherId,
  });

  // Fetch teacher's attendance for selected month
  const { data: attendance = [], refetch: refetchAttendance } = useQuery<TeacherAttendance[]>({
    queryKey: ["/api/teacher-attendance", teacherId, format(selectedDate, "yyyy-MM")],
    queryFn: async () => {
      const startDate = format(startOfMonth(selectedDate), "yyyy-MM-dd");
      const endDate = format(endOfMonth(selectedDate), "yyyy-MM-dd");
      const response = await apiRequest("GET", `/api/teacher-attendance?teacherId=${teacherId}&startDate=${startDate}&endDate=${endDate}`);
      return response.json() as Promise<TeacherAttendance[]>;
    },
    enabled: !!teacherId,
    staleTime: 30000, // Cache data for 30 seconds
    refetchInterval: 60000, // Refetch every minute for updates
  });

  // Fetch available teachers for replacement
  const { data: availableTeachers = [], refetch: refetchAvailableTeachers } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers/available-for-replacement", teacherId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/teachers/available-for-replacement/${teacherId}`);
      return response.json() as Promise<Teacher[]>;
    },
    enabled: !!teacherId && replaceDialogOpen,
  });

  // Get teacher's classes and subjects details
  const teacherClasses = teacher?.classes?.map(classId => 
    allClasses.find(c => c.id === classId)
  ).filter(Boolean) || [];

  const teacherSubjects = teacher?.subjects?.map(subjectId => 
    allSubjects.find(s => s.id === subjectId)
  ).filter(Boolean) || [];

  // Calculate attendance statistics
  const presentDays = attendance.filter(a => a.status === "present").length;
  const absentDays = attendance.filter(a => a.status === "absent").length;
  const leaveDays = attendance.filter(a => a.status === "sick_leave" || a.status === "personal_leave" || a.status === "medical_leave").length;
  const totalRecords = attendance.length;
  const attendancePercentage = totalRecords > 0 ? Math.round((presentDays / totalRecords) * 100) : 100;

  // Group schedule by day
  const scheduleByDay = schedule.reduce((acc, entry) => {
    if (!acc[entry.day]) acc[entry.day] = [];
    acc[entry.day].push(entry);
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge variant="default" className="bg-green-100 text-green-800">Present</Badge>;
      case "absent":
        return <Badge variant="destructive">Absent</Badge>;
      case "sick_leave":
      case "personal_leave":
      case "medical_leave":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">On Leave</Badge>;
      case "late":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Late</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleReplaceTeacher = async () => {
    if (!selectedReplacement || !teacherId) return;

    setReplacingTeacher(true);
    setConflictWarning('');

    try {
      const response = await apiRequest("POST", "/api/teachers/replace", {
        originalTeacherId: teacherId,
        replacementTeacherId: selectedReplacement,
        reason: "Teacher replacement through profile"
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.conflicts && errorData.conflicts.length > 0) {
          setConflictWarning(`Warning: ${errorData.conflicts.length} scheduling conflicts detected.`);
          return;
        }
        throw new Error(errorData.message || "Failed to replace teacher");
      }

      const result = await response.json();
      setReplaceDialogOpen(false);
      setSelectedReplacement('');
      
      // Refresh teacher data
      window.location.reload();
    } catch (error) {
      console.error("Error replacing teacher:", error);
      setConflictWarning(error instanceof Error ? error.message : "Failed to replace teacher");
    } finally {
      setReplacingTeacher(false);
    }
  };

  const getTeacherStatusBadge = (teacher: Teacher) => {
    if (teacher.status === 'left_school') {
      return <Badge variant="destructive" className="ml-2">Left School</Badge>;
    } else if (teacher.status === 'on_leave') {
      return <Badge variant="secondary" className="ml-2">On Leave</Badge>;
    } else if (!teacher.isActive) {
      return <Badge variant="outline" className="ml-2">Inactive</Badge>;
    }
    return <Badge variant="default" className="ml-2 bg-green-100 text-green-800">Active</Badge>;
  };

  // Generate calendar days for the selected month
  const generateCalendarDays = (selectedMonth: Date) => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday = 0
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });
  };

  // Precompute attendance lookup for performance
  const attendanceMap = useMemo(() => {
    const map = new Map<string, TeacherAttendance>();
    attendance.forEach(record => {
      const dateKey = format(new Date(record.attendanceDate), 'yyyy-MM-dd');
      map.set(dateKey, record);
    });
    return map;
  }, [attendance]);

  // Get attendance status for a specific date
  const getAttendanceForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return attendanceMap.get(dateKey);
  };

  // Get readable status text for tooltips
  const getStatusDisplayText = (status: string | undefined) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Late';
      case 'sick_leave':
      case 'personal_leave':
      case 'medical_leave':
        return 'On Leave';
      default:
        return 'Not Marked';
    }
  };

  // Get status display for calendar day
  const getDayStatusDisplay = (date: Date) => {
    const attendanceRecord = getAttendanceForDate(date);
    const isCurrentMonth = isSameMonth(date, selectedDate);
    const dayNumber = format(date, 'd');

    if (!isCurrentMonth) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm rounded">
          {dayNumber}
        </div>
      );
    }

    let statusColor = '';
    
    if (!attendanceRecord) {
      statusColor = 'bg-white border-2 border-dashed border-gray-300 text-gray-900';
    } else {
      switch (attendanceRecord.status) {
        case 'present':
          statusColor = 'bg-green-100 text-green-900 border border-green-200';
          break;
        case 'absent':
          statusColor = 'bg-red-100 text-red-900 border border-red-200';
          break;
        case 'sick_leave':
        case 'personal_leave':
        case 'medical_leave':
          statusColor = 'bg-orange-100 text-orange-900 border border-orange-200';
          break;
        case 'late':
          statusColor = 'bg-yellow-100 text-yellow-900 border border-yellow-200';
          break;
        default:
          statusColor = 'bg-gray-100 text-gray-900 border border-gray-200';
      }
    }

    return (
      <div className={`absolute inset-0 flex items-center justify-center text-sm font-medium rounded ${statusColor}`}>
        {dayNumber}
      </div>
    );
  };

  if (teacherLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Teacher Not Found</h2>
          <p className="text-gray-600 mt-2">The requested teacher profile could not be found.</p>
          <Button onClick={() => setLocation("/teachers")} className="mt-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/teachers")}
            className="h-11 w-11 p-0 hover:bg-gray-100"
            aria-label="Back to Teachers"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
          <div className="flex items-center space-x-4">
            {/* Profile Picture */}
            <div className="relative">
              {teacher.profilePictureUrl ? (
                <div 
                  className="relative cursor-pointer" 
                  onClick={() => setIsPhotoModalOpen(true)}
                  title="Click to view full image"
                >
                  <img
                    src={teacher.profilePictureUrl}
                    alt={`${teacher.name}'s profile`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 hover:border-blue-300 transition-colors"
                    onError={(e) => {
                      // Hide failed image and show fallback
                      (e.target as HTMLImageElement).style.display = 'none';
                      const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallbackDiv) fallbackDiv.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center absolute top-0 left-0"
                    style={{ display: 'none' }}
                  >
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Teacher Name and Details */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{teacher.name}</h1>
              <p className="text-gray-500 text-sm">Teacher Profile & Details</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getTeacherStatusBadge(teacher)}
          
          {/* Replace Teacher Button */}
          <Dialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                className="flex items-center space-x-2"
                onClick={() => {
                  setSelectedReplacement('');
                  setConflictWarning('');
                  refetchAvailableTeachers();
                }}
              >
                <UserX className="h-4 w-4" />
                <span>Replace Teacher</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <UserX className="h-5 w-5 text-red-600" />
                  <span>Replace Teacher</span>
                </DialogTitle>
                <DialogDescription>
                  Select a replacement teacher for {teacher.name}. This will transfer all their timetable assignments.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Replacement Teacher</label>
                  <Select value={selectedReplacement} onValueChange={setSelectedReplacement}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a replacement teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{teacher.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({teacher.email})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {conflictWarning && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      {conflictWarning}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReplaceDialogOpen(false);
                      setSelectedReplacement('');
                      setConflictWarning('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReplaceTeacher}
                    disabled={!selectedReplacement || replacingTeacher}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {replacingTeacher ? "Replacing..." : "Replace Teacher"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Left Column: Personal Information */}
        <div className="lg:col-span-1 xl:col-span-1 space-y-6">
          {/* Personal Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* School ID */}
              <div className="flex items-start space-x-3">
                <IdCard className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">School ID</p>
                  <p className="text-sm text-muted-foreground">{teacher.schoolIdNumber || 'Not Assigned'}</p>
                </div>
              </div>

              {/* Designation */}
              <div className="flex items-start space-x-3">
                <UserCheck className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Designation</p>
                  <p className="text-sm text-muted-foreground">{teacher.designation || 'Not Specified'}</p>
                </div>
              </div>

              {/* Gender */}
              <div className="flex items-start space-x-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Gender</p>
                  <p className="text-sm text-muted-foreground">{teacher.gender ? teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1) : 'Not Specified'}</p>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="flex items-start space-x-3">
                <CalendarIcon className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Date of Birth</p>
                  <p className="text-sm text-muted-foreground">
                    {teacher.dateOfBirth ? format(new Date(teacher.dateOfBirth), 'dd-MM-yyyy') : 'Not Provided'}
                  </p>
                </div>
              </div>

              {/* Father/Husband Name */}
              <div className="flex items-start space-x-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Father/Husband Name</p>
                  <p className="text-sm text-muted-foreground">{teacher.fatherHusbandName || 'Not Provided'}</p>
                </div>
              </div>

              {/* Contact Number */}
              <div className="flex items-start space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Contact Number</p>
                  <p className="text-sm text-muted-foreground">{teacher.contactNumber || 'Not Provided'}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground break-words">{teacher.email || 'Not Provided'}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground break-words">{teacher.address || 'Not Provided'}</p>
                </div>
              </div>

              {/* Aadhaar Number */}
              <div className="flex items-start space-x-3">
                <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Aadhaar Number</p>
                  <p className="text-sm text-muted-foreground">
                    {teacher.aadhar ? `****-****-${teacher.aadhar.slice(-4)}` : 'Not Provided'}
                  </p>
                </div>
              </div>

              {/* Blood Group */}
              <div className="flex items-start space-x-3">
                <Heart className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Blood Group</p>
                  <p className="text-sm text-muted-foreground">{teacher.bloodGroup || 'Not Specified'}</p>
                </div>
              </div>

              {/* Category */}
              <div className="flex items-start space-x-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">{teacher.category ? teacher.category.toUpperCase() : 'Not Specified'}</p>
                </div>
              </div>

              {/* Religion */}
              <div className="flex items-start space-x-3">
                <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Religion</p>
                  <p className="text-sm text-muted-foreground">{teacher.religion || 'Not Specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Attendance Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-green-600">{attendancePercentage}%</div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-lg font-semibold text-green-600">{presentDays}</div>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="text-lg font-semibold text-red-600">{absentDays}</div>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <CalendarDays className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="text-lg font-semibold text-orange-600">{leaveDays}</div>
                  <p className="text-xs text-muted-foreground">On Leave</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column: Classes and Subjects */}
        <div className="lg:col-span-1 xl:col-span-1 space-y-6">
          {/* Classes Taught */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Classes Taught</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teacherClasses.length > 0 ? (
                <div className="space-y-3">
                  {teacherClasses.map((classData) => (
                    <div key={classData?.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">Class {classData?.grade}{classData?.section}</div>
                        <div className="text-sm text-muted-foreground">{classData?.studentCount} students</div>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No classes assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Subjects Taught */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Subjects Taught</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teacherSubjects.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {teacherSubjects.map((subject) => (
                    <div key={subject?.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium">{subject?.name}</div>
                        <div className="text-sm text-muted-foreground">Code: {subject?.code}</div>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Subject</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No subjects assigned</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Schedule and Attendance History */}
        <div className="lg:col-span-2 xl:col-span-1 space-y-6">
          {/* Weekly Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Weekly Schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(scheduleByDay).length > 0 ? (
                <div className="space-y-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(day => (
                    <div key={day}>
                      <div className="font-medium text-sm capitalize mb-2">{day}</div>
                      <div className="space-y-1">
                        {scheduleByDay[day]?.map((entry) => (
                          <div key={entry.id} className="text-xs p-2 bg-muted/30 rounded flex justify-between">
                            <span>Period {entry.period}</span>
                            <span>{entry.subject?.name || 'Subject'}</span>
                          </div>
                        )) || (
                          <div className="text-xs text-muted-foreground p-2">No classes</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No schedule available</p>
              )}
            </CardContent>
          </Card>

          {/* Attendance History with Full Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Attendance History</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
                      disabled={selectedDate <= new Date(2023, 0, 1)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium px-3 py-1 min-w-[80px] text-center">
                      {format(selectedDate, "MMM yyyy")}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
                      disabled={selectedDate >= new Date()}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Calendar Header - Day names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {generateCalendarDays(selectedDate).map((date, index) => {
                    const attendanceRecord = getAttendanceForDate(date);
                    const statusText = getStatusDisplayText(attendanceRecord?.status);
                    const dateText = format(date, 'd MMM');
                    const isCurrentMonth = isSameMonth(date, selectedDate);
                    
                    return (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <div className="w-full h-12 relative cursor-pointer">
                            {getDayStatusDisplay(date)}
                          </div>
                        </TooltipTrigger>
                        {isCurrentMonth && (
                          <TooltipContent side="top" className="text-xs">
                            <div className="font-medium">{dateText}</div>
                            <div className="text-gray-600">{statusText}</div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="mt-4 pt-4 border-t">
                  <div className="text-xs font-medium text-gray-600 mb-2">Legend:</div>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                      <span>Present</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                      <span>Absent</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
                      <span>Late</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
                      <span>Leave</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-white border-2 border-dashed border-gray-300 rounded"></div>
                      <span>Not Marked</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Photo Modal */}
      {teacher.profilePictureUrl && (
        <ImageLightbox
          images={[teacher.profilePictureUrl]}
          isOpen={isPhotoModalOpen}
          currentIndex={0}
          onClose={() => setIsPhotoModalOpen(false)}
          onIndexChange={() => {}} // Single image, no navigation needed
        />
      )}
    </div>
  );
}