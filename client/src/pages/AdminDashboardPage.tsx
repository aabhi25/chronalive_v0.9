import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Plus, Building, Users, GraduationCap, UserCog, BarChart3, Edit, Trash2, Copy, Check, Eye, Settings } from "lucide-react";
import { format } from "date-fns";

interface School {
  id: string;
  name: string;
  address: string;
  contactPhone: string;
  adminName: string;
  adminEmail?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalSchools: number;
  activeSchools: number;
  inactiveSchools: number;
  schoolAdminLogins: Array<{
    schoolName: string;
    adminName: string;
    lastLogin: Date | null;
  }>;
  schoolTeacherCounts: Array<{
    schoolName: string;
    activeTeachers: number;
  }>;
}

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactPhone: "",
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard-stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/dashboard-stats");
      return await response.json();
    }
  });

  // Fetch schools
  const { data: schools = [], isLoading: schoolsLoading } = useQuery({
    queryKey: ["/api/schools"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/schools");
      return await response.json();
    }
  });

  // Create school mutation
  const createSchoolMutation = useMutation({
    mutationFn: async (schoolData: any) => {
      const response = await apiRequest("POST", "/api/schools", schoolData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard-stats"] });
      setIsCreateDialogOpen(false);
      setFormData({
        name: "", address: "", contactPhone: "", 
        adminName: "", adminEmail: "", adminPassword: ""
      });
      toast({
        title: "Success",
        description: "School created successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create school",
        variant: "destructive"
      });
    }
  });

  // Update school mutation
  const updateSchoolMutation = useMutation({
    mutationFn: async ({ id, ...schoolData }: any) => {
      const response = await apiRequest("PUT", `/api/schools/${id}`, schoolData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools"] });
      setEditingSchool(null);
      toast({
        title: "Success",
        description: "School updated successfully"
      });
    }
  });

  // Toggle school status mutation
  const toggleSchoolStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/schools/${id}/status`, { isActive });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard-stats"] });
      toast({
        title: "Success",
        description: "School status updated successfully"
      });
    }
  });

  const handleCreateSchool = () => {
    createSchoolMutation.mutate(formData);
  };

  const handleUpdateSchool = () => {
    if (editingSchool) {
      updateSchoolMutation.mutate({ 
        id: editingSchool.id, 
        ...formData 
      });
    }
  };

  const handleEditSchool = (school: School) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      address: school.address,
      contactPhone: school.contactPhone,
      adminName: school.adminName,
      adminEmail: school.adminEmail || "",
      adminPassword: ""
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
    toast({
      title: "Copied",
      description: "Email copied to clipboard"
    });
  };

  if (statsLoading || schoolsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8" />
            Advanced School Administration
          </h1>
          <p className="text-muted-foreground">Manage schools and system-wide operations</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add School
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New School</DialogTitle>
              <DialogDescription>
                Add a new school to the system
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">School Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Delhi Public School"
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="School address"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+91 123 456 7890"
                />
              </div>
              
              <div>
                <Label htmlFor="adminName">Admin Name</Label>
                <Input
                  id="adminName"
                  value={formData.adminName}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                  placeholder="School administrator name"
                />
              </div>
              
              <div>
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                  placeholder="admin@school.com"
                />
              </div>
              
              <div>
                <Label htmlFor="adminPassword">Admin Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
                  placeholder="Secure password"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSchool} disabled={createSchoolMutation.isPending}>
                {createSchoolMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create School
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSchools}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeSchools} active, {stats.inactiveSchools} inactive
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.schoolTeacherCounts.reduce((total: number, school: any) => total + school.activeTeachers, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all active schools
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Operational</div>
              <p className="text-xs text-muted-foreground">
                All systems running
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schools Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Schools Management
          </CardTitle>
          <CardDescription>
            Manage all schools in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school: School) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{school.adminName}</div>
                        {school.adminEmail && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{school.adminEmail}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(school.adminEmail!)}
                            >
                              {copiedEmail ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{school.contactPhone}</div>
                        <div className="text-muted-foreground">{school.address}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={school.isActive ? "default" : "secondary"}>
                          {school.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={school.isActive}
                          onCheckedChange={(checked) => 
                            toggleSchoolStatusMutation.mutate({ id: school.id, isActive: checked })
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(school.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSchool(school)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/?schoolId=${school.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {schools.map((school: School) => (
              <Card key={school.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-base">{school.name}</h3>
                      <p className="text-sm text-muted-foreground">{school.address}</p>
                    </div>
                    <Badge variant={school.isActive ? "default" : "secondary"}>
                      {school.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{school.adminName}</span>
                    </div>
                    {school.adminEmail && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{school.adminEmail}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(school.adminEmail!)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedEmail ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{school.contactPhone}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created: {format(new Date(school.createdAt), "MMM dd, yyyy")}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={school.isActive}
                        onCheckedChange={(checked) => 
                          toggleSchoolStatusMutation.mutate({ id: school.id, isActive: checked })
                        }
                      />
                      <span className="text-sm text-muted-foreground">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSchool(school)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/?schoolId=${school.id}`, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* School Analytics */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Recent Admin Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.schoolAdminLogins.slice(0, 5).map((admin: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{admin.schoolName}</div>
                      <div className="text-sm text-muted-foreground">{admin.adminName}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {admin.lastLogin ? format(new Date(admin.lastLogin), "MMM dd, HH:mm") : "Never"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Teacher Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.schoolTeacherCounts.slice(0, 5).map((school: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="font-medium">{school.schoolName}</div>
                    <Badge variant="outline">{school.activeTeachers} teachers</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit School Dialog */}
      <Dialog open={!!editingSchool} onOpenChange={() => setEditingSchool(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit School</DialogTitle>
            <DialogDescription>
              Update school information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">School Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-phone">Contact Phone</Label>
              <Input
                id="edit-phone"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-adminName">Admin Name</Label>
              <Input
                id="edit-adminName"
                value={formData.adminName}
                onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSchool(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSchool} disabled={updateSchoolMutation.isPending}>
              {updateSchoolMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update School
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}