import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, User, Mail, Lock, Database, Globe, Save, UserX, RefreshCw, GraduationCap, Phone, Calendar, MapPin, Users, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });


  const passwordChangeMutation = useMutation({
    mutationFn: async (passwordData: { currentPassword: string; newPassword: string }) => {
      const response = await apiRequest("PUT", "/api/auth/password", passwordData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });


  // Fetch teacher replacement history for admin users
  const { data: teacherReplacements, isLoading: loadingReplacements, refetch: refetchReplacements } = useQuery({
    queryKey: ["teacher-replacements", user?.schoolId],
    queryFn: async () => {
      const endpoint = user?.role === 'super_admin' 
        ? "/api/teachers/replacements" 
        : `/api/teachers/replacements/school/${user?.schoolId}`;
      const response = await apiRequest("GET", endpoint);
      return await response.json();
    },
    enabled: user?.role === 'admin' || user?.role === 'super_admin'
  });









  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword) {
      toast({
        title: "Error",
        description: "Current password is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!passwordForm.newPassword) {
      toast({
        title: "Error",
        description: "New password is required",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Error", 
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    passwordChangeMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const profileUpdateMutation = useMutation({
    mutationFn: async (profileData: { firstName: string; lastName: string; email: string }) => {
      const response = await apiRequest("PUT", "/api/auth/profile", profileData);
      return await response.json();
    },
    onSuccess: (updatedUser) => {
      // Update the user data in cache
      queryClient.setQueryData(["/api/auth/user"], updatedUser);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.firstName.trim()) {
      toast({
        title: "Error",
        description: "First name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!profileForm.email.trim()) {
      toast({
        title: "Error", 
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }
    
    profileUpdateMutation.mutate(profileForm);
  };




  return (
    <div>
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold">Settings</h2>
            <p className="text-muted-foreground">Manage your account and system preferences</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 overflow-y-auto h-full">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user?.role === 'student' ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">Student Profile</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your complete profile information is now available in the dedicated "My Profile" section.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Navigate to "My Profile" from the sidebar to view your personal information, contact details, and academic records.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      data-testid="input-email"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={profileUpdateMutation.isPending}
                    data-testid="button-update-profile"
                  >
                    {profileUpdateMutation.isPending ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isChangingPassword ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-muted-foreground">
                      Last changed: {user?.passwordChangedAt 
                        ? new Date(user.passwordChangedAt).toLocaleString() 
                        : "Never (use this to set a new password)"}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setIsChangingPassword(true)}
                    data-testid="button-change-password"
                  >
                    Change Password
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      data-testid="input-current-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      data-testid="input-new-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      data-testid="input-confirm-password"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      type="submit" 
                      disabled={passwordChangeMutation.isPending}
                      data-testid="button-save-password"
                    >
                      {passwordChangeMutation.isPending ? "Changing..." : "Save Password"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsChangingPassword(false)}
                      data-testid="button-cancel-password"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>System Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Role</Label>
                    <p className="text-sm text-muted-foreground capitalize">
                      {user?.role?.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Account Created</Label>
                    <p className="text-sm text-muted-foreground">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm text-muted-foreground">
                      {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">User ID</Label>
                    <p className="text-sm text-muted-foreground font-mono">
                      {user?.id}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Application Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Theme</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose your preferred theme
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      variant={theme === "light" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setTheme("light")}
                      data-testid="button-theme-light"
                    >
                      Light
                    </Button>
                    <Button 
                      variant={theme === "dark" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setTheme("dark")}
                      data-testid="button-theme-dark"
                    >
                      Dark
                    </Button>
                    <Button 
                      variant={theme === "system" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setTheme("system")}
                      data-testid="button-theme-system"
                    >
                      System
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium">Notifications</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Manage your notification preferences
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Email notifications for new school registrations</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">System alerts and maintenance notifications</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Weekly activity reports</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Teacher Replacements History */}
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserX className="h-5 w-5" />
                    <span>Teacher Replacements History</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchReplacements()}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingReplacements ? (
                    <div className="text-center text-muted-foreground py-4">
                      Loading replacement history...
                    </div>
                  ) : !teacherReplacements || teacherReplacements.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                      <UserX className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>No teacher replacements found</p>
                      <p className="text-sm">Teacher replacement history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {teacherReplacements.map((replacement: any) => (
                        <div key={replacement.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  {replacement.originalTeacher?.name || 'Unknown Teacher'}
                                </span>
                                <span className="text-muted-foreground">→</span>
                                <span className="font-medium text-blue-600">
                                  {replacement.replacementTeacher?.name || 'Unknown Teacher'}
                                </span>
                                <Badge 
                                  variant={replacement.status === 'completed' ? 'default' : 'secondary'}
                                  className={replacement.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {replacement.status}
                                </Badge>
                              </div>
                              
                              {replacement.reason && (
                                <p className="text-sm text-muted-foreground">
                                  <strong>Reason:</strong> {replacement.reason}
                                </p>
                              )}
                              
                              <div className="text-xs text-muted-foreground space-y-1">
                                <p>
                                  <strong>Date:</strong> {new Date(replacement.replacementDate).toLocaleDateString('en-IN')}
                                </p>
                                <p>
                                  <strong>Performed by:</strong> {replacement.replacedByUser?.email || 'System'}
                                </p>
                                {replacement.affectedTimetableEntries && (
                                  <p>
                                    <strong>Affected classes:</strong> {replacement.affectedTimetableEntries} assignments updated
                                  </p>
                                )}
                              </div>
                              
                              {replacement.conflictDetails && replacement.conflictDetails.length > 0 && (
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                  <p className="text-yellow-800 font-medium">Conflicts detected:</p>
                                  <p className="text-yellow-700">{replacement.conflictDetails}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-xs text-muted-foreground text-right">
                              {replacement.completedAt ? (
                                <span>Completed: {new Date(replacement.completedAt).toLocaleString('en-IN')}</span>
                              ) : (
                                <span>Created: {new Date(replacement.createdAt).toLocaleString('en-IN')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator />

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">About Teacher Replacements:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Teacher replacements automatically transfer all timetable assignments</li>
                      <li>• Conflicts are checked before replacement to prevent scheduling issues</li>
                      <li>• All replacement activities are logged for audit purposes</li>
                      <li>• Original teacher status is updated to "Left School" after replacement</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

      </div>
    </div>
  );
}