import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

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
  originalRowNumber: number; // Store original spreadsheet row number
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export default function StudentBulkUpload() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Template download functionality
  const downloadTemplate = () => {
    const templateData = [
      {
        'First Name': 'John',
        'Last Name': 'Doe',
        'Admission Number': 'STU001',
        'Class': '10 A',
        'Roll Number': '1',
        'Email': 'john.doe@student.com',
        'Contact Number': '9876543210',
        'Date of Birth': '2008-05-15',
        'Gender': 'male',
        'Blood Group': 'O+',
        'Address': '123 Main Street, City',
        'Emergency Contact': '9876543211'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    
    // Set column widths
    const columnWidths = [
      { wch: 20 }, // First Name
      { wch: 20 }, // Last Name
      { wch: 18 }, // Admission Number
      { wch: 12 }, // Class
      { wch: 12 }, // Roll Number
      { wch: 25 }, // Email
      { wch: 15 }, // Contact Number
      { wch: 15 }, // Date of Birth
      { wch: 10 }, // Gender
      { wch: 12 }, // Blood Group
      { wch: 30 }, // Address
      { wch: 15 }  // Emergency Contact
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.writeFile(workbook, 'student-import-template.xlsx');
    toast({
      title: "Template Downloaded",
      description: "Use this template to prepare your student data for import."
    });
  };

  // File validation
  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload an Excel file (.xlsx or .xls)"
      });
      return false;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "File size must be less than 5MB"
      });
      return false;
    }

    return true;
  };

  // File upload handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setSelectedFile(file);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast({
            variant: "destructive",
            title: "Empty File",
            description: "The uploaded file contains no data"
          });
          setIsProcessing(false);
          return;
        }

        // Parse data as-is without validation and navigate to review page
        const parsedStudents = jsonData.map((row: any, index) => {
          const student: any = {
            originalRowNumber: index + 2 // Account for header row
          };
          
          // Map all fields as-is
          if (row['First Name']) student.firstName = row['First Name'].toString().trim();
          if (row['Last Name']) student.lastName = row['Last Name'].toString().trim();
          if (row['Admission Number']) student.admissionNumber = row['Admission Number'].toString().trim();
          if (row['Class']) student.classId = row['Class'].toString().trim();
          if (row['Roll Number']) student.rollNumber = row['Roll Number'].toString().trim();
          if (row['Email']) student.email = row['Email'].toString().trim();
          if (row['Contact Number']) student.contactNumber = row['Contact Number'].toString().trim();
          if (row['Date of Birth']) student.dateOfBirth = row['Date of Birth'].toString().trim();
          if (row['Gender']) student.gender = row['Gender'].toString().toLowerCase().trim();
          if (row['Blood Group']) student.bloodGroup = row['Blood Group'].toString().trim();
          if (row['Address']) student.address = row['Address'].toString().trim();
          if (row['Emergency Contact']) student.emergencyContact = row['Emergency Contact'].toString().trim();
          
          return student;
        });
        
        setIsProcessing(false);
        
        // Store data in sessionStorage and navigate to review page
        sessionStorage.setItem('studentBulkData', JSON.stringify(parsedStudents));
        setLocation('/students/bulk-review');
        
        toast({
          title: "File Uploaded",
          description: `Parsed ${parsedStudents.length} student records. Redirecting to review page...`
        });
      } catch (error) {
        console.error('Error parsing file:', error);
        toast({
          variant: "destructive",
          title: "Error Processing File",
          description: "Unable to read the Excel file. Please check the format."
        });
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  }, [toast, setLocation]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation('/students')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Bulk Import Students</h1>
          <p className="text-muted-foreground">
            Upload an Excel file to import multiple students at once
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Template
            </CardTitle>
            <CardDescription>
              Get the Excel template with the correct format for student data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Required fields:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>First Name</li>
                <li>Last Name</li>
                <li>Admission Number</li>
                <li>Class</li>
              </ul>
              
              <p className="font-medium mt-4 mb-2">Optional fields:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Roll Number</li>
                <li>Email</li>
                <li>Contact Number</li>
                <li>Date of Birth</li>
                <li>Gender</li>
                <li>Blood Group</li>
                <li>Address</li>
                <li>Emergency Contact</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Upload Student Data
            </CardTitle>
            <CardDescription>
              Select an Excel file (.xlsx or .xls) containing student information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="file">Excel File</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
            </div>
            
            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
            
            {isProcessing && (
              <div className="text-sm text-blue-600">
                Processing file... Please wait.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Import Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">📋 Data Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• First Name, Last Name, Admission Number, and Class are required</li>
                <li>• Admission numbers must be unique within your school</li>
                <li>• Contact numbers must be exactly 10 digits (if provided)</li>
                <li>• Email addresses must be valid format (if provided)</li>
                <li>• Class format should match existing classes (e.g., "10 A", "9 B")</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚡ Process Overview</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Step 1: Upload your Excel file</li>
                <li>• Step 2: Review and edit data on the next page</li>
                <li>• Step 3: Fix any validation errors</li>
                <li>• Step 4: Submit for final import</li>
                <li>• You can edit any cell before final submission</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}