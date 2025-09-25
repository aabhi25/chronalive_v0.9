import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Calendar, Phone, MapPin, Users, GraduationCap, Mail, Hash, IdCard, School, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function MyProfilePage() {
  const { user } = useAuth();

  // Fetch student details
  const { data: studentDetails, isLoading: loadingStudentDetails } = useQuery({
    queryKey: ["student-details", user?.studentId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/students/${user?.studentId}`);
      return await response.json();
    },
    enabled: user?.role === 'student' && !!user?.studentId
  });

  if (user?.role !== 'student') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground">Access Denied</h2>
          <p className="text-muted-foreground">This page is only available to students.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center space-x-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold">My Profile</h2>
            <p className="text-muted-foreground">View your personal information and academic details</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 overflow-y-auto h-full bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {loadingStudentDetails ? (
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-6">
                    <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-100 rounded w-24"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="space-y-2">
                        <div className="h-8 bg-gray-100 rounded"></div>
                        <div className="h-8 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Student Hero Card */}
              <Card className="border shadow-sm bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <Avatar className="h-20 w-20 border-2 border-gray-200 dark:border-gray-600">
                      <AvatarFallback className="text-xl font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        {studentDetails?.firstName?.[0]}{studentDetails?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 text-center md:text-left">
                      <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100" data-testid="text-full-name">
                        {studentDetails?.firstName} {studentDetails?.lastName}
                      </h1>
                      <div className="flex flex-col md:flex-row md:items-center gap-4 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          <span className="text-sm">Adm No.</span>
                          <span className="font-mono text-sm font-semibold" data-testid="text-admission-number">
                            {studentDetails?.admissionNumber || 'Not provided'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4" />
                          <span className="text-sm" data-testid="text-class">
                            {studentDetails?.class ? `Class ${studentDetails.class.grade} ${studentDetails.class.section}` : 'Not assigned'}
                          </span>
                        </div>
                        <Badge 
                          variant={studentDetails?.status === "active" ? "default" : "secondary"} 
                          className="capitalize"
                        >
                          {studentDetails?.status || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Information Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Academic Details */}
                <Card className="border shadow-sm bg-white dark:bg-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                      <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span>Academic Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <IdCard className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Roll Number</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100" data-testid="text-roll-number">
                          {studentDetails?.rollNumber || 'Not assigned'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Class</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100" data-testid="text-class-detail">
                          {studentDetails?.class ? `${studentDetails.class.grade} ${studentDetails.class.section}` : 'Not assigned'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Card className="border shadow-sm bg-white dark:bg-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span>Personal Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Date of Birth</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100" data-testid="text-dob">
                          {studentDetails?.dateOfBirth ? new Date(studentDetails.dateOfBirth).toLocaleDateString() : 'Not provided'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Gender</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize" data-testid="text-gender">
                          {studentDetails?.gender || 'Not provided'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Blood Group</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100" data-testid="text-blood-group">
                          {studentDetails?.bloodGroup || 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="border shadow-sm bg-white dark:bg-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                      <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span>Contact Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Address</span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-mono ml-6" data-testid="text-email">
                          {studentDetails?.email || 'Not provided'}
                        </p>
                      </div>
                      
                      <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Contact Number</span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-mono ml-6" data-testid="text-contact">
                          {studentDetails?.contactNumber || 'Not provided'}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Emergency Contact</span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-mono ml-6" data-testid="text-emergency-contact">
                          {studentDetails?.emergencyContact || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address & Guardian Information */}
                <Card className="border shadow-sm bg-white dark:bg-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                      <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span>Address & Guardian</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {studentDetails?.address && (
                      <div className="border-b border-gray-100 dark:border-gray-700 pb-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Home Address</span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 ml-6" data-testid="text-address">
                          {studentDetails.address}
                        </p>
                      </div>
                    )}
                    
                    {(studentDetails?.guardianName || studentDetails?.guardianContact) && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Guardian Information</span>
                        </div>
                        
                        {studentDetails?.guardianName && (
                          <div className="ml-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Guardian Name</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100" data-testid="text-guardian-name">
                              {studentDetails.guardianName}
                            </p>
                          </div>
                        )}
                        
                        {studentDetails?.guardianRelation && (
                          <div className="ml-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Relation</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize" data-testid="text-guardian-relation">
                              {studentDetails.guardianRelation}
                            </p>
                          </div>
                        )}
                        
                        {studentDetails?.guardianContact && (
                          <div className="ml-6">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contact</p>
                            <p className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100" data-testid="text-guardian-contact">
                              {studentDetails.guardianContact}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>

              {/* Medical Information */}
              {studentDetails?.medicalInfo && (
                <Card className="border shadow-sm bg-white dark:bg-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                      <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <span>Medical Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200" data-testid="text-medical-info">
                        {studentDetails.medicalInfo}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Footer Notice */}
              <Card className="border shadow-sm bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-full flex-shrink-0">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1 text-sm">Profile Management</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-200">
                        Your profile information is managed by your school administration. If you need to update any details, please contact your school office.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}