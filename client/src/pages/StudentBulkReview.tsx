import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, AlertTriangle, CheckCircle, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentImportData {
  firstName: string;
  lastName: string;
  admissionNumber: string;
  classId: string;
  rollNumber?: string;
  email?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  originalRowNumber: number;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface CellError {
  message: string;
}

export default function StudentBulkReview() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentImportData[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, CellError>>({});
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);

  // Load data from sessionStorage on mount
  useEffect(() => {
    const storedData = sessionStorage.getItem('studentBulkData');
    if (!storedData) {
      toast({
        variant: "destructive",
        title: "No Data Found",
        description: "No uploaded data found. Please upload a file first."
      });
      setLocation('/students/bulk-upload');
      return;
    }

    try {
      const parsedStudents = JSON.parse(storedData);
      setStudents(parsedStudents);
      validateAllDataWithDatabase(parsedStudents);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid Data",
        description: "Failed to load uploaded data. Please try uploading again."
      });
      setLocation('/students/bulk-upload');
    }
  }, [toast, setLocation]);

  // Validate all data with database checks
  const validateAllDataWithDatabase = async (studentData: StudentImportData[]) => {
    const errors: Record<string, CellError> = {};
    const admissionNumberMap = new Map<string, number>(); // Track admission numbers and their first occurrence
    const emailMap = new Map<string, number>(); // Track email addresses and their first occurrence
    const contactMap = new Map<string, number>(); // Track contact numbers and their first occurrence

    // Get existing students and classes from database for validation
    let existingStudents: any[] = [];
    let classes: any[] = [];
    try {
      const [studentsResponse, classesResponse] = await Promise.all([
        apiRequest("GET", "/api/students"),
        apiRequest("GET", "/api/classes")
      ]);
      existingStudents = await studentsResponse.json();
      classes = await classesResponse.json();
      
      // Sort classes by grade then section for dropdown display
      const sortedClasses = classes.sort((a, b) => {
        const gradeA = parseInt(a.grade) || 0;
        const gradeB = parseInt(b.grade) || 0;
        if (gradeA !== gradeB) return gradeA - gradeB;
        return a.section.localeCompare(b.section);
      });
      setAvailableClasses(sortedClasses);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Failed to validate against existing data"
      });
    }

    studentData.forEach((student, index) => {
      // Required fields validation
      if (!student.firstName || student.firstName.trim() === '') {
        errors[`${index}-firstName`] = { message: 'First name is required' };
      }

      if (!student.lastName || student.lastName.trim() === '') {
        errors[`${index}-lastName`] = { message: 'Last name is required' };
      }

      if (!student.admissionNumber || student.admissionNumber.trim() === '') {
        errors[`${index}-admissionNumber`] = { message: 'Admission number is required' };
      } else {
        const admissionNumber = student.admissionNumber.trim();
        
        // Check for duplicate admission numbers within batch
        if (admissionNumberMap.has(admissionNumber)) {
          const firstOccurrence = admissionNumberMap.get(admissionNumber)!;
          errors[`${index}-admissionNumber`] = { message: `Duplicate admission number found in row ${firstOccurrence + 1}` };
          // Also mark the first occurrence as having a duplicate
          errors[`${firstOccurrence}-admissionNumber`] = { message: `Duplicate admission number found in row ${index + 1}` };
        } else {
          // Check against database
          const existingWithSameAdmission = existingStudents.find(
            existingStudent => existingStudent.admissionNumber === admissionNumber
          );
          if (existingWithSameAdmission) {
            errors[`${index}-admissionNumber`] = { message: 'Admission number already exists in database' };
          } else {
            admissionNumberMap.set(admissionNumber, index);
          }
        }
      }

      if (!student.classId || student.classId.trim() === '') {
        errors[`${index}-classId`] = { message: 'Class is required' };
      } else {
        // Validate class exists in school
        const classExists = classes.find(cls => 
          `${cls.grade}-${cls.section}` === student.classId.trim() ||
          `${cls.grade}${cls.section}` === student.classId.trim() ||
          cls.id === student.classId.trim()
        );
        if (!classExists) {
          errors[`${index}-classId`] = { message: 'Class does not exist in school. Please select from available classes.' };
        }
      }

      // Contact number validation (if provided)
      if (student.contactNumber && student.contactNumber.trim() !== '') {
        const contact = student.contactNumber.trim();
        if (!/^\d{10}$/.test(contact)) {
          errors[`${index}-contactNumber`] = { message: 'Contact number must be exactly 10 digits' };
        } else {
          // Check for duplicate contact numbers within batch
          if (contactMap.has(contact)) {
            const firstOccurrence = contactMap.get(contact)!;
            errors[`${index}-contactNumber`] = { message: `Duplicate contact number found in row ${firstOccurrence + 1}` };
            // Also mark the first occurrence as having a duplicate
            errors[`${firstOccurrence}-contactNumber`] = { message: `Duplicate contact number found in row ${index + 1}` };
          } else {
            // Check against database
            const existingWithSameContact = existingStudents.find(
              existingStudent => existingStudent.contactNumber === contact
            );
            if (existingWithSameContact) {
              errors[`${index}-contactNumber`] = { message: 'Contact number already exists in database' };
            } else {
              contactMap.set(contact, index);
            }
          }
        }
      }

      // Email validation (if provided)
      if (student.email && student.email.trim() !== '') {
        const email = student.email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors[`${index}-email`] = { message: 'Invalid email format' };
        } else {
          // Check for duplicate email addresses within batch
          if (emailMap.has(email)) {
            const firstOccurrence = emailMap.get(email)!;
            errors[`${index}-email`] = { message: `Duplicate email found in row ${firstOccurrence + 1}` };
            // Also mark the first occurrence as having a duplicate
            errors[`${firstOccurrence}-email`] = { message: `Duplicate email found in row ${index + 1}` };
          } else {
            emailMap.set(email, index);
          }
        }
      }

      // Gender validation (if provided)
      if (student.gender && student.gender.trim() !== '') {
        const gender = student.gender.toLowerCase().trim();
        if (!['male', 'female', 'other'].includes(gender)) {
          errors[`${index}-gender`] = { message: 'Gender must be male, female, or other' };
        }
      }
    });

    setValidationErrors(errors);
  };

  // Validate all data (synchronous version for compatibility)
  const validateAllData = (studentData: StudentImportData[]) => {
    const errors: Record<string, CellError> = {};
    const admissionNumberMap = new Map<string, number>(); // Track admission numbers and their first occurrence
    const emailMap = new Map<string, number>(); // Track email addresses and their first occurrence
    const contactMap = new Map<string, number>(); // Track contact numbers and their first occurrence

    studentData.forEach((student, index) => {
      // Required fields validation
      if (!student.firstName || student.firstName.trim() === '') {
        errors[`${index}-firstName`] = { message: 'First name is required' };
      }

      if (!student.lastName || student.lastName.trim() === '') {
        errors[`${index}-lastName`] = { message: 'Last name is required' };
      }

      if (!student.admissionNumber || student.admissionNumber.trim() === '') {
        errors[`${index}-admissionNumber`] = { message: 'Admission number is required' };
      } else {
        // Check for duplicate admission numbers within batch
        const admissionNumber = student.admissionNumber.trim();
        if (admissionNumberMap.has(admissionNumber)) {
          const firstOccurrence = admissionNumberMap.get(admissionNumber)!;
          errors[`${index}-admissionNumber`] = { message: `Duplicate admission number found in row ${firstOccurrence + 1}` };
          // Also mark the first occurrence as having a duplicate
          errors[`${firstOccurrence}-admissionNumber`] = { message: `Duplicate admission number found in row ${index + 1}` };
        } else {
          admissionNumberMap.set(admissionNumber, index);
        }
      }

      if (!student.classId || student.classId.trim() === '') {
        errors[`${index}-classId`] = { message: 'Class is required' };
      } else {
        // Validate class exists in school
        const classExists = classes.find(cls => 
          `${cls.grade}-${cls.section}` === student.classId.trim() ||
          `${cls.grade}${cls.section}` === student.classId.trim() ||
          cls.id === student.classId.trim()
        );
        if (!classExists) {
          errors[`${index}-classId`] = { message: 'Class does not exist in school. Please select from available classes.' };
        }
      }

      // Contact number validation (if provided)
      if (student.contactNumber && student.contactNumber.trim() !== '') {
        const contact = student.contactNumber.trim();
        if (!/^\d{10}$/.test(contact)) {
          errors[`${index}-contactNumber`] = { message: 'Contact number must be exactly 10 digits' };
        } else {
          // Check for duplicate contact numbers within batch
          if (contactMap.has(contact)) {
            const firstOccurrence = contactMap.get(contact)!;
            errors[`${index}-contactNumber`] = { message: `Duplicate contact number found in row ${firstOccurrence + 1}` };
            // Also mark the first occurrence as having a duplicate
            errors[`${firstOccurrence}-contactNumber`] = { message: `Duplicate contact number found in row ${index + 1}` };
          } else {
            contactMap.set(contact, index);
          }
        }
      }

      // Email validation (if provided)
      if (student.email && student.email.trim() !== '') {
        const email = student.email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors[`${index}-email`] = { message: 'Invalid email format' };
        } else {
          // Check for duplicate email addresses within batch
          if (emailMap.has(email)) {
            const firstOccurrence = emailMap.get(email)!;
            errors[`${index}-email`] = { message: `Duplicate email found in row ${firstOccurrence + 1}` };
            // Also mark the first occurrence as having a duplicate
            errors[`${firstOccurrence}-email`] = { message: `Duplicate email found in row ${index + 1}` };
          } else {
            emailMap.set(email, index);
          }
        }
      }

      // Gender validation (if provided)
      if (student.gender && student.gender.trim() !== '') {
        const gender = student.gender.toLowerCase().trim();
        if (!['male', 'female', 'other'].includes(gender)) {
          errors[`${index}-gender`] = { message: 'Gender must be male, female, or other' };
        }
      }
    });

    setValidationErrors(errors);
  };

  // Update cell value
  const updateCellValue = (index: number, field: keyof StudentImportData, value: string) => {
    const updatedStudents = [...students];
    updatedStudents[index] = { ...updatedStudents[index], [field]: value };
    setStudents(updatedStudents);
    
    // Validate single field with updated students array
    validateSingleField(index, field, value, updatedStudents);
  };

  // Validate single field with database checks
  const validateSingleField = async (index: number, field: keyof StudentImportData, value: string, currentStudents: StudentImportData[] = students) => {
    const cellKey = `${index}-${field}`;
    const newErrors = { ...validationErrors };

    // For duplicate-prone fields, clear all related errors and re-validate all rows
    if (['admissionNumber', 'email', 'contactNumber'].includes(field)) {
      // Get existing students from database for validation
      let existingStudents: any[] = [];
      try {
        const response = await apiRequest("GET", "/api/students");
        existingStudents = await response.json();
      } catch (error) {
        console.error("Error fetching existing students:", error);
      }

      // Clear all errors for this field type across all rows
      Object.keys(newErrors).forEach(errorKey => {
        if (errorKey.endsWith(`-${field}`)) {
          delete newErrors[errorKey];
        }
      });

      // Re-validate all rows for this field type using the current students data
      currentStudents.forEach((student, studentIndex) => {
        const studentCellKey = `${studentIndex}-${field}`;
        const studentValue = field === 'admissionNumber' ? student.admissionNumber :
                           field === 'email' ? student.email :
                           field === 'contactNumber' ? student.contactNumber : '';

        if (studentValue && studentValue.trim() !== '') {
          const trimmedValue = studentValue.trim();
          
          // For the current field being edited, use the new value
          const valueToCheck = studentIndex === index ? value.trim() : trimmedValue;
          
          if (field === 'contactNumber' && !/^\d{10}$/.test(valueToCheck)) {
            newErrors[studentCellKey] = { message: 'Contact number must be exactly 10 digits' };
          } else if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valueToCheck)) {
            newErrors[studentCellKey] = { message: 'Invalid email format' };
          } else {
            // Check for duplicates within current batch
            const duplicateIndex = currentStudents.findIndex((otherStudent, otherIndex) => {
              if (otherIndex === studentIndex) return false;
              
              const otherValue = field === 'admissionNumber' ? otherStudent.admissionNumber :
                               field === 'email' ? otherStudent.email :
                               field === 'contactNumber' ? otherStudent.contactNumber : '';
              
              const otherValueToCheck = otherIndex === index ? value.trim() : otherValue?.trim();
              return otherValueToCheck === valueToCheck;
            });
            
            if (duplicateIndex !== -1) {
              newErrors[studentCellKey] = { message: `Duplicate ${field === 'admissionNumber' ? 'admission number' : field === 'contactNumber' ? 'contact number' : 'email'} found in row ${duplicateIndex + 1}` };
            } else {
              // Check against database for admission number and contact number
              if (field === 'admissionNumber' || field === 'contactNumber') {
                const existingStudent = existingStudents.find(existingStudent => {
                  if (field === 'admissionNumber') {
                    return existingStudent.admissionNumber === valueToCheck;
                  } else if (field === 'contactNumber') {
                    return existingStudent.contactNumber === valueToCheck;
                  }
                  return false;
                });
                
                if (existingStudent) {
                  const fieldName = field === 'admissionNumber' ? 'Admission number' : 'Contact number';
                  newErrors[studentCellKey] = { message: `${fieldName} already exists in database` };
                }
              }
            }
          }
        }
      });
      
      // Validate required fields
      if (field === 'admissionNumber' && (!value || value.trim() === '')) {
        newErrors[cellKey] = { message: 'Admission number is required' };
      }
    } else {
      // For non-duplicate fields, simple validation
      switch (field) {
        case 'firstName':
          if (!value || value.trim() === '') {
            newErrors[cellKey] = { message: 'First name is required' };
          }
          break;
        case 'lastName':
          if (!value || value.trim() === '') {
            newErrors[cellKey] = { message: 'Last name is required' };
          }
          break;
        case 'classId':
          if (!value || value.trim() === '') {
            newErrors[cellKey] = { message: 'Class is required' };
          } else {
            // Validate class exists in school
            const classExists = availableClasses.find(cls => 
              `${cls.grade}-${cls.section}` === value.trim() ||
              `${cls.grade}${cls.section}` === value.trim() ||
              cls.id === value.trim()
            );
            if (!classExists) {
              newErrors[cellKey] = { message: 'Class does not exist in school. Please select from available classes.' };
            } else {
              // Clear error if class is valid
              delete newErrors[cellKey];
            }
          }
          break;
        case 'gender':
          if (value && value.trim() !== '' && !['male', 'female', 'other'].includes(value.toLowerCase())) {
            newErrors[cellKey] = { message: 'Gender must be male, female, or other' };
          }
          break;
      }
    }

    setValidationErrors(newErrors);
  };

  // Bulk upload mutation
  const bulkUploadMutation = useMutation({
    mutationFn: async (studentData: StudentImportData[]) => {
      const response = await apiRequest("POST", "/api/students/bulk-upload", { students: studentData });
      return await response.json();
    },
    onSuccess: (data: any) => {
      sessionStorage.removeItem('studentBulkData'); // Clean up
      
      if (data.errors && data.errors.length > 0) {
        toast({
          variant: "destructive",
          title: "Partial Import",
          description: `${data.imported} students imported successfully, ${data.errors.length} failed.`
        });
      } else {
        toast({
          title: "Success",
          description: `Successfully imported ${data.imported || students.length} students`
        });
      }
      setLocation('/students');
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to import students"
      });
    }
  });

  const handleSubmit = () => {
    const errorCount = Object.keys(validationErrors).length;
    if (errorCount > 0) {
      toast({
        variant: "destructive",
        title: "Validation Errors",
        description: `Please fix ${errorCount} validation errors before submitting`
      });
      return;
    }

    bulkUploadMutation.mutate(students);
  };

  const getCellError = (index: number, field: keyof StudentImportData) => {
    return validationErrors[`${index}-${field}`];
  };

  // Render editable cell
  const renderEditableCell = (student: StudentImportData, index: number, field: keyof StudentImportData) => {
    const value = student[field] || '';
    const error = getCellError(index, field);
    
    const cellClassName = cn(
      "min-h-8 px-1 py-1 text-xs border-0 bg-transparent cursor-pointer hover:bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded text-left w-full break-all whitespace-normal leading-tight resize-none overflow-hidden",
      error && "bg-red-50 border border-red-200"
    );

    // Special handling for select fields
    if (field === 'gender') {
      const options = ['male', 'female', 'other'];
      return (
        <Select
          value={value.toString() || 'not_specified'}
          onValueChange={(newValue) => updateCellValue(index, field, newValue === 'not_specified' ? '' : newValue)}
        >
          <SelectTrigger className={cn(cellClassName, "min-h-8 whitespace-normal break-all leading-tight")}>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_specified">Not specified</SelectItem>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Special handling for class field when there's a validation error
    if (field === 'classId' && error && error.message.includes('does not exist in school')) {
      return (
        <Select
          value={value.toString() || 'select_class'}
          onValueChange={(newValue) => updateCellValue(index, field, newValue === 'select_class' ? '' : newValue)}
        >
          <SelectTrigger className={cn(cellClassName, "min-h-8 whitespace-normal break-all leading-tight")}>
            <SelectValue placeholder="Select class..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="select_class">Select a class...</SelectItem>
            {availableClasses.map((cls) => (
              <SelectItem key={cls.id} value={cls.section ? `${cls.grade}-${cls.section}` : cls.grade}>
                {cls.section ? `Class ${cls.grade} ${cls.section}` : `Class ${cls.grade}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Regular textarea for all other fields
    return (
      <div>
        <textarea
          value={value.toString()}
          onChange={(e) => updateCellValue(index, field, e.target.value)}
          className={cn(cellClassName, "resize-none overflow-hidden min-h-8 leading-tight")}
          placeholder={['firstName', 'lastName', 'admissionNumber', 'classId'].includes(field) ? 'Required' : 'Optional'}
          rows={1}
          style={{
            height: 'auto',
            minHeight: '2rem'
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
      </div>
    );
  };

  const errorCount = Object.keys(validationErrors).length;
  const hasData = students.length > 0;

  return (
    <div className="container mx-auto p-3 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            sessionStorage.removeItem('studentBulkData');
            setLocation('/students/bulk-upload');
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Review Student Data</h1>
          <p className="text-sm text-muted-foreground">
            Review and edit the uploaded student data before final submission
          </p>
        </div>
      </div>

      {/* Status Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              {errorCount > 0 ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>Validation Issues ({errorCount})</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Ready to Submit</span>
                </>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {students.length} students loaded
            </div>
          </CardTitle>
          {errorCount > 0 && (
            <CardDescription className="text-amber-600 text-sm">
              Please fix validation errors (marked with ⚠️) before submitting
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Editable Table */}
      {hasData && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Student Data</CardTitle>
            <CardDescription className="text-sm">
              Click on any cell to edit. Required fields: First Name*, Last Name*, Admission Number*, Class*
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3">
            <div className="border rounded-lg">
              <table className="w-full border-collapse text-sm table-fixed">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-1 py-1 font-medium text-xs border-r w-8">Row</th>
                    <th className="text-left px-1 py-1 font-medium text-xs border-r w-20">First Name*</th>
                    <th className="text-left px-1 py-1 font-medium text-xs border-r w-20">Last Name*</th>
                    <th className="text-left px-1 py-1 font-medium text-xs border-r w-18">Admission No*</th>
                    <th className="text-left px-1 py-1 font-medium text-xs border-r w-12">Class*</th>
                    <th className="text-left px-1 py-1 font-medium text-xs border-r w-12">Roll No</th>
                    <th className="text-left px-1 py-1 font-medium text-xs border-r w-32">Email</th>
                    <th className="text-left px-1 py-1 font-medium text-xs border-r w-20">Contact</th>
                    <th className="text-left px-1 py-1 font-medium text-xs border-r w-20">Date of Birth</th>
                    <th className="text-left px-1 py-1 font-medium text-xs border-r w-16">Gender</th>
                    <th className="text-left px-1 py-1 font-medium text-xs border-r w-16">Blood Group</th>
                    <th className="text-left px-1 py-1 font-medium text-xs border-r w-28">Address</th>
                    <th className="text-left px-1 py-1 font-medium text-xs w-20">Emergency Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-1 py-1 text-xs text-muted-foreground border-r bg-gray-50 w-8">
                        {index + 1}
                      </td>
                      <td className="px-1 py-1 border-r w-20">
                        {renderEditableCell(student, index, 'firstName')}
                        {getCellError(index, 'firstName') && (
                          <div className="text-xs text-red-500 mt-0.5 break-words">
                            ⚠️ {getCellError(index, 'firstName')?.message}
                          </div>
                        )}
                      </td>
                      <td className="px-1 py-1 border-r w-20">
                        {renderEditableCell(student, index, 'lastName')}
                        {getCellError(index, 'lastName') && (
                          <div className="text-xs text-red-500 mt-0.5 break-words">
                            ⚠️ {getCellError(index, 'lastName')?.message}
                          </div>
                        )}
                      </td>
                      <td className="px-1 py-1 border-r w-18">
                        {renderEditableCell(student, index, 'admissionNumber')}
                        {getCellError(index, 'admissionNumber') && (
                          <div className="text-xs text-red-500 mt-0.5 break-words">
                            ⚠️ {getCellError(index, 'admissionNumber')?.message}
                          </div>
                        )}
                      </td>
                      <td className="px-1 py-1 border-r w-12">
                        {renderEditableCell(student, index, 'classId')}
                        {getCellError(index, 'classId') && (
                          <div className="text-xs text-red-500 mt-0.5 break-words">
                            ⚠️ {getCellError(index, 'classId')?.message}
                          </div>
                        )}
                      </td>
                      <td className="px-1 py-1 border-r w-12">
                        {renderEditableCell(student, index, 'rollNumber')}
                        {getCellError(index, 'rollNumber') && (
                          <div className="text-xs text-red-500 mt-0.5 break-words">
                            ⚠️ {getCellError(index, 'rollNumber')?.message}
                          </div>
                        )}
                      </td>
                      <td className="px-1 py-1 border-r w-32">
                        {renderEditableCell(student, index, 'email')}
                        {getCellError(index, 'email') && (
                          <div className="text-xs text-red-500 mt-0.5 break-words">
                            ⚠️ {getCellError(index, 'email')?.message}
                          </div>
                        )}
                      </td>
                      <td className="px-1 py-1 border-r w-20">
                        {renderEditableCell(student, index, 'contactNumber')}
                        {getCellError(index, 'contactNumber') && (
                          <div className="text-xs text-red-500 mt-0.5 break-words">
                            ⚠️ {getCellError(index, 'contactNumber')?.message}
                          </div>
                        )}
                      </td>
                      <td className="px-1 py-1 border-r w-20">
                        {renderEditableCell(student, index, 'dateOfBirth')}
                        {getCellError(index, 'dateOfBirth') && (
                          <div className="text-xs text-red-500 mt-0.5 break-words">
                            ⚠️ {getCellError(index, 'dateOfBirth')?.message}
                          </div>
                        )}
                      </td>
                      <td className="px-1 py-1 border-r w-16">
                        {renderEditableCell(student, index, 'gender')}
                        {getCellError(index, 'gender') && (
                          <div className="text-xs text-red-500 mt-0.5 break-words">
                            ⚠️ {getCellError(index, 'gender')?.message}
                          </div>
                        )}
                      </td>
                      <td className="px-1 py-1 border-r w-16">
                        {renderEditableCell(student, index, 'bloodGroup')}
                        {getCellError(index, 'bloodGroup') && (
                          <div className="text-xs text-red-500 mt-0.5 break-words">
                            ⚠️ {getCellError(index, 'bloodGroup')?.message}
                          </div>
                        )}
                      </td>
                      <td className="px-1 py-1 border-r w-28">
                        {renderEditableCell(student, index, 'address')}
                        {getCellError(index, 'address') && (
                          <div className="text-xs text-red-500 mt-0.5 break-words">
                            ⚠️ {getCellError(index, 'address')?.message}
                          </div>
                        )}
                      </td>
                      <td className="px-1 py-1 w-20">
                        {renderEditableCell(student, index, 'emergencyContact')}
                        {getCellError(index, 'emergencyContact') && (
                          <div className="text-xs text-red-500 mt-0.5 break-words">
                            ⚠️ {getCellError(index, 'emergencyContact')?.message}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Section */}
      {hasData && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {errorCount > 0 ? (
                  <span className="text-amber-600">
                    Fix {errorCount} validation errors before submitting
                  </span>
                ) : (
                  <span className="text-green-600">
                    All data validated successfully
                  </span>
                )}
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={errorCount > 0 || bulkUploadMutation.isPending}
                className="min-w-[120px]"
              >
                {bulkUploadMutation.isPending ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Import {students.length} Students
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}