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

interface ClassImportData {
  grade: string;
  section?: string;
  requiredSubjects: string;
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

export default function ClassBulkReview() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassImportData[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, CellError>>({});
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);

  // Load data from sessionStorage on mount
  useEffect(() => {
    const storedData = sessionStorage.getItem('classBulkData');
    if (!storedData) {
      toast({
        variant: "destructive",
        title: "No Data Found",
        description: "No uploaded data found. Please upload a file first."
      });
      setLocation('/classes/bulk-upload');
      return;
    }

    try {
      const parsedClasses = JSON.parse(storedData);
      setClasses(parsedClasses);
      validateAllDataWithDatabase(parsedClasses);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid Data",
        description: "Failed to load uploaded data. Please try uploading again."
      });
      setLocation('/classes/bulk-upload');
    }
  }, [toast, setLocation]);

  // Validate all data with database checks
  const validateAllDataWithDatabase = async (classData: ClassImportData[]) => {
    const errors: Record<string, CellError> = {};
    const classMap = new Map<string, number>(); // Track grade-section combinations and their first occurrence

    // Get existing classes and subjects from database for validation
    let existingClasses: any[] = [];
    let subjects: any[] = [];
    try {
      const [classesResponse, subjectsResponse] = await Promise.all([
        apiRequest("GET", "/api/classes"),
        apiRequest("GET", "/api/subjects")
      ]);
      existingClasses = await classesResponse.json();
      subjects = await subjectsResponse.json();
      setAvailableSubjects(subjects);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Failed to validate against existing data"
      });
    }

    classData.forEach((classItem, index) => {
      // Required fields validation
      if (!classItem.grade || classItem.grade.trim() === '') {
        errors[`${index}-grade`] = { message: 'Grade is required' };
      }

      if (!classItem.requiredSubjects || classItem.requiredSubjects.trim() === '') {
        errors[`${index}-requiredSubjects`] = { message: 'Required subjects is required' };
      } else {
        // Validate subjects format and existence
        const subjectNames = classItem.requiredSubjects.split(',').map(s => s.trim()).filter(Boolean);
        if (subjectNames.length === 0) {
          errors[`${index}-requiredSubjects`] = { message: 'At least one subject is required' };
        }
      }

      // Check for duplicate grade-section combinations
      const classKey = `${classItem.grade.trim()}-${(classItem.section || '').trim()}`;
      if (classMap.has(classKey)) {
        const firstOccurrence = classMap.get(classKey)!;
        const displaySection = classItem.section ? ` ${classItem.section}` : '';
        errors[`${index}-grade`] = { message: `Duplicate class Grade ${classItem.grade}${displaySection} found in row ${firstOccurrence + 1}` };
        // Also mark the first occurrence as having a duplicate
        errors[`${firstOccurrence}-grade`] = { message: `Duplicate class Grade ${classItem.grade}${displaySection} found in row ${index + 1}` };
      } else {
        // Check against database
        const existingClass = existingClasses.find(
          existingCls => existingCls.grade === classItem.grade.trim() && 
                        (existingCls.section || '') === (classItem.section || '').trim()
        );
        if (existingClass) {
          const displaySection = classItem.section ? ` ${classItem.section}` : '';
          errors[`${index}-grade`] = { message: `Class Grade ${classItem.grade}${displaySection} already exists in database` };
        } else {
          classMap.set(classKey, index);
        }
      }

      // Grade validation - should be numeric
      if (classItem.grade && classItem.grade.trim() !== '') {
        const grade = classItem.grade.trim();
        if (!/^\d+$/.test(grade)) {
          errors[`${index}-grade`] = { message: 'Grade should be numeric (e.g., 9, 10, 11, 12)' };
        }
      }
    });

    setValidationErrors(errors);
  };

  // Update cell value
  const updateCellValue = (index: number, field: keyof ClassImportData, value: string) => {
    const updatedClasses = [...classes];
    updatedClasses[index] = { ...updatedClasses[index], [field]: value };
    setClasses(updatedClasses);
    
    // Validate single field with updated classes array
    validateSingleField(index, field, value, updatedClasses);
  };

  // Validate single field
  const validateSingleField = async (index: number, field: keyof ClassImportData, value: string, updatedClasses: ClassImportData[]) => {
    const newErrors = { ...validationErrors };
    
    // Clear existing error for this field
    delete newErrors[`${index}-${field}`];

    // For duplicate-prone fields, clear all related errors and re-validate all rows
    if (['grade'].includes(field)) {
      // Get existing classes from database for validation
      let existingClasses: any[] = [];
      try {
        const response = await apiRequest("GET", "/api/classes");
        existingClasses = await response.json();
      } catch (error) {
        console.error("Error fetching existing classes:", error);
      }

      // Clear all errors for this field type across all rows
      Object.keys(newErrors).forEach(errorKey => {
        if (errorKey.endsWith(`-${field}`)) {
          delete newErrors[errorKey];
        }
      });

      // Re-validate all grade-section combinations
      const classMap = new Map<string, number>();
      updatedClasses.forEach((classItem, idx) => {
        if (classItem.grade && classItem.grade.trim() !== '') {
          const classKey = `${classItem.grade.trim()}-${(classItem.section || '').trim()}`;
          
          if (classMap.has(classKey)) {
            const firstOccurrence = classMap.get(classKey)!;
            const displaySection = classItem.section ? ` ${classItem.section}` : '';
            newErrors[`${idx}-grade`] = { message: `Duplicate class Grade ${classItem.grade}${displaySection} found in row ${firstOccurrence + 1}` };
            newErrors[`${firstOccurrence}-grade`] = { message: `Duplicate class Grade ${classItem.grade}${displaySection} found in row ${idx + 1}` };
          } else {
            // Check against database
            const existingClass = existingClasses.find(
              existingCls => existingCls.grade === classItem.grade.trim() && 
                            (existingCls.section || '') === (classItem.section || '').trim()
            );
            if (existingClass) {
              const displaySection = classItem.section ? ` ${classItem.section}` : '';
              newErrors[`${idx}-grade`] = { message: `Class Grade ${classItem.grade}${displaySection} already exists in database` };
            } else {
              classMap.set(classKey, idx);
            }
          }
        }
      });
    } else {
      // Validate individual field
      if (field === 'grade') {
        if (!value || value.trim() === '') {
          newErrors[`${index}-${field}`] = { message: 'Grade is required' };
        } else if (!/^\d+$/.test(value.trim())) {
          newErrors[`${index}-${field}`] = { message: 'Grade should be numeric (e.g., 9, 10, 11, 12)' };
        }
      } else if (field === 'requiredSubjects') {
        if (!value || value.trim() === '') {
          newErrors[`${index}-${field}`] = { message: 'Required subjects is required' };
        } else {
          const subjectNames = value.split(',').map(s => s.trim()).filter(Boolean);
          if (subjectNames.length === 0) {
            newErrors[`${index}-${field}`] = { message: 'At least one subject is required' };
          }
        }
      }
    }

    setValidationErrors(newErrors);
  };

  // Bulk upload mutation
  const bulkUploadMutation = useMutation({
    mutationFn: async (classData: ClassImportData[]) => {
      const response = await apiRequest("POST", "/api/classes/bulk-upload", { classes: classData });
      return await response.json();
    },
    onSuccess: (data: any) => {
      sessionStorage.removeItem('classBulkData'); // Clean up
      
      if (data.errors && data.errors.length > 0) {
        toast({
          variant: "destructive",
          title: "Partial Import",
          description: `${data.imported} classes imported successfully, ${data.errors.length} failed.`
        });
      } else {
        toast({
          title: "Import Successful",
          description: `${data.imported} classes imported successfully.`
        });
        setLocation('/classes');
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error.message || "Failed to import classes"
      });
    }
  });

  // Handle import
  const handleImport = () => {
    const hasErrors = Object.keys(validationErrors).length > 0;
    if (hasErrors) {
      toast({
        variant: "destructive",
        title: "Validation Errors",
        description: "Please fix all validation errors before importing."
      });
      return;
    }

    bulkUploadMutation.mutate(classes);
  };

  // Get validation summary
  const errorCount = Object.keys(validationErrors).length;
  const canImport = errorCount === 0 && classes.length > 0;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation('/classes/bulk-upload')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Review Class Data</h1>
          <p className="text-muted-foreground">
            Review and fix any validation errors before importing
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {errorCount === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              )}
              Import Summary
            </div>
            <Button
              onClick={handleImport}
              disabled={!canImport || bulkUploadMutation.isPending}
              className="ml-auto"
            >
              {bulkUploadMutation.isPending ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Classes
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{classes.length}</div>
              <div className="text-muted-foreground">Total Classes</div>
            </div>
            <div className="text-center">
              <div className={cn("text-2xl font-bold", errorCount === 0 ? "text-green-600" : "text-red-600")}>
                {errorCount}
              </div>
              <div className="text-muted-foreground">Validation Errors</div>
            </div>
            <div className="text-center">
              <div className={cn("text-2xl font-bold", canImport ? "text-green-600" : "text-gray-400")}>
                {canImport ? "Ready" : "Not Ready"}
              </div>
              <div className="text-muted-foreground">Import Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Class Data Preview</CardTitle>
          <CardDescription>
            Review and edit class information. Click on any cell to edit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Row</th>
                  <th className="text-left p-2 font-medium">Grade *</th>
                  <th className="text-left p-2 font-medium">Section</th>
                  <th className="text-left p-2 font-medium">Required Subjects *</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((classItem, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 text-sm text-muted-foreground">
                      {classItem.originalRowNumber}
                    </td>
                    
                    {/* Grade Cell */}
                    <td className="p-2">
                      <div className="relative">
                        {editingCell === `${index}-grade` ? (
                          <input
                            type="text"
                            value={classItem.grade || ''}
                            onChange={(e) => updateCellValue(index, 'grade', e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingCell(null);
                            }}
                            className="w-full px-2 py-1 border rounded text-sm"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => setEditingCell(`${index}-grade`)}
                            className={cn(
                              "p-1 cursor-pointer hover:bg-muted/50 rounded text-sm min-h-[24px]",
                              validationErrors[`${index}-grade`] && "bg-red-50 border border-red-200"
                            )}
                          >
                            {classItem.grade || <span className="text-muted-foreground">Click to edit</span>}
                          </div>
                        )}
                        {validationErrors[`${index}-grade`] && (
                          <div className="absolute z-10 mt-1 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700 shadow-lg">
                            {validationErrors[`${index}-grade`].message}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Section Cell */}
                    <td className="p-2">
                      <div className="relative">
                        {editingCell === `${index}-section` ? (
                          <input
                            type="text"
                            value={classItem.section || ''}
                            onChange={(e) => updateCellValue(index, 'section', e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingCell(null);
                            }}
                            className="w-full px-2 py-1 border rounded text-sm"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => setEditingCell(`${index}-section`)}
                            className={cn(
                              "p-1 cursor-pointer hover:bg-muted/50 rounded text-sm min-h-[24px]",
                              validationErrors[`${index}-section`] && "bg-red-50 border border-red-200"
                            )}
                          >
                            {classItem.section || <span className="text-muted-foreground">Optional</span>}
                          </div>
                        )}
                        {validationErrors[`${index}-section`] && (
                          <div className="absolute z-10 mt-1 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700 shadow-lg">
                            {validationErrors[`${index}-section`].message}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Required Subjects Cell */}
                    <td className="p-2">
                      <div className="relative">
                        {editingCell === `${index}-requiredSubjects` ? (
                          <input
                            type="text"
                            value={classItem.requiredSubjects || ''}
                            onChange={(e) => updateCellValue(index, 'requiredSubjects', e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingCell(null);
                            }}
                            className="w-full px-2 py-1 border rounded text-sm"
                            autoFocus
                            placeholder="Mathematics, Science, English"
                          />
                        ) : (
                          <div
                            onClick={() => setEditingCell(`${index}-requiredSubjects`)}
                            className={cn(
                              "p-1 cursor-pointer hover:bg-muted/50 rounded text-sm min-h-[24px]",
                              validationErrors[`${index}-requiredSubjects`] && "bg-red-50 border border-red-200"
                            )}
                          >
                            {classItem.requiredSubjects || <span className="text-muted-foreground">Click to edit</span>}
                          </div>
                        )}
                        {validationErrors[`${index}-requiredSubjects`] && (
                          <div className="absolute z-10 mt-1 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700 shadow-lg max-w-sm">
                            {validationErrors[`${index}-requiredSubjects`].message}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {errorCount > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Validation Errors Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-orange-700 space-y-2">
              <p>Please fix the following issues before importing:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Red highlighted cells contain validation errors</li>
                <li>Click on any cell to edit its value</li>
                <li>Subjects should be separated by commas</li>
                <li>All subjects must exist in the system</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}