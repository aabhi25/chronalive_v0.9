import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertParentSchema, insertStudentSchema, type InsertParent, type InsertStudent, type Student, type Parent, type StudentParent } from "@shared/schema";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addMonths, subMonths } from "date-fns";
import { 
  ArrowLeft, 
  UserPlus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Users, 
  GraduationCap, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Key,
  Copy,
  Edit,
  RefreshCw,
  Lock,
  User,
  Activity,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Dialog states
  const [isParentDialogOpen, setIsParentDialogOpen] = useState(false);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isCredentialsVisible, setIsCredentialsVisible] = useState(false); // Hidden by default for security
  const [isRefreshConfirmDialogOpen, setIsRefreshConfirmDialogOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  
  // Profile picture state
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  
  // Attendance calendar state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Form setup - create form schema without schoolId since it's added on submission
  const formSchema = insertParentSchema.omit({ schoolId: true });
  const parentForm = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "", 
      email: "",
      contactNumber: "",
      alternateContact: "",
      address: "",
      occupation: "",
      relationToStudent: "father" as const,
      isActive: true,
    },
  });

  // Student form setup - create form schema without schoolId since it's set from current student
  const studentFormSchema = insertStudentSchema.omit({ schoolId: true });
  const studentForm = useForm({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      admissionNumber: "",
      firstName: "",
      lastName: "",
      email: "",
      contactNumber: "",
      dateOfBirth: "",
      gender: "male" as const,
      address: "",
      classId: "",
      rollNumber: "",
      bloodGroup: "",
      emergencyContact: "",
      status: "active" as const,
    },
  });

  // Queries
  const { data: student, isLoading: isStudentLoading } = useQuery<Student>({
    queryKey: ["/api/students", id],
    enabled: !!id,
  });

  const { data: studentParents = [], isLoading: isParentsLoading } = useQuery<(StudentParent & { parent: Parent })[]>({
    queryKey: ["/api/students", id, "parents"],
    enabled: !!id,
  });

  const { data: studentCredentials, isLoading: isCredentialsLoading } = useQuery<{
    studentLogin: { loginId: string; temporaryPassword?: string; hasTemporaryPassword: boolean; expiresAt: string | null; } | null;
    parentLogin: { loginId: string; temporaryPassword?: string; hasTemporaryPassword: boolean; expiresAt: string | null; } | null;
  }>({
    queryKey: ["/api/students", id, "credentials"],
    enabled: !!id,
  });

  const { data: classes = [] } = useQuery<{ id: string; grade: string; section: string }[]>({
    queryKey: ["/api/classes"],
  });

  // Fetch student's attendance for selected month
  const { data: attendance = [] } = useQuery<any[]>({
    queryKey: ["/api/student-attendance", id, format(selectedDate, "yyyy-MM")],
    queryFn: async () => {
      const startDate = format(startOfMonth(selectedDate), "yyyy-MM-dd");
      const endDate = format(endOfMonth(selectedDate), "yyyy-MM-dd");
      const response = await apiRequest("GET", `/api/student-attendance?studentId=${id}&startDate=${startDate}&endDate=${endDate}`);
      return response.json();
    },
    enabled: !!id,
    staleTime: 30000, // Cache data for 30 seconds
    refetchInterval: 60000, // Refetch every minute for updates
  });

  // Mutations
  const createParentMutation = useMutation({
    mutationFn: async (data: InsertParent & { studentId: string }) => {
      const response = await apiRequest("POST", "/api/parents", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", id, "parents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students", id, "credentials"] });
      setIsParentDialogOpen(false);
      parentForm.reset();
      toast({ title: "Success", description: "Parent added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add parent", variant: "destructive" });
    },
  });

  const updateParentMutation = useMutation({
    mutationFn: async (data: InsertParent & { id: string }) => {
      const response = await apiRequest("PATCH", `/api/parents/${data.id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", id, "parents"] });
      setIsParentDialogOpen(false);
      setEditingParent(null);
      parentForm.reset();
      toast({ title: "Success", description: "Parent updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update parent", variant: "destructive" });
    },
  });

  const deleteParentMutation = useMutation({
    mutationFn: async (parentId: string) => {
      const response = await apiRequest("DELETE", `/api/parents/${parentId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", id, "parents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students", id, "credentials"] });
      toast({ title: "Success", description: "Parent removed successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove parent", variant: "destructive" });
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: async (data: InsertStudent & { id: string }) => {
      const response = await apiRequest("PATCH", `/api/students/${data.id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", id] });
      queryClient.refetchQueries({ queryKey: ["/api/students", id] });
      setIsStudentDialogOpen(false);
      studentForm.reset();
      clearImageState();
      toast({ title: "Success", description: "Student updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update student", variant: "destructive" });
    },
  });

  const refreshCredentialsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/students/${id}/credentials/refresh`);
      return await response.json();
    },
    onSuccess: (data) => {
      // Update credentials in the cache with the fresh data
      queryClient.setQueryData(["/api/students", id, "credentials"], {
        studentLogin: {
          loginId: data.studentLogin.loginId,
          temporaryPassword: data.studentLogin.temporaryPassword,
          hasTemporaryPassword: true,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours from now
        },
        parentLogin: {
          loginId: data.parentLogin.loginId,
          temporaryPassword: data.parentLogin.temporaryPassword,
          hasTemporaryPassword: true,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours from now
        }
      });
      
      // Also invalidate to get fresh data from server
      queryClient.invalidateQueries({ queryKey: ["/api/students", id, "credentials"] });
      
      toast({ 
        title: "Success", 
        description: "Login credentials have been refreshed successfully. New passwords are now visible below." 
      });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to refresh credentials", 
        variant: "destructive" 
      });
    },
  });

  // Handlers
  const handleAddParent = () => {
    setEditingParent(null);
    parentForm.reset();
    setIsParentDialogOpen(true);
  };

  const handleEditParent = (parent: Parent) => {
    setEditingParent(parent);
    parentForm.reset({
      firstName: parent.firstName,
      lastName: parent.lastName,
      email: parent.email || "",
      contactNumber: parent.contactNumber,
      alternateContact: parent.alternateContact || "",
      address: parent.address || "",
      occupation: parent.occupation || "",
      relationToStudent: parent.relationToStudent,
      isActive: parent.isActive,
    });
    setIsParentDialogOpen(true);
  };

  const handleParentSubmit = (data: InsertParent) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", parentForm.formState.errors);
    
    if (!student) {
      console.log("No student found");
      return;
    }
    
    if (editingParent) {
      updateParentMutation.mutate({ ...data, id: editingParent.id });
    } else {
      console.log("Creating parent with data:", { ...data, studentId: student.id, schoolId: student.schoolId });
      createParentMutation.mutate({ ...data, studentId: student.id, schoolId: student.schoolId });
    }
  };

  const handleDeleteParent = (parentId: string) => {
    if (confirm("Are you sure you want to remove this parent?")) {
      deleteParentMutation.mutate(parentId);
    }
  };

  const handleEditStudent = () => {
    if (!student) return;
    
    studentForm.reset({
      admissionNumber: student.admissionNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email || "",
      contactNumber: student.contactNumber || "",
      dateOfBirth: student.dateOfBirth || "",
      gender: student.gender || "male",
      address: student.address || "",
      classId: student.classId || "",
      rollNumber: student.rollNumber || "",
      bloodGroup: student.bloodGroup || "",
      emergencyContact: student.emergencyContact || "",
      status: student.status,
    });
    setIsStudentDialogOpen(true);
  };

  const handleStudentSubmit = async (data: InsertStudent) => {
    if (!student) return;
    
    let profilePictureUrl = student.profilePictureUrl;
    
    // Upload profile picture if a new one was selected
    if (selectedProfileImage) {
      try {
        const formData = new FormData();
        formData.append('profileImage', selectedProfileImage);
        
        const uploadResponse = await apiRequest("POST", `/api/students/${student.id}/profile-picture`, formData);
        const uploadResult = await uploadResponse.json();
        profilePictureUrl = uploadResult.profilePictureUrl;
      } catch (error) {
        toast({ 
          title: "Error", 
          description: "Failed to upload profile picture", 
          variant: "destructive" 
        });
        return;
      }
    }
    
    updateStudentMutation.mutate({ 
      ...data, 
      id: student.id, 
      schoolId: student.schoolId,
      profilePictureUrl 
    });
  };

  // Profile picture handling functions
  const handleProfileImageSelect = (file: File) => {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "Error", 
        description: "Image must be less than 5MB", 
        variant: "destructive" 
      });
      return;
    }

    setSelectedProfileImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImageState = () => {
    setSelectedProfileImage(null);
    setProfileImagePreview(null);
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
    const map = new Map<string, any>();
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
      case 'excused':
        return 'Excused';
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
        case 'excused':
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Copied to clipboard" });
  };

  const handleRefreshCredentials = () => {
    setIsRefreshConfirmDialogOpen(true);
  };

  const confirmRefreshCredentials = () => {
    refreshCredentialsMutation.mutate();
    setIsRefreshConfirmDialogOpen(false);
  };

  const getStudentClass = () => {
    if (!student?.classId) return "Not Assigned";
    const studentClass = classes.find(c => c.id === student.classId);
    return studentClass ? `${studentClass.grade} ${studentClass.section}` : "Not Assigned";
  };

  if (isStudentLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Student not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setLocation("/students")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{student.firstName} {student.lastName}</h1>
          <p className="text-muted-foreground">Student Profile & Parent Management</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Student Profile Card */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <CardTitle className="text-lg font-semibold">Student Information</CardTitle>
                  <CardDescription className="text-sm">Complete student profile details</CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditStudent}
                data-testid="button-edit-student"
                className="h-8"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Admission Number</p>
                <p className="text-sm font-semibold font-mono" data-testid="text-admission-number">{student.admissionNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Class</p>
                <p className="text-sm" data-testid="text-class">{getStudentClass()}</p>
              </div>
              {student?.classId && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Roll Number</p>
                  <p className="text-sm" data-testid="text-roll-number">{student.rollNumber || "Not Assigned"}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <Badge variant={student.status === "active" ? "default" : "secondary"} className="text-xs" data-testid="badge-status">
                  {student.status}
                </Badge>
              </div>
              {student.gender && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Gender</p>
                  <p className="text-sm capitalize" data-testid="text-gender">{student.gender}</p>
                </div>
              )}
              {student.bloodGroup && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Blood Group</p>
                  <p className="text-sm" data-testid="text-blood-group">{student.bloodGroup}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {student.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span data-testid="text-email">{student.email}</span>
                </div>
              )}
              {student.contactNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span data-testid="text-contact">{student.contactNumber}</span>
                </div>
              )}
              {student.dateOfBirth && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span data-testid="text-dob">{new Date(student.dateOfBirth).toLocaleDateString()}</span>
                </div>
              )}
              {student.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span data-testid="text-address">{student.address}</span>
                </div>
              )}
            </div>

            {student.emergencyContact && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                  <span data-testid="text-emergency-contact">{student.emergencyContact}</span>
                </div>
              </div>
            )}

            {student.medicalInfo && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medical Information</p>
                <p className="text-sm" data-testid="text-medical">{student.medicalInfo}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Login Credentials Card */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  Login Credentials
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCredentialsVisible(!isCredentialsVisible)}
                    data-testid="button-toggle-credentials"
                    className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {isCredentialsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshCredentials}
                disabled={refreshCredentialsMutation.isPending}
                data-testid="button-refresh-credentials"
                className="h-8"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${refreshCredentialsMutation.isPending ? 'animate-spin' : ''}`} />
                {refreshCredentialsMutation.isPending ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
            <CardDescription className="text-sm">
              {isCredentialsVisible 
                ? "Login details for student and parent access"
                : "Click the eye icon to view login credentials"
              }
            </CardDescription>
          </CardHeader>
          
          {!isCredentialsVisible && (
            <CardContent className="pt-0 space-y-4">
              {/* Student Portal - Hidden State */}
              <div className="p-4 border border-blue-100 dark:border-blue-800/30 rounded-lg bg-blue-50/30 dark:bg-blue-900/10">
                <div className="flex items-center justify-center gap-3 py-8">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Student Portal</span>
                  </div>
                  <Lock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              {/* Parent Portal - Hidden State */}
              <div className="p-4 border border-green-100 dark:border-green-800/30 rounded-lg bg-green-50/30 dark:bg-green-900/10">
                <div className="flex items-center justify-center gap-3 py-8">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Parent Portal</span>
                  </div>
                  <Lock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </CardContent>
          )}

          {isCredentialsVisible && (
            <CardContent className="pt-0 space-y-4">
              {isCredentialsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                </div>
              ) : (
                <>
                  {/* Student Login */}
                  <div className="p-4 border border-blue-100 dark:border-blue-800/30 rounded-lg bg-blue-50/30 dark:bg-blue-900/10">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-medium text-gray-900 dark:text-white">Student Portal</h4>
                    </div>
                  {studentCredentials?.studentLogin ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Login ID</span>
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono" data-testid="text-student-login-id">
                            {studentCredentials.studentLogin.loginId}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(studentCredentials.studentLogin!.loginId)}
                            data-testid="button-copy-student-login"
                            className="h-7 w-7 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Password</span>
                        <div className="flex items-center gap-2">
                          {studentCredentials.studentLogin.temporaryPassword ? (
                            <>
                              <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono" data-testid="text-student-password">
                                {isCredentialsVisible ? studentCredentials.studentLogin.temporaryPassword : "••••••••"}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(studentCredentials.studentLogin.temporaryPassword!)}
                                data-testid="button-copy-student-password"
                                className="h-7 w-7 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </>
                          ) : studentCredentials.studentLogin.hasTemporaryPassword ? (
                            <Badge variant="outline" className="text-green-600">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Not generated</Badge>
                          )}
                        </div>
                      </div>
                      {studentCredentials.studentLogin.temporaryPassword && studentCredentials.studentLogin.expiresAt && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Valid until</span>
                          <span className="text-orange-600 dark:text-orange-400 font-medium">
                            {new Date(studentCredentials.studentLogin.expiresAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No student login credentials found</p>
                  )}
                </div>

                {/* Parent Login */}
                <div className="p-4 border border-green-100 dark:border-green-800/30 rounded-lg bg-green-50/30 dark:bg-green-900/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <h4 className="font-medium text-gray-900 dark:text-white">Parent Portal</h4>
                    </div>
                    <Badge variant="outline" className="text-xs px-2 py-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300">
                      Shared
                    </Badge>
                  </div>
                  {studentCredentials?.parentLogin ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Login ID</span>
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono" data-testid="text-parent-login-id">
                            {studentCredentials.parentLogin.loginId}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(studentCredentials.parentLogin!.loginId)}
                            data-testid="button-copy-parent-login"
                            className="h-7 w-7 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Password</span>
                        <div className="flex items-center gap-2">
                          {studentCredentials.parentLogin.temporaryPassword ? (
                            <>
                              <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono" data-testid="text-parent-password">
                                {isCredentialsVisible ? studentCredentials.parentLogin.temporaryPassword : "••••••••"}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(studentCredentials.parentLogin.temporaryPassword!)}
                                data-testid="button-copy-parent-password"
                                className="h-7 w-7 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </>
                          ) : studentCredentials.parentLogin.hasTemporaryPassword ? (
                            <Badge variant="outline" className="text-green-600">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Not generated</Badge>
                          )}
                        </div>
                      </div>
                      {studentCredentials.parentLogin.temporaryPassword && studentCredentials.parentLogin.expiresAt && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Valid until</span>
                          <span className="text-orange-600 dark:text-orange-400 font-medium">
                            {new Date(studentCredentials.parentLogin.expiresAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        All parents for this student share these login credentials
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No parent login credentials found</p>
                  )}
                </div>
                </>
              )}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Parents Management Card */}
      <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <CardTitle className="text-lg font-semibold">Parents & Guardians</CardTitle>
                <CardDescription className="text-sm">Manage multiple parents for this student</CardDescription>
              </div>
            </div>
            <Button onClick={handleAddParent} data-testid="button-add-parent" size="sm" className="h-8">
              <UserPlus className="h-3 w-3 mr-1" />
              Add Parent
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isParentsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : studentParents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No parents added yet. Click "Add Parent" to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {studentParents.map((sp) => (
                <div key={sp.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/30 dark:bg-gray-800/30">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm" data-testid={`text-parent-name-${sp.parent.id}`}>
                          {sp.parent.firstName} {sp.parent.lastName}
                        </h4>
                        {sp.isPrimary && (
                          <Badge variant="default" className="text-xs" data-testid={`badge-primary-${sp.parent.id}`}>
                            Primary
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs" data-testid={`badge-relation-${sp.parent.id}`}>
                          {sp.parent.relationToStudent}
                        </Badge>
                      </div>
                      <div className="grid gap-1 text-xs">
                        {sp.parent.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span data-testid={`text-parent-email-${sp.parent.id}`}>{sp.parent.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span data-testid={`text-parent-contact-${sp.parent.id}`}>{sp.parent.contactNumber}</span>
                        </div>
                        {sp.parent.occupation && (
                          <div>
                            <span className="text-gray-500">Occupation: </span>
                            <span data-testid={`text-parent-occupation-${sp.parent.id}`}>{sp.parent.occupation}</span>
                          </div>
                        )}
                        {sp.parent.address && (
                          <div>
                            <span className="text-gray-500">Address: </span>
                            <span data-testid={`text-parent-address-${sp.parent.id}`}>{sp.parent.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditParent(sp.parent)}
                        data-testid={`button-edit-parent-${sp.parent.id}`}
                        className="h-7 px-2 text-xs"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteParent(sp.parent.id)}
                        data-testid={`button-delete-parent-${sp.parent.id}`}
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance History Card */}
      <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
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
                  <span>Excused</span>
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

      {/* Parent Dialog */}
      <Dialog open={isParentDialogOpen} onOpenChange={setIsParentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingParent ? "Edit Parent" : "Add Parent"}</DialogTitle>
            <DialogDescription>
              {editingParent ? "Update parent information" : "Add a new parent for this student"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...parentForm}>
            <form onSubmit={parentForm.handleSubmit(handleParentSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={parentForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-parent-first-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={parentForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-parent-last-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={parentForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} value={field.value || ""} data-testid="input-parent-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={parentForm.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-parent-contact" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={parentForm.control}
                  name="relationToStudent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relation to Student *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-parent-relation">
                            <SelectValue placeholder="Select relation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="father">Father</SelectItem>
                          <SelectItem value="mother">Mother</SelectItem>
                          <SelectItem value="guardian">Guardian</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={parentForm.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-parent-occupation" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={parentForm.control}
                name="alternateContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternate Contact</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-parent-alt-contact" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={parentForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} data-testid="textarea-parent-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsParentDialogOpen(false);
                    setEditingParent(null);
                    parentForm.reset();
                  }}
                  data-testid="button-cancel-parent"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createParentMutation.isPending || updateParentMutation.isPending}
                  data-testid="button-save-parent"
                >
                  {createParentMutation.isPending || updateParentMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Student Edit Dialog */}
      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Information</DialogTitle>
            <DialogDescription>
              Update student profile details
            </DialogDescription>
          </DialogHeader>
          
          <Form {...studentForm}>
            <form onSubmit={studentForm.handleSubmit(handleStudentSubmit)} className="space-y-4">
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
                  ) : student?.profilePictureUrl ? (
                    <>
                      <img 
                        src={student.profilePictureUrl} 
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
                    id="edit-student-profile-image-input"
                  />
                  <label
                    htmlFor="edit-student-profile-image-input"
                    className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    {student?.profilePictureUrl && !profileImagePreview ? 'Change Photo' : 'Choose Photo'}
                  </label>
                  <span className="text-xs text-gray-500 self-center">Max 5MB, JPG/PNG</span>
                </div>
              </div>

              {/* Row 1: First Name* | Last Name* */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={studentForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-student-first-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={studentForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-student-last-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 2: Admission Number* | Roll Number */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={studentForm.control}
                  name="admissionNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admission Number *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-student-admission" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={studentForm.control}
                  name="rollNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roll Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-student-roll" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 3: Class* | Date of Birth */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={studentForm.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-student-class">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.grade} {cls.section}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={studentForm.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} data-testid="input-student-dob" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 4: Gender | Blood Group */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={studentForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-student-gender">
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
                  control={studentForm.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Group</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-student-blood-group" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 5: Email | Contact Number */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={studentForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} value={field.value || ""} data-testid="input-student-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={studentForm.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-student-contact" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 6: Address (full width) */}
              <FormField
                control={studentForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} data-testid="textarea-student-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={studentForm.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-student-emergency-contact" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsStudentDialogOpen(false);
                    studentForm.reset();
                  }}
                  data-testid="button-cancel-student"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateStudentMutation.isPending}
                  data-testid="button-save-student"
                >
                  {updateStudentMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Refresh Credentials Confirmation Dialog */}
      <AlertDialog open={isRefreshConfirmDialogOpen} onOpenChange={setIsRefreshConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refresh Login Credentials</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refresh the login credentials for both the student and parent? 
              This will generate new temporary passwords and invalidate the current ones. 
              The new credentials will need to be shared with the student and parent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-refresh">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRefreshCredentials}
              disabled={refreshCredentialsMutation.isPending}
              data-testid="button-confirm-refresh"
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {refreshCredentialsMutation.isPending ? 'Refreshing...' : 'Yes, Refresh Credentials'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}