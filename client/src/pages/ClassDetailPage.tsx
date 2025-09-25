import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Newsfeed from "@/components/Newsfeed";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  Users,
  MapPin,
  Clock,
  BookOpen,
  User,
  Calendar,
  GraduationCap,
  CalendarDays,
  Mail,
  Phone,
  IdCard,
  Plus,
  X,
  Download,
  FileSpreadsheet,
  Image,
  Loader2,
  MessageSquare,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { z } from "zod";
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

interface Class {
  id: string;
  grade: string;
  section: string;
  studentCount: number;
  requiredSubjects: string[];
  schoolId: string;
  room?: string;
  createdAt: string;
  updatedAt: string;
}

interface Teacher {
  id: string;
  name: string;
  email?: string;
  contactNumber?: string;
  schoolIdNumber?: string;
  subjects?: string[];
  schoolId: string;
  isActive: boolean;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  periodsPerWeek: number;
  color: string;
  schoolId: string;
}

interface TimetableEntry {
  id: string;
  classId: string;
  teacherId: string;
  subjectId: string;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  room?: string;
  teacher?: Teacher;
  subject?: {
    id: string;
    name: string;
    code: string;
  };
}

interface TimetableValidityPeriod {
  id: string;
  classId: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

interface ClassSubjectAssignment {
  id: string;
  classId: string;
  subjectId: string;
  weeklyFrequency: number;
  assignedTeacherId?: string | null;
  subject: Subject;
  assignedTeacher?: Teacher;
}

interface ClassTeacherAssignment {
  id: string;
  classId: string;
  teacherId: string;
  role: "primary" | "co_class";
  isPrimary: boolean;
  privileges: {
    attendance: boolean;
    classFeedPosting: boolean;
    parentCommunication: boolean;
    leaveApproval: boolean;
  };
  assignedBy: string;
  schoolId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  teacherName: string;
  teacherEmail: string;
}

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  classId?: string;
  schoolId: string;
  rollNumber?: string;
  bloodGroup?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianContact?: string;
  emergencyContact?: string;
  medicalInfo?: string;
  isActive: boolean;
  status: "active" | "inactive" | "graduated" | "transferred";
  createdAt: string;
  updatedAt: string;
}

const teacherAssignmentSchema = z.object({
  teacherId: z.string().min(1, "Teacher is required"),
  subjectIds: z.array(z.string()).min(1, "At least one subject is required"),
});

const classTeacherAssignmentSchema = z.object({
  teacherId: z.string().min(1, "Teacher is required"),
  role: z.enum(["primary", "co_class"], { required_error: "Role is required" }),
  privileges: z.object({
    attendance: z.boolean().default(true),
    classFeedPosting: z.boolean().default(true),
    parentCommunication: z.boolean().default(true),
    leaveApproval: z.boolean().default(true),
  }).default({
    attendance: true,
    classFeedPosting: true,
    parentCommunication: true,
    leaveApproval: true,
  }),
});

// Schema for creating and assigning a new subject
const createSubjectAssignmentSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(255, "Subject name too long"),
  weeklyFrequency: z.number().min(1, "Weekly frequency must be at least 1").max(8, "Weekly frequency cannot exceed 8 periods"),
});

// Schema for adding a new teacher (from TeacherView)
const addTeacherFormSchema = z.object({
  name: z.string().min(1, "Teacher name is required").max(255, "Teacher name too long"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  contactNumber: z.string().min(1, "Contact number is required").max(20, "Contact number too long"),
  schoolIdNumber: z.string().min(1, "School ID number is required").max(50, "School ID number too long"),
  schoolId: z.string().min(1, "School ID is required"),
  isActive: z.boolean().default(true),
  classes: z.array(z.string()).default([]),
  subjects: z.array(z.string()).default([]),
});

type TeacherAssignmentFormData = z.infer<typeof teacherAssignmentSchema>;
type CreateSubjectAssignmentFormData = z.infer<typeof createSubjectAssignmentSchema>;
type AddTeacherFormData = z.infer<typeof addTeacherFormSchema>;

export default function ClassDetailPage() {
  const [, params] = useRoute("/classes/:id");
  const { toast } = useToast();
  const { user } = useAuth();
  const classId = params?.id;
  const [isTeacherAssignDialogOpen, setIsTeacherAssignDialogOpen] = useState(false);
  const [isSubjectAssignDialogOpen, setIsSubjectAssignDialogOpen] = useState(false);
  const [isEditSubjectDialogOpen, setIsEditSubjectDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  
  // Navigation state and refs for overview cards
  const [activeTab, setActiveTab] = useState("feed");
  const [pendingScrollRef, setPendingScrollRef] = useState<React.RefObject<HTMLDivElement> | null>(null);
  const studentsRef = useRef<HTMLDivElement>(null);
  const teachersRef = useRef<HTMLDivElement>(null);
  const subjectsRef = useRef<HTMLDivElement>(null);

  // Handle smooth scrolling after tab switch
  useEffect(() => {
    if (activeTab === "config" && pendingScrollRef?.current) {
      requestAnimationFrame(() => {
        pendingScrollRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        });
        setPendingScrollRef(null);
      });
    }
  }, [activeTab, pendingScrollRef]);
  
  const [isDeleteSubjectDialogOpen, setIsDeleteSubjectDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<any>(null);
  const [isDeleteTeacherDialogOpen, setIsDeleteTeacherDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<any>(null);
  
  // Copy subjects state
  const [isCopySubjectsDialogOpen, setIsCopySubjectsDialogOpen] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<Class[]>([]);
  
  // Class Teacher state
  const [isClassTeacherAssignDialogOpen, setIsClassTeacherAssignDialogOpen] = useState(false);
  const [isClassTeacherDeleteDialogOpen, setIsClassTeacherDeleteDialogOpen] = useState(false);
  const [classTeacherToDelete, setClassTeacherToDelete] = useState<ClassTeacherAssignment | null>(null);
  const [isEditPrivilegesDialogOpen, setIsEditPrivilegesDialogOpen] = useState(false);
  const [editingClassTeacher, setEditingClassTeacher] = useState<ClassTeacherAssignment | null>(null);
  
  // Add Teacher state
  const [isAddTeacherDialogOpen, setIsAddTeacherDialogOpen] = useState(false);

  // Students state
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsOffset, setStudentsOffset] = useState(0);
  const [isLoadingMoreStudents, setIsLoadingMoreStudents] = useState(false);
  const [hasMoreStudents, setHasMoreStudents] = useState(true);
  const STUDENTS_PER_PAGE = 5;

  const teacherAssignForm = useForm<TeacherAssignmentFormData>({
    resolver: zodResolver(teacherAssignmentSchema),
    defaultValues: {
      teacherId: "",
      subjectIds: [],
    },
  });

  const createSubjectForm = useForm<CreateSubjectAssignmentFormData>({
    resolver: zodResolver(createSubjectAssignmentSchema),
    defaultValues: {
      name: "",
      weeklyFrequency: 4,
    },
  });

  const editSubjectForm = useForm<{ weeklyFrequency: number }>({
    resolver: zodResolver(z.object({
      weeklyFrequency: z.number().min(1, "Weekly frequency must be at least 1").max(8, "Weekly frequency cannot exceed 8 periods")
    })),
    defaultValues: {
      weeklyFrequency: 1,
    },
  });

  const classTeacherForm = useForm({
    resolver: zodResolver(classTeacherAssignmentSchema),
    defaultValues: {
      teacherId: "",
      role: "co_class" as const,
      privileges: {
        attendance: true,
        classFeedPosting: true,
        parentCommunication: true,
        leaveApproval: true,
      },
    },
  });

  const editPrivilegesForm = useForm({
    resolver: zodResolver(z.object({
      privileges: z.object({
        attendance: z.boolean(),
        classFeedPosting: z.boolean(),
        parentCommunication: z.boolean(),
        leaveApproval: z.boolean(),
      }),
    })),
    defaultValues: {
      privileges: {
        attendance: true,
        classFeedPosting: true,
        parentCommunication: true,
        leaveApproval: true,
      },
    },
  });

  const addTeacherForm = useForm<AddTeacherFormData>({
    resolver: zodResolver(addTeacherFormSchema),
    defaultValues: {
      name: "",
      email: "",
      contactNumber: "",
      schoolIdNumber: "",
      schoolId: user?.schoolId || "",
      isActive: true,
      classes: [],
      subjects: [],
    },
  });

  // Class data query
  const {
    data: classData,
    isLoading: isClassLoading,
    error: classError,
  } = useQuery<Class>({
    queryKey: ["/api/classes", classId],
    enabled: !!classId,
  });

  // Timetable data query
  // Get current week dates for version queries
  const getCurrentWeek = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 5); // Saturday
    
    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    };
  };

  const currentWeek = getCurrentWeek();


  const {
    data: timetableData = [],
    isLoading: isTimetableLoading,
  } = useQuery<TimetableEntry[]>({
    queryKey: ["/api/timetable/detailed", classId, "class"], // Match TimetableGrid format
    queryFn: async () => {
      const params = new URLSearchParams({ classId: classId || '' });
      // Always fetch the latest active timetable - no version parameter
      const response = await apiRequest("GET", `/api/timetable/detailed?${params.toString()}`);
      return response.json() as Promise<TimetableEntry[]>;
    },
    enabled: !!classId,
    staleTime: 0, // Always fetch fresh data like TimetableGrid
  });

  // Validity periods query

  // Teachers query
  const {
    data: teachers = [],
    isLoading: isTeachersLoading,
  } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  // Subjects query
  const {
    data: subjects = [],
    isLoading: isSubjectsLoading,
  } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  // All Classes query (for add teacher form)
  const {
    data: allClasses = [],
    isLoading: isAllClassesLoading,
  } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  // Timetable structure query
  const { data: timetableStructure } = useQuery({
    queryKey: ["/api/timetable-structure"],
    enabled: !!user?.schoolId,
  });


  // Class Subject Assignments query
  const {
    data: classSubjectAssignments = [],
    isLoading: isAssignmentsLoading,
  } = useQuery<ClassSubjectAssignment[]>({
    queryKey: ["/api/class-subject-assignments", classId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/class-subject-assignments?classId=${classId}`);
      return response.json() as Promise<ClassSubjectAssignment[]>;
    },
    enabled: !!classId,
  });

  // Class Teacher Assignments query
  const {
    data: classTeacherAssignments = [],
    isLoading: isClassTeachersLoading,
  } = useQuery<ClassTeacherAssignment[]>({
    queryKey: ["/api/classes", classId, "teachers"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/classes/${classId}/teachers`);
      return response.json() as Promise<ClassTeacherAssignment[]>;
    },
    enabled: !!classId,
  });

  // Students query - Initial load
  const {
    data: initialStudents = [],
    isLoading: isStudentsLoading,
  } = useQuery<Student[]>({
    queryKey: ["/api/students", classId, "initial"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/students?classId=${classId}&offset=0&limit=${STUDENTS_PER_PAGE}`);
      const fetchedStudents = await response.json() as Student[];
      setStudents(fetchedStudents);
      setHasMoreStudents(fetchedStudents.length === STUDENTS_PER_PAGE);
      setStudentsOffset(STUDENTS_PER_PAGE);
      return fetchedStudents;
    },
    enabled: !!classId,
  });


  const assignTeacherMutation = useMutation({
    mutationFn: async (data: TeacherAssignmentFormData) => {
      const response = await apiRequest("POST", `/api/classes/${classId}/assign-teacher-multiple`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-subject-assignments", classId] });
      setIsTeacherAssignDialogOpen(false);
      teacherAssignForm.reset();
      toast({
        title: "Success",
        description: "Teacher assigned to subjects successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign teacher",
        variant: "destructive",
      });
    },
  });

  const createTeacherMutation = useMutation({
    mutationFn: async (data: AddTeacherFormData) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/classes", classId, "teachers"] });
      setIsAddTeacherDialogOpen(false);
      addTeacherForm.reset({
        name: "",
        email: "",
        contactNumber: "",
        schoolIdNumber: "",
        schoolId: user?.schoolId || "",
        isActive: true,
        classes: [],
        subjects: [],
      });
      toast({
        title: "Success",
        description: "Teacher created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create teacher",
        variant: "destructive",
      });
    },
  });

  const createAndAssignSubjectMutation = useMutation({
    mutationFn: async (data: CreateSubjectAssignmentFormData) => {
      const response = await apiRequest("POST", `/api/classes/${classId}/create-assign-subject`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-subject-assignments", classId] });
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setIsSubjectAssignDialogOpen(false);
      createSubjectForm.reset();
      toast({
        title: "Success",
        description: "Subject created and assigned successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create and assign subject",
        variant: "destructive",
      });
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: async (data: { weeklyFrequency: number }) => {
      const response = await apiRequest("PUT", `/api/class-subject-assignments/${editingSubject?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-subject-assignments"] });
      setIsEditSubjectDialogOpen(false);
      setEditingSubject(null);
      editSubjectForm.reset();
      toast({
        title: "Success",
        description: "Subject periods updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subject periods",
        variant: "destructive",
      });
    },
  });

  const removeTeacherMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await apiRequest("DELETE", `/api/classes/${classId}/unassign-teacher/${assignmentId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-subject-assignments", classId] });
      toast({
        title: "Success",
        description: "Teacher assignment removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove teacher assignment",
        variant: "destructive",
      });
    },
  });

  const removeSubjectMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await apiRequest("DELETE", `/api/class-subject-assignments/${assignmentId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-subject-assignments", classId] });
      toast({
        title: "Success",
        description: "Subject assignment removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove subject assignment",
        variant: "destructive",
      });
    },
  });

  const generateTimetableMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/timetable/generate", {
        classId: classId
      });
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        // Invalidate all timetable-related queries and force refetch
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            const queryKey = query.queryKey;
            return queryKey[0] === "/api/timetable/detailed" || 
                   queryKey[0] === "/api/timetable";
          }
        });
        
        // Force refetch of the current timetable data
        queryClient.refetchQueries({ 
          predicate: (query) => {
            const queryKey = query.queryKey;
            return queryKey[0] === "/api/timetable/detailed";
          }
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate timetable",
        variant: "destructive",
      });
    },
  });

  const copySubjectsMutation = useMutation({
    mutationFn: async (targetClassIds: string[]) => {
      const response = await apiRequest("POST", `/api/classes/${classId}/copy-subjects`, {
        targetClassIds
      });
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Success",
        description: result.message,
      });
      setIsCopySubjectsDialogOpen(false);
      setSelectedSections([]);
      // Invalidate class-subject-assignments for all affected classes
      queryClient.invalidateQueries({ queryKey: ["/api/class-subject-assignments"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to copy subjects",
        variant: "destructive",
      });
    },
  });

  // Class Teacher Mutations
  const assignClassTeacherMutation = useMutation({
    mutationFn: async (data: { teacherId: string; role: "primary" | "co_class"; privileges: any }) => {
      const response = await apiRequest("POST", `/api/classes/${classId}/teachers`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes", classId, "teachers"] });
      setIsClassTeacherAssignDialogOpen(false);
      classTeacherForm.reset();
      toast({
        title: "Success",
        description: "Class teacher assigned successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign class teacher",
        variant: "destructive",
      });
    },
  });

  const updateClassTeacherPrivilegesMutation = useMutation({
    mutationFn: async (data: { assignmentId: string; privileges: any }) => {
      const response = await apiRequest("PUT", `/api/classes/${classId}/teachers/${data.assignmentId}`, {
        privileges: data.privileges
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes", classId, "teachers"] });
      setIsEditPrivilegesDialogOpen(false);
      setEditingClassTeacher(null);
      editPrivilegesForm.reset();
      toast({
        title: "Success",
        description: "Privileges updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update privileges",
        variant: "destructive",
      });
    },
  });

  const removeClassTeacherMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await apiRequest("DELETE", `/api/classes/${classId}/teachers/${assignmentId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes", classId, "teachers"] });
      setIsClassTeacherDeleteDialogOpen(false);
      setClassTeacherToDelete(null);
      toast({
        title: "Success",
        description: "Class teacher assignment removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove class teacher assignment",
        variant: "destructive",
      });
    },
  });

  // Fetch available sections when copy dialog opens
  useEffect(() => {
    if (isCopySubjectsDialogOpen && classData) {
      fetchAvailableSections();
    }
  }, [isCopySubjectsDialogOpen, classData]);

  const fetchAvailableSections = async () => {
    try {
      const response = await apiRequest("GET", `/api/classes/${classId}/other-sections`);
      const sections = await response.json();
      setAvailableSections(sections);
    } catch (error) {
      console.error("Error fetching available sections:", error);
      toast({
        title: "Error",
        description: "Failed to fetch available sections.",
        variant: "destructive",
      });
    }
  };

  // Load more students function
  const loadMoreStudents = async () => {
    if (isLoadingMoreStudents || !hasMoreStudents || !classId) return;

    setIsLoadingMoreStudents(true);
    try {
      const response = await apiRequest("GET", `/api/students?classId=${classId}&offset=${studentsOffset}&limit=${STUDENTS_PER_PAGE}`);
      const newStudents = await response.json() as Student[];
      
      setStudents(prev => [...prev, ...newStudents]);
      setStudentsOffset(prev => prev + STUDENTS_PER_PAGE);
      setHasMoreStudents(newStudents.length === STUDENTS_PER_PAGE);
    } catch (error) {
      console.error("Error loading more students:", error);
      toast({
        title: "Error",
        description: "Failed to load more students.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMoreStudents(false);
    }
  };

  // Handle scroll to load more students
  const handleStudentsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMoreStudents && !isLoadingMoreStudents) {
      loadMoreStudents();
    }
  };

  // Navigation handlers for overview cards
  const handleStudentsCardClick = () => {
    setActiveTab("config");
    setPendingScrollRef(studentsRef);
  };

  const handleTeachersCardClick = () => {
    setActiveTab("config");
    setPendingScrollRef(teachersRef);
  };

  const handleSubjectsCardClick = () => {
    setActiveTab("config");
    setPendingScrollRef(subjectsRef);
  };

  // Class Teacher Handlers
  const handleAssignClassTeacher = (data: any) => {
    assignClassTeacherMutation.mutate(data);
  };

  const handleDeleteClassTeacherClick = (assignment: ClassTeacherAssignment) => {
    setClassTeacherToDelete(assignment);
    setIsClassTeacherDeleteDialogOpen(true);
  };

  const handleConfirmDeleteClassTeacher = () => {
    if (classTeacherToDelete) {
      removeClassTeacherMutation.mutate(classTeacherToDelete.id);
    }
  };

  const handleEditPrivilegesClick = (assignment: ClassTeacherAssignment) => {
    setEditingClassTeacher(assignment);
    editPrivilegesForm.reset({
      privileges: assignment.privileges,
    });
    setIsEditPrivilegesDialogOpen(true);
  };

  const handleUpdatePrivileges = (data: any) => {
    if (editingClassTeacher) {
      updateClassTeacherPrivilegesMutation.mutate({
        assignmentId: editingClassTeacher.id,
        privileges: data.privileges,
      });
    }
  };


  if (classError) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading class: {(classError as Error).message}</p>
            <Link href="/classes">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!classId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Invalid class ID</p>
            <Link href="/classes">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get teachers specifically assigned to this class through subject assignments
  const classTeachers = teachers.filter(teacher => 
    classSubjectAssignments.some(assignment => assignment.assignedTeacherId === teacher.id)
  );

  const uniqueSubjects = Array.from(new Set(timetableData.map(entry => entry.subject?.name).filter(Boolean)));

  // Get assigned subjects from class subject assignments
  const assignedSubjects = classSubjectAssignments;

  // Use timetable structure data or defaults
  const workingDays = (timetableStructure as any)?.workingDays || ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const timeSlots = (timetableStructure as any)?.timeSlots || [
    { period: 1, startTime: "08:00", endTime: "08:45" },
    { period: 2, startTime: "08:45", endTime: "09:30" },
    { period: 3, startTime: "09:30", endTime: "10:15" },
    { period: 4, startTime: "10:15", endTime: "11:00" },
    { period: 5, startTime: "11:15", endTime: "12:00" },
    { period: 6, startTime: "12:00", endTime: "12:45" },
    { period: 7, startTime: "12:45", endTime: "13:30" },
    { period: 8, startTime: "13:30", endTime: "14:15" },
  ];

  // Sort working days in proper order
  const sortWorkingDays = (days: string[]): string[] => {
    const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return dayOrder.filter(day => days.includes(day));
  };

  const sortedWorkingDays = sortWorkingDays(workingDays);

  const getTimetableEntry = (day: string, period: number) => {
    return timetableData.find(entry => 
      entry.day === day.toLowerCase() && entry.period === period
    );
  };

  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function to calculate teaching period number (excluding breaks)
  const getTeachingPeriodNumber = (actualPeriod: number): number => {
    if (!timeSlots) return actualPeriod;
    
    // Count only non-break periods up to the current period
    let teachingPeriodCount = 0;
    for (const slot of timeSlots) {
      if (slot.period <= actualPeriod && !slot.isBreak) {
        teachingPeriodCount++;
      }
    }
    return teachingPeriodCount;
  };

  const getSubjectColor = (color: string) => {
    const colorMap: Record<string, string> = {
      '#3B82F6': 'bg-blue-50 border-blue-200 text-blue-900',
      '#10B981': 'bg-green-50 border-green-200 text-green-900',
      '#8B5CF6': 'bg-purple-50 border-purple-200 text-purple-900',
      '#F59E0B': 'bg-orange-50 border-orange-200 text-orange-900',
      '#EF4444': 'bg-red-50 border-red-200 text-red-900',
      '#06B6D4': 'bg-cyan-50 border-cyan-200 text-cyan-900',
      '#EC4899': 'bg-pink-50 border-pink-200 text-pink-900',
      '#84CC16': 'bg-lime-50 border-lime-200 text-lime-900',
    };
    return colorMap[color] || 'bg-gray-50 border-gray-200 text-gray-900';
  };

  // Get current week date range
  const getCurrentWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Calculate offset to get to Monday
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5); // Saturday is 5 days after Monday
    
    return {
      start: monday,
      end: saturday
    };
  };

  const weekRange = getCurrentWeekRange();
  const formatDateRange = (start: Date, end: Date) => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    };
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  // Export functions
  const exportToExcel = () => {
    if (!timetableData || timetableData.length === 0) {
      toast({
        title: "No Data",
        description: "No timetable data to export",
        variant: "destructive",
      });
      return;
    }

    // Create Excel workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare data in grid format
    const headers = ['Period', ...sortedWorkingDays.map(day => day.charAt(0).toUpperCase() + day.slice(1))];
    
    const data: any[][] = [
      ['WEEKLY TIMETABLE'],
      ['Class: ' + (classData ? `${classData.grade}-${classData.section}` : '')],
      ['Period: ' + formatDateRange(weekRange.start, weekRange.end)],
      [], // Empty row
      headers
    ];

    // Fill in the timetable data
    timeSlots.forEach((timeSlot: any) => {
      if (timeSlot.isBreak) {
        const row = [`Break (${formatTime12Hour(timeSlot.startTime)} - ${formatTime12Hour(timeSlot.endTime)})`, 
                     ...Array(sortedWorkingDays.length).fill('Break Time')];
        data.push(row);
      } else {
        const row = [`P${getTeachingPeriodNumber(timeSlot.period)} (${formatTime12Hour(timeSlot.startTime)} - ${formatTime12Hour(timeSlot.endTime)})`];
        
        sortedWorkingDays.forEach(day => {
          const entry = getTimetableEntry(day, timeSlot.period);
          if (entry) {
            row.push(`${entry.subject?.name || 'Unknown'} - ${entry.teacher?.name || 'Unknown'}`);
          } else {
            row.push('Free Period');
          }
        });
        
        data.push(row);
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    const colWidths = [
      { wch: 20 }, // Period column
      ...sortedWorkingDays.map(() => ({ wch: 15 })) // Day columns
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
    
    const fileName = `Timetable_${classData?.grade}-${classData?.section}_${formatDateRange(weekRange.start, weekRange.end).replace(/[^a-zA-Z0-9-]/g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast({
      title: "Export Successful",
      description: "Timetable exported to Excel successfully",
    });
  };

  const exportToPNG = async () => {
    if (!timetableData || timetableData.length === 0) {
      toast({
        title: "No Data",
        description: "No timetable data to export",
        variant: "destructive",
      });
      return;
    }

    const timetableSection = document.getElementById('timetable-section');
    if (!timetableSection) {
      toast({
        title: "Export Error",
        description: "Could not find timetable to export",
        variant: "destructive",
      });
      return;
    }

    try {
      const canvas = await html2canvas(timetableSection, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `Timetable_${classData?.grade}-${classData?.section}_${formatDateRange(weekRange.start, weekRange.end).replace(/[^a-zA-Z0-9-]/g, '_')}.png`;
      link.href = canvas.toDataURL();
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "Timetable exported as PNG successfully",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Error",
        description: "Failed to export timetable as PNG",
        variant: "destructive",
      });
    }
  };



  const handleAssignTeacher = (data: TeacherAssignmentFormData) => {
    assignTeacherMutation.mutate(data);
  };

  const handleCreateAndAssignSubject = (data: CreateSubjectAssignmentFormData) => {
    createAndAssignSubjectMutation.mutate(data);
  };

  const handleAddTeacher = (data: AddTeacherFormData) => {
    createTeacherMutation.mutate(data);
  };

  // Helper function to get available subjects for selected classes (for add teacher form)
  const getSubjectsForClasses = (selectedClassIds: string[]) => {
    const availableSubjects = new Map();
    
    selectedClassIds.forEach(classId => {
      const classAssignments = classSubjectAssignments.filter(assignment => assignment.classId === classId);
      classAssignments.forEach(assignment => {
        if (assignment.subject) {
          const key = assignment.subject.id;
          const classData = allClasses.find(c => c.id === classId);
          const displayName = classData 
            ? `${assignment.subject.name} (Class ${classData.section && classData.section.trim() !== '' && classData.section !== '-' 
                ? `${classData.grade}-${classData.section}` 
                : classData.grade})`
            : assignment.subject.name;
          
          if (!availableSubjects.has(key)) {
            availableSubjects.set(key, {
              id: assignment.subject.id,
              displayName: displayName,
              subject: assignment.subject
            });
          }
        }
      });
    });
    
    return Array.from(availableSubjects.values());
  };

  const handleEditSubject = (assignment: any) => {
    setEditingSubject(assignment);
    editSubjectForm.setValue("weeklyFrequency", assignment.weeklyFrequency);
    setIsEditSubjectDialogOpen(true);
  };

  const handleUpdateSubject = (data: { weeklyFrequency: number }) => {
    updateSubjectMutation.mutate(data);
  };

  const handleDeleteSubjectClick = (assignment: any) => {
    setSubjectToDelete(assignment);
    setIsDeleteSubjectDialogOpen(true);
  };

  const handleConfirmDeleteSubject = () => {
    if (subjectToDelete) {
      removeSubjectMutation.mutate(subjectToDelete.id);
      setIsDeleteSubjectDialogOpen(false);
      setSubjectToDelete(null);
    }
  };

  const handleDeleteTeacherClick = (assignment: any) => {
    setTeacherToDelete(assignment);
    setIsDeleteTeacherDialogOpen(true);
  };

  const handleConfirmDeleteTeacher = () => {
    if (teacherToDelete) {
      removeTeacherMutation.mutate(teacherToDelete.id);
      setIsDeleteTeacherDialogOpen(false);
      setTeacherToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/classes">
            <Button variant="outline" size="sm" data-testid="button-back-to-classes">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col">
            {isClassLoading ? (
              <Skeleton className="h-7 w-48" />
            ) : (
              <h1 className="text-2xl font-bold tracking-tight" data-testid="class-name">
                {classData?.section ? 
                  `Class ${classData.grade}${classData.section}` : 
                  `Class ${classData?.grade}`
                }
              </h1>
            )}
            <p className="text-sm text-muted-foreground">
              Complete class overview with teachers and timetable
            </p>
          </div>
        </div>
      </div>


      {/* Class Overview Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="h-fit cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800"
          onClick={handleStudentsCardClick}
          data-testid="card-students-overview"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-3">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-1">
            {isClassLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <div className="text-xl font-bold text-blue-800 dark:text-blue-200" data-testid="student-count">{classData?.studentCount || 0}</div>
            )}
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Total enrolled</p>
          </CardContent>
        </Card>

        <Card 
          className="h-fit cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800"
          onClick={handleTeachersCardClick}
          data-testid="card-teachers-overview"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-3">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-1">
            {isTeachersLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <div className="text-xl font-bold text-emerald-800 dark:text-emerald-200" data-testid="teacher-count">{classTeachers.length}</div>
            )}
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Assigned teachers</p>
          </CardContent>
        </Card>

        <Card 
          className="h-fit cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800"
          onClick={handleSubjectsCardClick}
          data-testid="card-subjects-overview"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-3">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-1">
            {isTimetableLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <div className="text-xl font-bold text-purple-800 dark:text-purple-200" data-testid="subject-count">{uniqueSubjects.length}</div>
            )}
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Total subjects</p>
          </CardContent>
        </Card>

        <Card className="h-fit bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-3">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">Room</CardTitle>
            <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-1">
            {isClassLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <div className="text-xl font-bold text-amber-800 dark:text-amber-200" data-testid="class-room">{classData?.room || "Not set"}</div>
            )}
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Class location</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Class Feed and Class Config */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="feed" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Class Feed</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Class Config</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="config" className="space-y-6 mt-6">
          {/* All existing content goes here */}
          
          {/* Assigned Subjects */}
      <Card ref={subjectsRef} data-testid="section-subjects">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Assigned Subjects</span>
            </CardTitle>
            <Dialog open={isSubjectAssignDialogOpen} onOpenChange={setIsSubjectAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-assign-subject">
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Subject
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isAssignmentsLoading ? (
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24" />
              ))}
            </div>
          ) : assignedSubjects.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No subjects assigned</h3>
              <p className="text-muted-foreground">
                This class doesn't have any subjects assigned yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {assignedSubjects.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => handleEditSubject(assignment)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm px-2 py-1" data-testid={`assigned-subject-${assignment.id}`}>
                        <span style={{ color: assignment.subject?.color || "#3B82F6" }}>{assignment.subject?.name || "Unknown Subject"}</span>
                        <span className="ml-1 text-muted-foreground">({assignment.subject?.code || "N/A"})</span>
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {assignment.weeklyFrequency} periods/week
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubjectClick(assignment);
                    }}
                    disabled={removeSubjectMutation.isPending}
                    data-testid={`button-remove-subject-${assignment.id}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {assignedSubjects.length > 0 && (
          <div className="px-6 pb-6">
            <Button 
              variant="outline" 
              onClick={() => setIsCopySubjectsDialogOpen(true)}
              className="w-full"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Copy Subjects to other sections
            </Button>
          </div>
        )}
      </Card>

      {/* Teachers Teaching This Class */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Teachers Teaching This Class</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Dialog open={isAddTeacherDialogOpen} onOpenChange={setIsAddTeacherDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    data-testid="button-add-teacher"
                    title="Add a new teacher to the school"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Teacher
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Dialog open={isTeacherAssignDialogOpen} onOpenChange={setIsTeacherAssignDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={assignedSubjects.length === 0}
                    data-testid="button-assign-teacher"
                    title={assignedSubjects.length === 0 ? "Please assign subjects to this class first" : "Assign Teacher"}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Teacher
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isTeachersLoading ? (
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-3">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </Card>
              ))}
            </div>
          ) : classTeachers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No teachers assigned</h3>
              <p className="text-muted-foreground">
                This class doesn't have any teachers assigned yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {classTeachers.map((teacher) => {
                const teacherAssignments = classSubjectAssignments.filter(assignment => assignment.assignedTeacherId === teacher.id);
                return (
                  <Card key={teacher.id} className="hover:shadow-md transition-shadow" data-testid={`class-teacher-card-${teacher.id}`}>
                    <CardHeader className="pb-2 pt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate" data-testid={`class-teacher-name-${teacher.id}`}>
                              {teacher.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1 pt-0 pb-3">
                    {teacher.email && (
                      <div className="flex items-center gap-1 text-xs">
                        <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground truncate" data-testid={`class-teacher-email-${teacher.id}`}>
                          {teacher.email}
                        </span>
                      </div>
                    )}

                    {teacher.schoolIdNumber && (
                      <div className="flex items-center gap-1 text-xs">
                        <IdCard className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground" data-testid={`class-teacher-school-id-${teacher.id}`}>
                          {teacher.schoolIdNumber}
                        </span>
                      </div>
                    )}

                    {teacherAssignments.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {teacherAssignments.map((assignment) => (
                          <Badge key={assignment.id} variant="secondary" className="text-xs flex items-center gap-1" data-testid={`teacher-subject-${teacher.id}-${assignment.subjectId}`}>
                            <span>{assignment.subject?.name} ({assignment.subject?.code})</span>
                            <button
                              onClick={() => handleDeleteTeacherClick(assignment)}
                              disabled={removeTeacherMutation.isPending}
                              className="hover:text-destructive transition-colors ml-1"
                              data-testid={`button-remove-subject-${teacher.id}-${assignment.subjectId}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Class Teachers */}
      <Card ref={teachersRef} data-testid="section-teachers">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span>Class Teachers</span>
            </CardTitle>
            <Dialog open={isClassTeacherAssignDialogOpen} onOpenChange={setIsClassTeacherAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-assign-class-teacher">
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Class Teacher
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isClassTeachersLoading ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="p-3">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </Card>
              ))}
            </div>
          ) : classTeacherAssignments.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No class teachers assigned</h3>
              <p className="text-muted-foreground">
                This class doesn't have any class teachers assigned yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[...classTeacherAssignments]
                .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
                .map((assignment) => (
                <Card 
                  key={assignment.id} 
                  className={`hover:shadow-md transition-shadow ${
                    assignment.isPrimary ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : ''
                  }`} 
                  data-testid={`class-teacher-assignment-${assignment.id}`}
                >
                  <CardHeader className="pb-2 pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          assignment.isPrimary ? 'bg-primary' : 'bg-secondary'
                        }`}>
                          <GraduationCap className={`h-4 w-4 ${
                            assignment.isPrimary ? 'text-primary-foreground' : 'text-secondary-foreground'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate" data-testid={`class-teacher-name-${assignment.id}`}>
                            {assignment.teacherName}
                          </h3>
                          <Badge 
                            variant={assignment.isPrimary ? "default" : "secondary"} 
                            className="text-xs mt-1"
                            data-testid={`class-teacher-role-${assignment.id}`}
                          >
                            {assignment.isPrimary ? "Primary Class Teacher" : "Co-Class Teacher"}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPrivilegesClick(assignment)}>
                            Edit Privileges
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClassTeacherClick(assignment)}
                            className="text-destructive"
                          >
                            Remove Teacher
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 pt-0 pb-3">
                    {assignment.teacherEmail && (
                      <div className="flex items-center gap-1 text-xs">
                        <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground truncate" data-testid={`class-teacher-email-${assignment.id}`}>
                          {assignment.teacherEmail}
                        </span>
                      </div>
                    )}

                    {/* Privileges */}
                    <div className="pt-2 border-t border-muted">
                      <p className="text-xs font-medium mb-1">Privileges:</p>
                      <div className="flex flex-wrap gap-1">
                        {assignment.privileges.attendance && (
                          <Badge variant="outline" className="text-xs">Attendance</Badge>
                        )}
                        {assignment.privileges.classFeedPosting && (
                          <Badge variant="outline" className="text-xs">Class Feed</Badge>
                        )}
                        {assignment.privileges.parentCommunication && (
                          <Badge variant="outline" className="text-xs">Parent Comm.</Badge>
                        )}
                        {assignment.privileges.leaveApproval && (
                          <Badge variant="outline" className="text-xs">Leave Approval</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students */}
      <Card ref={studentsRef} data-testid="section-students">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Students</span>
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {students.length} {students.length === 1 ? 'student' : 'students'} loaded
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isStudentsLoading ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-3">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-4 w-28" />
                </Card>
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No students found</h3>
              <p className="text-muted-foreground">
                This class doesn't have any students enrolled yet.
              </p>
            </div>
          ) : (
            <div 
              className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
              onScroll={handleStudentsScroll}
            >
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 pr-2">
                {students.map((student) => (
                  <Card key={student.id} className="hover:shadow-md transition-shadow" data-testid={`student-card-${student.id}`}>
                    <CardHeader className="pb-2 pt-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate" data-testid={`student-name-${student.id}`}>
                            {student.firstName} {student.lastName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {student.rollNumber && (
                              <Badge variant="outline" className="text-xs">
                                Roll: {student.rollNumber}
                              </Badge>
                            )}
                            <Badge 
                              variant={student.status === 'active' ? 'default' : 'secondary'} 
                              className="text-xs"
                              data-testid={`student-status-${student.id}`}
                            >
                              {student.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1 pt-0 pb-3">
                      {student.admissionNumber && (
                        <div className="flex items-center gap-1 text-xs">
                          <IdCard className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground" data-testid={`student-admission-${student.id}`}>
                            {student.admissionNumber}
                          </span>
                        </div>
                      )}

                      {student.email && (
                        <div className="flex items-center gap-1 text-xs">
                          <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground truncate" data-testid={`student-email-${student.id}`}>
                            {student.email}
                          </span>
                        </div>
                      )}

                      {student.contactNumber && (
                        <div className="flex items-center gap-1 text-xs">
                          <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground" data-testid={`student-contact-${student.id}`}>
                            {student.contactNumber}
                          </span>
                        </div>
                      )}

                      {student.guardianName && (
                        <div className="text-xs text-muted-foreground pt-1 border-t border-muted">
                          <p className="font-medium">Guardian: {student.guardianName}</p>
                          {student.guardianContact && (
                            <p className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {student.guardianContact}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Loading more indicator */}
              {isLoadingMoreStudents && (
                <div className="flex justify-center py-4">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading more students...</span>
                  </div>
                </div>
              )}

              {/* End of list indicator */}
              {!hasMoreStudents && students.length > STUDENTS_PER_PAGE && (
                <div className="text-center py-3 text-xs text-muted-foreground border-t border-muted mt-3">
                  All students loaded
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Teacher Assignment Dialog */}
      <Dialog open={isTeacherAssignDialogOpen} onOpenChange={setIsTeacherAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Teacher to Class</DialogTitle>
            <DialogDescription>
              {assignedSubjects.length === 0 
                ? "Please assign subjects to this class first before assigning teachers"
                : "Select a teacher and one or more subjects to assign to this class"
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...teacherAssignForm}>
            <form onSubmit={teacherAssignForm.handleSubmit(handleAssignTeacher)} className="space-y-4">
              <FormField
                control={teacherAssignForm.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      // Clear subject selection when teacher changes
                      teacherAssignForm.setValue("subjectIds", []);
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-teacher">
                          <SelectValue placeholder="Select a teacher" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(() => {
                          const qualifiedTeachers = teachers.filter(teacher => {
                            // Only show teachers who can teach at least one subject assigned to this class
                            const classSubjectIds = assignedSubjects.map(assignment => assignment.subjectId);
                            return teacher.subjects && teacher.subjects.some(subjectId => 
                              classSubjectIds.includes(subjectId)
                            );
                          });

                          if (qualifiedTeachers.length === 0) {
                            return (
                              <div className="p-4 text-center text-muted-foreground">
                                <p className="text-sm">No qualified teachers available</p>
                                <p className="text-xs mt-1">
                                  Teachers must be assigned to at least one subject that this class studies
                                </p>
                              </div>
                            );
                          }

                          return qualifiedTeachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name} ({teacher.email})
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={teacherAssignForm.control}
                name="subjectIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subjects</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {(() => {
                          const selectedTeacherId = teacherAssignForm.watch("teacherId");
                          
                          if (!selectedTeacherId) {
                            return (
                              <div className="p-4 text-center text-muted-foreground border border-dashed rounded-lg">
                                <p className="text-sm">Please select a teacher first</p>
                              </div>
                            );
                          }

                          // Find the selected teacher
                          const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
                          
                          if (!selectedTeacher || !selectedTeacher.subjects) {
                            return (
                              <div className="p-4 text-center text-muted-foreground border border-dashed rounded-lg">
                                <p className="text-sm">Selected teacher has no subjects assigned</p>
                              </div>
                            );
                          }

                          // Filter assigned subjects to only show those the selected teacher can teach
                          // AND exclude subjects already assigned to this teacher for this class
                          const teacherQualifiedSubjects = assignedSubjects.filter(assignment => 
                            selectedTeacher.subjects!.includes(assignment.subjectId) &&
                            assignment.assignedTeacherId !== selectedTeacherId
                          );

                          if (teacherQualifiedSubjects.length === 0) {
                            return (
                              <div className="p-4 text-center text-muted-foreground border border-dashed rounded-lg">
                                <p className="text-sm">This teacher cannot teach any subjects assigned to this class</p>
                              </div>
                            );
                          }

                          const selectedSubjects = field.value || [];
                          const selectedSubjectDetails = teacherQualifiedSubjects.filter(assignment => 
                            selectedSubjects.includes(assignment.subjectId)
                          );
                          
                          return (
                            <div className="space-y-3">
                              {/* Selected subjects display */}
                              {selectedSubjectDetails.length > 0 && (
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Selected Subjects:</label>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedSubjectDetails.map((assignment) => (
                                      <div
                                        key={assignment.subjectId}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm border"
                                      >
                                        <span>{assignment.subject.name}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const currentValue = field.value || [];
                                            field.onChange(currentValue.filter(id => id !== assignment.subjectId));
                                          }}
                                          className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                          title={`Remove ${assignment.subject.name}`}
                                        >
                                          <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"
                                            />
                                          </svg>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Subject selection dropdown */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  {selectedSubjectDetails.length > 0 ? "Add More Subjects:" : "Select Subjects:"}
                                </label>
                                <Select
                                  value=""
                                  onValueChange={(value) => {
                                    const currentValue = field.value || [];
                                    const isSelected = currentValue.includes(value);
                                    
                                    if (isSelected) {
                                      field.onChange(currentValue.filter(id => id !== value));
                                    } else {
                                      field.onChange([...currentValue, value]);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choose subjects to assign..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {teacherQualifiedSubjects.map((assignment) => {
                                      const isSelected = selectedSubjects.includes(assignment.subjectId);
                                      return (
                                        <SelectItem
                                          key={assignment.subjectId}
                                          value={assignment.subjectId}
                                          className="cursor-pointer"
                                          disabled={isSelected}
                                        >
                                          <div className="flex items-center justify-between w-full">
                                            <span className={isSelected ? "text-muted-foreground" : ""}>
                                              {assignment.subject.name} ({assignment.subject.code})
                                              {isSelected && " - Already selected"}
                                            </span>
                                            {isSelected && (
                                              <svg
                                                className="h-4 w-4 text-primary"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M5 13l4 4L19 7"
                                                />
                                              </svg>
                                            )}
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={assignTeacherMutation.isPending || assignedSubjects.length === 0}
                  data-testid="button-submit-teacher-assignment"
                >
                  {assignTeacherMutation.isPending ? "Assigning..." : "Assign Teacher"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Teacher Dialog */}
      <Dialog open={isAddTeacherDialogOpen} onOpenChange={setIsAddTeacherDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[calc(100vh-4rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
            <DialogDescription>
              Add a new teacher to your school
            </DialogDescription>
          </DialogHeader>
          <Form {...addTeacherForm}>
            <form onSubmit={addTeacherForm.handleSubmit(handleAddTeacher)} className="space-y-4">
              <FormField
                control={addTeacherForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Smith" {...field} data-testid="input-teacher-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addTeacherForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="teacher@school.com" 
                        {...field} 
                        data-testid="input-teacher-email" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addTeacherForm.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., +1234567890" 
                        {...field} 
                        data-testid="input-teacher-contact" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addTeacherForm.control}
                name="schoolIdNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School ID Number *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., T001" 
                        {...field} 
                        data-testid="input-teacher-school-id" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addTeacherForm.control}
                name="classes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classes Taught *</FormLabel>
                    <FormControl>
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (value && !field.value.includes(value)) {
                            field.onChange([...field.value, value]);
                            // Clear subjects when classes change
                            addTeacherForm.setValue("subjects", []);
                          }
                        }}
                      >
                        <SelectTrigger data-testid="select-add-classes">
                          <SelectValue placeholder="Add classes..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allClasses
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
                          const classA = allClasses.find((c: any) => c.id === a);
                          const classB = allClasses.find((c: any) => c.id === b);
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
                        const classData = allClasses.find((c: any) => c.id === classId);
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
                                const currentSubjects = addTeacherForm.getValues("subjects");
                                const subjectsForRemovedClass = classSubjectAssignments
                                  .filter((assignment: any) => assignment.classId === classId)
                                  .map((assignment: any) => assignment.subjectId);
                                
                                const updatedSubjects = currentSubjects.filter((subjectId: string) => 
                                  !subjectsForRemovedClass.includes(subjectId)
                                );
                                
                                addTeacherForm.setValue("subjects", updatedSubjects);
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
                control={addTeacherForm.control}
                name="subjects"
                render={({ field }) => {
                  const selectedClasses = addTeacherForm.watch("classes");
                  const availableSubjects = getSubjectsForClasses(selectedClasses || []);
                  
                  return (
                    <FormItem>
                      <FormLabel>Subjects Taught *</FormLabel>
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

      {/* Create and Assign Subject Dialog */}
      <Dialog open={isSubjectAssignDialogOpen} onOpenChange={setIsSubjectAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create and Assign Subject</DialogTitle>
            <DialogDescription>
              Create a new subject and assign it to this class
            </DialogDescription>
          </DialogHeader>
          <Form {...createSubjectForm}>
            <form onSubmit={createSubjectForm.handleSubmit(handleCreateAndAssignSubject)} className="space-y-4">
              <FormField
                control={createSubjectForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter subject name (e.g., Mathematics)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createSubjectForm.control}
                name="weeklyFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periods in a week</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="8"
                        placeholder="Number of periods per week"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        data-testid="input-weekly-frequency"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createAndAssignSubjectMutation.isPending}
                  data-testid="button-submit-subject-assignment"
                >
                  {createAndAssignSubjectMutation.isPending ? "Creating..." : "Create & Assign Subject"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog open={isEditSubjectDialogOpen} onOpenChange={setIsEditSubjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject Periods</DialogTitle>
            <DialogDescription>
              Modify the weekly frequency for {editingSubject?.subject?.name} ({editingSubject?.subject?.code})
            </DialogDescription>
          </DialogHeader>
          <Form {...editSubjectForm}>
            <form onSubmit={editSubjectForm.handleSubmit(handleUpdateSubject)} className="space-y-4">
              <FormField
                control={editSubjectForm.control}
                name="weeklyFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekly Frequency (Periods per week)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="8"
                        placeholder="Enter number of periods per week"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        data-testid="input-edit-weekly-frequency"
                      />
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
                    setIsEditSubjectDialogOpen(false);
                    setEditingSubject(null);
                    editSubjectForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateSubjectMutation.isPending}
                  data-testid="button-update-subject"
                >
                  {updateSubjectMutation.isPending ? "Updating..." : "Update Periods"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Subject Confirmation Dialog */}
      <AlertDialog open={isDeleteSubjectDialogOpen} onOpenChange={setIsDeleteSubjectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Subject Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {subjectToDelete?.subject?.name} ({subjectToDelete?.subject?.code}) from this class? 
              This action cannot be undone and will remove all related timetable entries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsDeleteSubjectDialogOpen(false);
                setSubjectToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteSubject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeSubjectMutation.isPending}
              data-testid="button-confirm-delete-subject"
            >
              {removeSubjectMutation.isPending ? "Removing..." : "Remove Subject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Teacher Assignment Confirmation Dialog */}
      <AlertDialog open={isDeleteTeacherDialogOpen} onOpenChange={setIsDeleteTeacherDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Teacher Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {teacherToDelete?.teacher?.name} from teaching {teacherToDelete?.subject?.name} ({teacherToDelete?.subject?.code}) for this class? 
              This action cannot be undone and will remove all related timetable entries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsDeleteTeacherDialogOpen(false);
                setTeacherToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteTeacher}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeTeacherMutation.isPending}
              data-testid="button-confirm-delete-teacher"
            >
              {removeTeacherMutation.isPending ? "Removing..." : "Remove Teacher"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Copy Subjects Dialog */}
      <Dialog open={isCopySubjectsDialogOpen} onOpenChange={setIsCopySubjectsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Subjects to other sections</DialogTitle>
            <DialogDescription>
              Select the sections you want to copy all assigned subjects to. This will copy {assignedSubjects.length} subjects to the selected sections.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-3 max-h-60 overflow-y-auto">
              {availableSections.map((section) => (
                <div key={section.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={section.id}
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSections([...selectedSections, section.id]);
                      } else {
                        setSelectedSections(selectedSections.filter(id => id !== section.id));
                      }
                    }}
                  />
                  <label
                    htmlFor={section.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Class {section.grade} {section.section}
                    <span className="text-muted-foreground ml-2">({section.studentCount} students)</span>
                  </label>
                </div>
              ))}
              {availableSections.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No other sections available for this grade.
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCopySubjectsDialogOpen(false);
                setSelectedSections([]);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={selectedSections.length === 0 || copySubjectsMutation.isPending}
              onClick={() => {
                copySubjectsMutation.mutate(selectedSections);
              }}
            >
              {copySubjectsMutation.isPending 
                ? "Copying..." 
                : `Copy to ${selectedSections.length} section${selectedSections.length !== 1 ? 's' : ''}`
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Class Teacher Assignment Dialog */}
      <Dialog open={isClassTeacherAssignDialogOpen} onOpenChange={setIsClassTeacherAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Class Teacher</DialogTitle>
            <DialogDescription>
              Select a teacher and configure their role and privileges for this class.
            </DialogDescription>
          </DialogHeader>
          <Form {...classTeacherForm}>
            <form onSubmit={classTeacherForm.handleSubmit(handleAssignClassTeacher)} className="space-y-4">
              <FormField
                control={classTeacherForm.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-class-teacher">
                          <SelectValue placeholder="Select a teacher" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teachers
                          .filter(teacher => 
                            !classTeacherAssignments.some(assignment => assignment.teacherId === teacher.id)
                          )
                          .map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name} ({teacher.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={classTeacherForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isClassTeachersLoading}>
                      <FormControl>
                        <SelectTrigger data-testid="select-class-teacher-role">
                          <SelectValue placeholder={isClassTeachersLoading ? "Loading..." : "Select role"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!classTeacherAssignments.some(assignment => assignment.isPrimary && assignment.isActive) && (
                          <SelectItem value="primary">Primary Class Teacher</SelectItem>
                        )}
                        <SelectItem value="co_class">Co-Class Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                    {classTeacherAssignments.some(assignment => assignment.isPrimary && assignment.isActive) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Primary teacher already assigned to this class
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Privileges</FormLabel>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={classTeacherForm.control}
                    name="privileges.attendance"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-privilege-attendance"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Attendance Management
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={classTeacherForm.control}
                    name="privileges.classFeedPosting"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-privilege-class-feed"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Class Feed Posting
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={classTeacherForm.control}
                    name="privileges.parentCommunication"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-privilege-parent-comm"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Parent Communication
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={classTeacherForm.control}
                    name="privileges.leaveApproval"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-privilege-leave-approval"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Leave Approval
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsClassTeacherAssignDialogOpen(false);
                    classTeacherForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={assignClassTeacherMutation.isPending}
                  data-testid="button-submit-class-teacher"
                >
                  {assignClassTeacherMutation.isPending ? "Assigning..." : "Assign Class Teacher"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Privileges Dialog */}
      <Dialog open={isEditPrivilegesDialogOpen} onOpenChange={setIsEditPrivilegesDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Privileges</DialogTitle>
            <DialogDescription>
              Configure privileges for {editingClassTeacher?.teacherName}
            </DialogDescription>
          </DialogHeader>
          <Form {...editPrivilegesForm}>
            <form onSubmit={editPrivilegesForm.handleSubmit(handleUpdatePrivileges)} className="space-y-4">
              <div className="space-y-3">
                <FormLabel>Privileges</FormLabel>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={editPrivilegesForm.control}
                    name="privileges.attendance"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-edit-privilege-attendance"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Attendance Management
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editPrivilegesForm.control}
                    name="privileges.classFeedPosting"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-edit-privilege-class-feed"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Class Feed Posting
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editPrivilegesForm.control}
                    name="privileges.parentCommunication"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-edit-privilege-parent-comm"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Parent Communication
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editPrivilegesForm.control}
                    name="privileges.leaveApproval"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-edit-privilege-leave-approval"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Leave Approval
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditPrivilegesDialogOpen(false);
                    setEditingClassTeacher(null);
                    editPrivilegesForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateClassTeacherPrivilegesMutation.isPending}
                  data-testid="button-update-privileges"
                >
                  {updateClassTeacherPrivilegesMutation.isPending ? "Updating..." : "Update Privileges"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Class Teacher Confirmation Dialog */}
      <AlertDialog open={isClassTeacherDeleteDialogOpen} onOpenChange={setIsClassTeacherDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Class Teacher Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {classTeacherToDelete?.teacherName} as a class teacher for this class? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsClassTeacherDeleteDialogOpen(false);
                setClassTeacherToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteClassTeacher}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeClassTeacherMutation.isPending}
              data-testid="button-confirm-delete-class-teacher"
            >
              {removeClassTeacherMutation.isPending ? "Removing..." : "Remove Teacher"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </TabsContent>
        
        <TabsContent value="feed" className="space-y-6 mt-6">
          {/* Class Feed */}
          <Newsfeed 
            feedScope="class"
            classId={classId}
            showPostForm={user?.role === 'admin' || user?.role === 'teacher'}
          />
        </TabsContent>
      </Tabs>

    </div>
  );
}