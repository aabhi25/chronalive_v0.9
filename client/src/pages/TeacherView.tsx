import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTeacherSchema, insertTeacherAttendanceSchema, bulkAttendanceSchema, type Teacher, type TimetableEntry, type TeacherAttendance } from "@shared/schema";
import { getCurrentDateIST, formatDateIST } from "@shared/utils/dateUtils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, User, Users, Mail, Phone, IdCard, Calendar, CalendarDays, Clock, CheckCircle, XCircle, BookOpen, AlertTriangle, TrendingUp, Settings, Camera, Download, ChevronDown, Upload } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { z } from "zod";
import * as XLSX from 'xlsx';

const formSchema = insertTeacherSchema.extend({
  name: z.string().min(1, "Teacher name is required"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  contactNumber: z.string().min(1, "Mobile number is required"),
  schoolIdNumber: z.string().optional(),
  
  // New fields from the redesign - all optional
  aadhar: z.string().length(12, "Aadhaar number must be exactly 12 digits").regex(/^\d{12}$/, "Aadhaar number must contain only digits").optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  bloodGroup: z.string().optional(),
  designation: z.string().optional(),
  dateOfBirth: z.string().optional(),
  fatherHusbandName: z.string().optional(),
  address: z.string().optional(),
  category: z.string().optional(),
  religion: z.string().optional(),
  profilePictureUrl: z.string().optional(),
  
  classes: z.array(z.string()).optional().default([]),
  subjects: z.array(z.string()).optional().default([]),
}).omit({ availability: true, maxLoad: true, employeeId: true });

// Additional interfaces for Teacher Schedule functionality
interface WorkloadAnalytics {
  teachers: Array<{
    teacherId: string;
    teacherName: string;
    weeklyPeriods: number;
    avgDailyPeriods: number;
    maxDailyPeriods: number;
    maxAllowedDaily: number;
    isOverloaded: boolean;
    dailyBreakdown: Record<string, number>;
  }>;
  summary: {
    totalTeachers: number;
    overloadedTeachers: number;
    avgWeeklyPeriods: number;
  };
}

type TeacherFormData = z.infer<typeof formSchema>;

export default function TeacherView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  // Initialize active tab based on URL parameter
  const getInitialTab = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'leave') return 'leave';
    if (tabParam === 'schedule') return 'schedule';
    return 'teachers';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [isBulkAttendanceOpen, setIsBulkAttendanceOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getCurrentDateIST());
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all");
  
  // Teacher Schedule tab state variables
  const [selectedScheduleTeacher, setSelectedScheduleTeacher] = useState<string>('');
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'schedule' | 'analytics' | 'availability'>('schedule');
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [configMaxPeriods, setConfigMaxPeriods] = useState<number>(6);
  const [applyToAll, setApplyToAll] = useState<boolean>(false);

  // Check URL parameters to set active tab when location changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'leave') {
      setActiveTab('leave');
    } else if (tabParam === 'schedule') {
      setActiveTab('schedule');
    } else {
      setActiveTab('teachers');
    }
  }, [location]);

  const addForm = useForm<TeacherFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      contactNumber: "",
      schoolIdNumber: "",
      aadhar: "",
      gender: "male",
      bloodGroup: "",
      designation: "",
      dateOfBirth: "",
      fatherHusbandName: "",
      address: "",
      category: "",
      religion: "",
      profilePictureUrl: "",
      schoolId: user?.schoolId || "",
      isActive: true,
      classes: [],
      subjects: [],
    },
  });

  const editForm = useForm<TeacherFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      contactNumber: "",
      schoolIdNumber: "",
      aadhar: "",
      gender: "male",
      bloodGroup: "",
      designation: "",
      dateOfBirth: "",
      fatherHusbandName: "",
      address: "",
      category: "",
      religion: "",
      profilePictureUrl: "",
      schoolId: user?.schoolId || "",
      isActive: true,
      classes: [],
      subjects: [],
    },
  });

  const bulkAttendanceForm = useForm({
    resolver: zodResolver(bulkAttendanceSchema),
    defaultValues: {
      teacherId: "",
      status: "absent" as const,
      reason: "",
      startDate: getCurrentDateIST(),
      endDate: getCurrentDateIST(),
      isFullDay: true,
    },
  });

  // Force refresh of class-subject assignments when component mounts
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/class-subject-assignments"] });
  }, []);

  // Helper function to get subjects for selected classes
  const getSubjectsForClasses = (selectedClassIds: string[]) => {
    const relevantAssignments = classSubjectAssignments.filter((assignment: any) => 
      selectedClassIds.includes(assignment.classId)
    );
    
    // Group subjects by grade level to avoid duplicates across sections
    const subjectGradeMap = new Map<string, any>();
    
    relevantAssignments.forEach((assignment: any) => {
      const subject = subjects.find((s: any) => s.id === assignment.subjectId);
      const classData = classes.find((c: any) => c.id === assignment.classId);
      
      if (subject && classData) {
        const gradeSubjectKey = `${classData.grade}-${assignment.subjectId}`;
        
        if (!subjectGradeMap.has(gradeSubjectKey)) {
          subjectGradeMap.set(gradeSubjectKey, {
            id: assignment.subjectId,
            name: subject.name,
            grade: classData.grade,
            subjectName: subject.name,
            displayName: `Class ${classData.grade} - ${subject.name}`
          });
        }
      }
    });
    
    // Convert map to array and sort by grade then by subject name
    return Array.from(subjectGradeMap.values()).sort((a: any, b: any) => {
      // First sort by grade (using numeric comparison)
      const gradeComparison = a.grade.localeCompare(b.grade, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
      });
      
      // If grades are the same, sort by subject name
      if (gradeComparison === 0) {
        return a.subjectName.localeCompare(b.subjectName);
      }
      
      return gradeComparison;
    });
  };

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["/api/teachers", user?.schoolId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/teachers?schoolId=${user?.schoolId}`);
      return response.json() as Promise<Teacher[]>;
    },
    enabled: !!user?.schoolId,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/subjects");
      return response.json();
    },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["/api/classes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/classes");
      return response.json();
    },
  });

  const { data: classSubjectAssignments = [] } = useQuery({
    queryKey: ["/api/class-subject-assignments"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/class-subject-assignments");
      return response.json();
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache this data
  });

  const { data: timetableStructure } = useQuery({
    queryKey: ["/api/timetable-structure"],
    enabled: !!user?.schoolId,
  });

  // Query for timetable entries
  const { data: timetableEntries = [], isLoading: isTimetableLoading } = useQuery({
    queryKey: ["/api/timetable/detailed"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/timetable/detailed");
      return response.json() as Promise<TimetableEntry[]>;
    },
    enabled: activeTab === "timetable",
  });

  // Query for teacher attendance
  const { data: attendanceData = [] } = useQuery({
    queryKey: ["/api/teacher-attendance", user?.schoolId, selectedDate],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/teacher-attendance?date=${selectedDate}`);
      return response.json() as Promise<TeacherAttendance[]>;
    },
    enabled: !!user?.schoolId && activeTab === "attendance",
  });

  // Query for all teachers on leave (with date ranges)
  const { data: allTeachersOnLeave = [] } = useQuery({
    queryKey: ["/api/teacher-attendance/all-leave", user?.schoolId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/teacher-attendance`);
      const allAttendance = await response.json() as TeacherAttendance[];
      
      // Filter for leave records and group by teacher with date ranges
      const leaveRecords = allAttendance.filter(att => 
        att.status !== "present" && att.leaveStartDate && att.leaveEndDate
      );
      
      // Group by teacher and get unique leave periods
      const leaveByTeacher = new Map<string, {
        teacherId: string;
        teacherName: string;
        periods: Array<{
          startDate: string; 
          endDate: string; 
          reason?: string; 
          status: string;
          isActive: boolean;
        }>;
      }>();
      
      const today = getCurrentDateIST();
      
      leaveRecords.forEach(record => {
        const teacher = teachers.find(t => t.id === record.teacherId);
        if (!teacher) return;
        
        if (!leaveByTeacher.has(record.teacherId)) {
          leaveByTeacher.set(record.teacherId, {
            teacherId: record.teacherId,
            teacherName: teacher.name,
            periods: []
          });
        }
        
        const existing = leaveByTeacher.get(record.teacherId)!;
        const periodExists = existing.periods.some(p => 
          p.startDate === record.leaveStartDate && p.endDate === record.leaveEndDate
        );
        
        if (!periodExists && record.leaveStartDate && record.leaveEndDate) {
          const isActive = record.leaveStartDate <= today && today <= record.leaveEndDate;
          existing.periods.push({
            startDate: record.leaveStartDate,
            endDate: record.leaveEndDate,
            reason: record.reason || undefined,
            status: record.status,
            isActive
          });
        }
      });
      
      // Sort periods by start date (most recent first)
      leaveByTeacher.forEach(data => {
        data.periods.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      });
      
      return Array.from(leaveByTeacher.values());
    },
    enabled: !!user?.schoolId && (activeTab === "attendance" || activeTab === "leave") && teachers.length > 0,
  });

  // Teacher Schedule queries
  const { data: schedule = [], isLoading: scheduleLoading } = useQuery({
    queryKey: ['teacher-schedule', selectedScheduleTeacher, selectedScheduleDate],
    queryFn: async (): Promise<TimetableEntry[]> => {
      if (!selectedScheduleTeacher) return [];
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/teachers/${selectedScheduleTeacher}/schedule?date=${selectedScheduleDate}`, {
        headers
      });
      if (!response.ok) throw new Error('Failed to fetch schedule');
      const data = await response.json();
      
      return data;
    },
    enabled: !!selectedScheduleTeacher && activeTab === 'schedule'
  });

  // Workload analytics query
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['teacher-workload-analytics'],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/analytics/teacher-workload', {
        headers
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: activeTab === 'schedule'
  });

  // Free teachers query
  const { data: freeTeachersData, isLoading: freeTeachersLoading } = useQuery({
    queryKey: ['free-teachers-today', selectedScheduleDate],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/availability/free-teachers?date=${selectedScheduleDate}`, {
        headers
      });
      if (!response.ok) throw new Error('Failed to fetch free teachers');
      return response.json();
    },
    enabled: viewMode === 'availability' && activeTab === 'schedule'
  });

  // Absent teacher alerts query
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['absent-teacher-alerts', selectedScheduleDate],
    queryFn: async (): Promise<any[]> => {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/substitutions/alerts?date=${selectedScheduleDate}`, {
        headers
      });
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    },
    enabled: activeTab === 'schedule'
  });

  // Filter for currently active leave periods
  const currentlyOnLeave = allTeachersOnLeave.filter(teacher => 
    teacher.periods.some(period => period.isActive)
  );

  const createTeacherMutation = useMutation({
    mutationFn: async (data: TeacherFormData) => {
      // Prepare backend data with classes included
      const response = await apiRequest("POST", "/api/teachers", { 
        ...data,
        schoolId: user?.schoolId,
        availability: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: []
        },
        maxLoad: 30
      });
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      // Don't close dialog or reset form here since we handle it in handleAddTeacher
      // after potential profile picture upload
      if (!selectedProfileImage) {
        // Only show success and reset if there's no profile picture to upload
        setIsAddDialogOpen(false);
        setSelectedProfileImage(null);
        setProfileImagePreview(null);
        addForm.reset({
          name: "",
          email: "",
          contactNumber: "",
          schoolIdNumber: "",
          schoolId: user?.schoolId || "",
          isActive: true,
          classes: [],
          subjects: [],
          aadhar: "",
          gender: undefined,
          bloodGroup: "",
          designation: "",
          dateOfBirth: "",
          fatherHusbandName: "",
          address: "",
          category: "",
          religion: "",
          profilePictureUrl: "",
        });
        toast({
          title: "Success",
          description: "Teacher added successfully",
        });
      }
      return result;
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add teacher",
        variant: "destructive",
      });
    },
  });

  const updateTeacherMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TeacherFormData }) => {
      // Prepare backend data with classes included
      const response = await apiRequest("PUT", `/api/teachers/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      setEditingTeacher(null);
      // Clear image state when edit is completed
      setSelectedProfileImage(null);
      setProfileImagePreview(null);
      editForm.reset({
        name: "",
        email: "",
        contactNumber: "",
        schoolIdNumber: "",
        schoolId: user?.schoolId || "",
        isActive: true,
        classes: [],
        subjects: [],
        aadhar: "",
        gender: undefined,
        bloodGroup: "",
        designation: "",
        dateOfBirth: "",
        fatherHusbandName: "",
        address: "",
        category: "",
        religion: "",
        profilePictureUrl: "",
      });
      toast({
        title: "Success",
        description: "Teacher updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update teacher",
        variant: "destructive",
      });
    },
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/teachers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete teacher",
        variant: "destructive",
      });
    },
  });

  // Attendance mutations
  const markAttendanceMutation = useMutation({
    mutationFn: async ({ teacherId, status }: { teacherId: string; status: string }) => {
      const response = await apiRequest("POST", "/api/teacher-attendance", {
        teacherId,
        schoolId: user?.schoolId,
        attendanceDate: selectedDate,
        status,
        isFullDay: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher-attendance"] });
      // Immediately refresh timetable changes to show substitutions
      queryClient.invalidateQueries({ queryKey: ["timetable-changes"] });
      queryClient.refetchQueries({ queryKey: ["timetable-changes"] });
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark attendance",
        variant: "destructive",
      });
    },
  });

  const bulkAttendanceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/teacher-attendance/bulk", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher-attendance"] });
      // Immediately refresh timetable changes to show substitutions
      queryClient.invalidateQueries({ queryKey: ["timetable-changes"] });
      queryClient.refetchQueries({ queryKey: ["timetable-changes"] });
      setIsBulkAttendanceOpen(false);
      bulkAttendanceForm.reset();
      toast({
        title: "Success",
        description: "Bulk attendance marked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark bulk attendance",
        variant: "destructive",
      });
    },
  });

  // Update daily periods mutation for schedule tab
  const updateDailyPeriodsMutation = useMutation({
    mutationFn: async (data: { teacherId?: string; maxDailyPeriods: number; applyToAll: boolean }) => {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/teachers/daily-periods', {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update daily periods');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-workload-analytics'] });
      setShowConfig(false);
      setApplyToAll(false);
      toast({
        title: "Success",
        description: "Daily periods updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update daily periods",
        variant: "destructive",
      });
    },
  });

  const handleProfileImageSelect = (file: File) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error", 
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedProfileImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadProfilePicture = async (teacherId: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const token = localStorage.getItem("authToken");
    const response = await fetch(`/api/teachers/${teacherId}/upload-profile-picture`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload profile picture');
    }
    
    const result = await response.json();
    return result.profilePictureUrl;
  };

  const clearImageState = () => {
    setSelectedProfileImage(null);
    setProfileImagePreview(null);
    // Reset the file input
    const fileInput = document.getElementById('profile-image-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleAddTeacher = async (data: TeacherFormData) => {
    try {
      // First create the teacher
      const teacherResult = await createTeacherMutation.mutateAsync(data);
      
      // If there's a profile image, upload it
      if (selectedProfileImage && teacherResult.id) {
        try {
          const profilePictureUrl = await uploadProfilePicture(teacherResult.id, selectedProfileImage);
          
          // Update the teacher with the profile picture URL
          await updateTeacherMutation.mutateAsync({
            id: teacherResult.id,
            data: { ...data, profilePictureUrl }
          });
          
          toast({
            title: "Success",
            description: "Teacher and profile picture added successfully",
          });
        } catch (uploadError) {
          console.error("Profile picture upload failed:", uploadError);
          toast({
            title: "Warning",
            description: "Teacher created but profile picture upload failed",
            variant: "destructive",
          });
        }
        
        // Clean up after profile picture upload (success or failure)
        setIsAddDialogOpen(false);
        clearImageState();
        addForm.reset({
          name: "",
          email: "",
          contactNumber: "",
          schoolIdNumber: "",
          schoolId: user?.schoolId || "",
          isActive: true,
          classes: [],
          subjects: [],
          aadhar: "",
          gender: undefined,
          bloodGroup: "",
          designation: "",
          dateOfBirth: "",
          fatherHusbandName: "",
          address: "",
          category: "",
          religion: "",
          profilePictureUrl: "",
        });
      }
      // If no profile image, the createTeacherMutation onSuccess will handle cleanup
    } catch (error) {
      console.error("Error adding teacher:", error);
      // The createTeacherMutation will handle the error toast
    }
  };

  const handleEditTeacher = async (data: TeacherFormData) => {
    if (!editingTeacher) return;

    try {
      // If a new profile image is selected, upload it first
      if (selectedProfileImage) {
        const profilePictureUrl = await uploadProfilePicture(editingTeacher.id, selectedProfileImage);
        
        // Update teacher with the new profile picture URL
        updateTeacherMutation.mutate({ 
          id: editingTeacher.id, 
          data: { ...data, profilePictureUrl }
        });
      } else {
        // No new profile picture, just update with existing data
        updateTeacherMutation.mutate({ id: editingTeacher.id, data });
      }
    } catch (error) {
      console.error("Profile picture upload failed:", error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTeacher = (id: string) => {
    deleteTeacherMutation.mutate(id);
  };

  const handleExportTeachers = () => {
    try {
      // Filter teachers using the same logic as the display
      const filteredTeachers = teachers.filter((teacher) => {
        // Apply search term filter
        let matchesSearch = true;
        if (teacherSearchTerm) {
          const searchTerm = teacherSearchTerm.toLowerCase();
          matchesSearch = false;
          
          // Search by name
          if (teacher.name.toLowerCase().includes(searchTerm)) matchesSearch = true;
          
          // Search by school ID (employee ID)
          if (teacher.schoolIdNumber && teacher.schoolIdNumber.toLowerCase().includes(searchTerm)) matchesSearch = true;
          
          // Search by classes taught
          const teacherClasses = (teacher.classes || [])
            .map((classId: string) => {
              const classData = classes.find((c: any) => c.id === classId);
              if (!classData) return null;
              const hasSection = classData.section && classData.section.trim() !== '' && classData.section !== '-';
              return hasSection 
                ? `Class ${classData.grade}-${classData.section}`
                : `Class ${classData.grade}`;
            })
            .filter(Boolean);
          
          if (teacherClasses.some((className) => className && className.toLowerCase().includes(searchTerm))) matchesSearch = true;
        }
        
        // Apply class filter
        let matchesClass = true;
        if (selectedClassFilter !== "all") {
          matchesClass = (teacher.classes || []).includes(selectedClassFilter);
        }
        
        return matchesSearch && matchesClass;
      });

      // Format data according to specified column order
      const exportData = filteredTeachers.map((teacher) => {
        // Get subjects
        const teacherSubjects = (teacher.subjects || [])
          .map(subjectId => subjects.find((s: any) => s.id === subjectId)?.name)
          .filter(Boolean)
          .join(', ') || 'Not assigned';

        // Get classes
        const teacherClasses = (teacher.classes || [])
          .map((classId: string) => {
            const classData = classes.find((c: any) => c.id === classId);
            if (!classData) return null;
            const hasSection = classData.section && classData.section.trim() !== '' && classData.section !== '-';
            return hasSection 
              ? `Class ${classData.grade}-${classData.section}`
              : `Class ${classData.grade}`;
          })
          .filter(Boolean)
          .join(', ') || 'Not assigned';

        return {
          'School ID': teacher.schoolIdNumber || 'Not provided',
          'Name': teacher.name,
          'Designation': teacher.designation || 'Not provided',
          'Gender': teacher.gender || 'Not provided',
          'Date of Birth': teacher.dateOfBirth || 'Not provided',
          'Father/Husband Name': teacher.fatherHusbandName || 'Not provided',
          'Contact Number': teacher.contactNumber || 'Not provided',
          'Email': teacher.email || 'Not provided',
          'Address': teacher.address || 'Not provided',
          'Aadhaar Number': teacher.aadhar || 'Not provided',
          'Blood Group': teacher.bloodGroup || 'Not provided',
          'Category': teacher.category || 'Not provided',
          'Religion': teacher.religion || 'Not provided',
          'Classes Taught': teacherClasses,
          'Subjects Taught': teacherSubjects
        };
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      const columnWidths: any[] = [];
      
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
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers');

      // Generate filename based on filters
      let filename = 'teachers_export';
      if (selectedClassFilter !== 'all') {
        const selectedClass = classes.find((c: any) => c.id === selectedClassFilter);
        if (selectedClass) {
          const hasSection = selectedClass.section && selectedClass.section.trim() !== '' && selectedClass.section !== '-';
          const className = hasSection 
            ? `class_${selectedClass.grade}_${selectedClass.section}`
            : `class_${selectedClass.grade}`;
          filename = `teachers_${className}`;
        }
      }
      if (teacherSearchTerm) {
        filename += `_search_${teacherSearchTerm.replace(/[^a-zA-Z0-9]/g, '_')}`;
      }
      filename += `_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, filename);

      toast({
        title: "Export Successful",
        description: `Exported ${filteredTeachers.length} teacher${filteredTeachers.length !== 1 ? 's' : ''} to Excel`,
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export teacher data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    
    editForm.reset({
      name: teacher.name,
      email: teacher.email ?? "",
      contactNumber: teacher.contactNumber ?? "",
      schoolIdNumber: teacher.schoolIdNumber ?? "",
      schoolId: teacher.schoolId,
      isActive: teacher.isActive,
      classes: teacher.classes || [],
      subjects: teacher.subjects || [],
      aadhar: teacher.aadhar ?? "",
      gender: teacher.gender || undefined,
      bloodGroup: teacher.bloodGroup ?? "",
      designation: teacher.designation ?? "",
      dateOfBirth: teacher.dateOfBirth ?? "",
      fatherHusbandName: teacher.fatherHusbandName ?? "",
      address: teacher.address ?? "",
      category: teacher.category ?? "",
      religion: teacher.religion ?? "",
      profilePictureUrl: teacher.profilePictureUrl ?? "",
    });
  };

  // Attendance handlers
  const handleMarkAttendance = (teacherId: string, status: string) => {
    markAttendanceMutation.mutate({ teacherId, status });
  };

  const handleBulkAttendance = (data: any) => {
    bulkAttendanceMutation.mutate(data);
  };

  // Check if selected date is an active school day
  const selectedDayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const isActiveDay = (timetableStructure as any)?.workingDays?.includes(selectedDayName) || false;

  // Get attendance status for a teacher (only on active days)
  const getTeacherAttendanceStatus = (teacherId: string) => {
    // Only calculate attendance for active days
    if (!isActiveDay) return "not_applicable";
    
    const attendance = attendanceData.find(
      (att) => att.teacherId === teacherId && att.attendanceDate === selectedDate
    );
    return attendance?.status || "present";
  };

  if (!user?.schoolId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You need to be associated with a school to manage teachers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 md:h-8 md:w-8" />
            Teachers
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage teachers, timetables, and attendance
          </p>
        </div>
        <SearchBar className="w-full md:w-64" />
      </div>

      {/* Tabbed Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-12 md:h-10">
          <TabsTrigger value="teachers" className="flex items-center gap-1 md:gap-2 px-1 md:px-3 text-xs md:text-sm">
            <User className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Teachers</span>
            <span className="sm:hidden">Staff</span>
          </TabsTrigger>
          <TabsTrigger value="leave" className="flex items-center gap-1 md:gap-2 px-1 md:px-3 text-xs md:text-sm">
            <CalendarDays className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Teachers on Leave</span>
            <span className="sm:hidden">Leave</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-1 md:gap-2 px-1 md:px-3 text-xs md:text-sm">
            <Calendar className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Teacher Schedule</span>
            <span className="sm:hidden">Schedule</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teachers" className="space-y-4">
          {/* Search, Filter and Add Teacher Controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex-1 min-w-0 sm:max-w-md">
                <Input
                  placeholder="Search teachers by name, school ID, or class taught..."
                  value={teacherSearchTerm}
                  onChange={(e) => setTeacherSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-48">
                <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((classItem: any) => {
                      const hasSection = classItem.section && classItem.section.trim() !== '' && classItem.section !== '-';
                      const displayName = hasSection 
                        ? `Class ${classItem.grade}-${classItem.section}`
                        : `Class ${classItem.grade}`;
                      return (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {displayName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                onClick={handleExportTeachers}
                variant="outline" 
                className="flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex-1 sm:flex-none">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Teacher
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsAddDialogOpen(true)}>
                    <User className="h-4 w-4 mr-2" />
                    Add Single Teacher
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation('/teachers/bulk-upload')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Add Multiple Teachers
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              // Clear image state when dialog is closed
              setSelectedProfileImage(null);
              setProfileImagePreview(null);
            }
          }}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Create Teacher
                </DialogTitle>
                <DialogDescription>
                  Add a new teacher with complete information
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAddTeacher)} className="space-y-6">
                  
                  {/* Profile Picture Upload Section */}
                  <div className="flex flex-col items-center space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="relative w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border overflow-hidden">
                      {profileImagePreview ? (
                        <>
                          <img 
                            src={profileImagePreview} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover rounded-full"
                          />
                          <button
                            type="button"
                            onClick={clearImageState}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <User className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleProfileImageSelect(file);
                          }
                        }}
                        className="hidden"
                        id="profile-image-input"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('profile-image-input')?.click()}
                      >
                        Upload Image
                      </Button>
                      <span className="text-sm text-gray-500">or</span>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('profile-image-input')?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    {selectedProfileImage && (
                      <p className="text-sm text-green-600">
                        Selected: {selectedProfileImage.name}
                      </p>
                    )}
                  </div>

                  {/* Basic Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <FormField
                      control={addForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Aadhaar */}
                    <FormField
                      control={addForm.control}
                      name="aadhar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aadhaar</FormLabel>
                          <FormControl>
                            <Input placeholder="12-digit Aadhaar number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Mobile Number */}
                    <FormField
                      control={addForm.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter mobile number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Gender */}
                    <FormField
                      control={addForm.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Blood Group */}
                    <FormField
                      control={addForm.control}
                      name="bloodGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Blood Group</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Designation */}
                    <FormField
                      control={addForm.control}
                      name="designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Designation</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Senior Teacher" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date of Birth */}
                    <FormField
                      control={addForm.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Father / Husband Name */}
                    <FormField
                      control={addForm.control}
                      name="fatherHusbandName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Father / Husband Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter father/husband name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Category */}
                    <FormField
                      control={addForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="obc">OBC</SelectItem>
                              <SelectItem value="sc">SC</SelectItem>
                              <SelectItem value="st">ST</SelectItem>
                              <SelectItem value="ews">EWS</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Religion */}
                    <FormField
                      control={addForm.control}
                      name="religion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Religion</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hindu">Hindu</SelectItem>
                              <SelectItem value="muslim">Muslim</SelectItem>
                              <SelectItem value="christian">Christian</SelectItem>
                              <SelectItem value="sikh">Sikh</SelectItem>
                              <SelectItem value="buddhist">Buddhist</SelectItem>
                              <SelectItem value="jain">Jain</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Address */}
                  <FormField
                    control={addForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter complete address" 
                            className="min-h-[80px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email (Optional) */}
                  <FormField
                    control={addForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="teacher@school.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Classes and Subjects Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Teaching Assignments</h3>
                    
                    <FormField
                    control={addForm.control}
                    name="classes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Classes Taught</FormLabel>
                        <FormControl>
                          <Select
                            value=""
                            onValueChange={(value) => {
                              if (value && !field.value.includes(value)) {
                                field.onChange([...field.value, value]);
                                // Clear subjects when classes change
                                addForm.setValue("subjects", []);
                              }
                            }}
                          >
                            <SelectTrigger data-testid="select-add-classes">
                              <SelectValue placeholder="Add classes..." />
                            </SelectTrigger>
                            <SelectContent>
                              {classes
                                .filter((classData: any) => !field.value.includes(classData.id))
                                .sort((a: any, b: any) => {
                                  const aDisplay = a.section && a.section.trim() !== '' && a.section !== '-' 
                                    ? `${a.grade}-${a.section}` 
                                    : a.grade;
                                  const bDisplay = b.section && b.section.trim() !== '' && b.section !== '-' 
                                    ? `${b.grade}-${b.section}` 
                                    : b.grade;
                                  return aDisplay.localeCompare(bDisplay, undefined, { numeric: true, sensitivity: 'base' });
                                })
                                .map((classData: any) => (
                                  <SelectItem key={classData.id} value={classData.id}>
                                    Class {classData.section && classData.section.trim() !== '' && classData.section !== '-' 
                                      ? `${classData.grade}-${classData.section}` 
                                      : classData.grade}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        {/* Selected classes display */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value
                            .sort((a: string, b: string) => {
                              const classA = classes.find((c: any) => c.id === a);
                              const classB = classes.find((c: any) => c.id === b);
                              if (!classA || !classB) return 0;
                              
                              const aDisplay = classA.section && classA.section.trim() !== '' && classA.section !== '-' 
                                ? `${classA.grade}-${classA.section}` 
                                : classA.grade;
                              const bDisplay = classB.section && classB.section.trim() !== '' && classB.section !== '-' 
                                ? `${classB.grade}-${classB.section}` 
                                : classB.grade;
                              
                              return aDisplay.localeCompare(bDisplay, undefined, { numeric: true, sensitivity: 'base' });
                            })
                            .map((classId: string) => {
                            const classData = classes.find((c: any) => c.id === classId);
                            return classData ? (
                              <div
                                key={classId}
                                className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm"
                              >
                                <span>Class {classData.section && classData.section.trim() !== '' && classData.section !== '-' 
                                  ? `${classData.grade}-${classData.section}` 
                                  : classData.grade}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedClasses = field.value.filter((id: string) => id !== classId);
                                    field.onChange(updatedClasses);
                                    
                                    // Remove subjects that belong to the removed class
                                    const currentSubjects = addForm.getValues("subjects");
                                    const subjectsForRemovedClass = classSubjectAssignments
                                      .filter((assignment: any) => assignment.classId === classId)
                                      .map((assignment: any) => assignment.subjectId);
                                    
                                    const updatedSubjects = currentSubjects.filter((subjectId: string) => 
                                      !subjectsForRemovedClass.includes(subjectId)
                                    );
                                    
                                    addForm.setValue("subjects", updatedSubjects);
                                  }}
                                  className="ml-1 hover:bg-green-200 rounded-full w-4 h-4 flex items-center justify-center"
                                  data-testid={`remove-add-class-${classId}`}
                                >
                                  ×
                                </button>
                              </div>
                            ) : null;
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="subjects"
                    render={({ field }) => {
                      const selectedClasses = addForm.watch("classes");
                      const availableSubjects = getSubjectsForClasses(selectedClasses || []);
                      
                      return (
                        <FormItem>
                          <FormLabel>Subjects Taught</FormLabel>
                          <FormControl>
                            <Select
                              value=""
                              disabled={!selectedClasses || selectedClasses.length === 0}
                              onValueChange={(value) => {
                                if (value && !field.value.includes(value)) {
                                  field.onChange([...field.value, value]);
                                }
                              }}
                            >
                              <SelectTrigger data-testid="select-add-subjects">
                                <SelectValue placeholder={
                                  !selectedClasses || selectedClasses.length === 0 
                                    ? "Select classes first..." 
                                    : "Add subjects..."
                                } />
                              </SelectTrigger>
                              <SelectContent>
                                {availableSubjects
                                  .filter((subjectOption: any) => !field.value.includes(subjectOption.id))
                                  .map((subjectOption: any) => (
                                    <SelectItem key={subjectOption.id} value={subjectOption.id}>
                                      {subjectOption.displayName}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          {/* Selected subjects display */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {field.value.map((subjectId: string) => {
                              const subjectOption = availableSubjects.find((s: any) => s.id === subjectId);
                              return subjectOption ? (
                                <div
                                  key={subjectId}
                                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                                >
                                  <span>{subjectOption.displayName}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      field.onChange(field.value.filter((id: string) => id !== subjectId));
                                    }}
                                    className="ml-1 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center"
                                    data-testid={`remove-add-subject-${subjectId}`}
                                  >
                                    ×
                                  </button>
                                </div>
                              ) : null;
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  </div>

                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createTeacherMutation.isPending}
                      data-testid="button-save-teacher"
                    >
                      {createTeacherMutation.isPending ? "Adding..." : "Add Teacher"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Teachers List */}
          <Card>
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
          <CardDescription>
            {(() => {
              const filteredTeachers = teachers.filter((teacher) => {
                // Apply search term filter
                let matchesSearch = true;
                if (teacherSearchTerm) {
                  const searchTerm = teacherSearchTerm.toLowerCase();
                  matchesSearch = false;
                  
                  // Search by name
                  if (teacher.name.toLowerCase().includes(searchTerm)) matchesSearch = true;
                  
                  // Search by school ID (employee ID)
                  if (teacher.schoolIdNumber && teacher.schoolIdNumber.toLowerCase().includes(searchTerm)) matchesSearch = true;
                  
                  // Search by classes taught
                  const teacherClasses = (teacher.classes || [])
                    .map((classId: string) => {
                      const classData = classes.find((c: any) => c.id === classId);
                      if (!classData) return null;
                      const hasSection = classData.section && classData.section.trim() !== '' && classData.section !== '-';
                      return hasSection 
                        ? `Class ${classData.grade}-${classData.section}`
                        : `Class ${classData.grade}`;
                    })
                    .filter(Boolean);
                  
                  if (teacherClasses.some((className) => className && className.toLowerCase().includes(searchTerm))) matchesSearch = true;
                }
                
                // Apply class filter
                let matchesClass = true;
                if (selectedClassFilter !== "all") {
                  matchesClass = (teacher.classes || []).includes(selectedClassFilter);
                }
                
                return matchesSearch && matchesClass;
              });
              return `${filteredTeachers.length} teacher${filteredTeachers.length !== 1 ? 's' : ''} ${selectedClassFilter !== "all" || teacherSearchTerm ? 'found' : 'in your school'}`;
            })()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No teachers found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first teacher
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-teacher">
                <Plus className="mr-2 h-4 w-4" />
                Add Teacher
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {teachers
                .filter((teacher) => {
                  // Apply search term filter
                  let matchesSearch = true;
                  if (teacherSearchTerm) {
                    const searchTerm = teacherSearchTerm.toLowerCase();
                    matchesSearch = false;
                    
                    // Search by name
                    if (teacher.name.toLowerCase().includes(searchTerm)) matchesSearch = true;
                    
                    // Search by school ID (employee ID)
                    if (teacher.schoolIdNumber && teacher.schoolIdNumber.toLowerCase().includes(searchTerm)) matchesSearch = true;
                    
                    // Search by classes taught
                    const teacherClasses = (teacher.classes || [])
                      .map((classId: string) => {
                        const classData = classes.find((c: any) => c.id === classId);
                        if (!classData) return null;
                        const hasSection = classData.section && classData.section.trim() !== '' && classData.section !== '-';
                        return hasSection 
                          ? `Class ${classData.grade}-${classData.section}`
                          : `Class ${classData.grade}`;
                      })
                      .filter(Boolean);
                    
                    if (teacherClasses.some((className) => className && className.toLowerCase().includes(searchTerm))) matchesSearch = true;
                  }
                  
                  // Apply class filter
                  let matchesClass = true;
                  if (selectedClassFilter !== "all") {
                    matchesClass = (teacher.classes || []).includes(selectedClassFilter);
                  }
                  
                  return matchesSearch && matchesClass;
                })
                .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically A-Z
                .map((teacher) => {
                  // Get teacher's subjects
                  const teacherSubjects = (teacher.subjects || [])
                    .map(subjectId => subjects.find((s: any) => s.id === subjectId))
                    .filter(Boolean)
                    .map((s: any) => s.name);

                  // Get teacher's assigned classes from teacher.classes array
                  const teacherClassAssignments = (teacher.classes || [])
                    .map((classId: string) => {
                      const classData = classes.find((c: any) => c.id === classId);
                      if (!classData) return null;
                      
                      // Format display: show section if it exists and is not empty/dash
                      const hasSection = classData.section && classData.section.trim() !== '' && classData.section !== '-';
                      return hasSection 
                        ? `Class ${classData.grade}-${classData.section}`
                        : `Class ${classData.grade}`;
                    })
                    .filter(Boolean)
                    .sort((a: string | null, b: string | null) => {
                      if (!a || !b) return 0;
                      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
                    }); // Sort classes

                  return (
                <Card key={teacher.id} className="hover:shadow-md transition-shadow" data-testid={`teacher-card-${teacher.id}`}>
                  <CardHeader className="pb-2 pt-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-primary">
                        {teacher.profilePictureUrl ? (
                          <img 
                            src={teacher.profilePictureUrl} 
                            alt={teacher.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to default icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <User className={`h-4 w-4 text-primary-foreground ${teacher.profilePictureUrl ? 'hidden' : ''}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-semibold text-sm truncate cursor-pointer hover:text-primary transition-colors" 
                          data-testid={`teacher-name-${teacher.id}`}
                          onClick={() => setLocation(`/teacher/${teacher.id}`)}
                        >
                          {teacher.name}
                        </h3>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 pt-0 pb-3">
                    {/* Email */}
                    <div className="flex items-center gap-1 text-xs">
                      <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      {teacher.email ? (
                        <span className="text-muted-foreground truncate" data-testid={`teacher-email-${teacher.id}`}>
                          {teacher.email}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60 italic truncate">
                          Email not updated
                        </span>
                      )}
                    </div>
                    
                    {/* Contact Number */}
                    <div className="flex items-center gap-1 text-xs">
                      <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      {teacher.contactNumber ? (
                        <span className="text-muted-foreground truncate" data-testid={`teacher-contact-${teacher.id}`}>
                          {teacher.contactNumber}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60 italic truncate">
                          Contact not updated
                        </span>
                      )}
                    </div>

                    <div className="flex justify-end gap-1 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(teacher)}
                        data-testid={`button-edit-teacher-${teacher.id}`}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            data-testid={`button-delete-teacher-${teacher.id}`}
                            className="h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{teacher.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <DialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTeacher(teacher.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              data-testid={`button-confirm-delete-teacher-${teacher.id}`}
                            >
                              Delete
                            </AlertDialogAction>
                          </DialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Teacher Dialog */}
      <Dialog open={!!editingTeacher} onOpenChange={(open) => {
        if (!open) {
          setEditingTeacher(null);
          // Clear image state when dialog is closed
          setSelectedProfileImage(null);
          setProfileImagePreview(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Edit Teacher
            </DialogTitle>
            <DialogDescription>
              Update teacher information with complete details
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditTeacher)} className="space-y-6">
              
              {/* Profile Picture Upload Section */}
              <div className="flex flex-col items-center space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="relative w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border overflow-hidden">
                  {profileImagePreview ? (
                    <>
                      <img 
                        src={profileImagePreview} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover rounded-full"
                      />
                      <button
                        type="button"
                        onClick={clearImageState}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </>
                  ) : editingTeacher?.profilePictureUrl ? (
                    <>
                      <img 
                        src={editingTeacher.profilePictureUrl} 
                        alt="Current profile" 
                        className="w-full h-full object-cover rounded-full"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          // Set preview to trigger the file selection interface
                          setProfileImagePreview(null);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600"
                        title="Change image"
                      >
                        ✎
                      </button>
                    </>
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleProfileImageSelect(file);
                      }
                    }}
                    className="hidden"
                    id="edit-profile-image-input"
                  />
                  <label
                    htmlFor="edit-profile-image-input"
                    className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    {editingTeacher?.profilePictureUrl && !profileImagePreview ? 'Change Photo' : 'Choose Photo'}
                  </label>
                  <span className="text-xs text-gray-500 self-center">Max 5MB, JPG/PNG</span>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} data-testid="input-edit-teacher-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="teacher@school.com" 
                            {...field} 
                            data-testid="input-edit-teacher-email" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., +1234567890" 
                            {...field} 
                            data-testid="input-edit-teacher-contact" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="schoolIdNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., T001" 
                            {...field} 
                            data-testid="input-edit-teacher-school-id" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="aadhar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aadhaar Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 1234 5678 9012" 
                            {...field} 
                            data-testid="input-edit-teacher-aadhar" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-teacher-gender">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="bloodGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Group</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., A+, B-, O+" 
                            {...field} 
                            data-testid="input-edit-teacher-blood-group" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Senior Teacher, HOD" 
                            {...field} 
                            data-testid="input-edit-teacher-designation" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            data-testid="input-edit-teacher-dob" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="fatherHusbandName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father/Husband Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter father or husband name" 
                            {...field} 
                            data-testid="input-edit-teacher-father-husband" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., General, OBC, SC, ST" 
                            {...field} 
                            data-testid="input-edit-teacher-category" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="religion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Religion</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter religion" 
                            {...field} 
                            data-testid="input-edit-teacher-religion" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter complete address" 
                          {...field} 
                          data-testid="input-edit-teacher-address" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Teaching Assignments Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Teaching Assignments</h3>

              <FormField
                control={editForm.control}
                name="classes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classes Taught</FormLabel>
                    <FormControl>
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (value && !field.value.includes(value)) {
                            field.onChange([...field.value, value]);
                            // Clear subjects when classes change
                            editForm.setValue("subjects", []);
                          }
                        }}
                      >
                        <SelectTrigger data-testid="select-edit-classes">
                          <SelectValue placeholder="Add classes..." />
                        </SelectTrigger>
                        <SelectContent>
                          {classes
                            .filter((classData: any) => !field.value.includes(classData.id))
                            .sort((a: any, b: any) => {
                              const aDisplay = a.section && a.section.trim() !== '' && a.section !== '-' 
                                ? `${a.grade}-${a.section}` 
                                : a.grade;
                              const bDisplay = b.section && b.section.trim() !== '' && b.section !== '-' 
                                ? `${b.grade}-${b.section}` 
                                : b.grade;
                              return aDisplay.localeCompare(bDisplay, undefined, { numeric: true, sensitivity: 'base' });
                            })
                            .map((classData: any) => (
                              <SelectItem key={classData.id} value={classData.id}>
                                Grade {classData.section && classData.section.trim() !== '' && classData.section !== '-' 
                                  ? `${classData.grade}-${classData.section}` 
                                  : classData.grade}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {/* Selected classes display */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {classes.length > 0 && field.value.length > 0 ? (
                        field.value
                          .sort((a: string, b: string) => {
                            const classA = classes.find((c: any) => c.id === a);
                            const classB = classes.find((c: any) => c.id === b);
                            if (!classA || !classB) return 0;
                            
                            const aDisplay = classA.section && classA.section.trim() !== '' && classA.section !== '-' 
                              ? `${classA.grade}-${classA.section}` 
                              : classA.grade;
                            const bDisplay = classB.section && classB.section.trim() !== '' && classB.section !== '-' 
                              ? `${classB.grade}-${classB.section}` 
                              : classB.grade;
                            
                            return aDisplay.localeCompare(bDisplay, undefined, { numeric: true, sensitivity: 'base' });
                          })
                          .map((classId: string) => {
                            const classData = classes.find((c: any) => c.id === classId);
                                return classData ? (
                              <div
                                key={classId}
                                className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm"
                              >
                                <span>Class {classData.section && classData.section.trim() !== '' && classData.section !== '-' 
                                  ? `${classData.grade}-${classData.section}` 
                                  : classData.grade}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedClasses = field.value.filter((id: string) => id !== classId);
                                    field.onChange(updatedClasses);
                                    
                                    // Remove subjects that belong to the removed class
                                    const currentSubjects = editForm.getValues("subjects");
                                    const subjectsForRemovedClass = classSubjectAssignments
                                      .filter((assignment: any) => assignment.classId === classId)
                                      .map((assignment: any) => assignment.subjectId);
                                    
                                    const updatedSubjects = currentSubjects.filter((subjectId: string) => 
                                      !subjectsForRemovedClass.includes(subjectId)
                                    );
                                    
                                    editForm.setValue("subjects", updatedSubjects);
                                  }}
                                  className="ml-1 hover:bg-green-200 rounded-full w-4 h-4 flex items-center justify-center"
                                  data-testid={`remove-edit-class-${classId}`}
                                >
                                  ×
                                </button>
                              </div>
                            ) : null;
                          })
                      ) : field.value.length > 0 && classes.length === 0 ? (
                        <div className="text-sm text-gray-500">Loading classes...</div>
                      ) : null}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="subjects"
                render={({ field }) => {
                  const selectedClasses = editForm.watch("classes");
                  // For editing: show all subjects if no classes selected (so existing subjects can be managed)
                  // For new selections: only show subjects for selected classes
                  const availableSubjects = selectedClasses && selectedClasses.length > 0 
                    ? getSubjectsForClasses(selectedClasses)
                    : subjects.map((subject: any) => ({ ...subject, displayName: subject.name }));
                  
                  return (
                    <FormItem>
                      <FormLabel>Subjects Taught</FormLabel>
                      <FormControl>
                        <Select
                          value=""
                          disabled={false}
                          onValueChange={(value) => {
                            if (value && !field.value.includes(value)) {
                              field.onChange([...field.value, value]);
                            }
                          }}
                        >
                          <SelectTrigger data-testid="select-edit-subjects">
                            <SelectValue placeholder="Add subjects..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSubjects
                              .filter((subjectOption: any) => !field.value.includes(subjectOption.id))
                              .map((subjectOption: any) => (
                                <SelectItem key={subjectOption.id} value={subjectOption.id}>
                                  {subjectOption.displayName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      {/* Selected subjects display */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((subjectId: string) => {
                          const subjectOption = availableSubjects.find((s: any) => s.id === subjectId);
                          return subjectOption ? (
                            <div
                              key={subjectId}
                              className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                            >
                              <span>{subjectOption.displayName}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(field.value.filter((id: string) => id !== subjectId));
                                }}
                                className="ml-1 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center"
                                data-testid={`remove-edit-subject-${subjectId}`}
                              >
                                ×
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              </div>

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateTeacherMutation.isPending}
                  data-testid="button-save-edit-teacher"
                >
                  {updateTeacherMutation.isPending ? "Updating..." : "Update Teacher"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      </TabsContent>



        <TabsContent value="leave" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Teachers Leave Management
                  </CardTitle>
                  <CardDescription>
                    View and manage teacher leave periods and attendance history
                  </CardDescription>
                </div>
                <Dialog open={isBulkAttendanceOpen} onOpenChange={setIsBulkAttendanceOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" data-testid="button-bulk-attendance">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Mark Leave Period
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Mark Leave Period</DialogTitle>
                      <DialogDescription>
                        Mark a teacher as absent for multiple days (leave period)
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...bulkAttendanceForm}>
                      <form onSubmit={bulkAttendanceForm.handleSubmit(handleBulkAttendance)} className="space-y-4">
                        <FormField
                          control={bulkAttendanceForm.control}
                          name="teacherId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teacher</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-bulk-teacher">
                                    <SelectValue placeholder="Select a teacher" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {teachers.map((teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.id}>
                                      {teacher.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={bulkAttendanceForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Leave Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-leave-type">
                                    <SelectValue placeholder="Select leave type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="absent">Absent</SelectItem>
                                  <SelectItem value="on_leave">On Leave</SelectItem>
                                  <SelectItem value="medical_leave">Medical Leave</SelectItem>
                                  <SelectItem value="personal_leave">Personal Leave</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={bulkAttendanceForm.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    {...field} 
                                    data-testid="input-start-date" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={bulkAttendanceForm.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    {...field} 
                                    data-testid="input-end-date" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={bulkAttendanceForm.control}
                          name="reason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reason (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter reason for leave..." 
                                  {...field} 
                                  data-testid="textarea-leave-reason"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <DialogFooter>
                          <Button 
                            type="submit" 
                            disabled={bulkAttendanceMutation.isPending}
                            data-testid="button-save-bulk-attendance"
                          >
                            {bulkAttendanceMutation.isPending ? "Marking..." : "Mark Leave Period"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Teachers Currently on Leave */}
              {currentlyOnLeave.length > 0 && (
                <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                      <CalendarDays className="h-5 w-5" />
                      Teachers Currently on Leave
                    </CardTitle>
                    <CardDescription className="text-orange-600 dark:text-orange-300">
                      {currentlyOnLeave.length} teacher{currentlyOnLeave.length !== 1 ? 's' : ''} currently on leave
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentlyOnLeave.map((teacherData) => (
                        <div key={teacherData.teacherId} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">{teacherData.teacherName}</h4>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="space-y-2">
                                {teacherData.periods
                                  .filter(period => period.isActive)
                                  .map((period, index) => (
                                    <div key={index} className="text-sm">
                                      <div className="flex items-center gap-2 justify-end">
                                        <Badge variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-600 dark:text-orange-300">
                                          {period.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Badge>
                                      </div>
                                      <div className="text-gray-600 dark:text-gray-400 mt-1">
                                        {formatDateIST(period.startDate, { month: 'short', day: 'numeric' })} - {formatDateIST(period.endDate, { month: 'short', day: 'numeric' })}
                                      </div>
                                      {period.reason && (
                                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                                          {period.reason}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* All Teachers Leave History */}
              {allTeachersOnLeave.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      All Teachers Leave Records
                    </CardTitle>
                    <CardDescription>
                      Complete history of all teacher leave periods ({allTeachersOnLeave.length} teacher{allTeachersOnLeave.length !== 1 ? 's' : ''} with leave records)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {allTeachersOnLeave.map((teacherData) => (
                        <div key={teacherData.teacherId} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="font-semibold text-lg">{teacherData.teacherName}</h4>
                          </div>
                          
                          <div className="grid gap-3">
                            {teacherData.periods.map((period, index) => (
                              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                                period.isActive 
                                  ? 'border-l-red-500 bg-red-50 dark:bg-red-950' 
                                  : 'border-l-gray-300 bg-gray-50 dark:bg-gray-800'
                              }`}>
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Badge 
                                        variant={period.isActive ? "destructive" : "secondary"}
                                        className="text-xs"
                                      >
                                        {period.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      </Badge>
                                      {period.isActive && (
                                        <Badge variant="outline" className="text-xs bg-red-100 border-red-300 text-red-700">
                                          Active
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="text-sm font-medium">
                                      {formatDateIST(period.startDate, { 
                                        weekday: 'short', 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                      })} - {formatDateIST(period.endDate, { 
                                        weekday: 'short', 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </div>
                                    
                                    {period.reason && (
                                      <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                                        "{period.reason}"
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {(() => {
                                      const start = new Date(period.startDate);
                                      const end = new Date(period.endDate);
                                      const diffTime = Math.abs(end.getTime() - start.getTime());
                                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                                    })()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty state when no leave records */}
              {allTeachersOnLeave.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <CalendarDays className="h-12 w-12 text-gray-400 mx-auto" />
                      <h3 className="text-lg font-medium">No Leave Records</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        No teachers have any leave periods recorded yet. Start by marking teacher attendance to create leave records.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teacher Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Teacher Schedule Management
              </CardTitle>
              <CardDescription>
                View teacher schedules, workload analytics, and availability tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* View Mode Toggle */}
              <div className="flex gap-2 mb-6">
                <Button
                  variant={viewMode === 'schedule' ? 'default' : 'outline'}
                  onClick={() => setViewMode('schedule')}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Schedule View
                </Button>
                <Button
                  variant={viewMode === 'analytics' ? 'default' : 'outline'}
                  onClick={() => setViewMode('analytics')}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Workload Analytics
                </Button>
                <Button
                  variant={viewMode === 'availability' ? 'default' : 'outline'}
                  onClick={() => setViewMode('availability')}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Teacher Availability
                </Button>
              </div>

              {/* Schedule View */}
              {viewMode === 'schedule' && (
                <div className="space-y-6">
                  {/* Teacher Selection */}
                  <div className="flex gap-4 items-center">
                    <Select value={selectedScheduleTeacher} onValueChange={setSelectedScheduleTeacher}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map(teacher => {
                          const teacherAnalytics = analytics?.teachers?.find((t: any) => t.teacherId === teacher.id);
                          return (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {teacher.name}
                                {teacherAnalytics?.isOverloaded && (
                                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    <Input
                      type="date"
                      value={selectedScheduleDate}
                      onChange={(e) => setSelectedScheduleDate(e.target.value)}
                      className="w-40"
                    />
                  </div>

                  {selectedScheduleTeacher && (
                    <>
                      {/* Teacher Info Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {teachers.find(t => t.id === selectedScheduleTeacher)?.name}
                            {analytics?.teachers?.find((t: any) => t.teacherId === selectedScheduleTeacher)?.isOverloaded && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Overloaded
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {(() => {
                            const selectedTeacherData = teachers.find(t => t.id === selectedScheduleTeacher);
                            return selectedTeacherData ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Email</p>
                                  <p className="font-medium">{selectedTeacherData.email}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Max Daily Periods</p>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{selectedTeacherData.maxDailyPeriods}</p>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        setConfigMaxPeriods(selectedTeacherData.maxDailyPeriods);
                                        setShowConfig(true);
                                      }}
                                    >
                                      <Settings className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Subjects</p>
                                  <div className="flex flex-wrap gap-1">
                                    {selectedTeacherData.subjects?.map((subjectId, index) => {
                                      const subject = subjects.find((s: any) => s.id === subjectId);
                                      return (
                                        <Badge key={index} variant="secondary">
                                          {subject ? subject.name : subjectId}
                                        </Badge>
                                      );
                                    }) || []}
                                  </div>
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </CardContent>
                      </Card>

                      {/* Weekly Schedule Display */}
                      {schedule && schedule.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Calendar className="h-5 w-5" />
                              Weekly Schedule
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center text-gray-600 py-8">
                              Schedule display implementation needed
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}

                  {/* Absent Teacher Alerts */}
                  {alerts && alerts.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          Absent Teacher Alerts ({alerts.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {alerts.map((alert, index) => (
                            <Alert key={index}>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>{alert.teacher?.name}</strong> is {alert.attendance?.status} today.
                                {alert.affectedClasses > 0 && (
                                  <span> Affects {alert.affectedClasses} scheduled classes.</span>
                                )}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Analytics View */}
              {viewMode === 'analytics' && analytics && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Teachers</p>
                            <p className="text-2xl font-bold">{analytics.summary.totalTeachers}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-sm text-gray-600">Overloaded Teachers</p>
                            <p className="text-2xl font-bold">{analytics.summary.overloadedTeachers}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-600">Avg Weekly Periods</p>
                            <p className="text-2xl font-bold">{analytics.summary.avgWeeklyPeriods?.toFixed(1)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Teacher Analytics Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Teacher Workload Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border p-2 text-left">Teacher</th>
                              <th className="border p-2 text-center">Weekly Periods</th>
                              <th className="border p-2 text-center">Avg Daily</th>
                              <th className="border p-2 text-center">Max Allowed</th>
                              <th className="border p-2 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.teachers?.map((teacher: any) => (
                              <tr key={teacher.teacherId} className={teacher.isOverloaded ? 'bg-red-50' : ''}>
                                <td className="border p-2">{teacher.teacherName}</td>
                                <td className="border p-2 text-center">{teacher.weeklyPeriods}</td>
                                <td className="border p-2 text-center">{teacher.avgDailyPeriods?.toFixed(1)}</td>
                                <td className="border p-2 text-center">{teacher.maxAllowedDaily}</td>
                                <td className="border p-2 text-center">
                                  {teacher.isOverloaded ? (
                                    <Badge variant="destructive">Overloaded</Badge>
                                  ) : (
                                    <Badge variant="secondary">Normal</Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Availability View */}
              {viewMode === 'availability' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Free Teachers Today</CardTitle>
                      <CardDescription>
                        Teachers available for substitution on {new Date(selectedScheduleDate).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-gray-600 py-8">
                        Free teachers display implementation needed
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Max Daily Periods Configuration Dialog */}
          <Dialog open={showConfig} onOpenChange={setShowConfig}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Configure Max Daily Periods</DialogTitle>
                <DialogDescription>
                  Set the maximum number of periods a teacher can be assigned per day.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="maxPeriods" className="text-right">
                    Max Periods
                  </Label>
                  <Input
                    id="maxPeriods"
                    type="number"
                    min="1"
                    max="10"
                    value={configMaxPeriods}
                    onChange={(e) => setConfigMaxPeriods(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="applyToAll"
                    checked={applyToAll}
                    onCheckedChange={(checked) => setApplyToAll(checked as boolean)}
                  />
                  <Label htmlFor="applyToAll" className="text-sm font-medium">
                    Apply to all teachers in school
                  </Label>
                </div>
                {applyToAll && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                    ⚠️ This will update the max daily periods for ALL teachers in your school.
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConfig(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    updateDailyPeriodsMutation.mutate({
                      teacherId: applyToAll ? undefined : selectedScheduleTeacher,
                      maxDailyPeriods: configMaxPeriods,
                      applyToAll
                    });
                  }}
                  disabled={updateDailyPeriodsMutation.isPending}
                >
                  {updateDailyPeriodsMutation.isPending ? 'Updating...' : 'Update'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}